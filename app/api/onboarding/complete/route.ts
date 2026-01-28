import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      barbershopName,
      address,
      city,
      phone,
      primaryColor,
      secondaryColor,
      services,
      workingHours,
    } = body

    // Create barbershop
    const { data: barbershop, error: shopError } = await supabase
      .from("barbershops")
      .insert({
        owner_id: user.id,
        name: barbershopName,
        slug: `${barbershopName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}-${Date.now()}`,
        address: address || null,
        city: city || null,
        phone: phone || null,
        primary_color: primaryColor || "#0ea5e9",
        secondary_color: secondaryColor || "#f97316",
        timezone: "UTC",
        currency: "USD",
        is_active: true,
      })
      .select()
      .single()

    if (shopError || !barbershop) {
      console.error("[v0] Barbershop creation error:", shopError)
      return NextResponse.json(
        { 
          error: "Failed to create barbershop",
          details: shopError?.message || "Unknown error"
        },
        { status: 500 }
      )
    }

    // Create services
    if (services && services.length > 0) {
      const servicesData = services.map((service: any) => ({
        barbershop_id: barbershop.id,
        name: service.name,
        description: service.description || null,
        category: service.category || "General",
        duration_minutes: service.duration || 30,
        price: String(service.price || 0),
        is_active: true,
      }))

      const { error: servicesError } = await supabase
        .from("services")
        .insert(servicesData)

      if (servicesError) {
        console.error("[v0] Services creation error:", servicesError)
        // Don't fail the whole request if services fail
      }
    }

    // Create working hours
    if (workingHours && workingHours.length > 0) {
      const whData = workingHours.map((wh: any) => ({
        barbershop_id: barbershop.id,
        day_of_week: wh.dayOfWeek,
        start_time: wh.startTime,
        end_time: wh.endTime,
        is_available: wh.isAvailable !== false,
      }))

      const { error: whError } = await supabase
        .from("working_hours")
        .insert(whData)

      if (whError) {
        console.error("[v0] Working hours creation error:", whError)
        // Don't fail the whole request if working hours fail
      }
    }

    // Update profile with barbershop_id and mark as onboarded
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        barbershop_id: barbershop.id,
        role: "owner",
        onboarded: true,
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("[v0] Profile update error:", profileError)
      // Don't fail if profile update fails - barbershop was created
    }

    return NextResponse.json({
      success: true,
      barbershop: {
        id: barbershop.id,
        name: barbershop.name,
      },
    })
  } catch (error) {
    console.error("[v0] Onboarding error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
