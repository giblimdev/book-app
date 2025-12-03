//@/app/viewBook/page.tsx
/**
 * @file app/viewBook/page.tsx
 * @type Page Next.js (Server Component)
 * @role Orchestrateur de layout pour l'édition de livre.
 */

import React from 'react';
import BookManager from '@/components/creatBook/BookManager';
import BookNodeManager from '@/components/creatBook/BookNodeManager';
import BookNodeContentManager from '@/components/creatBook/BookNodeContentManager';
import { Card } from '@/components/ui/card';

export default function ViewBookPage() {
  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* SIDEBAR (Gauche sur Desktop, Haut sur Mobile) */}
        <aside className="lg:col-span-4 space-y-6 flex flex-col h-full">
          {/* Gestion du Livre (Sélection / Création) */}
          <section aria-label="Gestion du livre">
            <Card className="p-4 shadow-sm">
              <BookManager />
            </Card>
          </section>

          {/* Arbre des chapitres (Navigation) */}
          <section aria-label="Structure du livre" className="flex-1 min-h-0">
            <Card className="p-4 h-full shadow-sm overflow-hidden flex flex-col">
              <BookNodeManager />
            </Card>
          </section>
        </aside>

        {/* ZONE D'ÉDITION PRINCIPALE (Droite sur Desktop, Bas sur Mobile) */}
        <main className="lg:col-span-8 h-full">
          <section aria-label="Éditeur de contenu" className="h-full">
            <Card className="h-full shadow-sm flex flex-col overflow-hidden">
              <BookNodeContentManager />
            </Card>
          </section>
        </main>

      </div>
    </div>
  );
}
