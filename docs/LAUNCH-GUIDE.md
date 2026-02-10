# Launch Guide — From Code to Live Ads in 30 Minutes

## What You Have Ready

- 7 landing pages with email capture forms
- Plausible analytics on every page
- Vercel deploy configs ready
- Meta Ads copy for all 7 products (see `docs/ad-copy.md`)
- Deploy script at `scripts/deploy-smoke-tests.sh`

## Step 1: Create Accounts (10 minutes)

### Formspree (email capture)
1. Go to https://formspree.io and create free account
2. Create **7 forms** — one per product name
3. For each form, copy the form ID (looks like `xyzabcde`)
4. You'll need these IDs in Step 2

### Vercel (hosting)
1. Go to https://vercel.com and sign up with your GitHub account
2. Install Vercel CLI: `npm install -g vercel`
3. Run `vercel login` and follow the prompts

### Plausible (analytics) — Optional
1. Go to https://plausible.io (free 30-day trial)
2. Add 7 sites using the `.vercel.app` domains you'll get after deploy
3. If you skip this, the landing pages still work fine — you just won't see visitor stats

## Step 2: Add Your Formspree IDs (5 minutes)

Replace `YOUR_ID` in each landing page with the real Formspree form ID.

Each file has **two forms** (hero section + bottom CTA). Replace in both.

```
smoke-tests/riskloop/index.html       → replace YOUR_ID with riskloop form ID
smoke-tests/energyos/index.html       → replace YOUR_ID with energyos form ID
smoke-tests/capacityos/index.html     → replace YOUR_ID with capacityos form ID
smoke-tests/outcomedb/index.html      → replace YOUR_ID with outcomedb form ID
smoke-tests/stick/index.html          → replace YOUR_ID with stick form ID
smoke-tests/peopledb/index.html       → replace YOUR_ID with peopledb form ID
smoke-tests/commitmentfilter/index.html → replace YOUR_ID with commitmentfilter form ID
```

Quick way (from repo root):
```bash
# Example for riskloop — replace abc123 with your real ID
sed -i 's/YOUR_ID/abc123/g' smoke-tests/riskloop/index.html
```

## Step 3: Deploy (5 minutes)

### Option A: Deploy Script (all 7 at once)
```bash
./scripts/deploy-smoke-tests.sh
```

### Option B: Deploy Individually
```bash
cd smoke-tests/riskloop
vercel --prod --yes
# Note the URL it gives you (e.g., riskloop-abc123.vercel.app)
```

Repeat for each product.

### After Deploy — Save Your URLs
You'll get 7 URLs like:
```
riskloop-xxxxx.vercel.app
energyos-xxxxx.vercel.app
capacityos-xxxxx.vercel.app
outcomedb-xxxxx.vercel.app
stick-xxxxx.vercel.app
peopledb-xxxxx.vercel.app
commitmentfilter-xxxxx.vercel.app
```

## Step 4: Test Everything (5 minutes)

For each URL:
1. Open in browser — page loads?
2. Submit a test email — appears in Formspree dashboard?
3. Check Plausible — visit registered? (if you set it up)

## Step 5: Launch Ads (budget: ~$245)

See `docs/ad-copy.md` for complete ad copy, targeting, and creative concepts.

### Quick Setup per Product:
1. Go to Meta Business Suite → Ads Manager
2. Create campaign → **Traffic** or **Leads** objective
3. Budget: **$5/day for 7 days** = $35/product
4. Audience: See targeting in ad-copy.md
5. Placement: **Automatic** (let Meta optimize)
6. Upload 3 ad variations per product
7. Link each ad to the product's Vercel URL

### Recommended Launch Order (from ad-copy.md):
1. **Stick** — broadest audience, lowest price ($9), highest chance of quick validation
2. **PeopleDB** — clear pain point, easy to understand
3. **RiskLoop** — strong emotional hook
4. **EnergyOS** — productivity audience is large
5. **CapacityOS** — resonates with burnout audience
6. **CommitmentFilter** — needs targeted audience
7. **OutcomeDB** — most niche, launch last

### Budget Summary:
| Product | Daily | Days | Total |
|---------|-------|------|-------|
| Each product | $5 | 7 | $35 |
| **Total (7 products)** | | | **$245** |
| Reserve for winners | | | **$55** |
| **Grand total** | | | **$300** |

## Step 6: Measure (after 7 days)

### The Only Metric That Matters: Email Capture Rate

```
Email Capture Rate = (Emails Collected / Unique Visitors) × 100
```

| Rate | Verdict | Action |
|------|---------|--------|
| >6% | WINNER | Double ad budget, start building MVP |
| 3-6% | MAYBE | Tweak landing page copy, test 7 more days |
| <3% | KILL | Stop ads, don't build MVP |

### Where to Check:
- **Emails collected**: Formspree dashboard → each form shows submission count
- **Unique visitors**: Plausible dashboard (or Vercel Analytics if Plausible not set up)

## After Validation

For each winning product (>6% capture rate):
1. Deploy the full Next.js MVP from `products/{name}/`
2. Set up Supabase project (auth + database)
3. Configure PayPal subscription
4. Connect custom domain
5. Email your captured leads: "We're live. Here's your early access."

---

**Total cost to validate all 7 products: ~$300**
**Time from now to data: ~2 weeks**
**Remaining budget for winners: ~$200**
