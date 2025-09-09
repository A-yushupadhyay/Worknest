const express = require('express');
const router = express.Router();


router.get('/ping', (req, res) => res.json({ ok: true, now: Date.now() }));


module.exports = router;