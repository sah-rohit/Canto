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
      case 'success': return { border: '#10b981', bg: 'var(--input-bg)' };
      case 'warning': return { border: '#f59e0b', bg: 'var(--input-bg)' };
      case 'error': return { border: '#ef4444', bg: 'var(--input-bg)' };
      default: return { border: 'var(--accent-color)', bg: 'var(--input-bg)' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const colors = getColors(toast.type);
          return (
            <div key={toast.id} style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: 'var(--text-color)',
              padding: '1rem 1.5rem',
              borderRadius: '2px',
              fontFamily: 'monospace',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: 'fadeInUp 0.3s ease-out forwards',
              pointerEvents: 'auto'
            }}>
              <style>
                {`
                  @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}
              </style>
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
