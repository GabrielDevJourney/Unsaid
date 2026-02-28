# Unsaid: Cost Overview & Economics

---

## AI Pipeline Cost Calculator

### **Base Assumptions**

- **Average user:** 28 entries/month (4x/week)
- **Heavy user:** 90 entries/month (7 days/week, 1,000 words each ~2,500 tokens)
- Costs based on full-month real usage testing
- AI usage is hard-capped by tier design

### **Cost Formula Per User Per Month (Observed)**

```markdown
Average User AI Cost ≈ $0.75 / month
Heavy User AI Cost  ≈ $2.25 / month
Blended (80% Avg / 20% Heavy) ≈ $1.05 / month
```

**Tier breakdown (average user, 28 entries/month):**
```markdown
Tier 1 Cost = 28 entries × $0.0011 = $0.031
Tier 2 Cost = 4 weeks × $0.084   = $0.336
Tier 3 Cost = 1.87 triggers × $0.204 = $0.381
Embeddings  = 28 entries × $0.00005  = $0.001

TOTAL AI COST (avg user) = ~$0.75/month
```

---

## Monthly Cost Projections

### **Formula**

```markdown
Revenue = Users × $10.99
AI Costs = Users × $0.75
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
| **AI costs** | 100 × $1.05 | $105 |
| **Lemon Squeezy** | $1,099 × 0.05 | $55 |
| **Infrastructure** | Free tier | $0 |
| **Total costs** | - | **$160** |
| **Gross profit** | $1,099 - $160 | **$939** |
| **Gross margin** | - | **85%** |
| **Net profit (after ~22.5% PT tax)** | $939 × 0.775 | **~$728** |

---

## Infrastructure Costs by Scale

| Users | Vercel | Supabase | Clerk | Resend | PostHog | Sentry | Total Infrastructure |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0-500 | $0 | $0 | $0 | $0 | $0 | $0 | **$0** |
| 500-1,000 | $20 | $0 | $0 | $0 | $0 | $0 | **$20** |
| 1,000-5,000 | $20 | $25 | $0 | $20 | $0 | $0 | **$65** |
| 5,000-10,000 | $20 | $25 | $25 | $20 | $0 | $26 | **$116** |

---

## Quick Reference Table — $10.99 (Blended Users, $1.05 AI)

| Users | Revenue | Gross Profit | Net Profit (PT) |
| --- | --- | --- | --- |
| 10 | $110 | $94 | ~$73 |
| 50 | $550 | $470 | ~$364 |
| 100 | $1,099 | $939 | ~$728 |
| 500 | $5,495 | $4,695 | ~$3,638 |
| 1,000 | $10,990 | $9,390 | ~$7,277 |
| 5,000 | $54,950 | $46,952 | ~$36,388 |

*Net profit = gross profit × 0.775 (after ~22.5% Portuguese corporate tax)*
*AI cost = $1.05/user blended (80% avg @ $0.75 / 20% heavy @ $2.25)*
*Lemon Squeezy = 5% of revenue per row*

---

## Cost Alert Thresholds

### **Per-User AI Cost Monitoring**

| Metric | Expected | Alert If | Action |
| --- | --- | --- | --- |
| AI cost per user | $0.75/month | >$0.90 | Check for longer entries, retry loops |
| Tier 1 per user | $0.031 | >$0.05 | Investigate retry issues |
| Tier 2 per user | $0.336 | >$0.45 | Check token output length |
| Tier 3 per user | $0.381 | >$0.50 | Verify semantic search query size |

### **Total AI Budget Monitoring**

| Users | Expected Monthly | Alert If Exceeds |
| --- | --- | --- |
| 100 | $75 | $90 |
| 500 | $375 | $450 |
| 1,000 | $750 | $900 |
| 5,000 | $3,750 | $4,500 |

---

## Taxes & Net Profit (Portugal)

**Entity:** Portuguese company (Lda)
**Corporate tax:** ~22.5%
**Net profit:** ~77.5% of gross profit

Example: $844 gross × 0.775 = **~$654 net** (100 users @ $9.99)

*Founder salary (if paid) reduces taxable profit further.*

---

## Break-Even Analysis

**Fixed costs:** ~$0 (everything scales with usage)

**Variable cost per user (blended):**

- AI: ~$1.05
- Lemon Squeezy @ $10.99: ~$0.55
- **Total @ $10.99: ~$1.60 per user**

**Gross profit per user:**
- @ $10.99: ~$9.39

**Break-even:** Immediate (first paying user is profitable at both price points)

---

## Cost Optimization Notes

**If costs exceed targets:**

1. Check average entry length (maybe users write less than 1,000 words)
2. Monitor Tier 2/3 output token usage (are responses too long?)
3. Verify no retry loops in API calls
4. Consider reducing Tier 2 frequency (bi-weekly instead of weekly)