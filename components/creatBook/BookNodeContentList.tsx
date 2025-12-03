//@/components/creatBook/BookNodeContentList.tsx
'use client';

import React from 'react';
import { NodeContent } from '@/lib/generated/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Image as ImageIcon, Code2, Lightbulb, 
  AlertTriangle, Quote, Edit2, Trash2, MoreVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookNodeContentListProps {
  contents: NodeContent[];
  onEdit: (content: NodeContent) => void;
  onDelete: (id: string) => void;
}

// Mapping Type -> Icone & Style
const TYPE_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
  TEXT:     { icon: FileText,      color: "text-slate-500",   label: "Texte" },
  IMAGE:    { icon: ImageIcon,     color: "text-blue-500",    label: "Image" },
  CODE:     { icon: Code2,         color: "text-purple-500",  label: "Code" },
  TIP:      { icon: Lightbulb,     color: "text-yellow-500",  label: "Astuce" },
  WARNING:  { icon: AlertTriangle, color: "text-red-500",     label: "Attention" },
  QUOTE:    { icon: Quote,         color: "text-gray-500",    label: "Citation" },
};

export default function BookNodeContentList({ contents, onEdit, onDelete }: BookNodeContentListProps) {
  
  return (
    <div className="space-y-3">
      {contents.map((content) => {
        const config = TYPE_CONFIG[content.type] || TYPE_CONFIG.TEXT;
        const Icon = config.icon;

        return (
          <Card 
            key={content.id} 
            className="group relative flex items-start gap-4 p-4 transition-all hover:shadow-md border-l-4 hover:border-l-primary/50"
            style={{ borderLeftColor: content.type === 'WARNING' ? '#ef4444' : undefined }}
          >
            {/* Icône Type */}
            <div className={cn("mt-1 p-2 rounded-md bg-muted shrink-0", config.color)}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Contenu Preview */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                  {config.label}
                </Badge>
                {/* Titre ou Méta info si besoin */}
              </div>
              
              <div className="text-sm text-foreground/90 line-clamp-3 whitespace-pre-line font-mono md:font-sans">
                {content.content || <span className="italic text-muted-foreground">Contenu vide...</span>}
              </div>
            </div>

            {/* Actions (Visibles au hover) */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 md:static md:flex-row md:self-start">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => onEdit(content)}
                title="Éditer"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(content.id)}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
  