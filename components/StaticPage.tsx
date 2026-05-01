import React from 'react';

const asciiArtMap: Record<string, string> = {
  about: `
      ___  ____  ____  __  __  ____ 
     / _ \\(  _ \\(  _ \\(  )(  )(_  _)
    / __ \\ ) _ < ) (_) )(__)( )(  
   (_/ \\_)(____/(____/(____) (__) 
  `,
  faq: `
     ____   __     __   
    (  __) / _\\  /  \\  
     ) _) /    \\(  O ) 
    (__)  \\_/\\_/ \\___\\ 
  `,
  pricing: `
    ____  ____  __  ___  __  _  _  ___ 
   (  _ \\(  _ \\(  )/ __)/  \\( \\( )/ __)
    ) __/ )   / )( \\__ \\  O ))  ( \\__ \\
   (__)  (__\\_)(__)(___/\\__/(_)\\_)(___/
  `,
  privacy: `
    ____  ____  __  _  _  __    ___  _  _ 
   (  _ \\(  _ \\(  )/ )( \\/ _\\  / __)( \\/ )
    ) __/ )   / )( \\ \\/ /    \\( (__  )  / 
   (__)  (__\\_)(__) \\__/\\_/\\_/ \\___)(__/  
  `,
  terms: `
    ____  ____  ____  __  __  ____ 
   (_  _)(  __)(  _ \\(  \\/  )/ ___)
     )(   ) _)  )   / )    ( \\___ \\
    (__) (____)(__\\_)(_/\\/\\_)(____/
  `,
  opensource: `
     ____  ____  ____  _  _   
    /  _ \\(  _ \\(  __)(  \\( ) 
    ) (_) ))  _/ ) _)  )   (  
    \\____/(__)  (____)(_)\\_) 
       ____  ____  __  __  ____  ___  ____ 
      / ___)(  _ \\(  )(  )(  _ \\/ __)(  __)
      \\___ \\ ) _ < )(__)(  )   (( (__  ) _) 
      (____/(____/(______)(__\\_)\\___)(____)
  `,
  library: `
       .      .           .
         .      .     .     .
      .    .  ( ★ ) .    .
         .      .     .     .
       .      .           .
  `
};

