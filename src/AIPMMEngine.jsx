import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Terminal,
  Users,
  Target,
  FileText,
  BarChart3,
  ShieldCheck,
  Layers,
  Megaphone,
  LineChart,
  Search,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Code2,
  ArrowUpRight,
} from "lucide-react";

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */

const SECTIONS = [
  { id: "overview", label: "Overview", num: "00" },
  { id: "pipeline", label: "The Pipeline", num: "01" },
  { id: "agents", label: "Agent Architecture", num: "02" },
  { id: "outputs", label: "Example Outputs", num: "03" },
  { id: "metrics", label: "Impact & Metrics", num: "04" },
  { id: "governance", label: "Governance", num: "05" },
  { id: "stack", label: "Tech Stack", num: "06" },
];

const PIPELINE = [
  { n: "01", title: "Customer interviews", agent: "Input", desc: "Raw qualitative signal enters the system — interview transcripts, support tickets, review exports, win/loss notes.", kind: "input" },
  { n: "02", title: "AI analyzes feedback", agent: "Research Agent", desc: "Transcripts are parsed for verbatim pain statements — no summarizing before extraction, so nothing gets lost in translation.", kind: "agent" },
  { n: "03", title: "Identifies pain points", agent: "Research Agent", desc: "Statements are clustered into named themes, each tagged with frequency and source IDs for traceability.", kind: "agent" },
  { n: "04", title: "Generates ICP / personas", agent: "Research Agent", desc: "Validated themes are mapped against firmographic and behavioral data to draft ideal customer profiles.", kind: "agent" },
  { n: "05", title: "Creates positioning", agent: "Messaging Agent", desc: "A positioning statement is drafted against a competitive-alternatives framework, grounded only in verified capabilities.", kind: "agent" },
  { n: "06", title: "Generates messaging", agent: "Messaging Agent", desc: "Positioning is broken into pillars, each backed by proof points sourced from product capability and customer quotes.", kind: "agent" },
  { n: "07", title: "Creates campaign assets", agent: "Content + Sales Enablement Agents", desc: "Approved messaging is fanned out into landing pages, email sequences, one-pagers, and field-ready battlecards.", kind: "agent" },
  { n: "08", title: "Tracks performance", agent: "Analytics Agent", desc: "Live campaign and funnel data is watched for statistically meaningful signal — not noise.", kind: "agent" },
  { n: "09", title: "AI recommends optimization", agent: "Analytics Agent", desc: "Ranked, confidence-scored recommendations are returned — and low-confidence signal is routed back to the Research Agent.", kind: "loop" },
];

const PROBLEMS = [
  {
    problem: "Qualitative research doesn't scale past a handful of interviews.",
    mechanism: "Research Agent enforces a fixed extraction schema — theme, frequency, verbatim quote, source IDs, confidence — so 5 transcripts or 50 produce the same auditable structure, not an analyst's summary.",
    agent: "Research Agent",
  },
  {
    problem: "Positioning drifts from what the product can actually do.",
    mechanism: "Messaging Agent's prompt is hard-constrained to {product_capabilities} as the only source of proof points. A pillar with no matching capability gets flagged \"needs validation,\" never a claim.",
    agent: "Messaging Agent",
  },
  {
    problem: "Content production bottlenecks between \"messaging approved\" and \"campaign live.\"",
    mechanism: "Content Agent runs format-specific prompts against the same approved pillar set in parallel, with reading-ease and superlative limits enforced at generation time — not caught later in edit.",
    agent: "Content Agent",
  },
  {
    problem: "Battlecards get built on what the team assumes reps are hearing, not what they're actually hearing.",
    mechanism: "Sales Enablement Agent mines call-transcript data directly for objection frequency. Competitor claims must be quoted with a source timestamp — never paraphrased into something stronger.",
    agent: "Sales Enablement Agent",
  },
  {
    problem: "Performance reviews happen too late, or act on statistical noise.",
    mechanism: "Analytics Agent enforces a hard floor — under 200 sessions or under 4 weeks of data blocks a recommendation from being made at all, regardless of how the trend looks.",
    agent: "Analytics Agent",
  },
  {
    problem: "Speed without governance just ships the wrong output faster.",
    mechanism: "Every agent has an explicit human checkpoint before its output can advance. Low-confidence findings route back to the Research Agent instead of moving forward on hope.",
    agent: "All agents",
  },
];

