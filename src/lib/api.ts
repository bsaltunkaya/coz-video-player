// Replace mock implementation with real proxy fetches
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';
const COMMON = `BrandId=2&apk=${API_KEY}&resources=mobile`;

import { classesSample, branchesSample, productsSample, seasonsSample, episodesSample, testsSample, teachersSample } from './sampleData';

async function fetchProxy(url: string) {
  try {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      console.error('Proxy responded', res.status, url);
      throw new Error('proxy error');
    }
    const json = await res.json();
    return Array.isArray(json.result) ? json.result : json.result ?? json.data ?? [];
  } catch (err) {
    console.warn('Fetch failed, using mock data for', url);
    // rudimentary fallback by pattern
    if (url.includes('TypeKey=class')) return classesSample;
    if (url.includes('TypeKey=branch')) return branchesSample;
    if (url.includes('/Product?')) return productsSample;
    if (url.includes('ParentId=0')) return seasonsSample;
    if (url.includes('VideoSolution')) {
      // heuristic
      if (url.split('ParentId=').length > 1) {
        const pid = url.split('ParentId=')[1];
        if (pid.length > 6) return episodesSample;
      }
    }
    return [];
  }
}

export const api = {
  getClasses: async () => {
    const url = `${API_BASE}/ProductLookup?TypeKey=class&HasProduct=true&${COMMON}`;
    return fetchProxy(url);
  },
  getBranches: async (classId: number) => {
    const url = `${API_BASE}/ProductLookup?TypeKey=branch&HasProduct=true&RelatedId=${classId}&${COMMON}`;
    return fetchProxy(url);
  },
  getProducts: async (classId: number, branchId: number) => {
    const url = `${API_BASE}/Product?ProductLookupID=${classId}&ProductLookupID=${branchId}&ProductLookupID=127&brandId=2&GetImages=true&GetSamplePage=false&${COMMON}`;
    return fetchProxy(url);
  },
  getSeasons: async (productId: number) => {
    const url = `${API_BASE}/VideoSolution?ProductId=${productId}&ParentId=0&${COMMON}`;
    return fetchProxy(url);
  },
  getEpisodes: async (productId: number, seasonId: number) => {
    const url = `${API_BASE}/VideoSolution?ProductId=${productId}&ParentId=${seasonId}&${COMMON}`;
    return fetchProxy(url);
  },
  getTests: async (productId: number, episodeId: number) => {
    const url = `${API_BASE}/VideoSolution?ProductId=${productId}&ParentId=${episodeId}&${COMMON}`;
    return fetchProxy(url);
  },
  getTeachers: async (productId: number, testId: number) => {
    const url = `${API_BASE}/VideoSolution?ProductId=${productId}&ParentId=${testId}&${COMMON}`;
    return fetchProxy(url);
  },
}; 