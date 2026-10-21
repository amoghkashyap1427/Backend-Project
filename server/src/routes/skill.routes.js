const express = require("express");
const {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skill.controller");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getSkills).post(createSkill);
router
  .route("/:id")
  .get(getSkill)
  .patch(updateSkill)
  .delete(deleteSkill);

module.exports = router;
