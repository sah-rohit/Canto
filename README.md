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
  <img src="screenshots/Screenshot (565).png" width="800" alt="Canto Landing Page" />
  <br/><em>Aesthetic ASCII Space Landing Page</em><br/><br/>
  <img src="screenshots/Screenshot (566).png" width="800" alt="Canto Article View - Variant 1" />
  <br/><em>Dynamic Streaming Article with ASCII Representation</em><br/><br/>
  <img src="screenshots/Screenshot (567).png" width="800" alt="Canto Article View - Variant 2" />
  <br/><em>Dynamic Streaming Article with ASCII Representation (Variant)</em><br/><br/>
  <img src="screenshots/Screenshot (568).png" width="800" alt="Canto Labs Suite" />
  <br/><em>Source & Citation and beyond</em><br/><br/>
  <img src="screenshots/Screenshot (569).png" width="800" alt="Canto Advanced Research Panel" />
  <br/><em>Inline Research Panel & Analytics</em><br/><br/>
  <img src="screenshots/Screenshot (570).png" width="800" alt="Canto Local Library" />
  <br/><em>Personalized Local Library & Favorites</em>
</div>


## ✨ Features

| Category | Feature |
|---|---|
| 🧠 **AI** | 7-provider fallback chain — Groq → GitHub DeepSeek V3 → GitHub Grok mini 3 → CF Gemini Flash → CF Llama 3.3 70B → Ollama Qwen3 80B → Ollama Nemotron 30B |
| 📚 **Knowledge** | Wikipedia, NASA, CORE Academic, Open Library, Jina/DuckDuckGo web search — all fetched in parallel before generation |
| 🎨 **ASCII Art** | AI-generated recognizable visual art for every topic |
| 🧪 **Canto Labs** | Advanced deep exploration suite featuring Evolution & Time, Mind Topology Graphs, Transparency traces (ECDI), Lens/Comparisons, and Study tools |
| 🔍 **Advanced Search** | Context modifiers for Lenses, variable Search Depth (0.5 to 2 credits), Tone adjustments, Length settings, and Dynamic Source toggling |
| ◈ **Research** | Inline panel: AI follow-ups, source citations, full-text search, folders, starred entries, 7-day analytics |
| ⚡ **Streaming** | Token-by-token SSE streaming with smooth CSS fade-in animation |
| 📖 **Reading** | Distraction-free reading mode, font size slider (80–150%) |
| 🗄️ **Storage** | IndexedDB v3: cache, history, favorites, folders, analytics — all local, no cloud |
| 🔗 **Sharing** | Base64-encoded shareable article URLs |
| 🔀 **Threading & Diffing** | Full side-by-side view comparisons with historical versions, and branching thread paths to track your reading trail |
| ♿ **Accessibility** | Built-in dyslexia-friendly OpenDyslexic font support and high-contrast theme toggles |
| 🏷️ **Tagging** | Dynamic customizable article tagging (e.g. `#physics`) for quick lookup and categorization |
| 🔒 **Security** | Server-side API proxy, IP-based rate limiting (15/day), no client key exposure |
| 🎭 **Themes** | Classic, Obsidian, Dark Neon, Vintage, High Contrast |
| 📱 **PWA** | Installable on mobile and desktop, offline caching via service worker |
| 🔔 **Sound** | Optional Web Audio API sound effects (search complete, word click) |

---

## 🧪 Canto Labs — Advanced Knowledge Layers

**Canto Labs** introduces cutting-edge analysis toolsets for deep, analytical topic dissection directly embedded within each article page:

### 1. Evolution & Time
* **Temporal Viewpoints:** Dive into specific era slices (e.g. Pre-2000, 2000-2015, 2016-Present).
* **As-of-Year Layer:** Travel back in time via the interactive time slider to see context through historical lenses up to the present day.
* **Chronological Timelines:** Auto-extract timelines and important event logs.
* **Future Projections:** Access highly detailed AI extrapolation paths and speculative developments.

