import * as faceapi from "face-api.js";

let cocoModel = null;

export async function loadModels() {
  const MODEL_URL = "/models";

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    console.log("✅ TinyFaceDetector loaded");

    // Load coco-ssd from global window object
    if (window.cocoSsd) {
      cocoModel = await window.cocoSsd.load();
      console.log("✅ COCO-SSD loaded");
    } else {
      console.error("❌ COCO-SSD not found on window!");
    }
  } catch (error) {
    console.error("❌ Model loading error:", error);
  }
}

const relaxedOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 224,          // previously 128 → now clearer detection
  scoreThreshold: 0.2,     // previously 0.4 → reduced strictness
});

export async function detectFace(video) {
  try {
    const detections = await faceapi.detectAllFaces(video, relaxedOptions);
    return detections.length > 0;
  } catch {
    return false;
  }
}

export async function detectMultipleFaces(video) {
  try {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.4 })
    );
    return detections.length > 1;
  } catch {
    return false;
  }
}

export async function detectPhone(video) {
  try {
    if (!cocoModel) return false;

    const predictions = await cocoModel.detect(video);

    return predictions.some(
      (p) =>
        (p.class === "cell phone" || p.class === "mobile phone" || p.class === "phone") &&
        p.score > 0.6
    );
  } catch (e) {
    console.error("Phone detection failed:", e);
    return false;
  }
}
