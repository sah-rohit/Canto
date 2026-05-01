import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success': return 'var(--accent-color)';
      case 'warning': return '#ffcc00';
      case 'error': return '#ff4444';
      default: return 'var(--accent-color)';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✖';
      default: return '✦';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const color = getColors(toast.type);
          return (
            <div key={toast.id} style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              padding: '0.6rem 1.2rem',
              borderRadius: '2px',
              fontFamily: 'monospace',
              fontSize: '0.85em',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'canto-toast-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <style>
                {`
                  @keyframes canto-toast-in {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                  }
                `}
              </style>
              <span style={{ color }}>{getIcon(toast.type)}</span>
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
