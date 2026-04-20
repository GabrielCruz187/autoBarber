import type { ConversationState } from '../types'
import { stateManager } from '../state-manager'
import { whatsappClient } from '../client'
import {
  getServices,
  getBarbers,
  getAvailableSlots,
  createAppointment,
  getClientByPhone,
  createClient,
} from '../data-service'

export async function handleSchedulingFlow(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  switch (state.current_step) {
    case 'select_service':
      await handleServiceSelection(phoneNumber, messageContent, state)
      break

    case 'select_barber':
      await handleBarberSelection(phoneNumber, messageContent, state)
      break

    case 'select_date':
      await handleDateSelection(phoneNumber, messageContent, state)
      break

    case 'select_time':
      await handleTimeSelection(phoneNumber, messageContent, state)
      break

    case 'confirm_appointment':
      await handleAppointmentConfirmation(phoneNumber, messageContent, state)
      break

    default:
      await showServiceList(phoneNumber, state)
  }
}

async function handleServiceSelection(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  if (messageContent === 'start' || messageContent === '') {
    await showServiceList(phoneNumber, state)
    return
  }

  // Check if it's a service selection
  if (messageContent.startsWith('service_')) {
    const serviceId = messageContent.replace('service_', '')
    const services = await getServices(state.barbershop_id)
    const selectedService = services.find((s) => s.id === serviceId)

    if (selectedService) {
      await stateManager.updateContext(phoneNumber, {
        selected_service_id: serviceId,
        selected_service_name: selectedService.name,
      })
      await stateManager.setStep(phoneNumber, 'select_barber')
      await showBarberList(phoneNumber, state)
      return
    }
  }

  // Invalid selection
  await whatsappClient.sendText(phoneNumber, 'Servico nao encontrado. Por favor, escolha da lista:')
  await showServiceList(phoneNumber, state)
}

async function showServiceList(phoneNumber: string, state: ConversationState): Promise<void> {
  const services = await getServices(state.barbershop_id)

  if (services.length === 0) {
    await whatsappClient.sendText(
      phoneNumber,
      'Desculpe, nao ha servicos disponiveis no momento.'
    )
    await stateManager.setStep(phoneNumber, 'idle')
    return
  }

  const sections = [
    {
      title: 'Servicos Disponiveis',
      rows: services.slice(0, 10).map((service) => ({
        id: `service_${service.id}`,
        title: service.name.slice(0, 24),
        description: `R$ ${service.price.toFixed(2)} - ${service.duration_minutes}min`,
      })),
    },
  ]

  await whatsappClient.sendList(
    phoneNumber,
    'Qual servico voce deseja agendar?',
    'Ver Servicos',
    sections,
    'Escolha um Servico'
  )
}

async function handleBarberSelection(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  // Check for "any barber" selection
  if (messageContent === 'barber_any') {
    await stateManager.updateContext(phoneNumber, {
      selected_barber_id: undefined,
      selected_barber_name: 'Qualquer Barbeiro',
    })
    await stateManager.setStep(phoneNumber, 'select_date')
    await showDateOptions(phoneNumber)
    return
  }

  // Check for specific barber selection
  if (messageContent.startsWith('barber_')) {
    const barberId = messageContent.replace('barber_', '')
    const barbers = await getBarbers(state.barbershop_id)
    const selectedBarber = barbers.find((b) => b.id === barberId)

    if (selectedBarber) {
      await stateManager.updateContext(phoneNumber, {
        selected_barber_id: barberId,
        selected_barber_name: selectedBarber.name,
      })
      await stateManager.setStep(phoneNumber, 'select_date')
      await showDateOptions(phoneNumber)
      return
    }
  }

  // Show barber list
  await showBarberList(phoneNumber, state)
}

async function showBarberList(phoneNumber: string, state: ConversationState): Promise<void> {
  const barbers = await getBarbers(state.barbershop_id)

  if (barbers.length === 0) {
    await whatsappClient.sendText(
      phoneNumber,
      'Desculpe, nao ha barbeiros disponiveis no momento.'
    )
    await stateManager.setStep(phoneNumber, 'idle')
    return
  }

  const rows = [
    {
      id: 'barber_any',
      title: 'Qualquer Barbeiro',
      description: 'Primeiro disponivel',
    },
    ...barbers.slice(0, 9).map((barber) => ({
      id: `barber_${barber.id}`,
      title: barber.name.slice(0, 24),
      description: barber.bio?.slice(0, 72) || 'Barbeiro profissional',
    })),
  ]

  const sections = [
    {
      title: 'Barbeiros',
      rows,
    },
  ]

  await whatsappClient.sendList(
    phoneNumber,
    `Otimo! Voce escolheu: ${state.context.selected_service_name}\n\nAgora escolha um barbeiro:`,
    'Ver Barbeiros',
    sections,
    'Escolha um Barbeiro'
  )
}

async function showDateOptions(phoneNumber: string): Promise<void> {
  const today = new Date()
  const dates: { id: string; title: string }[] = []

  // Generate next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayNames = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
    const dayName = dayNames[date.getDay()]
    const dateStr = date.toISOString().split('T')[0]
    const displayDate = `${date.getDate()}/${date.getMonth() + 1}`

    dates.push({
      id: `date_${dateStr}`,
      title: i === 0 ? `Hoje (${displayDate})` : `${dayName} (${displayDate})`,
    })
  }

  const sections = [
    {
      title: 'Proximos Dias',
      rows: dates.map((d) => ({
        id: d.id,
        title: d.title,
        description: 'Verificar horarios disponiveis',
      })),
    },
  ]

  await whatsappClient.sendList(
    phoneNumber,
    'Qual data voce prefere?',
    'Ver Datas',
    sections,
    'Escolha uma Data'
  )
}

