const mongoose = require("mongoose");
const Experience = require("../models/Experience");

// Only these fields can be set by the client
const ALLOWED_FIELDS = [
  "company",
  "role",
  "startDate",
  "endDate",
  "isCurrent",
  "location",
  "techStack",
  "bullets",
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

// GET /api/experience?tag=react,node&search=engineer
const getExperiences = async (req, res) => {
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
    filter.$or = [{ company: regex }, { role: regex }];
  }

  const experiences = await Experience.find(filter).sort({ startDate: -1 });
  res.json(experiences);
};

// GET /api/experience/:id
const getExperience = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const experience = await Experience.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!experience) return res.status(404).json({ message: "Experience not found" });

  res.json(experience);
};

// POST /api/experience
const createExperience = async (req, res) => {
  const data = pick(req.body || {}, ALLOWED_FIELDS);

  const experience = await Experience.create({ ...data, user: req.user.id });
  res.status(201).json(experience);
};

// PATCH /api/experience/:id
const updateExperience = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const updates = pick(req.body || {}, ALLOWED_FIELDS);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const experience = await Experience.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!experience) return res.status(404).json({ message: "Experience not found" });

  res.json(experience);
};

// DELETE /api/experience/:id
const deleteExperience = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const experience = await Experience.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!experience) return res.status(404).json({ message: "Experience not found" });

  res.json({ message: "Experience deleted" });
};

module.exports = {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
};
