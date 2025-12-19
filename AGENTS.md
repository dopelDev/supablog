# AGENTS.md

## Purpose

<Concise statement of what this project does and who it serves.>
<Why this repository exists and what outcome it enables.>

<This repository uses AI assistance to help analyze changes and perform>
<explicitly requested actions in a controlled and human-readable way.>

Help me to develment faster

---

## Project Summary (Human & Agent Context)

This project serves as an introduction to using Supabase and as a starting point to practice and improve my web design.

<This section provides high-level context for both humans and agents.>
<It should be updated occasionally by humans or via a reporting workflow.>

### Overview

- Project type: Simple blog using Supabase and Vite
- Primary stack:
  - Backend: Supabase <tech>
  - Frontend: Vue + Vite + NuxtJS <tech>
  - Environment: Docker Compose

- Intended users: Author aka Admin <!-- who use this system-->

### Key Areas

<Areas>
- <Area 1:> Supabase BaaS 
- <Area 2:> Vue + Vite + NuxtJS
- <Area 3:> Docker Compose Environment

### Operational Notes

- How the project is typically run or built
- Important constraints or assumptions
- Links to key docs (README, architecture notes, etc.)

### Current State

<!-- Known risks or limitations (high level) -->
<!-- Open questions -->

- Maturity: prototype

---

## Global Rules (Apply to ALL agents)

- Do NOT assume intent
- Run a Workflow ONLY when explicitly requested
- Workflow execution ALWAYS requires explicit user confirmation
- If no Workflow is invoked: analysis and discussion only
- Avoid side effects unless confirmed
- Prefer analysis before modification
- No large refactors unless explicitly approved
- If context is missing, stop and ask
- Separate facts from recommendations clearly

---

## Workflows

Workflows are **optional, on-demand tasks**.
They never run automatically.

Before executing ANY Workflow, the agent MUST:

1. Restate the workflow name
2. Summarize what will happen (side effects)
3. Ask for explicit confirmation

Execution MUST NOT proceed without clear confirmation
(e.g. “Proceed”, “Yes, run it”, “Approved”).

---

### Scope Limits

- Agents must NOT invent new workflows
- Agents must NOT run workflows implicitly
- Agents must NOT generate commit messages outside the canonical format

---

### Workflow: CreateCommit

#### Goal

Create a single, high-quality Git commit using a **consistent, readable,
and structured commit message format**.

---

#### Invocation

Run only when explicitly requested and confirmed.

Example requests:

- “Run the CreateCommit workflow”
- “Commit the current changes”
- “Use CreateCommit to create a commit”

---

#### Steps

1. **Review changes**
   - `git status`
   - `git diff --name-status`
   - `git diff`
   - `git log -1 --pretty=medium`

2. **Stage intended changes**
   - Default: `git add .`
   - If unexpected files appear, stop and ask what to include

3. **Create commit**
   - Draft the commit message using the **canonical format** below
   - Create exactly one commit:
     - `git commit` (editor-based commit preferred)

---

#### Canonical Commit Message Format (MANDATORY)

All commits created by this workflow MUST follow this format exactly.

```
<Commit Title>

Summary:

- bullet

- bullet

File changes:

- file/path: short description

- file/path: short description

Implications:

- Security: none | low | medium | high

- Ops: none | low | medium | high

- Compatibility: none | low | medium | high

- User-facing: none | low | medium | high

Verification:

- how this was verified, or “Not run (reason)”

Follow-ups:

- optional, or “None”

```

#### Formatting Rules

- The title must be imperative and specific
- Use real line breaks (no escaped `\n`)
- Section headers MUST be present even if values are “None”
- Bullets MUST be hyphen-prefixed (`-`)
- The message MUST be readable in `git log` without extra flags

---

#### Commit Safety Rules

- Exactly ONE commit per execution
- Do NOT rewrite history:
  - no `--amend`
  - no `rebase`
  - no `reset`
  - no `cherry-pick`
- Do NOT restage repeatedly
- If the working tree changes after staging, stop and ask

---

### Workflow: GenerateProjectReport

#### Goal

Generate a reusable, human-readable **Project Report** that summarizes the repository progressively (by parts), suitable as context for future agents and for a human reviewer. The workflow must detect whether a new report is needed by comparing the current repo fingerprint against the latest report.

#### Invocation (required)

