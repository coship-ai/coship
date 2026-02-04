# Skill: ship-daily-check

## Purpose
Automated morning routine to monitor all marketing platforms (Twitter, Reddit, Product Hunt) for new interactions requiring response.

## Trigger Phrases
- "Run ship-daily-check"
- "Check platforms for new activity"
- "Morning marketing check"
- "What's new on Twitter/Reddit/Product Hunt?"

## What This Skill Does

### 1. Platform Monitoring
Uses Chrome MCP to visit each platform and capture:

**Twitter (@ship_coship):**
- Mentions (@ship_coship)
- Replies to your tweets
- DMs (if any)
- Relevant hashtag activity (#buildinpublic, #startups)

**Reddit (u/ship_coship):**
- Comment replies
- Post replies
- DMs
- Username mentions

**Product Hunt (Ship profile):**
- Comments on your products
- Mentions in discussions
- Messages

### 2. Interaction Classification
For each interaction found, classify:

**Type:**
- Reply (response to your content)
- Mention (tagged you)
- Comment (on your post/product)
- DM (direct message)
- Question (asking for info/help)

**Priority:**
- **High**: Questions, negative feedback, influential accounts, time-sensitive
- **Medium**: Standard replies, community discussions
- **Low**: Likes/upvotes only, automated messages

**Response Status:**
- New (just discovered)
- Draft Ready (if auto-draft enabled)
- Needs Review (sensitive topics)

### 3. Notion Logging
Creates entries in "Interactions Log" database with:
- Interaction title (summary)
- Platform
- Type
- Priority
- Author name/handle
- Content (the message/reply/comment)
- URL (link to original)
- Date
- Response Status

### 4. Summary Report
Provides human-readable summary:
```
Ship Daily Check - February 2, 2026 9:15am

Twitter:
  • 2 replies to your pain point tweet (both positive)
  • 1 mention from @startup_founder asking about pricing
  • 3 new followers

Reddit:
  • 1 reply on r/startups (asking clarification question)
  • 2 upvotes on your comment in r/Entrepreneur

Product Hunt:
  • No new activity (account setup phase)

Priority Items:
  ⚠️ HIGH: @startup_founder asking about CoShip pricing (Twitter)
  → Medium: Question about MVP scope on Reddit

Ready to draft responses? (Y/n)
```

## Step-by-Step Execution

### Step 1: Browser Setup
```javascript
// Open tabs for each platform
- Tab 1: twitter.com/notifications
- Tab 2: reddit.com/message/inbox
- Tab 3: producthunt.com/notifications
```

### Step 2: Twitter Monitoring
```javascript
1. Navigate to twitter.com/notifications
2. Check "Mentions" tab
3. Check "All" for replies
4. Capture all unread/new items
5. For each item:
   - Extract: author, content, URL, timestamp
   - Classify: type, priority
   - Log to Notion
```

### Step 3: Reddit Monitoring
```javascript
1. Navigate to reddit.com/message/inbox
2. Check "unread" filter
3. Capture all unread messages/replies
4. For each item:
   - Extract: author, subreddit, content, URL, timestamp
   - Classify: type, priority
   - Log to Notion
```

### Step 4: Product Hunt Monitoring
```javascript
1. Navigate to producthunt.com/notifications
2. Check for comments, mentions
3. Capture all unread items
4. For each item:
   - Extract: author, product, content, URL, timestamp
   - Classify: type, priority
   - Log to Notion
```

### Step 5: Notion Database Update
```sql
-- Insert into Interactions Log database
INSERT INTO "collection://a5657dcc-3684-4547-9d7e-1a55185f6bfc"
  (Interaction, Platform, Type, Priority, Author, Content, "userDefined:URL", "date:Date:start", "Response Status")
VALUES
  (...);
```

### Step 6: Generate Summary Report
Compile findings into human-readable format with:
- Platform breakdown
- Count of interactions by type
- Priority items highlighted
- Suggested next actions

## Configuration Options

### Auto-Draft Mode
If enabled, automatically run `ship-respond` after check completes:
```
You: "Run ship-daily-check with auto-draft"
→ Claude checks platforms
→ Claude drafts responses for Low/Medium priority items
→ Claude flags High priority for your review
```

### Quiet Mode
If enabled, skip summary report and just log to Notion:
```
You: "Run ship-daily-check in quiet mode"
→ Claude checks platforms, logs to Notion
→ No verbal report unless high-priority items found
```

### Selective Platform Check
Check specific platforms only:
```
You: "Check Twitter for new activity"
You: "Run ship-daily-check for Reddit only"
```

## Output Format

### Standard Report
```markdown
# Ship Daily Check
**Date:** [Timestamp]
**Platforms Checked:** Twitter, Reddit, Product Hunt

## Summary
- Total Interactions: 8
- High Priority: 1
- Medium Priority: 4
- Low Priority: 3

## Platform Breakdown

### Twitter (@ship_coship)
**New Activity:**
1. 🔴 HIGH - @startup_founder: "How much does CoShip cost?"
   → Type: Mention | Priority: High | Needs: Pricing response

2. 🟡 MEDIUM - @designer_jane: "Love this approach! How do you handle revisions?"
   → Type: Reply | Priority: Medium | Needs: Feature explanation

**Engagement Stats:**
- 3 new followers
- 12 likes on latest post
- 5 retweets

### Reddit (u/ship_coship)
**New Activity:**
1. 🟡 MEDIUM - u/tech_founder in r/startups: "What tech stack do you use?"
   → Type: Reply | Priority: Medium | Needs: Technical explanation

**Karma Change:** +15 (now 547)

### Product Hunt
**New Activity:**
- None (pre-launch phase)

---

## Next Actions
1. Draft response to @startup_founder (HIGH)
2. Answer remaining 4 medium-priority items
3. Consider: Quick tip post about question from Reddit

Would you like me to draft responses now?
```

## Integration with Other Skills

### After ship-daily-check:
```
→ Run ship-respond (drafts responses)
→ Run ship-content (creates posts inspired by interactions)
```

### Before ship-analytics:
```
Daily check data feeds weekly analytics
```

## Error Handling

### If Platform Unavailable
```
❌ Error: Could not access Twitter
→ Logged issue, will retry in 1 hour
→ Continuing with Reddit and Product Hunt...
```

### If Notion Connection Fails
```
❌ Error: Notion database unavailable
→ Saving interactions to local backup
→ Will sync when connection restored
```

### If No New Activity
```
✅ Ship Daily Check Complete
No new interactions found across all platforms.

Suggestions:
- Engage with 3-5 relevant posts to increase visibility
- Post scheduled content from Content Calendar
```

## Best Practices

1. **Run Consistently**: Same time daily (e.g., 9am, 3pm)
2. **Don't Skip Days**: Interactions age quickly, especially on Twitter
3. **Prioritize High Items**: Respond to high-priority within 1-2 hours
4. **Review Medium Daily**: Respond within 24 hours
5. **Batch Low Priority**: Handle in weekly sweep

## Metrics Tracked

The skill automatically tracks:
- Average response time
- Interaction volume by platform
- Priority distribution
- Response rate
- Engagement trends

These feed into `ship-analytics` for weekly reporting.

---

**Version:** 1.0
**Last Updated:** February 2, 2026
**Status:** Ready to Use (requires account setup)
