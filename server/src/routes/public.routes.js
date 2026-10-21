const express = require("express");
const { getPublicProfile } = require("../controllers/public.controller");

const router = express.Router();

router.get("/:username", getPublicProfile);

module.exports = router;
