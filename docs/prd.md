# ModPilot Product Requirements Document (PRD)

**Reddit Devvit Hackathon 2025**

ModPilot helps Reddit moderators process reports faster, coordinate without collisions, enforce rules consistently, and prioritize what matters most—all without leaving the queue.

| CATEGORY          | VERSION  | STATUS    |
| :---------------- | :------- | :-------- |
| Best New Mod Tool | MVP v1.0 | Draft PRD |

---

## 1. Product Overview

ModPilot is a Devvit-native moderation workspace built on three tightly integrated capabilities:

| Capability                      | Description                                                                                                                                           | Status |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **Smart Queue Copilot**         | Surfaces full moderation context (user history, risk signals, prior actions) the moment a mod opens a queue item. No tab switching required.          | Core   |
| **Conflict-Free Queue Manager** | Tracks reviewer presence in real time so multiple mods never unknowingly work the same report simultaneously.                                         | Core   |
| **AI Queue Prioritizer**        | Automatically scores and reorders every item in the queue by urgency, difficulty, and impact so mods always work the right things in the right order. | NEW    |

Together the three capabilities cut per-item moderation time dramatically, keep enforcement consistent across the whole team, and ensure the highest-impact decisions are never buried at the bottom of a 100-item queue.

## 2. Problem Statement

Mod queues are hard to manage at scale. Five problems compound on each other:

### A. Queue Overload

Spam flags, rule violations, NSFW content, automod triggers, and duplicate reports all land in the same queue. Volume alone creates fatigue; the mixed nature of reports makes it worse because each item requires a different mental model to evaluate.

### B. Context Switching

To make a confident call, mods typically open the user profile, check mod logs, scan recent posts, and sometimes pull up an external tool—all for a single report. That is 4-5 tab switches per decision. Multiply by 50 items and the overhead is enormous.

### C. Duplicate Reviewer Effort

Without live coordination, two mods will often review the same report simultaneously. One of them wasted their time, and if they take conflicting actions, it creates confusion for the user and inconsistency in the log.

### D. Inconsistent Enforcement

Different mods write different removal reasons, apply different ban lengths, and interpret rules differently. Over time this creates a patchwork of enforcement that is hard to defend and frustrating for users who get treated differently for the same behavior.

### E. Inefficient Queue Processing Order - NEW

Mods work through a 100-item queue in arrival order. Urgent harassment reports or high-visibility spam may sit buried behind 50 benign items. Without intelligent triage, the most impactful decisions happen last—or not at all before burnout sets in. A single viral post accumulating reports while it waits in queue position 73 can cause real community harm.

## 3. Vision

_"A shared moderation operating system for Reddit communities."_

The goal is for ModPilot to feel like a natural extension of the mod queue—not a separate tool you switch to, but something that makes the queue itself smarter. Every interaction should save time without adding cognitive load. Intelligent prioritization means the queue always presents the most important item first, not just the oldest.

## 4. Goals

### Primary Goals (Hackathon Version)

- Cut the time it takes to process a single queue item
- Prevent duplicate review effort across mod team members
- Reduce the number of external tabs/tools mods need
- Make rule enforcement more consistent and repeatable
- Improve coordination within multi-mod teams
- Surface urgent and high-impact items first - never bury critical reports

### Secondary Goals

- Clean, installable Devvit-native experience with minimal setup
- Works well for both small mod teams (2-3 people) and large ones

## 5. Success Metrics

| Metric                              | Target                 |
| :---------------------------------- | :--------------------- |
| Avg. moderation decision time       | ↓ 40%                  |
| Duplicate moderation collisions     | ↓ 80%                  |
| Tabs / pages opened per action      | ↓ 60%                  |
| Rule enforcement consistency        | Measurably improved    |
| Time to reach urgent items in queue | ↓ 70% (new)            |
| Moderator satisfaction              | High (post-use survey) |

## 6. Target Users

The primary user is a Reddit moderator on a community with enough volume that queue management is a real daily burden. That typically means:

- Medium-to-large subreddits with 5k+ active members
- Communities with multiple mods sharing queue duty
- High-velocity spaces: gaming, tech, memes, news, education

