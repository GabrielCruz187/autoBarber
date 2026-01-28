'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BotStatus } from '@/components/admin/bot/bot-status'
import { BotConfiguration } from '@/components/admin/bot/bot-configuration'
import { BotMessages } from '@/components/admin/bot/bot-messages'
import { BotStatistics } from '@/components/admin/bot/bot-statistics'
import { MessageCircle, Settings, BarChart3, MessageSquare } from 'lucide-react'

export default function BotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Bot</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciar sua configuração de bot WhatsApp e conversar com clientes
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuração</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Mensagens</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Estatísticas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <BotStatus />
        </TabsContent>

        <TabsContent value="config">
          <BotConfiguration />
        </TabsContent>

        <TabsContent value="messages">
          <BotMessages />
        </TabsContent>

        <TabsContent value="stats">
          <BotStatistics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
