const express = require("express");
const {
  getOpenSourceItems,
  getOpenSourceItem,
  createOpenSourceItem,
  updateOpenSourceItem,
  deleteOpenSourceItem,
} = require("../controllers/openSource.controller");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getOpenSourceItems).post(createOpenSourceItem);
router
  .route("/:id")
  .get(getOpenSourceItem)
  .patch(updateOpenSourceItem)
  .delete(deleteOpenSourceItem);

module.exports = router;
