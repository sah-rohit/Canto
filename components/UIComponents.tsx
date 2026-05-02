import React, { useState, useEffect } from 'react';

/**
 * Custom notification (Toast) system for Canto.
 */
export interface NotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

export const CantoNotification: React.FC<NotificationProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    info: 'var(--text-color)',
    success: 'var(--accent-color, #00ff88)',
    warning: '#ffcc00',
    error: '#ff4444'
  };

  return (
    <div className={`canto-notification ${visible ? 'visible' : ''}`} style={{
      position: 'fixed', bottom: '2rem', left: '50%',
      background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1.5rem', zIndex: 1000,
      fontFamily: 'monospace', fontSize: '0.9em',
      color: 'var(--text-color)', pointerEvents: 'none', transition: 'all 0.3s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
    }}>
      <span style={{ marginRight: '0.8rem', color: colors[type] }}>
        {type === 'success' && '[SUCCESS]'}
        {type === 'warning' && '[WARNING]'}
        {type === 'error' && '[ERROR]'}
        {type === 'info' && '[INFO]'}
      </span>
      {message}
    </div>
  );
};

/**
 * Custom Modal Alert / Confirmation Dialog
 */
export interface AlertProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: 'alert' | 'confirm';
}

export const CantoDialog: React.FC<AlertProps> = ({ title, message, confirmLabel = 'OK', cancelLabel = 'Cancel', onConfirm, onCancel, type = 'alert' }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-color)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(1px)'
    }}>
      <div className="fade-in" style={{
        background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)',
        padding: '2rem', maxWidth: '420px', width: '90%',
        textAlign: 'center', fontFamily: 'monospace'
      }}>
        <h3 style={{ 
          marginTop: 0, letterSpacing: '0.15em', textTransform: 'uppercase', 
          color: 'var(--text-color)', fontSize: '1.1em', borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.8rem', marginBottom: '1.2rem', fontFamily: 'monospace'
        }}>
          {title}
        </h3>
        <p style={{ margin: '1.2rem 0 1.8rem 0', lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.9em', fontFamily: 'monospace' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          {type === 'confirm' && (
            <button 
              onClick={onCancel}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--text-color)', textDecoration: 'underline', cursor: 'pointer',
                fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: '0.85em',
                textTransform: 'uppercase'
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button 
            onClick={onConfirm}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--accent-color)', textDecoration: 'underline', cursor: 'pointer',
              fontFamily: 'monospace', letterSpacing: '0.05em', 
              textTransform: 'uppercase', fontSize: '0.85em'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Slider (Range) Input
 */
export const CantoSlider: React.FC<{
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  label?: string;
}> = ({ value, min = 0, max = 100, onChange, label }) => {
  return (
    <div style={{ width: '100%', margin: '1rem 0' }}>
      {label && <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'monospace' }}>{label}: {value}</label>}
      <div style={{ position: 'relative', height: '4px', background: 'var(--border-color)' }}>
        <input 
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            position: 'absolute', top: '-6px', left: 0, width: '100%',
            height: '16px', opacity: 0, cursor: 'pointer', zIndex: 2
          }}
        />
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: `${((value - min) / (max - min)) * 100}%`,
          height: '100%', background: 'var(--accent-color)',
        }} />
      </div>
    </div>
  );
};
