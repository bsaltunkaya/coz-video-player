'use client';

import React, { createContext, useContext, useState, PropsWithChildren } from 'react';

interface VideoContextValue {
  videoIds: string[];
  setVideoIds: (ids: string[]) => void;
}

const VideoContext = createContext<VideoContextValue | undefined>(undefined);

export function VideoProvider({ children }: PropsWithChildren) {
  const [videoIds, setVideoIds] = useState<string[]>([]);
  return (
    <VideoContext.Provider value={{ videoIds, setVideoIds }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error('useVideo must be within VideoProvider');
  return ctx;
} 