import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Users,
  FolderKanban,
  MessageSquare,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Award,
  Zap,
  Target,
  Sparkles,
  Link2,
  BookMarked,
  Lightbulb,
  Trophy,
  Briefcase,
  Timer,
  ArrowRight,
  Globe,
} from "lucide-react";
import { SKILL_DATABASE } from "../../data/skillDatabase";

/* ───────────────────────── helper: type icon ───────────────────────── */
const TYPE_ICON = {
  W3Schools: Globe,
  Documentation: FileText,
  Tutorials: BookOpen,
  Videos: Video,
  Books: BookMarked,
};

const TYPE_COLORS = {
  W3Schools: "bg-sky-500/15 text-sky-400",
  Documentation: "bg-blue-500/15 text-blue-400",
  Tutorials: "bg-emerald-500/15 text-emerald-400",
  Videos: "bg-rose-500/15 text-rose-400",
  Books: "bg-amber-500/15 text-amber-400",
};

const DIFF_COLORS = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Advanced: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Hard: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const TAB_ICONS = {
  Roadmap: Target,
  Resources: BookOpen,
  Mentors: Users,
  Projects: FolderKanban,
  Interview: MessageSquare,
};

const TABS = ["Roadmap", "Resources", "Mentors", "Projects", "Interview"];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              SkillDetailPanel                              */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function SkillDetailPanel({ skill, isOpen, onClose, mentors }) {
  const [activeTab, setActiveTab] = useState("Roadmap");
  const [completed, setCompleted] = useState({});
  const [expandedQ, setExpandedQ] = useState(null);

  const skillName = skill?.label || skill?.name || "Unknown";
  const skillCategory = skill?.category || skill?.type || "General";
  const skillData = SKILL_DATABASE[skillName] || null;

  console.log("Selected Skill:", skillName, skillData);

  const roadmap = skillData?.roadmap || [];
  const resources = skillData?.resources || [];
  const projectList = skillData?.projects || [];
  const questions = skillData?.interviewQuestions || [];
  const mentorList = mentors?.length ? mentors : skillData?.mentors || [];

  /* ── progress helpers ── */
  const totalSubtopics = useMemo(
    () => roadmap.reduce((sum, lvl) => sum + lvl.subtopics.length, 0),
    [roadmap]
  );

  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed]
  );

  const progressPct = totalSubtopics ? Math.round((completedCount / totalSubtopics) * 100) : 0;

  const toggleCheck = (levelIdx, topicIdx) => {
    const key = `${levelIdx}-${topicIdx}`;
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupedResources = useMemo(() => {
    const groups = {};
    resources.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [resources]);

  const groupedProjects = useMemo(() => {
    const groups = {};
    projectList.forEach((p) => {
      if (!groups[p.diff]) groups[p.diff] = [];
      groups[p.diff].push(p);
    });
    return groups;
  }, [projectList]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ─── backdrop ─── */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* ─── panel ─── */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-white/[0.06] bg-[#0c0c14] shadow-2xl shadow-black/50"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* ─── header ─── */}
            <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-violet-500/30">
                    <Zap className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-white">{skillName}</h2>
                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">{skillCategory}</span>
                  </div>
                </div>
                {skillData && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs leading-relaxed text-zinc-400">{skillData.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-400 ring-1 ring-violet-500/20">
                        <Award className="h-3 w-3" />
                        {skillData.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/20">
                        <Timer className="h-3 w-3" />
                        {skillData.learningTime}
                      </span>
                      {skillData.prerequisites?.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400 ring-1 ring-sky-500/20">
                          Requires: {skillData.prerequisites.join(", ")}
                        </span>
                      )}
                    </div>
                    {skillData.careerPaths?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Briefcase className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                        <span className="text-[11px] text-zinc-500">Careers:</span>
                        {skillData.careerPaths.slice(0, 3).map((cp, i) => (
                          <span key={i} className="text-[11px] text-zinc-400">
                            {cp}{i < Math.min(skillData.careerPaths.length, 3) - 1 ? "," : ""}
                          </span>
                        ))}
                        {skillData.careerPaths.length > 3 && (
                          <span className="text-[11px] text-zinc-500">+{skillData.careerPaths.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white ml-3"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ─── tabs ─── */}
            <div className="flex gap-1 border-b border-white/[0.06] px-6 pt-3">
              {TABS.map((tab) => {
                const Icon = TAB_ICONS[tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "text-violet-400"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-violet-500"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── tab content ─── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-white/[0.08] scrollbar-track-transparent">
              {!skillData && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                  <Zap className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-400">No detailed data available for this skill yet.</p>
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === "Roadmap" && (
                    <RoadmapTab
                      roadmap={roadmap}
                      completed={completed}
                      toggleCheck={toggleCheck}
                      progressPct={progressPct}
                      completedCount={completedCount}
                      totalSubtopics={totalSubtopics}
                    />
                  )}
                  {activeTab === "Resources" && <ResourcesTab groups={groupedResources} />}
                  {activeTab === "Mentors" && <MentorsTab mentors={mentorList} skillName={skillName} />}
                  {activeTab === "Projects" && <ProjectsTab groups={groupedProjects} />}
                  {activeTab === "Interview" && (
                    <InterviewTab
                      questions={questions}
                      expandedQ={expandedQ}
                      setExpandedQ={setExpandedQ}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                               ROADMAP TAB                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function RoadmapTab({ roadmap, completed, toggleCheck, progressPct, completedCount, totalSubtopics }) {
  const [expandedLevels, setExpandedLevels] = useState(() => {
    const map = {};
    roadmap.forEach((_, i) => { map[i] = i < 2; });
    return map;
  });

  const toggleLevel = (i) => setExpandedLevels((p) => ({ ...p, [i]: !p[i] }));

  return (
    <div className="space-y-5">
      {/* progress card */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Your Progress</span>
          </div>
          <span className="text-xs font-semibold text-violet-400">{progressPct}%</span>
        </div>
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-zinc-500">
          {completedCount} of {totalSubtopics} topics completed
        </p>
      </div>

      {/* levels */}
      <div className="space-y-3">
        {roadmap.map((level, li) => {
          const levelDone = level.subtopics.filter((_, ti) => completed[`${li}-${ti}`]).length;
          const levelPct = Math.round((levelDone / level.subtopics.length) * 100);
          const isExpanded = expandedLevels[li];

          return (
            <div key={li} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => toggleLevel(li)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-xs font-bold text-violet-400 ring-1 ring-violet-500/20">
                    {level.level}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{level.title}</span>
                    <p className="text-xs text-zinc-500">{level.subtopics.length} topics</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-500">{levelPct}%</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 border-t border-white/[0.06] px-5 pb-3 pt-2">
                      {level.subtopics.map((topic, ti) => {
                        const checked = !!completed[`${li}-${ti}`];
                        return (
                          <label
                            key={ti}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                              checked ? "bg-violet-500/[0.06]" : "hover:bg-white/[0.03]"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                                checked
                                  ? "border-violet-500 bg-violet-500 text-white"
                                  : "border-white/[0.12] bg-transparent text-transparent hover:border-white/20"
                              }`}
                            >
                              <Check className="h-3 w-3" />
                            </div>
                            <span className={`text-[13px] ${checked ? "text-zinc-400 line-through" : "text-zinc-200"}`}>
                              {topic}
                            </span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => toggleCheck(li, ti)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              RESOURCES TAB                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ResourcesTab({ groups }) {
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([type, items]) => {
        const Icon = TYPE_ICON[type] || FileText;
        return (
          <div key={type}>
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${TYPE_COLORS[type]}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-white">{type}</h3>
              <span className="ml-auto text-xs text-zinc-600">{items.length} items</span>
            </div>
            <div className="space-y-2">
              {items.map((r, i) => (
                <button
                  key={i}
                  onClick={() => window.open(r.link, "_blank")}
                  className="group flex w-full items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">
                      {r.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{r.desc}</p>
                  </div>
                  <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-violet-400" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                               MENTORS TAB                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function MentorsTab({ mentors: mentorList, skillName }) {
  const [booked, setBooked] = useState({});

  return (
    <div className="space-y-3">
      {mentorList.map((m) => (
        <div
          key={m.id}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-sm font-bold text-white ring-1 ring-violet-500/20">
                {m.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{m.name}</p>
                <p className="text-xs text-zinc-500">{m.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="text-xs font-semibold">{m.rating}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">{m.availability}</span>
            </div>
            <button
              onClick={() => setBooked((p) => ({ ...p, [m.id]: true }))}
              disabled={booked[m.id]}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                booked[m.id]
                  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20 hover:bg-violet-500/25 hover:text-violet-300"
              }`}
            >
              {booked[m.id] ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Booked
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Book Session
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              PROJECTS TAB                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ProjectsTab({ groups }) {
  const diffOrder = ["Beginner", "Intermediate", "Advanced"];
  const sorted = diffOrder.filter((d) => groups[d]);

  return (
    <div className="space-y-6">
      {sorted.map((diff) => (
        <div key={diff}>
          <div className="mb-3 flex items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${DIFF_COLORS[diff]}`}>
              {diff}
            </span>
          </div>
          <div className="space-y-2">
            {groups[diff].map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{p.desc}</p>
                  </div>
                  <button className="ml-3 flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.1] hover:text-white">
                    <Link2 className="h-3 w-3" />
                    View
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.map((s, si) => (
                    <span
                      key={si}
                      className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-500 ring-1 ring-white/[0.06]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                             INTERVIEW TAB                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function InterviewTab({ questions, expandedQ, setExpandedQ }) {
  return (
    <div className="space-y-3">
      {questions.map((item, i) => {
        const isOpen = expandedQ === i;
        return (
          <div
            key={i}
            className={`rounded-xl border transition-all ${
              isOpen
                ? "border-violet-500/20 bg-violet-500/[0.04]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
            }`}
          >
            <button
              onClick={() => setExpandedQ(isOpen ? null : i)}
              className="flex w-full items-start gap-3 p-4 text-left"
            >
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-xs font-bold text-zinc-400">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white leading-relaxed">{item.q}</p>
              </div>
              <span className={`flex-shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${DIFF_COLORS[item.diff]}`}>
                {item.diff}
              </span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/[0.06] px-5 pb-4 pt-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                      <p className="text-[13px] leading-relaxed text-zinc-400">{item.a}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
