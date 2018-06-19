const express = require('express');

const router = express.Router();

// GET api/posts/test
router.get('/test', (req, res) => res.json({msg: "Posts Works"}));

module.exports = router;