# Unsaid: Cost Overview & Economics

---

## AI Pipeline Cost Calculator

### **Base Assumptions**

- User writes **7 days/week** = **28 entries/month**
- Average entry: **1,000 words** (~2,500 tokens)
- This is **worst-case heavy user** scenario

### **Cost Formula Per User Per Month**

```markdown
Tier 1 Cost = 28 entries × $0.0011 = $0.031
Tier 2 Cost = 4 weeks × $0.084 = $0.336
Tier 3 Cost = 1.87 (28 entries ÷ 15) × $0.204 = $0.381
Embeddings = 28 entries × $0.00005 = $0.0014

TOTAL AI COST PER USER = $0.75/month
```

---

## Monthly Cost Projections

### **Formula**

```markdown
Revenue = Users × $12.99
AI Costs = Users × $0.75
Lemon Squeezy = Revenue × 0.05
Infrastructure = (see tiers below)

Profit = Revenue - AI Costs - Lemon Squeezy - Infrastructure
Gross Margin = (Profit ÷ Revenue) × 100
```

---

## Example: 100 Heavy Users (7 days/week)

| Item | Calculation | Amount |
| --- | --- | --- |
| **Revenue** | 100 × $12.99 | $1,299 |
| **AI costs** | 100 × $0.75 | $75 |
| **Lemon Squeezy** | $1,299 × 0.05 | $65 |
| **Infrastructure** | Free tier | $0 |
| **Total costs** | - | **$140** |
| **Profit** | $1,299 - $140 | **$1,159** |
| **Gross margin** | ($1,159 ÷ $1,299) × 100 | **89%** |

---

## Infrastructure Costs by Scale

| Users | Vercel | Supabase | Clerk | Resend | PostHog | Sentry | Total Infrastructure |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0-500 | $0 | $0 | $0 | $0 | $0 | $0 | **$0** |
| 500-1,000 | $20 | $0 | $0 | $0 | $0 | $0 | **$20** |
| 1,000-5,000 | $20 | $25 | $0 | $20 | $0 | $0 | **$65** |
| 5,000-10,000 | $20 | $25 | $25 | $20 | $0 | $26 | **$116** |

---

## Quick Reference Table

| Users | Revenue | AI Costs | Payment Fees | Infrastructure | **Total Costs** | **Profit** | **Margin** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | $130 | $8 | $7 | $0 | $15 | $115 | 88% |
| 50 | $650 | $38 | $33 | $0 | $71 | $579 | 89% |
| 100 | $1,299 | $75 | $65 | $0 | $140 | $1,159 | 89% |
| 500 | $6,495 | $375 | $325 | $20 | $720 | $5,775 | 89% |
| 1,000 | $12,990 | $750 | $650 | $65 | $1,465 | $11,525 | 89% |
| 5,000 | $64,950 | $3,750 | $3,248 | $116 | $7,114 | $57,836 | 89% |
| 10,000 | $129,900 | $7,500 | $6,495 | $116 | $14,111 | $115,789 | 89% |

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

## Break-Even Analysis

**Fixed costs:** ~$0 (everything scales with usage)

**Variable cost per user:**

- AI: $0.75
- Lemon Squeezy: $0.65 (5% of $12.99)
- **Total: $1.40 per user**

**Profit per user:** $12.99 - $1.40 = **$11.59**

**Break-even:** Immediate (first paying user is profitable)

---

## Cost Optimization Notes

**If costs exceed targets:**

1. Check average entry length (maybe users write less than 1,000 words)
2. Monitor Tier 2/3 output token usage (are responses too long?)
3. Verify no retry loops in API calls
4. Consider reducing Tier 2 frequency (bi-weekly instead of weekly)