'use client';

import { useState } from 'react';
import { Search, TreePine } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useKsiTree } from './useKsiTree';
import { KsiTreeNode } from './KsiTreeNode';

interface Props {
  value: string | null;
  onChange: (ksiNodeId: string | null) => void;
}

export function KsiTreeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value);
  const { tree, isLoading, expandedIds, toggleExpand, search, setSearch, nodes } = useKsiTree();

  // Найти название выбранного узла для отображения
  const selectedNode = value ? nodes.find((n) => n.id === value) : null;

  const handleConfirm = () => {
    onChange(selectedId);
    setOpen(false);
  };

  const handleOpen = () => {
    setSelectedId(value);
    setOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start font-normal"
        onClick={handleOpen}
      >
        <TreePine className="mr-2 h-4 w-4 text-muted-foreground" />
        {selectedNode ? (
          <span className="truncate">
            <span className="text-muted-foreground font-mono text-xs mr-1">{selectedNode.code}</span>
            {selectedNode.name}
          </span>
        ) : (
          <span className="text-muted-foreground">Выберите раздел КСИ</span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Выбор раздела КСИ</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или коду..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] border rounded-md py-1">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : tree.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                {search ? 'Ничего не найдено' : 'Справочник КСИ пуст'}
              </p>
            ) : (
              tree.map((node) => (
                <KsiTreeNode
                  key={node.id}
                  node={node}
                  isExpanded={expandedIds.has(node.id)}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onToggle={toggleExpand}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSelectedId(null);
                onChange(null);
                setOpen(false);
              }}
            >
              Очистить
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Выбрать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
