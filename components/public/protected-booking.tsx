'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Lock, LogOut, Calendar, Gift, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProtectedBookingProps {
  slug: string
  children: React.ReactNode
}

export function ProtectedBooking({ slug, children }: ProtectedBookingProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [clientData, setClientData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('clientToken')
        const clientId = localStorage.getItem('clientId')
        
        if (token && clientId) {
          setIsAuthenticated(true)
          // Carregar dados do dashboard
          await loadDashboard(token, clientId)
        }
      } catch (error) {
        console.error('[v0] Erro ao verificar autenticação:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  const loadDashboard = async (token: string, clientId: string) => {
    try {
      setIsLoadingDashboard(true)
      const response = await fetch(`/api/client/dashboard?clientId=${clientId}&slug=${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard')
      }

      const data = await response.json()
      setClientData(data.client)
      setAppointments(data.appointments || [])
      setPlans(data.plans || [])
    } catch (error) {
      console.error('[v0] Erro ao carregar dashboard:', error)
      toast.error('Erro', { description: 'Erro ao carregar dados' })
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clientToken')
    localStorage.removeItem('clientId')
    setIsAuthenticated(false)
    setClientData(null)
    setAppointments([])
    setPlans([])
    setActiveTab('dashboard')
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Faça Login para Agendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Para marcar um horário você precisa ter uma conta. Faça login ou crie uma nova conta.
            </p>
            <Button 
              onClick={() => router.push(`/b/${slug}/auth`)}
              className="w-full"
            >
              Ir para Login/Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard do cliente autenticado
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Bem-vindo, {clientData?.first_name}!
            </h1>
            <p className="text-muted-foreground">
              {clientData?.phone}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <Calendar className="h-4 w-4" />
              Meu Painel
            </TabsTrigger>
            <TabsTrigger value="booking" className="gap-2">
              <Calendar className="h-4 w-4" />
              Novo Agendamento
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Próximos Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments?.filter(a => new Date(a.date) > new Date()).length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Agendamentos Realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments?.filter(a => new Date(a.date) < new Date()).length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Planos Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {plans?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Meus Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{apt.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                          </p>
                        </div>
                        <Badge variant={new Date(apt.date) > new Date() ? 'default' : 'secondary'}>
                          {new Date(apt.date) > new Date() ? 'Próximo' : 'Finalizado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum agendamento encontrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Planos */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                {plans && plans.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {plans.map((plan: any) => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{plan.nome}</h3>
                          <span className="text-lg font-bold">
                            R$ {plan.preco.toFixed(2)}
                          </span>
                        </div>
                        {plan.descricao && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {plan.descricao}
                          </p>
                        )}
                        {plan.servicos_inclusos && (
                          <p className="text-sm font-medium mb-2">
                            {plan.servicos_inclusos} serviços inclusos
                          </p>
                        )}
                        <Button className="w-full mt-2" size="sm">
                          Contratar Plano
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum plano disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking">
            {children}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Meus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">Nome</p>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.first_name} {clientData?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Telefone</p>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">CPF</p>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.cpf || 'Não informado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
