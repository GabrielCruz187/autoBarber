'use client'

import React from "react"

import { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'
import type { FiscalConfig } from '@/lib/fiscal/types'

const states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

const taxRegimes = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
]

const fiscalProviders = [
  { value: 'mock', label: 'Mock (para testes)' },
  { value: 'plug_notas', label: 'PlugNotas' },
  { value: 'focus_nfe', label: 'Focus NFe' },
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function FiscalConfigForm() {
  const { data, isLoading, error } = useSWR<{ config: FiscalConfig | null }>(
    '/api/fiscal/config',
    fetcher
  )

  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<FiscalConfig>>({})

  useEffect(() => {
    if (data?.config) {
      setFormData(data.config)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/fiscal/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      const result = await response.json()
      setFormData(result.config)
      mutate('/api/fiscal/config')

      toast({
        title: 'Sucesso',
        description: 'Configuração fiscal salva com sucesso',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao salvar configuração',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="legal_name">Razão Social *</Label>
          <Input
            id="legal_name"
            value={formData.legal_name || ''}
            onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
            placeholder="Nome da sua barbearia"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={formData.cnpj || ''}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
          <Input
            id="inscricao_municipal"
            value={formData.inscricao_municipal || ''}
            onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })}
            placeholder="Número da inscrição municipal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnae">CNAE *</Label>
          <Input
            id="cnae"
            value={formData.cnae || ''}
            onChange={(e) => setFormData({ ...formData, cnae: e.target.value })}
            placeholder="7111-300 (Serviços de barbearia)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_regime">Regime Tributário *</Label>
          <Select value={formData.tax_regime} onValueChange={(value) => setFormData({ ...formData, tax_regime: value as any })}>
            <SelectTrigger id="tax_regime">
              <SelectValue placeholder="Selecione o regime" />
            </SelectTrigger>
            <SelectContent>
              {taxRegimes.map((regime) => (
                <SelectItem key={regime.value} value={regime.value}>
                  {regime.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold">Endereço</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Logradouro *</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, Avenida, etc"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              value={formData.number || ''}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={formData.complement || ''}
              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
              placeholder="Apto, sala, etc"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP *</Label>
            <Input
              id="zip_code"
              value={formData.zip_code || ''}
              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              placeholder="00000-000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Nome da cidade"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">UF *</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
              <SelectTrigger id="state">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ibge_code">Código IBGE *</Label>
            <Input
              id="ibge_code"
              value={formData.ibge_code || ''}
              onChange={(e) => setFormData({ ...formData, ibge_code: e.target.value })}
              placeholder="Ex: 3550308"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold">Contato</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="fiscal@barbearia.com"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold">Integração Fiscal</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fiscal_provider">Provedor *</Label>
            <Select value={formData.fiscal_provider} onValueChange={(value) => setFormData({ ...formData, fiscal_provider: value as any })}>
              <SelectTrigger id="fiscal_provider">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                {fiscalProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscal_provider_api_key">Chave API</Label>
            <Input
              id="fiscal_provider_api_key"
              type="password"
              value={formData.fiscal_provider_api_key || ''}
              onChange={(e) => setFormData({ ...formData, fiscal_provider_api_key: e.target.value })}
              placeholder="Sua chave de API do provedor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_service_code">Código de Serviço Municipal</Label>
            <Input
              id="default_service_code"
              value={formData.default_nfse_description || ''}
              onChange={(e) => setFormData({ ...formData, default_service_code: e.target.value })}
              placeholder="1401"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_nfse_description">Descrição Padrão NFS-e</Label>
            <Input
              id="default_nfse_description"
              value={formData.default_nfse_description || ''}
              onChange={(e) => setFormData({ ...formData, default_nfse_description: e.target.value })}
              placeholder="Serviço de barbearia"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Spinner className="mr-2 h-4 w-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </form>
  )
}
