// Everything the site says lives in this one file.
// Edit text, numbers, projects or skills here; the components read from it.

export const profile = {
  name: "Osama Atta",
  eyebrow: "Full-stack software engineer",
  roleShort: "Full-stack engineer", // where space is tight (the pinned header on phones)
  location: "Omaha, NE, USA",
  timeZone: "America/Chicago", // drives the live local time next to the location
  coordinates: "41.2565°N 95.9345°W",
  headline: "I build the whole tech stack. AI included.",
  // Wrap words in **double asterisks** to make them bold. It opens with my current role, so update it when that changes.
  intro:
    "**Senior Project Engineer** in FinTech at **Union Pacific**. **Five years** building production systems with **Java/Spring**, **TypeScript/Angular** and **AI**, on a foundation in computer engineering and embedded firmware.",
  email: "osama.obeid@hotmail.com",
  github: "https://github.com/osama-atta",
  linkedin: "https://www.linkedin.com/in/osama-atta3",
  // The résumé: the PDF people download, and a picture of its page for the in-page preview.
  // When you update the résumé, replace both files in /public (see the README).
  resumeFile: "/resume.pdf",
  resumePreview: "/resume-preview.webp",
  resumePreviewSize: { width: 1700, height: 2200 },
  resumeDownloadName: "Osama-Atta-Resume.pdf",
  resumeUpdated: "Oct 2026",
};

// Messages for the LED display. Each entry is one "frame" of up to two lines.
// Supported characters: A–Z, 0–9, space and . , ! ? ' / - $ % + : & ·
export const ledFrames: string[][] = [
  ["HI, I'M", "OSAMA ATTA"],
  ["FULL-STACK", "ENGINEER"],
  ["BASED IN", "OMAHA, NE, USA"],
];

export type Metric = {
  id: string;
  label: string;
  sub: string;
  prefix?: string;
  suffix?: string;
  value: number;
  decimals: number;
  /** What the multimeter shows when a visitor probes this test point. */
  probe: {
    mode: string; // shown on the meter's display, like a multimeter range
    measured: string; // what the number is and how it came about
    role: string;
    dates: string;
    projectId?: string; // links to a project card in "Selected work"
  };
};

export const metrics: Metric[] = [
  {
    id: "TP1",
    label: "Cost savings",
    sub: "from analytics tools",
    prefix: "$",
    suffix: "M",
    value: 4.6,
    decimals: 1,
    probe: {
      mode: "USD · SAVED",
      measured:
        "Two web apps on an Oracle database, Java/Spring back end and TypeScript/Angular front end that collect crew productivity metrics, so locomotives are properly utilized.",
      role: "Project Engineer, Operations · Union Pacific",
      dates: "Oct 2024 – Dec 2025",
      projectId: "utilization",
    },
  },
  {
    id: "TP2",
    label: "Uptime",
    sub: "on the products I support",
    suffix: "%",
    value: 99.94,
    decimals: 2,
    probe: {
      mode: "% · UPTIME",
      measured: "Uptime across multiple products while I provided on-call support, through proactive monitoring and rapid issue resolution.",
      role: "Associate Senior Application Developer, Operations · Union Pacific",
      dates: "May 2023 – Oct 2024",
      projectId: "telemetry",
    },
  },
  {
    id: "TP3",
    label: "Devices connected",
    sub: "sending data to my services",
    suffix: "K+",
    value: 10,
    decimals: 0,
    probe: {
      mode: "DEVICES",
      measured:
        "Android devices in the field whose telemetry I expanded, by building Java-based microservices and optimizing back-end data processing.",
      role: "Associate Senior Application Developer, Operations · Union Pacific",
      dates: "May 2023 – Oct 2024",
      projectId: "telemetry",
    },
  },
  {
    id: "TP4",
    label: "Fewer user issues",
    sub: "after fixes and features",
    suffix: "%",
    value: 63,
    decimals: 0,
    probe: {
      mode: "% · CONCERNS ↓",
      measured: "Drop in user concerns after I shipped customer-requested features and critical fixes across Android and web apps.",
      role: "Project Engineer, Operations · Union Pacific",
      dates: "Oct 2024 – Dec 2025",
      projectId: "customer",
    },
  },
];

export type NowItem = {
  id: string;
  channel: string; // e.g. "At work"
  status: string; // shown next to the blinking activity LED
  title: string;
  detail: string;
  /** Optional live counter, worked out from today's date in the visitor's browser. */
  counter?: { kind: "since" | "until"; year: number; month: number; label: string };
  tags?: string[];
  link?: { href: string; label: string };
};

