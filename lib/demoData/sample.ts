// @/lib/demoData/sample.ts
/* 
Rôle : Fournir des données factices (Mock Data) pour le développement UI sans base de données. 
Structure : 
- Doit respecter strictement les interfaces Prisma (Book, BookNode, NodeContent). 
- Exporte des constantes : `mockBooks`, `mockNodes`, `mockContents`. 
Utilisation : 
- Utilisé comme fallback dans les composants si l'API échoue ou en mode démo. 
- Utile pour tester les composants d'affichage (BookList, NodeTree) de manière isolée.
*/

//import { Book, BookNode, NodeContent, User } from '@prisma/client';
import { Book, BookNode, NodeContent, User } from '@/lib/generated/prisma/';

// User factice pour les relations
export const mockUser: Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
} = {
  id: 'user_1',
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  emailVerified: true,
  image: 'https://i.pravatar.cc/150?img=1',
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
};

// Livres factices
export const mockBooks: (Book & {
  author?: typeof mockUser;
})[] = [
  {
    id: 'book_1',
    title: 'Introduction à la Programmation',
    description: 'Un guide complet pour débuter en programmation avec JavaScript',
    image: 'https://images.unsplash.com/photo-1618044612316-0c2c2c2c2c2c?w=400&h-300&fit=crop',
    order: 1,
    authorId: mockUser.id,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-25T16:20:00Z'),
    author: mockUser,
  },
  {
    id: 'book_2',
    title: 'Data Science Avancée',
    description: 'Techniques avancées de data science et machine learning',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    order: 2,
    authorId: mockUser.id,
    createdAt: new Date('2024-02-05T11:15:00Z'),
    updatedAt: new Date('2024-02-15T14:30:00Z'),
    author: mockUser,
  },
  {
    id: 'book_3',
    title: 'Design Patterns en JavaScript',
    description: 'Les patterns de conception les plus utiles en JavaScript moderne',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    order: 3,
    authorId: mockUser.id,
    createdAt: new Date('2024-01-20T14:00:00Z'),
    updatedAt: new Date('2024-02-10T09:45:00Z'),
    author: mockUser,
  },
];

