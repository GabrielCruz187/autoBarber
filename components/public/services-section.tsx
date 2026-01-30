import { Scissors } from "lucide-react"

interface ServicesSectionProps {
  services: any[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const groupedByCategory = services.reduce((acc: any, service: any) => {
    const category = service.category || "Serviços"
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {})

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-12">
          <Scissors className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Nossos Serviços</h2>
        </div>

        <div className="space-y-12">
          {Object.entries(groupedByCategory).map(([category, items]: any) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-6 text-muted-foreground">{category}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map((service: any) => (
                  <div
                    key={service.id}
                    className="bg-card rounded-lg p-6 border hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <p className="text-xl font-bold text-primary">
                        R$ {parseFloat(service.price).toFixed(2)}
                      </p>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ⏱️ {service.duration_minutes} minutos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Serviços serão exibidos em breve
          </div>
        )}
      </div>
    </section>
  )
}
