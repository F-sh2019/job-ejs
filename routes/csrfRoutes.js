const express = require("express");
const router = express.Router();

router.get("/csrf-token", (req, res) => {
    console.log("Checking req.csrfToken:", req.csrfToken); 
  if (!req.csrfToken) {
    return res.status(500).json({ error: "CSRF token function not available" });
  }
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;