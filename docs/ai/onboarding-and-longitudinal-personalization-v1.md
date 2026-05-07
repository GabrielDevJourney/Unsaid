# Onboarding And Longitudinal Personalization V1

## Purpose

This document defines the V1 approach for personalization across the Unsaid AI pipeline.

The goal is to improve personalization from day 1 and strengthen continuity over time without introducing a heavy persona subsystem.

In V1, onboarding creates the initial understanding of the user. Weekly insights and progress insights are the only longitudinal update loops. Persona is not a separate system yet. The value should show up in clearer, more personal, less repetitive output across the product.

## Core User Value

Users should feel:

- understood quickly after onboarding
- less generic repetition in entry insights
- better continuity across weekly and progress reflections
- visible product improvement rather than hidden infrastructure

## V1 Source Of Truth

V1 personalization should use a lightweight shared context assembled from:

- onboarding self-report as the initial seed
- weekly insights as repeated medium-term evidence
- progress insights as longer-horizon evidence about what is changing and what is not

This is enough for V1. We do not need a separate persona subsystem to create user value now.

Not in V1:

- persona tables
- versioned persona snapshots
- monthly recalibration jobs
- deep inferred taxonomy layers
- hidden response-control systems

## How It Affects Each AI Layer

### Tier 1: Entry Insight

Use onboarding and recent longitudinal context mainly to calibrate the response, reduce generic repetition, and make the insight feel more personally relevant.

### Tier 2: Weekly Insights

Use onboarding lightly to sharpen pattern framing, especially when repeated weekly evidence supports a clearer interpretation.

### Tier 3: Progress Insights

Use onboarding plus accumulated weekly and progress history to assess what is changing, what is not changing, and what matters most over time.

### Onboarding Preview

The onboarding preview should feel provisional and representative. It should preview future value without pretending the system already has a full long-term model of the user.

## Update Rules

- no daily persona rewrite
- only weekly and progress flows can materially update shared user context
- onboarding has the highest value early, while later repeated evidence can refine it
- fresh entry evidence still outranks stale assumptions

## Success Criteria

- new users feel personalized value immediately after onboarding
- repeat users feel continuity instead of generic loops
- outputs become more specific and less repetitive across tiers
- the system remains understandable and lightweight for engineering

## Out Of Scope

- new persona tables
- versioned persona snapshots
- broad persona taxonomy expansion
- hidden personality inference systems as a V1 requirement
