"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { Loader2, LogOut } from "lucide-react";

/**
 * Rôle :
 *  - Affiche les informations de l'utilisateur connecté.
 *  - Gère l'état de chargement et les cas non connectés.
 */
export default function UserInfo() {
  // Correction: utilisation de isPending au lieu de isLoading
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Card className="p-4 flex justify-center items-center bg-card rounded-2xl shadow-sm">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="p-4 text-center bg-card rounded-2xl shadow-sm">
        <p className="text-sm text-muted-foreground">
          Aucun utilisateur connecté
        </p>
      </Card>
    );
  }

  const user = session.user;

  return (
    <Card className="p-4 bg-card rounded-2xl shadow-sm">
      <CardContent className="flex items-center gap-3 p-0"> {/* Ajout de p-0 car CardContent a du padding par défaut */}
        <Avatar className="w-12 h-12 border border-border">
          <AvatarImage
            src={user.image ?? "https://i.pravatar.cc/100"}
            alt={user.name ?? "Utilisateur"}
          />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col flex-1 min-w-0"> {/* min-w-0 pour le truncate */}
          <span className="font-semibold text-sm text-foreground truncate">
            {user.name ?? "Utilisateur"}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user.email ?? ""}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
          aria-label="Se déconnecter"
        >
          <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
      </CardContent>
    </Card>
  );
}
