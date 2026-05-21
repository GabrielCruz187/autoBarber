'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, addDays, isSameDay, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Check, Scissors, Clock, MapPin, Phone, User, Calendar, Star } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Barbershop {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  logo_url?: string
  cover_image_url?: string
  primary_color?: string
}

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  category?: string
}

interface Barber {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  bio?: string
  specialties?: string[]
}

interface BookingPageProps {
  barbershop: Barbershop
  services: Service[]
  barbers: Barber[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatDuration = (min: number) =>
  min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}` : `${min}min`

const generateTimeSlots = (start = 8, end = 20, step = 30) => {
  const slots: string[] = []
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += step) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

const STEPS = ['Serviço', 'Profissional', 'Data & Hora', 'Seus Dados', 'Confirmado']

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 px-6 py-3">
      {Array.from({ length: total - 1 }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-500"
          style={{ background: i < step ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BookingPage({ barbershop, services, barbers }: BookingPageProps) {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [calendarStart, setCalendarStart] = useState(0) // offset de dias
  const [busySlots, setBusySlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)

  const accent = barbershop.primary_color || '#C9A84C'

  // Busca slots ocupados ao selecionar data + barbeiro
  useEffect(() => {
    if (!selectedDate || !selectedBarber || !selectedService) {
      setBusySlots([])
      return
    }
    setLoadingSlots(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    fetch(
      `/api/availability?barbershop_id=${barbershop.id}&barber_id=${selectedBarber.id}&date=${dateStr}&duration=${selectedService.duration_minutes}`
    )
      .then((r) => r.json())
      .then((data) => setBusySlots(data.busy_slots || []))
      .catch(() => setBusySlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, selectedBarber, selectedService, barbershop.id])

  const handleBook = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return
    setSubmitting(true)
    try {
      const startISO = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
      const startDate = new Date(startISO)
      const endDate = new Date(startDate.getTime() + selectedService.duration_minutes * 60_000)

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershop_id: barbershop.id,
          service_id: selectedService.id,
          barber_id: selectedBarber?.id || null,
          start_time: startISO,
          end_time: endDate.toISOString(),
          client_name: form.name,
          client_phone: form.phone,
          client_email: form.email || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao agendar')
      setBookingResult(data.appointment)
      setStep(4)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Gera os próximos 14 dias visíveis ──
  const visibleDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfDay(new Date()), calendarStart + i)
  )

  const allSlots = generateTimeSlots()

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #0f0f0f 0%, #1a1512 50%, #0f0f0f 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        '--accent': accent,
      } as React.CSSProperties}
    >
      {/* ── Hero Header ── */}
      <header className="relative overflow-hidden">
        {barbershop.cover_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${barbershop.cover_image_url})` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #0f0f0f)' }} />

