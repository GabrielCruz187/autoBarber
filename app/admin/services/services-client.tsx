"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ServiceDialog } from "@/components/admin/service-dialog"
import { Plus, MoreVertical, Pencil, Trash2, Clock, DollarSign, Briefcase } from "lucide-react"
import { toast } from "sonner"
import type { Service } from "@/lib/types"

interface ServicesClientProps {
  services: Service[]
  barbershopId: string
}

export function ServicesClient({ services, barbershopId }: ServicesClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedService) return

    const supabase = createClient()
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", selectedService.id)

    if (error) {
      toast.error("Failed to delete service: " + error.message)
      return
    }

    toast.success("Service deleted successfully")
    setDeleteDialogOpen(false)
    setSelectedService(null)
    router.refresh()
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedService(null)
  }

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "Other"
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your service menu and pricing</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add services to your menu so clients can book appointments.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-3">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((service) => (
                  <Card key={service.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{service.name}</CardTitle>
                          <Badge variant={service.is_active ? "default" : "secondary"} className="mt-1">
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedService(service)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {service.description && (
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{service.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        barbershopId={barbershopId}
        service={selectedService}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {"\""+selectedService?.name+"\""}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
