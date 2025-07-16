'use client';

import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Users,
  NotebookPen,
  X,
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { YouTubeEvent as YTEvent } from 'react-youtube';

interface VideoPlayerProps {
  videoId?: string;
}

/**
 * A lightweight YouTube player that hides the default controls and provides our own minimal UI.
 * Note: We purposely keep the default YouTube overlay (thumbnail & big play button) visible, but
 * remove the regular controls (seek bar, volume, etc.) by setting playerVars.controls to 0.
 */
export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const { videoIds } = useVideo();
  const currentVideoId = videoIds[0] || videoId || 'M7lc1UVf-VE';

  const MIN_QUALITY = 'hd720';

  const enforceQuality = () => {
    const player = playerRef.current;
    if (!player) return;
    const current = player.getPlaybackQuality?.();
    if (current === 'highres' || current === 'hd1080' || current === 'hd720') return;
    const levels = player.getAvailableQualityLevels?.();
    if (levels.includes('hd720')) {
      player.setPlaybackQuality('hd720');
    } else if (levels.includes('hd1080')) {
      player.setPlaybackQuality('hd1080');
    }
  };

  // Format seconds -> mm:ss
  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    enforceQuality();
  };

  const handleStateChange = (event: YouTubeEvent) => {
    const { data } = event;
    /* 0: ended | 1: playing | 2: paused */
    if (data === 1) {
      setIsPlaying(true);
      // Start interval to update progress
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const time = playerRef.current?.getCurrentTime() ?? 0;
        setCurrentTime(time);
      }, 500);
    } else if (data === 2 || data === 0) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const seekRelative = (offset: number) => {
    const player = playerRef.current;
    if (!player) return;
    const time = player.getCurrentTime();
    const newTime = Math.min(Math.max(time + offset, 0), duration);
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerRef.current;
    if (!player) return;
    const value = Number(e.target.value);
    const newTime = (value / 100) * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSwitchClick = () => {
    triggerToast();
  };

  const handleNoteSave = () => {
    console.log('Saved note:', noteText);
    setShowNote(false);
  };

  const handleComplaint = () => {
    console.log('Complaint for note:', noteText);
    setShowNote(false);
  };

  const handleQualityChange = (event: YTEvent) => {
    enforceQuality();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* No nested components to avoid remounting */

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto select-none relative">
      {/* Video container keeps 16/9 aspect ratio using Tailwind's aspect-video utility */}
      <div className="relative w-full aspect-video">
        {/* Overlay buttons */}
        <div className="absolute right-4 bottom-[72px] flex gap-2 z-20">
          <button
            onClick={handleSwitchClick}
            className="p-2 bg-black/60 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => setShowNote(true)}
            className="p-2 bg-black/60 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <NotebookPen size={18} />
          </button>
        </div>

        {showToast && (
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded z-30 animate-fade-in-out">
            clicked
          </div>
        )}

        {showNote && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <div className="bg-white w-full max-w-md rounded shadow-lg p-4 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNote(false)}
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-semibold mb-2">Add a note</h2>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-4 h-28 resize-none"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note here..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleComplaint}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Report
                </button>
                <button
                  onClick={handleNoteSave}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        <YouTube
          videoId={currentVideoId}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full rounded"
          opts={{
            playerVars: {
              controls: 0, // Hide default controls
              rel: 0,
              modestbranding: 1,
              // Autohide deprecated; controls=0 already hides.
            },
          }}
          onReady={handleReady}
          onStateChange={handleStateChange}
          onPlaybackQualityChange={handleQualityChange}
        />

        {/* Custom controls */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col text-white text-sm">
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="relative z-10 w-full h-1 bg-gray-400/60 cursor-pointer [accent-color:#ffffff]"
          />

          {/* Bottom control row */}
          <div className="bg-black/60 relative flex items-center px-4 py-2">
            {/* Left: speed selector */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(Number(e.target.value))}
              className="bg-transparent outline-none cursor-pointer"
            >
              {[0.5, 1, 1.5, 2].map((rate) => (
                <option key={rate} value={rate} className="text-black">
                  {rate}x
                </option>
              ))}
            </select>

            {/* Center controls (absolute to keep perfectly centered) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-5">
              <button
                onClick={() => seekRelative(-10)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => seekRelative(10)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <RotateCw size={20} />
              </button>
            </div>

            {/* Right: time and fullscreen */}
            <div className="ml-auto flex items-center gap-4">
              <span className="font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 