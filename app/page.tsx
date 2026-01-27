import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scissors, Calendar, Users, BarChart3, ArrowRight, CheckCircle } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect to admin
  if (user) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BarberPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Professional Barbershop
            <br />
            <span className="text-primary">Management Software</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Streamline your barbershop operations with our all-in-one platform. 
            Manage appointments, barbers, clients, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/auth/login">Sign in to your account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to run your barbershop
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-lg p-6 border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Manage appointments effortlessly with our intuitive calendar system.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Management</h3>
              <p className="text-muted-foreground">
                Track barber schedules, performance, and commissions in one place.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Service Menu</h3>
              <p className="text-muted-foreground">
                Customize your services, prices, and durations with ease.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground">
                Get insights into revenue, bookings, and client trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why barbershops choose BarberPro
            </h2>
            <div className="space-y-4">
              {[
                "Easy online booking for your clients",
                "Reduce no-shows with automated reminders",
                "Track revenue and performance metrics",
                "Manage multiple barbers and locations",
                "Client history and preferences at your fingertips",
                "Works on desktop, tablet, and mobile",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your barbershop?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of barbershops already using BarberPro to streamline their business.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">BarberPro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BarberPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
