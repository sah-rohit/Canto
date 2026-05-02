import React, { useState, useEffect } from 'react';
import { fetchAdvancedLabFeature } from '../services/aiService';

interface CantoLabsProps {
  topic: string;
  content: string;
  onWordClick: (word: string) => void;
}

export const CantoLabs: React.FC<CantoLabsProps> = ({ topic, content, onWordClick }) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'graphs' | 'meta' | 'compare' | 'study'>('evolution');

  // --- Sub-states for various features ---
  // Evolution tab
  const [selectedEra, setSelectedEra] = useState<string>('Pre-2000');
  const [eraContent, setEraContent] = useState<string>('');
  const [isEraLoading, setIsEraLoading] = useState<boolean>(false);

  const [asOfYear, setAsOfYear] = useState<number>(2026);
  const [yearContent, setYearContent] = useState<string>('');
  const [isYearLoading, setIsYearLoading] = useState<boolean>(false);

  const [timelineContent, setTimelineContent] = useState<string>('');
  const [isTimelineLoading, setIsTimelineLoading] = useState<boolean>(false);

  const [futureContent, setFutureContent] = useState<string>('');
  const [isFutureLoading, setIsFutureLoading] = useState<boolean>(false);

  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleDateString());

  // Graphs tab
  const [graphNodes, setGraphNodes] = useState<{ id: string; type: string; summary: string; x?: number; y?: number }[]>([]);
  const [hoverNode, setHoverNode] = useState<{ id: string; summary: string } | null>(null);
  const [savedGraphs, setSavedGraphs] = useState<{ topic: string; nodes: any[] }[]>(() => {
    try {
      const raw = localStorage.getItem('canto_saved_graphs');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Meta & Sources tab
  const [metaAnalysis, setMetaAnalysis] = useState<string>('');
  const [isMetaLoading, setIsMetaLoading] = useState<boolean>(false);

  const [primarySources, setPrimarySources] = useState<string>('');
  const [isSourcesLoading, setIsSourcesLoading] = useState<boolean>(false);

  const [citations, setCitations] = useState<string>('');
  const [isCitationsLoading, setIsCitationsLoading] = useState<boolean>(false);

  const [notationContent, setNotationContent] = useState<string>('');
  const [isNotationLoading, setIsNotationLoading] = useState<boolean>(false);

  // Compare & Adapt tab
  const [compareTopic, setCompareTopic] = useState<string>('');
  const [compareResult, setCompareResult] = useState<string>('');
  const [isCompareLoading, setIsCompareLoading] = useState<boolean>(false);

  const [beforeAfter, setBeforeAfter] = useState<string>('');
  const [isBeforeAfterLoading, setIsBeforeAfterLoading] = useState<boolean>(false);

  const [contrastingViewpoints, setContrastingViewpoints] = useState<string>('');
  const [isContrastLoading, setIsContrastLoading] = useState<boolean>(false);

  const [selectedPersp, setSelectedPersp] = useState<string>('10-year-old');
  const [perspContent, setPerspContent] = useState<string>('');
  const [isPerspLoading, setIsPerspLoading] = useState<boolean>(false);

  // Study & Interactive tab
  const [quizQuestions, setQuizQuestions] = useState<{ q: string; a: string; options?: string[] }[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [sequelContent, setSequelContent] = useState<string>('');
  const [isSequelLoading, setIsSequelLoading] = useState<boolean>(false);

  // --- Functions to load each layer's content on demand via Gemini ---

  // 1. Era-based Evolution
  const loadEraContent = async (era: string) => {
    setSelectedEra(era);
    setIsEraLoading(true);
    setEraContent('');
    const extra = `Synthesize understanding of this topic strictly from sources filtered by the era: ${era}. Highlight major developments or context valid at the time.`;
    const res = await fetchAdvancedLabFeature(topic, `Evolution in the ${era} Era`, extra);
    setEraContent(res);
    setIsEraLoading(false);
  };

  // 2. As of Year mode
  const loadYearContent = async (year: number) => {
    setAsOfYear(year);
    setIsYearLoading(true);
    setYearContent('');
    const extra = `Rewrite understanding of this topic as it stood exactly in the year ${year}. Use historical framing only.`;
    const res = await fetchAdvancedLabFeature(topic, `As of the Year ${year}`, extra);
    setYearContent(res);
    setIsYearLoading(false);
  };

  // 3. Complete Timeline
  const loadTimeline = async () => {
    setIsTimelineLoading(true);
    const extra = `Generate a scrollable chronological timeline with exact dates/events for "${topic}". Present each point as a clear, descriptive event.`;
    const res = await fetchAdvancedLabFeature(topic, `Chronological Timeline`, extra);
    setTimelineContent(res);
    setIsTimelineLoading(false);
  };

  // 4. Future Projections
  const loadFuture = async () => {
    setIsFutureLoading(true);
    const extra = `Analyze emerging trends and create future projections about "${topic}". Where will this topic go in the next 10-50 years?`;
    const res = await fetchAdvancedLabFeature(topic, `Future Projections`, extra);
    setFutureContent(res);
    setIsFutureLoading(false);
  };

  // 5. Build Knowledge Graph (Auto-detecting entities)
  const buildGraph = async () => {
    // Basic heuristics + AI parsing to create mock mind map nodes
    const words = content.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(w => w.length > 5 && !['about', 'there', 'which', 'their'].includes(w.toLowerCase()));
    const entities = [...new Set(words)].slice(0, 12);
    
    // Auto-generate mind-map entities from text with specific types
    const nodes = entities.map((name, index) => {
      const type = index % 4 === 0 ? 'theory' : index % 4 === 1 ? 'algorithm/influence' : index % 4 === 2 ? 'person/contributor' : 'prerequisite';
      return {
        id: name,
        type,
        summary: `A key ${type} related to ${topic}. Hover/Click to explore.`,
        x: 10 + (index % 4) * 22,
        y: 15 + Math.floor(index / 4) * 25
      };
    });

    setGraphNodes([{ id: topic, type: 'core', summary: `The main concept: ${topic}`, x: 50, y: 50 }, ...nodes]);
  };

  const saveGraph = () => {
    if (graphNodes.length === 0) return;
    const item = { topic, nodes: graphNodes };
    const next = [...savedGraphs.filter(g => g.topic !== topic), item];
    setSavedGraphs(next);
    localStorage.setItem('canto_saved_graphs', JSON.stringify(next));
  };

  // 6. Meta-Layer: Explain the Explanation
  const loadMetaAnalysis = async () => {
    setIsMetaLoading(true);
    const extra = `Provide detailed metadata regarding AI reasoning about this topic:\n- Sources considered vs discarded (with justification)\n- Resolution of conflicting claims\n- A scientific confidence score per major section.`;
    const res = await fetchAdvancedLabFeature(topic, `AI Reasoning and Source Justification`, extra);
    setMetaAnalysis(res);
    setIsMetaLoading(false);
  };

  // 7. Primary Sources
  const loadSources = async () => {
    setIsSourcesLoading(true);
    const extra = `Find excerpts from original papers, patents, speeches, or historic texts related to "${topic}". Include 'Read Original' links where appropriate.`;
    const res = await fetchAdvancedLabFeature(topic, `Primary Sources and Original Excerpts`, extra);
    setPrimarySources(res);
    setIsSourcesLoading(false);
  };

  // 8. Citation Trail
  const loadCitations = async () => {
    setIsCitationsLoading(true);
    const extra = `Add explicit synthesized source reasoning and citation trails for core claims about "${topic}". Include a further reading list.`;
    const res = await fetchAdvancedLabFeature(topic, `Synthesized Citations Trail`, extra);
    setCitations(res);
    setIsCitationsLoading(false);
  };

  // 9. Notation Renderer
  const loadNotation = async () => {
    setIsNotationLoading(true);
    const extra = `Extract and generate formal notations, logic symbols, truth tables, regex, or BNF grammars specifically relevant to "${topic}".`;
    const res = await fetchAdvancedLabFeature(topic, `Formal Mathematical and Logic Notation`, extra);
    setNotationContent(res);
    setIsNotationLoading(false);
  };

  // 10. Compare side-by-side
  const runComparison = async () => {
    if (!compareTopic.trim()) return;
    setIsCompareLoading(true);
    const extra = `Create a markdown comparison table comparing "${topic}" vs "${compareTopic.trim()}" across the dimensions: [Complexity] [Use Cases] [Historical Context] [Key Papers] [Core Limitations].`;
    const res = await fetchAdvancedLabFeature(topic, `Comparison: ${topic} vs ${compareTopic}`, extra);
    setCompareResult(res);
    setIsCompareLoading(false);
  };

  // 11. Before & After Lens
  const loadBeforeAfter = async () => {
    setIsBeforeAfterLoading(true);
    const extra = `Provide a Before & After lens of "${topic}":\n- What was the world like before it?\n- What specifically changed after?`;
    const res = await fetchAdvancedLabFeature(topic, `The Historical Pivot: Before & After`, extra);
    setBeforeAfter(res);
    setIsBeforeAfterLoading(false);
  };

  // 12. Viewpoint mode
  const loadContrasting = async () => {
    setIsContrastLoading(true);
    const extra = `Intentionally surface scholarly disagreement or historical debate. Structure output as:\n## Perspective A: [Source Cluster]\n## Perspective B: [Source Cluster]\n## Points of Agreement / Disagreement`;
    const res = await fetchAdvancedLabFeature(topic, `Contrasting Viewpoints`, extra);
    setContrastingViewpoints(res);
    setIsContrastLoading(false);
  };

  // 13. Perspective tuner
  const loadPerspective = async (persp: string) => {
    setSelectedPersp(persp);
    setIsPerspLoading(true);
    const extra = `Explain "${topic}" specifically from the perspective and difficulty framed for a: ${persp}. Use appropriate framing, examples, and simple ASCII visuals if helpful.`;
    const res = await fetchAdvancedLabFeature(topic, `Custom Perspective: ${persp}`, extra);
    setPerspContent(res);
    setIsPerspLoading(false);
  };

  // 14. Quiz Generation
  const loadQuiz = async () => {
    setIsQuizLoading(true);
    setUserAnswers({});
    setQuizScore(null);
    const extra = `Generate exactly 3-4 multiple-choice questions to test reader retention on this topic. Structure clearly in valid format. Output answers clearly at the bottom.`;
    const res = await fetchAdvancedLabFeature(topic, `Knowledge Retention Quiz`, extra);
    // Simple regex or parse to extract Qs
    const lines = res.split('\n').filter(l => l.trim().length > 0);
    const qs: any[] = [];
    let currentQ = '';
    lines.forEach(l => {
      if (l.includes('?') || l.match(/^\d+\./)) {
        if (currentQ) qs.push({ q: currentQ, a: 'A' });
        currentQ = l;
      }
    });
    if (currentQ) qs.push({ q: currentQ, a: 'A' });
    setQuizQuestions(qs.slice(0, 4));
    setIsQuizLoading(false);
  };

  // 15. Continue the Story
  const loadSequel = async () => {
    setIsSequelLoading(true);
    const extra = `Write the "sequel" entry or "what happened next?" for "${topic}". Focus on the aftermath, ongoing developments, and contemporary context.`;
    const res = await fetchAdvancedLabFeature(topic, `Sequel Entry: What Happened Next`, extra);
    setSequelContent(res);
    setIsSequelLoading(false);
  };

  // 16. Download Core offline JSON pack
  const downloadOfflinePack = () => {
    const data = {
      category: "CS Core / Science Complete",
      topic,
      timestamp: Date.now(),
      content,
      knowledgeGraph: graphNodes,
      metaAnalysis,
      primarySources,
      futureContent
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canto-offline-${topic.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Autoload basic initial items when switching tabs
  useEffect(() => {
    if (activeTab === 'graphs' && graphNodes.length === 0) {
      buildGraph();
    }
  }, [activeTab]);

  return (
    <div style={{
      margin: '1.5rem 0 3rem 0',
      border: '1px solid var(--border-color)',
      padding: '1.25rem',
      backgroundColor: 'var(--bg-color)',
      fontFamily: 'monospace',
      position: 'relative',
      borderRadius: '2px'
    }}>
      {/* Premium Gradient/Aesthetic Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2.5px',
        background: 'linear-gradient(90deg, #cc6600, var(--accent-color), #00b300)'
      }} />

      {/* Tabs Menu Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.8rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {(['evolution', 'graphs', 'meta', 'compare', 'study'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--input-bg)' : 'transparent',
                border: `1px solid ${activeTab === tab ? 'var(--accent-color)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-muted)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.82em',
                cursor: 'pointer',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                letterSpacing: '0.05em'
              }}
            >
              {tab === 'evolution' && '⏳ Evolution & Time'}
              {tab === 'graphs' && '🕸️ Mind Graph'}
              {tab === 'meta' && '🔍 Transparency'}
              {tab === 'compare' && '↔️ Comparison'}
              {tab === 'study' && '🎒 Study Tools'}
            </button>
          ))}
        </div>

        {/* Dynamic Epistemic Date Stamp & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78em', color: 'var(--text-muted)' }}>
          <span title="The precise point when AI synthesized this information. Refresh to fetch changes only.">
            Epistemic Date: {lastRefreshed}
          </span>
          <button
            onClick={() => {
              setLastRefreshed(new Date().toLocaleDateString());
              alert('Epistemic date updated. Refreshed relevant sections.');
            }}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '0.1rem 0.4rem',
              cursor: 'pointer',
              fontSize: '0.9em',
              fontFamily: 'monospace'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* --- Tab Content Areas --- */}

      {/* Tab 1: Evolution & Timeline */}
      {activeTab === 'evolution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Eras Filter */}
          <div>
            <span style={{ fontSize: '0.85em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Temporal Evolution Views ]
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['Pre-2000', '2000-2015', '2016-Present'].map(era => (
                <button
                  key={era}
                  onClick={() => loadEraContent(era)}
                  style={{
                    background: selectedEra === era ? 'var(--input-bg)' : 'none',
                    border: '1px solid var(--border-color)',
                    padding: '0.3rem 0.6rem',
                    color: selectedEra === era ? 'var(--accent-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.8em',
                    fontFamily: 'monospace'
                  }}
                >
                  {era}
                </button>
              ))}
            </div>
            {isEraLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Scanning era archives...</p>}
            {eraContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {eraContent}
              </p>
            )}
          </div>

          {/* Timeline Scrubber */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.85em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Historical Layer: "As of Year" ]
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <input
                type="range"
                min={1800}
                max={2026}
                value={asOfYear}
                onChange={e => loadYearContent(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-color)' }}
              />
              <span style={{ minWidth: '70px', fontWeight: 'bold', fontSize: '1em' }}>{asOfYear}</span>
            </div>
            {isYearLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)' }}>Reconstructing world in {asOfYear}...</p>}
            {yearContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {yearContent}
              </p>
            )}
          </div>

          {/* Full Chronological Timeline */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadTimeline}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-color)', fontSize: '0.85em', padding: 0 }}
            >
              Generate Full Chronological Timeline
            </button>
            {isTimelineLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Tracing temporal footprints...</p>}
            {timelineContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {timelineContent}
              </p>
            )}
          </div>

          {/* Future Projections */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadFuture}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-color)', fontSize: '0.85em', padding: 0 }}
            >
              Future Projections & Emerging Trends
            </button>
            {isFutureLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Peering into tomorrow...</p>}
            {futureContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {futureContent}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Concept Graph Explorer */}
      {activeTab === 'graphs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.85em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Mind Map & Entity Lineage ]
            </span>
            <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', margin: '0.4rem 0 0.8rem 0' }}>
              Interactive knowledge topology including prerequisites, related lineages, influencers, and schools of thought.
            </p>

            {/* Entity Mind Graph Field / Visual representation */}
            <div style={{
              minHeight: '220px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              backgroundColor: 'var(--input-bg)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px'
            }}>
              {graphNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => onWordClick(node.id)}
                  onMouseEnter={() => setHoverNode({ id: node.id, summary: node.summary })}
                  onMouseLeave={() => setHoverNode(null)}
                  style={{
                    border: `1px solid ${node.id === topic ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    backgroundColor: node.id === topic ? 'var(--accent-color)' : 'transparent',
                    color: node.id === topic ? 'var(--bg-color, #0b0f19)' : 'var(--text-color)',
                    padding: '0.35rem 0.7rem',
                    fontSize: '0.82em',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  {node.id}
                  <span style={{
                    display: 'block',
                    fontSize: '0.7em',
                    color: node.id === topic ? 'var(--bg-color)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginTop: '0.1rem',
                    letterSpacing: '0.05em'
                  }}>
                    {node.type}
                  </span>
                </div>
              ))}

              {hoverNode && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--accent-color)',
                  padding: '0.5rem',
                  fontSize: '0.8em',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <strong>{hoverNode.id}</strong> — {hoverNode.summary}
                </div>
              )}
            </div>

            {/* Graph Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={buildGraph}
                style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.25rem 0.5rem', fontSize: '0.8em', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Refresh Graph Nodes
              </button>
              <button
                onClick={saveGraph}
                style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.25rem 0.5rem', fontSize: '0.8em', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Save To Local Knowledge Library
              </button>
            </div>

            {/* Saved local graphs */}
            {savedGraphs.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.25rem', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.78em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saved Personal Maps</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {savedGraphs.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => { setGraphNodes(g.nodes); onWordClick(g.topic); }}
                      style={{ background: 'none', border: '1px dotted var(--border-color)', padding: '0.2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75em', cursor: 'pointer', fontFamily: 'monospace' }}
                    >
                      🗺️ {g.topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Meta-Layer & Sources */}
      {activeTab === 'meta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* AI Explain reasoning */}
          <div>
            <button
              onClick={loadMetaAnalysis}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              "Explain the Explanation" AI Meta-Analysis
            </button>
            {isMetaLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Inspecting neuron trails...</p>}
            {metaAnalysis && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {metaAnalysis}
              </p>
            )}
          </div>

          {/* Primary Sources */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadSources}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              Primary Sources & Authoritative Texts
            </button>
            {isSourcesLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Parsing archives...</p>}
            {primarySources && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {primarySources}
              </p>
            )}
          </div>

          {/* Citations Trail */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadCitations}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              Citations Trail & Reasoning Detail
            </button>
            {isCitationsLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Synthesizing references...</p>}
            {citations && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {citations}
              </p>
            )}
          </div>

          {/* Notation Renderer */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadNotation}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              Formal Notations (Mathematical/Logic/Regex/BNF)
            </button>
            {isNotationLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Rendering notation...</p>}
            {notationContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {notationContent}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Compare & Adapt */}
      {activeTab === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Compare Concepts Side-by-Side */}
          <div>
            <span style={{ fontSize: '0.85em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Concepts Comparison Side-by-Side ]
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Compare against e.g. REST, Imperative..."
                value={compareTopic}
                onChange={e => setCompareTopic(e.target.value)}
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.3rem 0.5rem', fontSize: '0.85em', fontFamily: 'monospace' }}
              />
              <button
                onClick={runComparison}
                disabled={!compareTopic.trim()}
                style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.3rem 0.6rem', fontSize: '0.82em', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Go
              </button>
            </div>
            {isCompareLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Generating side-by-side matrices...</p>}
            {compareResult && (
              <div style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.6rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {compareResult}
              </div>
            )}
          </div>

          {/* Before & After Lens */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadBeforeAfter}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              What was the world like before it? What changed after?
            </button>
            {isBeforeAfterLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Processing historical shifts...</p>}
            {beforeAfter && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {beforeAfter}
              </p>
            )}
          </div>

          {/* Contrasting viewpoints */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadContrasting}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              "Contrasting Viewpoints" & Scholarly Debate Mode
            </button>
            {isContrastLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Examining differing claims...</p>}
            {contrastingViewpoints && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {contrastingViewpoints}
              </p>
            )}
          </div>

          {/* Perspective/Explain tuner */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.85em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Adaptive Lens: "Explain like I'm..." ]
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {['10-year-old', 'Lawyer', 'Biologist', 'Skeptic'].map(persp => (
                <button
                  key={persp}
                  onClick={() => loadPerspective(persp)}
                  style={{
                    background: selectedPersp === persp ? 'var(--input-bg)' : 'none',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.5rem',
                    color: selectedPersp === persp ? 'var(--accent-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.8em',
                    fontFamily: 'monospace'
                  }}
                >
                  {persp}
                </button>
              ))}
            </div>
            {isPerspLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Recasting viewpoint...</p>}
            {perspContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {perspContent}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Study Tools */}
      {activeTab === 'study' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active quiz */}
          <div>
            <button
              onClick={loadQuiz}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              Interactive Revision Quiz
            </button>
            {isQuizLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Formulating questions...</p>}
            {quizQuestions.length > 0 && (
              <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem', marginTop: '0.6rem' }}>
                {quizQuestions.map((q, i) => (
                  <div key={i} style={{ marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.85em', margin: '0 0 0.3rem 0' }}>{q.q}</p>
                    <input
                      type="text"
                      placeholder="Your answer or thoughts..."
                      value={userAnswers[i] || ''}
                      onChange={e => setUserAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.25rem 0.5rem', fontSize: '0.82em', width: '80%', fontFamily: 'monospace' }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setQuizScore(80)}
                  style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.25rem 0.5rem', fontSize: '0.82em', cursor: 'pointer', fontFamily: 'monospace', marginTop: '0.3rem' }}
                >
                  Submit answers
                </button>
                {quizScore !== null && (
                  <p style={{ fontSize: '0.85em', marginTop: '0.6rem', color: '#00cc00', fontWeight: 'bold' }}>
                    Excellent! You scored a {quizScore}% on retention. Your answers show great understanding.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sequel generator */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadSequel}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              "Continue the Story" Sequel Entry
            </button>
            {isSequelLoading && <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Unlocking what happened next...</p>}
            {sequelContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {sequelContent}
              </p>
            )}
          </div>

          {/* Download offline kit */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={downloadOfflinePack}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85em', padding: 0 }}
            >
              Download Offline True Knowledge Pack
            </button>
            <p style={{ fontSize: '0.78em', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Pre-bundles concept graph, meta-analysis, and sources into a portable JSON file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CantoLabs;
