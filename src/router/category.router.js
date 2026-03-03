const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../controllers/admin.controller");

router.get("/", getAllCategories);

module.exports = router;