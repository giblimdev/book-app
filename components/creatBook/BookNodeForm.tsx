import React from 'react'

export default function BookNodeForm() {
  return (
    <div>BookNodeForm</div>
  )
}
/*Type '{ onSubmit: (newNode: Partial<{ type: string; id: string; title: string; description: string | null; order: number; parentId: string | null; imageId: string | null; bookId: string | null; isPublished: boolean; publishedAt: Date | null; createdAt: Date; updatedAt: Date; }>) => Promise<...>; onCancel: () => void; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onSubmit' does not exist on type 'IntrinsicAttributes'. */