Smaller subreddits can use it too, but the collision-prevention and prioritization features add the most value when there are at least 2-3 mods working simultaneously and 50+ daily queue items.

## 7. Core Features

### Feature 1 - Smart Context Panel

When a mod opens a queue item, ModPilot renders a sidebar with everything they would normally have to look up manually. No tab switching required.

**What it shows:**

- Account age, karma, and subreddit participation
- Number of prior removals, warnings, and bans in this sub
- Recent posts/comments from this user (last 30 days)
- A simple risk score based on keyword and behavioral heuristics

**Risk signals (heuristic-based, no ML):**

- Spam probability - repeated links, low-karma post patterns
- Self-promotion flags - post-to-comment ratio, link domains
- Repost detection - title similarity to recent removed content
- Repeat offender - X removals in last Y days

**MVP Scope**
| In Scope | Out of Scope |
| :--- | :--- |
| User activity summary | External AI/ML pipelines |
| Prior mod action history | NLP-based classification |
| Keyword heuristics + risk score | Cross-subreddit data |
| Risk indicator badges | Automated decisions |

### Feature 2 - Conflict-Free Queue Presence

The moment a mod opens a report, ModPilot marks it as under review and broadcasts that state to all other mods in real time. This is the coordination layer that prevents duplicate work.

**Presence states**
| State | What it means | What other mods see |
| :--- | :--- | :--- |
| **Available** | No one is reviewing this | No indicator |
| **Reviewing** | Someone has it open | "Alex is reviewing this" |
| **Handled** | Action was taken | Timestamp + action taken |

The lock is soft: any mod can still act if needed but the visual indicator is enough to prevent most collisions in practice. Presence state expires automatically after a configurable TTL in case a mod closes without acting.

**Available actions:**

- Remove Post / Remove Comment
- Warn User (sends modmail from template)
- Temporary Ban (configurable duration)
- Escalate to Senior Mods
- Mark as Resolved (no action needed)

**Rule templates:**
Each template includes a rule reference, a plain-English explanation for the user, and an optional internal mod note.
_Example:_ "Your post was removed for violating Rule 3: No Self-Promotion. You're welcome to participate in our community - just avoid linking to your own content without engaging elsewhere first."
Templates are configurable per subreddit so each community can standardize on their own language.

### Feature 3 - AI Queue Prioritizer (NEW - Hackathon Build)

Instead of processing reports in arrival order, ModPilot automatically analyzes and reorders the entire queue every time it is opened. Mods see the highest-urgency, highest-impact items first every single session.

**Scoring dimensions**
| Dimension | Signals | Weight |
| :--- | :--- | :--- |
| **Urgency** | Harassment keywords, hate speech signals, doxxing patterns, explicit threat language | High |
| **Impact** | Post visibility (upvotes, comment count, time live), subscriber reach estimate | High |
| **Difficulty** | Clear rule match vs ambiguous edge case; first-time vs repeat offender context | Medium |
| **Rule confidence** | Predicted rule violation from keyword/pattern classifier | Medium |

**Priority tiers**
| Tier | Criteria | Queue position |
| :--- | :--- | :--- |
| **P1 - Critical** | Harassment, threats, doxxing OR high-visibility spam (500+ upvotes) | Top of queue |
| **P2 - Urgent** | Clear rule violations, repeat offenders, NSFW untagged | After P1 |
| **P3 - Standard** | Moderate-confidence violations, first-time offenders, low-visibility | After P2 |
| **P4 - Edge case** | Low-confidence, ambiguous, needs senior mod judgment | Bottom (flagged) |

**What mods see:**
Each queue item displays a priority badge (P1/P2/P3/P4), a predicted rule tag if confidence is high enough, and an edge-case flag for items requiring extra care. The sort order is applied automatically - no configuration needed.

**MVP scope**
| In Scope | Out of Scope |
| :--- | :--- |
| Urgency scoring via keyword/pattern matching | Full ML model training |
| Impact scoring via post metadata | Cross-subreddit signal aggregation |
| Difficulty estimation (rule confidence) | Automated action-taking based on score |
| Priority badge display on each queue item | Custom scoring weights per subreddit (roadmap) |
| Rule prediction tag (high-confidence only) | Permanent ban automation |
| Edge-case flag for human review | |

