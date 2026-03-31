'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AuthPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { slug } = await params
  
  return (
    <AuthContent slug={slug} />
  )
}

function AuthContent({ slug }: { slug: string }) {
  const [tab, setTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [barbershopId, setBarbershopId] = useState('')
  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
  })
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  })

  const router = useRouter()
  const searchParams = useSearchParams()

  // Buscar barbershop_id ao montar o componente
  useEffect(() => {
    const fetchBarbershopId = async () => {
      try {
        const res = await fetch(`/api/barbershop/${slug}`)
        const data = await res.json()
        if (data.id) {
          setBarbershopId(data.id)
        }
      } catch (error) {
        console.error('[v0] Erro ao buscar barbearia:', error)
      }
    }
    fetchBarbershopId()
  }, [slug])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.phone || !loginData.password) {
      toast.error('Erro', { description: 'Preencha todos os campos' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginData, barbershopId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      toast.success('Sucesso!', { description: 'Login realizado com sucesso' })
      
      // Salvar token e redirecionar para o painel
      localStorage.setItem('clientToken', data.token)
      localStorage.setItem('clientId', data.clientId)
      router.push(`/cliente/${slug}`)
    } catch (error) {
      toast.error('Erro', { description: error instanceof Error ? error.message : 'Erro ao fazer login' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signupData.firstName || !signupData.lastName || !signupData.phone || !signupData.cpf || !signupData.password) {
      toast.error('Erro', { description: 'Preencha todos os campos obrigatórios' })
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Erro', { description: 'As senhas não conferem' })
      return
    }

    if (signupData.password.length < 6) {
      toast.error('Erro', { description: 'Senha deve ter pelo menos 6 caracteres' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/client/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signupData, barbershopId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      toast.success('Sucesso!', { description: 'Conta criada com sucesso' })
      
      // Salvar token e redirecionar para o painel
      localStorage.setItem('clientToken', data.token)
      localStorage.setItem('clientId', data.clientId)
      router.push(`/cliente/${slug}`)
    } catch (error) {
      toast.error('Erro', { description: error instanceof Error ? error.message : 'Erro ao criar conta' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Acesso Cliente</CardTitle>
          <CardDescription>Faça login ou crie sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-phone">Telefone</Label>
                  <Input
                    id="login-phone"
                    placeholder="(11) 99999-9999"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-firstName">Primeiro Nome</Label>
                    <Input
                      id="signup-firstName"
                      placeholder="João"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-lastName">Sobrenome</Label>
                    <Input
                      id="signup-lastName"
                      placeholder="Silva"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-phone">Telefone</Label>
                  <Input
                    id="signup-phone"
                    placeholder="(11) 99999-9999"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-cpf">CPF</Label>
                  <Input
                    id="signup-cpf"
                    placeholder="000.000.000-00"
                    value={signupData.cpf}
                    onChange={(e) => setSignupData({ ...signupData, cpf: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="signup-confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
