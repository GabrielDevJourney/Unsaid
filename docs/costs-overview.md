# Unsaid: Cost Overview & Economics

---

## AI Pipeline Cost Calculator

### **Base Assumptions**

- **Average user:** 28 entries/month (4x/week, ~350 words each)
- **Heavy user:** 90 entries/month (7 days/week, ~1,000 words each ~2,500 tokens)
- Costs based on actual prompt file sizes measured from code
- AI usage is hard-capped by tier design

### **Cost Formula Per User Per Month (Observed)**

```markdown
Average User AI Cost ≈ $0.52 / month
Heavy User AI Cost  ≈ $3.70 / month
Blended (80% Avg / 20% Heavy) ≈ $1.16 / month
```

**Flow breakdown (average user, 28 entries/month):**
```markdown
Flow 1 — Tier 1 Entry Insight:     28 × $0.0038  = $0.107
Flow 2 — Entry Theme prompts:      28 × $0.0032  = $0.090
Flow 3 — Tier 2 Weekly Insight:     4 × $0.033   = $0.132
Flow 4 — Tier 3 Progress Insight: 1.87 × $0.059  = $0.110
Flow 5 — Persona Update:                          = $0.077
  → weekly trigger (4×/month):     4 × $0.015   = $0.060
  → progress trigger (1.87×/month):1.87 × $0.009 = $0.017
Flow 6 — Embeddings:               28 × $0.000014 = $0.001

TOTAL AI COST (avg user) = ~$0.52/month
```

> **Flow 2 note:** entry theme fires on every new entry editor session (28×/month), not 50% of entries as previously estimated.
>
> **Flow 5 note:** persona update has two triggers — the weekly insight cron (`weekly-insights/service.ts`) and the progress milestone (`check-progress-trigger.ts`). Both use Sonnet 4.6. The weekly trigger (4×/month) was previously missing from this doc.

**Model pricing used:**
```markdown
claude-haiku-4-5:        $1.00 / MTok input  |  $5.00 / MTok output
claude-sonnet-4-6:       $3.00 / MTok input  | $15.00 / MTok output
text-embedding-3-small:  $0.02 / MTok input
```

---

## Monthly Cost Projections

### **Formula**

```markdown
Revenue = Users × $10.99
AI Costs = Users × $1.16
Lemon Squeezy = Revenue × 0.05
Infrastructure = (see tiers below)

Profit = Revenue - AI Costs - Lemon Squeezy - Infrastructure
Gross Margin = (Profit ÷ Revenue) × 100
```

---

## Example: 100 Users (Blended — 80% avg / 20% heavy)

### @ $10.99/month

| Item | Calculation | Amount |
| --- | --- | --- |
| **Revenue** | 100 × $10.99 | $1,099 |
| **AI costs** | 100 × $1.16 | $116 |
| **Lemon Squeezy** | $1,099 × 0.05 | $55 |
| **Infrastructure** | Free tier | $0 |
| **Total costs** | - | **$171** |
| **Gross profit** | $1,099 - $171 | **$928** |
| **Gross margin** | - | **84%** |
| **Net profit (after ~22.5% PT tax)** | $928 × 0.775 | **~$719** |

---

## Infrastructure Costs by Scale

| Users | Vercel | Supabase | Clerk | Resend | PostHog | Sentry | Total Infrastructure |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0-500 | $0 | $0 | $0 | $0 | $0 | $0 | **$0** |
| 500-1,000 | $20 | $0 | $0 | $0 | $0 | $0 | **$20** |
| 1,000-5,000 | $20 | $25 | $0 | $20 | $0 | $0 | **$65** |
| 5,000-10,000 | $20 | $25 | $25 | $20 | $0 | $26 | **$116** |

---

## Quick Reference Table — $10.99 (Blended Users, $1.16 AI)

| Users | Revenue | Gross Profit | Net Profit (PT) |
| --- | --- | --- | --- |
| 10 | $110 | $93 | ~$72 |
| 50 | $550 | $465 | ~$360 |
| 100 | $1,099 | $928 | ~$719 |
| 500 | $5,495 | $4,620 | ~$3,581 |
| 1,000 | $10,990 | $9,215 | ~$7,142 |
| 5,000 | $54,950 | $46,286 | ~$35,872 |

*Net profit = gross profit × 0.775 (after ~22.5% Portuguese corporate tax)*
*AI cost = $1.16/user blended (80% avg @ $0.52 / 20% heavy @ $3.70)*
*Lemon Squeezy = 5% of revenue per row*
*Infrastructure deducted at scale per table above*

---

## Cost Alert Thresholds

### **Per-User AI Cost Monitoring**

| Metric | Expected | Alert If | Action |
| --- | --- | --- | --- |
| AI cost per user | $0.52/month | >$0.62 | Check entry length growth, retry loops |
| Tier 1 + Entry Theme per user | $0.197 | >$0.24 | Investigate input inflation or retry issues |
| Tier 2 per user | $0.132 | >$0.16 | Check output length or pattern count creep |
| Tier 3 + Persona per user | $0.187 | >$0.22 | Verify semantic search context size |

### **Total AI Budget Monitoring**

| Users | Expected Monthly | Alert If Exceeds |
| --- | --- | --- |
| 100 | $116 | $139 |
| 500 | $580 | $696 |
| 1,000 | $1,160 | $1,392 |
| 5,000 | $5,800 | $6,960 |

---

## Taxes & Net Profit (Portugal)

**Entity:** Portuguese company (Lda)
**Corporate tax:** ~22.5%
**Net profit:** ~77.5% of gross profit

Example: $928 gross × 0.775 = **~$719 net** (100 users @ $10.99)

*Founder salary (if paid) reduces taxable profit further.*

---

## Break-Even Analysis

**Fixed costs:** ~$0 (everything scales with usage)

**Variable cost per user (blended):**

- AI: ~$1.16
- Lemon Squeezy @ $10.99: ~$0.55
- **Total @ $10.99: ~$1.71 per user**

**Gross profit per user:**
- @ $10.99: ~$9.28

**Break-even:** Immediate (first paying user is profitable at both price points)

---

## Cost Optimization Notes

**If costs exceed targets:**

1. Check average entry length (maybe users write less than 1,000 words)
2. Monitor Tier 2/3 output token usage (are responses too long?)
3. Verify no retry loops in API calls
4. Consider reducing Tier 2 frequency (bi-weekly instead of weekly)
5. **Tier 2 is the most volatile cost for heavy users.** A user writing 22+ entries/week with long entries pushes weekly insight input to ~56,000 tokens, costing $0.19/analysis ($0.77/month). The primary lever is `MIN_ENTRIES_FOR_WEEKLY_INSIGHT` — skip the analysis for users who don't meet the threshold rather than running it on sparse data.
6. **Entry theme (Flow 2) scales with both frequency and entry length.** Each call passes 5 recent entries as context. For heavy users with 2,500-token entries this costs ~$0.013/call × 90 calls = ~$1.17/month. Consider caching the generated prompt across a session or adding a minimum-entry-count threshold before generating (the service already falls back to static defaults for new users with 0 entries).
7. **Persona update (Flow 5)** fires twice per week per active user — once from the weekly cron and once from the progress milestone. The weekly trigger is the more expensive path (passes 5 recent entries as context). If costs spike, increasing `MIN_ENTRIES_FOR_WEEKLY_INSIGHT` or adding a persona-update cooldown would reduce this.
