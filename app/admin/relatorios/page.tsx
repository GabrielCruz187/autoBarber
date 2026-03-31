'use client'

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { t } from "@/lib/i18n/useTranslation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function RelatoriosPage() {
  const [barbershopId, setBarbershopId] = useState('')
  const [relatorios, setRelatorios] = useState<any>({
    bebidas: [],
    produtos: [],
    servicos: [],
    gastos: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const response = await fetch('/api/admin/relatorios')
      if (!response.ok) throw new Error('Erro ao carregar relatórios')
      
      const data = await response.json()
      console.log("[v0] Dados carregados:", data)
      setRelatorios(data)
      setBarbershopId(data.barbershopId)
    } catch (error) {
      console.error("[v0] Erro ao carregar:", error)
      toast.error("Erro", { description: "Erro ao carregar relatórios" })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.menu.relatorios}</h1>
        <p className="text-muted-foreground">Visualize relatórios detalhados do seu negócio</p>
      </div>

      <Tabs defaultValue="bebidas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bebidas">Bebidas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
        </TabsList>

        {/* BEBIDAS */}
        <TabsContent value="bebidas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    relatorios.bebidas?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantidade Vendida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.bebidas?.reduce((sum: number, item: any) => sum + (item.quantidade || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tipos de Bebida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.bebidas?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {relatorios.bebidas?.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={relatorios.bebidas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="total" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes por Bebida</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bebida</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorios.bebidas?.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{formatCurrency(item.preco_unitario || 0)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* PRODUTOS */}
        <TabsContent value="produtos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    relatorios.produtos?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantidade Vendida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.produtos?.reduce((sum: number, item: any) => sum + (item.quantidade || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tipos de Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.produtos?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {relatorios.produtos?.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={relatorios.produtos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="total" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorios.produtos?.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{formatCurrency(item.preco_unitario || 0)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* SERVIÇOS */}
        <TabsContent value="servicos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    relatorios.servicos?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.servicos?.reduce((sum: number, item: any) => sum + (item.quantidade || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tipos de Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.servicos?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {relatorios.servicos?.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Faturamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={relatorios.servicos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="total" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes por Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorios.servicos?.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{formatCurrency(item.preco_unitario || 0)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* GASTOS */}
        <TabsContent value="gastos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    relatorios.gastos?.reduce((sum: number, item: any) => sum + (item.valor || 0), 0) || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantidade de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {relatorios.gastos?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gasto Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    (relatorios.gastos?.reduce((sum: number, item: any) => sum + (item.valor || 0), 0) || 0) / 
                    (relatorios.gastos?.length || 1)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {relatorios.gastos?.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={relatorios.gastos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="valor" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorios.gastos?.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.categoria}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>{new Date(item.data).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="font-bold text-red-600">{formatCurrency(item.valor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