**3-day build timeline**
| Day | Focus | Deliverable |
| :--- | :--- | :--- |
| **Day 1** | Classifier design + prompt engineering. Define urgency/impact/difficulty signals. Build scoring logic. | Working scoring function on test queue data |
| **Day 2** | Queue analysis pipeline. Connect scorer to live queue data. Sort and tier output. | Prioritized queue output with P1-P4 tiers |
| **Day 3** | Devvit integration. Render priority badges in queue UI. End-to-end testing. | Live prioritized queue in Devvit |

## 8. User Flows

### Standard Queue Review

| Step                   | What happens                                                                               |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| **1 - Open queue**     | Mod opens queue. Prioritizer has already scored and sorted all items. P1 items are at top. |
| **2 - Open item**      | Mod clicks the top item. ModPilot sidebar loads alongside it.                              |
| **3 - Read context**   | Sidebar shows user profile, risk score, prior actions, and current reviewer presence.      |
| **4 - Pick action**    | Mod selects from action buttons. Rule template pre-fills the message.                      |
| **5 - Confirm**        | One more click. Action executes via Reddit API.                                            |
| **6 - Queue advances** | Item marked Handled. Other mods see it resolved in real time. Next priority item surfaces. |

### Collision Prevention

| Step                            | What happens                                                        |
| :------------------------------ | :------------------------------------------------------------------ |
| **1 - Mod A opens report**      | Item status changes to Reviewing. All mods see the indicator.       |
| **2 - Mod B opens same report** | Sees "Alex is reviewing this." Typically moves on to the next item. |
| **3 - Mod A takes action**      | Item flips to Handled. Mod B's queue reflects this immediately.     |

### Queue Prioritization (New Flow)

| Step                                 | What happens                                                                                                              |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **1 - Mod opens queue (100 items)**  | Prioritizer scores all items. Queue reorders: P1 critical items at top.                                                   |
| **2 - P1 items visible immediately** | Harassment report (500 upvotes, live 2 hrs) is item #1. Mod addresses it in seconds.                                      |
| **3 - P2 items follow**              | Clear rule violations, repeat offenders next. Each has predicted rule tag pre-filled.                                     |
| **4 - P3 standard items**            | Routine removals. Mod processes these efficiently with templates.                                                         |
| **5 - P4 edge cases at bottom**      | Flagged for human judgment. Senior mod handles last or escalates.                                                         |
| **Result**                           | Instead of wading through 50 items to find 5 urgent ones, urgent items are always first. Processing speed increases ~40%. |

## 9. Technical

### Architecture

| Layer           | Technology                                                                                          |
| :-------------- | :-------------------------------------------------------------------------------------------------- |
| **Frontend**    | Devvit Blocks UI (React-style component model)                                                      |
| **Backend**     | Moderation service, presence tracker, scoring engine, template service, prioritization engine (new) |
| **Storage**     | Devvit KV - queue presence, mod logs, rule templates, user summaries, priority scores               |
| **Permissions** | `modposts`, `modcontributors`, `modconfig`, `read`, `privatemessages`                               |

### Data Models

- **Queue Presence:** `{ itemId, reviewer?, status: 'available' \| 'reviewing' \| 'handled', startedAt? }`
- **UserModProfile:** `{ username, warnings, removals, bans, recentFlags, riskScore }`
- **RuleTemplate:** `{ id, title, message, ruleRef }`
- **Queue PriorityScore (new):** `{ itemId, urgencyScore, impactScore, difficultyScore, tier: 'P1'\|'P2'\|'P3'\|'P4', predictedRule?, isEdgeCase, scoredAt }`

### Key Components

| Component                | Role                                                                      |
| :----------------------- | :------------------------------------------------------------------------ |
| **QueuePanel**           | Main sidebar container rendered alongside each queue item                 |
| **UserContextCard**      | Renders user mod profile and risk indicators                              |
| **PresenceIndicator**    | Shows live reviewer state; subscribes to KV updates                       |
| **ActionButtons**        | One-click moderation workflow triggers                                    |
| **RuleTemplateModal**    | Template picker with editable message before send                         |
| **PriorityEngine (new)** | Scores each queue item on urgency, impact, difficulty; assigns P1-P4 tier |
| **PriorityBadge (new)**  | Renders tier badge + predicted rule tag on each queue item                |
| **QueueSorter (new)**    | Intercepts queue render and reorders by priority score before display     |