Run only when explicitly requested **and** confirmed.

Example requests:

- “Run the GenerateProjectReport workflow”
- “Generate a project report for context”
- “Update the project report”

#### Confirmation rule (mandatory)

Before executing, the agent MUST:

1. Restate: “GenerateProjectReport”
2. State side effects: reads repo, creates/updates files under `docs/reports/project/`
3. Ask for confirmation and wait for a clear “Proceed/Approved/Yes”

---

#### Report Storage

- Reports root: `docs/reports/project/`
- Latest pointer: `docs/reports/project/LATEST.md`
- Index: `docs/reports/project/INDEX.md`
- Versioned report: `docs/reports/project/<YYYY-MM-DD>/<HH-MM-SS>.md`

---

#### Step 1: Locate the latest report (if any)

1. If `docs/reports/project/LATEST.md` exists, treat it as the latest report pointer.
2. Otherwise, find the most recent report under `docs/reports/project/*/*.md` by timestamp.
3. If no report exists, continue to Step 2 and generate the first one.

---

#### Step 2: Compute the current Repo Fingerprint

##### Purpose

decide whether a new report is needed.

Run:

- `git rev-parse HEAD` (if repo is Git; otherwise `HEAD: N/A`)
- `git status --porcelain=v1` (if Git; otherwise `STATUS: N/A`)
- Fingerprint (tracked content):
  - `git ls-files -z | xargs -0 sha1sum | sha1sum`

Interpretation rules:

- If `git status --porcelain=v1` is non-empty, mark **Working tree: dirty**
- If Git is unavailable, use a fallback fingerprint:
  - `find . -maxdepth 4 -type f ! -path "./.git/*" -print | sort | sha1sum`

---

#### Step 3: Extract the previous fingerprint (if a report exists)

From the latest report (if present), read the `Repo Fingerprint` section and extract:

- HEAD
- Working tree state
- Fingerprint hash

If the latest report does not contain a fingerprint, treat it as **unknown** and generate a new report.

---

#### Step 4: Mandatory Logical Decomposition

The agent MUST decompose the project into **logical areas**.

Rules:

- Areas MUST come from:
  - Project Summary
  - Repository structure
- Each area MUST be analyzed independently
- The agent MUST NOT produce a final summary yet

---

#### Step 5: Mandatory Area Analysis Passes (NON-OPTIONAL)

For EACH logical area, perform an **analysis pass**.

Each pass MUST include:

- Purpose: why this area exists
- Responsibilities: what it owns
- Key files: entry points only
- Design choices: why it is structured this way
- Constraints: assumptions or limits
- Trade-offs: what was favored over alternatives

⚠️ The workflow MUST NOT proceed until ALL areas have been analyzed.

---

#### Step 6: Synthesis (After All Areas)

Only after all area passes are complete, the agent may:

- Write a global Summary
- Identify cross-cutting concerns
- Derive risks and implications

---

##### 6.A Diagrams (MANDATORY)

###### Logical Diagram

- Purpose: describe how logical areas interact
- Rules:
  - Focus on responsibilities and data/control flow
  - Avoid file-level detail
- Format:
  - Mermaid preferred
  - ASCII fallback allowed

###### Structural Diagram

- Purpose: describe repository structure
- Rules:
  - Reflect directories and major files
  - Group by responsibility, not depth

---

##### 6.B Functional File Inventory (MANDATORY)

- List all relevant files grouped by functional responsibility
- Each group MUST explain why the files belong together

---

##### 6.C Analysis Recommendations (MANDATORY)

- Propose 2–5 areas for deeper analysis
- Each recommendation MUST include:
  - Area name
  - Reason
  - Risk or unknown

---

##### 6.D Deep-Dive Confirmation (MANDATORY)

Ask explicitly:

> “Do you want to run a deep analysis on any of these areas?”

Allowed answers:

- Yes + area(s)
- No
- Defer

---

##### 6.E Iterative Area Deep Analysis (OPTIONAL)

- Re-run the Area Analysis Pass for confirmed areas only
- No global summary rewrite
- No fingerprint recomputation

---

##### 6.F Fingerprint-Scoped Analysis Log (MANDATORY)

If deep analysis occurs:

