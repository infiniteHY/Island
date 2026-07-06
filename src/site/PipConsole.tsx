import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSiteStore } from "./siteStore";

type PipMood = "idle" | "happy" | "confused" | "flying";
type TerminalLine = {
  type: "boot" | "prompt" | "output" | "error" | "success";
  text: string;
};

type PipStats = {
  energy: number;
  focus: number;
  curiosity: number;
};

type PipProject = {
  key: string;
  aliases: string[];
  name: string;
  url: string;
  desc: string;
  id: string;
};

const projects: PipProject[] = [
  {
    key: "mira",
    aliases: ["agent", "ip"],
    name: "MIRA",
    url: "https://mira-agent.hanya.workers.dev/",
    desc: "personal IP agent / positioning / content workflow",
    id: "mira"
  },
  {
    key: "invest",
    aliases: ["market", "etf", "invest-agent"],
    name: "Invest Agent",
    url: "https://etf-ai-agent.pages.dev/",
    desc: "ETF notes / dashboard / trading assistant",
    id: "invest-agent"
  },
  {
    key: "skillweave",
    aliases: ["skill", "tree", "skill-weave"],
    name: "SkillWeave",
    url: "https://skillweave.hanya.workers.dev/",
    desc: "interest graph / skill evolution / self exploration",
    id: "skill-weave"
  },
  {
    key: "white",
    aliases: ["whitenight", "white-night"],
    name: "WhiteNight",
    url: "https://white-night-app.vercel.app/dashboard",
    desc: "reading dashboard / notes / quiet system",
    id: "white-night"
  },
  {
    key: "jazz",
    aliases: ["wand", "wand-jazz", "bar"],
    name: "Wand Jazz Bar",
    url: "https://wandjazzbar.vercel.app/jazz-bar",
    desc: "music space / bar interface / ambient archive",
    id: "wand-jazz"
  },
  {
    key: "mbti",
    aliases: ["music", "theory", "mbti-music"],
    name: "MBTI Music Theory",
    url: "https://musictheory-6sc.pages.dev/#/",
    desc: "game-like music theory learning / keyboard interaction",
    id: "mbti-music"
  }
];

const skills: Record<string, string> = {
  "code+music": "Interactive Music Learning",
  "music+code": "Interactive Music Learning",
  "cv+steel": "Industrial Vision",
  "steel+cv": "Industrial Vision",
  "mbti+music": "Personalized Ear Training",
  "music+mbti": "Personalized Ear Training",
  "camera+memory": "Visual Memory System",
  "memory+camera": "Visual Memory System",
  "market+agent": "Market Pattern Lab",
  "agent+market": "Market Pattern Lab"
};

const relics: Record<string, string> = {
  bass: "bass pick",
  camera: "tiny camera",
  market: "K-line charm",
  music: "blue note",
  skill: "skill leaf",
  note: "hidden note"
};

const secrets = [
  "I build small systems to understand myself.",
  "Pip keeps unfinished ideas warm until they hatch.",
  "Every project here started as a tiny repeated curiosity.",
  "The best tools feel like places you can return to."
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findProject(value: string) {
  const key = normalize(value);
  return projects.find((project) =>
    [project.key, project.name, project.id, ...project.aliases].some((alias) => normalize(alias) === key)
  );
}

function scanProjects() {
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".work-panel"));
  panels.forEach((panel, index) => {
    window.setTimeout(() => {
      panel.classList.add("is-pip-scanned");
      window.setTimeout(() => panel.classList.remove("is-pip-scanned"), 1050);
    }, index * 150);
  });
}

function focusProject(id: string) {
  const panel = document.querySelector<HTMLElement>(`.work-panel[data-project-id="${id}"]`);
  panel?.scrollIntoView({ block: "center", behavior: "smooth" });
  panel?.classList.add("is-pip-scanned");
  window.setTimeout(() => panel?.classList.remove("is-pip-scanned"), 1200);
}

function scrollTo(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ block: "start", behavior: "smooth" });
}

