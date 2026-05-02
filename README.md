<div align="center">

```
                     ░░░░░░░░░░░                  
                 ░░░░░░░░░░░░░░░░░                
              ░░░░░░░░░░░░░░░░░░░░░░              
           ░░░░░░░░░░░░░░░░░░░░░░░░░░░            
          ░░░░░░░░░░░▒▒░░░░░░░░░░░░░░░░           
         ░░░░░░░░░░▒▒▒▒▒░░░░░░░░░░░░░░░░          
          ░░░░░░░░░░▒▒▒░░░░░░░░░░░░░░░░           
           ░░░░░░░░░░░░░░░░░░░░░░░░░░░            
              ░░░░░░░░░░░░░░░░░░░░░░              
                 ░░░░░░░░░░░░░░░░░                
                     ░░░░░░░░░░░                  
```

# CANTO

### The Infinite AI Encyclopedia

**Live Site:** [https://canto-1r3.pages.dev/](https://canto-1r3.pages.dev/)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Built with](https://img.shields.io/badge/Built_with-React_+_Vite-61DAFB.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

</div>

---

**Canto** is an open-source, AI-powered encyclopedia that generates comprehensive, fact-checked articles on any topic in real time. It pulls from 5 verified knowledge sources, uses a 7-provider AI fallback chain, and renders rich entries with ASCII art, interactive cross-references, and kinetic typography.

## 🖼️ Screenshots

<div align="center">
  <img src="screenshots/Screenshot (562).png" width="800" alt="Canto Landing Page" />
  <br/><em>Aesthetic ASCII Space Landing Page</em><br/><br/>
  <img src="screenshots/Screenshot (563).png" width="800" alt="Canto Article View" />
  <br/><em>Infinite AI-Generated Article with ASCII Representation</em><br/><br/>
  <img src="screenshots/Screenshot (564).png" width="800" alt="Canto Local Library" />
  <br/><em>Personalized Local Library & Favorites</em>
</div>

## ✨ Features

| Category | Feature |
|---|---|
| 🧠 **AI** | 7-provider fallback chain — Groq → GitHub DeepSeek V3 → GitHub Grok mini 3 → CF Gemini Flash → CF Llama 3.3 70B → Ollama Qwen3 80B → Ollama Nemotron 30B |
| 📚 **Knowledge** | Wikipedia, NASA, CORE Academic, Open Library, Jina/DuckDuckGo web search — all fetched in parallel before generation |
| 🎨 **ASCII Art** | AI-generated recognizable visual art for every topic |
| ◈ **Research** | Inline panel: AI follow-ups, source citations, full-text search, folders, starred entries, 7-day analytics |
| ⚡ **Streaming** | Token-by-token SSE streaming with smooth CSS fade-in animation |
| 📖 **Reading** | Distraction-free reading mode, font size slider (80–150%) |
| 🗄️ **Storage** | IndexedDB v3: cache, history, favorites, folders, analytics — all local, no cloud |
| 🔗 **Sharing** | Base64-encoded shareable article URLs |
| 🔒 **Security** | Server-side API proxy, IP-based rate limiting (15/day), no client key exposure |
| 🎭 **Themes** | Classic, Obsidian, Dark Neon, Vintage |
| 📱 **PWA** | Installable on mobile and desktop, offline caching via service worker |
| 🔔 **Sound** | Optional Web Audio API sound effects (search complete, word click) |

## 🤖 AI Provider Chain

| Priority | Provider | Model | Key Variable |
|---|---|---|---|
| 1 | **Groq** | `llama-3.1-8b-instant` | `GROQ_API_KEY` |
| 2 | **GitHub Models** | `DeepSeek-V3` | `GITHUB_DEEPSEEK_KEY` |
| 3 | **GitHub Models** | `grok-3-mini` | `GITHUB_GROK_KEY` |
| 4 | **Cloudflare Workers AI** | `@cf/google/gemini-flash-1.5` | `CF_ACCOUNT_1_TOKEN` |
| 5 | **Cloudflare Workers AI** | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | `CF_ACCOUNT_2_TOKEN` |
| 6 | **Ollama Cloud** | `qwen3-next:80b-cloud` | `OLLAMA_DEEPSEEK_KEY` |
| 7 | **Ollama Cloud** | `nemotron-3-nano:30b-cloud` | `OLLAMA_KIMI_KEY` |

All requests are proxied server-side — API keys are never exposed to the client bundle.

## 📡 Knowledge Sources

Fetched in parallel before every AI generation:

| Source | Data | Auth |
|---|---|---|
| **Wikipedia REST API** | Article summaries (≤1500 chars), citation-stripped | None |
| **NASA Images API** | Space & science image descriptions | Free key |
| **CORE Academic** | Open-access paper abstracts (LaTeX-stripped) | Free key |
| **Open Library / Internet Archive** | Related book titles and authors | None |
| **Jina AI + DuckDuckGo** | Live web search snippets (boilerplate-filtered) | None |



## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (React 18 + Vite)                │
│                                                          │
│  SearchBar ──► knowledgeService ──► aiService            │
│                     │                    │               │
│                     ▼                    ▼               │
│              /api/knowledge          /api/ai             │
└─────────────────────┬────────────────────┬──────────────┘
                      │                    │
┌─────────────────────▼────────────────────▼──────────────┐
│           SERVER (Vite Dev / Cloudflare Pages)           │
│                                                          │
│  Knowledge (parallel)       AI Provider Cascade          │
│  ┌──────────┐ ┌──────┐     ┌──────────────────────────┐ │
│  │Wikipedia │ │ NASA │     │ 1. Groq Llama 3.1 8B     │ │
│  ├──────────┤ ├──────┤     │ 2. GitHub DeepSeek V3    │ │
│  │  CORE    │ │ Jina │     │ 3. GitHub Grok mini 3    │ │
│  ├──────────┤ └──────┘     │ 4. CF Gemini Flash 1.5   │ │
│  │Open Lib. │              │ 5. CF Llama 3.3 70B      │ │
│  └──────────┘              │ 6. Ollama Qwen3 80B      │ │
│                            │ 7. Ollama Nemotron 30B   │ │
│                            └──────────────────────────┘ │
│                                                         │
│  /api/rate-limit — IP-keyed, 15/day                      │
│  Security headers — XSS, Frame, CORS, Referrer           │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
git clone https://github.com/sah-rohit/Canto.git
cd Canto
npm install
cp .env.example .env   # fill in your API keys
npm run dev            # → http://localhost:3000
```

```bash
npm run build && npm run preview   # production build
```

## 🔑 API Keys

| Variable | Service | Purpose | Free? |
|---|---|---|---|
| `GROQ_API_KEY` | [Groq](https://console.groq.com) | Primary AI | ✅ |
| `GITHUB_DEEPSEEK_KEY` | [GitHub Models](https://github.com/marketplace/models) | AI fallback | ✅ |
| `GITHUB_GROK_KEY` | [GitHub Models](https://github.com/marketplace/models) | AI fallback | ✅ |
| `CF_ACCOUNT_1_ID` | [Cloudflare](https://dash.cloudflare.com) | CF account 1 | ✅ |
| `CF_ACCOUNT_1_TOKEN` | [Cloudflare](https://dash.cloudflare.com) | AI fallback (Gemini Flash) | ✅ |
| `CF_ACCOUNT_2_ID` | [Cloudflare](https://dash.cloudflare.com) | CF account 2 | ✅ |
| `CF_ACCOUNT_2_TOKEN` | [Cloudflare](https://dash.cloudflare.com) | AI fallback (Llama 3.3 70B) | ✅ |
| `OLLAMA_DEEPSEEK_KEY` | [Ollama Cloud](https://ollama.com) | AI fallback (Qwen3 80B) | Paid |
| `OLLAMA_KIMI_KEY` | [Ollama Cloud](https://ollama.com) | AI fallback (Nemotron 30B) | Paid |
| `NASA_API_KEY` | [NASA](https://api.nasa.gov) | Knowledge context | ✅ |
| `CORE_API_KEY` | [CORE](https://core.ac.uk/services/api) | Academic context | ✅ |

Wikipedia, Open Library, Internet Archive, Jina AI, and DuckDuckGo require no authentication.

## 📁 Project Structure

```
Canto/
├── index.html                    # CSS variables, themes, animations, responsive styles
├── index.tsx                     # React entry point
├── App.tsx                       # Root — routing, state, nav, wiki layout
├── components/
│   ├── ContentDisplay.tsx        # Article renderer, word highlighting
│   ├── ResearchPanel.tsx         # Inline research: follow-ups, sources, search, library, analytics
│   ├── LandingPage.tsx           # Homepage with ASCII space art
│   ├── SearchBar.tsx             # Search input with autocomplete
│   ├── AsciiArtDisplay.tsx       # ASCII art viewer
│   ├── LoadingSkeleton.tsx       # Animated loading state
│   ├── StaticPage.tsx            # About, FAQ, Pricing, Privacy, Terms, Open Source, Library
│   ├── DidYouKnow.tsx            # Fact widget
│   ├── RelatedTopics.tsx         # AI-suggested related topics
│   ├── StartupAnimation.tsx      # Boot sequence
│   ├── ErrorBoundary.tsx         # React error boundary
│   ├── ToastContext.tsx           # Global notifications
│   └── UIComponents.tsx          # CantoDialog, CantoSlider, CantoNotification
├── services/
│   ├── aiService.ts              # 7-provider AI chain, follow-ups, summaries
│   ├── knowledgeService.ts       # Multi-source context fetcher + sanitiser
│   ├── dbService.ts              # IndexedDB v3: cache, history, folders, analytics
│   ├── rateLimitService.ts       # Hybrid IP + client rate limiting
│   ├── soundService.ts           # Web Audio API sound effects
│   └── geminiService.ts          # Legacy (unused in production)
├── functions/api/
│   ├── ai.ts                     # Cloudflare Pages AI proxy (all 7 providers)

│   ├── knowledge.ts              # Cloudflare Pages knowledge aggregator
│   ├── rate-limit.ts             # CF rate limit checker
│   └── rate-limit-record.ts      # CF rate limit recorder
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── canto-icon.svg            # App icon
├── vite.config.ts                # Dev server middleware (all API routes)
├── .env.example                  # Key template
└── LICENSE                       # Apache 2.0
```

## 🔒 Security

- **No client-side key exposure** — all keys in server-side middleware; client bundle gets `'SERVER_SIDE_ONLY'`
- **IP-based rate limiting** — 15 searches/day per IP, tracked in-memory server-side across all browsers
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- **`.env` gitignored** — secrets never committed
- **No tracking** — no cookies, no analytics, no PII collection

## 🤝 Contributing

1. Fork → `git checkout -b feature/my-feature`
2. Commit → `git commit -m 'Add my feature'`
3. Push → `git push origin feature/my-feature`
4. Open a Pull Request

Good areas: new AI providers, new knowledge sources, themes, i18n, performance.

## 📄 License

**Apache License 2.0** — see [LICENSE](LICENSE).

## 🙏 Acknowledgments

- [Groq](https://groq.com) — Ultra-fast LLM inference
- [GitHub Models](https://github.com/marketplace/models) — DeepSeek V3 and Grok mini 3
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) — Gemini Flash, Llama 3.3
- [Ollama](https://ollama.com) — Qwen3 Next 80B and Nemotron 3 Nano 30B
- [Wikipedia](https://wikipedia.org) — The world's encyclopedia
- [NASA](https://nasa.gov) — Space and science data
- [CORE](https://core.ac.uk) — Open access academic research
- [Internet Archive / Open Library](https://archive.org) — Universal access to knowledge
- [Jina AI](https://jina.ai) — Web content extraction

---

<div align="center">

**Built with 🌙 by [Sonata Interactive](https://github.com/sah-rohit)**

*Knowledge should be infinite, accessible, and beautiful.*

</div>
