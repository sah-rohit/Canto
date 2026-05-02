import React, { useState } from 'react';

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
   ( _) /    \\(  O ) 
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
          Yes. All search history, stored reading logs, saved entries, and folders are strictly contained within your personal browser's local cache. No individual user telemetry is ever tracked or transmitted to central databases.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>Canto upholds complete personal confidentiality across all digital research spaces.</p>
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>1. Information We Do Not Collect</h3>
        <p>
          Canto does not log individual search queries, user IP addresses, reading logs, or browser configurations. All processed contexts, library backups, and user settings stay entirely inside your personal local device memory.
        </p>
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>2. Data Exfiltration Prevention</h3>
        <p>
          There are no ad networks, tracking scripts, or profiling analytics installed on Canto. The browser handles direct communication with knowledge and research retrieval endpoints directly via the multi-source crawler pipeline.
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms of Use',
    content: (
      <div style={{ fontFamily: 'monospace', lineHeight: '1.8', textAlign: 'justify' }}>
        <p>Please review our open access conditions:</p>
        <h3 style={{ marginTop: '2rem', paddingBottom: '0.4rem' }}>1. Unrestricted Access</h3>
        <p>
          You are free to leverage all synthesized documents for professional, personal, or educational needs without limitations. There are no proprietary restrictions on exported text contents, mind maps, or ASCII artwork generated during research.
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

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageId, history = [], favorites = [], onTopicClick }) => {
  const page = pagesData[pageId];
  const art = asciiArtMap[pageId] || '';

  // Private notes / Wiki state
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem('canto_notes');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notesSearch, setNotesSearch] = useState('');

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      timestamp: Date.now()
    };
    const next = [newNote, ...notes];
    setNotes(next);
    localStorage.setItem('canto_notes', JSON.stringify(next));
    setNoteTitle('');
    setNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    localStorage.setItem('canto_notes', JSON.stringify(next));
  };

  const handleExportLibrary = () => {
    const data = {
      favorites,
      history,
      collections: JSON.parse(localStorage.getItem('canto_collections') || '{}'),
      artHistory: JSON.parse(localStorage.getItem('canto_art_history') || '[]'),
      notes
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
        if (parsed.notes) localStorage.setItem('canto_notes', JSON.stringify(parsed.notes));
        alert('Library re-imported successfully! Reloading...');
        window.location.reload();
      } catch (err) {
        alert('Invalid library JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  if (pageId === 'library') {
    const filteredNotes = notes.filter(n => 
      n.title.toLowerCase().includes(notesSearch.toLowerCase()) || 
      n.content.toLowerCase().includes(notesSearch.toLowerCase())
    );

    // Compute top searches/frequent topics index for balanced right-hand space
    const allTopics = [...history, ...favorites];
    const freq: Record<string, number> = {};
    allTopics.forEach(t => freq[t] = (freq[t] || 0) + 1);
    const topTopics = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(e => e[0]);

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
            <div style={{ height: '280px', overflowY: 'auto' }}>
              {favorites.length === 0 ? <p style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>No starred topics yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {favorites.map(t => (
                    <li key={t} style={{ marginBottom: '0.6rem' }}>
                      <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.05em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace' }}>{t}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1em', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent History</h3>
            <div style={{ height: '280px', overflowY: 'auto' }}>
              {history.length === 0 ? <p style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>No browsing history.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {history.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: '0.6rem' }}>
                      <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.05em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace' }}>{t}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1em', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Frequently Searched</h3>
            <div style={{ height: '280px', overflowY: 'auto' }}>
              {topTopics.length === 0 ? <p style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>No frequent topics yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {topTopics.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: '0.6rem' }}>
                      <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.05em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace' }}>{t}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* ── Private Notes / Personal Wiki ── */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '4rem', paddingTop: '2.5rem' }}>
          <h2 style={{ letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Private Knowledge Base</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {/* Form */}
            <form onSubmit={handleCreateNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', height: '350px', overflowY: 'auto' }}>
              <h4 style={{ margin: 0, fontSize: '0.9em', letterSpacing: '0.1em' }}>Add Note / Article</h4>
              <input
                type="text"
                placeholder="Note Title..."
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace', padding: '0.3rem 0', outline: 'none' }}
              />
              <textarea
                placeholder="Write private notes. Link to Canto articles by placing the title exactly in text..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                rows={4}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace', padding: '0.5rem', outline: 'none' }}
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: '0.4rem 0', fontFamily: 'monospace', fontSize: '0.85em', textDecoration: 'underline', textAlign: 'left' }}>
                Save Private Entry
              </button>
            </form>

            {/* Notes List */}
            <div style={{ height: '350px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Find:</span>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={notesSearch}
                  onChange={e => setNotesSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace', padding: '0.2rem', flex: 1, outline: 'none' }}
                />
              </div>
              {filteredNotes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88em' }}>No entries found.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {filteredNotes.map(n => (
                    <li key={n.id} style={{ marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.95em' }}>{n.title}</strong>
                        <button onClick={() => handleDeleteNote(n.id)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                      </div>
                      <p style={{ margin: '0.4rem 0', color: 'var(--text-color)', fontSize: '0.88em', whiteSpace: 'pre-wrap' }}>
                        {n.content}
                      </p>
                      {onTopicClick && (
                        <button
                          onClick={() => onTopicClick(n.title)}
                          style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.78em', padding: 0 }}
                        >
                          Generate AI Wiki Entry on This
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Knowledge Notes Quick References Column */}
            <div style={{ height: '350px', overflowY: 'auto' }}>
              <h4 style={{ margin: 0, fontSize: '0.9em', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.2rem', color: 'var(--text-muted)' }}>Quick References</h4>
              {notes.length === 0 ? <p style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>No saved note references yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {notes.map(n => (
                    <li key={n.id} style={{ marginBottom: '0.6rem' }}>
                      <button onClick={() => onTopicClick?.(n.title)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace' }}>
                        {n.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
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
