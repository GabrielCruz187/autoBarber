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
      router.push(`/b/${slug}`)
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
      router.push(`/b/${slug}`)
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      ou
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const whatsappMessage = encodeURIComponent(
                      `Oi! Gostaria de agendar um horário e criar minha conta pelo WhatsApp. Meu nome é ${signupData.firstName} ${signupData.lastName}, telefone: ${signupData.phone}, CPF: ${signupData.cpf}`
                    )
                    window.open(
                      `https://wa.me/?text=${whatsappMessage}`,
                      '_blank'
                    )
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.998 1.523c-1.545.944-2.798 2.418-3.594 4.032-.862 1.815-1.242 3.74-1.048 5.66.194 1.92 1.01 3.73 2.354 5.148.783.884 1.77 1.568 2.89 2.003.277.108.564.207.851.295 1.32.408 2.764.358 4.038-.134 1.28-.5 2.38-1.494 3.058-2.733l.316-.611.635.411c1.024.663 2.145 1.122 3.33 1.338 1.184.216 2.414.136 3.552-.273 1.137-.409 2.13-1.224 2.774-2.252.537-.84.872-1.835.98-2.873.129-1.254-.002-2.533-.376-3.737-.374-1.204-.978-2.306-1.798-3.23-.82-.924-1.889-1.677-3.09-2.2-1.2-.522-2.516-.74-3.849-.634-1.308.108-2.545.56-3.582 1.333l-.61.387z" />
                  </svg>
                  Agendar via WhatsApp
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