const AGENTS = [
  {
    id: "research",
    name: "Research Agent",
    icon: Search,
    color: "accent",
    mandate: "Turns raw qualitative signal into a structured, traceable pain-point and JTBD dataset.",
    tools: ["Claude — synthesis & clustering", "Fireflies / Otter.ai — transcription", "Notion / Airtable — structured storage"],
    inputs: ["Interview transcripts", "Support tickets", "Review exports (G2, Capterra)", "Win/loss call notes"],
    outputs: ["Pain-point taxonomy", "Verbatim quote bank", "Theme frequency table", "Draft ICP / persona doc"],
    checkpoint: "PMM validates every theme cluster against qual intuition before it feeds the ICP. Any theme with fewer than 3 supporting sources is hard-flagged as directional, not a finding.",
    prompt: `SYSTEM:
You are a B2B SaaS research analyst. You only report
patterns directly supported by the source material
provided. Never invent quotes or infer sentiment that
is not present in the transcript.

USER:
Source: 14 customer interview transcripts (attached)
Task:
1. Extract every verbatim pain-point statement.
2. Cluster statements into named themes.
3. For each theme, report: theme name, frequency (n=),
   representative verbatim quote, source IDs.
4. Flag any theme with fewer than 3 supporting sources
   as "directional — low sample".

Output as JSON:
{ themes: [{ name, frequency, quote, sourceIds, confidence }] }`,
  },
  {
    id: "messaging",
    name: "Messaging Agent",
    icon: Target,
    color: "violet",
    mandate: "Converts a validated pain-point set into a positioning statement and a defensible messaging hierarchy.",
    tools: ["Claude — framework-guided drafting", "House messaging style guide — system prompt context", "Competitive intel tracker"],
    inputs: ["ICP / persona doc", "Pain-point taxonomy", "Product capability sheet", "Competitor intel"],
    outputs: ["Positioning statement", "3–4 messaging pillars", "2 proof points per pillar"],
    checkpoint: "Nothing ships without PMM sign-off. Every claim is checked against actual product capability — this is where overclaiming gets caught before it reaches legal.",
    prompt: `SYSTEM:
You are a positioning strategist using the "competitive
alternative → unique attributes → value → target segment"
framework. Do not claim any capability not listed in
{product_capabilities}.

USER:
Context: {icp_doc}, {pain_point_taxonomy}, {competitor_intel}
Task: Draft a one-paragraph positioning statement and
3–4 messaging pillars, each with 2 proof points sourced
only from {product_capabilities} or {validated_quotes}.
Mark any pillar with no direct proof point as "needs
validation" instead of inferring one.`,
  },
  {
    id: "content",
    name: "Content Agent",
    icon: Megaphone,
    color: "amber",
    mandate: "Fans approved messaging out into first-draft campaign assets across formats.",
    tools: ["Claude — copy drafting", "Figma / Canva — layout", "Brand voice guide — system prompt context"],
    inputs: ["Approved messaging pillars", "Asset brief (format, length, CTA)", "Brand voice guide"],
    outputs: ["Landing page copy", "Email sequences", "One-pagers", "Sales one-liners"],
    checkpoint: "Brand voice and technical-accuracy review before any asset moves to design. Superlatives that aren't in the approved messaging get stripped, not softened.",
    prompt: `SYSTEM:
Write in {brand_voice_guide}. Target Flesch reading ease
50–60. No unverified superlatives ("best-in-class",
"revolutionary") unless they appear in approved messaging.

USER:
Asset: landing page hero + 3 supporting sections
Input: {approved_messaging_pillars}
CTA goal: {cta_goal}
Constraints: hero ≤ 12 words, each section ≤ 40 words`,
  },
  {
    id: "sales",
    name: "Sales Enablement Agent",
    icon: Users,
    color: "rose",
    mandate: "Translates messaging into field-ready assets, grounded in what deals are actually losing to.",
    tools: ["Claude — objection extraction & rebuttal drafting", "Gong / Chorus — call transcript mining", "CRM — deal stage context"],
    inputs: ["Approved messaging", "Sales call transcripts", "Competitive intel"],
    outputs: ["Battlecards", "Objection-handling doc", "Discovery question bank"],
    checkpoint: "Sales leadership and PMM jointly validate objection accuracy and any competitive claim before rollout. Competitor quotes are cited with a timestamp, never paraphrased.",
    prompt: `SYSTEM:
You extract sales objections only from verbatim call
transcript excerpts. Do not paraphrase competitor claims
— quote them exactly with a source timestamp.

USER:
Input: {call_transcripts}, {approved_messaging}
Task: List the top 8 objections ranked by frequency. For
each, draft a rebuttal grounded in an approved proof
point. Flag any objection with no current proof point as
"needs enablement gap review".`,
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    icon: LineChart,
    color: "accent",
    mandate: "Watches campaign performance and turns dashboards into ranked, confidence-scored recommendations.",
    tools: ["Claude — narrative synthesis of metrics", "GA4 / HubSpot / Mixpanel — data source", "BI dashboard — trend context"],
    inputs: ["Campaign performance data", "Funnel metrics", "Win rate by messaging variant"],
    outputs: ["Performance summary", "Ranked optimization recommendations", "Re-open-research signal"],
    checkpoint: "PMM confirms no recommendation is built on an underpowered sample before acting on it. Any messaging pivot still requires explicit PMM approval.",
    prompt: `SYSTEM:
You are a marketing analyst. Never recommend a messaging
change based on n < 200 sessions or under 4 weeks of data.
State a confidence level for every recommendation.

USER:
Input: {campaign_performance_export}
Task: Summarize the top 3 wins, top 3 underperformers, and
3 ranked next-cycle recommendations with confidence
(high / medium / low) and the data threshold each meets.`,
  },
];