const pagesData: Record<string, { title: string, content: React.ReactNode }> = {
  about: {
    title: 'About Canto',
    content: (
      <div>
        <p>Welcome to <strong>Canto</strong> — an infinite, AI-powered encyclopedia.</p>
        <p>
          I believe in a world where curiosity never hits a dead end. My mission is to provide an
          infinite, real-time generated encyclopedia where every word is a doorway to new knowledge.
        </p>
        <h3 style={{ marginTop: '2rem' }}>How It Works</h3>
        <p>
          Unlike traditional encyclopedias that rely on pre-written articles, Canto uses a multi-source 
          knowledge pipeline. When you search for a topic, it simultaneously fetches verified information from
          <strong> Wikipedia</strong>, <strong>NASA</strong>, <strong>Internet Archive / Open Library</strong>, <strong>CORE Academic</strong>, and <strong>live web search</strong> via Jina AI.
          This context is fed into a 7-provider AI fallback chain which synthesizes a rich, encyclopedia-style article in real time.
        </p>
        <h3 style={{ marginTop: '2rem' }}>AI Provider Chain</h3>
        <p>Canto uses 7 AI providers in cascade — if one fails or hits a rate limit, the next takes over automatically:</p>
        <ul style={{ lineHeight: '2', fontFamily: 'monospace', fontSize: '0.9em' }}>
          <li>1. <strong>Groq</strong> — Llama 3.1 8B Instant (primary, ultra-fast)</li>
          <li>2. <strong>GitHub Models</strong> — DeepSeek V3</li>
          <li>3. <strong>GitHub Models</strong> — Grok mini 3</li>
          <li>4. <strong>Cloudflare Workers AI</strong> — Gemini Flash 1.5</li>
          <li>5. <strong>Cloudflare Workers AI</strong> — Llama 3.3 70B</li>
          <li>6. <strong>Ollama Cloud</strong> — Qwen3 Next 80B</li>
          <li>7. <strong>Ollama Cloud</strong> — Nemotron 3 Nano 30B</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>Technology Stack</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>⚛️ <strong>Frontend:</strong> React 18 + TypeScript + Vite</li>
          <li>🧠 <strong>AI:</strong> 7-provider fallback chain (Groq, GitHub Models, Cloudflare, Ollama)</li>
          <li>📚 <strong>Knowledge:</strong> Wikipedia, NASA, CORE Academic, Open Library, Jina/DuckDuckGo</li>
          <li>🔊 <strong>TTS:</strong> Cloudflare MeloTTS 1.5 Max (primary) + browser speechSynthesis (fallback)</li>
          <li>🎨 <strong>ASCII Art:</strong> AI-generated visual representations for every topic</li>
          <li>⚡ <strong>Streaming:</strong> Real-time SSE token streaming with smooth fade-in animation</li>
          <li>🗄️ <strong>Storage:</strong> IndexedDB (cache, history, favorites, folders, analytics)</li>
          <li>🔒 <strong>Security:</strong> Server-side API proxy, IP-based rate limiting, no client key exposure</li>
          <li>📱 <strong>PWA:</strong> Installable on mobile and desktop with offline caching</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>Features</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>🔍 <strong>Interactive words</strong> — click any word to instantly research it</li>
          <li>◈ <strong>Research panel</strong> — AI follow-ups, source citations, full-text search, folders, analytics</li>
          <li>📖 <strong>Reading mode</strong> — distraction-free view with adjustable font size</li>
          <li>🔗 <strong>Shareable links</strong> — share any article via URL</li>
          <li>🎭 <strong>4 themes</strong> — Classic, Obsidian, Dark Neon, Vintage</li>
          <li>📥 <strong>Export</strong> — download as .TXT or .PDF</li>
          <li>🔔 <strong>Sound effects</strong> — optional audio feedback (Web Audio API)</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>Built By</h3>
        <p>
          Canto is crafted by <strong>Sonata Interactive</strong> — a solo endeavor passionate about making knowledge 
          beautiful, accessible, and infinite.
        </p>
      </div>
    )
  },
  pricing: {
    title: 'Pricing',
    content: (
      <div>
        <p>Canto is free. No accounts, no paywalls, no subscriptions.</p>
        <h3 style={{ marginTop: '2rem' }}>🆓 Free — Always</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>15 searches per day</strong> per IP address</li>
          <li>Full encyclopedia articles with 7-provider AI synthesis</li>
          <li>Multi-source knowledge (Wikipedia, NASA, CORE, Open Library, Web Search)</li>
          <li>AI-generated ASCII art for every topic</li>
          <li>Cloudflare MeloTTS audio playback with timeline controls</li>
          <li>Download as .TXT or .PDF</li>
          <li>Research panel (follow-ups, sources, search, folders, analytics)</li>
          <li>4 themes, reading mode, font scaling</li>
          <li>Shareable article links</li>
          <li>Local library with folders, starred entries, and full-text search</li>
          <li>PWA — installable on any device</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>Why Free?</h3>
        <p>
          Knowledge should be universal. Canto is open source and independently developed.
          The daily limit exists to prevent API abuse, not to restrict learning.
          The limit resets at midnight.
        </p>
        <h3 style={{ marginTop: '2rem' }}>💡 Unlimited Access</h3>
        <p>
          Canto is open source — self-host your own instance with your own API keys for unlimited searches.
          See the <a href="?page=opensource" style={{ color: 'var(--accent-color)' }}>Open Source</a> page for a 4-step setup guide.
        </p>
      </div>
    )
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div>
        <h3 style={{ marginTop: '2rem' }}>What is Canto?</h3>
        <p>
          Canto is an infinite, AI-powered encyclopedia that generates rich articles on any topic in real time.
          It pulls from 5 verified knowledge sources and uses a 7-provider AI fallback chain to synthesize 
          comprehensive, engaging entries with ASCII art, interactive cross-references, and kinetic typography.
        </p>

        <h3 style={{ marginTop: '2rem' }}>How is it different from ChatGPT or Wikipedia?</h3>
        <p>
          Canto combines both. Like Wikipedia, it grounds every article in verified sources (Wikipedia, NASA, 
          CORE Academic, Open Library, live web search). Like an AI assistant, it generates natural, engaging prose.
          The result is factually grounded articles in a compelling style — not a chatbot, not a static wiki.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Which AI models does it use?</h3>
        <p>Canto uses a 7-provider cascade — if one fails, the next takes over automatically:</p>
        <ol style={{ lineHeight: '2', fontFamily: 'monospace', fontSize: '0.88em' }}>
          <li>Groq — Llama 3.1 8B Instant</li>
          <li>GitHub Models — DeepSeek V3</li>
          <li>GitHub Models — Grok mini 3</li>
          <li>Cloudflare Workers AI — Gemini Flash 1.5</li>
          <li>Cloudflare Workers AI — Llama 3.3 70B</li>
          <li>Ollama Cloud — Qwen3 Next 80B</li>
          <li>Ollama Cloud — Nemotron 3 Nano 30B</li>
        </ol>

        <h3 style={{ marginTop: '2rem' }}>How does the TTS work?</h3>
        <p>
          Canto uses Cloudflare Workers AI MeloTTS 1.5 Max as the primary TTS engine. If that fails, 
          it falls back to your browser's built-in speechSynthesis. A fixed player bar at the bottom of 
          your screen shows a timeline, word-by-word highlighting, pause/resume, volume, and progress.
        </p>

        <h3 style={{ marginTop: '2rem' }}>What is the Research panel?</h3>
        <p>
          The ◈ Research panel appears below the article controls. It has 5 sections:
          AI-generated follow-up questions, source citations with snippets, full-text history search,
          a library with folders and starred entries, and 7-day research analytics.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Is the content accurate?</h3>
        <p>
          Canto fetches real-time context from Wikipedia, NASA, CORE Academic, Open Library, and web search 
          before generating each article. This dramatically improves accuracy over pure AI generation.
          However, AI content may still contain errors — verify critical facts with primary sources.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Why is there a daily search limit?</h3>
        <p>
          Each search costs API credits across multiple providers. The limit (15/day per IP) prevents 
          abuse while keeping the service free. It resets at midnight. Self-hosting removes the limit entirely.
        </p>

        <h3 style={{ marginTop: '2rem' }}>What data is collected?</h3>
        <p>
          No accounts required. Your IP is used only for rate limiting (in-memory, not stored permanently).
          Search history and favorites are stored only in your browser's IndexedDB — never on a server.
          See the <a href="?page=privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</a> for full details.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Can I contribute?</h3>
        <p>
          Yes! Canto is open source under Apache 2.0. Visit the <a href="?page=opensource" style={{ color: 'var(--accent-color)' }}>Open Source</a> page.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div>
        <p>Your privacy matters. Here's a simple, jargon-free breakdown of how data is handled.</p>
        <h3 style={{ marginTop: '2rem' }}>1. Data Collection</h3>
        <p>
          I collect the search queries you enter to generate the content you request. I do not require you
          to create an account. Your searches are not tied to your personal identity.
        </p>
        <p>
          For rate limiting, your <strong>IP address</strong> is used solely to prevent API abuse. 
          This data is not stored permanently.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. Data Usage</h3>
        <p>
          Your queries are used to fetch context from knowledge APIs (Wikipedia, NASA, Internet Archive, CORE) 
          and to generate AI content via providers (Groq, Ollama Cloud).
        </p>
        <h3 style={{ marginTop: '2rem' }}>3. What is NOT done</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>I do <strong>not</strong> sell your data to third parties.</li>
          <li>I do <strong>not</strong> track your browsing outside of this application.</li>
          <li>I do <strong>not</strong> use cookies for advertising or tracking.</li>
          <li>I do <strong>not</strong> store search history on servers.</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>4. Third-Party Services</h3>
        <p>
          Your search terms are sent to the following services for processing:
        </p>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>Groq API</strong> — AI text generation (primary)</li>
          <li><strong>GitHub Models API</strong> — AI text generation (DeepSeek V3, Grok mini 3)</li>
          <li><strong>Cloudflare Workers AI</strong> — AI text generation + TTS (MeloTTS)</li>
          <li><strong>Ollama Cloud</strong> — AI text generation (Qwen3, Nemotron)</li>
          <li><strong>Wikipedia REST API</strong> — Factual context</li>
          <li><strong>NASA Images API</strong> — Space and science data</li>
          <li><strong>Internet Archive / Open Library</strong> — Book references</li>
          <li><strong>CORE API</strong> — Academic paper abstracts</li>
          <li><strong>Jina AI Reader</strong> — Web content extraction</li>
        </ul>
        <p>
          Please refer to each service's privacy policy for how they handle API request data.
        </p>
        <h3 style={{ marginTop: '2rem' }}>5. Data Retention</h3>
        <p>
          Rate limit data is held in-memory during the server session and is never written to disk.
          Client-side data (search history, favorites, folders, analytics) is stored in your browser's 
          IndexedDB and can be cleared at any time from the History panel or browser settings.
          No server-side user data is retained.
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    content: (
      <div>
        <p>By using Canto, you agree to these simple rules.</p>
        <h3 style={{ marginTop: '2rem' }}>1. Usage</h3>
        <p>
          Canto is provided for educational, informational, and entertainment purposes. 
          Content is generated by AI using multiple knowledge sources. While I strive for accuracy 
          by using verified sources, generated content may sometimes be inaccurate, incomplete, or contain errors.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. No Warranties</h3>
        <p>
          I provide the service "as is." I don't guarantee that the service will always be up, 
          nor do I guarantee the factual accuracy of any AI-generated article. Always verify important facts 
          with trusted primary sources.
        </p>
        <h3 style={{ marginTop: '2rem' }}>3. Rate Limits</h3>
        <p>
          Each user is limited to <strong>15 searches per day</strong>, enforced at the IP level server-side.
          This applies across all browsers on the same IP. The limit resets at midnight.
          Attempting to circumvent rate limits may result in temporary blocking.
        </p>
        <h3 style={{ marginTop: '2rem' }}>4. Acceptable Use</h3>
        <p>
          Do not use the platform to generate illegal, harmful, or offensive content. I reserve the 
          right to block requests or IP addresses that abuse the system limits.
        </p>
        <h3 style={{ marginTop: '2rem' }}>5. Open Source License</h3>
        <p>
          Canto's source code is available under the Apache 2.0 License. You may use, modify, and distribute 
          the code in accordance with the license terms.
        </p>
        <h3 style={{ marginTop: '2rem' }}>6. Changes to Terms</h3>
        <p>
          I may update these terms as the platform evolves. Continued use of the platform implies acceptance 
          of the current terms.
        </p>
      </div>
    )
  },
  opensource: {
    title: 'Open Source',
    content: (
      <div>
        <p>
          Canto is proudly <strong>open source</strong> under the Apache 2.0 License. 
          The full source is auditable, forkable, and self-hostable.
        </p>

        <h3 style={{ marginTop: '2rem' }}>📦 Repository</h3>
        <div style={{ 
          background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
          borderRadius: '2px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9em',
          margin: '1rem 0'
        }}>
          <a href="https://github.com/sah-rohit/Canto" target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
            github.com/sah-rohit/Canto
          </a>
        </div>

        <h3 style={{ marginTop: '2rem' }}>📜 License</h3>
        <p>Apache License 2.0 — you are free to use, modify, distribute, and self-host.</p>

        <h3 style={{ marginTop: '2rem' }}>🚀 Self-Hosting (4 steps)</h3>
        <div style={{ 
          background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
          borderRadius: '2px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85em',
          lineHeight: '2', margin: '1rem 0', overflowX: 'auto'
        }}>
          <div style={{ color: 'var(--text-muted)' }}># 1. Clone</div>
          <div>git clone https://github.com/sah-rohit/Canto.git && cd Canto</div>
          <br/>
          <div style={{ color: 'var(--text-muted)' }}># 2. Install</div>
          <div>npm install</div>
          <br/>
          <div style={{ color: 'var(--text-muted)' }}># 3. Configure API keys</div>
          <div>cp .env.example .env  # then fill in your keys</div>
          <br/>
          <div style={{ color: 'var(--text-muted)' }}># 4. Run</div>
          <div>npm run dev  # → http://localhost:3000</div>
        </div>

        <h3 style={{ marginTop: '2rem' }}>🔑 Required API Keys</h3>
        <p>At minimum you need one AI provider key. All others are optional fallbacks:</p>
        <ul style={{ lineHeight: '2', fontFamily: 'monospace', fontSize: '0.85em' }}>
          <li><strong>GROQ_API_KEY</strong> — <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>console.groq.com</a> (free)</li>
          <li><strong>GITHUB_DEEPSEEK_KEY / GITHUB_GROK_KEY</strong> — <a href="https://github.com/marketplace/models" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>github.com/marketplace/models</a></li>
          <li><strong>CF_ACCOUNT_1_TOKEN / CF_TTS_TOKEN</strong> — <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>dash.cloudflare.com</a></li>
          <li><strong>OLLAMA_DEEPSEEK_KEY / OLLAMA_KIMI_KEY</strong> — <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>ollama.com</a></li>
          <li><strong>NASA_API_KEY</strong> — <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>api.nasa.gov</a> (free)</li>
          <li><strong>CORE_API_KEY</strong> — <a href="https://core.ac.uk/services/api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>core.ac.uk</a> (free)</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>🤝 Contributing</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>Bug Reports:</strong> Open an issue on GitHub</li>
          <li><strong>Feature Requests:</strong> Open a discussion</li>
          <li><strong>Pull Requests:</strong> Fork → branch → PR</li>
          <li><strong>New AI providers:</strong> Add to the PROVIDERS array in <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>services/aiService.ts</code></li>
          <li><strong>New knowledge sources:</strong> Add a task in <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>vite.config.ts</code> knowledge middleware</li>
        </ul>
      </div>
    )
  }
};

