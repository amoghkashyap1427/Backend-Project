const CATEGORY_DEFINITIONS = [
  { key: 'Languages', title: 'Languages' },
  { key: 'Frameworks', title: 'Frameworks' },
  { key: 'Hardware-Robotics', title: 'Hardware / Robotics' },
  { key: 'Cloud-DevOps', title: 'Cloud / DevOps' },
];

const proficiencyStyles = {
  beginner: 'bg-slate-100 text-slate-700 border-slate-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced: 'bg-green-50 text-green-700 border-green-200',
};

export default function SkillsSection({ items = [] }) {
  const publicItems = Array.isArray(items)
    ? items.filter((item) => item?.isPublic === true)
    : [];

  if (publicItems.length === 0) {
    return null;
  }

  // Find all categories in publicItems not in CATEGORY_DEFINITIONS
  const knownKeys = CATEGORY_DEFINITIONS.map((c) => c.key);
  const otherKeys = [];
  for (const item of publicItems) {
    const cat = item?.category;
    if (cat && !knownKeys.includes(cat) && !otherKeys.includes(cat)) {
      otherKeys.push(cat);
    }
  }
  otherKeys.sort((a, b) => a.localeCompare(b));

  const allGroups = [
    ...CATEGORY_DEFINITIONS,
    ...otherKeys.map((cat) => ({ key: cat, title: cat })),
  ];

  // Group and sort skills A-Z by name inside each group
  const groupedSkills = allGroups
    .map((group) => {
      const skillsInGroup = publicItems
        .filter((item) => item?.category === group.key)
        .sort((a, b) => {
          const aName =
            typeof a?.name === 'string' ? a.name.trim().toLowerCase() : '';
          const bName =
            typeof b?.name === 'string' ? b.name.trim().toLowerCase() : '';
          return aName.localeCompare(bName);
        });

      return {
        ...group,
        skills: skillsInGroup,
      };
    })
    .filter((group) => group.skills.length > 0);

  // Group uncategorized skills if any
  const uncategorized = publicItems
    .filter((item) => !item?.category)
    .sort((a, b) => {
      const aName =
        typeof a?.name === 'string' ? a.name.trim().toLowerCase() : '';
      const bName =
        typeof b?.name === 'string' ? b.name.trim().toLowerCase() : '';
      return aName.localeCompare(bName);
    });

  if (uncategorized.length > 0) {
    groupedSkills.push({
      key: 'uncategorized',
      title: 'Other',
      skills: uncategorized,
    });
  }

  if (groupedSkills.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="portfolio-skills-heading" className="space-y-6">
      <h2
        id="portfolio-skills-heading"
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Skills
      </h2>

      <div className="space-y-6">
        {groupedSkills.map((group) => (
          <div
            key={group.key}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4"
          >
            <h3 className="text-base font-semibold text-slate-800">
              {group.title}
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {group.skills.map((skill, idx) => (
                <div
                  key={skill?._id || idx}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 shadow-xs"
                >
                  <span className="text-sm font-medium text-slate-800 break-words">
                    {skill.name}
                  </span>
                  {skill?.proficiency && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border capitalize ${
                        proficiencyStyles[skill.proficiency.toLowerCase()] ||
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {skill.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
