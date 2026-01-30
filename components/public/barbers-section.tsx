import { Users } from "lucide-react"

interface BarbersectionProps {
  barbers: any[]
}

export function BarbersSection({ barbers }: BarbersectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-12">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Nossos Barbeiros</h2>
        </div>

        {barbers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-card rounded-lg overflow-hidden border hover:border-primary transition-colors"
              >
                {barber.avatar_url && (
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={barber.avatar_url || "/placeholder.svg"}
                      alt={`${barber.first_name} ${barber.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg">
                    {barber.first_name} {barber.last_name}
                  </h3>
                  {barber.bio && (
                    <p className="text-sm text-muted-foreground mb-3">{barber.bio}</p>
                  )}
                  {barber.specialties && barber.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {barber.specialties.map((specialty: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Barbeiros serão exibidos em breve
          </div>
        )}
      </div>
    </section>
  )
}
