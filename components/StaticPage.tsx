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
  `,
  galactica: `
     ██████  █████  ██      █████   ██████ ████████ ██  ██████  █████  
    ██      ██   ██ ██     ██   ██ ██         ██    ██ ██      ██   ██ 
    ██   ███ ███████ ██     ███████ ██         ██    ██ ██      ███████ 
    ██    ██ ██   ██ ██     ██   ██ ██         ██    ██ ██      ██   ██ 
     ██████  ██   ██ ███████ ██   ██  ██████   ██    ██  ██████ ██   ██ 
  `
};

const pagesData: Record<string, { title: string, content: React.ReactNode }> = {
  about: {
    title: 'About Canto',
    content: (
      <div>
        <p>Welcome to <strong>Canto</strong> — an infinite, AI-powered encyclopedia.</p>
        <p>
          We believe in a world where curiosity never hits a dead end. Our mission is to provide an
          infinite, real-time generated encyclopedia where every word is a doorway to new knowledge.
        </p>
        <h3 style={{ marginTop: '2rem' }}>How It Works</h3>
        <p>
          Unlike traditional encyclopedias that rely on pre-written articles, Canto uses a multi-source 
          knowledge pipeline. When you search for a topic, it simultaneously fetches verified information from
          <strong> Wikipedia</strong>, <strong>NASA</strong>, <strong>Internet Archive / Open Library</strong>, <strong>CORE Academic</strong>, and <strong>live web search</strong> via duckduckgo and web crawling technologies.
          This context is fed into a multi-provider AI fallback chain which synthesizes a rich, encyclopedia-style article in real time.
        </p>
        <h3 style={{ marginTop: '2rem' }}>AI Assisted Research</h3>
        <p>
          Canto assists in deep knowledge exploration. It provides direct source extracts, auto-summarization options,
          and a relationship tree so that you can navigate topics with structural clarity and full provenance.
        </p>
      </div>
    )
  },
  pricing: {
    title: 'Pricing',
    content: (
      <div>
        <p>Canto is completely free. No accounts, no paywalls, no subscriptions.</p>
        <h3 style={{ marginTop: '2rem' }}>🆓 Free — Always</h3>
        <ul style={{ lineHeight: '2' }}>
          <li><strong>20 searches per day</strong> per IP address</li>
          <li>In-depth articles synthesized by multiple AI providers</li>
          <li>Rich structural mind maps & Relationship graphs for any topic</li>
          <li>Advanced Web Crawling Content Filter technology</li>
          <li>Editable and downloadable custom ASCII art</li>
          <li>Exportable knowledge bases (TXT / PDF)</li>
        </ul>
        <h3 style={{ marginTop: '2rem' }}>What if I hit the limit?</h3>
        <p>
          The limit resets automatically every day at midnight UTC. You can continue reading cached articles,
          browsing favorites, exploring your library, and editing your ASCII creations.
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
          Canto is a generative AI encyclopedia. It converts raw real-time research facts from 5+ knowledge repositories 
          into clean, high-impact reading articles with mind maps and direct word cross-references.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Are the generated ASCII diagrams editable?</h3>
        <p>
          Yes! Every generated ASCII art block has an <strong>✏️ Edit Art</strong> button. Clicking it converts the artwork
          into an editable text-area where you can customize it, save your modifications, and download the raw `.txt` directly.
        </p>

        <h3 style={{ marginTop: '2rem' }}>How does the Web Scraper work?</h3>
        <p>
          Our built-in crawler extracts high-accuracy context and metadata from DuckDuckGo snippets and live open sources
          to supply the latest, fact-checked contexts to the AI pipeline before generating articles.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div>
        <p>We take privacy extremely seriously. Here is how your data stays purely yours:</p>
        <h3 style={{ marginTop: '2rem' }}>1. Local Persistence</h3>
        <p>
          All search logs, favorite topics, mind maps, and user modifications are strictly stored inside your browser's
          <strong> IndexedDB</strong>. We do not store your browsing profiles, cookies, or history on our servers.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. Encrypted Queries</h3>
        <p>
          All requests are proxied via our secure serverless endpoint. No private user data or credentials are leaked
          to third-party AI APIs.
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    content: (
      <div>
        <p>Simple rules for using Canto:</p>
        <h3 style={{ marginTop: '2rem' }}>1. Fair Use</h3>
        <p>
          Please respect the 20 searches-per-day rate limit. These limits exist to guarantee fair access to everyone.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. Data Provenance</h3>
        <p>
          Canto attempts to ground all articles in real factual material, but it is an AI tool. Verify critical information
          with the referenced citations.
        </p>
      </div>
    )
  },
  opensource: {
    title: 'Open Source',
    content: (
      <div>
        <p>
          Canto's architecture is fully auditable, forkable, and self-hostable.
        </p>
        <h3 style={{ marginTop: '2rem' }}>📦 Github Repository</h3>
        <p>
          Clone and explore the codebase under the Apache 2.0 license: <a href="https://github.com/sah-rohit/Canto" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>github.com/sah-rohit/Canto</a>
        </p>
      </div>
    )
  },
  galactica: {
    title: 'Encyclopedia Galactica',
    content: (
      <div>
        <p>
          Step into the <strong>Encyclopedia Galactica</strong> — a premium cataloging system for exploring expansive 
          concepts, speculative ideas, deep knowledge graphs, and cross-references.
        </p>
        <h3 style={{ marginTop: '2rem' }}>Deep Knowledge Integration</h3>
        <p>
          Unlike a standard wiki search, the Galactica connects nodes into continuous networks, allowing you to branch out 
          from simple terms into specialized multi-tier technical sub-concepts.
        </p>
        <h3 style={{ marginTop: '2rem' }}>Core Categories</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>🌌 <strong>Cosmology & Astrobiology:</strong> Stellar systems, warp fields, dark matter.</li>
          <li>⚙️ <strong>Cybernetics:</strong> Neural networking, bio-hacking, and artificial intelligence.</li>
          <li>🧩 <strong>Metaphysics:</strong> Philosophical paradoxes and reality constructs.</li>
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
        <p>The page you are looking for does not exist.</p>
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
