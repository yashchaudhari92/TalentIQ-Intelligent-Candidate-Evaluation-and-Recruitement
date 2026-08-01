from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy, fitz, re, os, json
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------- Load environment variables ----------------
load_dotenv()  # reads .env in the same folder

API_KEY = os.getenv("API_KEY")
SUMMARY_PROMPT = os.getenv("SUMMARY")
INTERVIEW_PROMPT = os.getenv("INTERVIEW")
ANALYZE_PROMPT = os.getenv("ANALYZE")

if not API_KEY:
    raise RuntimeError("⚠️  API_KEY not set in .env file")

genai.configure(api_key=API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- spaCy model ----------------
nlp = spacy.load("en_core_web_sm")

# ---------- Load known skills list ----------
skills_file = Path(__file__).parent / "skills_list.txt"
with open(skills_file, "r", encoding="utf-8") as f:
    KNOWN_SKILLS = {line.strip().lower() for line in f if line.strip()}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page in pdf_doc:
        text += page.get_text()
    pdf_doc.close()
    return text


def extract_skills(text: str):
    text_lower = text.lower()
    found = set()
    for skill in KNOWN_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", text_lower):
            found.add(skill)
    return sorted(found)


def generate_summary_and_skills(text: str):
    MAX_INPUT = 4000
    if len(text) > MAX_INPUT:
        text = text[:MAX_INPUT]
    prompt = SUMMARY_PROMPT.replace("{resume}", text)

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        raw_output = response.text.strip() if response.text else ""
        if not raw_output:
            raise Exception("Empty response from Gemini")

        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            raw_output = re.sub(r"^json", "", raw_output, flags=re.IGNORECASE).strip()

        parsed = {}
        try:
            parsed = json.loads(raw_output)
        except Exception:
            parsed = {"summary": raw_output, "skills": []}

        summary = re.sub(r"[\*\-\n]+", " ", parsed.get("summary", "")).strip()
        parsed["summary"] = summary

        return parsed

    except Exception as e:
        print(f"⚠️failed: {e}")
        return {"summary": (text[:250] + "...").replace("\n", " "), "skills": []}


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)

    if not text.strip():
        raise HTTPException(status_code=400, detail="No extractable text found in PDF.")

    clean_text = re.sub(r"\s+", " ", text)

    local_skills = extract_skills(clean_text)
    ai_output = generate_summary_and_skills(clean_text)

    return JSONResponse({
        "summary": ai_output.get("summary", ""),
        "extractedSkills": list(set(local_skills + ai_output.get("skills", [])))
    })


# ---------------- Candidate Ranking ----------------
class CandidateProfile(BaseModel):
    id: str
    name: str
    email: str
    education: list = []
    skills: list = []
    experience: list = []


class JobModel(BaseModel):
    id: str
    title: str
    description: str
    requirements: list = []
    skills: list = []


class RankRequest(BaseModel):
    job: JobModel
    candidates: list[CandidateProfile]


def normalize(text: str) -> str:
    t = str(text).strip().lower()
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"[^a-z0-9]", "", t)
    return t


def skill_match(job_skills, candidate_skills):
    js = {normalize(s) for s in job_skills if str(s).strip()}
    cs = {normalize(s) for s in candidate_skills if str(s).strip()}
    if not js:
        return 0.0, [], []

    matched_norm = js.intersection(cs)
    missing_norm = js - cs

    def recover(originals, norms):
        mp = {}
        for s in originals:
            ns = normalize(s)
            if ns and ns not in mp:
                mp[ns] = s
        return [mp.get(ns, ns) for ns in norms]

    coverage = (len(matched_norm) / len(js)) * 100.0
    matched = recover(job_skills, matched_norm)
    missing = recover(job_skills, missing_norm)
    return coverage, matched, missing


