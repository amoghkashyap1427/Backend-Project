const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getProjects).post(createProject);
router
  .route("/:id")
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

module.exports = router;