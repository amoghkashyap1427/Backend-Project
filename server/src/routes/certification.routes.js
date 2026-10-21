const express = require("express");
const {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
} = require("../controllers/certification.controller");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getCertifications).post(createCertification);
router
  .route("/:id")
  .get(getCertification)
  .patch(updateCertification)
  .delete(deleteCertification);

module.exports = router;