@app.post("/rank-candidates")
async def rank_candidates(payload: RankRequest):
    results = []
    for c in payload.candidates:
        coverage, matched, missing = skill_match(payload.job.skills, c.skills)
        skills_score = coverage

        years = 0
        for ex in c.experience or []:
            try:
                if isinstance(ex, dict):
                    val = ex.get("years", ex.get("duration", 0))
                else:
                    val = ex
                years += int(float(str(val)))
            except Exception:
                pass

        exp_score = min((years / 5.0) * 100.0, 100.0)
        edu_text = " ".join(
            [str(e.get("degree", "")) if isinstance(e, dict) else str(e) for e in (c.education or [])]
        )
        nt = normalize(edu_text)

        is_phd = any(k in nt for k in ["phd", "doctorofphilosophy"])
        is_master = any(k in nt for k in ["master", "msc", "mtech", "me", "mca", "ms"])
        is_bachelor = any(k in nt for k in ["bachelor", "bsc", "btech", "be", "bca", "bs"])
        is_diploma = "diploma" in nt or "polytechnic" in nt or "pgd" in nt

        edu_score = 0
        if is_phd:
            edu_score = 100
        elif is_master:
            edu_score = 80
        elif is_bachelor:
            edu_score = 60
        elif is_diploma:
            edu_score = 40
        elif "highschool" in nt or "12th" in nt or "hssc" in nt:
            edu_score = 20

        final_score = round(skills_score * 0.6 + exp_score * 0.25 + edu_score * 0.15, 2)

        print(f"[RANK DEBUG] Candidate: {c.name}, Skills%: {skills_score}, ExpYears: {years}, "
              f"EduScore: {edu_score}, Final: {final_score}")

        results.append({
            "candidateId": c.id,
            "name": c.name,
            "email": c.email,
            "score": final_score,
            "skillCoverage": round(skills_score, 2),
            "expYears": years,
            "matchedSkills": matched,
            "missingSkills": missing,
            "eduScore": edu_score
        })

    ranked = sorted(results, key=lambda x: x["score"], reverse=True)
    return {"job": payload.job.model_dump(), "ranked": ranked}


# ---------------- AI Interview Question Generation ----------------
class QuestionRequest(BaseModel):
    skills: list[str]
    summary: str


@app.post("/generate-interview-questions")
async def generate_interview_questions(payload: QuestionRequest):
    try:
        skills_str = ", ".join(payload.skills)

        # load from .env and inject variables
        prompt = INTERVIEW_PROMPT.replace("{skills}", skills_str).replace("{summary}", payload.summary)

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_output = response.text.strip()

        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            raw_output = re.sub(r"^json", "", raw_output, flags=re.IGNORECASE).strip()

        data = json.loads(raw_output)

        return {
            "success": True,
            "questions": data.get("questions", [])
        }

    except Exception as e:
        print(f"⚠️ Question generation failed: {e}")

        fallback = [
            {"question": "Can you introduce yourself?", "level": "Beginner"},
            {"question": "What motivated you to pursue a career in this field?", "level": "Beginner"},
            {"question": f"How have you used {payload.skills[0] if payload.skills else 'your skills'} in a real project?", "level": "Intermediate"},
            {"question": "Describe a technical challenge you solved recently.", "level": "Intermediate"},
            {"question": "How do you ensure code quality and maintainability in your projects?", "level": "Advanced"},
            {"question": "Explain a scenario where you optimized a system or workflow.", "level": "Advanced"},
            {"question": "How do you handle conflicts or misunderstandings within a team?", "level": "Behavioral"},
            {"question": "Do you want to add anything before we finish?", "level": "Closing"},
        ]

        return {"success": True, "questions": fallback}


# ---------- AI Answer Understanding ----------
class AnalyzeRequest(BaseModel):
    question: str
    answer: str

# New 
@app.post("/analyze-answer")
async def analyze_answer(req: AnalyzeRequest):
    try:
        # load analyze prompt
        prompt = ANALYZE_PROMPT.replace("{question}", req.question).replace("{answer}", req.answer)

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        res = model.generate_content(prompt)

        txt = res.text.strip() if res.text else ""

        if txt.startswith("```"):
            txt = txt.strip("`").replace("json", "").strip()

        # ✅ Safe parsing
        try:
            data = json.loads(txt)
        except Exception:
            data = {}

        return {
            "success": True,
            "score": data.get("score", 50),  # ⭐ fallback score
            "response": data.get("response", "Good answer"),
            "move_next": data.get("move_next", True),
        }

    except Exception as e:
        print("⚠️ Analyze failed:", e)

        # ✅ Safe fallback (no data usage here)
        return {
            "success": True,
            "score": 50,
            "response": "Average answer",
            "move_next": True,
        }


