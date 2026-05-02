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
      .    .  ( * ) .    .
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
    title: 'About Canto — Infinite Knowledge Repository',
    content: (
      <div style={{ fontFamily: 'monospace', textAlign: 'justify', lineHeight: '1.8' }}>
        <p>Welcome to <strong>Canto</strong> — an infinite, real-time AI encyclopedia designed for robust academic synthesis, technical depth, and deep learning.</p>
        <p>
          Traditional encyclopedias are static snapshots. Canto changes this by generating comprehensive, well-structured, and fact-checked documents in real-time. By sourcing raw factual material directly from verified data repositories, Canto creates thorough reference articles on any topic you choose.
        </p>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Knowledge Integrations</h3>
        <p>
          Canto leverages multiple authoritative information sources to prevent AI hallucination and ground content in objective data:
        </p>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <strong>Wikipedia Integration:</strong> Extracts structured historical data, core definitions, and primary reference points.
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <strong>NASA Technical Reports:</strong> Accesses real aerospace, scientific, and technical breakthroughs.
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <strong>Internet Archive Research:</strong> Queries digital book copies and archived open datasets to provide accurate historical context.
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <strong>CORE Academic Studies:</strong> Gathers current peer-reviewed research papers and academic abstracts for advanced exploration.
          </li>
        </ul>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Encyclopedia Galactica</h3>
        <p>
          The Encyclopedia Galactica serves as our premium knowledge processing model. It links nodes into continuous semantic graphs, turning single keywords into detailed technical concepts without limits.
        </p>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>AI-Assisted Research and Document Q&A</h3>
        <p>
          In addition to generation, Canto acts as an interactive study assistant. Highlight text within any article to perform contextual sub-searches, open relevant research summaries, and explore related entities on the fly.
        </p>
      </div>
    )
  },
  pricing: {
    title: 'Canto Plans and Pricing',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
        <p>We provide a fully accessible knowledge service without paywalls, login screens, or advertising networks.</p>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Standard Free Tier</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>20 searches per day:</strong> Refreshes automatically every 24 hours.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Synthesis Pipeline access:</strong> Fetches and combines real-time data from NASA, Wikipedia, CORE, and the Internet Archive.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>In-Article Deep Search:</strong> Scan and highlight information across thousands of words.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Unlimited Library browsing:</strong> Read and download cached files, search logs, and favorites anytime.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Local storage data export:</strong> Export to TXT and PDF for complete offline reading.</li>
        </ul>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Enterprise and Contributor Plans</h3>
        <p>
          For researchers, academic institutions, and organizations needing elevated computational limits, API keys can be supplied directly through local configuration. Contact the Canto open-source community to find out more.
        </p>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>What happens when I hit my limit?</h3>
        <p>
          Daily search credits are consumed only when generating new articles. You can always search cached history items, add items to folders, edit ASCII art, and export files without any restrictions.
        </p>
      </div>
    )
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>What is Canto?</h3>
        <p>
          Canto is an AI-driven research assistant that synthesizes direct evidence from Wikipedia, NASA, Academic CORE, and the Internet Archive. It transforms raw search prompts into structured, highly technical articles.
        </p>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>How does the in-article search work?</h3>
        <p>
          Every article features a real-time deep scanning engine. Type in any phrase, and Canto will instantly find and highlight matches in the reading mode without altering text flow.
        </p>

        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>What is the Encyclopedia Galactica?</h3>
        <p>
          It is an advanced technical classification system within Canto that links complex entities, deep scientific theories, and speculative scenarios into organized, cross-referenced documentation.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
        <p>We respect your right to total privacy. Here is how your data is secured:</p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>1. Direct Local Persistence</h3>
        <p>
          All of your search history, favorite lists, mind maps, and user settings are kept entirely in your browser's local storage and IndexedDB database. No data is sent to external cloud storage providers.
        </p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>2. Anonymous Queries</h3>
        <p>
          Queries are proxied over our secure service layer. Personal identifiers, browsing patterns, and local configuration details are never transmitted to third-party language model providers.
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms and Conditions',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
        <p>Simple rules for using the Canto research platform:</p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>1. Rate Limits</h3>
        <p>
          We ask that you observe the daily API request thresholds. This ensures fair use and computational availability for everyone on the platform.
        </p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>2. Academic Sourcing</h3>
        <p>
          Canto pulls direct research context from trusted resources like NASA, Wikipedia, and the Internet Archive. However, always consult individual primary texts for critical research.
        </p>
      </div>
    )
  },
  opensource: {
    title: 'Open Source Development',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
        <p>Canto is built with transparency and user privacy in mind.</p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Source Repository</h3>
        <p>
          The complete client codebase, including styling, services, and multi-source integrations, is fully accessible and licensed under the Apache 2.0 license.
        </p>
      </div>
    )
  },
  galactica: {
    title: 'Encyclopedia Galactica',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8' }}>
        <p>Explore specialized technical concepts, scientific discoveries, advanced knowledge nodes, and cross-references.</p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Advanced Knowledge Network</h3>
        <p>
          Encyclopedia Galactica models deep technical entities as continuous semantic pathways. This lets you drill down from broad overviews into the exact scientific and philosophical contexts you need.
        </p>
        <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Primary Classifications</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Cosmology & Aerospace:</strong> Complex planetary physics, dark matter experiments, and satellite telemetry studies.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Cybernetics & Machine Logic:</strong> Neural architectures, advanced AI reasoning, and recursive computational networks.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Theoretical Metaphysics:</strong> Dialectics, systemic realities, and logical paradoxes.</li>
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
      <div style={{ paddingBottom: '2rem', fontFamily: 'monospace' }}>
        <h2 style={{ marginBottom: '1rem', letterSpacing: '0.1em' }}>My Local Library</h2>
        {art && (
          <pre className="ascii-art living-ascii" style={{ color: '#555', marginBottom: '2rem', overflowX: 'auto' }}>
            {art}
          </pre>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', marginTop: '2rem' }}>
          <section>
            <h3 style={{ fontSize: '1em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Favorites</h3>
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
            <h3 style={{ fontSize: '1em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent History</h3>
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
        <div style={{ marginTop: '4rem', padding: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '0' }}>
          <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            Privacy Note: All library data is stored exclusively in your browser's local storage. Clearing site data will permanently remove your stored reading logs.
          </p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ paddingBottom: '2rem', fontFamily: 'monospace' }}>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem', fontFamily: 'monospace' }}>
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
