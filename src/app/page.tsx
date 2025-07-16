"use client";

import VideoPlayer from "../components/VideoPlayer";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-5xl">
        <VideoPlayer videoId="M7lc1UVf-VE" />
      </div>
    </main>
  );
}