const OUTPUTS = [
  {
    tag: "Research Agent output",
    title: "Pain-point cluster",
    format: "mono",
    content: `{
  "themes": [
    {
      "name": "Alert fatigue drowns real incidents",
      "frequency": 9,
      "quote": "We get 40 Slack pings a day and
        stopped trusting any of them.",
      "sourceIds": ["INT-03", "INT-07", "INT-11"],
      "confidence": "high"
    },
    {
      "name": "Rollback decisions take too long",
      "frequency": 4,
      "quote": "By the time we agree to roll back,
        the damage is already done.",
      "sourceIds": ["INT-02", "INT-09"],
      "confidence": "directional — low sample"
    }
  ]
}`,
  },
  {
    tag: "Messaging Agent output",
    title: "Positioning statement",
    format: "prose",
    content: `For platform engineering teams shipping multiple times a day, DeployPilot is the deployment reliability layer that tells you which alert actually matters — unlike generic monitoring tools that treat every anomaly the same, DeployPilot ranks incidents by blast radius so on-call engineers act on the 3 that matter, not the 40 that don't.`,
  },
  {
    tag: "Messaging Agent output",
    title: "Messaging pillars",
    format: "list",
    content: [
      "Signal over noise — anomaly-ranking model cuts on-call pings by routing only blast-radius-relevant alerts.",
      "Faster, safer rollback decisions — one-click rollback with a blast-radius preview before you commit.",
      "Built for the on-call engineer, not the dashboard — mobile-first incident view, triage happens in Slack.",
    ],
  },
  {
    tag: "Content Agent output",
    title: "Landing page hero",
    format: "prose",
    content: `Headline: "Stop triaging alerts. Start trusting them."
Subhead: "DeployPilot ranks every deployment anomaly by blast radius, so your on-call engineer acts on 3 alerts instead of 40."`,
  },
  {
    tag: "Sales Enablement Agent output",
    title: "Battlecard — objection snippet",
    format: "prose",
    content: `Objection: "We already have Datadog / PagerDuty."
Rebuttal: Datadog tells you something changed. DeployPilot tells you if it matters — ranking anomalies by blast radius so teams stop treating every alert as equally urgent.`,
  },
  {
    tag: "Analytics Agent output",
    title: "Optimization recommendation",
    format: "mono",
    content: `Top underperformer: Email 2 in "Signal over noise"
sequence — 0.9% CTR vs 3.1% sequence average.

Recommendation (confidence: medium, n=340, 3 wks):
Lead with the rollback-preview proof point instead of
the alert-ranking stat — outperforming variant in A/B
on landing page uses the same order.

Flag: sample below 4-week threshold — hold before
rewriting sequence 3.`,
  },
];

const METRICS = [
  { stage: "Interview synthesis (10–15 interviews)", manual: "6–8 hrs", ai: "1.5–2 hrs", saved: "~70%", note: "Agent drafts theme clusters; PMM validates & re-clusters edge cases." },
  { stage: "Persona / ICP drafting", manual: "4–5 hrs", ai: "1 hr", saved: "~75%", note: "Draft from validated themes; PMM adds strategic judgment & tone." },
  { stage: "Positioning statement", manual: "3–4 hrs", ai: "45 min", saved: "~70%", note: "Framework-guided draft; PMM stress-tests vs. competitive reality." },
  { stage: "Messaging pillars + proof points", manual: "4 hrs", ai: "1 hr", saved: "~75%", note: "PMM checks every proof point against real product capability." },
  { stage: "Campaign asset first drafts", manual: "8–10 hrs", ai: "2–3 hrs", saved: "~70%", note: "Human pass still required for brand voice & legal review." },
  { stage: "Battlecard creation", manual: "3 hrs", ai: "45 min", saved: "~75%", note: "Requires sales leadership validation pass before rollout." },
  { stage: "Performance reporting & recommendation", manual: "3–4 hrs / cycle", ai: "1 hr / cycle", saved: "~70%", note: "PMM checks sample size before acting on any recommendation." },
];

