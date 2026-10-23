# AI PMM Engine

**An AI-Native Product Marketing Operating System.**

A working interface documenting how five specialized AI agents — Research, Messaging,
Content, Sales Enablement, and Analytics — turn raw customer signal into shipped,
governed go-to-market assets. Every stage has a defined input, output, prompt, and
an explicit human checkpoint. Nothing publishes itself.

Built and maintained by a Technical PMM (ValueGate Consulting, Nigeria / Remote) as a
portfolio artifact — the interface itself is the deliverable, not a slide describing it.

## What's in it

- **Live Lab** — paste customer feedback and run it through the Research, Messaging, and
  Content agents with a human approval gate between stages. Guardrails are enforced in
  code: quotes must appear verbatim in the sources (otherwise the theme is blocked),
  themes under 3 sources are flagged "directional," headline/subhead word limits and
  unverified superlatives are checked, and every run produces an audit log and Markdown export.
- **The Pipeline** — the 9-stage cycle from customer interviews to AI-recommended
  optimization, including the loop-back from Analytics to Research on low-confidence
  findings.
- **Agent Architecture** — five agents, each with a narrow mandate, tool stack, example
  prompt, input/output contract, and a named human checkpoint.
- **Example Outputs** — illustrative outputs (pain-point clusters, positioning statement,
  messaging pillars, campaign copy, battlecard, optimization recommendation) for a
  fictional product used to demonstrate the pipeline end-to-end.
- **Impact & Metrics** — directional before/after time estimates per stage, clearly
  labeled as illustrative, not benchmarked.
- **Governance** — 8 checks (source traceability, sample-size flags, claims accuracy,
  brand/legal review, competitive accuracy, bias check, human gate at every handoff,
  prompt/output versioning) that are written into the agent prompts themselves.
- **Tech Stack** — example AI/human tool pairing per agent.

## Stack

React + Vite + Tailwind CSS + [lucide-react](https://lucide.dev/) icons.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
ai-pmm-engine/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx          # React entry point
    ├── App.jsx           # Renders AIPMMEngine
    ├── AIPMMEngine.jsx   # The full application (pipeline, agents, outputs, etc.)
    └── index.css         # Tailwind directives
```

## Notes on the Live Lab

The Lab calls the Claude API directly from the browser, which works inside Claude's
artifact preview but **will not work in this standalone repo without a backend proxy** —
never ship an API key in frontend code. Without API access it automatically falls back to
a local keyword heuristic and labels each result with the engine that produced it. To enable
Claude in your deployment, route `callClaude()` in `src/AIPMMEngine.jsx` through a small
server endpoint (e.g. a Vercel/Netlify function) that holds the key.

## Notes on the content

- The productivity numbers in **Impact & Metrics** are directional estimates based on
  typical mid-market B2B PMM cycle times — not a benchmarked or audited study. Swap in
  real before/after data if you have it.
- The example outputs use a fictional product ("DeployPilot") — no real client or
  research data is represented.
- Tool names in **Tech Stack** are illustrative; swap for your team's actual stack.

## License

MIT — see [LICENSE](./LICENSE).
