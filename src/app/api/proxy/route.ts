'use server';

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('url');
  const target = raw ? decodeURIComponent(raw) : null;

  if (!target) {
    return new Response('Missing url', { status: 400 });
  }

  try {
    const resp = await fetch(target);
    const body = await resp.arrayBuffer();
    return new Response(body, {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err) {
    return new Response('Upstream fetch error', { status: 500 });
  }
} 