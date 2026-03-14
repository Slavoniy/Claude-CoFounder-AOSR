'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Search, FolderTree } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useKsiTree } from './useKsiTree';

interface KsiNode {
  id: string;
  code: string;
  name: string;
  _count?: { children: number };
  parent?: { code: string; name: string } | null;
}

interface Props {
  value?: string;
  onSelect: (nodeId: string, node: KsiNode) => void;
}

export function KsiTreePicker({ value, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const { nodes, searchResults, isLoading, expandedNodes, toggleExpand, loadChildren } =
    useKsiTree(search);

  // Режим поиска
  if (search.length >= 2) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по КСИ (код или название)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-64 overflow-y-auto rounded-md border p-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : searchResults.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Ничего не найдено</p>
          ) : (
            searchResults.map((node) => (
              <button
                key={node.id}
                onClick={() => { onSelect(node.id, node); setSearch(''); }}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted ${
                  value === node.id ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground">{node.code}</span>
                <span>{node.name}</span>
                {node.parent && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    ← {node.parent.code}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Режим дерева
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по КСИ (код или название)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border p-1">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <KsiNodeList
            nodes={nodes}
            expandedNodes={expandedNodes}
            selectedId={value}
            onToggle={(nodeId) => { toggleExpand(nodeId); loadChildren(nodeId); }}
            onSelect={(nodeId, node) => onSelect(nodeId, node)}
          />
        )}
      </div>
    </div>
  );
}

function KsiNodeList({
  nodes,
  expandedNodes,
  selectedId,
  onToggle,
  onSelect,
  depth = 0,
}: {
  nodes: KsiNode[];
  expandedNodes: Map<string, KsiNode[]>;
  selectedId?: string;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string, node: KsiNode) => void;
  depth?: number;
}) {
  if (!nodes.length) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <FolderTree className="h-4 w-4" />
        Нет данных
      </div>
    );
  }

  return (
    <div>
      {nodes.map((node) => {
        const hasChildren = (node._count?.children ?? 0) > 0;
        const isExpanded = expandedNodes.has(node.id);
        const childNodes = expandedNodes.get(node.id) || [];

        return (
          <div key={node.id}>
            <div
              className="flex items-center gap-1"
              style={{ paddingLeft: `${depth * 16 + 4}px` }}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onToggle(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              ) : (
                <span className="w-6" />
              )}
              <button
                onClick={() => onSelect(node.id, node)}
                className={`flex flex-1 items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-muted ${
                  selectedId === node.id ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground">{node.code}</span>
                <span className="truncate">{node.name}</span>
              </button>
            </div>
            {isExpanded && childNodes.length > 0 && (
              <KsiNodeList
                nodes={childNodes}
                expandedNodes={expandedNodes}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
