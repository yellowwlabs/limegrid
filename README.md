# Limegrid

A powerful Reddit moderation suite built with Devvit. Limegrid provides advanced tools for risk scoring, presence tracking, and priority-based moderation workflows.

## Features

### 🛡️ Copilot
- **Risk Scoring**: Real-time evaluation of comment risk based on multiple heuristics.
- **Context Modal**: Deep-dive into user history and content context directly from the mod queue.
- **Automated Insights**: AI-assisted summaries of potential policy violations.

### 👤 Presence
- **Indicator**: Visual cues showing which moderators are active in a thread.
- **Store Management**: Centralized state for tracking moderator actions and presence.
- **Collaboration**: Prevent duplicate moderator actions through real-time presence sync.

### 📊 Prioritizer
- **Priority Engine**: Automatically ranks mod queue items based on urgency and risk.
- **Dashboard**: Unified view of the most critical moderation tasks.
- **Custom Workflows**: Configurable rules for how content is routed and prioritized.

## Tech Stack

- [Devvit](https://developers.reddit.com/): Reddit's platform for building and deploying apps
- [Vite](https://vite.dev/): Fast build tool for the web components
- [Hono](https://hono.dev/): Lightweight web framework for backend logic
- [TypeScript](https://www.typescriptlang.org/): Type-safe development

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```
2. **Configure your app** in `devvit.json`.
3. **Start developing**:
   ```bash
   pnpm run dev
   ```

## Project Structure

Limegrid follows a **feature-based architecture** for better scalability and modularity:

```
src/
├── features/
│   ├── copilot/      # Risk scoring and context analysis
│   ├── presence/     # Real-time moderator tracking
│   └── prioritizer/  # Moderation queue optimization
├── shared/           # Cross-cutting types and constants
├── index.ts          # Hono server entry point
└── main.tsx          # Devvit UI entry point
```

## Commands

- `pnpm run dev`: Starts development mode with live reload.
- `pnpm run build`: Builds the application for production.
- `pnpm run deploy`: Uploads a new version to Reddit.
- `pnpm run type-check`: Runs TypeScript type checking and linting.

## Development Notes

- **Permissions**: Requires `reddit: true` for API access.
- **Mod Priority**: Designed for subreddits with high volume and multiple active moderators.

---
Built with ❤️ by Yellow Labs.