// Nœuds de livre factices (hiérarchie organisée)
export const mockNodes: (BookNode & {
  book?: typeof mockBooks[0];
  parent?: BookNode | null;
  children?: BookNode[];
  authors?: typeof mockUser[];
  image?: null;
})[] = [
  // Nœuds pour le livre 1 (Introduction à la Programmation)
  {
    id: 'node_1_1',
    title: 'Partie I: Les Bases',
    description: 'Fondamentaux de la programmation',
    type: 'PART',
    order: 1,
    parentId: null,
    bookId: 'book_1',
    isPublished: true,
    publishedAt: new Date('2024-01-12T10:00:00Z'),
    imageId: null,
    createdAt: new Date('2024-01-11T09:30:00Z'),
    updatedAt: new Date('2024-01-11T09:30:00Z'),
    book: mockBooks[0],
    authors: [mockUser],
  },
  {
    id: 'node_1_2',
    title: 'Chapitre 1: Variables et Types',
    description: 'Apprendre à déclarer et utiliser des variables',
    type: 'CHAPTER',
    order: 1,
    parentId: 'node_1_1',
    bookId: 'book_1',
    isPublished: true,
    publishedAt: new Date('2024-01-13T11:00:00Z'),
    imageId: null,
    createdAt: new Date('2024-01-12T14:20:00Z'),
    updatedAt: new Date('2024-01-12T14:20:00Z'),
    book: mockBooks[0],
    authors: [mockUser],
  },
  {
    id: 'node_1_3',
    title: 'Chapitre 2: Structures de Contrôle',
    description: 'Conditions et boucles en JavaScript',
    type: 'CHAPTER',
    order: 2,
    parentId: 'node_1_1',
    bookId: 'book_1',
    isPublished: true,
    publishedAt: new Date('2024-01-15T15:30:00Z'),
    imageId: null,
    createdAt: new Date('2024-01-14T10:15:00Z'),
    updatedAt: new Date('2024-01-14T10:15:00Z'),
    book: mockBooks[0],
    authors: [mockUser],
  },
  {
    id: 'node_1_4',
    title: 'Partie II: Programmation Orientée Objet',
    description: 'Concepts avancés de POO',
    type: 'PART',
    order: 2,
    parentId: null,
    bookId: 'book_1',
    isPublished: false,
    publishedAt: null,
    imageId: null,
    createdAt: new Date('2024-01-16T16:45:00Z'),
    updatedAt: new Date('2024-01-16T16:45:00Z'),
    book: mockBooks[0],
    authors: [mockUser],
  },

  // Nœuds pour le livre 2 (Data Science Avancée)
  {
    id: 'node_2_1',
    title: 'Introduction au Machine Learning',
    description: 'Les bases du machine learning',
    type: 'CHAPTER',
    order: 1,
    parentId: null,
    bookId: 'book_2',
    isPublished: true,
    publishedAt: new Date('2024-02-10T09:00:00Z'),
    imageId: null,
    createdAt: new Date('2024-02-07T14:30:00Z'),
    updatedAt: new Date('2024-02-07T14:30:00Z'),
    book: mockBooks[1],
    authors: [mockUser],
  },
  {
    id: 'node_2_2',
    title: 'Les Algorithmes de Classification',
    description: 'SVM, Random Forest, KNN',
    type: 'SECTION',
    order: 1,
    parentId: 'node_2_1',
    bookId: 'book_2',
    isPublished: true,
    publishedAt: new Date('2024-02-12T11:30:00Z'),
    imageId: null,
    createdAt: new Date('2024-02-09T10:00:00Z'),
    updatedAt: new Date('2024-02-09T10:00:00Z'),
    book: mockBooks[1],
    authors: [mockUser],
  },

  // Nœuds pour le livre 3 (Design Patterns)
  {
    id: 'node_3_1',
    title: 'Patterns de Création',
    description: 'Singleton, Factory, Builder',
    type: 'CHAPTER',
    order: 1,
    parentId: null,
    bookId: 'book_3',
    isPublished: true,
    publishedAt: new Date('2024-01-25T14:00:00Z'),
    imageId: null,
    createdAt: new Date('2024-01-22T11:15:00Z'),
    updatedAt: new Date('2024-01-22T11:15:00Z'),
    book: mockBooks[2],
    authors: [mockUser],
  },
  {
    id: 'node_3_2',
    title: 'Patterns Structurels',
    description: 'Adapter, Decorator, Facade',
    type: 'CHAPTER',
    order: 2,
    parentId: null,
    bookId: 'book_3',
    isPublished: true,
    publishedAt: new Date('2024-01-28T16:45:00Z'),
    imageId: null,
    createdAt: new Date('2024-01-24T09:30:00Z'),
    updatedAt: new Date('2024-01-24T09:30:00Z'),
    book: mockBooks[2],
    authors: [mockUser],
  },
];

