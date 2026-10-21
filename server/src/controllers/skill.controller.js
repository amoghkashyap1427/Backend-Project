const mongoose = require("mongoose");
const Skill = require("../models/Skill");

// Only these fields can be set by the client
const ALLOWED_FIELDS = [
  "name",
  "category",
  "proficiency",
  "isPublic",
  "tags",
];

const VALID_CATEGORIES = [
  "Languages",
  "Frameworks",
  "Hardware-Robotics",
  "Cloud-DevOps",
];

const VALID_PROFICIENCIES = ["beginner", "intermediate", "advanced"];

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

// GET /api/skills?tag=backend&search=type&category=Languages&proficiency=advanced
const getSkills = async (req, res) => {
  const filter = { user: req.user.id };

  const { tag, search, category, proficiency } = req.query;

  if (typeof tag === "string" && tag.trim()) {
    const tags = tag
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (tags.length) filter.tags = { $all: tags };
  }

  if (typeof search === "string" && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: regex }];
  }

  if (typeof category === "string" && VALID_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  if (
    typeof proficiency === "string" &&
    VALID_PROFICIENCIES.includes(proficiency)
  ) {
    filter.proficiency = proficiency;
  }

  const skills = await Skill.find(filter).sort({
    category: 1,
    name: 1,
  });
  res.json(skills);
};

// GET /api/skills/:id
const getSkill = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const skill = await Skill.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }

  res.json(skill);
};

// POST /api/skills
const createSkill = async (req, res) => {
  const data = pick(req.body || {}, ALLOWED_FIELDS);

  const skill = await Skill.create({
    ...data,
    user: req.user.id,
  });
  res.status(201).json(skill);
};

// PATCH /api/skills/:id
const updateSkill = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const updates = pick(req.body || {}, ALLOWED_FIELDS);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const skill = await Skill.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }

  res.json(skill);
};

// DELETE /api/skills/:id
const deleteSkill = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const skill = await Skill.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }

  res.json({ message: "Skill deleted" });
};

module.exports = {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
};
