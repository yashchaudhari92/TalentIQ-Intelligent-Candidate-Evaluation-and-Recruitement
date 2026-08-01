const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/register', registerUser);
router.post('/login', loginUser);

// ---------- Protected Test Route ----------
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed successfully!",
    user: req.user // this comes from the protect middleware
  });
});

module.exports = router;