// Contenus de nœud factices
export const mockContents: (NodeContent & {
  node?: typeof mockNodes[0];
  image?: null;
})[] = [
  // Contenus pour le chapitre 1 du livre 1
  {
    id: 'content_1_1',
    order: 1,
    type: 'TEXT',
    content: '# Variables et Types\n\nLes variables sont des conteneurs pour stocker des données. En JavaScript, nous utilisons `let`, `const` ou `var` pour déclarer des variables.',
    metadata: { fontSize: '16px', fontWeight: 'normal' },
    nodeId: 'node_1_2',
    imageId: null,
    createdAt: new Date('2024-01-12T15:00:00Z'),
    updatedAt: new Date('2024-01-12T15:00:00Z'),
    node: mockNodes[1],
  },
  {
    id: 'content_1_2',
    order: 2,
    type: 'CODE',
    content: '// Déclaration de variables\nlet nom = "Jean";\nconst age = 30;\nvar ville = "Paris";\n\n// Types de données\nconst nombre = 42; // number\nconst texte = "Bonjour"; // string\nconst estVrai = true; // boolean\nconst liste = [1, 2, 3]; // array\nconst objet = { cle: "valeur" }; // object',
    metadata: { language: 'javascript', theme: 'dark' },
    nodeId: 'node_1_2',
    imageId: null,
    createdAt: new Date('2024-01-12T15:30:00Z'),
    updatedAt: new Date('2024-01-12T15:30:00Z'),
    node: mockNodes[1],
  },
  {
    id: 'content_1_3',
    order: 3,
    type: 'WARNING',
    content: '⚠️ Attention : `var` a une portée de fonction et peut causer des bugs subtils. Préférez `let` et `const` dans le code moderne.',
    metadata: { severity: 'medium' },
    nodeId: 'node_1_2',
    imageId: null,
    createdAt: new Date('2024-01-12T16:00:00Z'),
    updatedAt: new Date('2024-01-12T16:00:00Z'),
    node: mockNodes[1],
  },
  {
    id: 'content_1_4',
    order: 4,
    type: 'EXERCISE',
    content: '## Exercice Pratique\n\n1. Déclarez une constante `PI` avec la valeur 3.14159\n2. Créez une variable `rayon` initialisée à 5\n3. Calculez la circonférence du cercle (2 * PI * rayon)\n4. Affichez le résultat dans la console',
    metadata: { difficulty: 'beginner', points: 10 },
    nodeId: 'node_1_2',
    imageId: null,
    createdAt: new Date('2024-01-12T16:30:00Z'),
    updatedAt: new Date('2024-01-12T16:30:00Z'),
    node: mockNodes[1],
  },

  // Contenus pour le chapitre 2 du livre 1
  {
    id: 'content_2_1',
    order: 1,
    type: 'TEXT',
    content: '# Structures de Contrôle\n\nLes structures de contrôle permettent d\'exécuter du code de manière conditionnelle ou répétitive.',
    metadata: { fontSize: '16px' },
    nodeId: 'node_1_3',
    imageId: null,
    createdAt: new Date('2024-01-14T11:00:00Z'),
    updatedAt: new Date('2024-01-14T11:00:00Z'),
    node: mockNodes[2],
  },
  {
    id: 'content_2_2',
    order: 2,
    type: 'CODE',
    content: '// Condition if-else\nconst temperature = 25;\n\nif (temperature > 30) {\n  console.log("Il fait chaud");\n} else if (temperature > 20) {\n  console.log("Il fait bon");\n} else {\n  console.log("Il fait frais");\n}\n\n// Boucle for\nfor (let i = 0; i < 5; i++) {\n  console.log(`Itération ${i}`);\n}\n\n// Boucle while\nlet compteur = 0;\nwhile (compteur < 3) {\n  console.log(`Compteur: ${compteur}`);\n  compteur++;\n}',
    metadata: { language: 'javascript' },
    nodeId: 'node_1_3',
    imageId: null,
    createdAt: new Date('2024-01-14T11:30:00Z'),
    updatedAt: new Date('2024-01-14T11:30:00Z'),
    node: mockNodes[2],
  },

  // Contenu pour le livre 2 (Machine Learning)
  {
    id: 'content_3_1',
    order: 1,
    type: 'TEXT',
    content: '# Introduction au Machine Learning\n\nLe machine learning est une sous-discipline de l\'intelligence artificielle qui permet aux systèmes d\'apprendre à partir de données.',
    metadata: { fontSize: '18px' },
    nodeId: 'node_2_1',
    imageId: null,
    createdAt: new Date('2024-02-07T15:00:00Z'),
    updatedAt: new Date('2024-02-07T15:00:00Z'),
    node: mockNodes[4],
  },
  {
    id: 'content_3_2',
    order: 2,
    type: 'IMAGE',
    content: 'Workflow du Machine Learning',
    metadata: { alt: 'Diagramme du workflow ML', width: '800', height: '400' },
    nodeId: 'node_2_1',
    imageId: null,
    createdAt: new Date('2024-02-07T15:30:00Z'),
    updatedAt: new Date('2024-02-07T15:30:00Z'),
    node: mockNodes[4],
  },
  {
    id: 'content_3_3',
    order: 3,
    type: 'TIP',
    content: '💡 Conseil : Commencez toujours par explorer vos données (data exploration) avant de choisir un algorithme.',
    metadata: { category: 'best-practice' },
    nodeId: 'node_2_1',
    imageId: null,
    createdAt: new Date('2024-02-07T16:00:00Z'),
    updatedAt: new Date('2024-02-07T16:00:00Z'),
    node: mockNodes[4],
  },

  // Contenu pour le livre 3 (Design Patterns)
  {
    id: 'content_4_1',
    order: 1,
    type: 'TEXT',
    content: '# Pattern Singleton\n\nLe pattern Singleton garantit qu\'une classe n\'a qu\'une seule instance et fournit un point d\'accès global à cette instance.',
    metadata: { fontSize: '16px' },
    nodeId: 'node_3_1',
    imageId: null,
    createdAt: new Date('2024-01-22T12:00:00Z'),
    updatedAt: new Date('2024-01-22T12:00:00Z'),
    node: mockNodes[6],
  },
  {
    id: 'content_4_2',
    order: 2,
    type: 'CODE',
    content: '// Implémentation Singleton en JavaScript\nclass DatabaseConnection {\n  constructor() {\n    if (DatabaseConnection.instance) {\n      return DatabaseConnection.instance;\n    }\n    \n    this.host = "localhost";\n    this.port = 5432;\n    DatabaseConnection.instance = this;\n  }\n  \n  connect() {\n    console.log(`Connexion à ${this.host}:${this.port}`);\n  }\n}\n\n// Usage\nconst db1 = new DatabaseConnection();\ndb1.connect();\n\nconst db2 = new DatabaseConnection();\ndb2.connect();\n\nconsole.log(db1 === db2); // true',
    metadata: { language: 'javascript' },
    nodeId: 'node_3_1',
    imageId: null,
    createdAt: new Date('2024-01-22T12:30:00Z'),
    updatedAt: new Date('2024-01-22T12:30:00Z'),
    node: mockNodes[6],
  },
];

