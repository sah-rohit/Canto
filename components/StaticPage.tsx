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
          Traditional encyclopedias are static snapshots. I created Canto to change this by generating comprehensive, well-structured, and fact-checked documents in real-time. By sourcing raw factual material directly from verified data repositories, I enable the creation of thorough reference articles on any topic you choose.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Knowledge Integrations</h3>
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

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Encyclopedia Galactica</h3>
        <p>
          The Encyclopedia Galactica serves as my premium knowledge processing model. It links nodes into continuous semantic graphs, turning single keywords into detailed technical concepts without limits.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>AI-Assisted Research and Document Q&A</h3>
        <p>
          In addition to generation, Canto acts as an interactive study assistant. Highlight text within any article to perform contextual sub-searches, open relevant research summaries, and explore related entities on the fly.
        </p>
      </div>
    )
  },
  pricing: {
    title: 'Canto Access and Availability',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>I provide a completely accessible knowledge service without paywalls, login screens, or advertising networks. Every user receives the exact same tier, functionality, and computational resources without any discrimination.</p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Unified Free Access For All</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>20 new searches per day:</strong> Refreshes automatically every 24 hours.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Synthesis Pipeline access:</strong> Fetches and combines real-time data from NASA, Wikipedia, CORE, and the Internet Archive.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>In-Article Deep Search:</strong> Scan and highlight information across thousands of words.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Unlimited Library browsing:</strong> Read and review cached files, search logs, and favorites anytime.</li>
          <li style={{ marginBottom: '0.8rem' }}>• <strong>Local storage data export:</strong> Export to TXT and PDF for complete offline reading.</li>
        </ul>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Why is Canto Free?</h3>
        <p>
          I built Canto as a pure solo project dedicated to open learning and accessible technology. My core mission is to provide equal research capabilities to everyone, whether you are a student, hobbyist, or professional researcher.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Managing Search Limits</h3>
        <p>
          The 20-search daily threshold exists solely to keep server operation expenses reasonable. You can continue scanning cached history items, accessing your folders, editing ASCII creations, and extracting documents indefinitely.
        </p>
      </div>
    )
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>Common questions about the Canto knowledge and research system:</p>
        
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>What is Canto?</h3>
        <p>
          Canto is a complete real-time, AI-driven research platform that I designed to extract verified information from Wikipedia, NASA, CORE Academic, and the Internet Archive. It transforms raw prompts into structured, thorough technical entries.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Who is behind this project?</h3>
        <p>
          Canto is my single, independent solo project. I designed, developed, and maintain Canto entirely on my own as a high-performance open repository.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>How does in-article search work?</h3>
        <p>
          Every article includes a real-time deep scanning engine that I built. Just type in any word or phrase, and the application highlights exact occurrences directly within the reading mode.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Are my searches private?</h3>
        <p>
          Yes, completely. Your search history and configurations are stored directly in your browser's LocalStorage and local IndexedDB database.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>I respect your right to total privacy. Here is how I protect your data:</p>
        
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>1. Local Storage Persistence</h3>
        <p>
          I do not collect, transmit, or store your queries, browsing profiles, search history, or modifications on external cloud servers. All persistent information remains strictly inside your local browser storage.
        </p>
        
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>2. Isolated Sourcing Pipeline</h3>
        <p>
          I route information requests anonymously through my direct service proxy. No personal device identifiers, local data, or tracking tokens are sent to third-party data repositories or synthesis networks.
        </p>

        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>3. Data Control</h3>
        <p>
          You remain in full control of your local data. You can inspect, modify, clear, and export your personal reading logs directly from the Library menu.
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms and Conditions',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>Simple rules for utilizing Canto:</p>
        
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>1. Fair Use</h3>
        <p>
          Please respect the search limits provided. These exist solely to prevent computational abuse and ensure consistent accessibility for all independent learners.
        </p>
        
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>2. Data Grounding</h3>
        <p>
          While I take great care to ground every output in direct data contexts from NASA, Wikipedia, and the Internet Archive, all generated content should be treated as dynamic research summaries. For academic or critical needs, please verify information via primary source documents.
        </p>
      </div>
    )
  },
  opensource: {
    title: 'Open Source Development',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>I built Canto on a foundation of open, transparent, and auditable software.</p>
        
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Public Repository</h3>
        <p>
          The entire codebase for the client application, styling systems, and multi-source pipelines is openly accessible. I welcome forks, reviews, and local hosting configurations.
        </p>
        <p>
          Visit the source repository on GitHub: <a href="https://github.com/sah-rohit/Canto" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>github.com/sah-rohit/Canto</a>
        </p>
      </div>
    )
  },
  galactica: {
    title: 'Encyclopedia Galactica',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>Explore specialized technical concepts, scientific discoveries, advanced knowledge nodes, and cross-references.</p>
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Advanced Knowledge Network</h3>
        <p>
          I designed the Encyclopedia Galactica to model deep technical entities as continuous semantic pathways. This lets you drill down from broad overviews into the exact scientific and philosophical contexts you need.
        </p>
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>Primary Classifications</h3>
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

  const handleExportLibrary = () => {
    const data = {
      favorites,
      history,
      collections: JSON.parse(localStorage.getItem('canto_collections') || '{}'),
      artHistory: JSON.parse(localStorage.getItem('canto_art_history') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canto-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.favorites) localStorage.setItem('canto_favs', JSON.stringify(parsed.favorites));
        if (parsed.history) localStorage.setItem('canto_history', JSON.stringify(parsed.history));
        if (parsed.collections) localStorage.setItem('canto_collections', JSON.stringify(parsed.collections));
        if (parsed.artHistory) localStorage.setItem('canto_art_history', JSON.stringify(parsed.artHistory));
        alert('Library re-imported successfully! Reload the application to view changes.');
        window.location.reload();
      } catch (err) {
        alert('Invalid library JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  if (pageId === 'library') {
    return (
      <div style={{ paddingBottom: '2rem', fontFamily: 'monospace' }}>
        <h2 style={{ marginBottom: '1rem', letterSpacing: '0.1em' }}>My Local Library</h2>
        {art && (
          <pre className="ascii-art living-ascii" style={{ color: '#555', marginBottom: '2rem', overflowX: 'auto', fontSize: '0.65em', lineHeight: '1.2' }}>
            {art}
          </pre>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleExportLibrary} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace' }}>
            Export Backup
          </button>
          <label style={{ textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace' }}>
            Import Backup
            <input type="file" accept=".json" onChange={handleImportLibrary} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', marginTop: '2rem' }}>
          <section>
            <h3 style={{ fontSize: '1em', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Favorites</h3>
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
            <h3 style={{ fontSize: '1em', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent History</h3>
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
