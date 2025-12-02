//@/app/book/[bookId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/auth-client"; // Import client correct
import { useRouter, useParams } from "next/navigation"; // Hooks de navigation client
import Image from "next/image";
import Link from "next/link";

// Type pour les nœuds hiérarchiques (identique au serveur, mais utilisé côté client)
type HierarchicalNode = {
  id: string;
  title: string;
  type: string;
  order: number;
  _count: {
    contents: number;
    children: number;
    comments: number;
  };
  children: HierarchicalNode[];
};

// Type pour le livre complet reçu de l'API
type BookData = {
  id: string;
  title: string;
  description: string | null;
  authorId: string;
  createdAt: string;
  image: { url: string; altText: string | null } | null;
  author: { id: string; name: string; email: string; image: string | null };
  hierarchicalNodes: HierarchicalNode[];
  stats: {
    chapters: number;
    sections: number;
    contents: number;
  };
};

export default function BookDetailPage() {
  // ✅ Récupération des params côté client avec useParams
  const params = useParams();
  const bookId = params?.bookId as string;
  const router = useRouter();

  // ✅ Session côté client
  const { data: session, isPending: isSessionLoading } = useSession();

  const [book, setBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Récupération des données via API Route
  useEffect(() => {
    if (!bookId) return;

    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Livre introuvable");
          if (res.status === 401) throw new Error("Non autorisé");
          throw new Error("Erreur lors du chargement");
        }
        const data = await res.json();
        setBook(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBook();
  }, [bookId]);

  // Redirection si pas connecté (après chargement session)
  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.push("/login");
    }
  }, [session, isSessionLoading, router]);

  if (isSessionLoading || isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (error || !book) {
    return <div className="p-8 text-center text-red-600">{error || "Erreur"}</div>;
  }

  const isAuthor = session?.user?.id === book.authorId;

  // ✅ Actions via API (fetch) au lieu de Server Actions
  async function handleDeleteBook() {
    if (!confirm("Voulez-vous vraiment supprimer ce livre ?")) return;
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard");
      else alert("Erreur suppression");
    } catch (e) {
      alert("Erreur réseau");
    }
  }

  async function handleCreateNode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    const type = formData.get("type");

    try {
      const res = await fetch(`/api/books/${bookId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type }),
      });
      if (res.ok) {
        // Recharger les données ou ajouter localement
        window.location.reload(); // Simple reload pour l'exemple
      }
    } catch (e) {
      alert("Erreur création");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* En-tête */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {book.image && (
              <div className="md:w-48 md:h-48 w-full h-64 relative">
                <Image
                  src={book.image.url}
                  alt={book.image.altText ?? book.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              {book.description && (
                <p className="mt-4 text-gray-600">{book.description}</p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {book.author.image ? (
                    <Image
                      src={book.author.image}
                      alt={book.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-medium">
                        {book.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{book.author.name}</p>
                    <p className="text-sm text-gray-500">Auteur principal</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Créé le {new Date(book.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isAuthor ? (
            <>
              <Link
                href={`/book/${book.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Éditer le livre
              </Link>
              <button
                onClick={handleDeleteBook}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </>
          ) : (
            <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              Co-auteur
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Structure */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
              Structure du livre ({book.stats.chapters + book.stats.sections} nœuds)
            </h2>
            {book.hierarchicalNodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun chapitre pour l&apos;instant
              </div>
            ) : (
              <div className="space-y-2">
                {book.hierarchicalNodes.map((node) => (
                  <NodeItem key={node.id} node={node} bookId={book.id} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite : Formulaire & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter un chapitre</h3>
            <form onSubmit={handleCreateNode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  name="title"
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  className="w-full px-3 py-2 border rounded-lg"
                  defaultValue="CHAPTER"
                >
                  <option value="CHAPTER">Chapitre</option>
                  <option value="PART">Partie</option>
                  <option value="SECTION">Section</option>
                  <option value="ARTICLE">Article</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Ajouter
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Chapitres</span>
                <span className="font-semibold">{book.stats.chapters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sections</span>
                <span className="font-semibold">{book.stats.sections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contenus</span>
                <span className="font-semibold">{book.stats.contents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Composant NodeItem Client
function NodeItem({ node, bookId }: { node: HierarchicalNode; bookId: string }) {
  const hasChildren = node.children && node.children.length > 0;

  async function handleDelete() {
    if (!confirm("Supprimer ce nœud ?")) return;
    try {
      const res = await fetch(`/api/nodes/${node.id}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
    } catch (e) {
      alert("Erreur suppression");
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Link
            href={`/book/${bookId}/${node.id}`}
            className="font-medium hover:text-blue-600"
          >
            {node.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {node.type}
            </span>
            <span className="text-sm text-gray-500">
              {node._count.contents} contenus
            </span>
            {node._count.children > 0 && (
              <span className="text-sm text-gray-500">
                • {node._count.children} sous-sections
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/book/${bookId}/${node.id}/edit`}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Éditer
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Supprimer
          </button>
        </div>
      </div>
      {hasChildren && (
        <div className="mt-4 ml-4 space-y-2 border-l-2 border-gray-100 pl-4">
          {node.children.map((child) => (
            <NodeItem key={child.id} node={child} bookId={bookId} />
          ))}
        </div>
      )}
    </div>
  );
}
