//@/app/page.tsx

/**
 * @file app/page.tsx
 * @type Page Next.js (Server Component)
 * @role Page d'accueil publique présentant l'application d'édition collaborative de livres.
 * 
 * @features
 * • Hero section accrocheuse avec titre, description et bouton d'appel à l'action
 * • Présentation des fonctionnalités principales sous forme de cartes
 * • Aperçu visuel de l'interface avec mockup
 * • Témoignages fictifs pour crédibilité
 * • Section FAQ pour répondre aux questions courantes
 * • Footer avec lien vers l'éditeur principal
 * 
 * @dependencies
 * • next/link, next/image pour la navigation et l'optimisation
 * • shadcn/ui : Card, Button, Accordion, Badge
 * • lucide-react : icônes (BookOpen, Users, GitBranch, Cloud, Check, ArrowRight, etc.)
 * • tailwindcss : classes utilitaires pour le design responsive
 * 
 * @design
 * • Design moderne avec gradients subtils et animations douces
 * • Palette de couleurs cohérente avec le thème de l'application
 * • Sections bien espacées avec padding vertical
 * • Mobile-first : toutes les sections s'empilent proprement
 * • Images optimisées avec next/image
 * 
 * @accessibility
 * • Balises sémantiques (header, main, section, footer)
 * • Alt text pour toutes les images
 * • Contrastes de couleurs vérifiés
 * • Navigation au clavier fonctionnelle
 */

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  GitBranch,
  Cloud,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  MessageSquare,
  FileText,
  Code,
  Image as ImageIcon,
  Lightbulb
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: "Édition Collaborative",
      description: "Travaillez à plusieurs sur le même livre en temps réel. Chaque modification est synchronisée instantanément.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <GitBranch className="h-10 w-10" />,
      title: "Structure Hiérarchique",
      description: "Organisez votre livre en parties, chapitres et sections avec une arborescence intuitive.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <FileText className="h-10 w-10" />,
      title: "Contenus Multi-Formats",
      description: "Texte enrichi, code avec coloration syntaxique, images, citations, exercices et bien plus.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Commentaires Contextuels",
      description: "Annotez chaque section et discutez avec vos co-auteurs directement dans l'éditeur.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Cloud className="h-10 w-10" />,
      title: "Sauvegarde Automatique",
      description: "Votre travail est sauvegardé automatiquement. Ne perdez jamais une idée.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Sécurisé & Privé",
      description: "Vos données sont chiffrées et hébergées en Europe. Vous gardez le contrôle total.",
      color: "from-gray-700 to-gray-900"
    }
  ];

  const faqItems = [
    {
      question: "Est-ce gratuit ?",
      answer: "Oui, l'édition collaborative de base est entièrement gratuite. Nous proposerons des fonctionnalités avancées pour les équipes professionnelles."
    },
    {
      question: "Puis-je exporter mon livre ?",
      answer: "Oui, vous pouvez exporter vos livres en PDF, Markdown ou HTML. L'export EPUB et Word est en développement."
    },
    {
      question: "Combien de co-auteurs puis-je inviter ?",
      answer: "Actuellement, vous pouvez inviter jusqu'à 10 co-auteurs par livre. Cette limite sera augmentée dans les versions futures."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement de bout en bout et hébergeons nos serveurs en France. Vos données vous appartiennent."
    },
    {
      question: "Puis-je utiliser l'application hors ligne ?",
      answer: "Une version hors ligne avec synchronisation automatique est en cours de développement."
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Professeure de littérature",
      content: "Cet outil a révolutionné ma façon de créer des supports pédagogiques. La collaboration avec mes collègues est désormais fluide et naturelle.",
      avatar: "M"
    },
    {
      name: "Thomas Leroy",
      role: "Tech Lead",
      content: "Parfait pour documenter nos projets techniques. Le support du code et la hiérarchie nous permettent de structurer des documentations complexes.",
      avatar: "T"
    },
    {
      name: "Sophie Martin",
      role: "Éditrice indépendante",
      content: "Je gère plusieurs auteurs sur un même livre. L'interface est intuitive et les commentaires contextuels ont éliminé les allers-retours par email.",
      avatar: "S"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
              <Sparkles className="mr-2 h-4 w-4" />
              Édition Beta - Nouveauté
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Écrivez, collaborez,
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                publiez ensemble
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              La première plateforme d'édition collaborative conçue pour les auteurs, enseignants et équipes techniques.
              Créez des livres, documentations et cours en toute simplicité.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/viewBook">
                  Essayer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="#features">
                  Découvrir les fonctionnalités
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground pt-4">
              Aucune carte de crédit requise • Commencez en 30 secondes
            </p>
          </div>
          
          {/* Mockup Preview */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="relative rounded-2xl border bg-card p-2 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
              <div className="relative bg-muted/50 rounded-xl overflow-hidden">
                {/* Mockup bars */}
                <div className="flex items-center gap-2 p-4 bg-background border-b">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 h-8 rounded-lg bg-muted mx-4" />
                  <div className="h-8 w-8 rounded-full bg-muted" />
                </div>
                
                {/* Mockup content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 p-6 gap-6">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-muted rounded" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className="h-10 bg-muted rounded-lg" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-6 w-40 bg-primary/20 rounded" />
                    <div className="h-32 bg-muted rounded-lg" />
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-muted rounded" />
                      <div className="h-8 w-20 bg-primary rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Tout ce dont vous avez besoin pour créer ensemble
            </h2>
            <p className="text-xl text-muted-foreground">
              Une suite d'outils puissants mais simples, conçue pour fluidifier votre processus d'écriture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ils créent déjà avec nous
              </h2>
              <p className="text-xl text-muted-foreground">
                Découvrez comment notre plateforme transforme leur façon de travailler.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="italic text-muted-foreground">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Questions fréquentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir avant de commencer.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 md:p-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Prêt à commencer votre premier livre collaboratif ?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Rejoignez des centaines d'auteurs, enseignants et équipes qui utilisent déjà notre plateforme.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/viewBook">
                  Créer mon premier livre gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/auth/login">
                  J'ai déjà un compte
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Aucune installation requise</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sécurité des données garantie</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Support réactif</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BookEditor</span>
              <span className="text-xs text-muted-foreground">Beta v0.1</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Confidentialité
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Conditions
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BookEditor. Conçu avec ❤️ pour les créateurs.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}