//@/app/w/page.tsx


/*

model Book  { // Représente un livre entier. C'est l'entité principale qui regroupe tous les nœuds (chapitres, sections, etc.).
  id          String    @id @default(cuid())
  title       String
  description String?
  image       String?
  order       Int       @default(0)
  
  // Relations
  author    User      @relation("AuthorBooks", fields: [authorId], references: [id])
  authorId  String
  
  bookNodes BookNode[]
  
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("books")
}

model BookNode { // Représente une unité de contenu dans un livre (chapitre, section, article, etc.).
  id           String        @id @default(cuid())
  title        String
  description  String?
  type         String        @default("CHAPTER") // BOOK, PART, CHAPTER, SECTION, SUBSECTION, ARTICLE
  order        Int           @default(0)
  
  // Hiérarchie
  parentId     String?
  parent       BookNode?     @relation("Hierarchy", fields: [parentId], references: [id])
  children     BookNode[]    @relation("Hierarchy")
  
  // Auteurs (many-to-many)
  authors      User[]        @relation("BookNodeAuthors")
  
  // Contenu
  contents     NodeContent[]
  
  // Commentaires
  comments     Comment[]
  
  // Image
  imageId      String?
  image        Image?        @relation(fields: [imageId], references: [id])
  
  // Livre parent
  bookId       String?
  book         Book?         @relation(fields: [bookId], references: [id])
  
  
  // Métadonnées
  isPublished  Boolean       @default(false)
  publishedAt  DateTime?
  
  // Timestamps
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  @@map("book_nodes")
}

model NodeContent { // Représente un bloc de contenu dans un nœud de livre (texte, image, code, etc.).
  id        String   @id @default(cuid())
  order     Int      @default(0)
  type      String   @default("TEXT") // TEXT, IMAGE, VIDEO, AUDIO, CODE, QUOTE, WARNING, INFO, TIP, QUESTION, EXERCISE, SOLUTION, TABLE, LIST
  content   Json
  metadata  Json?    @default("{}")
  
  // Relations
  nodeId   String
  node     BookNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("node_contents")
}

model Comment { // Représente un commentaire fait par un utilisateur sur un nœud de livre.
  id        String   @id @default(cuid())
  content   String
  isEdited  Boolean  @default(false)
  
  // Relations
  nodeId String
  node   BookNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  
  userId String
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("comments")
}

model Image {
  id        String    @id @default(cuid())
  url       String
  altText   String?
  width     Int?
  height    Int?
  format    String?   // jpg, png, webp, etc.
  
  // Relations
  bookNodes BookNode[]
  
  // Timestamps
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@map("images")
}

*/
/*
page responsise qui affiche
Author.tsx qui utilise useSession de lib/auth/auth-client pour afficher le nom de l'auteur 
SelectBook.tsx qui affiche le titre du livre selectionné et un boutton add book
SelectNode.tsx qui affiche les BookNode et un boutton add node
NodeContent.tsx affiche le contenu du node selectionné. et le boutton edit node
ici je comprends ce que je fait
*/
// ou 
/*

/app/book/[bookId]/page.tsx
Rôle : Page de détails d'un livre.
Affichage : Informations du livre (titre, description, image, auteur) et liste de tous les nœuds (chapitres, sections, etc.) de ce livre.
Actions : Lien pour éditer le livre (si auteur) et liens vers les pages de chaque nœud.
Partie du schéma gérée : Book et BookNode (pour la liste).

/app/book/[bookId]/[nodeId]/page.tsx
Rôle : Page de détails d'un nœud (chapitre, section, etc.).
Affichage : Titre du nœud, description, image, et liste des contenus (NodeContent) de ce nœud.
Actions : Lien pour éditer le nœud (si auteur) et liens pour ajouter/éditer du contenu.
Partie du schéma gérée : BookNode et NodeContent (pour la liste).

/app/book/[bookId]/[nodeId]/edit/page.tsx
Rôle : Page d'édition d'un nœud.
Affichage : Formulaire pour modifier les propriétés du nœud (titre, description, type, etc.) et gestion des auteurs.
Actions : Sauvegarde des modifications.
Partie du schéma gérée : BookNode.

/app/book/[bookId]/[nodeId]/content/[contentId]/page.tsx
Rôle : Page de détails d'un contenu (NodeContent) - peut-être pour une édition détaillée ou prévisualisation.
Affichage : Contenu complet (texte, image, code, etc.) avec mise en forme.
Actions : Lien pour éditer le contenu.
Partie du schéma gérée : NodeContent.*/







import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}
