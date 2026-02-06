'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ClientSignupSectionProps {
  barbershop: any
}

export function ClientSignupSection({ barbershop }: ClientSignupSectionProps) {
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [clientData, setClientData] = useState({ name: '', phone: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientData.name || !clientData.phone) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershop_id: barbershop.id,
          first_name: clientData.name,
          phone: clientData.phone,
        }),
      })

      if (!response.ok) throw new Error('Erro ao cadastrar')

      toast.success('Cadastro realizado com sucesso!')
      setIsSignedUp(true)
    } catch (error) {
      toast.error('Erro ao cadastrar. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const whatsappUrl = `https://wa.me/${barbershop.phone?.replace(/\D/g, '')}?text=Olá! Gostaria de agendar um serviço.`

  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Agende Seu Horário</CardTitle>
              <CardDescription>
                Cadastre-se rapidamente para acessar o agendamento
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isSignedUp ? (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Seu Nome</Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      value={clientData.name}
                      onChange={(e) =>
                        setClientData({ ...clientData, name: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      type="tel"
                      value={clientData.phone}
                      onChange={(e) =>
                        setClientData({ ...clientData, phone: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Seus dados serão usados apenas para agendamento
                  </p>
                </form>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl">✨</div>
                    <h3 className="font-semibold text-lg">Cadastro Realizado!</h3>
                    <p className="text-sm text-muted-foreground">
                      Agora você pode agendar seu horário pelo WhatsApp
                    </p>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Abrir WhatsApp
                    </a>
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Fale com nosso bot para escolher data, hora e serviço.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

