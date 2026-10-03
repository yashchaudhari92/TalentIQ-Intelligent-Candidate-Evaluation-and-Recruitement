const dotenv = require('dotenv');

// ============================================================
// Load environment variables FIRST
// This must happen before importing routes/config files
// ============================================================
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes.js');
const candidateRoutes = require('./routes/candidateRoutes.js');
const jobRoutes = require('./routes/jobRoutes.js');
const applicationRoutes = require('./routes/applicationRoutes.js');
const aiRank = require('./routes/aiRank.js');
const interviewRoutes = require('./routes/interviewRoutes.js');
const aiInterviewRoute = require('./routes/aiInterviewRoute.js');
const dashboardRoutes = require('./routes/dashBoardRoutes.js');
const finalScoreRoutes = require('./routes/finalScoreRoutes.js');
const fullFeedbackRoutes = require('./routes/fullFeedbackRoutes.js');
const emailRoutes = require('./routes/emailRoutes.js');

// Test and mail routes
const testRoutes = require("./routes/testRoutes.js");
const mailRoutes = require("./routes/mailRoutes.js");

// ============================================================
// CORS Configuration
// ============================================================
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// ============================================================
// Middleware
// ============================================================
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files locally
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

// ============================================================
// Server Port
// Render automatically provides process.env.PORT
// ============================================================
const PORT = process.env.PORT || 5001;

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRank);
app.use('/api/interviews', interviewRoutes);
app.use("/api/ai-interview", aiInterviewRoute);
app.use("/api/tests", testRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", finalScoreRoutes);
app.use("/api/ai/full-feedback", fullFeedbackRoutes);
app.use("/api/mail", emailRoutes);

// ============================================================
// MongoDB Connection
// ============================================================
main()
    .then(() => {
        console.log("Successfully Connected to Database");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
}

// ============================================================
// Health / Root Endpoint
// ============================================================
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// ============================================================
// Start Server
// ============================================================
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(server.address());
});

server.on("error", (err) => {
    console.error("Listen Error:", err);
});



// const dotenv = require('dotenv');

// // ============================================================
// // Load environment variables FIRST
// // This must happen before importing routes/config files
// // ============================================================
// dotenv.config();


// const express = require('express');
// const app = express();
// const cors = require('cors');
// const mongoose = require('mongoose');
// const path = require('path');
// const morgan = require('morgan');
// const authRoutes = require('./routes/authRoutes.js');
// const candidateRoutes = require('./routes/candidateRoutes.js');
// const jobRoutes = require('./routes/jobRoutes.js');
// const applicationRoutes = require('./routes/applicationRoutes.js');
// const aiRank = require('./routes/aiRank.js');
// const interviewRoutes = require('./routes/interviewRoutes.js');
// const aiInterviewRoute = require('./routes/aiInterviewRoute.js');
// const dashboardRoutes = require('./routes/dashBoardRoutes.js');
// const finalScoreRoutes = require('./routes/finalScoreRoutes.js');
// const fullFeedbackRoutes = require('./routes/fullFeedbackRoutes.js')
// const emailRoutes = require('./routes/emailRoutes.js');

// // ⭐ NEW
// const testRoutes = require("./routes/testRoutes.js");
// const mailRoutes = require("./routes/mailRoutes.js");


// const allowedOrigins = [
//     "http://localhost:5173",
//     process.env.FRONTEND_URL
// ].filter(Boolean);

// app.use(cors({
//     origin: allowedOrigins,
//     credentials: true
// }));

// app.use(express.json());
// app.use(morgan('dev'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from uploads folder

// const PORT = process.env.PORT || 5001;

// app.use('/api/auth', authRoutes);
// app.use('/api/candidate', candidateRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api/ai', aiRank);
// app.use('/api/interviews', interviewRoutes);
// app.use("/api/ai-interview", aiInterviewRoute);
// app.use("/api/tests", testRoutes); // ⭐ NEW
// app.use("/api/mail", mailRoutes);  // ⭐ NEW
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api", finalScoreRoutes);
// app.use("/api/ai/full-feedback", fullFeedbackRoutes);
// app.use("/api/mail", emailRoutes);


// // connect to mongoDB
// main().then(() => {
//     console.log("Successfully Connected to Database");
// }).catch((err) => {
//     console.log(err);
// });

// async function main() {
//     await mongoose.connect(process.env.MONGO_URL);
// };

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

// const server = app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(server.address());
// });

// server.on("error", (err) => {
//     console.error("Listen Error:", err);
// });
