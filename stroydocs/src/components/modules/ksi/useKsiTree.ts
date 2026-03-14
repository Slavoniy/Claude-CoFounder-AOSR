'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface KsiNode {
  id: string;
  code: string;
  name: string;
  _count?: { children: number };
  parent?: { code: string; name: string } | null;
}

/** Загрузка узлов КСИ */
async function fetchKsiNodes(parentId?: string | null): Promise<KsiNode[]> {
  const url = parentId ? `/api/ksi?parentId=${parentId}` : '/api/ksi';
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

async function searchKsiNodes(search: string): Promise<KsiNode[]> {
  const res = await fetch(`/api/ksi?search=${encodeURIComponent(search)}`);
  const json = await res.json();
  return json.success ? json.data : [];
}

export function useKsiTree(search: string) {
  const [expandedNodes, setExpandedNodes] = useState<Map<string, KsiNode[]>>(new Map());

  // Корневые узлы
  const { data: nodes = [], isLoading: rootLoading } = useQuery<KsiNode[]>({
    queryKey: ['ksi', 'root'],
    queryFn: () => fetchKsiNodes(null),
  });

  // Результаты поиска
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<KsiNode[]>({
    queryKey: ['ksi', 'search', search],
    queryFn: () => searchKsiNodes(search),
    enabled: search.length >= 2,
  });

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Map(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      }
      return next;
    });
  }, []);

  const loadChildren = useCallback(async (nodeId: string) => {
    // Если уже загружены — не загружаем повторно
    if (expandedNodes.has(nodeId)) return;

    const children = await fetchKsiNodes(nodeId);
    setExpandedNodes((prev) => {
      const next = new Map(prev);
      next.set(nodeId, children);
      return next;
    });
  }, [expandedNodes]);

  return {
    nodes,
    searchResults,
    isLoading: search.length >= 2 ? searchLoading : rootLoading,
    expandedNodes,
    toggleExpand,
    loadChildren,
  };
}
