# Prompt Review: Anti-Looping And Better User Value

Status: Proposed review artifact for engineering and product alignment. Not implemented yet.

## Purpose

This document reviews the current `@prompts/tasks` setup through one specific product risk: Unsaid can start to feel like it is always handing the conversation back to the user with another question instead of occasionally landing the point cleanly.

The goal is not to make the system less thoughtful. The goal is to make it more useful over time.

This is a prompt-behavior review, not a schema, migration, or API proposal.

Relevant files:

- [prompts/tasks/entry.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/entry.md)
- [prompts/tasks/weekly.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/weekly.md)
- [prompts/tasks/progress.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/progress.md)
- [prompts/tasks/onboarding-preview.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/onboarding-preview.md)
- [prompts/system.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/system.md)
- [docs/ai/persona-layer-spec.md](/Users/a1/Gabriel/Unsaid/unsaid/docs/ai/persona-layer-spec.md)

## Problem Statement

The current prompt stack is heavily optimized for inquiry:

- Tier 1 hard-requires every entry insight to end with a reflective question.
- Tier 2 always includes both a `question` and a `suggested_experiment`.
- Tier 3 always includes both an `experiment` and a final `the_question`.
- onboarding preview also uses question-and-experiment framing.

Each one of these choices can be reasonable in isolation. Together, they create a system-level pattern where questioning becomes the default rhetorical move across too many layers.

The product risk is not that questions are bad. Strong questions are one of Unsaid's best tools.

The product risk is that the user may start by feeling deeply seen, but over time feel trapped in repeated self-inquiry on the same theme:

- the system keeps opening another loop
- the point does not always land
- the interaction can feel procedurally reflective instead of genuinely clarifying

The result is a specific kind of frustration: the output may still be intelligent, but it can start to feel like it is asking the user to keep doing more of the work rather than occasionally delivering a hard-earned conclusion.

## Current-State Review

### `prompts/tasks/entry.md`

Current behavior:

- requires a 2-4 sentence insight
- requires it to identify the primary tension or contradiction
- hard-requires that it **must** end with a powerful reflective question
- explicitly asks the next insight to go deeper than the previous one if a prior insight exists

Observed risk:

- the question ending is mandatory, even when a statement, reframe, or small experiment would be more useful
- regeneration or repeated entries on the same theme can feel like "another version of the same question"
- the prompt structurally rewards depth-sounding inquiry over landing the point

### `prompts/tasks/weekly.md`

Current behavior:

- every pattern card includes a `question`
- every pattern card includes a `suggested_experiment`

Observed risk:

- the question and experiment can become formulaic if they are not clearly distinct from the description
- weekly cards can start to sound like several mini coaching prompts rather than surfaced pattern evidence

### `prompts/tasks/progress.md`

Current behavior:

- every progress insight includes an `experiment`
- every progress insight includes `the_question`
- the narrative flow explicitly ends by surfacing a deeper blind spot question

Observed risk:

- when Tier 1 already questions heavily, Tier 3 can feel like another reflective turn instead of a real assessment
- the question can feel mechanically earned rather than insightfully earned if the report itself is not declarative enough

### `prompts/tasks/onboarding-preview.md`

Current behavior:

- the preview pattern includes a `question`
- the preview progress card includes an `experiment`

Observed risk:

- onboarding can start the user inside the same question-heavy interaction pattern before the long-term system has earned it
- the preview can feel like a compressed version of the full loop instead of a provisional taste of future value

### `prompts/system.md`

Current behavior:

- emphasizes pattern recognition, blind spots, and actionability
- still contains the principle: "When uncertain, ask clarifying questions rather than making assumptions"

Observed risk:

- the system-level philosophy is still biased toward questioning as a default recovery move
- this makes sense for uncertainty management, but can reinforce the broader interaction pattern if not bounded

## Design Principle Shift

The core recommendation is:

**Unsaid should optimize to land the point, not just keep the user reflecting.**

A strong question remains one valid tool. It is not the required ending of every useful output.

Clarity itself is often the intervention.

The revised principle set should be:

- sometimes the best response is a question
- sometimes the best response is a statement
- sometimes the best response is one concrete experiment
- sometimes the best response is a sharp reframe
- usefulness should outrank rhetorical symmetry

This is especially important for a product whose promise is not "we will keep you journaling forever," but "we will tell you what you are actually doing."

## Tier Role Redefinition

Each tier should feel different in function, not just different in input size.

### Tier 1: Immediate Insight

Primary role:

- identify the clearest tension, contradiction, or truth in the current entry

Desired user feeling:

- "That's exactly what was happening."

Tier 1 should not always end by asking for more.

Sometimes it should:

- land the observation
- clarify the contradiction
- offer one practical reframe
- offer one tiny next move
- ask a question only when it genuinely opens a new layer

### Tier 2: Weekly Patterns

Primary role:

- surface repeated evidence the user likely cannot see in isolated entries

Tier 2 should keep `question` and `suggested_experiment`, but both should become more clearly additive:

- the question should be specific to the pattern
- the experiment should test the pattern behaviorally
- neither should sound like generic continuation prompts

### Tier 3: Progress Insight

Primary role:

- state what is changing, what is not, and what gap matters most

Tier 3 should keep `experiment` and `the_question`, but the report itself should land more declaratively first.

The question should feel earned after the thesis, evidence, progress, and gap are already clear.

### Onboarding Preview

Primary role:

- preview the kind of value Unsaid can produce