# @app.post("/analyze-answer")
# async def analyze_answer(req: AnalyzeRequest):
#     try:
#         # load analyze prompt
#         prompt = ANALYZE_PROMPT.replace("{question}", req.question).replace("{answer}", req.answer)

#         model = genai.GenerativeModel("models/gemini-2.5-flash")
#         res = model.generate_content(prompt)

#         txt = res.text.strip()
#         if txt.startswith("```"):
#             txt = txt.strip("`").replace("json", "").strip()

#         data = json.loads(txt)
#         # return {"success": True, **data}
#         return {
#             "success": True,
#             "score": data.get("score", 50),  # ⭐ fallback score
#             "response": data.get("response", "Good answer"),
#             "move_next": data.get("move_next", True),
#         }

#     except Exception as e:
#         print("⚠️ Analyze failed:", e)
#         # return {"success": True, "response": "Thanks for your answer!", "move_next": True}
#         # return {
#         #     "success": True,
#         #     "score": data.get("score", 50),  # ⭐ fallback score
#         #     "response": data.get("response", "Good answer"),
#         #     "move_next": data.get("move_next", True),
#         # }
#         return {
#             "success": True,
#             "score": 50,
#             "response": "Average answer",
#             "move_next": True,
#         }

@app.post("/analyze-all-answers")
async def analyze_all_answers(req: dict):
    try:
        qa_list = req.get("qa_list", [])

        if not qa_list:
            return {"success": True, "results": []}

        prompt = "Evaluate the following interview answers.\n\n"

        for i, qa in enumerate(qa_list):
            prompt += f"Q{i+1}: {qa['question']}\n"
            prompt += f"A{i+1}: {qa['answer']}\n\n"

        prompt += """
Return JSON array:
[
  { "score": number, "feedback": "short feedback" }
]
"""

        try:
            model = genai.GenerativeModel("models/gemini-2.5-flash")
            res = model.generate_content(prompt)

            txt = res.text.strip()
            if txt.startswith("```"):
                txt = txt.strip("`").replace("json", "").strip()

            data = json.loads(txt)

            return {"success": True, "results": data}

        except Exception as ai_error:
            print("⚠️ Bulk AI failed:", ai_error)

            # ✅ fallback for all
            fallback = [{"score": 50, "feedback": "Average answer"} for _ in qa_list]

            return {"success": True, "results": fallback}

    except Exception as e:
        print("❌ Bulk analyze error:", e)
        return {"success": True, "results": []}


# ---------------- FULL FEEDBACK REPORT ----------------
class FullFeedbackRequest(BaseModel):
    summary: str
    resumeFit: int
    testScore: int
    aiInterviewScore: int
    finalScore: int
    answers: list[str]


@app.post("/generate-full-feedback")
async def generate_full_feedback(req: FullFeedbackRequest):
    try:
        answers_text = "\n".join([f"Q{i+1}: {a}" for i, a in enumerate(req.answers)])

        prompt = f"""
You are an expert recruiter.

Analyze the candidate based on:

Resume Summary:
{req.summary}

Scores:
- Resume Fit: {req.resumeFit}
- Test Score: {req.testScore}
- AI Interview: {req.aiInterviewScore}
- Final Score: {req.finalScore}

Interview Answers:
{answers_text}

Generate a professional hiring report.

Return ONLY JSON:
{{
  "overallPerformance": "",
  "strengths": "",
  "weaknesses": "",
  "technicalEvaluation": "",
  "communicationSkills": "",
  "recommendation": "",
  "verdict": "Selected / Rejected / Needs Improvement"
}}
"""

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        res = model.generate_content(prompt)

        txt = res.text.strip() if res.text else ""

        if txt.startswith("```"):
            txt = txt.strip("`").replace("json", "").strip()

        try:
            data = json.loads(txt)
        except:
            data = {}

        return {
            "success": True,
            "report": {
                "overallPerformance": data.get("overallPerformance", "Average"),
                "strengths": data.get("strengths", "Basic understanding"),
                "weaknesses": data.get("weaknesses", "Needs improvement"),
                "technicalEvaluation": data.get("technicalEvaluation", "Moderate"),
                "communicationSkills": data.get("communicationSkills", "Good"),
                "recommendation": data.get("recommendation", "Practice more"),
                "verdict": data.get("verdict", "Needs Improvement"),
            },
        }

    except Exception as e:
        print("⚠️ Feedback generation failed:", e)

        return {
            "success": True,
            "report": {
                "overallPerformance": "Average",
                "strengths": "Basic understanding",
                "weaknesses": "Needs improvement",
                "technicalEvaluation": "Moderate",
                "communicationSkills": "Good",
                "recommendation": "Practice more",
                "verdict": "Needs Improvement",
            },
        }


# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import spacy, fitz, re, os, json
# from pathlib import Path
# from dotenv import load_dotenv
# import google.generativeai as genai

# # ---------------- Load environment variables ----------------
# load_dotenv()  # reads .env in the same folder
# API_KEY = os.getenv("API_KEY")
# if not API_KEY:
#     raise RuntimeError("⚠️  API_KEY not set in .env file")

# genai.configure(api_key=API_KEY)

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- spaCy model ----------------
# nlp = spacy.load("en_core_web_sm")

# # ---------- Load known skills list ----------
# skills_file = Path(__file__).parent / "skills_list.txt"
# with open(skills_file, "r", encoding="utf-8") as f:
#     KNOWN_SKILLS = {line.strip().lower() for line in f if line.strip()}


# def extract_text_from_pdf(pdf_bytes: bytes) -> str:
#     text = ""
#     pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#     for page in pdf_doc:
#         text += page.get_text()
#     pdf_doc.close()
#     return text


# def extract_skills(text: str):
#     text_lower = text.lower()
#     found = set()
#     for skill in KNOWN_SKILLS:
#         if re.search(rf"\b{re.escape(skill)}\b", text_lower):
#             found.add(skill)
#     return sorted(found)


# def generate_summary_and_skills(text: str):
#     MAX_INPUT = 4000
#     if len(text) > MAX_INPUT:
#         text = text[:MAX_INPUT]

#     prompt = (
#         "You are an expert HR assistant. Read the following resume text carefully. "
#         "Return ONLY valid JSON in this format:\n\n"
#         "{\n"
#         "  \"summary\": \"3–4 concise sentences describing the candidate professionally.\",\n"
#         "  \"skills\": [\"skill1\", \"skill2\", \"skill3\"]\n"
#         "}\n\n"
#         f"Resume:\n{text}"
#     )

#     try:
#         model = genai.GenerativeModel("models/gemini-2.5-flash")
#         response = model.generate_content(prompt)

#         raw_output = response.text.strip() if response.text else ""
#         if not raw_output:
#             raise Exception("Empty response from Gemini")

#         if raw_output.startswith("```"):
#             raw_output = raw_output.strip("`")
#             raw_output = re.sub(r"^json", "", raw_output, flags=re.IGNORECASE).strip()

#         parsed = {}
#         try:
#             parsed = json.loads(raw_output)
#         except Exception:
#             parsed = {"summary": raw_output, "skills": []}

#         summary = re.sub(r"[\*\-\n]+", " ", parsed.get("summary", "")).strip()
#         parsed["summary"] = summary

#         return parsed

#     except Exception as e:
#         print(f"⚠️ API failed: {e}")
#         return {"summary": (text[:250] + "...").replace("\n", " "), "skills": []}


# @app.post("/parse-resume")
# async def parse_resume(file: UploadFile = File(...)):
#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(status_code=400, detail="Please upload a PDF file.")

#     pdf_bytes = await file.read()
#     text = extract_text_from_pdf(pdf_bytes)

#     if not text.strip():
#         raise HTTPException(status_code=400, detail="No extractable text found in PDF.")

#     clean_text = re.sub(r"\s+", " ", text)

