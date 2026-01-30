import { MapPin, Phone, Mail, Facebook, Instagram, Smartphone } from "lucide-react"
import { t } from "@/lib/i18n/useTranslation"

interface BarbershopHeroProps {
  barbershop: any
}

export function BarbershopHero({ barbershop }: BarbershopHeroProps) {
  return (
    <div className="relative">
      {/* Cover Image */}
      {barbershop.cover_image_url && (
        <div className="h-64 md:h-80 w-full overflow-hidden">
          <img
            src={barbershop.cover_image_url || "/placeholder.svg"}
            alt={barbershop.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Barbershop Info */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
          {/* Logo */}
          {barbershop.logo_url && (
            <div className="md:-mt-24 flex-shrink-0">
              <img
                src={barbershop.logo_url || "/placeholder.svg"}
                alt={barbershop.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-lg shadow-lg object-cover border-4 border-background"
              />
            </div>
          )}

          {/* Name and Description */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{barbershop.name}</h1>
            <p className="text-lg text-muted-foreground">{barbershop.description}</p>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 py-8 border-y">
          {barbershop.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Endereço</p>
                <p className="text-sm text-muted-foreground">
                  {barbershop.address}
                  {barbershop.city && `, ${barbershop.city}`}
                  {barbershop.state && ` - ${barbershop.state}`}
                </p>
              </div>
            </div>
          )}

          {barbershop.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Telefone</p>
                <a href={`tel:${barbershop.phone}`} className="text-sm text-primary hover:underline">
                  {barbershop.phone}
                </a>
              </div>
            </div>
          )}

          {barbershop.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Email</p>
                <a href={`mailto:${barbershop.email}`} className="text-sm text-primary hover:underline">
                  {barbershop.email}
                </a>
              </div>
            </div>
          )}

          {barbershop.website && (
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Website</p>
                <a href={barbershop.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {barbershop.website}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Como Funciona</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold">Conheça Nossos Serviços</p>
                <p className="text-sm text-muted-foreground">Veja os serviços e os profissionais disponíveis</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold">Cadastre-se Rapidamente</p>
                <p className="text-sm text-muted-foreground">Preencha apenas seu nome e telefone</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold">Agende pelo WhatsApp</p>
                <p className="text-sm text-muted-foreground">Fale diretamente com nosso bot para marcar seu horário</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
