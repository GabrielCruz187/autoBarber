'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, Trash2, CheckCircle } from 'lucide-react'
import type { FiscalCertificate, FiscalConfig } from '@/lib/fiscal/types'
import { mutate } from 'swr'
import { config } from '@/lib/fiscal/config' // Import or declare the variable before using it

export function CertificateManager() {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [certificates, setCertificates] = useState<FiscalCertificate[]>([])
  const [configData, setConfigData] = useState<{ config: FiscalConfig | null }>({ config: null })
  const [certsLoading, setCertsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setCertsLoading(true)
        const [certsRes, configRes] = await Promise.all([
          fetch('/api/fiscal/certificates'),
          fetch('/api/fiscal/config'),
        ])
        
        const certsData = await certsRes.json()
        const configData = await configRes.json()
        
        setCertificates(certsData.certificates || [])
        setConfigData({ config: configData.config || null })
      } catch (error) {
        console.error('[v0] Error loading data:', error)
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados',
          variant: 'destructive',
        })
      } finally {
        setCertsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!certificateFile || !password || !configData.config?.id) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', certificateFile)
      formData.append('password', password)
      formData.append('config_id', config?.id || '')

      const response = await fetch('/api/fiscal/certificates', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      toast({
        title: 'Sucesso',
        description: 'Certificado enviado com sucesso',
      })

      setCertificateFile(null)
      setPassword('')
      
      // Reload certificates
      const res = await fetch('/api/fiscal/certificates')
      const data = await res.json()
      setCertificates(data.certificates || [])

      toast({
        title: 'Sucesso',
        description: 'Certificado enviado com sucesso',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao enviar certificado',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enviar Certificado Digital</CardTitle>
          <CardDescription>Faça upload do seu certificado A1 (.pfx)</CardDescription>
        </CardHeader>
        <CardContent>
          {!configData.config?.id ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuração Necessária</AlertTitle>
              <AlertDescription>
                Você precisa completar a configuração fiscal primeiro
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificate">Arquivo .PFX *</Label>
                <Input
                  id="certificate"
                  type="file"
                  accept=".pfx"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha do Certificado *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de certificado"
                  required
                  disabled={isUploading}
                />
              </div>

              <Button type="submit" disabled={isUploading || !certificateFile}>
                {isUploading && <Spinner className="mr-2 h-4 w-4" />}
                {isUploading ? 'Enviando...' : 'Enviar Certificado'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {certsLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner className="h-8 w-8" />
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum certificado enviado ainda
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certificados Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CN</TableHead>
                    <TableHead>Número Serial</TableHead>
                    <TableHead>Válido Até</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => {
                    const isExpiring = new Date(cert.valid_until) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    const isExpired = new Date(cert.valid_until) < new Date()

                    return (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-sm">{cert.subject_cn}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {cert.serial_number.substring(0, 16)}...
                        </TableCell>
                        <TableCell>
                          {new Date(cert.valid_until).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge variant="destructive">Expirado</Badge>
                          ) : isExpiring ? (
                            <Badge variant="outline">Expirando em breve</Badge>
                          ) : (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Válido
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isExpired}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