#     local_skills = extract_skills(clean_text)
#     ai_output = generate_summary_and_skills(clean_text)

#     return JSONResponse({
#         "summary": ai_output.get("summary", ""),
#         "extractedSkills": list(set(local_skills + ai_output.get("skills", [])))
#     })


# # ---------------- Candidate Ranking ----------------
# class CandidateProfile(BaseModel):
#     id: str
#     name: str
#     email: str
#     education: list = []
#     skills: list = []
#     experience: list = []


# class JobModel(BaseModel):
#     id: str
#     title: str
#     description: str
#     requirements: list = []
#     skills: list = []


# class RankRequest(BaseModel):
#     job: JobModel
#     candidates: list[CandidateProfile]


# def normalize(text: str) -> str:
#     t = str(text).strip().lower()
#     t = re.sub(r"\s+", " ", t)
#     t = re.sub(r"[^a-z0-9]", "", t)  # remove punctuation (node.js -> nodejs)
#     return t


# def skill_match(job_skills, candidate_skills):
#     js = {normalize(s) for s in job_skills if str(s).strip()}
#     cs = {normalize(s) for s in candidate_skills if str(s).strip()}
#     if not js:
#         return 0.0, [], []

#     matched_norm = js.intersection(cs)
#     missing_norm = js - cs

#     def recover(originals, norms):
#         mp = {}
#         for s in originals:
#             ns = normalize(s)
#             if ns and ns not in mp:
#                 mp[ns] = s
#         return [mp.get(ns, ns) for ns in norms]

#     coverage = (len(matched_norm) / len(js)) * 100.0
#     matched = recover(job_skills, matched_norm)
#     missing = recover(job_skills, missing_norm)
#     return coverage, matched, missing


# @app.post("/rank-candidates")
# async def rank_candidates(payload: RankRequest):
#     results = []
#     for c in payload.candidates:
#         coverage, matched, missing = skill_match(payload.job.skills, c.skills)
#         skills_score = coverage

#         years = 0
#         for ex in c.experience or []:
#             try:
#                 if isinstance(ex, dict):
#                     val = ex.get("years", ex.get("duration", 0))
#                 else:
#                     val = ex
#                 years += int(float(str(val)))
#             except Exception:
#                 pass
#         exp_score = min((years / 5.0) * 100.0, 100.0)

#         edu_text = " ".join(
#             [str(e.get("degree", "")) if isinstance(e, dict) else str(e) for e in (c.education or [])]
#         )
#         nt = normalize(edu_text)

#         is_phd = any(k in nt for k in ["phd", "doctorofphilosophy"])
#         is_master = any(k in nt for k in ["master", "msc", "mtech", "me", "mca", "ms"])
#         is_bachelor = any(k in nt for k in ["bachelor", "bsc", "btech", "be", "bca", "bs"])
#         is_diploma = "diploma" in nt or "polytechnic" in nt or "pgd" in nt

#         edu_score = 0
#         if is_phd:
#             edu_score = 100
#         elif is_master:
#             edu_score = 80
#         elif is_bachelor:
#             edu_score = 60
#         elif is_diploma:
#             edu_score = 40
#         elif "highschool" in nt or "12th" in nt or "hssc" in nt:
#             edu_score = 20

#         final_score = round(skills_score * 0.6 + exp_score * 0.25 + edu_score * 0.15, 2)

#         # ✅ Debug log
#         print(f"[RANK DEBUG] Candidate: {c.name}, Skills%: {skills_score}, ExpYears: {years}, "
#               f"EduScore: {edu_score}, Final: {final_score}")

#         results.append({
#             "candidateId": c.id,
#             "name": c.name,
#             "email": c.email,
#             "score": final_score,
#             "skillCoverage": round(skills_score, 2),
#             "expYears": years,
#             "matchedSkills": matched,
#             "missingSkills": missing,
#             "eduScore": edu_score
#         })

#     ranked = sorted(results, key=lambda x: x["score"], reverse=True)
#     return {"job": payload.job.model_dump(), "ranked": ranked}