async function handleDateSelection(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  if (messageContent.startsWith('date_')) {
    const selectedDate = messageContent.replace('date_', '')
    await stateManager.updateContext(phoneNumber, {
      selected_date: selectedDate,
    })
    await stateManager.setStep(phoneNumber, 'select_time')
    await showTimeSlots(phoneNumber, state, selectedDate)
    return
  }

  // Invalid selection
  await showDateOptions(phoneNumber)
}

async function showTimeSlots(
  phoneNumber: string,
  state: ConversationState,
  selectedDate: string
): Promise<void> {
  const slots = await getAvailableSlots(
    state.barbershop_id,
    selectedDate,
    state.context.selected_barber_id,
    state.context.selected_service_id
  )

  if (slots.length === 0) {
    await whatsappClient.sendText(
      phoneNumber,
      'Desculpe, nao ha horarios disponiveis nesta data. Por favor, escolha outra data.'
    )
    await stateManager.setStep(phoneNumber, 'select_date')
    await showDateOptions(phoneNumber)
    return
  }

  await stateManager.updateContext(phoneNumber, {
    available_times: slots,
  })

  // Format date for display
  const [year, month, day] = selectedDate.split('-')
  const displayDate = `${day}/${month}/${year}`

  const sections = [
    {
      title: 'Horarios Disponiveis',
      rows: slots.slice(0, 10).map((slot) => ({
        id: `time_${slot}`,
        title: slot,
        description: `Horario disponivel em ${displayDate}`,
      })),
    },
  ]

  await whatsappClient.sendList(
    phoneNumber,
    `Horarios disponiveis para ${displayDate}:`,
    'Ver Horarios',
    sections,
    'Escolha um Horario'
  )
}

async function handleTimeSelection(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  if (messageContent.startsWith('time_')) {
    const selectedTime = messageContent.replace('time_', '')
    await stateManager.updateContext(phoneNumber, {
      selected_time: selectedTime,
    })
    await stateManager.setStep(phoneNumber, 'confirm_appointment')
    await showConfirmation(phoneNumber, state, selectedTime)
    return
  }

  // Invalid selection
  if (state.context.selected_date) {
    await showTimeSlots(phoneNumber, state, state.context.selected_date)
  }
}

async function showConfirmation(
  phoneNumber: string,
  state: ConversationState,
  selectedTime: string
): Promise<void> {
  const [year, month, day] = (state.context.selected_date || '').split('-')
  const displayDate = `${day}/${month}/${year}`

  const summary = `
*Confirme seu Agendamento:*

Servico: ${state.context.selected_service_name}
Barbeiro: ${state.context.selected_barber_name}
Data: ${displayDate}
Horario: ${selectedTime}

Deseja confirmar este agendamento?`

  await whatsappClient.sendButtons(
    phoneNumber,
    summary,
    [
      { id: 'confirm_yes', title: 'Confirmar' },
      { id: 'confirm_no', title: 'Cancelar' },
    ],
    'Confirmacao'
  )
}

async function handleAppointmentConfirmation(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  if (messageContent === 'confirm_yes') {
    try {
      // Get or create client
      let client = await getClientByPhone(state.barbershop_id, phoneNumber)
      if (!client) {
        client = await createClient(state.barbershop_id, phoneNumber)
      }

      // Create the appointment
      const appointment = await createAppointment({
        barbershop_id: state.barbershop_id,
        barber_id: state.context.selected_barber_id,
        client_id: client.id,
        service_id: state.context.selected_service_id!,
        scheduled_date: state.context.selected_date!,
        scheduled_time: state.context.selected_time!,
        client_phone: phoneNumber,
      })

      if (appointment) {
        const [year, month, day] = (state.context.selected_date || '').split('-')
        const displayDate = `${day}/${month}/${year}`

        await whatsappClient.sendText(
          phoneNumber,
          `*Agendamento Confirmado!*

Servico: ${state.context.selected_service_name}
Barbeiro: ${state.context.selected_barber_name}
Data: ${displayDate}
Horario: ${state.context.selected_time}

Aguardamos voce! Caso precise cancelar ou remarcar, entre em contato conosco.`
        )
      } else {
        await whatsappClient.sendText(
          phoneNumber,
          'Desculpe, ocorreu um erro ao criar o agendamento. Por favor, tente novamente.'
        )
      }
    } catch (error) {
      console.error('[SchedulingFlow] Error creating appointment:', error)
      await whatsappClient.sendText(
        phoneNumber,
        'Desculpe, ocorreu um erro ao criar o agendamento. Por favor, tente novamente.'
      )
    }

    await stateManager.resetState(phoneNumber)
    return
  }

  if (messageContent === 'confirm_no') {
    await whatsappClient.sendText(
      phoneNumber,
      'Agendamento cancelado. Se precisar de algo mais, e so me chamar!'
    )
    await stateManager.resetState(phoneNumber)
    return
  }

  // Re-show confirmation
  if (state.context.selected_time) {
    await showConfirmation(phoneNumber, state, state.context.selected_time)
  }
}
