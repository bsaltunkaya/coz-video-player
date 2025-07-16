'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { api } from '../lib/api';
import { TreeNode } from '../lib/types';
import { useVideo } from '../context/VideoContext';
import { useToast } from '../context/ToastContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

async function buildRootNodes(): Promise<TreeNode[]> {
  const classes = await api.getClasses();
  return classes.map((cls: any) => ({
    id: cls.id,
    label: cls.value,
    level: 0,
    raw: cls,
    getChildren: async () => {
      const branches = await api.getBranches(cls.id);
      return branches.map((br: any) => ({
        id: br.id,
        label: br.value,
        level: 1,
        raw: br,
        getChildren: async () => {
          const products = await api.getProducts(cls.id, br.id);
          return products.map((p: any) => ({
            id: p.id,
            label: p.name,
            level: 2,
            raw: p,
            getChildren: async () => {
              const seasons = await api.getSeasons(p.id);
              return seasons.map((s: any) => ({
                id: s.id,
                label: s.title,
                level: 3,
                raw: s,
                getChildren: async () => {
                  const episodes = await api.getEpisodes(p.id, s.id);
                  return episodes.map((e: any) => ({
                    id: e.id,
                    label: e.title,
                    level: 4,
                    raw: e,
                    getChildren: async () => {
                      const tests = await api.getTests(p.id, e.id);
                      return tests.map((t: any) => ({
                        id: t.id,
                        label: t.title,
                        level: 5,
                        raw: t,
                        getChildren: async () => {
                          const teachers = await api.getTeachers(p.id, t.id);
                          if (teachers.length === 0) {
                            // No teachers; return test itself as leaf
                            return [
                              {
                                id: t.id * 10,
                                label: 'Video',
                                level: 6,
                                raw: t,
                                videoIds: t.videoContents?.map((v: any) => v.sourceUrl) ?? [],
                              },
                            ];
                          }
                          return teachers.map((teacher: any) => ({
                            id: teacher.id,
                            label: teacher.title ?? teacher.solverLabel ?? 'Teacher',
                            level: 6,
                            raw: teacher,
                            videoIds: teacher.videoContents?.map((v: any) => v.sourceUrl) ?? [],
                          }));
                        },
                      }));
                    },
                  }));
                },
              }));
            },
          }));
        },
      }));
    },
  }));
}

export default function TreeView() {
  const { data: rootNodes, isLoading, error } = useQuery({
    queryKey: ['tree-root'],
    queryFn: buildRootNodes,
  });

  const [path, setPath] = useState<TreeNode[]>([]); // breadcrumb of selected nodes
  const [nodes, setNodes] = useState<TreeNode[] | null>(null);
  const { setVideoIds } = useVideo();
  const toast = useToast();

  // initialize nodes when root loaded
  React.useEffect(() => {
    if (rootNodes && !nodes) setNodes(rootNodes);
  }, [rootNodes]);

  const navigateBack = () => {
    if (path.length === 0) return;
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    if (newPath.length === 0) setNodes(rootNodes!);
    else {
      const parent = newPath[newPath.length - 1];
      parent.getChildren?.().then((ch) => setNodes(ch));
    }
  };

  const handleSelect = async (node: TreeNode) => {
    if (node.videoIds && node.videoIds.length > 0) {
      setVideoIds(node.videoIds);
      return;
    }
    if (node.videoIds && node.videoIds.length === 0) {
      toast('Video bulunamadı');
    }
    if (node.getChildren) {
      const ch = await node.getChildren();
      if (ch.length === 0) {
        const rawAny: any = (node as any).raw;
        if (rawAny && Array.isArray(rawAny.videoContents) && rawAny.videoContents.length > 0) {
          const vids = rawAny.videoContents.map((v: any) => v.sourceUrl).filter(Boolean);
          if (vids.length > 0) {
            setVideoIds(vids);
            return;
          }
        }
        toast('Video bulunamadı\n' + JSON.stringify(node.raw ?? node, null, 2).slice(0, 400));
        return;
      }
      setPath([...path, node]);
      setNodes(ch);
    }
  };

  if (isLoading || !nodes) return <span className="loading loading-spinner" />;
  if (error) return <span className="text-error">Error loading tree</span>;

  return (
    <div className="h-full flex flex-col bg-black text-red-200 rounded-xl shadow-lg p-3">
      {/* Header */}
      <div className="flex items-center mb-3">
        {path.length > 0 && (
          <button
            onClick={navigateBack}
            className="btn btn-sm btn-circle mr-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <h2 className="font-semibold text-sm uppercase tracking-wide text-red-400">
          {path.length === 0 ? 'Sınıflar' : path[path.length - 1].label}
        </h2>
      </div>

      {/* List */}
      <ul className="menu menu-sm rounded-box flex-1 overflow-y-auto bg-transparent">
        {nodes.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => handleSelect(n)}
              className="flex justify-between items-center py-2 px-2 rounded cursor-pointer hover:bg-red-700 hover:text-white transition-colors"
            >
              <span className="truncate max-w-[160px]">{n.label}</span>
              {n.getChildren && <ChevronRight size={16} className="opacity-70" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 