// "What I'm working on now". Months are 1–12.
export const nowItems: NowItem[] = [
  {
    id: "work",
    channel: "At work",
    status: "ACTIVE",
    title: "FinTech at Union Pacific",
    detail:
      "Modernizing the financial systems behind America's largest railroad. As a Senior Project Engineer in FinTech, I build and maintain full-stack applications across finance, payroll and marketing, from AI-powered OCR tools that turn documents into data to a new platform for managing market dimensions.",
    counter: { kind: "since", year: 2025, month: 12, label: "MONTHS IN ROLE" },
  },
  {
    id: "study",
    channel: "School",
    status: "IN PROGRESS",
    title: "Artificial Intelligence Certificate",
    detail: "Coursework at the University of Nebraska at Omaha, expected December 2026.",
    counter: { kind: "until", year: 2026, month: 12, label: "MONTHS TO GO" },
  },
];

// Skills, grouped by area. Clicking a skill lights up the work that uses it;
// clicking a group's name lights up everything in that group.
// `wide` groups span the full width of the skill board.
export const skillGroups = [
  {
    id: "back",
    label: "Back end",
    skills: [
      { id: "java", label: "Java" },
      { id: "spring", label: "Spring / Spring Boot" },
      { id: "jakarta", label: "Jakarta EE" },
      { id: "maven", label: "Maven" },
      { id: "jms", label: "JMS" },
      { id: "rest", label: "REST APIs" },
      { id: "micro", label: "Microservices" },
    ],
  },
  {
    id: "front",
    label: "Front end & mobile",
    skills: [
      { id: "ts", label: "TypeScript" },
      { id: "angular", label: "Angular" },
      { id: "rxjs", label: "RxJS" },
      { id: "html", label: "HTML/CSS" },
      { id: "android", label: "Android" },
      { id: "react", label: "React / Next.js" },
    ],
  },
  {
    id: "data",
    label: "Data",
    skills: [
      { id: "oracle", label: "Oracle / SQL" },
      { id: "liquibase", label: "Liquibase" },
      { id: "mysql", label: "MySQL" },
    ],
  },
  {
    id: "ops",
    label: "Testing & DevOps",
    skills: [
      { id: "junit", label: "JUnit / Mockito" },
      { id: "jasmine", label: "Jasmine" },
      { id: "git", label: "Git" },
      { id: "gha", label: "GitHub Actions" },
      { id: "jenkins", label: "Jenkins" },
      { id: "k8s", label: "Kubernetes" },
      { id: "linux", label: "Linux/Unix" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    skills: [
      { id: "aiapps", label: "AI integration" },
      { id: "openspec", label: "Spec-driven dev (OpenSpec)" },
      { id: "aidev", label: "AI-assisted dev" },
      { id: "pytorch", label: "Python / PyTorch" },
      { id: "langgraph", label: "LangGraph" },
    ],
  },
  {
    id: "hw",
    label: "Hardware",
    skills: [
      { id: "c", label: "Embedded C" },
      { id: "mcu", label: "STM32 / ESP8266" },
      { id: "pcb", label: "PCB design" },
      { id: "mqtt", label: "MQTT / IoT" },
      { id: "nodered", label: "Node-RED" },
    ],
  },
  {
    id: "lead",
    label: "Leadership & collaboration",
    wide: true,
    skills: [
      { id: "lead", label: "Team leadership" },
      { id: "mentor", label: "Mentoring" },
      { id: "stake", label: "Stakeholder partnership" },
      { id: "adopt", label: "Driving adoption" },
      { id: "xteam", label: "Cross-team coordination" },
      { id: "own", label: "Ownership & on-call" },
    ],
  },
] as const;

export type SkillGroupId = (typeof skillGroups)[number]["id"];
export type SkillId = (typeof skillGroups)[number]["skills"][number]["id"];

/** A featured project: gets a full card. */
export type Project = {
  id: string;
  tag: string;
  title: string;
  description: string;
  result: string;
  skills: SkillId[];
  href?: string; // add a link when the case study page exists
};

/** Smaller work: one line each, in the "more builds" dropdown. */
export type Build = {
  id: string;
  title: string;
  note: string;
  years: string;
  skills: SkillId[];
};

export const projects: Project[] = [
  {
    id: "ai-payments",
    tag: "01 · AI · FinTech",
    title: "AI payment extraction",
    description:
      "A Java/Spring app that reads check payment details from customer emails, applies them to accounts receivable and flags exceptions for review. Built spec-first with OpenSpec and AI coding agents.",
    result: "5% more accurate than the legacy system",
    skills: ["java", "spring", "rest", "aiapps", "openspec", "aidev"],
  },
  {
    id: "utilization",
    tag: "02 · Full stack · Analytics",
    title: "Resource utilization platform",
    description:
      "Two web apps on Oracle, Java/Spring and Angular that track crew productivity so expensive equipment is put to the best use.",
    result: "$4.6M in savings",
    skills: ["java", "spring", "ts", "angular", "oracle", "rest"],
  },
  {
    id: "marketing",
    tag: "03 · Full stack · AI-built",
    title: "Self-service marketing data",
    description:
      "A full-stack app that lets the marketing team maintain its own validated data instead of filing manual requests. Built spec-first with OpenSpec and AI coding agents, an approach I'm now recommending to other teams.",
    result: "Manual requests replaced by self-service",
    skills: ["java", "spring", "ts", "angular", "oracle", "rest", "openspec", "aidev", "stake", "adopt"],
  },
  {
    id: "finance-modernization",
    tag: "04 · Back end · Modernization",
    title: "Finance platform modernization",
    description:
      "Upgraded receivables and payables apps from Java 8 to 17 and Spring Boot, moved javax to Jakarta EE, replaced JMS with HTTP calls and cleaned up Maven parent POMs.",
    result: "Known security vulnerabilities patched",
    skills: ["java", "spring", "jakarta", "maven", "jms"],
  },
  {
    id: "modernization",
    tag: "05 · Front end · Leadership",
    title: "Legacy apps rebuilt for today",
    description: "Led four interns rewriting two high-usage Apache Wicket apps as responsive Angular apps that work on phones.",
    result: "Two high-usage apps, mobile-ready",
    skills: ["ts", "angular", "html", "java", "lead", "mentor"],
  },
  {
    id: "customer",
    tag: "06 · Mobile & web · Customers",
    title: "Customer-driven app improvements",
    description: "Shipped customer-requested features and critical fixes across Android and web apps.",
    result: "63% fewer support tickets year over year",
    skills: ["android", "angular", "ts", "java", "stake"],
  },
];

export const builds: Build[] = [
  { id: "telemetry", title: "Telemetry microservices", note: "Java services collecting data from 10,000+ Android devices", years: "2023–24", skills: ["java", "micro", "android"] },
  { id: "on-call", title: "On-call reliability", note: "99.94% uptime across multiple products", years: "2023–24", skills: ["k8s", "linux", "own"] },
  { id: "github", title: "GitHub and GitHub Actions migration", note: "Led the move off GitLab and Jenkins without breaking releases", years: "2024–25", skills: ["git", "gha", "jenkins", "lead"] },
  { id: "boards", title: "Microcontroller boards", note: "Designed AT89LP51 and STM32 boards, from PCB layout to embedded C", years: "2022", skills: ["c", "mcu", "pcb"] },
  { id: "ux", title: "UX improvement initiative", note: "15% more usage; mentored a UX intern", years: "2023–24", skills: ["angular", "html", "mentor"] },
  { id: "ai-tools", title: "AI developer tools rollout", note: "Later adopted company-wide", years: "2024–25", skills: ["aidev", "adopt"] },
  { id: "payroll", title: "Off-cycle payroll workflow", note: "Submit, review and approve payouts outside normal pay cycles", years: "2025–now", skills: ["java", "spring", "angular", "stake"] },
  { id: "netcontrol", title: "Mainframe-to-API cutover", note: "Represented my team in an enterprise-wide modernization", years: "2023–24", skills: ["rest", "xteam"] },
  { id: "angular-migration", title: "AngularJS to Angular migration", note: "Moved a legacy AngularJS app to Angular 11 and TypeScript for easier upkeep and better performance", years: "2021–23", skills: ["angular", "ts"] },
  { id: "work-orders", title: "Mobile work-order app", note: "Java/Spring and Angular with 80% test coverage", years: "2021–23", skills: ["java", "spring", "angular", "junit", "jasmine"] },
  { id: "thermal", title: "Thermal water storage system", note: "IoT firmware, MQTT messaging and live analytics", years: "2022–23", skills: ["c", "mcu", "mqtt", "nodered", "mysql"] },
  { id: "portfolio", title: "This portfolio", note: "Next.js, React and Tailwind, built to learn a new stack", years: "2026", skills: ["react", "ts"] },
];

export const experience = [
  { title: "Senior Project Engineer, FinTech", org: "Union Pacific", dates: "Dec 2025 – now", current: true },
  { title: "Project Engineer, Operations", org: "Union Pacific", dates: "Oct 2024 – Dec 2025" },
  { title: "Associate Senior Application Developer, Operations", org: "Union Pacific", dates: "May 2023 – Oct 2024" },
  { title: "Technology Intern, Operations", org: "Union Pacific", dates: "Oct 2021 – May 2023" },
];

export const education = [
  { title: "Artificial Intelligence Certificate", detail: "University of Nebraska at Omaha · exp. Dec 2026" },
  { title: "B.S. Computer Engineering", detail: "University of Nebraska–Lincoln · 2023 · Minors in Math and CS" },
];