# # ---------------- AI Interview Question Generation ----------------
# class QuestionRequest(BaseModel):
#     skills: list[str]
#     summary: str


# @app.post("/generate-interview-questions")
# async def generate_interview_questions(payload: QuestionRequest):
#     try:
#         skills_str = ", ".join(payload.skills)

#         prompt = f"""
#         You are an AI Technical Interviewer.
#         You must behave like a real human interviewer—friendly, progressive, natural, and adaptive.

#         Your job:
#         Generate 8–10 questions with difficulty labels.
#         Start easy → gradually go deeper → end politely.

#         Follow EXACTLY this structure:

#         1️⃣ **Beginner Level (2 questions)**
#             - Ask "Introduce yourself".
#             - Ask 1 easy background or goals question.

#         2️⃣ **Intermediate Level (2–3 questions)**
#             - Ask questions based on the candidate’s skills:
#                 Skills = {skills_str}

#         3️⃣ **Advanced Level (2–3 questions)**
#             - Use real-world problem solving.
#             - Customize using:
#                 Summary = {payload.summary}

#         4️⃣ **Behavioral (1 question)**

#         5️⃣ **Closing (1 question)**

#         Output Format:
#         Return ONLY valid JSON in this format:

#         {{
#             "questions": [
#                 {{
#                     "question": "string",
#                     "level": "Beginner / Intermediate / Advanced / Behavioral / Closing"
#                 }}
#             ]
#         }}

#         Rules:
#         - No markdown.
#         - No numbering.
#         - No commentary.
#         - No code blocks.
#         """

#         # -----------  CALL ------------
#         model = genai.GenerativeModel("models/gemini-2.5-flash")
#         response = model.generate_content(prompt)
#         raw_output = response.text.strip()

#         if raw_output.startswith("```"):
#             raw_output = raw_output.strip("`")
#             raw_output = re.sub(r"^json", "", raw_output, flags=re.IGNORECASE).strip()

#         data = json.loads(raw_output)

#         return {
#             "success": True,
#             "questions": data.get("questions", [])
#         }

#     except Exception as e:
#         print(f"⚠️ Question generation failed: {e}")

#         # --------------- SAFE FALLBACK -----------------
#         fallback = [
#             {"question": "Can you introduce yourself?", "level": "Beginner"},
#             {"question": "What motivated you to pursue a career in this field?", "level": "Beginner"},
#             {"question": f"How have you used {payload.skills[0] if payload.skills else 'your skills'} in a real project?", "level": "Intermediate"},
#             {"question": "Describe a technical challenge you solved recently.", "level": "Intermediate"},
#             {"question": "How do you ensure code quality and maintainability in your projects?", "level": "Advanced"},
#             {"question": "Explain a scenario where you optimized a system or workflow.", "level": "Advanced"},
#             {"question": "How do you handle conflicts or misunderstandings within a team?", "level": "Behavioral"},
#             {"question": "Do you want to add anything before we finish?", "level": "Closing"},
#         ]

#         return {
#             "success": True,
#             "questions": fallback
#         }


# # ---------- AI Answer Understanding ----------
# class AnalyzeRequest(BaseModel):
#     question: str
#     answer: str

# @app.post("/analyze-answer")
# async def analyze_answer(req: AnalyzeRequest):
#     try:
#         prompt = f"""
#         You are an AI interviewer evaluating a candidate's spoken answer.
#         Question: {req.question}
#         Answer: {req.answer}

#         Give a short conversational response (1-2 sentences) as if you are the interviewer.
#         Example:
#         "That's a good explanation! Can you share an example from your experience?"
#         Return JSON:
#         {{
#             "response": "AI's reply message.",
#             "move_next": true/false
#         }}
#         """
#         model = genai.GenerativeModel("models/gemini-2.5-flash")
#         res = model.generate_content(prompt)
#         txt = res.text.strip()
#         if txt.startswith("```"):
#             txt = txt.strip("`").replace("json", "").strip()
#         data = json.loads(txt)
#         return {"success": True, **data}
#     except Exception as e:
#         print("⚠️ Analyze failed:", e)
#         return {"success": True, "response": "Thanks for your answer!", "move_next": True}
