'use client';

import { motion } from "framer-motion";
import { Bot, Calendar, Zap, TrendingUp, Gift, FileText } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agendamento Automático",
    description: "Seus clientes agendam pelo WhatsApp. Sem intermediários.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: Bot,
    title: "WhatsApp Bot Inteligente",
    description: "Lembretes, confirmações e suporte 24/7 automatizados.",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Gift,
    title: "Gamificação & Fidelização",
    description: "Recompense clientes com pontos e programa de fidelidade.",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: FileText,
    title: "Nota Fiscal Integrada",
    description: "Emissão automática de NFe sem burocracia.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Dashboard em Tempo Real",
    description: "Controle total do seu negócio em um só lugar.",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    icon: TrendingUp,
    title: "Análise & Relatórios",
    description: "Dados detalhados para tomar decisões melhores.",
    gradient: "from-yellow-500 to-yellow-600",
  },
];

export function DifferentialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-600/10 rounded-full mix-blend-screen blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-cyan-600/10 rounded-full mix-blend-screen blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Diferenciais que deixam
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              seus concorrentes para trás
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tecnologia premium desenvolvida especificamente para modernizar sua barbearia.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group glass p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                {/* Icon background */}
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Hover indicator */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-sm text-cyan-400 font-medium">Saiba mais →</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
