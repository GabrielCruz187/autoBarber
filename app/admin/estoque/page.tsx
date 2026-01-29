import { AlertDescription } from "@/components/ui/alert"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { t } from "@/lib/i18n/useTranslation"
import { AlertTriangle } from "lucide-react"
import { Plus } from "lucide-react" // Added import for Plus
import { NovoProdutoDialog } from "@/components/admin/estoque/novo-produto-dialog"

export default async function EstoquePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("barbershop_id")
    .eq("id", user.id)
    .single()

  if (!profile?.barbershop_id) {
    redirect("/onboarding")
  }

  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("barbershop_id", profile.barbershop_id)
    .eq("ativo", true)
    .order("nome")

  const { data: movimentacoes } = await supabase
    .from("movimentacoes_estoque")
    .select("*")
    .eq("barbershop_id", profile.barbershop_id)
    .order("created_at", { ascending: false })
    .limit(10)

  const produtosBaixoEstoque = produtos?.filter(p => p.quantidade_atual <= p.quantidade_minima) || []
  const totalProdutos = produtos?.length || 0
  const valorTotalEstoque = produtos?.reduce((sum, p) => sum + (p.quantidade_atual * p.preco_custo), 0) || 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.menu.estoque}</h1>
          <p className="text-muted-foreground">Controle de estoque de produtos</p>
        </div>
        <NovoProdutoDialog />
      </div>
      <div className="flex justify-end">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.estoque.novoItem}
        </Button>
      </div>

      {produtosBaixoEstoque.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {produtosBaixoEstoque.length} produto(s) com estoque baixo
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.estoque.produtoBaixoEstoque}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{produtosBaixoEstoque.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotalEstoque)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categoria com Mais Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.estoque.listaEstoque}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.estoque.nomeProduto}</TableHead>
                  <TableHead>{t.estoque.categoria}</TableHead>
                  <TableHead>{t.estoque.quantidade}</TableHead>
                  <TableHead>{t.estoque.preco}</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos?.slice(0, 8).map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell>
                      {produto.quantidade_atual} {produto.unidade}
                    </TableCell>
                    <TableCell>{formatCurrency(produto.preco_venda)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        produto.quantidade_atual <= produto.quantidade_minima 
                          ? 'destructive' 
                          : 'default'
                      }>
                        {produto.quantidade_atual <= produto.quantidade_minima 
                          ? t.estoque.produtoBaixoEstoque
                          : 'OK'
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.estoque.movimentacoes}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>{t.estoque.quantidade}</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoes?.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-sm">-</TableCell>
                    <TableCell>{mov.quantidade}</TableCell>
                    <TableCell>
                      <Badge variant={mov.tipo === 'entrada' ? 'default' : 'destructive'}>
                        {mov.tipo === 'entrada' ? t.estoque.entrada : t.estoque.saida}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(mov.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
