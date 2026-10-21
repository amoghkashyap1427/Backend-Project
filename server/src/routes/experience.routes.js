const express = require("express");
const {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} = require("../controllers/experience.controller");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getExperiences).post(createExperience);
router
  .route("/:id")
  .get(getExperience)
  .patch(updateExperience)
  .delete(deleteExperience);

module.exports = router;
