'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface PublicPageLinkProps {
  slug: string
  barbershopName: string
}

export function PublicPageLink({ slug, barbershopName }: PublicPageLinkProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://barberproapp.com"
  const publicPageUrl = `${baseUrl}/b/${slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicPageUrl)
      toast.success("Link copiado para a área de transferência!")
    } catch (error) {
      toast.error("Erro ao copiar link")
    }
  }

  const handleOpenLink = () => {
    window.open(publicPageUrl, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Página Pública</CardTitle>
        <CardDescription>
          Compartilhe este link com seus clientes para que vejam seus serviços e barbeiros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={publicPageUrl}
            readOnly
            className="text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            title="Copiar link"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenLink}
            title="Abrir página pública"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {barbershopName} · Acesso público · Sem login necessário
        </p>
      </CardContent>
    </Card>
  )
}
