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
  `
};

const pagesData: Record<string, { title: string, content: React.ReactNode }> = {
  about: {
    title: 'About Canto',
    content: (
      <div>
        <p>Welcome to <strong>Canto</strong> — the infinite, AI-powered encyclopedia.</p>
        <p>
          We believe in a world where curiosity never hits a dead end. Our mission is to provide an
          infinite, real-time generated encyclopedia where every word is a doorway to new knowledge.
        </p>
        <h3 style={{ marginTop: '2rem' }}>How It Works</h3>
        <p>
          Unlike traditional encyclopedias that rely on pre-written articles, Canto uses a multi-source 
          knowledge pipeline. When you search for a topic, we simultaneously fetch verified information from
          <strong> Wikipedia</strong>, <strong>Internet Archive</strong>, <strong>NASA</strong>, and <strong>CORE Academic</strong> databases.
          This context is then fed into our AI engine (powered by Groq, Ollama Cloud, and other providers) which 
          synthesizes a rich, encyclopedia-style article in real time.
        </p>
        <h3 style={{ marginTop: '2rem' }}>Our Technology Stack</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>🧠 <strong>AI Providers:</strong> Groq (Llama 3.1), Ollama Cloud (Qwen 3.5, Kimi K2.5)</li>
          <li>📚 <strong>Knowledge Sources:</strong> Wikipedia API, Internet Archive / Open Library, NASA Image & Data API, CORE Academic Papers</li>
          <li>🎨 <strong>ASCII Art:</strong> AI-generated visual representations for every topic</li>
          <li>⚡ <strong>Streaming:</strong> Real-time content generation with Server-Sent Events</li>
          <li>🔒 <strong>Privacy-First:</strong> IP+fingerprint rate limiting with no personal data stored</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>Our Vision</h3>
        <p>
          To map out the entirety of human curiosity, making learning an endless, interactive journey.
          No bounds, no missing pages — just pure exploration enriched by verified sources.
        </p>
        <h3 style={{ marginTop: '2rem' }}>Built By</h3>
        <p>
          Canto is crafted by <strong>Sonata Interactive</strong> — a team passionate about making knowledge 
          beautiful, accessible, and infinite.
        </p>
      </div>
    )
  },
  pricing: {
    title: 'Pricing',
    content: (
      <div>
        <p>Canto is designed to be accessible to everyone.</p>
        <h3 style={{ marginTop: '2rem' }}>🆓 Free Tier — Always Free</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>Up to <strong>30 searches per day</strong> per device</li>
          <li>Full encyclopedia articles with AI synthesis</li>
          <li>Multi-source knowledge integration (Wikipedia, NASA, CORE, Internet Archive)</li>
          <li>ASCII art generation for every topic</li>
          <li>Download articles as .TXT or .PDF</li>
          <li>Text-to-speech playback</li>
          <li>4 beautiful themes (Classic, Obsidian, Dark Neon, Vintage)</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>Why Free?</h3>
        <p>
          We believe knowledge should be universal. Canto is open source and community-driven.
          Our daily search limit exists to prevent API abuse, not to restrict learning.
        </p>
        <h3 style={{ marginTop: '2rem' }}>💡 Want More?</h3>
        <p>
          Canto is open source! You can self-host your own instance with your own API keys for 
          unlimited access. Check the <a href="?page=opensource" style={{ color: 'var(--accent-color)' }}>Open Source</a> page for instructions.
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
          It pulls from multiple verified sources (Wikipedia, NASA, academic databases) and uses AI to 
          synthesize comprehensive, engaging entries.
        </p>
        
        <h3 style={{ marginTop: '2rem' }}>How is it different from ChatGPT or Wikipedia?</h3>
        <p>
          Canto combines the best of both worlds. Like Wikipedia, it uses verified sources (we query Wikipedia, 
          NASA, Internet Archive, and CORE Academic). Like ChatGPT, it generates natural, engaging prose.
          The result is factually grounded articles written in a compelling style — an AI encyclopedia, not a chatbot.
        </p>
        
        <h3 style={{ marginTop: '2rem' }}>How does it generate content so fast?</h3>
        <p>
          Canto uses a streaming architecture with multiple AI providers (Groq, Ollama Cloud) to provide 
          real-time text generation. Knowledge sources are fetched in parallel, and the AI model streams 
          tokens as they're generated.
        </p>
        
        <h3 style={{ marginTop: '2rem' }}>Is the content accurate?</h3>
        <p>
          We fetch real-time context from Wikipedia, NASA, Internet Archive, and CORE Academic before 
          generating each article. This dramatically improves accuracy compared to pure AI generation.
          However, AI-generated content may still contain errors — always verify critical facts with primary sources.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Why do I have a daily search limit?</h3>
        <p>
          Each search costs API credits across multiple providers. The daily limit (30 searches) prevents 
          abuse while keeping the service free for everyone. The limit resets at midnight local time.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Can I contribute?</h3>
        <p>
          Yes! Canto is open source. You can contribute code, report bugs, suggest features, or self-host 
          your own instance. Visit the <a href="?page=opensource" style={{ color: 'var(--accent-color)' }}>Open Source</a> page for details.
        </p>

        <h3 style={{ marginTop: '2rem' }}>What data do you collect?</h3>
        <p>
          We do not require accounts. Rate limiting uses a hashed browser fingerprint (never stored raw) 
          combined with your IP address. No personal information is collected or sold. 
          See our <a href="?page=privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</a> for full details.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div>
        <p>Your privacy matters to us. Here's a simple, jargon-free breakdown of how we handle your data.</p>
        <h3 style={{ marginTop: '2rem' }}>1. What We Collect</h3>
        <p>
          We collect the search queries you enter to generate the content you request. We do not require you
          to create an account. Your searches are not tied to your personal identity.
        </p>
        <p>
          For rate limiting, we collect a <strong>hashed browser fingerprint</strong> (derived from non-personal 
          browser properties like screen resolution and timezone) and your <strong>IP address</strong>. The raw 
          fingerprint data is never stored — only its one-way hash.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. How We Use It</h3>
        <p>
          Your queries are used to fetch context from knowledge APIs (Wikipedia, NASA, Internet Archive, CORE) 
          and to generate AI content via our providers (Groq, Ollama Cloud). The fingerprint hash and IP are 
          used solely for rate limiting to prevent abuse.
        </p>
        <h3 style={{ marginTop: '2rem' }}>3. What We Don't Do</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>We do <strong>not</strong> sell your personal data to third parties.</li>
          <li>We do <strong>not</strong> track your browsing outside of this application.</li>
          <li>We do <strong>not</strong> use cookies for advertising or tracking.</li>
          <li>We do <strong>not</strong> store search history on our servers.</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>4. Third-Party Services</h3>
        <p>
          Your search terms are sent to the following services for processing:
        </p>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>Groq API</strong> — AI text generation</li>
          <li><strong>Ollama Cloud</strong> — AI text generation (fallback)</li>
          <li><strong>Wikipedia REST API</strong> — Factual context</li>
          <li><strong>NASA API</strong> — Space and science data</li>
          <li><strong>Internet Archive / Open Library</strong> — Book references</li>
          <li><strong>CORE API</strong> — Academic paper abstracts</li>
        </ul>
        <p>
          Please refer to each service's privacy policy for how they handle API request data.
        </p>
        <h3 style={{ marginTop: '2rem' }}>5. Data Retention</h3>
        <p>
          Rate limit data is held in-memory during the server session and resets on server restart.
          Client-side search history is stored in your browser's localStorage and can be cleared at any time.
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
          Content is generated by AI using multiple knowledge sources. While we strive for accuracy 
          by using verified sources, generated content may sometimes be inaccurate, incomplete, or contain errors.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. No Warranties</h3>
        <p>
          We provide the service "as is." We don't guarantee that the service will always be up, 
          nor do we guarantee the factual accuracy of any AI-generated article. Always verify important facts 
          with trusted primary sources.
        </p>
        <h3 style={{ marginTop: '2rem' }}>3. Rate Limits</h3>
        <p>
          Each user is limited to 30 searches per day, enforced at the IP and device level.
          Attempting to circumvent rate limits (e.g., using proxies, VPNs, or browser automation) may 
          result in temporary or permanent blocking.
        </p>
        <h3 style={{ marginTop: '2rem' }}>4. Acceptable Use</h3>
        <p>
          Do not use the platform to generate illegal, harmful, or grossly offensive content. We reserve the 
          right to block requests or IP addresses that abuse the system limits or attempt to compromise our infrastructure.
        </p>
        <h3 style={{ marginTop: '2rem' }}>5. Open Source License</h3>
        <p>
          Canto's source code is available under the Apache 2.0 License. You may use, modify, and distribute 
          the code in accordance with the license terms. API keys and credentials are not included in the 
          open source distribution.
        </p>
        <h3 style={{ marginTop: '2rem' }}>6. Changes to Terms</h3>
        <p>
          We may update these terms as the platform evolves. Continued use of the platform implies acceptance 
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
          Canto is proudly <strong>open source</strong>. We believe knowledge tools should be transparent, 
          auditable, and community-driven.
        </p>
        
        <h3 style={{ marginTop: '2rem' }}>📦 Repository</h3>
        <p>
          The complete source code is available on GitHub:
        </p>
        <div style={{ 
          background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
          borderRadius: '6px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9em',
          margin: '1rem 0'
        }}>
          <a href="https://github.com/sah-rohit/Canto" target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
            github.com/sah-rohit/Canto
          </a>
        </div>

        <h3 style={{ marginTop: '2rem' }}>📜 License</h3>
        <p>
          Canto is licensed under the <strong>Apache License 2.0</strong>. You are free to:
        </p>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ Use commercially</li>
          <li>✅ Modify and distribute</li>
          <li>✅ Use in patent-protected works</li>
          <li>✅ Use privately</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>🚀 Self-Hosting Guide</h3>
        <p>Want to run your own Canto instance? Here's how:</p>
        <div style={{ 
          background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
          borderRadius: '6px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85em',
          lineHeight: '2', margin: '1rem 0', overflowX: 'auto'
        }}>
          <div style={{ color: 'var(--text-muted)' }}># 1. Clone the repository</div>
          <div>git clone https://github.com/sah-rohit/Canto.git</div>
          <div>cd Canto</div>
          <br/>
          <div style={{ color: 'var(--text-muted)' }}># 2. Install dependencies</div>
          <div>npm install</div>
          <br/>
          <div style={{ color: 'var(--text-muted)' }}># 3. Copy and fill in your API keys</div>
          <div>cp .env.example .env</div>
          <br/>
          <div style={{ color: 'var(--text-muted)' }}># 4. Start the dev server</div>
          <div>npm run dev</div>
        </div>

        <h3 style={{ marginTop: '2rem' }}>🔑 Required API Keys</h3>
        <p>
          You'll need to obtain your own API keys for the following services (all have free tiers):
        </p>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>Groq:</strong> <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>console.groq.com</a> — AI model access</li>
          <li><strong>Ollama Cloud:</strong> <a href="https://ollama.com/cloud" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>ollama.com/cloud</a> — AI model access</li>
          <li><strong>NASA:</strong> <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>api.nasa.gov</a> — Space data</li>
          <li><strong>CORE:</strong> <a href="https://core.ac.uk/services/api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>core.ac.uk</a> — Academic papers</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>🤝 Contributing</h3>
        <p>We welcome contributions! Here's how to get involved:</p>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>Bug Reports:</strong> Open an issue on GitHub with reproduction steps</li>
          <li><strong>Feature Requests:</strong> Open a discussion on the GitHub repo</li>
          <li><strong>Pull Requests:</strong> Fork the repo, create a branch, and submit a PR</li>
          <li><strong>Documentation:</strong> Help improve docs, guides, and README</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>🏗️ Architecture</h3>
        <div style={{ 
          background: 'var(--input-bg)', border: '1px solid var(--border-color)', 
          borderRadius: '6px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.8em',
          lineHeight: '1.4', margin: '1rem 0', overflowX: 'auto', whiteSpace: 'pre'
        }}>
{`┌──────────────────────────────────────────────────┐
│                   CLIENT (React)                  │
│                                                    │
│  Search ──► Knowledge Service ──► AI Service      │
│              │                     │               │
│              ▼                     ▼               │
│         /api/knowledge        /api/ai              │
└──────────┬──────────────────────┬─────────────────┘
           │                      │
┌──────────▼──────────────────────▼─────────────────┐
│              SERVER (Vite Middleware)               │
│                                                    │
│  ┌─────────┐ ┌──────┐ ┌─────┐ ┌──────┐           │
│  │Wikipedia│ │ NASA │ │CORE │ │OpenLib│           │
│  └────┬────┘ └──┬───┘ └──┬──┘ └──┬───┘           │
│       └─────────┴────────┴───────┘                │
│                     │                              │
│  ┌──────┐ ┌────────▼───────┐ ┌─────┐             │
│  │ Groq │ │  Ollama Cloud  │ │ HF  │             │
│  └──────┘ └────────────────┘ └─────┘             │
│                                                    │
│  IP + Fingerprint Rate Limiting (30/day)          │
└──────────────────────────────────────────────────┘`}
        </div>
      </div>
    )
  }
};

interface StaticPageProps {
  pageId: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageId }) => {
  const page = pagesData[pageId] || { title: 'Page Not Found', content: <p>We could not find the page you are looking for.</p> };
  const art = asciiArtMap[pageId] || '';

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
