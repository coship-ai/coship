# CoShip Marketing Automation Framework

## Overview

This folder contains the **agentic marketing automation** framework for CoShip, powered by Claude + MCP integrations.

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Your Notion Marketing Hub             │
│  ┌─────────────┬──────────────┬──────────────┐ │
│  │   Content   │ Interactions │  Analytics   │ │
│  │  Calendar   │     Log      │  Dashboard   │ │
│  └─────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────┘
                      ↕ (MCP)
┌─────────────────────────────────────────────────┐
│         Claude Automation Skills                │
│  ┌──────────────────────────────────────────┐  │
│  │  ship-daily-check                        │  │
│  │  → Monitors Twitter/Reddit/Product Hunt  │  │
│  │  → Logs interactions to Notion           │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  ship-respond                            │  │
│  │  → Reads SHIP_PERSONA.md context        │  │
│  │  → Drafts responses                      │  │
│  │  → Updates Notion with drafts           │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  ship-content                            │  │
│  │  → Generates daily posts                 │  │
│  │  → Follows content pillars              │  │
│  │  → Saves to Content Calendar            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↕ (Chrome MCP)
┌─────────────────────────────────────────────────┐
│     Twitter  •  Reddit  •  Product Hunt         │
└─────────────────────────────────────────────────┘
```

## Skills (Workflows)

### 1. `/ship-daily-check` - Morning Platform Monitor

**What it does:**
- Opens Twitter, Reddit, Product Hunt in browser
- Checks for: mentions, replies, comments, DMs
- Logs all interactions to Notion "Interactions Log"
- Prioritizes items needing response

**How to use:**
```
You: "Run ship-daily-check"
Claude: [Opens platforms, captures interactions, logs to Notion]
Claude: "Found 5 new interactions - 2 high priority. Ready to draft responses?"
```

**Notion Integration:**
- Creates entries in "Interactions Log" database
- Sets Priority (High/Medium/Low) based on context
- Sets Status to "New" for human review

---

### 2. `/ship-respond` - AI-Powered Response Generator

**What it does:**
- Reads interactions from Notion with Status = "New"
- Loads SHIP_PERSONA.md for voice/tone context
- Drafts responses matching Ship's personality
- Flags sensitive items for human review
- Updates Notion with draft responses

**How to use:**
```
You: "Run ship-respond"
Claude: [Reads 5 new interactions]
Claude: "Drafted responses for 5 interactions. Here's what I wrote:
  1. Twitter reply to @founder_xyz [shows draft]
  2. Reddit comment on r/startups [shows draft]
  ...

Should I mark these as 'Ready to Post' or need changes?"
```

**Escalation Triggers:**
- Negative feedback/complaints
- Pricing questions
- Competitor mentions
- Legal/financial advice requests

---

### 3. `/ship-content` - Daily Content Generator

**What it does:**
- Generates posts following content pillar strategy
- Maintains Ship's voice and tone
- Creates content queue for the week
- Saves to Notion "Content Calendar"

**How to use:**
```
You: "Generate this week's content"
Claude: [Creates 7 posts across content pillars]
Claude: "Created content plan for Week of Feb 5:
  • Mon: Pain Point post about technical co-founders
  • Tue: Build-in-Public about CoShip feature
  • Wed: Quick Tip on MVP scoping
  ...

Saved to Content Calendar. Want to review any before scheduling?"
```

**Content Pillars:**
- 30% Build-in-Public
- 30% Pain Points
- 25% Quick Tips
- 15% Founder Wins

---

## Daily Workflow (30-60 minutes)

### Morning Routine (10 minutes)
```bash
You: "Run ship-daily-check"
→ Claude checks all platforms, logs interactions
→ Reviews: "Found 3 new interactions, 1 high priority"
```

### Response Time (15 minutes)
```bash
You: "Run ship-respond for high priority items"
→ Claude drafts responses
→ You review and approve
→ Claude posts responses (via browser automation)
```

### Content Creation (15 minutes, 2x per week)
```bash
You: "Generate next 3 days of content"
→ Claude creates posts, saves to Notion
→ You review and schedule
```

### Light Engagement (10 minutes)
```bash
You: "Find 5 relevant tweets/posts to engage with"
→ Claude browses platforms, suggests engagement opportunities
→ You select, Claude drafts replies
```

---

## Notion Database Reference

### Content Calendar
**Key Fields:**
- Post Title (what's it about)
- Platform (Twitter/Reddit/Product Hunt)
- Content Pillar (Build-in-Public/Pain Points/etc)
- Status (Draft/Ready/Posted/Scheduled)
- Scheduled Date, Posted Date
- Engagement (metrics after posting)

**Data Source ID:** `collection://12e73c27-ebb5-4eac-9b6a-bbb4d6ff018a`

### Interactions Log
**Key Fields:**
- Interaction (title/summary)
- Platform (Twitter/Reddit/Product Hunt/DM)
- Type (Reply/Mention/Comment/DM/Question)
- Response Status (New/Draft Ready/Needs Review/Responded/No Response Needed)
- Priority (High/Medium/Low)
- Author, Content, URL
- Draft Response

**Data Source ID:** `collection://a5657dcc-3684-4547-9d7e-1a55185f6bfc`

### Analytics Dashboard
**Key Fields:**
- Week (e.g., "Week of Feb 5")
- Platform (Twitter/Reddit/Product Hunt/Overall)
- Posts Published, Total Engagement, New Followers/Karma
- Responses Sent
- Top Performing Post, Key Learnings, Next Week Goals

**Data Source ID:** `collection://8530eb4f-ed6a-4726-bdd7-dae791481213`

---

## Setup Instructions

### Phase 1: Account Setup (Today)
1. Create Twitter account (@ship_coship)
2. Create Reddit account (u/ship_coship)
3. Create Product Hunt account (Ship maker profile)

### Phase 2: Workflow Testing (Tomorrow)
1. Run first `ship-daily-check` (should find minimal activity)
2. Test `ship-content` to generate sample posts
3. Manually post 1-2 pieces of content
4. Run `ship-daily-check` again to capture your own posts

### Phase 3: Daily Operation (Ongoing)
1. Morning: `ship-daily-check`
2. Respond: `ship-respond` for new interactions
3. Content: Generate posts 2-3x per week
4. Engage: Browse and reply to community

---

## Tips for Best Results

### For ship-daily-check:
- Run at consistent times (e.g., 9am, 3pm daily)
- Let Claude know if you want him to auto-post low-risk responses or always ask first

### For ship-respond:
- Be specific about tone adjustments: "Make this warmer" or "Be more direct"
- Use "draft 3 variations" if you want options
- Always review before posting sensitive responses

### For ship-content:
- Give Claude context: "Focus on Product Hunt launch this week"
- Request variations: "Give me 3 options for this post"
- Mix evergreen and timely content

---

## Voice Consistency

All skills automatically load `/SHIP_PERSONA.md` to maintain:
- Helpful & approachable tone
- Technical concepts made simple
- Encouraging but honest
- Avoids hype/buzzwords
- Uses Ship's characteristic phrases

---

## Extending the System

Want to add more automation?

**Ideas:**
- `ship-analyze`: Weekly analytics report
- `ship-outreach`: DM campaigns for Product Hunt launch
- `ship-competitor`: Monitor competitor mentions
- `ship-trends`: Identify trending topics in target communities

Simply tell Claude what you want to automate, and he'll build the workflow!

---

**Last Updated:** February 2, 2026
**Version:** 1.0
**Status:** ✅ Infrastructure Ready - Accounts needed