        <div className="relative max-w-lg mx-auto px-5 pt-10 pb-6">
          <div className="flex items-center gap-4">
            {barbershop.logo_url ? (
              <img
                src={barbershop.logo_url}
                alt={barbershop.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2"
                style={{ ringColor: accent }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
              >
                <Scissors className="w-7 h-7" style={{ color: accent }} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{barbershop.name}</h1>
              {barbershop.address && (
                <p className="text-sm text-white/50 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {barbershop.address}
                </p>
              )}
            </div>
          </div>

          {barbershop.description && (
            <p className="mt-4 text-sm text-white/60 leading-relaxed">{barbershop.description}</p>
          )}
        </div>
      </header>

      {/* ── Booking Card ── */}
      <main className="max-w-lg mx-auto px-4 pb-16">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Step label */}
          {step < 4 && (
            <div className="px-5 pt-5 pb-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                Passo {step + 1} de {STEPS.length - 1}
              </p>
              <h2 className="text-xl font-bold text-white mt-1">{STEPS[step]}</h2>
            </div>
          )}

          {step < 4 && <StepBar step={step} total={STEPS.length} />}

          <div className="px-5 pb-6">

            {/* ── STEP 0: Serviço ── */}
            {step === 0 && (
              <div className="space-y-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(1) }}
                    className="w-full text-left rounded-xl p-4 transition-all duration-200 group"
                    style={{
                      background: selectedService?.id === s.id
                        ? `${accent}18`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedService?.id === s.id ? accent : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{s.name}</p>
                        {s.description && (
                          <p className="text-sm text-white/50 mt-0.5 line-clamp-1">{s.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-white/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDuration(s.duration_minutes)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg" style={{ color: accent }}>
                          {formatCurrency(Number(s.price))}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── STEP 1: Barbeiro ── */}
            {step === 1 && (
              <div className="space-y-3">
                {barbers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBarber(b); setStep(2) }}
                    className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all duration-200"
                    style={{
                      background: selectedBarber?.id === b.id
                        ? `${accent}18`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedBarber?.id === b.id ? accent : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {b.avatar_url ? (
                      <img src={b.avatar_url} alt={b.first_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ background: `${accent}22`, color: accent }}
                      >
                        {b.first_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{b.first_name} {b.last_name}</p>
                      {b.bio && <p className="text-sm text-white/50 mt-0.5 line-clamp-1">{b.bio}</p>}
                      {b.specialties && b.specialties.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {b.specialties.slice(0, 3).map((sp) => (
                            <span
                              key={sp}
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: `${accent}20`, color: accent }}
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedBarber(null)
                    setStep(2)
                  }}
                  className="w-full text-center py-3 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors"
                  style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
                >
                  Sem preferência — qualquer barbeiro
                </button>
              </div>
            )}

            {/* ── STEP 2: Data & Hora ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Calendário horizontal */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white/70">Escolha o dia</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCalendarStart(Math.max(0, calendarStart - 7))}
                        disabled={calendarStart === 0}
                        className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-opacity"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setCalendarStart(calendarStart + 7)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {visibleDays.map((day) => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate)
                      const isToday = isSameDay(day, new Date())
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => { setSelectedDate(day); setSelectedTime(null) }}
                          className="flex flex-col items-center py-2.5 rounded-xl transition-all duration-200"
                          style={{
                            background: isSelected ? accent : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isSelected ? accent : isToday ? `${accent}44` : 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? '#000' : 'rgba(255,255,255,0.4)' }}>
                            {format(day, 'EEE', { locale: ptBR })}
                          </span>
                          <span className="text-base font-bold mt-0.5" style={{ color: isSelected ? '#000' : 'white' }}>
                            {format(day, 'd')}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Grade de horários */}
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-3">
                      {loadingSlots ? 'Verificando disponibilidade...' : 'Escolha o horário'}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {allSlots.map((slot) => {
                        const isBusy = busySlots.includes(slot)
                        const isSelected = selectedTime === slot
                        return (
                          <button
                            key={slot}
                            disabled={isBusy || loadingSlots}
                            onClick={() => setSelectedTime(slot)}
                            className="py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                              background: isSelected ? accent : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${isSelected ? accent : 'rgba(255,255,255,0.08)'}`,
                              color: isSelected ? '#000' : isBusy ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.8)',
                              textDecoration: isBusy ? 'line-through' : 'none',
                            }}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <button
                    onClick={() => setStep(3)}
                    className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: accent, color: '#000' }}
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 3: Dados pessoais ── */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Resumo mini */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Serviço</span>
                    <span className="text-white font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Profissional</span>
                    <span className="text-white font-medium">
                      {selectedBarber ? `${selectedBarber.first_name} ${selectedBarber.last_name}` : 'Qualquer'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Data & Hora</span>
                    <span className="text-white font-medium">
                      {selectedDate && format(selectedDate, "dd 'de' MMM", { locale: ptBR })} às {selectedTime}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-white/50 text-sm">Total</span>
                    <span className="font-bold" style={{ color: accent }}>
                      {selectedService && formatCurrency(Number(selectedService.price))}
                    </span>
                  </div>
                </div>

                {/* Formulário */}
                <div className="space-y-3">
                  {[
                    { key: 'name', label: 'Seu nome', placeholder: 'João Silva', type: 'text', required: true },
                    { key: 'phone', label: 'WhatsApp', placeholder: '(11) 99999-9999', type: 'tel', required: true },
                    { key: 'email', label: 'E-mail (opcional)', placeholder: 'joao@email.com', type: 'email', required: false },
                  ].map(({ key, label, placeholder, type, required }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">
                        {label} {required && <span style={{ color: accent }}>*</span>}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        required={required}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = accent
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleBook}
                  disabled={submitting || !form.name || !form.phone}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: accent, color: '#000' }}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                </button>

                <p className="text-center text-xs text-white/30">
                  Seus dados são usados apenas para este agendamento
                </p>
              </div>
            )}

            {/* ── STEP 4: Confirmado ── */}
            {step === 4 && (
              <div className="py-6 text-center space-y-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: `${accent}22`, border: `2px solid ${accent}` }}
                >
                  <Check className="w-9 h-9" style={{ color: accent }} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white">Agendado!</h2>
                  <p className="text-white/50 mt-1 text-sm">
                    Tudo certo, {form.name.split(' ')[0]}. Te esperamos!
                  </p>
                </div>

                <div
                  className="rounded-2xl p-5 text-left space-y-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {[
                    { icon: Scissors, label: selectedService?.name },
                    {
                      icon: User,
                      label: selectedBarber
                        ? `${selectedBarber.first_name} ${selectedBarber.last_name}`
                        : 'Qualquer barbeiro',
                    },
                    {
                      icon: Calendar,
                      label: selectedDate
                        ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                        : '',
                    },
                    { icon: Clock, label: `${selectedTime} · ${selectedService && formatDuration(selectedService.duration_minutes)}` },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: accent }} />
                      <span className="text-sm text-white/80">{label}</span>
                    </div>
                  ))}
                </div>

                {barbershop.phone && (
                  <a
                    href={`https://wa.me/55${barbershop.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: '#25D366', color: '#fff' }}
                  >
                    <Phone className="w-4 h-4" /> Falar no WhatsApp
                  </a>
                )}

                <button
                  onClick={() => {
                    setStep(0)
                    setSelectedService(null)
                    setSelectedBarber(null)
                    setSelectedDate(null)
                    setSelectedTime(null)
                    setForm({ name: '', phone: '', email: '' })
                  }}
                  className="text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Fazer outro agendamento
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Back button */}
        {step > 0 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mt-4 mx-auto"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #1a1512 inset !important; -webkit-text-fill-color: white !important; }
      `}</style>
    </div>
  )
}