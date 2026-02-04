# CoShip Marketing Automation - Quick Start Guide

## ✅ What's Already Set Up

### Notion Marketing Hub
Three interconnected databases are live:

1. **Content Calendar** - [View](https://www.notion.so/99cf7178c119424699be026e0007959a)
   - Schedule and track posts
   - Monitor engagement
   - Maintain content balance

2. **Interactions Log** - [View](https://www.notion.so/2da76377721647a1a0c0d1a019b9c583)
   - Track mentions, replies, DMs
   - Manage response workflow
   - Priority management

3. **Analytics Dashboard** - [View](https://www.notion.so/73a44874dc6e40d484fc1f542ef2fc6c)
   - Weekly performance tracking
   - Engagement metrics
   - Learning capture

### Automation Skills
Three AI workflows are documented and ready:

1. **ship-daily-check** → Monitor all platforms for new activity
2. **ship-respond** → Draft responses in Ship's voice
3. **ship-content** → Generate daily content following pillar strategy

---

## 🎯 Next Steps: Account Setup

### Step 1: Twitter (15-20 min)
**Create Account:**
- Handle: `@ship_coship` (or similar if taken)
- Email: ship@coship.dev or professional email
- Enable 2FA

**Profile Setup:**
```
Display Name: Ship 🚢
Bio:
CTO who got tired of watching great ideas die for lack of technical help.

Now building @CoShip to help non-technical founders ship their MVPs.

Powered by Claude • DMs open 📬

Website: coship.dev
Location: Building with you
```

**Pinned Tweet:**
```
I spent 15 years building products for other people.

Now I'm building something to help YOU build yours.

@CoShip helps non-technical founders go from idea → MVP in weeks, not months.

No code bootcamps. No agency runarounds. No equity-hungry "technical co-founders."

Just your vision, shipped. 🚢
```

**Follow:**
- 20-30 founders, startup accounts, indie hackers
- Look for: #buildinpublic, #indiehackers, #startups

---

### Step 2: Reddit (10-15 min)
**Create Account:**
- Username: `ship_coship` or similar
- Verify email
- Enable 2FA

**Profile Description:**
```
CTO turned founder advocate. Building CoShip to help non-technical founders ship their MVPs.

Here to help, not spam. Ask me anything about building products.
```

**Join Subreddits:**
- r/startups
- r/Entrepreneur
- r/SideProject
- r/buildinpublic
- r/indiehackers
- r/microsaas

**First Actions:**
- Read rules for each subreddit
- Lurk for 1-2 days to understand culture
- Start with helpful comments (no CoShip mentions yet)

---

### Step 3: Product Hunt (10 min)
**Create Account:**
- Name: Ship
- Profile: CTO helping non-technical founders

**Setup:**
- Complete maker profile
- Add social links (Twitter, website)
- Follow 10-15 relevant makers/products

**Start Engaging:**
- Upvote 3-5 recent launches
- Leave thoughtful comments
- Build credibility before your launch

---

## 🚀 Using the Automation

### Your Daily Routine (30-60 min)

**Morning (10 min):**
```
You: "Run ship-daily-check"
Claude: [Opens platforms, logs interactions to Notion]
Claude: "Found 3 new interactions: 1 high priority, 2 medium"
```

**Response Time (15 min):**
```
You: "Run ship-respond for high priority items"
Claude: [Drafts responses]
Claude: "Here's what I wrote: [shows drafts]"
You: [Review and approve]
Claude: [Posts responses, updates Notion]
```

**Content (15 min, 2-3x per week):**
```
You: "Generate next 3 days of content"
Claude: [Creates posts for 3 days]
Claude: "Created content: [shows plan]"
You: [Review and approve]
Claude: [Saves to Notion Content Calendar]
```

**Engagement (10 min):**
```
You: "Find 5 relevant posts to engage with on Twitter"
Claude: [Browses, suggests opportunities]
You: [Select 2-3]
Claude: [Drafts replies in Ship voice]
You: [Approve]
Claude: [Posts]
```

---

## 💡 How the Skills Work

### ship-daily-check
**Invocation:**
- "Run ship-daily-check"
- "Check platforms for new activity"
- "Morning marketing check"

**What happens:**
1. Opens Twitter, Reddit, Product Hunt
2. Captures mentions, replies, comments, DMs
3. Classifies by priority (High/Medium/Low)
4. Logs everything to Notion Interactions Log
5. Provides summary report

**Output:** Summary + Notion entries

---

### ship-respond
**Invocation:**
- "Run ship-respond"
- "Draft responses to new interactions"
- "Help me respond to [specific item]"

**What happens:**
1. Loads SHIP_PERSONA.md for voice/tone
2. Fetches interactions with Status = "New" from Notion
3. Drafts responses matching Ship's personality
4. Flags sensitive items for human review
5. Updates Notion with drafts

**Output:** Draft responses for your approval

---

### ship-content
**Invocation:**
- "Run ship-content"
- "Generate this week's content"
- "Create 3 pain point posts"

**What happens:**
1. Loads content pillar strategy (30/30/25/15 distribution)
2. Generates posts following Ship's voice guidelines
3. Optimizes for each platform (Twitter/Reddit/PH)
4. Saves to Notion Content Calendar
5. Presents plan for your approval

**Output:** Content plan with drafts

---

## 📊 Tracking Success

### Daily Metrics (Automatic)
- Interactions captured
- Response time
- Posts published
- Engagement received

### Weekly Review (Manual)
Every Sunday, review:
- Top performing content
- Engagement trends
- Follower/karma growth
- What to adjust next week

Claude can generate this report: "Run ship-analytics for this week"

---

## 🎓 Best Practices

### Do:
- Run ship-daily-check consistently (same times daily)
- Review all drafts before posting (especially sensitive topics)
- Engage authentically (help first, promote second)
- Maintain content pillar balance
- Respond to high-priority items within 1-2 hours

### Don't:
- Auto-post without review (at least initially)
- Spam subreddits with self-promotion
- Ignore platform-specific norms
- Over-promise features or timelines
- Engage with trolls/bad-faith arguments

---

## 🆘 Troubleshooting

### "Claude isn't capturing interactions"
→ Make sure accounts are public and notifications are enabled
→ Try running check manually first to debug

### "Responses don't sound like Ship"
→ Provide feedback: "Make this more encouraging" or "Less salesy"
→ Claude learns your preferences over time

### "Too much content being generated"
→ Specify: "Generate only 3 posts this week"
→ Focus on quality over quantity

### "Notion isn't updating"
→ Check Notion connection
→ Try manually creating one entry to test

---

## 📝 Customization

### Adjust Voice
```
You: "Make responses slightly more technical today"
You: "Keep content extra approachable this week"
```

### Platform Focus
```
You: "Focus only on Twitter this week"
You: "Prioritize Reddit engagement"
```

### Content Theme
```
You: "Theme content around Product Hunt launch"
You: "Focus on MVP scoping advice"
```

### Automation Level
```
You: "Auto-respond to low-priority items"
You: "Always ask before posting anything"
```

---

## 🎉 First Week Goals

### Days 1-2: Setup
- ✅ Notion databases (done!)
- ✅ Automation skills (done!)
- ⏳ Create social accounts
- ⏳ Post pinned tweet/profile content

### Days 3-4: Content
- Generate first week of content
- Post 2-3 pieces
- Start following/engaging

### Days 5-7: Engagement
- Run first ship-daily-check
- Respond to any interactions
- Join 3-5 conversations
- Assess what's working

---

## 📚 Documentation Reference

- **Full Overview:** `/marketing-automation/README.md`
- **ship-daily-check:** `/skills/ship-daily-check.md`
- **ship-respond:** `/skills/ship-respond.md`
- **ship-content:** `/skills/ship-content.md`
- **Ship Persona:** `/SHIP_PERSONA.md` (root folder)

---

## 🚢 Ready to Launch?

**Right now, let's:**
1. Set up Twitter account
2. Generate first 3 pieces of content
3. Test ship-daily-check workflow

Say "Let's start with Twitter" to begin!

---

**Version:** 1.0
**Created:** February 2, 2026
**Status:** Infrastructure Complete ✅ → Accounts Needed ⏳
