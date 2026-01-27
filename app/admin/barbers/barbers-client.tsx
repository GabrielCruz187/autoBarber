"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { BarberDialog } from "@/components/admin/barber-dialog"
import { Plus, MoreVertical, Pencil, Trash2, Mail, Phone, Users } from "lucide-react"
import { toast } from "sonner"
import type { Barber } from "@/lib/types"

interface BarbersClientProps {
  barbers: Barber[]
  barbershopId: string
}

export function BarbersClient({ barbers, barbershopId }: BarbersClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)

  const handleEdit = (barber: Barber) => {
    setSelectedBarber(barber)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedBarber) return

    const supabase = createClient()
    const { error } = await supabase
      .from("barbers")
      .delete()
      .eq("id", selectedBarber.id)

    if (error) {
      toast.error("Failed to delete barber: " + error.message)
      return
    }

    toast.success("Barber deleted successfully")
    setDeleteDialogOpen(false)
    setSelectedBarber(null)
    router.refresh()
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedBarber(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barbers</h1>
          <p className="text-muted-foreground">Manage your barbershop team</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Barber
        </Button>
      </div>

      {barbers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No barbers yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first barber to start managing appointments.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Barber
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <Card key={barber.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {barber.first_name[0]}{barber.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {barber.first_name} {barber.last_name}
                      </CardTitle>
                      <Badge variant={barber.is_active ? "default" : "secondary"} className="mt-1">
                        {barber.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(barber)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBarber(barber)
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
                {barber.bio && (
                  <CardDescription className="line-clamp-2">{barber.bio}</CardDescription>
                )}
                {barber.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{barber.email}</span>
                  </div>
                )}
                {barber.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{barber.phone}</span>
                  </div>
                )}
                {barber.specialties && barber.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {barber.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {barber.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{barber.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BarberDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        barbershopId={barbershopId}
        barber={selectedBarber}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Barber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedBarber?.first_name} {selectedBarber?.last_name}? 
              This action cannot be undone and will remove all associated appointments.
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