// Fonctions utilitaires pour simuler des requêtes API
export const mockApi = {
  // Simule un délai réseau
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Récupère tous les livres
  getBooks: async (): Promise<typeof mockBooks> => {
    await mockApi.delay(300);
    return mockBooks;
  },

  // Récupère un livre par ID
  getBookById: async (id: string): Promise<typeof mockBooks[0] | null> => {
    await mockApi.delay(200);
    return mockBooks.find(book => book.id === id) || null;
  },

  // Récupère les nœuds d'un livre
  getBookNodes: async (bookId: string): Promise<typeof mockNodes> => {
    await mockApi.delay(250);
    return mockNodes.filter(node => node.bookId === bookId);
  },

  // Récupère les contenus d'un nœud
  getNodeContents: async (nodeId: string): Promise<typeof mockContents> => {
    await mockApi.delay(150);
    return mockContents.filter(content => content.nodeId === nodeId);
  },

  // Récupère l'arbre complet d'un livre
  getBookTree: async (bookId: string) => {
    await mockApi.delay(400);
    const book = mockBooks.find(b => b.id === bookId);
    const nodes = mockNodes.filter(node => node.bookId === bookId);
    
    // Définition de l'interface TreeNode pour la récursion
    interface TreeNode extends Omit<BookNode, 'children'> {
      book?: typeof mockBooks[0];
      parent?: BookNode | null;
      children: TreeNode[];
      authors?: typeof mockUser[];
      image?: null;
      contents: typeof mockContents;
    }

    // Construit la hiérarchie avec un type de retour explicite
    const buildTree = (parentId: string | null): TreeNode[] => {
      return nodes
        .filter(node => node.parentId === parentId)
        .map(node => ({
          ...node,
          children: buildTree(node.id),
          contents: mockContents.filter(content => content.nodeId === node.id)
        } as TreeNode));
    };

    return {
      book,
      tree: buildTree(null)
    };
  },
};

// Export par défaut pour faciliter l'import
export default {
  mockUser,
  mockBooks,
  mockNodes,
  mockContents,
  mockApi,
};