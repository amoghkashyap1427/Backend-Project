const mongoose = require("mongoose");
const Project = require("../models/Project");

// Only these fields can be set by the client
const ALLOWED_FIELDS = [
  "title",
  "description",
  "repoUrl",
  "liveUrl",
  "architecture",
  "techStack",
  "media",
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

// GET /api/projects?tag=react,node&search=api
const getProjects = async (req, res) => {
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
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.json(projects);
};

// GET /api/projects/:id
const getProject = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  res.json(project);
};

// POST /api/projects
const createProject = async (req, res) => {
  const data = pick(req.body || {}, ALLOWED_FIELDS);

  const project = await Project.create({ ...data, user: req.user.id });
  res.status(201).json(project);
};

// PATCH /api/projects/:id
const updateProject = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const updates = pick(req.body || {}, ALLOWED_FIELDS);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!project) return res.status(404).json({ message: "Project not found" });

  res.json(project);
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  res.json({ message: "Project deleted" });
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};