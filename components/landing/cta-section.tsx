'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600 via-cyan-600 to-green-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-dark p-8 md:p-16 rounded-3xl border-2 border-gradient-to-r from-purple-500 to-cyan-500"
          style={{
            borderImage: "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%) 1",
          }}
        >
          {/* Icon */}
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Scissors className="h-8 w-8 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Sua barbearia merece
            <br />
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              estar no futuro
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
            Junte-se a centenas de barbearias que já estão crescendo exponencialmente com BarberPro.
          </p>

          {/* Benefits list */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
            {[
              "14 dias grátis",
              "Sem cartão de crédito",
              "Suporte em português",
              "Cancelamento a qualquer momento",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                {benefit}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="btn-glow px-8 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600">
              <Link href="/auth/sign-up">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 bg-white/5 hover:bg-white/10 border-white/20">
              <Link href="/auth/login">Já sou cliente</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