- Write the Analysis Log entry to a new file (one file per entry); do not edit the existing Project Report
- Location: `docs/reports/project/logs/<YYYY-MM-DD>/<HH-MM-SS>--<area-slug>.md` (create directories as needed)
- The log MUST reference the same repo fingerprint as the triggering report
- Do NOT create a new Project Report

###### Analysis Log File Format

```
## Analysis Log — <YYYY-MM-DD HH:MM:SS>

Repo Fingerprint:
- <fingerprint from triggering report>
- Base report: <path to the Project Report this log is tied to>

Analyzed Area:
- <Area name>

Scope:
- Why this area was selected
- What was analyzed in this pass

Findings:
- Key observations specific to this area
- Important design decisions or patterns

Implications:
- Security: none | low | medium | high — <short justification>
- Ops: none | low | medium | high — <short justification>
- Compatibility: none | low | medium | high — <short justification>
- User-facing: none | low | medium | high — <short justification>

Notes:
- Constraints, open questions, or follow-up ideas

```

###### Rules

- Each Analysis Log lives in its own file; never append to or reorder existing logs
- Preserve existing log files; timestamps convey order
- Existing Project Report content MUST NOT be modified
- The analysis log MUST reference the same repo fingerprint as the triggering report
- No new fingerprint computation is allowed during this step

---

#### Step 7: Canonical Report Format (MANDATORY)

All Project Reports generated by this workflow MUST follow this format exactly.
The report is designed to be reusable as context for future agents and humans.

```
<Project Report Title>

Summary:

- High-level description of the project purpose
- What this report covers and why it exists

Repo Fingerprint:

- HEAD: <commit hash or N/A>
- Working tree: clean | dirty | N/A
- Fingerprint: <hash>
- Generated at: <YYYY-MM-DD HH:MM:SS TZ>

Project Map:

- <Area / Module 1>: brief description of its role in the project
- <Area / Module 2>: brief description of its role in the project
- <Area / Module 3>: brief description of its role in the project

Key Components:

- <Component 1>: responsibilities, entry points, important files
- <Component 2>: responsibilities, entry points, important files
- <Component 3>: responsibilities, entry points, important files

Operational Notes:

- How the project is built, run, or deployed (only what is observed)
- Relevant commands, configs, or runtime assumptions

Risks / Implications:

- Security: none | low | medium | high — <short justification>
- Ops: none | low | medium | high — <short justification>
- Compatibility: none | low | medium | high — <short justification>
- User-facing: none | low | medium | high — <short justification>

Verification:

- What was verified (commands run, files checked)
- What was NOT verified and why

Follow-ups:

- Open questions
- Gaps in understanding
- Suggested next steps
- Or: None
```

---

##### Formatting Rules

- Use real line breaks (no escaped `\n`)
- Keep ALL section headers present (use “None” if empty)
- Use hyphen-prefixed bullets (`-`)
- Avoid speculation; explicitly label unknowns
- The report must be readable as-is when pasted into another agent session

---

#### Step 8: Publish the Report (Versioning and Pointers)

1. Write the versioned report to:
   - `docs/reports/project/<YYYY-MM-DD>/<HH-MM-SS>.md`

2. Update the latest pointer:
   - `docs/reports/project/LATEST.md`
   - Contents must either:
     - include the full latest report, or
     - link clearly to the latest versioned report

3. Append an entry to the index:
   - `docs/reports/project/INDEX.md`
   - Each entry MUST include:
     - timestamp
     - report path
     - HEAD commit (or N/A)
     - fingerprint hash
     - 1–2 bullets summarizing what changed vs the previous report

---

## Anti-loop Rule (Stability Guarantee)

This workflow MUST NOT enter regeneration loops.

Rules:

- Reports generated by this workflow are allowed to modify
  `docs/reports/project/`
- Repository change detection (fingerprint comparison) MUST exclude
  `docs/reports/project/` from consideration
- The workflow MUST compute the fingerprint BEFORE writing a new report
- The fingerprint MUST NOT be recomputed after report generation
- A single execution may generate at most ONE report

If exclusion of `docs/reports/project/` is not technically possible in the
execution environment, the workflow MUST:

- compute the fingerprint once
- generate the report
- terminate without attempting further comparison or regeneration

---

## Minimum Insight Rule (ENFORCED)

A valid Project Report MUST include:

- ≥1 architectural observation
- ≥1 explicit design trade-off
- ≥1 limitation or risk derived from structure

Reports missing these are INVALID.

---