It should feel:

- provisional
- representative
- early

It should not feel like the user has already entered a recurring interrogation loop.

## Recommended Tier 1 Interaction Modes

Tier 1 needs a concrete replacement for the current forced-question ending.

Recommended internal response modes:

- `name`
  End with a sharp statement that clarifies what is happening.
- `deepen`
  End with a question when it reveals a genuine blind spot or contradiction.
- `stabilize`
  End with grounded clarity when the entry suggests overload, confusion, or emotional strain.
- `nudge`
  End with one tiny experiment or next move when action is more useful than more inquiry.

These modes do not need to be user-facing schema fields. They are internal prompt logic.

### Tier 1 Decision Rules

Use `deepen` when:

- the entry contains a real contradiction
- a question would uncover something new
- the question is clearly stronger than a statement

Use `name` when:

- the user most needs the point landed
- the system already has enough evidence to say the thing plainly
- another question would feel repetitive

Use `stabilize` when:

- intensity is high
- the user appears overloaded
- more probing would likely feel unhelpful or performatively deep

Use `nudge` when:

- the user is circling a known pattern
- one tiny action would create more value than another question

## Anti-Looping Rules

The prompt system should explicitly guard against recursive reflection patterns.

Recommended rules:

- do not force a question if the previous insight already ended with a similar question
- do not ask a new question when the system has not materially advanced the user's understanding
- do not substitute "deeper sounding" language for better help
- do not let the same theme keep returning in slightly different wording
- if the strongest value is clarity, choose clarity
- if the strongest value is action, choose action
- if the strongest value is reflection, earn the question

Additional review heuristic:

- if a user read the current insight and the previous one side by side, the second should feel like a real step forward, not a rhetorical remix

## Brand Alignment

This shift is aligned with the existing brand voice, not opposed to it.

The brand already values:

- honesty over softness
- evidence over generic encouragement
- economy of language
- usefulness over performance

The brand supports strong questions when they sharpen the insight.
The brand is weakened when questioning becomes procedural.

A repeated user should feel:

- observed
- understood
- challenged when necessary
- helped forward

They should not feel like the system is mechanically extending the conversation because that is what the template expects.

The most important brand conclusion:

**Landing the point is more on-brand than asking a question out of habit.**

## Prompt-Level Recommendations By File

This section is intentionally implementation-adjacent, but still documentation-only.

### `prompts/tasks/entry.md`

Future prompt review target:

- remove the hard requirement that every insight must end with a question
- replace it with mixed-ending logic
- add anti-looping guidance tied to previous insight behavior
- preserve specificity and evidence-first openings

### `prompts/tasks/weekly.md`

Future prompt review target:

- keep the schema shape
- refine instructions so `question` and `suggested_experiment` are clearly distinct from the description
- discourage reflective filler disguised as experiments

### `prompts/tasks/progress.md`

Future prompt review target:

- keep the schema shape
- reinforce that the report should land its thesis before moving into experiment and question
- make the question the deepest point, not a repeated summary

### `prompts/tasks/onboarding-preview.md`

Future prompt review target:

- keep the preview structure
- reduce the feeling that the user is already entering a recurring interrogation loop
- make the preview feel provisional rather than repetitive

### `prompts/system.md`

Future prompt review target:

- add a principle that the best help is not always another question
- reinforce that clarity can itself be the intervention
- keep the existing evidence-first and non-clinical stance

### `docs/ai-pipeline-overview.md`

Future documentation review target:

- update prompt examples and tier descriptions so they do not encode the older "always end with a question" philosophy as if it were a permanent product rule

## Review Checklist

Use this checklist in future prompt revision work:

- Does Tier 1 still overuse questions?
- Does Tier 1 sometimes land the point without asking for more?
- Do weekly card questions add something distinct?
- Do weekly experiments test a hypothesis rather than just ask for reflection?
- Does progress insight feel more like a real assessment than a chain of prompts?
- Do outputs across tiers feel different in function?
- Would a repeat user feel guided rather than interrogated?
- Does the new behavior stay aligned with the brand voice?

## Important Constraints

This document does not propose:

- schema changes
- migration changes
- API changes
- product UI changes

It is a documentation-only artifact for engineering and product review.

Future implementation targets mentioned in this review:

- [prompts/tasks/entry.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/entry.md)
- [prompts/tasks/weekly.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/weekly.md)
- [prompts/tasks/progress.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/progress.md)
- [prompts/tasks/onboarding-preview.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/tasks/onboarding-preview.md)
- [prompts/system.md](/Users/a1/Gabriel/Unsaid/unsaid/prompts/system.md)
- [docs/ai-pipeline-overview.md](/Users/a1/Gabriel/Unsaid/unsaid/docs/ai-pipeline-overview.md)

## Recommended Test Scenarios For Future Implementation

When this review is eventually implemented, validate with:

- current vs revised Tier 1 outputs on the same entry
- repeated-entry scenarios where the user is stuck on the same theme
- overloaded entries where stabilization should beat deeper probing
- weekly cards for question/experiment distinctiveness
- progress outputs for stronger declarative clarity
- brand alignment checks: direct, specific, not clinical, not repetitive

## Closing Principle

The best version of Unsaid should not feel like it is always trying to keep the user talking.

It should feel like it knows when to:

- say the thing
- ask the question
- offer the move
- leave the insight standing on its own

That distinction is what turns a smart prompt system into a product that feels genuinely useful over time.

