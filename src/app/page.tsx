"use client";

import VideoPlayer from "../components/VideoPlayer";
import TreeView from "../components/TreeView";
import { VideoProvider } from "../context/VideoContext";

export default function Home() {
  return (
    <VideoProvider>
      <main className="flex min-h-screen bg-white p-4 gap-6">
        {/* Sidebar */}
        <aside className="w-64 border-r pr-4 overflow-y-auto">
          <TreeView />
        </aside>

        {/* Video area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <VideoPlayer videoId="M7lc1UVf-VE" />
          </div>
        </div>
      </main>
    </VideoProvider>
  );
}
