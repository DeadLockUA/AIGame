# AIGame

**A game designed, built, tested, and evolved entirely by AI agents.**

AIGame is an experiment in fully autonomous game development. Humans set the starting conditions and the guardrails. Everything after that is produced by AI agents, with no hand-written game code: the concept, design documents, code, art, audio, levels, balancing, testing, and release notes.

> Status: 🌱 **Day 0.** The repository has just been created. Nothing has been generated yet.

---

## Goals

- **Full autonomy.** AI agents own the whole lifecycle: ideation → design → implementation → testing → iteration → release.
- **Playable output.** The goal is a game people can actually play and enjoy, not a tech demo.
- **Transparent process.** Every decision, plan, and change is recorded in the repo so anyone can follow how the game evolved.
- **Self-improvement.** Agents playtest their own builds, collect feedback, and plan the next iteration.

## Non-goals

- Humans writing gameplay code or hand-drawing assets.
- Picking a genre in advance. The agents choose and justify it.

---

## How it works (planned)

```
┌────────────┐   ┌────────────┐   ┌──────────────┐   ┌────────────┐
│  Designer  │──▶│  Planner   │──▶│  Developer   │──▶│   Tester   │
│ concept,   │   │ milestones,│   │ code, assets,│   │ playtests, │
│ GDD, rules │   │ tasks      │   │ levels       │   │ bug reports│
└────────────┘   └────────────┘   └──────────────┘   └─────┬──────┘
      ▲                                                    │
      └──────────────── feedback & next iteration ◀────────┘
```

| Role | Responsibility |
|------|----------------|
| **Designer** | Comes up with the game concept and maintains the Game Design Document (GDD). |
| **Planner** | Breaks the design into milestones and small, verifiable tasks. |
| **Developer** | Implements features, generates assets, and writes tests. |
| **Tester** | Runs the build, plays it automatically, and reports bugs and balance issues. |
| **Reviewer** | Reviews changes for quality and consistency before they are merged. |

The roles, tools, and orchestration will themselves be defined and refined by the agents as the project grows.

---

## Human involvement

Humans only:

1. Define the initial constraints and guardrails (budget, platform, content policy).
2. Provide infrastructure (repository, compute, API keys).
3. Watch, and step in only if something breaks the guardrails.

Every human intervention is logged so the level of autonomy stays measurable.

---

## Repository layout (planned)

```
AIGame/
├── docs/          # Game design document, decisions (ADRs), iteration logs
├── game/          # Game source code
├── assets/        # Generated art, audio, and other resources
├── agents/        # Agent definitions, prompts, and orchestration
├── tests/         # Automated and AI-driven playtests
└── README.md
```

---

## Roadmap

- [ ] Define guardrails and the agent setup
- [ ] Agents pick the genre, platform, and tech stack
- [ ] First Game Design Document
- [ ] First playable prototype
- [ ] Automated playtesting loop
- [ ] Public playable build

---

## Getting started

There is nothing to run yet. Setup and run instructions will appear here once the agents have chosen a tech stack and produced a first build.

## Contributing

This project is AI-driven by design. Ideas, observations, and bug reports are welcome as issues, and the agents may pick them up as input for future iterations.

## License

To be decided.
