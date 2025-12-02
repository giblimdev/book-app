// @/components/bookNode/BookNodeForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookNodeType = "BOOK" | "PART" | "CHAPTER" | "SECTION" | "SUBSECTION" | "ARTICLE";

type BookNodeFormProps = {
  bookId: string;
  parentId?: string;
  initialData?: {
    id: string;
    title: string;
    description?: string;
    type: BookNodeType;
    order: number;
  };
  onSuccess?: () => void;
};

export default function BookNodeForm({ 
  bookId, 
  parentId, 
  initialData,
  onSuccess 
}: BookNodeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "CHAPTER" as BookNodeType,
    order: initialData?.order || 0,
  });

  const nodeTypes: BookNodeType[] = [
    "BOOK",
    "PART",
    "CHAPTER",
    "SECTION",
    "SUBSECTION",
    "ARTICLE"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = initialData 
        ? `/api/booknode/${initialData.id}` 
        : "/api/booknode";
      
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bookId,
          parentId: parentId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        {initialData ? "Modifier le nœud" : "Créer un nouveau nœud"}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Titre *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Type *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as BookNodeType })}
          className="w-full border rounded px-3 py-2"
          required
        >
          {nodeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Ordre
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer"}
        </button>
        
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}