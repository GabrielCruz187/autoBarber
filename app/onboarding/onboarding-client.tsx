'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Scissors, MapPin, Phone, Palette, Clock, Users, ChevronRight, ChevronLeft } from 'lucide-react'

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
]

export function OnboardingClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('business')
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    barbershopName: '',
    address: '',
    city: '',
    phone: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#f97316',
    services: [
      { name: 'Haircut', category: 'Haircut', duration: 30, price: 25 },
      { name: 'Beard Trim', category: 'Beard', duration: 20, price: 15 },
      { name: 'Fade', category: 'Haircut', duration: 35, price: 30 },
    ],
    workingHours: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },
    ],
  })

  const handleSubmit = async () => {
    if (!formData.barbershopName.trim()) {
      toast({ title: 'Error', description: 'Barbershop name is required', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[v0] API response error:', data)
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      toast({ title: 'Success', description: 'Your barbershop is ready!' })
      router.push('/admin')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete setup. Please try again.'
      console.error('[v0] Onboarding error:', message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData({ ...formData, services: newServices })
  }

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', category: 'General', duration: 30, price: 0 }],
    })
  }

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    })
  }

  const updateWorkingHours = (index: number, field: string, value: any) => {
    const newHours = [...formData.workingHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setFormData({ ...formData, workingHours: newHours })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">BarberPro Setup</h1>
          </div>
          <p className="text-gray-600">Configure your barbershop and start accepting appointments</p>
        </div>

        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Scissors className="h-4 w-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Business</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Users className="h-4 w-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Services</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Hours</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="h-4 w-4 hidden sm:block" />
                <span className="text-xs sm:text-sm">Theme</span>
              </TabsTrigger>
            </TabsList>

            {/* Business Info */}
            <TabsContent value="business" className="space-y-4 p-6">
              <div>
                <Label>Barbershop Name *</Label>
                <Input
                  value={formData.barbershopName}
                  onChange={(e) => setFormData({ ...formData, barbershopName: e.target.value })}
                  placeholder="Your Barbershop"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </TabsContent>

            {/* Services */}
            <TabsContent value="services" className="space-y-4 p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.services.map((service, idx) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">Service {idx + 1}</h3>
                      {formData.services.length > 1 && (
                        <button
                          onClick={() => removeService(idx)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(idx, 'name', e.target.value)}
                          placeholder="e.g., Haircut"
                          size={30}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Category</Label>
                        <Input
                          value={service.category}
                          onChange={(e) => updateService(idx, 'category', e.target.value)}
                          placeholder="e.g., Haircut"
                          size={30}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Duration (min)</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(idx, 'duration', parseInt(e.target.value))}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Price ($)</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(idx, 'price', parseFloat(e.target.value))}
                          placeholder="25.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addService} variant="outline" className="w-full bg-transparent">
                Add Service
              </Button>
            </TabsContent>

            {/* Working Hours */}
            <TabsContent value="hours" className="space-y-4 p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.workingHours.map((hours, idx) => {
                  const day = DAYS.find((d) => d.value === hours.dayOfWeek)
                  return (
                    <div key={idx} className="flex items-center gap-3 pb-3 border-b">
                      <Label className="w-24 font-medium text-sm">{day?.label}</Label>
                      <input
                        type="checkbox"
                        checked={hours.isAvailable}
                        onChange={(e) => updateWorkingHours(idx, 'isAvailable', e.target.checked)}
                        className="w-4 h-4"
                      />
                      {hours.isAvailable && (
                        <>
                          <Input
                            type="time"
                            value={hours.startTime}
                            onChange={(e) => updateWorkingHours(idx, 'startTime', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <Input
                            type="time"
                            value={hours.endTime}
                            onChange={(e) => updateWorkingHours(idx, 'endTime', e.target.value)}
                            className="w-24"
                          />
                        </>
                      )}
                      {!hours.isAvailable && <span className="text-sm text-gray-500">Closed</span>}
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Colors */}
            <TabsContent value="colors" className="space-y-4 p-6">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#0ea5e9"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#f97316"
                  />
                </div>
              </div>
              <div className="mt-6 p-4 rounded bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">Preview</p>
                <div className="flex gap-3">
                  <div
                    className="w-24 h-24 rounded"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <div
                    className="w-24 h-24 rounded"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 p-6 border-t">
            <Button
              onClick={() => {
                const tabs = ['business', 'services', 'hours', 'colors']
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1])
              }}
              variant="outline"
              disabled={activeTab === 'business'}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={() => {
                const tabs = ['business', 'services', 'hours', 'colors']
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1])
                } else {
                  handleSubmit()
                }
              }}
              disabled={isLoading}
            >
              {activeTab === 'colors' ? 'Complete Setup' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