export function PipConsole() {
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const theme = useSiteStore((state) => state.theme);
  const toggleTheme = useSiteStore((state) => state.toggleTheme);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<PipMood>("idle");
  const [nest, setNest] = useState<string[]>(["curiosity"]);
  const [showNest, setShowNest] = useState(false);
  const [stats, setStats] = useState<PipStats>({ energy: 80, focus: 70, curiosity: 62 });
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "boot", text: "PipOS v0.2.6 booting..." },
    { type: "success", text: "mounted /home/hanya/projects" },
    { type: "output", text: "type `help` to begin" },
    { type: "output", text: "try: scan | list | hatch | brew music+code" }
  ]);
  const prompt = "pip@home:~$";

  const moodLabel = useMemo(() => {
    if (mood === "confused") return "thinking";
    if (mood === "flying") return "routing";
    if (mood === "happy") return "curious";
    return "idle";
  }, [mood]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [lines]);

  function meter(value: number) {
    const filled = Math.max(0, Math.min(10, Math.round(value / 10)));
    return "█".repeat(filled) + "░".repeat(10 - filled);
  }

  function updateStats(delta: Partial<PipStats>) {
    setStats((current) => ({
      energy: Math.max(0, Math.min(100, current.energy + (delta.energy ?? 0))),
      focus: Math.max(0, Math.min(100, current.focus + (delta.focus ?? 0))),
      curiosity: Math.max(0, Math.min(100, current.curiosity + (delta.curiosity ?? 0)))
    }));
  }

  function pulse(nextMood: PipMood, delta: Partial<PipStats> = {}) {
    updateStats(delta);
    setMood(nextMood);
    window.setTimeout(() => setMood("idle"), nextMood === "flying" ? 760 : 440);
  }

  function echo(command: string, output: string[]) {
    const mapped = output.map<TerminalLine>((text) => ({
      type: (text.includes("unknown") || text.startsWith("try:")
        ? "error"
        : text.includes("unlocked") || text.includes("opening")
          ? "success"
          : "output") as TerminalLine["type"],
      text
    }));
    const promptLine: TerminalLine = { type: "prompt", text: `${prompt} ${command}` };
    setLines((current) => [...current, promptLine, ...mapped].slice(-42));
  }

  function addNestItem(item: string) {
    setNest((current) => {
      if (current.includes(item)) return current;
      return [...current, item].slice(-7);
    });
  }

  function renderLine(text: string) {
    if (/^https?:\/\//.test(text)) {
      return (
        <a href={text} target="_blank" rel="noreferrer">
          {text}
        </a>
      );
    }

    return text || "\u00a0";
  }

  function setTheme(next: "light" | "dark") {
    if (theme !== next) toggleTheme();
  }

  function runCommand(raw: string) {
    const value = raw.trim();
    if (!value) return;

    const [cmd = "", ...args] = value.split(/\s+/);
    const rest = args.join(" ");
    const command = cmd.toLowerCase();
    const target = rest.toLowerCase();

    if (command === "clear") {
      setLines([{ type: "boot", text: "screen cleared." }, { type: "output", text: "type `help` to begin." }]);
      setShowNest(false);
      pulse("happy", { focus: 4 });
      return;
    }

    if (command === "help" || command === "commands") {
      echo(value, [
        "Available commands:",
        "list                 list all projects",
        "scan                 highlight every project card",
        "focus <project>      jump to one project card",
        "open <project>       open project link",
        "status               show Pip mood and factors",
        "brew a+b             combine two interests",
        "nest                 show collected relics",
        "drop <relic>         add bass/camera/market/music/skill/note",
        "hatch                hatch the current nest",
        "theme night/light    switch theme",
        "where                show page map",
        "goto top/work/room/contact",
        "contact              show email and GitHub",
        "secret               unlock a hidden note",
        "sing                 make Pip hum",
        "fortune              ask Pip for a small prompt",
        "clear                clear terminal"
      ]);
      pulse("happy", { curiosity: 2 });
      return;
    }

    if (command === "status") {
      setShowNest(true);
      echo(value, [
        "Pip the Terminal Bird",
        `mood       ${moodLabel}`,
        `energy     ${meter(stats.energy)} ${stats.energy}%`,
        `focus      ${meter(stats.focus)} ${stats.focus}%`,
        `curiosity  ${meter(stats.curiosity)} ${stats.curiosity}%`,
        `nest       ${nest.join(" / ")}`
      ]);
      pulse("happy", { focus: 1 });
      return;
    }

    if (command === "list" || command === "projects") {
      echo(value, projects.map((project, index) => `[${index + 1}] ${project.key.padEnd(10)} ${project.name}`));
      pulse("happy", { focus: 3 });
      return;
    }

    if (command === "scan") {
      echo(value, [
        "scanning all project cards...",
        ...projects.map((project, index) => `[${index + 1}] ${project.name} - ${project.desc}`)
      ]);
      scanProjects();
      pulse("flying", { energy: -8, focus: 8, curiosity: 3 });
      return;
    }

    if (command === "focus") {
      const project = findProject(rest);
      if (!project) {
        echo(value, ["unknown project.", "try: focus mira / focus skillweave / focus mbti"]);
        pulse("confused", { energy: -2, focus: -4 });
        return;
      }

      echo(value, [`Pip points to ${project.name}.`, project.desc]);
      focusProject(project.id);
      pulse("flying", { energy: -4, focus: 7 });
      return;
    }

    if (command === "open") {
      const project = findProject(rest);
      if (!project) {
        echo(value, ["unknown project.", "try: open mira / open invest agent / open wand jazz bar / open mbti"]);
        pulse("confused", { energy: -2, focus: -4 });
        return;
      }

      echo(value, [`opening ${project.name}`, project.url]);
      pulse("flying", { energy: -5, focus: 4 });
      window.open(project.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (command === "brew") {
      const key = normalize(rest);
      const skill = skills[key];
      if (!skill) {
        echo(value, [
          "Pip tilts its head.",
          "try: brew music+code / brew cv+steel / brew camera+memory / brew market+agent"
        ]);
        pulse("confused", { energy: -2, curiosity: 1 });
        return;
      }

      addNestItem(skill);
      setShowNest(true);
      echo(value, ["new skill unlocked:", skill, `= ${rest.split("+").join(" + ")} + curiosity`]);
      pulse("happy", { energy: -3, focus: 3, curiosity: 8 });
      return;
    }

    if (command === "drop" || command === "collect") {
      const relic = relics[normalize(rest)];
      if (!relic) {
        echo(value, ["Pip can collect: bass / camera / market / music / skill / note"]);
        pulse("confused", { energy: -2, curiosity: 1 });
        return;
      }

      addNestItem(relic);
      setShowNest(true);
      echo(value, [`Pip tucked ${relic} into the nest.`]);
      pulse("happy", { curiosity: 5 });
      return;
    }

    if (command === "nest") {
      setShowNest(true);
      echo(value, ["nest inventory:", ...nest.map((item, index) => `[${index + 1}] ${item}`)]);
      pulse("happy", { focus: 2, curiosity: 2 });
      return;
    }

    if (command === "hatch") {
      const hatch = nest.length >= 4 ? "a new project seed" : "a tiny idea feather";
      addNestItem(hatch);
      setShowNest(true);
      echo(value, [`Pip warms the nest...`, `hatched: ${hatch}`]);
      pulse("flying", { energy: -10, focus: 5, curiosity: 6 });
      return;
    }

    if (command === "theme") {
      if (target === "night" || target === "dark") {
        setTheme("dark");
        echo(value, ["night theme enabled."]);
        pulse("happy", { focus: 2 });
        return;
      }
      if (target === "light" || target === "day") {
        setTheme("light");
        echo(value, ["light theme enabled."]);
        pulse("happy", { focus: 2 });
        return;
      }

      echo(value, ["try: theme night / theme light"]);
      pulse("confused", { focus: -2 });
      return;
    }

    if (command === "where" || command === "map") {
      echo(value, [
        "page map:",
        "top     -> bottle / miniature objects",
        "work    -> project archive",
        "room    -> 3D room / personal objects",
        "contact -> email / github"
      ]);
      pulse("happy", { focus: 4 });
      return;
    }

    if (command === "goto") {
      if (target === "work") {
        scrollTo("#work");
        echo(value, ["jumping to work archive."]);
        pulse("flying", { energy: -3, focus: 4 });
        return;
      }
      if (target === "room") {
        scrollTo("#room");
        echo(value, ["jumping to 3D room."]);
        pulse("flying", { energy: -3, focus: 4, curiosity: 2 });
        return;
      }
      if (target === "contact") {
        scrollTo("#contact");
        echo(value, ["jumping to contact."]);
        pulse("flying", { energy: -3, focus: 4 });
        return;
      }
      if (target === "top" || target === "home") {
        scrollTo("#top");
        echo(value, ["back to the bottle."]);
        pulse("flying", { energy: -3, focus: 4 });
        return;
      }
      echo(value, ["try: goto top / goto work / goto room / goto contact"]);
      pulse("confused", { focus: -2 });
      return;
    }

    if (command === "contact") {
      echo(value, ["email  1277530323@qq.com", "github https://github.com/infiniteHY"]);
      pulse("happy", { focus: 2 });
      return;
    }

    if (command === "github") {
      echo(value, ["opening GitHub profile."]);
      pulse("flying", { energy: -4, focus: 3 });
      window.open("https://github.com/infiniteHY", "_blank", "noopener,noreferrer");
      return;
    }

    if (command === "email") {
      echo(value, ["opening mail composer."]);
      pulse("flying", { energy: -3, focus: 3 });
      window.location.href = "mailto:1277530323@qq.com";
      return;
    }

    if (command === "sing") {
      addNestItem("four quiet notes");
      setShowNest(true);
      echo(value, ["Pip hums:", "do mi sol la", "a small chord lands in the nest."]);
      pulse("happy", { energy: 3, curiosity: 4 });
      return;
    }

    if (command === "fortune") {
      const pick = secrets[Math.floor(Date.now() / 1000) % secrets.length];
      echo(value, ["Pip's prompt:", pick]);
      pulse("happy", { curiosity: 3 });
      return;
    }

    if (command === "secret") {
      addNestItem("secret feather");
      setShowNest(true);
      echo(value, ["Pip found a hidden note:", secrets[0], "try: hatch"]);
      pulse("happy", { curiosity: 8 });
      return;
    }

    echo(value, [`unknown command: ${cmd}`, "try: help"]);
    pulse("confused", { energy: -3, focus: -5 });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(input);
    setInput("");
    window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <div className="pip-dock" onClick={() => inputRef.current?.focus()}>
      <div className={`pip-bird is-${mood}`} aria-hidden="true">
        <img src="/assets/bird/bird-stay.png" alt="" />
      </div>
      <div className="pip-console" aria-label="Pip terminal console">
        <div className="pip-console-head mono">
          <span className="pip-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="pip-window-title">pip-console — zsh — 80x24</span>
          <span>{moodLabel} · E{stats.energy} F{stats.focus} C{stats.curiosity}</span>
        </div>
        <div ref={logRef} className="pip-console-screen mono" role="log" aria-live="polite">
          {lines.map((line, index) => (
            <p key={`${line.text}-${index}`} className={`terminal-line is-${line.type}`}>
              {renderLine(line.text)}
            </p>
          ))}
          {showNest ? (
            <div className="pip-relics" aria-label="Pip nest">
              <span className="terminal-muted">nest:</span>
              {nest.slice(-5).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
          <form className="pip-command" onSubmit={handleSubmit}>
            <label htmlFor="pip-command-input">{prompt}</label>
            <input
              id="pip-command-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
