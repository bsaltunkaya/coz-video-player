'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

interface LookupItem {
  id: number;
  value: string;
}

// --- API helpers ---
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';
const COMMON_PARAMS = `BrandId=2&apk=${API_KEY}&resources=mobile`;

async function parseLookup(res: Response): Promise<LookupItem[]> {
  const data = await res.json();
  if (Array.isArray(data)) return data;
  // Some endpoints might wrap result in a property like Data / Result
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.Result)) return data.Result;
  return [];
}

async function fetchClasses(): Promise<LookupItem[]> {
  const url = `${API_BASE}/ProductLookup?TypeKey=class&HasProduct=true&${COMMON_PARAMS}`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch classes');
  return parseLookup(res);
}

async function fetchBranches(classId: number): Promise<LookupItem[]> {
  const url = `${API_BASE}/ProductLookup?TypeKey=branch&HasProduct=true&RelatedId=${classId}&${COMMON_PARAMS}`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch branches');
  return parseLookup(res);
}

// --- Components ---
export default function SidebarTree() {
  const { data: classes, isLoading, error } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  if (isLoading) return <div className="p-4">Loading classes...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load.</div>;

  return (
    <ul className="pl-2 text-sm space-y-1">
      {classes?.map((cls: LookupItem) => (
        <ClassNode key={cls.id} item={cls} />
      ))}
    </ul>
  );
}

function ClassNode({ item }: { item: LookupItem }) {
  const [expanded, setExpanded] = useState(false);
  const { data: branches, isFetching } = useQuery({
    queryKey: ['branches', item.id],
    queryFn: () => fetchBranches(item.id),
    enabled: expanded,
  });

  return (
    <li>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 hover:text-blue-600"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        {item.value}
      </button>
      {expanded && (
        <ul className="pl-4 mt-1 space-y-1">
          {isFetching && <li className="text-xs text-gray-500">Loading...</li>}
          {branches?.map((b: LookupItem) => (
            <BranchNode key={b.id} item={b} />
          ))}
        </ul>
      )}
    </li>
  );
}

function BranchNode({ item }: { item: LookupItem }) {
  const [expanded, setExpanded] = useState(false);
  // TODO: fetch products here
  return (
    <li>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 hover:text-blue-600"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        {item.value}
      </button>
      {expanded && (
        <ul className="pl-4 mt-1 space-y-1 text-gray-500 text-xs">
          <li>Products to be implemented…</li>
        </ul>
      )}
    </li>
  );
} 