### 2. Mind Graph (Topology)
* **Topology & Genealogies:** Automatically maps out intellectual dependencies, prerequisites, and conceptual theories.
* **Local Persistence:** Save, export, and load your interactive map structures directly within local storage for instant retrieval.
* **Interactive Tooltips:** Deep dive via on-hover tooltip explanations for every conceptual node.

### 3. Transparency & Meta
* **AI Meta-Analysis:** Demystify the reasoning cascade, identifying the underlying analytical process behind the entry.
* **Academic Citations Trail:** Extract primary sources, authoritative excerpts, and references.
* **Formal & Mathematical Notations:** Formulate the concept as mathematical equations, formal logic frameworks, regex, or BNF syntax.
* **Epistemic Certainty / Disagreement Index (ECDI):** Gauge consensus, points of friction, and scholarly debate.
* **Etymology & Linguistic Roots:** Trace origins and translation sequences across eras.

### 4. Comparison & Adapt
* **Cross-Topic Comparative Matrix:** Juxtapose the core subject against any custom alternative topic to construct direct analytical tables.
* **Before & After Lens:** Analyze radical shifts across specific historical breakthrough moments.
* **Contrasting Viewpoints:** Identify opposing schools of thought or controversial debates.
* **Custom Perspectives:** View information through dedicated lenses such as a 10-year-old child, a skeletal legal framework, a biological standpoint, or a critical skeptic.
* **Universal Metric/Scaling:** Proportional analogies to simplify vast spatial, physical, or technical metrics.

### 5. Study Tools
* **Interactive Retention Checks:** Generates 3 customizable questions with an automated scoring and explanation engine.
* **Sequel Entries:** Learn exactly what occurred directly after the topic's main timeline.
* **Offline Knowledge Packs:** Archive all generated entries, knowledge graphs, and transparency metrics in persistent JSON format.

---

## 🔍 Advanced Search & Research Modifiers

Customize definitions directly from the dynamic search modifier row to fit your specific academic or analytical style:

* **Analytical Lenses:** Choose from `Standard`, `Academic`, `Beginner`, `Historical`, `Controversial`, or `Future Implications`.
* **Search Depth Control:**
  * `Mini` — High-velocity concise summaries (0.5 credits).
  * `Standard` — Thorough encyclopedic coverage (1.0 credit).
  * `Deep` — High-intensity multi-cascade intelligence retrieval (2.0 credits).
* **Tone Selection:** Modify the narrative delivery using `Standard`, `Academic`, `Simple`, or `Technical`.
* **Article Length Options:** Set the final entry size to `Full`, `Summary`, or `Deep Dive`.
* **Dynamic Source Filters:** Manually override available sources (e.g., Wikipedia, NASA, CORE Academic, Web Search) to tailor context before execution.

---

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
├── index.css                     # Core styling, typography, and theme definitions
├── index.tsx                     # React entry point
├── App.tsx                       # Root — routing, state, nav, wiki layout
├── components/
│   ├── ContentDisplay.tsx        # Article renderer, word highlighting
│   ├── ResearchPanel.tsx         # Inline research: follow-ups, sources, search, library, analytics
│   ├── LandingPage.tsx           # Homepage with ASCII space art
│   ├── SearchBar.tsx             # Search input with autocomplete
│   ├── AsciiArtDisplay.tsx       # ASCII art viewer
│   ├── CantoLabs.tsx             # Advanced analytical & specialized knowledge toolsuite
│   ├── LoadingSkeleton.tsx       # Animated loading state
│   ├── StaticPage.tsx            # About, FAQ, Pricing, Privacy, Terms, Open Source, Library
│   ├── DidYouKnow.tsx            # Fact widget
│   ├── RelatedTopics.tsx         # AI-suggested related topics
│   ├── StartupAnimation.tsx      # Boot sequence
│   ├── MoonAscii.tsx             # Lunar/Celestial ASCII art visualization
│   ├── Starfield.tsx             # Celestial background starfield engine
│   ├── ErrorBoundary.tsx         # React error boundary
│   ├── ToastContext.tsx          # Global notifications
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
├── tsconfig.json                 # TypeScript compiler configuration
├── package.json                  # Dependencies, scripts, and project metadata
├── .env.example                  # Environmental keys template
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
