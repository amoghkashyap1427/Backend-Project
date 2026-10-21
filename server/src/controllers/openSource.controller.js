const mongoose = require("mongoose");
const OpenSource = require("../models/OpenSource");

// Only these fields can be set by the client
const ALLOWED_FIELDS = [
  "repository",
  "prTitle",
  "prUrl",
  "status",
  "description",
  "isPublic",
  "tags",
];

const VALID_STATUSES = ["open", "merged", "closed"];

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

// GET /api/open-source?tag=react&search=fix&status=merged
const getOpenSourceItems = async (req, res) => {
  const filter = { user: req.user.id };

  const { tag, search, status } = req.query;

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
      { repository: regex },
      { prTitle: regex },
      { description: regex },
    ];
  }

  if (typeof status === "string" && VALID_STATUSES.includes(status)) {
    filter.status = status;
  }

  const items = await OpenSource.find(filter).sort({ createdAt: -1 });
  res.json(items);
};

// GET /api/open-source/:id
const getOpenSourceItem = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const item = await OpenSource.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!item) {
    return res
      .status(404)
      .json({ message: "Open source contribution not found" });
  }

  res.json(item);
};

// POST /api/open-source
const createOpenSourceItem = async (req, res) => {
  const data = pick(req.body || {}, ALLOWED_FIELDS);

  const item = await OpenSource.create({
    ...data,
    user: req.user.id,
  });
  res.status(201).json(item);
};

// PATCH /api/open-source/:id
const updateOpenSourceItem = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const updates = pick(req.body || {}, ALLOWED_FIELDS);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const item = await OpenSource.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!item) {
    return res
      .status(404)
      .json({ message: "Open source contribution not found" });
  }

  res.json(item);
};

// DELETE /api/open-source/:id
const deleteOpenSourceItem = async (req, res) => {
  if (!checkId(req.params.id, res)) return;

  const item = await OpenSource.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!item) {
    return res
      .status(404)
      .json({ message: "Open source contribution not found" });
  }

  res.json({ message: "Open source contribution deleted" });
};

module.exports = {
  getOpenSourceItems,
  getOpenSourceItem,
  createOpenSourceItem,
  updateOpenSourceItem,
  deleteOpenSourceItem,
};
