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
  cantostore: `
  _  _  _  _  _  _  _  _  _  _  _  _  _  _  _ 
 / )/ )/ )/ )/ )/ )/ )/ )/ )/ )/ )/ )/ )/ )/ )
(__)(__)(__)(__)(__)(__)(__)(__)(__)(__)(__)(__)
  ___   __   _  _  ____  __   ____  ____  __  ____  ____ 
 / __) / _\ ( \( )(_  _)/  \ / ___)(_  _)/  \(  _ \(  __)
( (__ /    \/ \  )  )( (  O )\\___ \\ )( (  O ))   / ) _) 
 \\___)\\_/\\_/\\_)\\_) (__) \\__/ (____/(__) \\__/(__\\_)(____)
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ PROJECT DIRECTIVE
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            Welcome to Canto — an infinite, real-time AI encyclopedia designed for robust academic synthesis, technical depth, and deep learning. Traditional encyclopedias are static snapshots. Canto changes this by generating comprehensive, well-structured, and fact-checked documents in real-time.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ KNOWLEDGE INTEGRATION HUBS
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Wikipedia:</strong> Extracts structured historical data, core definitions, and primary reference points.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>NASA Technical Reports:</strong> Accesses real aerospace, scientific, and technical breakthroughs.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Internet Archive Research:</strong> Queries digital book copies and archived open datasets.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>CORE Academic Studies:</strong> Gathers current peer-reviewed research papers and abstracts.</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ ADVANCED ENGINES & EXTRACTORS
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Encyclopedia Galactica:</strong> Links nodes into continuous semantic graphs, turning single keywords into technical concepts.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Interactive Q&A:</strong> Highlight text within any article to perform contextual sub-searches and explore related entities on the fly.</div>
          </div>
        </div>
      </div>
    )
  },
  pricing: {
    title: 'Canto Access and Availability',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ ACCESS DIRECTIVE
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            Canto provides a completely accessible knowledge service without paywalls, login screens, or advertising networks. Every user receives the exact same tier, functionality, and computational resources.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ UNIFIED FREE ACCESS LIMITS
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>20 searches per day:</strong> Refreshes automatically every 24 hours.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Synthesis Pipeline:</strong> Fetches and combines real-time data from NASA, Wikipedia, CORE, and the Internet Archive.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>In-Article Deep Search:</strong> Scan and highlight information across thousands of words.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Unlimited Library browsing:</strong> Read and review cached files, search logs, and favorites anytime.</div>
            <div style={{ marginBottom: '0.5rem' }}>├── <strong style={{ color: 'var(--accent-color)' }}>Local data export:</strong> Export to TXT and PDF for complete offline reading.</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ MISSION
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            I built Canto as a pure solo project dedicated to open learning and accessible technology. My core mission is to provide equal research capabilities to everyone.
          </div>
        </div>
      </div>
    )
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CORE SERVICE ARCHITECTURE
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>What is Canto?</strong><br />
              Canto is a complete real-time, AI-driven research platform designed to extract verified information from Wikipedia, NASA, CORE Academic, and the Internet Archive. It transforms raw prompts into structured, thorough technical entries.
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Who is behind this project?</strong><br />
              Canto is an independent solo project. I designed, developed, and maintain Canto entirely on my own as a high-performance open repository.
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CONTROLS & SECURITY
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>How does in-article search work?</strong><br />
              Every article includes a real-time deep scanning engine. Just type in any word or phrase, and the application highlights exact occurrences directly within the reading mode.
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Are my searches private?</strong><br />
              Yes. All search history, stored reading logs, saved entries, and folders are strictly contained within your personal browser's local cache. No user telemetry is ever tracked or transmitted.
            </div>
          </div>
        </div>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ LOCAL CONFIDENTIALITY PROTOCOL
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            Canto upholds complete personal confidentiality across all digital research spaces.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ DATA RESTRICTIONS
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>1. Zero Collection:</strong> Canto does not log individual search queries, user IP addresses, reading logs, or configurations. Your data is stored locally.
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>2. Storage Boundaries:</strong> All processed contexts, library backups, and settings stay inside your personal device memory.
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>3. Telemetry Blocked:</strong> No ad networks, tracking scripts, or profiling analytics are installed.
            </div>
          </div>
        </div>
      </div>
    )
  },
  terms: {
    title: 'Terms of Use',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ USAGE DIRECTIVE
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            Please review the open conditions for accessing our services and systems.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ SYSTEM CONDITIONS
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>1. Unrestricted Access:</strong> Free to leverage all synthesized documents for any needs. No proprietary restrictions on exported text contents, mind maps, or ASCII art.
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>2. Dynamic Grounding:</strong> While generated text references NASA, Wikipedia, and the Internet Archive, all content should be treated as dynamic research summaries.
            </div>
          </div>
        </div>
      </div>
    )
  },
  opensource: {
    title: 'Open Source Development',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CODE BASE AUDIT
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            I built Canto on a foundation of open, transparent, and auditable software.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CODE AVAILABILITY
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Open Architecture:</strong> MIT / Apache licensed codebase.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Source Repository:</strong> Check out the source and fork the project on GitHub: <a href="https://github.com/sah-rohit/Canto" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>github.com/sah-rohit/Canto</a>
            </div>
          </div>
        </div>
      </div>
    )
  },
  galactica: {
    title: 'Encyclopedia Galactica',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CONTINUOUS SEMANTIC PATHWAYS
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            Explore specialized technical concepts, scientific discoveries, advanced knowledge nodes, and cross-references. Canto links entities together in continuous semantic pathways.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CORE ENTITIES INDEX
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Cosmology & Aerospace:</strong> Planetary physics, dark matter experiments, and satellite telemetry studies.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Cybernetics & Machine Logic:</strong> Neural architectures, advanced AI reasoning, and recursive networks.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>Theoretical Metaphysics:</strong> Dialectics, systemic realities, and logical paradoxes.
            </div>
          </div>
        </div>
      </div>
    )
  },
  cantostore: {
    title: 'CantoStore Storage Architecture',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: 'monospace' }}>
        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ FILE SYSTEM & STORAGE ARCHITECTURE
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            The Canto platform integrates a secure, local-first data layer known as **CantoStore**. This architecture eliminates backend user-profile management and stores everything inside your browser's persistent sandbox using **Dexie.js** as an advanced IndexedDB interface.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ CORE STORAGE DOMAINS (INDEXEDDB TABLES)
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>cache:</strong> Saves AI-generated wiki articles, reading context, and metadata summaries.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>history:</strong> Stores your browsing logs, keyword search trails, and recent topics.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>favorites:</strong> Holds all starred topics and user reading collections.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>folders:</strong> Hierarchical folders used to classify your cached reading lists.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>analytics:</strong> Tracks read metrics, reading time, and system generation speeds.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>codex:</strong> Stores your interactive Canto Codex achievements, stats, and rankings.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>notes:</strong> Private local wiki pages, custom files, and connected references.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>graphs:</strong> Complex semantic maps connecting entities through technical links.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>artHistory:</strong> Saved local ASCII art generations and design tokens.
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ├── <strong style={{ color: 'var(--accent-color)' }}>writeQueue:</strong> Background synchronization and storage pipeline for zero-latency operations.
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            ◆ SYNCHRONIZATION & SAFETY
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.6' }}>
            CantoStore uses double-buffered backup policies. Background flushes prevent sudden session loss, and complete JSON backups can be extracted or reloaded directly via the local library page at any time.
          </div>
        </div>
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
          <button onClick={handleExportLibrary} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85em' }}>
            Export Backup
          </button>
          <label style={{ textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85em' }}>
            Import Backup
            <input type="file" accept=".json" onChange={handleImportLibrary} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', marginTop: '2rem' }}>
          <section>
            <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
              ◆ Favorites
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', height: '280px', overflowY: 'auto' }}>
              {favorites.length === 0 ? <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>No starred topics yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {favorites.map(t => (
                    <li key={t} style={{ marginBottom: '0.4rem', fontSize: '0.88em', display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-muted)' }}>├──</span>
                      <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace', flex: 1 }}>{t}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
              ◆ Recent History
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', height: '280px', overflowY: 'auto' }}>
              {history.length === 0 ? <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>No browsing history.</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {history.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem', fontSize: '0.88em', display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-muted)' }}>├──</span>
                      <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace', flex: 1 }}>{t}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
              ◆ Frequently Searched
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', height: '280px', overflowY: 'auto' }}>
              {topTopics.length === 0 ? <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>No frequent topics yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {topTopics.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: '0.4rem', fontSize: '0.88em', display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-muted)' }}>├──</span>
                      <button onClick={() => onTopicClick?.(t)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace', flex: 1 }}>{t}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* ── Private Notes / Personal Wiki ── */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '3.5rem', paddingTop: '2.5rem' }}>
          <div style={{ fontSize: '0.7em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '1.2rem' }}>
            ◆ Private Knowledge Base
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {/* Form */}
            <form onSubmit={handleCreateNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', height: '350px', overflowY: 'auto' }}>
              <h4 style={{ margin: 0, fontSize: '0.85em', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-color)' }}>Add Note / Article</h4>
              <input
                type="text"
                placeholder="Note Title..."
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace', padding: '0.3rem 0', outline: 'none', fontSize: '0.85em' }}
              />
              <textarea
                placeholder="Write private notes. Link to Canto articles by placing the title exactly in text..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                rows={4}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace', padding: '0.5rem', outline: 'none', fontSize: '0.85em' }}
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: '0.4rem 0', fontFamily: 'monospace', fontSize: '0.85em', textDecoration: 'underline', textAlign: 'left' }}>
                Save Private Entry
              </button>
            </form>

            {/* Notes List */}
            <div style={{ height: '350px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Find:</span>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={notesSearch}
                  onChange={e => setNotesSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontFamily: 'monospace', padding: '0.2rem', flex: 1, outline: 'none', fontSize: '0.85em' }}
                />
              </div>
              {filteredNotes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>No entries found.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredNotes.map(n => (
                    <li key={n.id} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9em', color: 'var(--accent-color)' }}>{n.title}</strong>
                        <button onClick={() => handleDeleteNote(n.id)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1em' }}>×</button>
                      </div>
                      <p style={{ margin: '0.3rem 0', color: 'var(--text-color)', fontSize: '0.85em', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
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
              <h4 style={{ margin: 0, fontSize: '0.85em', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.2rem', color: 'var(--text-muted)' }}>Quick References</h4>
              {notes.length === 0 ? <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>No saved note references yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {notes.map(n => (
                    <li key={n.id} style={{ marginBottom: '0.4rem', fontSize: '0.88em', display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-muted)' }}>├──</span>
                      <button onClick={() => onTopicClick?.(n.title)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1em', textDecoration: 'underline', textAlign: 'left', fontFamily: 'monospace', flex: 1 }}>
                        {n.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3.5rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
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
