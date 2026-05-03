import React, { useState, useEffect } from 'react';
import { fetchAdvancedLabFeature, gradeQuiz } from '../services/aiService';
import { CantoSlider } from './UIComponents';

interface CantoLabsProps {
  topic: string;
  content: string;
  onWordClick: (word: string) => void;
}

export const CantoLabs: React.FC<CantoLabsProps> = ({ topic, content, onWordClick }) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'graphs' | 'meta' | 'compare' | 'study'>('evolution');

  // --- Sub-states ---
  // Evolution & Time
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

  // Graphs
  const [graphNodes, setGraphNodes] = useState<{ id: string; type: string; summary: string }[]>([]);
  const [hoverNode, setHoverNode] = useState<{ id: string; summary: string } | null>(null);
  const [savedGraphs, setSavedGraphs] = useState<{ topic: string; nodes: any[] }[]>(() => {
    try {
      const raw = localStorage.getItem('canto_saved_graphs');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Meta & Transparency
  const [metaAnalysis, setMetaAnalysis] = useState<string>('');
  const [isMetaLoading, setIsMetaLoading] = useState<boolean>(false);

  const [primarySources, setPrimarySources] = useState<string>('');
  const [isSourcesLoading, setIsSourcesLoading] = useState<boolean>(false);

  const [citations, setCitations] = useState<string>('');
  const [isCitationsLoading, setIsCitationsLoading] = useState<boolean>(false);

  const [notationContent, setNotationContent] = useState<string>('');
  const [isNotationLoading, setIsNotationLoading] = useState<boolean>(false);

  const [ecdiContent, setEcdiContent] = useState<string>('');
  const [isEcdiLoading, setIsEcdiLoading] = useState<boolean>(false);

  const [etymologyContent, setEtymologyContent] = useState<string>('');
  const [isEtymologyLoading, setIsEtymologyLoading] = useState<boolean>(false);

  // Compare & Lens
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

  const [scaleContent, setScaleContent] = useState<string>('');
  const [isScaleLoading, setIsScaleLoading] = useState<boolean>(false);

  // Study Tools
  const [quizQuestions, setQuizQuestions] = useState<{ q: string; a: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [isGradingQuiz, setIsGradingQuiz] = useState<boolean>(false);
  const [quizScoreReport, setQuizScoreReport] = useState<string>('');

  const [sequelContent, setSequelContent] = useState<string>('');
  const [isSequelLoading, setIsSequelLoading] = useState<boolean>(false);

  // --- Actions & API Fetching ---

  const loadEraContent = async (era: string) => {
    setSelectedEra(era);
    setIsEraLoading(true);
    setEraContent('');
    const extra = `Analyze the topic "${topic}" and provide the evolution layer: Evolution in the ${era} Era. Format output in professional Markdown with descriptive subsections.`;
    const res = await fetchAdvancedLabFeature(topic, `Evolution in the ${era} Era`, extra);
    setEraContent(res);
    setIsEraLoading(false);
  };

  const loadYearContent = async (year: number) => {
    setAsOfYear(year);
    setIsYearLoading(true);
    setYearContent('');
    const extra = `Analyze the topic "${topic}" and provide the evolution layer: As of the Year ${year}. Format output in professional Markdown with descriptive subsections.`;
    const res = await fetchAdvancedLabFeature(topic, `As of the Year ${year}`, extra);
    setYearContent(res);
    setIsYearLoading(false);
  };

  const loadTimeline = async () => {
    setIsTimelineLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Chronological Timeline');
    setTimelineContent(res);
    setIsTimelineLoading(false);
  };

  const loadFuture = async () => {
    setIsFutureLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Future Projections');
    setFutureContent(res);
    setIsFutureLoading(false);
  };

  const buildGraph = async () => {
    const words = content.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(w => w.length > 5 && !['about', 'there', 'which', 'their'].includes(w.toLowerCase()));
    const entities = [...new Set(words)].slice(0, 12);
    const nodes = entities.map((name, index) => {
      const type = index % 4 === 0 ? 'theory' : index % 4 === 1 ? 'algorithm/influence' : index % 4 === 2 ? 'person/contributor' : 'prerequisite';
      return {
        id: name,
        type,
        summary: `A key ${type} related to ${topic}. Hover/Click to explore.`
      };
    });
    setGraphNodes([{ id: topic, type: 'core', summary: `The main concept: ${topic}` }, ...nodes]);
  };

  const saveGraph = () => {
    if (graphNodes.length === 0) return;
    const item = { topic, nodes: graphNodes };
    const next = [...savedGraphs.filter(g => g.topic !== topic), item];
    setSavedGraphs(next);
    localStorage.setItem('canto_saved_graphs', JSON.stringify(next));
  };

  const loadMetaAnalysis = async () => {
    setIsMetaLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Explain the Explanation - AI Meta-Analysis');
    setMetaAnalysis(res);
    setIsMetaLoading(false);
  };

  const loadSources = async () => {
    setIsSourcesLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Primary Sources');
    setPrimarySources(res);
    setIsSourcesLoading(false);
  };

  const loadCitations = async () => {
    setIsCitationsLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Citations Trail & Reasoning');
    setCitations(res);
    setIsCitationsLoading(false);
  };

  const loadNotation = async () => {
    setIsNotationLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Formal Notations (Mathematical/Logic/Regex/BNF)');
    setNotationContent(res);
    setIsNotationLoading(false);
  };

  const loadECDI = async () => {
    setIsEcdiLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Epistemic Certainty & Disagreement Index');
    setEcdiContent(res);
    setIsEcdiLoading(false);
  };

  const loadEtymology = async () => {
    setIsEtymologyLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Etymological & Linguistic Origins');
    setEtymologyContent(res);
    setIsEtymologyLoading(false);
  };

  const runComparison = async () => {
    if (!compareTopic.trim()) return;
    setIsCompareLoading(true);
    const res = await fetchAdvancedLabFeature(topic, `Comparison with ${compareTopic}`);
    setCompareResult(res);
    setIsCompareLoading(false);
  };

  const loadBeforeAfter = async () => {
    setIsBeforeAfterLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Before and After Lens');
    setBeforeAfter(res);
    setIsBeforeAfterLoading(false);
  };

  const loadContrasting = async () => {
    setIsContrastLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Contrasting Viewpoints & Scholarly Debate');
    setContrastingViewpoints(res);
    setIsContrastLoading(false);
  };

  const loadPerspective = async (persp: string) => {
    setSelectedPersp(persp);
    setIsPerspLoading(true);
    const res = await fetchAdvancedLabFeature(topic, `Perspective for a ${persp}`);
    setPerspContent(res);
    setIsPerspLoading(false);
  };

  const loadScale = async () => {
    setIsScaleLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Universal Scaling & Metric Comparison Lens');
    setScaleContent(res);
    setIsScaleLoading(false);
  };

  const loadQuiz = async () => {
    setIsQuizLoading(true);
    setUserAnswers({});
    setQuizScoreReport('');
    const extra = `Generate exactly 3 multiple-choice questions to test reader retention on this topic. Structure each clearly. Answer values should be unambiguous. Do NOT provide answers in the questions.`;
    const res = await fetchAdvancedLabFeature(topic, 'Knowledge Retention Quiz', extra);
    const lines = res.split('\n').filter(l => l.trim().length > 0);
    const qs: any[] = [];
    let currentQ = '';
    lines.forEach(l => {
      if (l.includes('?') || l.match(/^\d+\./)) {
        if (currentQ) qs.push({ q: currentQ, a: '' });
        currentQ = l;
      }
    });
    if (currentQ) qs.push({ q: currentQ, a: '' });
    setQuizQuestions(qs.slice(0, 3));
    setIsQuizLoading(false);
  };

  const evaluateQuiz = async () => {
    setIsGradingQuiz(true);
    setQuizScoreReport('');
    const questionsText = quizQuestions.map(q => q.q);
    const res = await gradeQuiz(topic, questionsText, userAnswers);
    setQuizScoreReport(res);
    setIsGradingQuiz(false);
  };

  const loadSequel = async () => {
    setIsSequelLoading(true);
    const res = await fetchAdvancedLabFeature(topic, 'Sequel Entry: What Happened Next');
    setSequelContent(res);
    setIsSequelLoading(false);
  };

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

  useEffect(() => {
    if (activeTab === 'graphs' && graphNodes.length === 0) {
      buildGraph();
    }
  }, [activeTab]);

  return (
    <div style={{
      margin: '2rem 0 4rem 0',
      padding: '0',
      fontFamily: 'monospace',
      position: 'relative'
    }}>
      {/* Visual top border matching site style */}
      <div style={{
        borderTop: '2px solid var(--border-color)',
        marginBottom: '1.5rem',
        paddingTop: '0.5rem'
      }}>
        <h3 style={{ fontSize: '1.1em', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '1rem', marginTop: 0 }}>Canto Labs</h3>
        
        {/* Header Menu Tabs as text links */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.8rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1.2rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {(['evolution', 'graphs', 'meta', 'compare', 'study'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-muted)',
                  padding: 0,
                  fontSize: '0.85em',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  textDecoration: activeTab === tab ? 'underline' : 'none',
                  transition: 'color 0.15s ease',
                  letterSpacing: '0.05em',
                  fontWeight: activeTab === tab ? 'bold' : 'normal'
                }}
              >
                {tab === 'evolution' && 'Evolution & Time'}
                {tab === 'graphs' && 'Mind Graph'}
                {tab === 'meta' && 'Transparency'}
                {tab === 'compare' && 'Comparison'}
                {tab === 'study' && 'Study Tools'}
            </button>
          ))}
          </div>

          {/* Epistemic Date Stamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75em', color: 'var(--text-muted)' }}>
            <span>
              Knowledge as of: {lastRefreshed}
            </span>
            <button
              onClick={() => setLastRefreshed(new Date().toLocaleDateString())}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '0.1rem 0.35rem',
                cursor: 'pointer',
                fontSize: '0.85em',
                fontFamily: 'monospace'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* --- Tab Panel Areas --- */}

      {/* Evolution & Time */}
      {activeTab === 'evolution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Temporal Evolution Views ]
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
              {['Pre-2000', '2000-2015', '2016-Present'].map(era => (
                <button
                  key={era}
                  onClick={() => loadEraContent(era)}
                  style={{
                    background: selectedEra === era ? 'var(--input-bg)' : 'none',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.5rem',
                    color: selectedEra === era ? 'var(--accent-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.78em',
                    fontFamily: 'monospace'
                  }}
                >
                  {era}
                </button>
              ))}
            </div>
            {isEraLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Scanning historical logs...</p>}
            {eraContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {eraContent}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Historical Layer: "As of Year" ]
            </span>
            <div style={{ marginTop: '0.4rem' }}>
              <CantoSlider
                min={1800}
                max={2026}
                value={asOfYear}
                onChange={val => loadYearContent(val)}
                label="Historical Baseline Year"
              />
            </div>
            {isYearLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Retrieving context in {asOfYear}...</p>}
            {yearContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {yearContent}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadTimeline}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-color)', fontSize: '0.82em', padding: 0 }}
            >
              Chronological Timeline View
            </button>
            {isTimelineLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Tracing sequence points...</p>}
            {timelineContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {timelineContent}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadFuture}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-color)', fontSize: '0.82em', padding: 0 }}
            >
              Future Projections & Speculative Layers
            </button>
            {isFutureLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Extrapolating current paths...</p>}
            {futureContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {futureContent}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mind Graph */}
      {activeTab === 'graphs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Topology & Lineages ]
            </span>
            <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', margin: '0.3rem 0 0.8rem 0' }}>
              Intellectual genealogies and core prerequisites related to the topic.
            </p>

            {/* Flat Monospace Nodes list */}
            <div style={{
              minHeight: '160px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              backgroundColor: 'var(--input-bg)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '0.8rem',
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
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.8em',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.15s'
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
                  bottom: '6px',
                  left: '6px',
                  right: '6px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--accent-color)',
                  padding: '0.4rem',
                  fontSize: '0.78em'
                }}>
                  <strong>{hoverNode.id}</strong> - {hoverNode.summary}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={buildGraph}
                style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.25rem 0.5rem', fontSize: '0.78em', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Refresh Topology
              </button>
              <button
                onClick={saveGraph}
                style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.25rem 0.5rem', fontSize: '0.78em', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Persist Map locally
              </button>
            </div>

            {savedGraphs.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.25rem', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Persisted Local Maps</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {savedGraphs.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => { setGraphNodes(g.nodes); onWordClick(g.topic); }}
                      style={{ background: 'none', border: '1px dotted var(--border-color)', padding: '0.2rem 0.45rem', color: 'var(--text-muted)', fontSize: '0.75em', cursor: 'pointer', fontFamily: 'monospace' }}
                    >
                      Map: {g.topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta & Transparency */}
      {activeTab === 'meta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <button
              onClick={loadMetaAnalysis}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Explain the Explanation - AI Decision Trace
            </button>
            {isMetaLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Retrieving metadata...</p>}
            {metaAnalysis && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {metaAnalysis}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadSources}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Primary Sources & Authoritative Excerpts
            </button>
            {isSourcesLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Inspecting academic indexes...</p>}
            {primarySources && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {primarySources}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadCitations}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Citation Trails & Reference Syntheses
            </button>
            {isCitationsLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Assembling references...</p>}
            {citations && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {citations}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadNotation}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Logical and Mathematical Notations
            </button>
            {isNotationLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Formulating symbols...</p>}
            {notationContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {notationContent}
              </p>
            )}
          </div>

          {/* New Feature 1: Epistemic Certainty Disagreement Index */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadECDI}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Epistemic Certainty / Disagreement Index (ECDI)
            </button>
            {isEcdiLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Evaluating consensus parameters...</p>}
            {ecdiContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {ecdiContent}
              </p>
            )}
          </div>

          {/* New Feature 2: Linguistic Origins */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadEtymology}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Etymological & Linguistic Origins
            </button>
            {isEtymologyLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Tracing linguistic evolution...</p>}
            {etymologyContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {etymologyContent}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Compare & Adapt */}
      {activeTab === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Cross-Topic Matrices ]
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Topic B..."
                value={compareTopic}
                onChange={e => setCompareTopic(e.target.value)}
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.25rem 0.45rem', fontSize: '0.8em', fontFamily: 'monospace' }}
              />
              <button
                onClick={runComparison}
                disabled={!compareTopic.trim()}
                style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.25rem 0.55rem', fontSize: '0.8em', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Compare
              </button>
            </div>
            {isCompareLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Generating table matrix...</p>}
            {compareResult && (
              <div style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.6rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {compareResult}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadBeforeAfter}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Before & After Lens
            </button>
            {isBeforeAfterLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Analyzing temporal shifts...</p>}
            {beforeAfter && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {beforeAfter}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadContrasting}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Contrasting Viewpoints & Scholarly Debate
            </button>
            {isContrastLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Evaluating claims...</p>}
            {contrastingViewpoints && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {contrastingViewpoints}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Custom Lens Framing ]
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              {['10-year-old', 'Lawyer', 'Biologist', 'Skeptic'].map(persp => (
                <button
                  key={persp}
                  onClick={() => loadPerspective(persp)}
                  style={{
                    background: selectedPersp === persp ? 'var(--input-bg)' : 'none',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.45rem',
                    color: selectedPersp === persp ? 'var(--accent-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.78em',
                    fontFamily: 'monospace'
                  }}
                >
                  {persp}
                </button>
              ))}
            </div>
            {isPerspLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Constructing lens...</p>}
            {perspContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {perspContent}
              </p>
            )}
          </div>

          {/* New Feature 3: Universal Scaling & Conversion Lens */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadScale}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Universal Scaling & Metric Comparison Lens
            </button>
            {isScaleLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Comparing proportional matrices...</p>}
            {scaleContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {scaleContent}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Study Tools */}
      {activeTab === 'study' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <button
              onClick={loadQuiz}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Interactive Retention Check
            </button>
            {isQuizLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Generating quiz...</p>}
            {quizQuestions.length > 0 && (
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem', marginTop: '0.5rem' }}>
                {quizQuestions.map((q, i) => (
                  <div key={i} style={{ marginBottom: '0.7rem' }}>
                    <p style={{ fontSize: '0.82em', margin: '0 0 0.25rem 0' }}>{q.q}</p>
                    <input
                      type="text"
                      placeholder="Input answer"
                      value={userAnswers[i] || ''}
                      onChange={e => setUserAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.2rem 0.45rem', fontSize: '0.8em', width: '85%', fontFamily: 'monospace' }}
                    />
                  </div>
                ))}
                <button
                  onClick={evaluateQuiz}
                  disabled={isGradingQuiz}
                  style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.25rem 0.55rem', fontSize: '0.8em', cursor: 'pointer', fontFamily: 'monospace', marginTop: '0.35rem' }}
                >
                  {isGradingQuiz ? 'Evaluating answers...' : 'Submit answers'}
                </button>
                {quizScoreReport && (
                  <div style={{ fontSize: '0.85em', marginTop: '0.6rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                    {quizScoreReport}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={loadSequel}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              What Happened Next? sequel entry
            </button>
            {isSequelLoading && <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Formulating contemporary context...</p>}
            {sequelContent && (
              <p style={{ fontSize: '0.85em', color: 'var(--text-color)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                {sequelContent}
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              onClick={downloadOfflinePack}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.82em', padding: 0 }}
            >
              Archive Offline True Knowledge Pack (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CantoLabs;
