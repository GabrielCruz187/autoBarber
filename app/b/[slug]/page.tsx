import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookingPage } from "@/components/public/booking-page"

interface BarbershopPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ client_id?: string }>
}

export default async function BarbershopPage({ params, searchParams }: BarbershopPageProps) {
  const { slug } = await params
  await searchParams // mantém compatibilidade com Next.js 15
  const supabase = await createClient()

  // Buscar barbearia pelo slug
  const { data: barbershop, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !barbershop) {
    notFound()
  }

  // Buscar serviços ativos
  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, duration_minutes, price, category")
    .eq("barbershop_id", barbershop.id)
    .eq("is_active", true)
    .order("name")

  // Buscar barbeiros ativos
  const { data: barbers } = await supabase
    .from("barbers")
    .select("id, first_name, last_name, avatar_url, bio, specialties")
    .eq("barbershop_id", barbershop.id)
    .eq("is_active", true)
    .order("first_name")

  return (
    <BookingPage
      barbershop={{
        id: barbershop.id,
        name: barbershop.name,
        slug: barbershop.slug,
        description: barbershop.description ?? undefined,
        address: barbershop.address ?? undefined,
        phone: barbershop.phone ?? undefined,
        logo_url: barbershop.logo_url ?? undefined,
        cover_image_url: barbershop.cover_image_url ?? undefined,
        primary_color: barbershop.primary_color ?? undefined,
      }}
      services={services || []}
      barbers={barbers || []}
    />
  )
}

