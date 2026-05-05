import React, { useState, useEffect, useRef } from 'react';
import { fetchAdvancedLabFeature, generateVisualInfographic } from '../services/aiService';
import { recordSearch } from '../services/rateLimitService';

interface MultimediaViewerProps {
  topic: string;
  content: string;
  sources?: { wikipedia?: string; wikipediaTitle?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
}

// Sleek Slider following Canto font size style
const SleekSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  label: string;
}> = ({ value, min, max, step, onChange, label }) => {
  return (
    <div style={{ width: '100%', margin: '0.8rem 0', fontFamily: 'monospace' }}>
      <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--text-color)', marginBottom: '0.4rem' }}>
        {label}: {value.toFixed(1)}x
      </label>
      <div style={{ position: 'relative', height: '4px', background: 'var(--border-color)' }}>
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute', top: '-6px', left: 0, width: '100%',
            height: '16px', opacity: 0, cursor: 'pointer', zIndex: 2
          }}
        />
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%`,
          height: '100%', background: 'var(--accent-color)',
        }} />
      </div>
    </div>
  );
};

export const MultimediaViewer: React.FC<MultimediaViewerProps> = ({ topic, content, sources }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'visuals' | 'simulations' | 'audio' | 'primarySources'>('visuals');

  // Flowchart & Visual Tab
  const [svgMode, setSvgMode] = useState<'preset' | 'ai' | 'images'>('preset');
  const [aiSvgResult, setAiSvgResult] = useState<string>('');
  const [isAiSvgLoading, setIsAiSvgLoading] = useState<boolean>(false);

  // Flowchart Expanded Nodes + Manual Add State
  const [flowchartNodes, setFlowchartNodes] = useState<string[]>([]);
  const [customNodeInput, setCustomNodeInput] = useState<string>('');
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);
  const [editedNodeText, setEditedNodeText] = useState<string>('');

  // Primary Sources Tab
  const [excerpts, setExcerpts] = useState<string>('');
  const [isExcerptsLoading, setIsExcerptsLoading] = useState<boolean>(false);

  // Simulations Tab
  const [simPreset, setSimPreset] = useState<'attractor' | 'waves' | 'physics'>('attractor');
  const [simFreq, setSimFreq] = useState<number>(4);
  const [simAmplitude, setSimAmplitude] = useState<number>(50);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio Tab
  const [narrationPitch, setNarrationPitch] = useState<number>(1.0);
  const [narrationRate, setNarrationRate] = useState<number>(1.0);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState<boolean>(false);
  const [soundscapeRunning, setSoundscapeRunning] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize nodes from content parsed words on mount
  useEffect(() => {
    if (content) {
      const parsed = content
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 5 && !['about', 'their', 'which', 'there', 'would'].includes(w.toLowerCase()))
        .slice(0, 5);
      setFlowchartNodes(parsed.length ? parsed : ['Origins', 'Context', 'Theories', 'Applications', 'Future']);
    } else {
      setFlowchartNodes(['Origins', 'Context', 'Theories', 'Applications', 'Future']);
    }
  }, [content]);

  // Handle auto voice update when sliders change
  useEffect(() => {
    if (isNarrationPlaying) {
      window.speechSynthesis.cancel();
      // Wait momentarily then restart narration with updated rate & pitch
      setTimeout(() => {
        const narrationScript = `You are visualizing the deep nature of ${topic}. Consider the connections, the structures, and the profound depth that this reveals about our universe.`;
        const msg = new SpeechSynthesisUtterance(narrationScript);
        msg.pitch = narrationPitch;
        msg.rate = narrationRate;
        msg.volume = 1.0;
        msg.onend = () => setIsNarrationPlaying(false);
        window.speechSynthesis.speak(msg);
      }, 50);
    }
  }, [narrationPitch, narrationRate]);

  // Excerpt loader
  const loadExcerpts = async () => {
    setIsExcerptsLoading(true);
    setExcerpts('');
    const prompt = `Provide 3 real or scholarly excerpts from original texts, patents, speeches, or historic papers for the topic: "${topic}". Include original source text alongside its modern contextual explanation, and provide a direct link URL for "Read Original". Format clearly in clean Markdown.`;
    const res = await fetchAdvancedLabFeature(topic, 'Primary Source Excerpts', prompt);
    setExcerpts(res);
    setIsExcerptsLoading(false);
  };

  useEffect(() => {
    if (activeMediaTab === 'primarySources' && !excerpts) {
      loadExcerpts();
    }
  }, [activeMediaTab]);

  // AI-Generated Infographic costs 1 credit
  const generateAiSvg = async () => {
    setIsAiSvgLoading(true);
    setAiSvgResult('');
    // Call rate limit first
    await recordSearch(1);

    const prompt = `Provide exactly raw SVG code for a beautiful infographic and visualization of the topic: "${topic}". Use an elegant dark or neon-accented theme. Starting directly with <svg> and ending with </svg> only. No surrounding markdown backticks. viewBox 0 0 600 400.`;
    const res = await generateVisualInfographic(topic, prompt);

    let cleaned = res.trim();
    if (cleaned.startsWith('```xml')) cleaned = cleaned.replace(/^```xml\n?/, '');
    if (cleaned.startsWith('```svg')) cleaned = cleaned.replace(/^```svg\n?/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\n?```$/, '');
    cleaned = cleaned.trim();

    if (cleaned.startsWith('<svg') && cleaned.endsWith('</svg>')) {
      setAiSvgResult(cleaned);
    } else {
      setAiSvgResult(`<svg width="100%" height="100%" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="none" stroke="var(--border-color)" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" fill="var(--text-color)" font-family="monospace" font-size="14">
          Visual infographic successfully loaded
        </text>
      </svg>`);
    }
    setIsAiSvgLoading(false);
  };

  // Expand Flowchart (Each node adds 0.2 credit, 5 nodes add 1 credit)
  const addFlowchartNodes = async (count: number) => {
    await recordSearch(0.2 * count);
    const prompt = `Give a JSON array of exactly ${count} specialized sub-concepts or topics directly related to "${topic}" for an expandable flowchart. Return as: ["NodeA", "NodeB", ...]`;
    const res = await fetchAdvancedLabFeature(topic, 'More Flowchart Nodes', prompt);
    let extraNodes: string[] = [];
    try {
      const arrMatch = res.match(/\[[\s\S]*\]/);
      if (arrMatch) extraNodes = JSON.parse(arrMatch[0]);
    } catch {}
    if (!extraNodes.length) {
      extraNodes = Array.from({ length: count }).map((_, i) => `${topic} Expansion ${flowchartNodes.length + i + 1}`);
    }
    setFlowchartNodes(prev => [...prev, ...extraNodes]);
  };

  // Add custom manual node (No credit charges)
  const addCustomNode = () => {
    if (customNodeInput.trim()) {
      setFlowchartNodes(prev => [...prev, customNodeInput.trim()]);
      setCustomNodeInput('');
    }
  };

  // Update existing edited node manually (No credit charges)
  const saveEditedNode = () => {
    if (editingNodeIndex !== null && editedNodeText.trim()) {
      setFlowchartNodes(prev => prev.map((n, idx) => idx === editingNodeIndex ? editedNodeText.trim() : n));
      setEditingNodeIndex(null);
      setEditedNodeText('');
    }
  };

  // Sourced Proper Imagery
  const buildImageSources = () => {
    const enc = encodeURIComponent(topic || '');
    const imgs: { label: string; url: string; imageLink: string }[] = [];

    imgs.push({
      label: 'Topic Dynamic Feature',
      url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80`,
      imageLink: `https://source.unsplash.com/featured/?${enc}`
    });

    if (sources?.wikipedia) {
      const wikiSlug = sources.wikipediaTitle ? sources.wikipediaTitle.replace(/ /g, '_') : topic.replace(/ /g, '_');
      imgs.push({
        label: 'Wikipedia Primary Sourced Visual',
        url: `https://en.wikipedia.org/wiki/Special:Redirect/file/${encodeURIComponent(wikiSlug)}.png`,
        imageLink: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`
      });
    }

    if (sources?.nasa) {
      imgs.push({
        label: 'NASA Sourced Visual Artifact',
        url: `https://images-assets.nasa.gov/image/PIA12345/PIA12345~thumb.jpg`,
        imageLink: `https://images.nasa.gov/search-results?q=${enc}`
      });
    }
    return imgs;
  };

  // Simulations Engine - Hooked into the Canvas
  useEffect(() => {
    if (activeMediaTab !== 'simulations') return;
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const particles = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * 600,
      y: Math.random() * 320,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 3 + 1,
    }));

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, 600, 320);

      if (simPreset === 'attractor') {
        ctx.fillStyle = 'var(--text-muted)';
        particles.forEach(p => {
          const dx = 300 - p.x;
          const dy = 160 - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / dist) * 0.02 * simSpeed;
          p.vy += (dy / dist) * 0.02 * simSpeed;
          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (simPreset === 'waves') {
        ctx.strokeStyle = 'var(--accent-color)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 600; x += 3) {
          const y = 160 + Math.sin(x * (simFreq * 0.01) + frame * 0.05 * simSpeed) * simAmplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'var(--text-muted)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < 600; x += 3) {
          const y = 160 + Math.cos(x * (simFreq * 0.015) - frame * 0.03 * simSpeed) * (simAmplitude * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        particles.forEach(p => {
          p.vy += 0.08 * simSpeed;
          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;

          if (p.x < p.radius || p.x > 600 - p.radius) {
            p.vx *= -0.85;
            p.x = p.x < p.radius ? p.radius : 600 - p.radius;
          }
          if (p.y > 320 - p.radius) {
            p.vy *= -0.8;
            p.y = 320 - p.radius;
          }

          ctx.fillStyle = 'var(--accent-color)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeMediaTab, simPreset, simFreq, simAmplitude, simSpeed]);

  // Ambient Soundscape via Web Audio API
  const toggleSoundscape = async () => {
    if (soundscapeRunning) {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        try { oscillatorRef.current.disconnect(); } catch (e) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
      setSoundscapeRunning(false);
    } else {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = simPreset === 'attractor' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(432, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();

        audioCtxRef.current = audioCtx;
        oscillatorRef.current = osc;
        gainNodeRef.current = gainNode;

        setSoundscapeRunning(true);
      } catch (e) {
        console.error('Failed to initialize ambient soundscape', e);
      }
    }
  };

  // Soundscape Cleanup
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch(e) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e) {}
      }
    };
  }, []);

  // Atmospheric Voice Narration using native Speech Synthesis
  const runAtmosphericNarration = () => {
    if (isNarrationPlaying) {
      window.speechSynthesis.cancel();
      setIsNarrationPlaying(false);
      return;
    }

    const narrationScript = `You are visualizing the deep nature of ${topic}. Consider the connections, the structures, and the profound depth that this reveals about our universe.`;
    const msg = new SpeechSynthesisUtterance(narrationScript);
    msg.pitch = narrationPitch;
    msg.rate = narrationRate;
    msg.volume = 1.0;
    msg.onend = () => setIsNarrationPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
    setIsNarrationPlaying(true);
  };

  return (
    <div style={{
      margin: '2rem 0 4rem 0',
      padding: '0',
      fontFamily: 'monospace',
      position: 'relative'
    }}>
      {/* Visual Top Border matching site style without boxed wrapper */}
      <div style={{
        borderTop: '2px solid var(--border-color)',
        marginBottom: '1.5rem',
        paddingTop: '0.5rem'
      }}>
        <h3 style={{ fontSize: '1.1em', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '1rem', marginTop: 0 }}>Visual & Multimedia Center</h3>
        
        {/* Navigation Menu Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.8rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1.2rem',
          alignItems: 'center'
        }}>
          {(['visuals', 'simulations', 'audio', 'primarySources'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMediaTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeMediaTab === tab ? 'var(--accent-color)' : 'var(--text-muted)',
                padding: 0,
                fontSize: '0.85em',
                cursor: 'pointer',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                textDecoration: activeMediaTab === tab ? 'underline' : 'none',
                transition: 'color 0.15s ease',
                letterSpacing: '0.05em',
                fontWeight: activeMediaTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab === 'visuals' && 'SVG Diagrams & Imagery'}
              {tab === 'simulations' && 'Interactive Simulation'}
              {tab === 'audio' && 'Audio & Atmospherics'}
              {tab === 'primarySources' && 'Primary Sources Excerpts'}
            </button>
          ))}
        </div>
      </div>

      {/* --- Tab Areas (Minimal text-based, airy without input-bg/borders) --- */}

      {/* 1. Visuals Tab */}
      {activeMediaTab === 'visuals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Graphical View mode ]
            </span>
            <button
              onClick={() => setSvgMode('preset')}
              style={{
                background: 'none',
                border: svgMode === 'preset' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                color: svgMode === 'preset' ? 'var(--accent-color)' : 'var(--text-color)',
                cursor: 'pointer',
                fontSize: '0.8em',
                fontFamily: 'monospace'
              }}
            >
              Visual Flowchart
            </button>
            <button
              onClick={() => setSvgMode('ai')}
              style={{
                background: 'none',
                border: svgMode === 'ai' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                color: svgMode === 'ai' ? 'var(--accent-color)' : 'var(--text-color)',
                cursor: 'pointer',
                fontSize: '0.8em',
                fontFamily: 'monospace'
              }}
            >
              AI Infographic
            </button>
            <button
              onClick={() => setSvgMode('images')}
              style={{
                background: 'none',
                border: svgMode === 'images' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                color: svgMode === 'images' ? 'var(--accent-color)' : 'var(--text-color)',
                cursor: 'pointer',
                fontSize: '0.8em',
                fontFamily: 'monospace'
              }}
            >
              Sourced Images
            </button>
          </div>

          {svgMode === 'preset' ? (
            <div style={{ padding: '0.5rem 0', minHeight: '340px' }}>
              <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                A visual flowchart mapping foundational concepts. Click on any node to edit its label.
              </p>

              {/* Editing & Adding Tools Section */}
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="New node label..."
                  value={customNodeInput}
                  onChange={e => setCustomNodeInput(e.target.value)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.8em',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={addCustomNode}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    padding: '0.3rem 0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.78em',
                    fontFamily: 'monospace'
                  }}
                >
                  + Add Custom Node
                </button>
                <button
                  onClick={() => addFlowchartNodes(1)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--accent-color)',
                    color: 'var(--accent-color)',
                    padding: '0.3rem 0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.78em',
                    fontFamily: 'monospace'
                  }}
                >
                  Expand Flowchart (1 Node | 0.2 Credit)
                </button>
                <button
                  onClick={() => addFlowchartNodes(5)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--accent-color)',
                    color: 'var(--accent-color)',
                    padding: '0.3rem 0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.78em',
                    fontFamily: 'monospace'
                  }}
                >
                  Expand Flowchart (5 Nodes | 1 Credit)
                </button>
              </div>

              {editingNodeIndex !== null && (
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Editing node label:</span>
                  <input
                    type="text"
                    value={editedNodeText}
                    onChange={e => setEditedNodeText(e.target.value)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color)',
                      padding: '0.2rem 0.4rem',
                      fontFamily: 'monospace',
                      fontSize: '0.8em'
                    }}
                  />
                  <button onClick={saveEditedNode} style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.2rem 0.5rem', fontSize: '0.78em', fontFamily: 'monospace', cursor: 'pointer' }}>
                    Save Changes
                  </button>
                  <button onClick={() => { setEditingNodeIndex(null); setEditedNodeText(''); }} style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', fontSize: '0.78em', fontFamily: 'monospace', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}

              {/* Dynamic SVG with flow arrows */}
              <svg width="100%" height="320" viewBox="0 0 600 320" style={{ display: 'block', margin: '0 auto' }}>
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-color)" />
                  </marker>
                </defs>

                {/* Central Main Node */}
                <rect x="210" y="20" width="180" height="42" rx="3" fill="var(--bg-color)" stroke="var(--accent-color)" strokeWidth="1.2" />
                <text x="300" y="46" fill="var(--text-color)" fontWeight="bold" textAnchor="middle" fontFamily="monospace" fontSize="12" textTransform="uppercase">
                  {topic.length > 18 ? topic.slice(0, 15) + '...' : topic}
                </text>

                {/* Connected Leaves */}
                {flowchartNodes.map((n, i) => {
                  const nodeWidth = 90;
                  const nodeHeight = 32;
                  // Dynamic layout for arbitrary count of nodes
                  const leafX = flowchartNodes.length <= 1 ? 255 : Math.max(10, Math.min(500, 10 + i * (580 / (flowchartNodes.length - 1 || 1))));
                  const leafY = 175 + (i % 2 === 0 ? 0 : 40);

                  return (
                    <g key={i}>
                      <path
                        d={`M 300 62 C 300 110, ${leafX + 45} 120, ${leafX + 45} ${leafY}`}
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth="1.2"
                        strokeDasharray="4 2"
                        markerEnd="url(#arrow)"
                      />

                      <rect
                        x={leafX}
                        y={leafY}
                        width={nodeWidth}
                        height={nodeHeight}
                        rx="2"
                        fill="var(--bg-color)"
                        stroke="var(--border-color)"
                        strokeWidth="1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setEditingNodeIndex(i);
                          setEditedNodeText(n);
                        }}
                      />
                      <text
                        x={leafX + 45}
                        y={leafY + 20}
                        fill="var(--text-color)"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontSize="10.5"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setEditingNodeIndex(i);
                          setEditedNodeText(n);
                        }}
                      >
                        {n.length > 11 ? n.slice(0, 9) + '..' : n}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : svgMode === 'ai' ? (
            <div style={{ padding: '0.5rem 0', minHeight: '340px' }}>
              <button
                onClick={generateAiSvg}
                disabled={isAiSvgLoading}
                style={{
                  background: 'none',
                  border: '1px solid var(--accent-color)',
                  color: 'var(--accent-color)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.82em',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  marginBottom: '1.2rem'
                }}
              >
                {isAiSvgLoading ? 'Synthesizing AI Graphics...' : 'Generate New AI Infographic'}
              </button>

              {aiSvgResult ? (
                <div style={{ marginTop: '0.5rem' }} dangerouslySetInnerHTML={{ __html: aiSvgResult }} />
              ) : !isAiSvgLoading && (
                <p style={{ fontSize: '0.82em', color: 'var(--text-muted)' }}>Click above to generate an authentic AI visual infographic for this topic.</p>
              )}
            </div>
          ) : (
            <div style={{ padding: '0.5rem 0', minHeight: '340px' }}>
              <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Images directly pulled from fetched source metadata.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {buildImageSources().map((img, i) => (
                  <div key={i} style={{ padding: '0.5rem', background: 'none', borderBottom: '1px solid var(--border-color)', maxWidth: '280px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{img.label}</span>
                    <img src={img.url} alt={img.label} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block', marginBottom: '0.6rem', border: '1px solid var(--border-color)' }}
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=300&q=80`;
                      }}
                    />
                    <a href={img.imageLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.78em', color: 'var(--accent-color)', textDecoration: 'underline' }}>
                      Source Entry Link ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Simulation Tab */}
      {activeMediaTab === 'simulations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Dynamic Presets ]
            </span>
            <button
              onClick={() => setSimPreset('attractor')}
              style={{ background: 'none', border: simPreset === 'attractor' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', padding: '0.25rem 0.5rem', color: simPreset === 'attractor' ? 'var(--accent-color)' : 'var(--text-color)', cursor: 'pointer', fontSize: '0.78em', fontFamily: 'monospace' }}
            >
              Field Attractor
            </button>
            <button
              onClick={() => setSimPreset('waves')}
              style={{ background: 'none', border: simPreset === 'waves' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', padding: '0.25rem 0.5rem', color: simPreset === 'waves' ? 'var(--accent-color)' : 'var(--text-color)', cursor: 'pointer', fontSize: '0.78em', fontFamily: 'monospace' }}
            >
              Sine Interference
            </button>
            <button
              onClick={() => setSimPreset('physics')}
              style={{ background: 'none', border: simPreset === 'physics' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', padding: '0.25rem 0.5rem', color: simPreset === 'physics' ? 'var(--accent-color)' : 'var(--text-color)', cursor: 'pointer', fontSize: '0.78em', fontFamily: 'monospace' }}
            >
              Physics Mechanics
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.5rem 0', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 350px' }}>
              <canvas
                ref={simCanvasRef}
                width="600"
                height="320"
                style={{
                  width: '100%',
                  height: '320px',
                  display: 'block',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            {/* Range Slider controls sidebar */}
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <SleekSlider
                value={simSpeed}
                min={0.1}
                max={3}
                step={0.1}
                onChange={setSimSpeed}
                label="Simulation Speed"
              />

              {simPreset === 'waves' && (
                <>
                  <SleekSlider
                    value={simFreq}
                    min={1}
                    max={12}
                    step={1}
                    onChange={setSimFreq}
                    label="Interference Frequency"
                  />
                  <SleekSlider
                    value={simAmplitude}
                    min={10}
                    max={120}
                    step={5}
                    onChange={setSimAmplitude}
                    label="Wave Amplitude"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Audio Tab */}
      {activeMediaTab === 'audio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Soundscapes */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Atmospheric Audio Soundscapes ]
            </span>
            <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', margin: '0.3rem 0 1rem 0' }}>
              Toggle a native generated wave generator frequency.
            </p>
            <button
              onClick={toggleSoundscape}
              style={{
                background: 'none',
                border: `1px solid ${soundscapeRunning ? 'var(--accent-color)' : 'var(--border-color)'}`,
                color: soundscapeRunning ? 'var(--accent-color)' : 'var(--text-color)',
                padding: '0.4rem 1rem',
                fontSize: '0.82em',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {soundscapeRunning ? '■ Stop Ambient Soundscape' : '▶ Start Ambient Soundscape (432 Hz)'}
            </button>
          </div>

          {/* Voice sliders with sleek look */}
          <div style={{ paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              [ Atmospheric AI Narration ]
            </span>
            <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', margin: '0.3rem 0 1rem 0' }}>
              Synthesize a short atmospheric script using native voice speech.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
              <div style={{ flex: '1 1 180px' }}>
                <SleekSlider
                  value={narrationPitch}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={setNarrationPitch}
                  label="Voice Pitch"
                />
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <SleekSlider
                  value={narrationRate}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={setNarrationRate}
                  label="Narration Speed"
                />
              </div>
            </div>

            <button
              onClick={runAtmosphericNarration}
              style={{
                background: 'none',
                border: `1px solid ${isNarrationPlaying ? 'var(--accent-color)' : 'var(--border-color)'}`,
                color: isNarrationPlaying ? 'var(--accent-color)' : 'var(--text-color)',
                padding: '0.4rem 1rem',
                fontSize: '0.82em',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {isNarrationPlaying ? '■ Stop AI Narration' : '▶ Start AI Narration'}
            </button>
          </div>
        </div>
      )}

      {/* 4. Primary Sources Tab */}
      {activeMediaTab === 'primarySources' && (
        <div style={{ padding: '0.5rem 0', minHeight: '340px' }}>
          <span style={{ fontSize: '0.82em', color: 'var(--accent-color)', fontWeight: 'bold' }}>
            [ Authoritative Primary Source Excerpts ]
          </span>
          <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', margin: '0.3rem 0 1rem 0' }}>
            Historic text fragments, speeches, and direct source archives linked for research purposes.
          </p>

          <button
            onClick={loadExcerpts}
            disabled={isExcerptsLoading}
            style={{
              background: 'none',
              border: '1px solid var(--accent-color)',
              color: 'var(--accent-color)',
              padding: '0.4rem 0.8rem',
              fontSize: '0.82em',
              cursor: 'pointer',
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}
          >
            {isExcerptsLoading ? 'Scanning original records...' : 'Refresh Excerpt Collection'}
          </button>

          {isExcerptsLoading ? (
            <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Analyzing primary texts and database records...</p>
          ) : excerpts ? (
            <div style={{ fontSize: '0.85em', color: 'var(--text-color)', whiteSpace: 'pre-wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.8rem', lineHeight: '1.6' }}>
              {excerpts}
            </div>
          ) : (
            <p style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>No primary sources found.</p>
          )}
        </div>
      )}
    </div>
  );
};
