'use client';

import React, { createContext, useContext, useState, PropsWithChildren } from 'react';

interface ToastMsg {
  id: number;
  text: string;
}

interface ToastContextValue {
  push: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const push = (text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-[9999]">
        {toasts.map((t) => (
          <div key={t.id} className="alert alert-info text-xs whitespace-pre-wrap max-w-xs break-all">
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx.push;
} 