const GOVERNANCE = [
  { icon: FileText, title: "Source traceability", desc: "Every reported pain point must trace to at least one verbatim quote. No synthetic or inferred quotes, ever." },
  { icon: AlertTriangle, title: "Sample-size flag", desc: "Findings drawn from fewer than 3–5 sources are hard-labeled \"directional\" and cannot promote to a positioning input." },
  { icon: ShieldCheck, title: "Claims accuracy", desc: "No positioning or messaging claim ships without a PMM checking it against actual, current product capability." },
  { icon: CheckCircle2, title: "Brand & legal review", desc: "All Content Agent output passes a brand-voice and legal/compliance pass before it reaches design or publish." },
  { icon: Users, title: "Competitive accuracy", desc: "Sales Enablement comparisons are checked against current competitor reality, not stale intel from a prior quarter." },
  { icon: Target, title: "Bias check", desc: "ICP and persona drafts are reviewed for demographic assumption bias — not just firmographic pattern-matching." },
  { icon: Layers, title: "Human gate at every handoff", desc: "No stage auto-publishes to the next agent. A PMM approves before research becomes messaging, and messaging becomes content." },
  { icon: Terminal, title: "Prompt & output versioning", desc: "Prompts and their outputs are logged per cycle, so any claim in market can be traced back to its source prompt and data." },
];

const STACK = [
  { stage: "Research Agent", ai: "Claude — synthesis & clustering", human: "Fireflies / Otter.ai, Notion / Airtable", why: "Turns unstructured qual data into a queryable pain-point database." },
  { stage: "Messaging Agent", ai: "Claude — framework-guided drafting", human: "Google Docs, competitive intel tracker", why: "Speeds first-draft positioning while the framework keeps it structured." },
  { stage: "Content Agent", ai: "Claude — copy drafting", human: "Figma / Canva, brand style guide", why: "Drafts scale across formats; design and brand review stay human." },
  { stage: "Sales Enablement Agent", ai: "Claude — objection mining & rebuttal drafts", human: "Gong / Chorus, CRM", why: "Mines real objections from real calls instead of guessed ones." },
  { stage: "Analytics Agent", ai: "Claude — narrative synthesis of metrics", human: "GA4 / HubSpot / Mixpanel, BI dashboard", why: "Turns raw dashboards into ranked, confidence-scored recommendations." },
];

const COLOR_MAP = {
  accent: { text: "text-accent", bg: "bg-accent-soft", dot: "dot-accent", border: "border-accent" },
  violet: { text: "text-violet", bg: "bg-violet-soft", dot: "dot-violet", border: "border-violet" },
  amber: { text: "text-amber", bg: "bg-amber-soft", dot: "dot-amber", border: "border-amber" },
  rose: { text: "text-rose", bg: "bg-rose-soft", dot: "dot-rose", border: "border-rose" },
};

/* ---------------------------------------------------------
   SMALL PRIMITIVES
--------------------------------------------------------- */

function Eyebrow({ children }) {
  return (
    <div className="font-mono text-xs tracking-widest uppercase text-accent mb-3 flex items-center gap-2">
      <span className="w-4 h-px bg-accent inline-block" />
      {children}
    </div>
  );
}

