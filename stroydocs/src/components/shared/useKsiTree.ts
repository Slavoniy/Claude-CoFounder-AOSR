'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface KsiNodeItem {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  level: number;
}

export interface KsiTreeItem extends KsiNodeItem {
  children: KsiTreeItem[];
}

/** Построение дерева из плоского массива */
function buildTree(nodes: KsiNodeItem[]): KsiTreeItem[] {
  const map = new Map<string, KsiTreeItem>();
  const roots: KsiTreeItem[] = [];

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of nodes) {
    const treeNode = map.get(node.id)!;
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }

  return roots;
}

export function useKsiTree() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const { data: nodes = [], isLoading } = useQuery<KsiNodeItem[]>({
    queryKey: ['ksi'],
    queryFn: async () => {
      const res = await fetch('/api/ksi');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 60 * 1000, // 30 минут — справочник редко меняется
  });

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  // Фильтрация дерева по поиску
  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const lower = search.toLowerCase();

    function filterNode(node: KsiTreeItem): KsiTreeItem | null {
      const matchesChildren = node.children
        .map(filterNode)
        .filter(Boolean) as KsiTreeItem[];

      if (
        node.name.toLowerCase().includes(lower) ||
        node.code.toLowerCase().includes(lower) ||
        matchesChildren.length > 0
      ) {
        return { ...node, children: matchesChildren };
      }
      return null;
    }

    return tree.map(filterNode).filter(Boolean) as KsiTreeItem[];
  }, [tree, search]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return {
    tree: filteredTree,
    isLoading,
    expandedIds,
    toggleExpand,
    search,
    setSearch,
    nodes,
  };
}
