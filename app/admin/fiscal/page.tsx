'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FiscalDashboard } from '@/components/admin/fiscal/fiscal-dashboard'
import { FiscalConfigForm } from '@/components/admin/fiscal/fiscal-config-form'
import { CertificateManager } from '@/components/admin/fiscal/certificate-manager'
import { InvoiceManager } from '@/components/admin/fiscal/invoice-manager'

export default function FiscalPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Módulo Fiscal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Emissão e gestão de notas fiscais (NFS-e e NF-e)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <FiscalDashboard />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Fiscal da Barbearia</CardTitle>
              <CardDescription>
                Defina os dados fiscais e configure o integrador de notas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FiscalConfigForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificados Digitais</CardTitle>
              <CardDescription>
                Faça upload e gerencie seus certificados A1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CertificateManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
