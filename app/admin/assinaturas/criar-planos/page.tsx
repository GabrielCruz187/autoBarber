'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function CriarPlanosPage() {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    servicos_inclusos: '',
    beneficios: '',
    visivel: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      visivel: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.preco) {
      toast.error('Erro', { description: 'Preencha todos os campos obrigatórios' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/assinaturas/planos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          descricao: formData.descricao || null,
          preco: parseFloat(formData.preco),
          servicos_inclusos: formData.servicos_inclusos ? parseInt(formData.servicos_inclusos) : null,
          beneficios: formData.beneficios ? formData.beneficios.split('\n').filter(b => b.trim()) : [],
          visivel: formData.visivel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar plano')
      }

      toast.success('Sucesso!', { description: 'Plano de assinatura criado com sucesso!' })
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        servicos_inclusos: '',
        beneficios: '',
        visivel: true,
      })
    } catch (error) {
      toast.error('Erro', { description: error instanceof Error ? error.message : 'Erro ao criar plano de assinatura' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Criar Plano de Assinatura</h1>
        <p className="text-muted-foreground">Adicione um novo plano de assinatura para sua barbearia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nome">Nome do Plano</Label>
                <Input 
                  id="nome"
                  name="nome"
                  placeholder="Ex: Plano Premium" 
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="preco">Preço Mensal</Label>
                <Input 
                  id="preco"
                  name="preco"
                  type="number" 
                  placeholder="0.00" 
                  step="0.01"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao"
                name="descricao"
                placeholder="Descreva os benefícios do plano"
                value={formData.descricao}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="servicos_inclusos">Quantidade de Serviços Inclusos</Label>
              <Input 
                id="servicos_inclusos"
                name="servicos_inclusos"
                type="number" 
                placeholder="0"
                value={formData.servicos_inclusos}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="beneficios">Benefícios (um por linha)</Label>
              <Textarea 
                id="beneficios"
                name="beneficios"
                placeholder="Benefício 1&#10;Benefício 2&#10;Benefício 3" 
                rows={5}
                value={formData.beneficios}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-lg">
              <Checkbox 
                id="visivel"
                checked={formData.visivel}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="visivel" className="cursor-pointer mb-0">
                Exibir este plano para clientes
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="gap-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                {isLoading ? 'Criando...' : 'Criar Plano'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setFormData({
                  nome: '',
                  descricao: '',
                  preco: '',
                  servicos_inclusos: '',
                  beneficios: '',
                  visivel: true,
                })}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
