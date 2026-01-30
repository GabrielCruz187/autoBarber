import React from "react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Barbearia | BarberPro',
  description: 'Conheça os serviços e barbeiros de nossa barbearia',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
