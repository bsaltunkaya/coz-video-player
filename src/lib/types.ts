export interface ClassLookup { id: number; value: string; }
export interface BranchLookup { id: number; value: string; }
export interface Product { id: number; name: string; }
export interface Season { id: number; title: string; }
export interface Episode { id: number; title: string; }
export interface Test { id: number; title: string; }
export interface Teacher { id: number; title: string; videoContents: VideoContent[]; }
export interface VideoContent { id: number; title: string; sourceUrl: string; }

export interface TreeNode {
  id: number;
  label: string;
  level: number;
  getChildren?: () => Promise<TreeNode[]>;
  videoIds?: string[];
  raw?: any;
} 