## 10. Non-Goals (MVP)

These are out of scope for the hackathon build. They may appear on the roadmap but will not delay launch:

- Full AI moderation or automated action-taking
- Browser extensions or anything outside Reddit's native UI
- Cross-subreddit moderation or shared mod logs between subs
- Advanced analytics dashboards or mod performance reporting
- Automated permanent bans
- Custom priority scoring weights per subreddit (post-hackathon)
- Prioritization model training on historical mod data (roadmap)

## 11. Risks & Mitigations

| Risk                                   | Mitigation                                                                                          |
| :------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Overengineering the MVP**            | Three features, hard scope. No additions without cutting something else.                            |
| **Devvit API limitations**             | All features use Devvit-native primitives only. No external deps.                                   |
| **UI clutter**                         | Context panel is collapsible. Priority badges are small and unobtrusive.                            |
| **Presence sync conflicts**            | Soft-lock model + TTL expiry. No hard blocking that could stall a mod.                              |
| **Priority scorer false positives**    | Scorer is advisory only—mods always make the final call. P4 edge case flag adds human review layer. |
| **Classifier latency on large queues** | Scores cached in KV on queue open; incremental updates for new items only.                          |

## 12. Demo Scenario

This is the scenario we would walk through in a live demo. It is designed to show all three features in under 30 seconds. A mod opens a 100-item queue. A harassment report involving a high-karma post has been live for 2 hours. Separately, a spam account has posted the same link three times this week.

| Moment             | What the mod sees                                                                                                         |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Open queue**     | Queue is reordered. P1: harassment report (high visibility, urgent keywords). P2: spam account (3 removals, same domain). |
| **Open P1 item**   | ModPilot sidebar loads. Risk badge: High Urgency. User has 0 prior removals—first offence.                                |
| **Check presence** | "No other mods reviewing." Green indicator.                                                                               |
| **Take action**    | Click "Remove + Rule 1 Warning." Template pre-fills. One more click. Done.                                                |
| **Open P2 item**   | Spam account sidebar shows: 3 removals in 7 days, same domain, different titles.                                          |
| **Take action**    | Click "Remove + Rule 2 Warning." Template pre-fills. Confirmed.                                                           |
| **Done**           | Both items resolved. Queue advances to P3. Total time for both items: ~10 seconds.                                        |

## 13. Future Roadmap

Post-hackathon, if ModPilot gets traction, here is what comes next (rough priority order):

1. Repeat offender detection with automatic escalation suggestions
2. ML-trained priority scorer using historical mod action data
3. Custom scoring weights per subreddit (tune urgency vs. impact vs. difficulty)
4. Subreddit mod analytics (volume trends, action breakdown, peak times)
5. Shared mod notes - sticky annotations visible to all mods on a user profile
6. AI-assisted rule classification (surface which rule a post likely violates)
7. Moderator workload balancing - distribute queue items across available mods
8. Cross-subreddit intelligence (opt-in) - flag users with patterns across communities

## 14. Why ModPilot Fits the Hackathon

| Dimension                   | Old Way                             | With ModPilot                        |
| :-------------------------- | :---------------------------------- | :----------------------------------- |
| **Context gathering**       | 4-5 tab switches per item           | Everything in one sidebar            |
| **Team coordination**       | No awareness of teammates           | Live presence indicators             |
| **Enforcement consistency** | Varies by mod, by day               | Standardized rule templates          |
| **Queue order**             | Arrival order - urgent items buried | AI-prioritized - urgent always first |
| **Speed**                   | Minutes per item                    | ~5 seconds per item                  |
| **Platform**                | External tools or spreadsheets      | 100% native to Reddit / Devvit       |

ModPilot is not a moonshot. It is a focused, practical improvement to something mods do every day and it is built entirely within the Devvit ecosystem, which is exactly what the hackathon is asking for. The AI Queue Prioritizer adds a pure data science layer that slots cleanly into the existing architecture with minimal additional UI surface.
