const User = require("../models/User");
const Project = require("../models/Project");
const Experience = require("../models/Experience");
const OpenSource = require("../models/OpenSource");
const Certification = require("../models/Certification");
const Skill = require("../models/Skill");

// GET /api/public/:username
const getPublicProfile = async (req, res) => {
  const { username } = req.params;

  if (typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ message: "Invalid username" });
  }

  const cleanUsername = username.trim().toLowerCase();

  const user = await User.findOne({ username: cleanUsername });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const [experience, projects, openSource, certifications, skills] =
    await Promise.all([
      Experience.find({ user: user._id, isPublic: true })
        .select("-user -__v")
        .sort({ startDate: -1 })
        .lean(),
      Project.find({ user: user._id, isPublic: true })
        .select("-user -__v")
        .sort({ createdAt: -1 })
        .lean(),
      typeof OpenSource.find === "function"
        ? OpenSource.find({ user: user._id, isPublic: true })
            .select("-user -__v")
            .sort({ createdAt: -1 })
            .lean()
        : Promise.resolve([]),
      Certification.find({ user: user._id, isPublic: true })
        .select("-user -__v")
        .sort({ completedOn: -1, createdAt: -1 })
        .lean(),
      Skill.find({ user: user._id, isPublic: true })
        .select("-user -__v")
        .sort({ category: 1, name: 1 })
        .lean(),
    ]);

  res.json({
    profile: {
      name: user.name,
      username: user.username,
      bio: user.bio,
    },
    experience,
    projects,
    openSource,
    certifications,
    skills,
  });
};

module.exports = { getPublicProfile };
