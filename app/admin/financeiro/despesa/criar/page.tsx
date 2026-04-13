'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ExpenseForm {
  title: string
  description: string
  amount: string
  category: string
  subcategory: string
  dueDate: string
  discount: string
  interest: string
  notes: string
  paymentMethod: string
  account: string
  paymentDate: string
  status: 'pending' | 'paid'
  recurring: 'none' | 'weekly' | 'monthly' | 'yearly'
}

const CATEGORIES = [
  { id: 'rent', name: 'Aluguel' },
  { id: 'utilities', name: 'Utilidades' },
  { id: 'supplies', name: 'Suprimentos' },
  { id: 'services', name: 'Serviços' },
  { id: 'maintenance', name: 'Manutenção' },
  { id: 'salary', name: 'Folha de Pagamento' },
  { id: 'other', name: 'Outros' },
]

const SUBCATEGORIES: Record<string, Array<{ id: string; name: string }>> = {
  utilities: [
    { id: 'water', name: 'Água' },
    { id: 'electricity', name: 'Eletricidade' },
    { id: 'internet', name: 'Internet' },
  ],
  supplies: [
    { id: 'products', name: 'Produtos' },
    { id: 'equipment', name: 'Equipamentos' },
  ],
  services: [
    { id: 'cleaning', name: 'Limpeza' },
    { id: 'delivery', name: 'Entrega' },
  ],
}

export default function CriarDespesaPage() {
  const router = useRouter()
  const [form, setForm] = useState<ExpenseForm>({
    title: '',
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    dueDate: '',
    discount: '0',
    interest: '0',
    notes: '',
    paymentMethod: 'cash',
    account: '',
    paymentDate: '',
    status: 'pending',
    recurring: 'none',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const amount = parseFloat(form.amount) || 0
  const discount = parseFloat(form.discount) || 0
  const interest = parseFloat(form.interest) || 0
  const finalAmount = amount - discount + interest

  const subcategories = SUBCATEGORIES[form.category] || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.amount || !form.category || !form.dueDate) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    console.log('Despesa criada:', form, { finalAmount })
    router.back()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Despesa</h1>
          <p className="text-muted-foreground mt-2">
            Cadastre uma nova despesa (conta a pagar) da barbearia
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Informações da Despesa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Título / Descrição da Despesa *
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Aluguel mensal da loja"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição Detalhada</label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detalhes adicionais sobre a despesa..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Valor (R$) *</label>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data de Vencimento *</label>
                <Input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Categoria *</label>
                <Select value={form.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategoria</label>
                  <Select value={form.subcategory} onValueChange={(value) => handleSelectChange('subcategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Seção 2: Ajustes Financeiros */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Ajustes Financeiros</h2>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-2">Desconto (R$)</label>
                <Input
                  name="discount"
                  type="number"
                  step="0.01"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Juros (R$)</label>
                <Input
                  name="interest"
                  type="number"
                  step="0.01"
                  value={form.interest}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2">Valor Final</label>
                  <div className="bg-muted p-3 rounded-md text-lg font-bold text-green-600">
                    R$ {finalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observações</label>
              <Textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Notas adicionais..."
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Seção 3: Condição de Pagamento */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Condição de Pagamento</h2>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <Select value={form.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Conta Bancária</label>
                <Input
                  name="account"
                  value={form.account}
                  onChange={handleChange}
                  placeholder="Selecione uma conta"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={form.status} onValueChange={(value) => handleSelectChange('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Pagamento</label>
                  <Input
                    name="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Repetir Lançamento</label>
              <Select value={form.recurring} onValueChange={(value) => handleSelectChange('recurring', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (uso único)</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                  <SelectItem value="yearly">Anualmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-3 justify-end sticky bottom-0 bg-background p-4 border-t rounded-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4" />
            Salvar Despesa
          </Button>
        </div>
      </form>
    </div>
  )
}
