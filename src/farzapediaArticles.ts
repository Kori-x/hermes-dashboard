import type { Article } from './farzapediaTypes'

export const articles: Article[] = [
  // ── Projects ──────────────────────────────────────────
  {
    slug: 'hermes-agent',
    title: 'Hermes Agent',
    category: 'projects',
    tags: ['ai', 'agent', 'framework', 'open-source'],
    created: '2025-11-14',
    updated: '2026-04-06',
    seeAlso: ['hermes-dashboard', 'icarus-plugin', 'fabric-architecture', 'claude-code'],
    body: `An open-source AI agent framework built for extensibility. Hermes runs as a CLI and supports plugins, skills, memory systems, and multiple LLM providers via OpenRouter.

The core loop follows a read-plan-act-reflect cycle. Each turn the agent reads context (conversation history, memory, active skills), plans a response, executes tool calls, and reflects on the outcome. Plugins hook into every phase of this lifecycle.

Hermes uses a [Fabric Architecture](fabric-architecture) for persistent memory -- a shared directory of markdown files that any agent instance can read and write. This makes cross-session and cross-agent knowledge transfer trivial.

The skill system is directory-based: each skill is a folder under \`~/.hermes/skills/\` with a \`SKILL.md\` manifest. Skills teach the agent *when* and *how* to use specific capabilities. There are currently 142 skills across 28 categories including [computer use](computer-use-plugin), social media, productivity, and creative tools.

Configuration lives in \`config.yaml\` and supports personality switching, reasoning effort levels, model selection, and per-platform toolset restrictions. The agent can run on CLI, Discord, Signal, Slack, and Home Assistant.

Built by the [NousResearch](nousresearch) team. I've been contributing plugins and skills since December 2025.`,
  },
  {
    slug: 'farzapedia',
    title: 'Farzapedia',
    category: 'projects',
    tags: ['ai', 'wiki', 'knowledge-base', 'second-brain'],
    created: '2026-04-07',
    updated: '2026-04-07',
    seeAlso: ['ai-native-memory', 'vibe-coding', 'hermes-agent'],
    body: `A personal, AI-agent-friendly "second brain" structured as a private Wikipedia. The core idea: take scattered personal data -- diary notes, chat logs, screenshots, meeting notes -- and have an LLM process it into clean, interlinked encyclopedia articles.

The wiki is a folder of markdown files with an \`index.md\` entry point. Any AI agent ([Claude Code](claude-code), [Cursor](cursor-editor), [Hermes](hermes-agent)) can browse it exactly like a human browses Wikipedia: start at the index, follow links, read articles, pull perfect context.

This approach deliberately avoids RAG and vector databases. File system navigation gives agents precise, reliable context without the noise of semantic search. The agent reads exactly what it needs -- no more, no less.

The self-updating mechanism works like a librarian: when new data arrives, the system either updates existing articles or creates new ones. Backlinks are maintained automatically. The index regenerates from article frontmatter.

Inspired by [Farza's original concept](farza-original-concept) and [Andrej Karpathy's idea](karpathy-idea-sharing) about sharing abstract ideas for AI agents to build on.`,
  },
  {
    slug: 'hermes-dashboard',
    title: 'Hermes Dashboard',
    category: 'projects',
    tags: ['dashboard', 'monitoring', 'react', 'websocket'],
    created: '2026-04-05',
    updated: '2026-04-07',
    seeAlso: ['hermes-agent', 'farzapedia', 'computer-use-plugin'],
    body: `Real-time monitoring dashboard and auto-generated wiki for [Hermes Agent](hermes-agent). Built with React 19, TypeScript, and Vite. Uses WebSocket for live session streaming and a Unix socket for event ingestion from the Python plugin.

The dashboard shows active agent sessions with phase tracking (processing, idle, awaiting input, needs approval), an activity feed of tool calls across all sessions, per-session context window visualization, and tool execution history.

The wiki section auto-generates from \`~/.hermes/\` -- it reads installed skills, plugins, config, memory files, and the agent's soul document. Everything is rendered as searchable, categorized reference pages. When the server is offline, it falls back to built-in mock data.

The cyberpunk aesthetic uses CRT scanlines, neon glow effects, and a dark color scheme. Fonts are Doto for display, Space Grotesk for body text, and Space Mono for monospace. Published under [Kori-x](kori) on GitHub.`,
  },
  {
    slug: 'island-app',
    title: 'Island App',
    category: 'projects',
    tags: ['ios', 'swift', 'mobile', 'hermes'],
    created: '2026-03-20',
    updated: '2026-04-02',
    seeAlso: ['hermes-agent', 'vibe-coding'],
    body: `An iOS app for interacting with [Hermes Agent](hermes-agent) on the go. Built with Swift and SwiftUI. Connects to the Hermes bridge server over WebSocket for real-time chat.

The app supports voice input, image attachments (which get routed to the vision pipeline), and push notifications for approval requests. It's designed as a companion -- not a replacement for the CLI, but a way to stay connected to active sessions from your phone.

Named after the Greek island myth. The Hermes ecosystem uses mythological naming throughout: [Icarus](icarus-plugin) for memory, Daedalus for configuration, and now Island for mobile access.`,
  },
  {
    slug: 'computer-use-plugin',
    title: 'Computer Use Plugin',
    category: 'projects',
    tags: ['plugin', 'automation', 'screenshots', 'hermes'],
    created: '2026-03-15',
    updated: '2026-04-07',
    seeAlso: ['hermes-agent', 'icarus-plugin'],
    body: `Claude Computer Use as a first-class plugin for [Hermes Agent](hermes-agent). Gives the agent autonomous desktop control through screenshots and mouse/keyboard input.

The plugin captures screenshots at configurable intervals, sends them through the vision pipeline for understanding, and translates high-level instructions into mouse clicks, keyboard shortcuts, and scroll actions. It supports multi-monitor setups and respects screen boundaries.

Safety mechanisms include: manual approval for destructive actions (file deletion, system settings), a configurable allowlist of applications, and automatic session recording for audit trails.

Published under [Kori-x](kori) on GitHub. Requires macOS accessibility permissions.`,
  },

  // ── People ────────────────────────────────────────────
  {
    slug: 'alex-chen',
    title: 'Alex Chen',
    category: 'people',
    tags: ['cofounder', 'engineer', 'friend'],
    created: '2026-01-10',
    updated: '2026-04-03',
    seeAlso: ['hermes-agent', 'yc-demo-day', 'vibe-coding'],
    body: `Met Alex at a hackathon in November 2025. He was building a code review tool that used tree-sitter for AST diffing. We started talking about agent architectures and ended up whiteboarding until 3am.

Alex has deep expertise in distributed systems -- he worked at Cloudflare on their edge runtime for three years before going indie. He introduced me to the idea of treating agent memory as a distributed consensus problem rather than a simple key-value store. That insight directly influenced the [Fabric Architecture](fabric-architecture).

We've been collaborating on [Hermes](hermes-agent) plugin development. Alex wrote the first version of the session search system and contributed the compression pipeline that uses Gemini Flash for context summarization.

He's pragmatic about AI tooling -- not a hype person. His philosophy: "if it doesn't save me 10 minutes a day, it's not worth the integration cost." That discipline keeps us from over-engineering things.`,
  },
  {
    slug: 'dr-sarah-kim',
    title: 'Dr. Sarah Kim',
    category: 'people',
    tags: ['mentor', 'researcher', 'nlp'],
    created: '2025-09-05',
    updated: '2026-03-15',
    seeAlso: ['ai-native-memory', 'fabric-architecture'],
    body: `NLP researcher at Stanford. Met her at a workshop on retrieval-augmented generation in September 2025. She was presenting work on structured knowledge bases outperforming vector search for multi-hop reasoning tasks.

Her research directly shaped my skepticism of RAG-first approaches. The key finding: when you give an LLM a well-organized file system of documents with clear navigation (table of contents, cross-references), it retrieves more accurately than cosine similarity on embeddings. This became the foundation of [Farzapedia's](farzapedia) design philosophy.

Sarah advised me on the [Fabric Architecture](fabric-architecture) -- specifically the decision to use flat markdown files over a graph database. Her argument: "the file system IS a graph database, and every programmer already knows the API."

She's now working on a paper about "navigable knowledge structures" for AI agents. I'm hoping to get [Farzapedia](farzapedia) cited as a reference implementation.`,
  },
  {
    slug: 'marcus-reeves',
    title: 'Marcus Reeves',
    category: 'people',
    tags: ['designer', 'collaborator', 'ui'],
    created: '2026-02-20',
    updated: '2026-04-01',
    seeAlso: ['hermes-dashboard', 'dieter-rams-principles'],
    body: `UI/UX designer who helped define the [Hermes Dashboard](hermes-dashboard) aesthetic. Met him through the Nous Research Discord. He has a background in demoscene art and retro computing interfaces.

Marcus developed the cyberpunk design language: the CRT scanlines, neon glow hierarchy, and the specific color palette (dark backgrounds with blue/red/green accents). His insight was that agent dashboards shouldn't look like generic SaaS products -- they should feel like mission control for something powerful and slightly dangerous.

He's influenced by [Dieter Rams](dieter-rams-principles) but with a maximalist twist. "Good design is honest about what the thing does. If it's an AI agent running autonomously on your computer, it should look like a control room, not a todo app."

Currently working on a visual identity system for the broader [Kori](kori) project.`,
  },

  // ── Concepts ──────────────────────────────────────────
  {
    slug: 'vibe-coding',
    title: 'Vibe Coding',
    category: 'concepts',
    tags: ['philosophy', 'development', 'workflow'],
    created: '2026-01-15',
    updated: '2026-04-05',
    seeAlso: ['claude-code', 'cursor-editor', 'hermes-agent', 'ai-native-memory'],
    body: `A development philosophy where you describe what you want at a high level and let AI agents handle the implementation details. Not about being lazy -- it's about operating at a higher level of abstraction.

The vibe coder focuses on: what the system should do, how it should feel, what the constraints are. The AI agent handles: file structure, syntax, boilerplate, dependency management, testing patterns. The human stays in the loop for architecture decisions, taste, and edge cases the AI misses.

Key principles:
- Ship fast, iterate based on what you see working
- Don't pre-architect -- let the shape emerge from usage
- Trust the agent for boilerplate, verify for logic
- Keep the feedback loop tight: describe -> generate -> test -> refine
- Treat code as disposable until it proves itself

The term was coined by [Andrej Karpathy](karpathy-idea-sharing) in early 2025. It resonated because it described what a lot of people were already doing with [Claude Code](claude-code) and [Cursor](cursor-editor) but didn't have a name for.

Anti-patterns: vibe coding is not "let the AI do everything and ship without reading it." You still need taste, judgment, and the ability to recognize when the AI is confidently wrong.`,
  },
  {
    slug: 'ai-native-memory',
    title: 'AI-Native Memory',
    category: 'concepts',
    tags: ['memory', 'agents', 'architecture'],
    created: '2026-02-01',
    updated: '2026-04-07',
    seeAlso: ['fabric-architecture', 'farzapedia', 'dr-sarah-kim', 'hermes-agent'],
    body: `The idea that personal knowledge systems should be designed for AI agents to consume, not just humans. Traditional note-taking apps optimize for human readability -- folders, tags, pretty formatting. AI-native memory optimizes for machine traversal.

Key properties of AI-native memory:
- **Flat file structure**: agents navigate files better than nested hierarchies
- **Explicit links**: \`[concept](concept.md)\` beats implicit semantic relationships
- **Frontmatter metadata**: structured YAML gives agents category, date, and tag info without parsing prose
- **Index file**: a single entry point that maps the entire knowledge space
- **Self-describing**: each article explains what it IS, not just what it contains

This is a reaction to RAG (Retrieval-Augmented Generation), which treats knowledge as an unstructured blob to be vector-searched. RAG works for general Q&A but falls apart for multi-hop reasoning: "what projects did the person I met at the hackathon contribute to?"

With AI-native memory, an agent can follow the chain: index -> [hackathon event] -> mentions [Alex Chen] -> contributed to [Hermes Agent] session search system. Each hop is a file read, not a probabilistic embedding lookup.

[Farzapedia](farzapedia) is the reference implementation. [Dr. Sarah Kim's](dr-sarah-kim) research on navigable knowledge structures validates the approach.`,
  },
  {
    slug: 'fabric-architecture',
    title: 'Fabric Architecture',
    category: 'concepts',
    tags: ['architecture', 'memory', 'hermes', 'distributed'],
    created: '2025-12-10',
    updated: '2026-03-28',
    seeAlso: ['hermes-agent', 'icarus-plugin', 'ai-native-memory', 'alex-chen'],
    body: `The persistent memory system used by [Hermes Agent](hermes-agent). "Fabric" is a shared directory of markdown files that any agent instance can read and write, creating a decentralized knowledge mesh.

The architecture is intentionally simple: a folder (\`~/.hermes/memories/\`) contains markdown files with YAML frontmatter. Files are organized by type (session summaries, decisions, observations, user profile). Any tool that can read/write files can participate in the fabric.

Why not a database? Because:
1. Markdown files are human-readable -- you can browse and edit them in any text editor
2. They work with git for version history
3. Any AI agent can read them without a client library
4. They're trivially portable between machines

The [Icarus Plugin](icarus-plugin) adds structured tools on top of the raw filesystem: \`fabric_recall\` for ranked retrieval, \`fabric_write\` for persisting entries, \`fabric_search\` for keyword search. These tools make the fabric accessible to agents that prefer tool calls over raw file operations.

The cross-agent aspect is key: if [Hermes](hermes-agent) learns something in a CLI session, that knowledge is immediately available to the Discord bot, the [Island App](island-app), or any other platform running the same agent. [Alex Chen](alex-chen) compared it to eventual consistency in distributed systems.`,
  },

  // ── Inspiration ───────────────────────────────────────
  {
    slug: 'studio-ghibli-philosophy',
    title: 'Studio Ghibli Philosophy',
    category: 'inspiration',
    tags: ['animation', 'craft', 'attention-to-detail'],
    created: '2026-01-20',
    updated: '2026-03-10',
    seeAlso: ['dieter-rams-principles', 'vibe-coding', 'marcus-reeves'],
    body: `What makes Ghibli films feel different: every frame has intention. Backgrounds aren't just backgrounds -- they tell you about the world. A kitchen scene shows what the characters eat, how they organize their space, what tools they value. Nothing is generic.

Miyazaki's process: he draws key frames himself, then the team fills in between. The vision stays coherent because one person holds the aesthetic truth. This maps directly to how I think about [vibe coding](vibe-coding) -- you set the direction and taste, the AI fills in the details, but you review every frame.

The documentary "10 Years with Hayao Miyazaki" showed his obsessive attention to the *weight* of things. How a character picks up a bag tells you how heavy it is, which tells you what's inside, which tells you about their journey. That level of implied information is what I want in software: the UI should tell you what the system does without reading documentation.

Applied to the [Hermes Dashboard](hermes-dashboard): [Marcus](marcus-reeves) and I spent hours on how the session phase indicator animates. A processing agent pulses differently than an idle one. The rhythm communicates state without labels.`,
  },
  {
    slug: 'dieter-rams-principles',
    title: 'Dieter Rams Principles',
    category: 'inspiration',
    tags: ['design', 'minimalism', 'industrial-design'],
    created: '2025-10-15',
    updated: '2026-02-22',
    seeAlso: ['studio-ghibli-philosophy', 'marcus-reeves', 'hermes-dashboard'],
    body: `Rams' ten principles for good design, applied to software:

1. **Good design is innovative** -- don't clone existing dashboards. The [Hermes Dashboard](hermes-dashboard) cyberpunk aesthetic exists because agent monitoring IS a new thing that deserves its own visual language.
2. **Good design makes a product useful** -- every UI element should answer a question the user has right now.
3. **Good design is aesthetic** -- because people trust and enjoy using beautiful tools.
4. **Good design makes a product understandable** -- the interface should be self-explanatory.
5. **Good design is unobtrusive** -- tools should not demand attention when not needed.
6. **Good design is honest** -- don't hide errors or make things look simpler than they are.
7. **Good design is long-lasting** -- avoid trends that will look dated in a year.
8. **Good design is thorough** -- every detail matters, down to the scrollbar styling.
9. **Good design is environmentally friendly** -- in software: don't waste compute, bandwidth, or the user's time.
10. **Good design is as little design as possible** -- remove until it breaks.

[Marcus Reeves](marcus-reeves) introduced me to the phrase "honest complexity" -- the idea that if the underlying system is complex (an autonomous AI agent), the UI should reflect that complexity in an organized way rather than hiding it behind false simplicity.`,
  },
  {
    slug: 'farza-original-concept',
    title: "Farza's Original Concept",
    category: 'inspiration',
    tags: ['farzapedia', 'knowledge-base', 'personal-wiki'],
    created: '2026-04-01',
    updated: '2026-04-07',
    seeAlso: ['farzapedia', 'ai-native-memory', 'karpathy-idea-sharing'],
    body: `@FarzaTV on X shared the concept of a super-personalized, AI-powered "second brain" built like a private Wikipedia -- but designed for AI agents, not humans.

The process: dump 2,500 raw personal entries (diary notes, Apple Notes, iMessage chats, screenshots) into an LLM. The LLM produces 400 clean, detailed Wikipedia-style articles. Topics span friends (full profiles with history), startups, research areas, favorite media, and random inspirations. Everything is heavily backlinked.

The key insight: traditional RAG-based retrieval sucks for personal knowledge. Vector search returns noisy, imprecise results. A file system of markdown articles with an index.md works better because AI agents can *navigate* it -- start at the index, follow links, read exactly the pages needed.

The "magic librarian" feature: when new data arrives, the system automatically updates 2-3 existing articles or creates new ones. The knowledge base is alive and self-organizing.

This connected with [Andrej Karpathy's idea](karpathy-idea-sharing) about sharing abstract concepts for other people's AI agents to build on. Farza demonstrated it in practice: he built the wiki for his agent, then shared the concept so anyone can recreate it.`,
  },
  {
    slug: 'karpathy-idea-sharing',
    title: "Karpathy's Idea Sharing",
    category: 'inspiration',
    tags: ['ai', 'open-source', 'philosophy'],
    created: '2026-03-28',
    updated: '2026-04-01',
    seeAlso: ['farza-original-concept', 'vibe-coding', 'ai-native-memory'],
    body: `Andrej Karpathy tweeted about sharing abstract ideas -- not finished code -- so other people's AI agents can build and customize them. The concept: if you describe a system well enough, someone else's agent can implement a personalized version.

This is the inverse of traditional open source. Instead of sharing the code and letting people configure it, you share the *concept* and let each person's AI agent build a bespoke implementation. The code is disposable; the idea is the product.

This connects to [vibe coding](vibe-coding): if code is increasingly generated, the value moves upstream to taste, architecture, and the ability to describe what you want clearly. Sharing a clear description of a system becomes more valuable than sharing the repo.

[Farza](farza-original-concept) demonstrated this by sharing the Farzapedia concept as a gist/skill rather than a full application. Anyone with an AI agent can take the description and build their own version tailored to their data sources and preferences.`,
  },

  // ── Tools ─────────────────────────────────────────────
  {
    slug: 'claude-code',
    title: 'Claude Code',
    category: 'tools',
    tags: ['ai', 'cli', 'coding', 'anthropic'],
    created: '2025-08-20',
    updated: '2026-04-07',
    seeAlso: ['vibe-coding', 'hermes-agent', 'cursor-editor'],
    body: `Anthropic's CLI tool for AI-assisted coding. Runs in the terminal, has access to the filesystem, can execute commands, edit files, and search codebases. My primary [vibe coding](vibe-coding) tool alongside [Hermes](hermes-agent).

What makes it different from chat-based AI: Claude Code has persistent context about your project. It reads your files, understands your codebase structure, and maintains memory across sessions via \`~/.claude/\`. It can run tests, check build output, and iterate on failures autonomously.

I use it for: rapid prototyping, refactoring, writing tests, debugging, and exploring unfamiliar codebases. The agent workflow (plan -> implement -> verify) maps well to how I naturally work.

The memory system at \`~/.claude/projects/\` stores per-project context and user preferences. CLAUDE.md files act as project-specific instructions that persist across sessions. This is a simpler version of what [Farzapedia](farzapedia) aims to be -- but scoped to coding context only.

Key limitation: it's single-session focused. Cross-project knowledge doesn't transfer well. That's exactly the gap [Farzapedia](farzapedia) and [AI-native memory](ai-native-memory) systems are trying to fill.`,
  },
  {
    slug: 'cursor-editor',
    title: 'Cursor',
    category: 'tools',
    tags: ['editor', 'ai', 'ide', 'vscode'],
    created: '2025-06-10',
    updated: '2026-03-20',
    seeAlso: ['claude-code', 'vibe-coding'],
    body: `AI-native code editor forked from VS Code. Provides inline completions, chat, and a composer mode for multi-file edits. I used it heavily before switching to [Claude Code](claude-code) for most work.

Cursor's strength is the visual feedback loop: you see changes in context, can accept/reject per-line, and the diff view is excellent. For frontend work where you need to see layout changes, it's still better than a CLI tool.

Where it falls short: the agent mode doesn't have real terminal access. It can suggest commands but can't run them and react to output. [Claude Code](claude-code) handles the full loop: edit, run, see error, fix, run again.

I still use Cursor for: reviewing large diffs, visual UI work, and quick edits where I don't need the full agent loop. It's a scalpel where Claude Code is an autonomous surgeon.`,
  },
  {
    slug: 'obsidian',
    title: 'Obsidian',
    category: 'tools',
    tags: ['notes', 'markdown', 'knowledge-management'],
    created: '2025-04-01',
    updated: '2026-04-05',
    seeAlso: ['farzapedia', 'ai-native-memory', 'icarus-plugin'],
    body: `Markdown-based knowledge management app with bidirectional linking. Used it as my primary note-taking tool before moving to [AI-native memory](ai-native-memory) approaches.

My Obsidian vault at \`~/Documents/IcarusVault/\` still holds fabric patterns and agent session notes from the [Icarus Plugin](icarus-plugin). It's organized into fabric (context, output, patterns, sessions) and icarus (timestamped agent notes) directories.

What Obsidian does well: the graph view showing note connections, the plugin ecosystem, and the local-first approach (all files are just markdown on disk). What it doesn't do: it's designed for humans, not AI agents. The linking syntax (\`[[note]]\`) isn't standard markdown, the folder structure is optimized for visual browsing, and there's no index file for programmatic navigation.

[Farzapedia](farzapedia) takes what works about Obsidian (markdown files, backlinks, local-first) and redesigns it for AI agents: standard markdown links, flat structure, YAML frontmatter, and an \`index.md\` entry point.`,
  },
  {
    slug: 'icarus-plugin',
    title: 'Icarus Plugin',
    category: 'tools',
    tags: ['plugin', 'memory', 'hermes', 'training'],
    created: '2025-12-20',
    updated: '2026-04-07',
    seeAlso: ['hermes-agent', 'fabric-architecture', 'obsidian', 'ai-native-memory'],
    body: `Cross-platform memory and self-training plugin for [Hermes Agent](hermes-agent). Provides six tools: fabric_recall (ranked retrieval), fabric_write (persist entries), fabric_search (keyword grep), fabric_export (training data export), fabric_train (fine-tuning via Together AI), and fabric_train_status.

Four lifecycle hooks automatically manage memory: on_session_start loads context and cross-agent feedback, pre_llm_call injects relevant memories on topic change, post_llm_call captures decisions and learnings, on_session_end writes session summaries and updates MEMORY.md.

The plugin reads and writes to an [Obsidian](obsidian) vault for human-readable storage, while maintaining its own state database for efficient retrieval. Session notes are timestamped and categorized (decisions, sessions, game logs, general notes).

Currently disabled (\`icarus.disabled\`) while the memory system is being rethought. The [Farzapedia](farzapedia) approach of wiki-style articles may replace the raw session log format, giving both humans and agents a better knowledge structure.`,
  },

  // ── Reading ───────────────────────────────────────────
  {
    slug: 'designing-data-intensive-applications',
    title: 'Designing Data-Intensive Applications',
    category: 'reading',
    tags: ['book', 'distributed-systems', 'architecture'],
    created: '2025-07-10',
    updated: '2025-12-15',
    seeAlso: ['fabric-architecture', 'alex-chen'],
    body: `Martin Kleppmann's book on distributed systems fundamentals. The chapters on replication and consistency models directly influenced the [Fabric Architecture](fabric-architecture) design.

Key takeaway: the simplest correct solution usually wins. Kleppmann shows how multi-leader replication is technically superior but operationally brutal, while single-leader is boring but predictable. Applied to agent memory: a shared filesystem with last-write-wins is "wrong" in distributed systems terms, but it's the right tradeoff for a personal knowledge base where conflicts are rare and human review is cheap.

[Alex Chen](alex-chen) recommended this book when I was overcomplicating the memory system with CRDTs. His exact words: "you don't need conflict resolution when there's one user and the conflicts are which version of a session summary to keep."`,
  },
  {
    slug: 'the-art-of-doing-science',
    title: 'The Art of Doing Science and Engineering',
    category: 'reading',
    tags: ['book', 'engineering', 'thinking'],
    created: '2025-09-01',
    updated: '2026-01-20',
    seeAlso: ['vibe-coding', 'dieter-rams-principles'],
    body: `Richard Hamming's lectures on how to do great work. The core message: actively choose what problems to work on, and regularly ask "what are the important problems in my field?"

The chapter on "You and Your Research" hit hard. Hamming argues that the difference between productive and unproductive researchers isn't intelligence -- it's the willingness to work on important problems and the courage to attack them directly instead of nibbling around the edges.

Applied to my work: the important problem in AI tooling right now isn't making agents smarter (that's Anthropic/OpenAI's job). It's making agents *remember* and *share knowledge* effectively. That's why [Farzapedia](farzapedia) and [AI-native memory](ai-native-memory) are where I'm spending time, not on yet another chat wrapper.

Hamming also talks about the importance of working with your office door open -- staying connected to what others are doing. The modern equivalent: building in public, sharing concepts like [Karpathy](karpathy-idea-sharing) and [Farza](farza-original-concept) do.`,
  },

  // ── Events ────────────────────────────────────────────
  {
    slug: 'yc-demo-day',
    title: 'YC W26 Demo Day',
    category: 'events',
    tags: ['startup', 'demo', 'networking'],
    created: '2026-03-20',
    updated: '2026-03-22',
    seeAlso: ['alex-chen', 'hermes-agent', 'farzapedia'],
    body: `Attended YC W26 Demo Day on March 20, 2026. Went primarily to see what other teams were building in the AI agent space. [Alex Chen](alex-chen) got us passes through a friend at YC.

Notable observations:
- 40% of the batch was AI-related (up from 25% in W25)
- Three companies were building "personal AI" products -- none had cracked the memory/knowledge problem well
- One team (Memex AI) was doing RAG-based personal knowledge but admitted retrieval quality was their biggest issue
- Another team was building a "digital twin" that struggled with context limits

The conversations reinforced the [Farzapedia](farzapedia) thesis: the right approach to personal AI memory isn't vector search, it's structured navigation. The teams using RAG were hitting the same walls [Dr. Sarah Kim's](dr-sarah-kim) research predicted.

Met several people interested in the [Hermes](hermes-agent) plugin ecosystem. One team asked about building a Hermes plugin for their product.`,
  },
  {
    slug: 'first-deployment',
    title: 'First Hermes Deployment',
    category: 'events',
    tags: ['milestone', 'hermes', 'launch'],
    created: '2025-12-01',
    updated: '2025-12-01',
    seeAlso: ['hermes-agent', 'fabric-architecture', 'icarus-plugin'],
    body: `December 1, 2025: first time running [Hermes Agent](hermes-agent) with a full plugin stack -- [Icarus](icarus-plugin) for memory, custom skills for my workflow, and the initial [Fabric Architecture](fabric-architecture) for persistent state.

The experience was transformative. Within the first session, the agent remembered context from its system prompt loading, made decisions based on my USER.md profile, and wrote a session summary that was actually useful for the next session. It felt like the agent had continuity for the first time.

What broke: memory retrieval was too aggressive (injecting irrelevant context), the session summaries were too verbose (filled context windows fast), and the fabric write operations conflicted when I ran two sessions simultaneously.

All of these problems led to specific architectural decisions: relevance scoring for recall, configurable summary length, and the last-write-wins policy for fabric files. Sometimes the best learning comes from watching your system fail gracefully.`,
  },

  // ── More Concepts ─────────────────────────────────────
  {
    slug: 'kori',
    title: 'Kori',
    category: 'projects',
    tags: ['organization', 'github', 'brand'],
    created: '2026-03-01',
    updated: '2026-04-07',
    seeAlso: ['hermes-dashboard', 'computer-use-plugin', 'farzapedia'],
    body: `The GitHub organization (Kori-x) and identity under which open-source [Hermes](hermes-agent) ecosystem tools are published. Currently hosts [Hermes Dashboard](hermes-dashboard) and the [Computer Use Plugin](computer-use-plugin).

The name comes from Japanese (meaning "ice" or as a name meaning "my heart"). Chosen because it's short, memorable, and doesn't conflict with existing tech brands.

The vision for Kori: a collection of high-quality, opinionated tools for the Hermes Agent ecosystem. Not a company -- an open-source identity. Each tool is standalone but designed to work together. [Marcus Reeves](marcus-reeves) is working on a visual identity system.

[Farzapedia](farzapedia) is the next planned release.`,
  },
  {
    slug: 'nousresearch',
    title: 'NousResearch',
    category: 'projects',
    tags: ['ai', 'research', 'open-source', 'models'],
    created: '2025-08-01',
    updated: '2026-04-01',
    seeAlso: ['hermes-agent'],
    body: `The research team behind [Hermes Agent](hermes-agent) and the Hermes series of language models. NousResearch focuses on open-source AI -- they release models, tools, and research freely.

Hermes (the model family) was trained to be particularly good at function calling and agentic behavior. Hermes Agent (the framework) was built to showcase and leverage these capabilities, but works with any LLM provider.

The community is active on Discord. Most [Hermes Agent](hermes-agent) plugin development happens there -- contributors share skills, report bugs, and collaborate on architecture decisions. The [Kori](kori) tools were born out of this community.`,
  },
]
