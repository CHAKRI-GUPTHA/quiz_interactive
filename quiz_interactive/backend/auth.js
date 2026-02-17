const router = require("express").Router();
const User = require("../models/User");

router.post("/login", async (req, res) => {
  const { userId, password, role } = req.body;

  const user = await User.findOne({ userId, role });

  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", role: user.role });
});

module.exports = router;
