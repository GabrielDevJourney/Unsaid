# Unsaid — Go-To-Market Plan

> Minimal viable GTM. No growth hacks. Ship → get real users → learn → iterate.

**Last updated:** February 2026

---

## Phases

### Phase 1: Ship v1 (Now → v1 live)

Focus 100% on finishing the UI. No content, no distribution yet.
Remaining pages before v1 is shippable:

| Page | Status |
|------|--------|
| Entry editor (`/entries/new`, `/entries/[id]`) | In progress |
| Patterns page (Tier 2) | Not started |
| Progress page (Tier 3) | Not started |
| Settings + Feedback UI | Not started |
| Onboarding flow | Not started |
| Landing page (Cathy / Framer) | Cathy's responsibility |

**Definition of done for v1:** A stranger can sign up, write their first entry, get an insight, and come back the next day without breaking.

---

### Phase 2: First Users (v1 live → 50 real users)

**Goal:** 50 real people who didn't know you before using Unsaid consistently.

**Day 1 (v1 ships):**
- Record a 3-minute Loom: what Unsaid is, show the real product, explain why you built it. Raw is fine. Not a trailer — a founder talking honestly.
- Post to r/SideProject: title "I shipped a journaling app that tells you the truth about yourself — here's what I learned building it." Link the Loom. Tell the story, not the pitch.

**Week 1:**
- Post to r/Journaling: different angle. Focus on the problem ("I kept writing the same things in my journal and nothing changed"). Not "check out my app."
- Post to r/selfimprovement: same honest framing.

**Rules for Reddit:**
- Never lead with "I built X." Lead with the problem or story.
- Reply to every comment. Every one.
- Don't cross-post the same copy to multiple subs.

**Week 2:**
- Write one technical post: 400 words on one interesting decision you made building Unsaid. Ideas:
  - "Why I encrypt journal entries at rest (and how)"
  - "How I built a 3-tier AI pipeline for $0.75/user/month"
  - "The tradeoff I made choosing Supabase's RLS over manual user_id checks"
- Post on X (Twitter) and LinkedIn. These get read by the people at the companies you want to work at.

---

### Phase 3: Product Hunt (50 users → validated retention)

**Do not launch on Product Hunt until:**
- [ ] You have 50+ users who came back at least once after signup
- [ ] At least 5 have given you qualitative feedback ("this feels different")
- [ ] You have a proper landing page (Cathy's Framer build)
- [ ] You have a short video of the product in action

**When you launch:**
- Have 15-20 people ready to upvote in the first hour (friends, family, anyone genuine)
- Reply to every comment on PH
- Announce via email to your existing users (they're your best advocates)
- Subject line: "We just launched on Product Hunt — would mean a lot if you voted"

---

## Build in Public Structure

Not every post is equal. You have three types of content:

| Type | About | Platform | Cadence |
|------|-------|----------|---------|
| **Product story** | What you built, decisions, behind-the-scenes | X, LinkedIn | Weekly |
| **Technical** | How something works, a specific decision, a trade-off | Dev.to, Hashnode, LinkedIn | Every 2 weeks |
| **Community** | Answering questions, being genuinely helpful in journaling/dev spaces | Reddit, X | Ongoing |

**Starting template for the first X/LinkedIn post:**
> "6 months ago I started building Unsaid — a journaling app that doesn't let you bullshit yourself.
> This week I shipped [X]. Here's the one thing I got wrong and what I changed."

Build a simple thread cadence: every Sunday, write one tweet/post summarizing what shipped that week. Even if small. Consistency > volume.

---

## What Not To Do

- Don't post without a working product to link to
- Don't launch Product Hunt until you have retention data
- Don't spend money on ads before you have a retention signal
- Don't create TikToks/Reels about productivity while v1 is unfinished
- Don't post the same content on all channels the same day

---

## Key Links

- Product: [byunsaid.com](https://byunsaid.com)
- Reddit targets: r/SideProject, r/Journaling, r/selfimprovement, r/buildinpublic
- Technical blog: TBD (Dev.to or personal Hashnode)
- Product Hunt: plan for when retention is proven
