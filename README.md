<p align="center">
  <h1 align="center">Crew</h1>
  <p align="center"><strong>AI-powered task management for everyone</strong></p>
  <p align="center">Engineers, PMs, and Business teams - all working together with AI agents</p>
</p>

## Overview

Crew is a modern task management tool that brings AI coding agents to everyone on your team. Whether you're an engineer, PM, or business stakeholder, Crew helps you:

- **Orchestrate AI agents** - Run multiple coding agents in parallel or sequence
- **Track progress** - Visual kanban boards to monitor task status
- **Review work** - Quickly review changes and start dev servers
- **Collaborate** - Enable non-technical team members to leverage AI agents
- **Configure easily** - Centralized MCP config management

## Installation

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (>=18)
- [pnpm](https://pnpm.io/) (>=8)

### Setup

```bash
# Clone the repository
git clone https://github.com/anthropics/crew.git
cd crew

# Install dependencies
pnpm i

# Run development server
pnpm run dev
```

Crew will launch in your browser automatically at `http://localhost:3000`.

## Features

### Project Management
- Add git repositories as projects
- Automatic git integration and validation
- Project-wide file search

### Task Management
- Kanban-style task boards
- Task status tracking (Todo, In Progress, Done)
- Rich task descriptions

### AI Agent Integration
- Support for Claude Code, Gemini CLI, Codex, Amp, and more
- Create tasks and immediately start agent execution
- Follow-up task execution for iterative development

### Development Workflow
- Isolated git worktrees for each task
- View diffs of changes made by agents
- Merge successful changes back to main branch

### Developer Tools
- Open tasks in your preferred editor (VS Code, Cursor, Windsurf, etc.)
- Real-time execution monitoring
- Sound notifications for task completion

## Architecture

| Layer | Technology |
|-------|------------|
| Backend | Rust (Axum) |
| Frontend | React + TypeScript + Vite + Tailwind |
| Database | SQLite (SQLx) |
| Shared Types | ts-rs (auto-generated) |

## Development Commands

```bash
# Install dependencies
pnpm i

# Run development server (frontend + backend)
pnpm run dev

# Run QA mode (recommended for testing)
pnpm run dev:qa

# Type check
pnpm run check

# Lint
pnpm run lint

# Run backend tests
cargo test --workspace

# Generate TypeScript types from Rust
pnpm run generate-types
```

## Contributing

We welcome contributions! Please open an issue or discussion before submitting PRs.

## License

MIT
