'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 glass">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">BarberPro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Funcionalidades", href: "#features" },
            { label: "Preços", href: "#pricing" },
            { label: "Sobre", href: "#about" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="text-gray-300 hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
            <Link href="/auth/login">Entrar</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600">
            <Link href="/auth/sign-up">Começar Grátis</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 glass-dark">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {[
              { label: "Funcionalidades", href: "#features" },
              { label: "Preços", href: "#pricing" },
              { label: "Sobre", href: "#about" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-300 hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-white/10">
              <Button asChild variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/20">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600">
                <Link href="/auth/sign-up">Começar Grátis</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
