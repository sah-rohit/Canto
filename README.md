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

**Canto** is an open-source, AI-powered encyclopedia that generates comprehensive, fact-checked articles on any topic in real time. Unlike traditional wikis with static pages, Canto pulls from multiple verified knowledge sources and uses a cascading AI fallback chain to synthesize rich, engaging entries — complete with ASCII art, interactive cross-references, tables, and kinetic typography.

## 🖼️ Screenshots

<div align="center">
  <img src="screenshots/Screenshot (562).png" width="800" alt="Canto Landing Page" />
  <br/>
  <em>Aesthetic ASCII Space Landing Page</em>
  <br/><br/>
  <img src="screenshots/Screenshot (563).png" width="800" alt="Canto Article View" />
  <br/>
  <em>Infinite AI-Generated Article with ASCII Representation</em>
  <br/><br/>
  <img src="screenshots/Screenshot (564).png" width="800" alt="Canto Local Library" />
  <br/>
  <em>Personalized Local Library & Favorites</em>
</div>

## ✨ Features

- 🧠 **5-Provider AI Fallback Chain** — Groq → GitHub DeepSeek V3 → GitHub Grok mini 3 → Ollama Qwen3 Next 80B → Ollama Nemotron 3 Nano 30B, with automatic failover
- 📚 **Knowledge-Enriched Articles** — Every article is grounded by Wikipedia, NASA, Internet Archive, and CORE Academic databases before AI generation
- 🎨 **ASCII Art Generation** — AI-generated visual representations for every topic, with robust JSON extraction and fallback
- 🕒 **Rate Limit Timer** — Live countdown showing exactly when your daily credits reset
- 📖 **Reading Mode** — Distraction-free, centered interface for deep reading
- 📏 **Dynamic Font Scaling** — Custom slider (80–150%) for personalized accessibility
- 📂 **Local Library** — Instant access to your search history and starred favorites (no cloud storage, fully private)
- 📥 **Download & Export** — Save articles as `.TXT` or print-to-`.PDF`
- 🔊 **Text-to-Speech** — Listen to any article with browser-native TTS
- 🔗 **Shareable Links** — Share any article via a base64-encoded URL (viewable for free)
- 🔒 **IP-Based Rate Limiting** — Server-side abuse prevention (15 searches/day per IP, cross-browser)
- 🎭 **4 Rich Themes** — Classic, Obsidian, Dark Neon, and Vintage
- 📱 **Progressive Web App** — Installable on mobile and desktop with offline caching
- ⚡ **Streaming Responses** — Content streams token-by-token for instant feedback
- 🗄️ **IndexedDB Caching** — Articles cached locally for instant re-reads without using credits

## 🤖 AI Provider Chain

Canto uses a cascading fallback system — if one provider is unavailable or rate-limited, the next one is tried automatically:

| Priority | Provider | Model | Key |
|---|---|---|---|
| 1 | **Groq** | `llama-3.1-8b-instant` | `GROQ_API_KEY` |
| 2 | **GitHub Models** | `DeepSeek-V3` | `GITHUB_DEEPSEEK_KEY` |
| 3 | **GitHub Models** | `grok-3-mini` | `GITHUB_GROK_KEY` |
| 4 | **Ollama Cloud** | `qwen3-next:80b-cloud` | `OLLAMA_DEEPSEEK_KEY` |
| 5 | **Ollama Cloud** | `nemotron-3-nano:30b-cloud` | `OLLAMA_KIMI_KEY` |

All requests are proxied server-side — no API keys are ever exposed to the client bundle.

## 📡 Knowledge Sources

Before generating any article, Canto fetches real-world context from multiple sources in parallel:

| Source | Data | Auth |
|---|---|---|
| **Wikipedia** | Article summaries (up to 1500 chars) | None required |
| **NASA Images API** | Space & science image descriptions | Free key |
| **CORE Academic** | Open-access paper abstracts | Free key |
| **Open Library / Internet Archive** | Related book titles and authors | None required |
| **Web Crawler (Jina + DuckDuckGo)** | Live search snippets | None required |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (React + Vite)                   │
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
│  Knowledge Aggregation          AI Provider Proxy        │
│  ┌──────────┐ ┌──────┐         ┌──────────────────────┐ │
│  │Wikipedia │ │ NASA │         │ 1. Groq (Llama 3.1)  │ │
│  ├──────────┤ ├──────┤         │ 2. GitHub DeepSeek V3│ │
│  │  CORE    │ │ Jina │         │ 3. GitHub Grok mini 3│ │
│  ├──────────┤ └──────┘         │ 4. Ollama Qwen3 80B  │ │
│  │Open Lib. │                  │ 5. Ollama Nemotron 30B│ │
│  └──────────┘                  └──────────────────────┘ │
│                                                          │
│  /api/rate-limit  — IP-keyed, 15 searches/day            │
│  Security Headers — XSS, Frame, CORS, Referrer           │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/sah-rohit/Canto.git
cd Canto

# Install dependencies
npm install

# Copy the environment template and fill in your API keys
cp .env.example .env

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

