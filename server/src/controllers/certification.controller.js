const mongoose = require("mongoose");
const Certification = require("../models/Certification");

// Only these fields can be set by the client
const ALLOWED_FIELDS = [
  "title",
  "issuer",
  "credentialId",
  "verifyUrl",
  "completedOn",
  "fileUrl",
  "isPublic",
  "tags",
];

const pick = (obj, fields) => {
  const result = {};
  for (const field of fields) {
    if (obj[field] !== undefined) result[field] = obj[field];
  }
  return result;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const checkId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id" });
    return false;
  }
  return true;
};

// GET /api/certifications?tag=aws,cloud&search=architect
const getCertifications = async (req, res) => {
  const filter = { user: req.user.id };

  const { tag, search } = req.query;

  if (typeof tag === "string" && tag.trim()) {
    const tags = tag
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (tags.length) filter.tags = { $all: tags };
  }

  if (typeof search === "string" && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { title: regex },
      { issuer: regex },
      { credentialId: regex },
    ];
  }

  const certifications = await Certification.find(filter).sort({
    completedOn: -1,
    createdAt: -1,
  });
  res.json(certifications);
};

// GET /api/certifications/:id
const getCertification = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const certification = await Certification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!certification) {
    return res.status(404).json({ message: "Certification not found" });
  }

  res.json(certification);
};

// POST /api/certifications
const createCertification = async (req, res) => {
  const data = pick(req.body || {}, ALLOWED_FIELDS);

  const certification = await Certification.create({
    ...data,
    user: req.user.id,
  });
  res.status(201).json(certification);
};

// PATCH /api/certifications/:id
const updateCertification = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const updates = pick(req.body || {}, ALLOWED_FIELDS);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const certification = await Certification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!certification) {
    return res.status(404).json({ message: "Certification not found" });
  }

  res.json(certification);
};

// DELETE /api/certifications/:id
const deleteCertification = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const certification = await Certification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!certification) {
    return res.status(404).json({ message: "Certification not found" });
  }

  res.json({ message: "Certification deleted" });
};

module.exports = {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
};
