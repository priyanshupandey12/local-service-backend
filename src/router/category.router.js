const express = require("express");
const router = express.Router();
const { getPublicCategories } = require("../controllers/admin.controller");

router.get("/", getPublicCategories);

module.exports = router;