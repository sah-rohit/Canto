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

**Canto** is an open-source, AI-powered encyclopedia that generates comprehensive, fact-checked articles on any topic in real time. Unlike traditional wikis with static pages, Canto pulls from multiple verified knowledge sources and uses AI to synthesize rich, engaging entries — complete with ASCII art, tables, and interactive cross-references.

Think of it as the love child of [Wikipedia](https://wikipedia.org) and [Grokipedia](https://grokipedia.com), but open source and self-hostable.

## ✨ Features

- 🧠 **Multi-AI Fallback** — Groq (Llama 3.1), Ollama Cloud (Qwen 3.5, Kimi K2.5) with automatic provider failover
- 📚 **Knowledge-Enriched** — Every article is informed by Wikipedia, NASA, Internet Archive, and CORE Academic databases
- 🎨 **ASCII Art Generation** — AI-generated visual representations for every topic
- ⚡ **Real-Time Streaming** — Content appears word-by-word via Server-Sent Events
- 📥 **Download & Export** — Save articles as `.TXT` or `.PDF`
- 🔊 **Text-to-Speech** — Listen to any article with browser TTS
- 🔒 **IP-Based Rate Limiting** — Server-side abuse prevention (15 searches/day per IP)
- 📱 **Progressive Web App** — Installable on mobile and desktop with offline support
- 🎭 **4 Themes** — Classic, Obsidian, Dark Neon, Vintage
- 🌐 **Cross-Browser** — Works on Chrome, Firefox, Safari, Edge (with legacy polyfills)

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                   CLIENT (React + Vite)               │
│                                                       │
│  Search ──► Knowledge Service ──► AI Service          │
│              │                     │                  │
│              ▼                     ▼                  │
│         /api/knowledge        /api/ai                 │
└──────────┬──────────────────────┬─────────────────────┘
           │                      │
┌──────────▼──────────────────────▼─────────────────────┐
│              SERVER (Vite Dev Middleware)              │
│                                                       │
│  ┌─────────┐ ┌──────┐ ┌─────┐ ┌──────────┐          │
│  │Wikipedia│ │ NASA │ │CORE │ │Open Lib.  │          │
│  └────┬────┘ └──┬───┘ └──┬──┘ └────┬─────┘          │
│       └─────────┴────────┴─────────┘                 │
│                     │                                 │
│  ┌──────┐ ┌────────▼───────┐                         │
│  │ Groq │ │  Ollama Cloud  │                         │
│  └──────┘ └────────────────┘                         │
│                                                       │
│  IP Rate Limiting (15/day per IP)                    │
│  Security Headers (XSS, Frame, CORS)                 │
└───────────────────────────────────────────────────────┘
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

# Copy the environment template and add your API keys
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

You'll need to obtain API keys for the following services (all have free tiers):

| Service | Purpose | Get Key |
|---|---|---|
| **Groq** | AI text generation (primary) | [console.groq.com](https://console.groq.com) |
| **Ollama Cloud** | AI text generation (fallback) | [ollama.com](https://ollama.com) |
| **NASA** | Space & science image data | [api.nasa.gov](https://api.nasa.gov) |
| **CORE** | Academic paper abstracts | [core.ac.uk](https://core.ac.uk/services/api) |

Wikipedia and Internet Archive/Open Library APIs are used without authentication.

See [`.env.example`](.env.example) for the full configuration template.

## 📁 Project Structure

```
Canto/
├── index.html              # Entry point with PWA meta tags
├── index.tsx               # React bootstrapping
├── App.tsx                 # Main application component
├── components/
│   ├── LandingPage.tsx     # Homepage with ASCII space art
│   ├── ContentDisplay.tsx  # Article renderer with download/TTS
│   ├── AsciiArtDisplay.tsx # ASCII art viewer with mutations
│   ├── SearchBar.tsx       # Search input with suggestions
│   ├── StaticPage.tsx      # About, FAQ, Privacy, Terms, Open Source pages
│   ├── DidYouKnow.tsx      # Random fact widget
│   ├── RelatedTopics.tsx   # Topic suggestions
│   └── ...
├── services/
│   ├── aiService.ts        # AI provider fallback chain
│   ├── knowledgeService.ts # Wikipedia/NASA/CORE/IA context fetcher
│   └── rateLimitService.ts # Hybrid IP + client rate limiting
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker for offline support
│   └── canto-icon.svg      # App icon
├── vite.config.ts          # Server middleware (API proxy, rate limiting)
├── .env.example            # API key template
├── LICENSE                 # Apache 2.0
└── README.md               # You are here
```

## 🔒 Security

- **No client-side API key exposure** — All keys stay server-side in the Vite middleware
- **IP-based rate limiting** — Prevents abuse regardless of browser/incognito mode
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- **`.env` gitignored** — Secrets never committed to version control
- **No tracking** — No cookies, no analytics, no PII collection

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Types of contributions we're looking for:

- 🐛 Bug fixes
- ✨ New features (new knowledge sources, themes, export formats)
- 📖 Documentation improvements
- 🌍 Internationalization (i18n)
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com) — Ultra-fast AI inference
- [Ollama](https://ollama.com) — Local and cloud AI models
- [Wikipedia](https://wikipedia.org) — The world's encyclopedia
- [NASA](https://nasa.gov) — Space and science data
- [CORE](https://core.ac.uk) — Open access academic research
- [Internet Archive](https://archive.org) — Universal access to knowledge

---

<div align="center">

**Built with 🌙 by [Sonata Interactive](https://github.com/sah-rohit)**

*Knowledge should be infinite, accessible, and beautiful.*

</div>
