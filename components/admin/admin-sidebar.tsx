"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Scissors,
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Trophy,
  FileText,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { t } from "@/lib/i18n/useTranslation"

const navigation = [
  { name: t.menu.dashboard, href: "/admin", icon: LayoutDashboard },
  { name: t.menu.agendamentos, href: "/admin/appointments", icon: Calendar },
  { name: t.menu.barbeiros, href: "/admin/barbers", icon: Users },
  { name: t.menu.servicos, href: "/admin/services", icon: Briefcase },
  { name: t.menu.clientes, href: "/admin/clients", icon: UserCircle },
  { name: t.menu.caixa, href: "/admin/caixa", icon: FileText },
  { name: t.menu.comandas, href: "/admin/comandas", icon: FileText },
  { name: t.menu.financeiro, href: "/admin/financeiro", icon: FileText },
  { name: t.menu.estoque, href: "/admin/estoque", icon: FileText },
  { name: t.menu.assinaturas, href: "/admin/assinaturas", icon: FileText },
  { name: t.menu.botWhatsapp, href: "/admin/bot", icon: MessageCircle },
  { name: t.menu.gamificacao, href: "/admin/gamification", icon: Trophy },
  { name: t.menu.fiscal, href: "/admin/fiscal", icon: FileText },
  { name: t.menu.relatorios, href: "/admin/relatorios", icon: FileText },
  { name: t.menu.configuracoes, href: "/admin/settings", icon: Settings },
]

interface AdminSidebarProps {
  barbershopName?: string
  userEmail?: string
}

export function AdminSidebar({ barbershopName = "BarberPro", userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(t.common.sair)
    router.push("/auth/login")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Scissors className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">{barbershopName}</span>
      </div>
      
      <ScrollArea className="flex-1 overflow-hidden">
        <nav className="space-y-1 px-3 py-4 pr-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {userEmail}
          </span>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar - sempre visível */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-card border-r">
        <SidebarContent />
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed right-4 top-4 z-40 md:hidden"
      >
        {mobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
