/**
 * GuidedTour — First-time user onboarding.
 * Shown once (localStorage flag). Monospace tree style matching CantoCodex.
 * Back / Next / Skip controls.
 */
import React, { useState, useEffect } from "react";

const TOUR_KEY = "canto_tour_done";

interface TourStep {
  title: string;
  icon: string;
  body: string;
  hint?: string;
}

const STEPS: TourStep[] = [
  {
    icon: "◈",
    title: "Welcome to Canto",
    body: "Canto is an infinite AI encyclopedia. Type any topic — a concept, a word, a question — and get a comprehensive, fact-checked article generated in real time.",
    hint: "Powered by 7 AI providers and 5 knowledge sources.",
  },
  {
    icon: "⌕",
    title: "Search Any Topic",
    body: "Use the search bar at the top to explore any subject. Hit Enter or click the search button. Use the Random button to discover something unexpected.",
    hint: "You get 20 searches per day. Credits reset at midnight.",
  },
  {
    icon: "◈",
    title: "Article Settings",
    body: "Before searching, customise your article with Article Settings: choose a Lens (Academic, Historical, Controversial…), Search Depth (Mini / Standard / Deep), Tone, Length, and which Sources to use.",
    hint: "Deep search uses 2 credits but produces the richest results.",
  },
  {
    icon: "◈",
    title: "Research Panel",
    body: "After reading an article, open ▶◈ Research to explore AI-suggested follow-up paths, source citations, your full search history with semantic search, and 7-day analytics.",
    hint: "The Research panel lives at the bottom of every article.",
  },
  {
    icon: "◈",
    title: "Canto Labs",
    body: "Open ▶◈ Canto Labs for advanced analysis: Evolution & Time, Mind Topology Graphs, Transparency traces, Comparison matrices, and Study tools with retention checks.",
    hint: "Labs are the deepest layer of knowledge exploration.",
  },
  {
    icon: "◆",
    title: "Canto Codex",
    body: "▶◈ Canto Codex tracks your learning journey. Earn XP, unlock achievements, build reading streaks, and explore domains. Your rank grows as you read more.",
    hint: "All progress is stored locally — no account needed.",
  },
  {
    icon: "◈",
    title: "My Data Center",
    body: "▶◈ My Data Center manages your local data: snapshots, trash recovery, encrypted exports, external folder sync (Dropbox / Drive / USB), and P2P device sync — all offline-first.",
    hint: "Your data never leaves your device unless you choose to export it.",
  },
  {
    icon: "✦",
    title: "You are ready",
    body: "That is everything you need to know. Start exploring — type any topic in the search bar above and let Canto generate your first article.",
    hint: "You can revisit this tour from the About page.",
  },
];

interface GuidedTourProps {
  onDone: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const total = STEPS.length;
  const current = STEPS[step];
  const progress = Math.round(((step + 1) / total) * 100);
  const filled = Math.round((progress / 100) * 20);
  const bar = "█".repeat(filled) + "░".repeat(20 - filled);

  const finish = () => {
    setExiting(true);
    localStorage.setItem(TOUR_KEY, "1");
    setTimeout(onDone, 300);
  };

  const next = () => {
    if (step < total - 1) setStep(s => s + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "var(--bg-color)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div style={{
        maxWidth: "520px", width: "100%",
        fontFamily: "monospace",
        border: "1px solid var(--border-color)",
        padding: "2rem",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid var(--border-color)", paddingBottom: "0.6rem", marginBottom: "1.5rem",
        }}>
          <span style={{ fontSize: "0.7em", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            ◈ Guided Tour
          </span>
          <button
            onClick={finish}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: "0.7em",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--text-muted)", transition: "color 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-color)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            Skip Tour
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ fontSize: "0.7em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
          Step {step + 1} of {total}
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.8em", color: "var(--accent-color)", letterSpacing: 0 }}>
            [{bar}] {progress}%
          </span>
        </div>

        {/* Content */}
        <div style={{ borderLeft: "2px solid var(--accent-color)", paddingLeft: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.7em", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            {current.icon} {current.title}
          </div>
          <p style={{ margin: "0 0 0.8rem 0", fontSize: "0.9em", lineHeight: "1.7", color: "var(--text-color)" }}>
            {current.body}
          </p>
          {current.hint && (
            <p style={{ margin: 0, fontSize: "0.78em", color: "var(--text-muted)", lineHeight: "1.5" }}>
              ✦ {current.hint}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          {step > 0 && (
            <button
              onClick={back}
              style={{
                background: "none", border: "none",
                borderLeft: "2px solid transparent",
                paddingLeft: "0.5rem", paddingTop: "0.25rem", paddingBottom: "0.25rem",
                color: "var(--text-muted)", cursor: "pointer",
                fontFamily: "monospace", fontSize: "0.85em",
                transition: "border-color 0.12s, color 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderLeftColor = "var(--accent-color)"; e.currentTarget.style.color = "var(--accent-color)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={next}
            style={{
              background: "none", border: "none",
              borderLeft: "2px solid var(--accent-color)",
              paddingLeft: "0.5rem", paddingTop: "0.25rem", paddingBottom: "0.25rem",
              color: "var(--accent-color)", cursor: "pointer",
              fontFamily: "monospace", fontSize: "0.85em",
              transition: "border-color 0.12s, color 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-color)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--accent-color)"; }}
          >
            {step < total - 1 ? "Next →" : "Start Exploring →"}
          </button>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: "0.3rem" }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: i === step ? "var(--accent-color)" : "var(--text-muted)",
                  fontFamily: "monospace", fontSize: "0.7em", padding: "0.1rem",
                  transition: "color 0.12s",
                }}
              >
                {i === step ? "◆" : "◇"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export function shouldShowTour(): boolean {
  try {
    return !localStorage.getItem(TOUR_KEY);
  } catch {
    return false;
  }
}

export default GuidedTour;