## 🔑 API Keys

All keys go in `.env` (never committed). See [`.env.example`](.env.example) for the full template.

| Variable | Service | Purpose | Get Key |
|---|---|---|---|
| `GROQ_API_KEY` | [Groq](https://console.groq.com) | Primary AI (Llama 3.1 8B) | [console.groq.com](https://console.groq.com) |
| `GITHUB_DEEPSEEK_KEY` | [GitHub Models](https://github.com/marketplace/models) | AI fallback (DeepSeek V3) | [github.com/marketplace/models](https://github.com/marketplace/models) |
| `GITHUB_GROK_KEY` | [GitHub Models](https://github.com/marketplace/models) | AI fallback (Grok mini 3) | [github.com/marketplace/models](https://github.com/marketplace/models) |
| `OLLAMA_DEEPSEEK_KEY` | [Ollama Cloud](https://ollama.com) | AI fallback (Qwen3 Next 80B) | [ollama.com](https://ollama.com) |
| `OLLAMA_KIMI_KEY` | [Ollama Cloud](https://ollama.com) | AI fallback (Nemotron 3 Nano 30B) | [ollama.com](https://ollama.com) |
| `NASA_API_KEY` | [NASA](https://api.nasa.gov) | Space & science context | [api.nasa.gov](https://api.nasa.gov) |
| `CORE_API_KEY` | [CORE](https://core.ac.uk/services/api) | Academic paper context | [core.ac.uk](https://core.ac.uk/services/api) |

Wikipedia, Open Library, and Internet Archive are used without authentication.

## 📁 Project Structure

```
Canto/
├── index.html              # Entry point, CSS variables, theme definitions
├── index.tsx               # React bootstrapping
├── App.tsx                 # Root component — routing, state, nav
├── index.css               # (reserved for additional global styles)
├── components/
│   ├── LandingPage.tsx     # Homepage with animated ASCII space art
│   ├── ContentDisplay.tsx  # Article renderer (Markdown, TTS, download, share)
│   ├── AsciiArtDisplay.tsx # ASCII art viewer with interactive characters
│   ├── SearchBar.tsx       # Search input with autocomplete suggestions
│   ├── LoadingSkeleton.tsx # Streaming placeholder UI
│   ├── StaticPage.tsx      # About, FAQ, Privacy, Terms, Pricing, Open Source
│   ├── DidYouKnow.tsx      # Surprising fact widget per topic
│   ├── RelatedTopics.tsx   # AI-generated related topic suggestions
│   ├── StartupAnimation.tsx# Boot sequence animation
│   ├── ErrorBoundary.tsx   # React error boundary
│   ├── MoonAscii.tsx       # Decorative ASCII moon component
│   ├── ToastContext.tsx     # Global toast notification system
│   └── UIComponents.tsx    # CantoDialog, CantoSlider, CantoNotification
├── services/
│   ├── aiService.ts        # 5-provider AI fallback chain + streaming
│   ├── knowledgeService.ts # Multi-source knowledge context fetcher
│   ├── rateLimitService.ts # Hybrid IP + client-side rate limiting
│   ├── dbService.ts        # IndexedDB cache, history, favorites
│   └── geminiService.ts    # Legacy Gemini service (unused in production)
├── functions/
│   └── api/
│       ├── ai.ts           # Cloudflare Pages AI proxy function
│       ├── knowledge.ts    # Cloudflare Pages knowledge aggregator
│       ├── rate-limit.ts   # Cloudflare Pages rate limit checker
│       └── rate-limit-record.ts # Cloudflare Pages rate limit recorder
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker for offline caching
│   └── canto-icon.svg      # App icon
├── vite.config.ts          # Dev server middleware (API proxy, rate limiting)
├── .env.example            # API key template
├── LICENSE                 # Apache 2.0
└── README.md               # You are here
```

## 🔒 Security

- **No client-side key exposure** — All API keys live in server-side middleware only; the client bundle receives `SERVER_SIDE_ONLY` as a placeholder
- **IP-based rate limiting** — 15 searches/day per IP address, tracked server-side across all browsers
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` on every response
- **`.env` gitignored** — Secrets are never committed to version control
- **No tracking** — No cookies, no analytics, no PII collection of any kind

## 🤝 Contributing

Contributions are welcome. Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/my-feature`)
3. **Commit** your changes (`git commit -m 'Add my feature'`)
4. **Push** to the branch (`git push origin feature/my-feature`)
5. **Open** a Pull Request

Areas where contributions are especially useful:

- 🐛 Bug fixes and edge case handling
- ✨ New knowledge sources or AI providers
- 🎨 New themes or UI enhancements
- 📖 Documentation improvements
- 🌍 Internationalization (i18n)
- ⚡ Performance and caching improvements

## 📄 License

Licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com) — Ultra-fast LLM inference
- [GitHub Models](https://github.com/marketplace/models) — DeepSeek V3 and Grok mini 3 access
- [Ollama](https://ollama.com) — Cloud-hosted open models (Qwen3, Nemotron)
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