interface StaticPageProps {
  pageId: string;
  history?: string[];
  favorites?: string[];
  onTopicClick?: (topic: string) => void;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageId, history = [], favorites = [], onTopicClick }) => {
  const page = pagesData[pageId];
  const art = asciiArtMap[pageId] || '';

  if (pageId === 'library') {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', letterSpacing: '0.1em' }}>My Local Library</h2>
        {art && (
          <pre className="ascii-art living-ascii" style={{ color: '#555', marginBottom: '2rem', overflowX: 'auto' }}>
            {art}
          </pre>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', marginTop: '2rem' }}>
          <section>
            <h3 style={{ fontSize: '1em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--accent-color)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>★ Favorites</h3>
            {favorites.length === 0 ? <p style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>No starred topics yet.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {favorites.map(t => (
                  <li key={t} style={{ marginBottom: '0.6rem' }}>
                    <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.05em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace' }}>{t}</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 style={{ fontSize: '1em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🕒 Recent History</h3>
            {history.length === 0 ? <p style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>No browsing history.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {history.map(t => (
                  <li key={t} style={{ marginBottom: '0.6rem' }}>
                    <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.05em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace' }}>{t}</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <div style={{ marginTop: '4rem', padding: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
          <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            ℹ️ <strong>Privacy Note:</strong> All library data (history and favorites) is stored exclusively in your browser's local storage. Clearing your site data or cache will remove these records permanently.
          </p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <h2>Page Not Found</h2>
        <p>I could not find the page you are looking for.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', textTransform: 'capitalize', letterSpacing: '0.1em' }}>
        {page.title}
      </h2>
      {art && (
        <pre className="ascii-art living-ascii" style={{ color: '#555', marginBottom: '2rem', overflowX: 'auto' }}>
          {art}
        </pre>
      )}
      <div style={{ lineHeight: '1.8', color: 'var(--text-color, #333)' }}>
        {page.content}
      </div>
    </div>
  );
};

export default StaticPage;
