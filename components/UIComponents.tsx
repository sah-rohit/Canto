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
    success: '#00ff88',
    warning: '#ffcc00',
    error: '#ff4444'
  };

  return (
    <div className={`canto-notification ${visible ? 'visible' : ''}`} style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg-color)', border: `1px solid ${colors[type]}`,
      padding: '0.75rem 1.5rem', borderRadius: '2px', zIndex: 1000,
      fontFamily: 'monospace', fontSize: '0.9em', boxShadow: `0 0 15px ${colors[type]}44`,
      color: colors[type], pointerEvents: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: visible ? 1 : 0, translateY: visible ? '0' : '20px'
    } as any}>
      <span style={{ marginRight: '0.8rem' }}>
        {type === 'success' && '✓'}
        {type === 'warning' && '⚠'}
        {type === 'error' && '✖'}
        {type === 'info' && '✦'}
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
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)'
    }}>
      <div className="fade-in" style={{
        background: 'var(--bg-color)', border: '2px solid var(--accent-color)',
        padding: '2.5rem', maxWidth: '420px', width: '90%', borderRadius: '4px',
        boxShadow: '0 0 30px rgba(var(--accent-color-rgb), 0.25), 0 0 100px rgba(0, 0, 0, 0.8)', 
        textAlign: 'center', fontFamily: 'monospace'
      }}>
        <h3 style={{ 
          marginTop: 0, letterSpacing: '0.2em', textTransform: 'uppercase', 
          color: 'var(--accent-color)', fontSize: '1.2em', borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.8rem', marginBottom: '1.5rem'
        }}>
          {title}
        </h3>
        <p style={{ margin: '1.5rem 0', lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '0.95em' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
          {type === 'confirm' && (
            <button onClick={onCancel} style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', padding: '0.6rem 1.8rem', cursor: 'pointer',
              fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '0.85em',
              textTransform: 'uppercase', transition: 'all 0.2s ease'
            }}>
              {cancelLabel}
            </button>
          )}
          <button onClick={onConfirm} style={{
            background: 'var(--accent-color)', border: '1px solid var(--accent-color)',
            color: 'var(--bg-color, #0b0f19)', padding: '0.6rem 2.2rem', cursor: 'pointer',
            fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.1em', 
            textTransform: 'uppercase', fontSize: '0.85em', transition: 'all 0.2s ease',
            boxShadow: '0 0 10px rgba(var(--accent-color-rgb), 0.3)'
          }}>
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
      <div style={{ position: 'relative', height: '4px', background: 'var(--border-color)', borderRadius: '2px' }}>
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
          height: '100%', background: 'var(--accent-color)', borderRadius: '2px',
          boxShadow: '0 0 8px var(--accent-color)'
        }} />
        <div style={{
          position: 'absolute', top: '-6px',
          left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`,
          width: '16px', height: '16px', background: 'var(--bg-color)',
          border: '2px solid var(--accent-color)', borderRadius: '50%',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }} />
      </div>
    </div>
  );
};
