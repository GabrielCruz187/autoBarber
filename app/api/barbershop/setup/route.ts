import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user already has a barbershop
    const { data: existingBarbershop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (existingBarbershop) {
      return NextResponse.json(
        { message: "Barbershop already exists", id: existingBarbershop.id },
        { status: 200 }
      )
    }

    // Get barbershop data from request body
    const body = await request.json()
    const {
      name,
      address,
      city,
      state,
      zip_code,
      country,
      phone,
      email,
      website,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Barbershop name is required" },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    // Create barbershop
    const { data: barbershop, error: barbershopError } = await supabase
      .from("barbershops")
      .insert({
        owner_id: user.id,
        name,
        slug: `${slug}-${Date.now()}`,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        country: country || null,
        phone: phone || null,
        email: email || user.email,
        website: website || null,
        timezone: "UTC",
        currency: "USD",
        is_active: true,
      })
      .select()
      .single()

    if (barbershopError) {
      console.error("Error creating barbershop:", barbershopError)
      return NextResponse.json(
        { error: "Failed to create barbershop" },
        { status: 500 }
      )
    }

    // Update user's profile with barbershop_id and owner role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        barbershop_id: barbershop.id,
        role: "owner",
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      // Don't fail if profile update fails, barbershop is created
    }

    // Create default services
    const defaultServices = [
      {
        name: "Haircut",
        description: "Classic haircut service",
        category: "Haircut",
        duration_minutes: 30,
        price: 25.0,
      },
      {
        name: "Beard Trim",
        description: "Professional beard trimming",
        category: "Beard",
        duration_minutes: 20,
        price: 15.0,
      },
      {
        name: "Fade",
        description: "Fade haircut with sharp lines",
        category: "Haircut",
        duration_minutes: 35,
        price: 30.0,
      },
      {
        name: "Full Grooming",
        description: "Haircut + beard + styling",
        category: "Package",
        duration_minutes: 60,
        price: 50.0,
      },
    ]

    const servicesData = defaultServices.map((service) => ({
      ...service,
      barbershop_id: barbershop.id,
      is_active: true,
    }))

    const { error: servicesError } = await supabase
      .from("services")
      .insert(servicesData)

    if (servicesError) {
      console.error("Error creating services:", servicesError)
    }

    // Create default working hours (Mon-Sat 9am-6pm)
    const workingHoursData = [
      { day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" },
      { day_of_week: 2, start_time: "09:00:00", end_time: "18:00:00" },
      { day_of_week: 3, start_time: "09:00:00", end_time: "18:00:00" },
      { day_of_week: 4, start_time: "09:00:00", end_time: "18:00:00" },
      { day_of_week: 5, start_time: "09:00:00", end_time: "18:00:00" },
      { day_of_week: 6, start_time: "09:00:00", end_time: "17:00:00" },
    ]

    const whData = workingHoursData.map((wh) => ({
      ...wh,
      barbershop_id: barbershop.id,
      is_available: true,
    }))

    const { error: whError } = await supabase
      .from("working_hours")
      .insert(whData)

    if (whError) {
      console.error("Error creating working hours:", whError)
    }

    return NextResponse.json(
      {
        message: "Barbershop created successfully",
        barbershop,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in barbershop setup:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
