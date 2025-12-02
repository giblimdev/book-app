import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, Code, Terminal, FileText, ArrowRight, Layout } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function DevPage() {
  const devTools = [
    { 
      name: 'File Explorer', 
      description: 'Gestionnaire de fichiers de développement',
      icon: FolderOpen, 
      href: '/dev/file',
      color: 'text-blue-500'
    },
    { 
      name: 'Code Editor', 
      description: 'Éditeur de code en ligne',
      icon: Code, 
      href: '/dev/code',
      color: 'text-green-500'
    },
    { 
      name: 'Terminal', 
      description: 'Terminal intégré',
      icon: Terminal, 
      href: '/dev/terminal',
      color: 'text-red-500'
    },
    { 
      name: 'Documentation', 
      description: 'Documentation technique',
      icon: FileText, 
      href: '/dev/docs',
      color: 'text-purple-500'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Terminal className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Espace Développeur</h1>
              <p className="text-muted-foreground mt-2">
                Outils et ressources pour les développeurs
              </p>
            </div>
          </div>
          <Separator />
        </header>

        {/* Main Content */}
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {devTools.map((tool) => (
              <Card key={tool.name} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md bg-primary/10 ${tool.color}`}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={tool.href}>
                      Accéder à l&apos;outil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Liens rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild variant="secondary" className="justify-start h-auto py-4">
                  <Link href="/dev/file" className="flex flex-col items-start">
                    <span className="font-semibold">/dev/file</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Explorateur de fichiers
                    </span>
                  </Link>
                </Button>
                
                <Button asChild variant="secondary" className="justify-start h-auto py-4">
                  <Link href="/dev/api" className="flex flex-col items-start">
                    <span className="font-semibold">/dev/api</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Documentation API
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats or Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4</div>
                  <p className="text-sm text-muted-foreground">Outils disponibles</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <p className="text-sm text-muted-foreground">Disponibilité</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Dev</div>
                  <p className="text-sm text-muted-foreground">Environnement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}