function PromptBlock({ children }) {
  return (
    <div className="rounded-lg border border-hair bg-panel3 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-hair">
        <span className="w-2.5 h-2.5 rounded-full dot-rose" />
        <span className="w-2.5 h-2.5 rounded-full dot-amber" />
        <span className="w-2.5 h-2.5 rounded-full dot-accent" />
        <span className="font-mono text-[11px] text-faint ml-2">prompt.txt</span>
      </div>
      <pre className="font-mono text-[12px] leading-relaxed text-dim px-4 py-4 overflow-x-auto whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-hair bg-panel p-6 md:p-7 ${className}`}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   SECTIONS
--------------------------------------------------------- */

function Overview({ go }) {
  return (
    <div className="space-y-14">
      <div>
        <Eyebrow>AI-Native Product Marketing Engine</Eyebrow>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.08] text-text max-w-3xl">
          A working operating system for PMM in the AI era —
          <span className="text-accent"> not a prompt library.</span>
        </h1>
        <p className="text-dim text-base md:text-lg leading-relaxed max-w-2xl mt-5">
          This project documents how five specialized AI agents — Research, Messaging, Content,
          Sales Enablement, and Analytics — turn raw customer signal into shipped, governed
          go-to-market assets. Every stage has a defined input, output, prompt, and a human
          checkpoint. Nothing publishes itself.
        </p>

        <div className="rounded-lg border border-hair bg-panel px-5 py-4 max-w-2xl mt-6">
          <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">In short</div>
          <p className="text-sm text-dim leading-relaxed">
            AI drafts the research, positioning, messaging, and content. A PMM reviews and
            approves every handoff between stages — the mechanism for that is below, and it's
            enforced in the prompts, not left to a human catching it later.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <button
            onClick={() => go("pipeline")}
            className="inline-flex items-center gap-2 rounded-lg bg-accent text-bg font-medium text-sm px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            Walk the pipeline <ArrowRight size={16} />
          </button>
          <button
            onClick={() => go("agents")}
            className="inline-flex items-center gap-2 rounded-lg border border-hair text-text font-medium text-sm px-5 py-2.5 hover:border-accent transition-colors"
          >
            See agent architecture
          </button>
        </div>
      </div>

      {/* problems this solves */}
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-faint mb-5">
          Basic PMM problems, and the mechanism that closes each one
        </div>
        <div className="space-y-3">
          {PROBLEMS.map((p) => (
            <div key={p.problem} className="rounded-lg border border-hair bg-panel px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
                <p className="text-sm text-text font-medium leading-relaxed max-w-xl">{p.problem}</p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-faint bg-panel2 rounded px-2 py-1 whitespace-nowrap">
                  {p.agent}
                </span>
              </div>
              <p className="text-sm text-dim leading-relaxed mt-2">{p.mechanism}</p>
            </div>
          ))}
        </div>
      </div>

      {/* signature: pipeline strip */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">
            9-stage cycle · research to optimization
          </span>
          <button onClick={() => go("pipeline")} className="text-xs text-accent font-mono flex items-center gap-1 hover:underline">
            full detail <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-stretch gap-2 md:gap-0 md:overflow-x-auto pb-2 -mx-1 px-1">
          {PIPELINE.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="md:flex-shrink-0 w-full md:w-44 rounded-lg border border-hair bg-panel px-4 py-3.5 md:py-4">
                <div className="font-mono text-[11px] text-accent mb-1.5 md:mb-2">{s.n}</div>
                <div className="text-sm font-medium text-text leading-snug">{s.title}</div>
                <div className="text-[11px] text-faint mt-1.5 md:mt-2 font-mono">{s.agent}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="flex-shrink-0 h-5 md:h-auto md:w-6 flex items-center justify-center">
                  <ArrowDown size={14} className="text-faint md:hidden" />
                  <ArrowRight size={14} className="text-faint hidden md:block" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Panel>
          <Layers size={18} className="text-accent mb-3" />
          <div className="font-display text-lg font-semibold mb-1.5">5 specialized agents</div>
          <p className="text-sm text-dim leading-relaxed">Each with a narrow mandate, a defined prompt contract, and a named human checkpoint — not one general-purpose assistant doing everything.</p>
        </Panel>
        <Panel>
          <ShieldCheck size={18} className="text-amber mb-3" />
          <div className="font-display text-lg font-semibold mb-1.5">Governance by design</div>
          <p className="text-sm text-dim leading-relaxed">Source traceability, sample-size flags, and claims review are built into the prompts themselves — not bolted on after the fact.</p>
        </Panel>
        <Panel>
          <Code2 size={18} className="text-violet mb-3" />
          <div className="font-display text-lg font-semibold mb-1.5">Built by a Technical PMM</div>
          <p className="text-sm text-dim leading-relaxed">Frontend engineering background applied to GTM: this interface is itself the deliverable, hand-built in React and Tailwind.</p>
        </Panel>
      </div>
    </div>
  );
}

function PipelineSection() {
  return (
    <div>
      <Eyebrow>01 — The Pipeline</Eyebrow>
      <h2 className="font-display text-3xl font-semibold mb-3">Customer signal to shipped optimization</h2>
      <p className="text-dim max-w-2xl leading-relaxed mb-10">
        The cycle is linear until stage 09, where low-confidence findings loop back to the
        Research Agent instead of being acted on. Every arrow below represents an approval
        gate, not an automatic handoff.
      </p>
      <div className="relative pl-8 md:pl-10">
        <div className="absolute left-[11px] md:left-[13px] top-2 bottom-2 w-px bg-hair" />
        <div className="space-y-8">
          {PIPELINE.map((s) => (
            <div key={s.n} className="relative">
              <div
                className={`absolute -left-8 md:-left-10 top-0.5 w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center font-mono text-[10px] ${
                  s.kind === "loop" ? "border-amber text-amber bg-bg" : s.kind === "input" ? "border-faint text-faint bg-bg" : "border-accent text-accent bg-bg"
                }`}
              >
                •
              </div>
              <div className="rounded-xl border border-hair bg-panel px-5 py-4 md:px-6 md:py-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                  <span className="font-mono text-xs text-faint">{s.n}</span>
                  <h3 className="font-display text-lg font-semibold text-text">{s.title}</h3>
                  <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${s.kind === "loop" ? "bg-amber-soft text-amber" : s.kind === "input" ? "bg-panel2 text-faint" : "bg-accent-soft text-accent"}`}>
                    {s.agent}
                  </span>
                </div>
                <p className="text-sm text-dim leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentsSection() {
  const [open, setOpen] = useState("research");
  return (
    <div>
      <Eyebrow>02 — Agent Architecture</Eyebrow>
      <h2 className="font-display text-3xl font-semibold mb-3">Five agents, five contracts</h2>
      <p className="text-dim max-w-2xl leading-relaxed mb-10">
        Each agent has a narrow mandate on purpose. A single mega-prompt trying to research,
        position, write, and report at once is where quality — and accountability — breaks down.
      </p>
      <div className="space-y-4">
        {AGENTS.map((a) => {
          const c = COLOR_MAP[a.color];
          const isOpen = open === a.id;
          const Icon = a.icon;
          return (
            <div key={a.id} className="rounded-xl border border-hair bg-panel overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : a.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold text-text">{a.name}</div>
                    <div className="text-sm text-dim mt-0.5 max-w-xl">{a.mandate}</div>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-faint flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-5 md:px-6 pb-6 border-t border-hair pt-6 space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">AI tools used</div>
                      <ul className="space-y-1.5">
                        {a.tools.map((t) => (
                          <li key={t} className="text-sm text-dim flex gap-2">
                            <span className={`mt-1.5 w-1 h-1 rounded-full ${c.dot} flex-shrink-0`} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">Inputs</div>
                      <ul className="space-y-1.5">
                        {a.inputs.map((t) => (
                          <li key={t} className="text-sm text-dim flex gap-2">
                            <ChevronRight size={13} className="text-faint mt-0.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">Outputs</div>
                      <ul className="space-y-1.5">
                        {a.outputs.map((t) => (
                          <li key={t} className="text-sm text-dim flex gap-2">
                            <ChevronRight size={13} className="text-faint mt-0.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">Example prompt</div>
                    <PromptBlock>{a.prompt}</PromptBlock>
                  </div>

                  <div className={`rounded-lg border ${c.border} border-opacity-30 ${c.bg} px-4 py-3.5 flex gap-3`}>
                    <ShieldCheck size={16} className={`${c.text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <div className={`text-xs font-mono uppercase tracking-widest ${c.text} mb-1`}>Human checkpoint — requires PMM judgment</div>
                      <p className="text-sm text-text leading-relaxed">{a.checkpoint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutputsSection() {
  return (
    <div>
      <Eyebrow>03 — Example Outputs</Eyebrow>
      <h2 className="font-display text-3xl font-semibold mb-3">What comes out the other end</h2>
      <p className="text-dim max-w-2xl leading-relaxed mb-3">
        Illustrative example for a fictional product, "DeployPilot" (a CI/CD reliability tool for
        platform teams), built to demonstrate the pipeline end-to-end.
      </p>
      <div className="inline-flex items-center gap-2 text-[11px] font-mono text-amber bg-amber-soft rounded px-3 py-1.5 mb-10">
        <AlertTriangle size={12} /> Fictional demo data — not a real client or real research findings.
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {OUTPUTS.map((o) => (
          <Panel key={o.title}>
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">{o.tag}</div>
            <div className="font-display text-base font-semibold text-text mb-3">{o.title}</div>
            {o.format === "mono" && (
              <pre className="font-mono text-[12px] leading-relaxed text-dim bg-panel3 border border-hair rounded-lg p-4 overflow-x-auto whitespace-pre">
                {o.content}
              </pre>
            )}
            {o.format === "prose" && (
              <p className="text-sm text-dim leading-relaxed whitespace-pre-line">{o.content}</p>
            )}
            {o.format === "list" && (
              <ul className="space-y-2.5">
                {o.content.map((line) => (
                  <li key={line} className="text-sm text-dim leading-relaxed flex gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full dot-accent flex-shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

function MetricsSection() {
  return (
    <div>
      <Eyebrow>04 — Impact & Metrics</Eyebrow>
      <h2 className="font-display text-3xl font-semibold mb-3">Where the time actually goes back</h2>
      <p className="text-dim max-w-2xl leading-relaxed mb-3">
        First-draft creation time drops sharply. Review, judgment, and stakeholder alignment
        time is preserved on purpose — that's where a PMM's value sits, not in typing speed.
      </p>
      <div className="inline-flex items-center gap-2 text-[11px] font-mono text-amber bg-amber-soft rounded px-3 py-1.5 mb-8">
        <AlertTriangle size={12} /> Illustrative estimates based on typical mid-market B2B PMM cycle times — not a benchmarked or audited study. [SOURCE: directional estimate, not verified]
      </div>

      <div className="space-y-3">
        {METRICS.map((m) => (
          <div key={m.stage} className="rounded-lg border border-hair bg-panel px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <div className="font-medium text-text text-sm">{m.stage}</div>
              <div className="flex items-center gap-4 font-mono text-sm whitespace-nowrap">
                <span className="text-dim">{m.manual}</span>
                <ArrowRight size={13} className="text-faint" />
                <span className="text-accent">{m.ai}</span>
                <span className="text-amber text-xs bg-amber-soft rounded px-2 py-0.5">{m.saved} saved</span>
              </div>
            </div>
            <p className="text-xs text-faint mt-2 leading-relaxed max-w-lg">{m.note}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mt-8">
        <Panel>
          <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">Full cycle, manual</div>
          <div className="font-display text-3xl font-semibold text-text">31–38 hrs</div>
        </Panel>
        <Panel>
          <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">Full cycle, AI-assisted</div>
          <div className="font-display text-3xl font-semibold text-accent">8–9.5 hrs</div>
        </Panel>
        <Panel>
          <div className="font-mono text-[11px] uppercase tracking-widest text-faint mb-2">Drafting time reduced</div>
          <div className="font-display text-3xl font-semibold text-amber">~70–75%</div>
        </Panel>
      </div>
    </div>
  );
}

function GovernanceSection() {
  return (
    <div>
      <Eyebrow>05 — Governance</Eyebrow>
      <h2 className="font-display text-3xl font-semibold mb-3">Speed without a governance layer isn't an asset</h2>
      <p className="text-dim max-w-2xl leading-relaxed mb-10">
        Every agent's prompt in this system was written with these checks in mind — not added
        as a review step afterward. The checks below are what a PMM is actually accountable
        for when a machine drafts the first version of everything.
      </p>
      <div className="grid md:grid-cols-2 gap-5">
        {GOVERNANCE.map((g) => {
          const Icon = g.icon;
          return (
            <Panel key={g.title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-accent" />
              </div>
              <div>
                <div className="font-display text-base font-semibold text-text mb-1">{g.title}</div>
                <p className="text-sm text-dim leading-relaxed">{g.desc}</p>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function StackSection() {
  return (
    <div>
      <Eyebrow>06 — Tech Stack</Eyebrow>
      <h2 className="font-display text-3xl font-semibold mb-3">The stack behind each agent</h2>
      <p className="text-dim max-w-2xl leading-relaxed mb-3">
        Tool names are illustrative — swap in your team's actual stack. The architecture, agent
        boundaries, and governance gates are the reusable part, not the vendor.
      </p>
      <div className="space-y-3 mt-8">
        {STACK.map((s) => (
          <div key={s.stage} className="rounded-lg border border-hair bg-panel px-5 py-4">
            <div className="font-display font-semibold text-text text-sm mb-2">{s.stage}</div>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm mb-2">
              <span className="text-accent">{s.ai}</span>
              <span className="text-dim">{s.human}</span>
            </div>
            <p className="text-xs text-faint leading-relaxed">{s.why}</p>
          </div>
        ))}
      </div>

      <Panel className="mt-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-soft flex items-center justify-center flex-shrink-0">
            <Code2 size={18} className="text-violet" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-text mb-2">Why a former frontend developer built this</div>
            <p className="text-sm text-dim leading-relaxed">
              This page is the artifact, not a slide about the artifact — built in React and
              Tailwind by a Technical PMM at ValueGate Consulting (Nigeria / Remote). The same
              engineering fluency used to prototype this interface is what makes it possible to
              actually evaluate an AI tool's integration, not just its output: reading a prompt
              contract the way you'd read an API contract, and treating governance as something
              you architect, not something you review at the end.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT
--------------------------------------------------------- */

export default function AIPMMEngine() {
  const [active, setActive] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  const go = (id) => {
    setActive(id);
    setMobileNavOpen(false);
  };

  const renderSection = () => {
    switch (active) {
      case "overview":
        return <Overview go={go} />;
      case "pipeline":
        return <PipelineSection />;
      case "agents":
        return <AgentsSection />;
      case "outputs":
        return <OutputsSection />;
      case "metrics":
        return <MetricsSection />;
      case "governance":
        return <GovernanceSection />;
      case "stack":
        return <StackSection />;
      default:
        return null;
    }
  };

  return (
    <div className="pmm-engine min-h-screen w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .pmm-engine {
          --bg:#0B1220;
          --panel:#121B2E;
          --panel-2:#16213A;
          --panel-3:#0E1626;
          --border:#243150;
          --text:#E7ECF6;
          --dim:#96A3C4;
          --faint:#5B6A8C;
          --accent:#5EEAD4;
          --accent-soft: rgba(94,234,212,0.10);
          --amber:#F2B84B;
          --amber-soft: rgba(242,184,75,0.10);
          --violet:#C4B5FD;
          --violet-soft: rgba(196,181,253,0.10);
          --rose:#FB7185;
          --rose-soft: rgba(251,113,133,0.10);
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
        }
        .pmm-engine .font-display { font-family: 'Space Grotesk', sans-serif; }
        .pmm-engine .font-mono { font-family: 'JetBrains Mono', monospace; }
        .pmm-engine .bg-bg { background: var(--bg); }
        .pmm-engine .bg-panel { background: var(--panel); }
        .pmm-engine .bg-panel2 { background: var(--panel-2); }
        .pmm-engine .bg-panel3 { background: var(--panel-3); }
        .pmm-engine .bg-panel-alt { background: rgba(255,255,255,0.012); }
        .pmm-engine .border-hair { border-color: var(--border); }
        .pmm-engine .text-text { color: var(--text); }
        .pmm-engine .text-dim { color: var(--dim); }
        .pmm-engine .text-faint { color: var(--faint); }
        .pmm-engine .text-accent { color: var(--accent); }
        .pmm-engine .text-amber { color: var(--amber); }
        .pmm-engine .text-violet { color: var(--violet); }
        .pmm-engine .text-rose { color: var(--rose); }
        .pmm-engine .bg-accent { background: var(--accent); }
        .pmm-engine .bg-accent-soft { background: var(--accent-soft); }
        .pmm-engine .bg-amber-soft { background: var(--amber-soft); }
        .pmm-engine .bg-violet-soft { background: var(--violet-soft); }
        .pmm-engine .bg-rose-soft { background: var(--rose-soft); }
        .pmm-engine .border-accent { border-color: var(--accent); }
        .pmm-engine .border-amber { border-color: var(--amber); }
        .pmm-engine .border-violet { border-color: var(--violet); }
        .pmm-engine .border-rose { border-color: var(--rose); }
        .pmm-engine .dot-accent { background: var(--accent); }
        .pmm-engine .dot-amber { background: var(--amber); }
        .pmm-engine .dot-violet { background: var(--violet); }
        .pmm-engine .dot-rose { background: var(--rose); }
        .pmm-engine ::selection { background: var(--accent); color: var(--bg); }
        .pmm-engine table { border-collapse: collapse; }
        .pmm-engine tr + tr td { border-top: 1px solid var(--border); }
      `}</style>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-hair sticky top-0 bg-bg z-20">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="font-display text-sm font-semibold">AI PMM Engine</span>
          </div>
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="text-text">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="lg:hidden border-b border-hair px-3 py-3 flex flex-col gap-1 bg-bg">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm ${
                  active === s.id ? "bg-panel text-accent" : "text-dim"
                }`}
              >
                <span className="font-mono text-[11px] text-faint">{s.num}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 border-r border-hair px-6 py-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-accent" />
            <span className="font-display text-base font-semibold">AI PMM Engine</span>
          </div>
          <div className="text-[11px] font-mono text-faint mb-10">v1.0 · Technical PMM portfolio</div>
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                  active === s.id ? "bg-panel text-accent" : "text-dim hover:text-text"
                }`}
              >
                <span className="font-mono text-[11px] text-faint">{s.num}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-8 border-t border-hair">
            <div className="text-xs text-faint leading-relaxed">
              Technical PMM<br />ValueGate Consulting<br />Nigeria / Remote
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-5 py-10 md:px-12 md:py-14 max-w-5xl">
          {renderSection()}

          <div className="flex items-center justify-between mt-16 pt-6 border-t border-hair">
            {activeIndex > 0 ? (
              <button
                onClick={() => go(SECTIONS[activeIndex - 1].id)}
                className="inline-flex items-center gap-2 text-sm text-dim hover:text-text transition-colors"
              >
                <ArrowLeft size={15} /> {SECTIONS[activeIndex - 1].label}
              </button>
            ) : (
              <span />
            )}
            {activeIndex < SECTIONS.length - 1 && (
              <button
                onClick={() => go(SECTIONS[activeIndex + 1].id)}
                className="inline-flex items-center gap-2 text-sm text-accent hover:opacity-80 transition-opacity"
              >
                {SECTIONS[activeIndex + 1].label} <ArrowRight size={15} />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
