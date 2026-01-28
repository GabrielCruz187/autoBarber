'use client'

import { SupabaseClient } from '@supabase/supabase-js'

interface ConversationState {
  step: string
  data: {
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    selectedService?: string
    selectedDate?: string
    selectedTime?: string
  }
}

interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  type: 'text' | 'interactive' | 'button' | 'list'
  text?: { body: string }
  interactive?: {
    type: string
    button_reply?: { id: string; title: string }
    list_reply?: { id: string; title: string }
  }
}

export async function handleWhatsAppMessage(
  message: WhatsAppMessage,
  conversation: any,
  barbershopId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const flowState: ConversationState = conversation.flow_state || {
    step: 'greeting',
    data: {},
  }

  const phoneNumber = message.from
  let messageText = message.text?.body || ''

  // Get or create customer
  let { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name, email')
    .eq('barbershop_id', barbershopId)
    .eq('phone_number', phoneNumber)
    .single()

  // Process message based on current flow step
  let response = ''
  let nextStep = flowState.step

  switch (flowState.step) {
    case 'greeting':
      response = await greeting(barbershopId, supabase)
      nextStep = 'collect_name'
      break

    case 'collect_name':
      flowState.data.firstName = messageText.split(' ')[0]
      flowState.data.lastName = messageText.split(' ').slice(1).join(' ') || ''

      // Create customer if doesn't exist
      if (!customer) {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert({
            barbershop_id: barbershopId,
            phone_number: phoneNumber,
            first_name: flowState.data.firstName,
            last_name: flowState.data.lastName,
          })
          .select()
          .single()

        customer = newCustomer
      }

      response = `Prazer, ${flowState.data.firstName}! Qual seu email?`
      nextStep = 'collect_email'
      break

    case 'collect_email':
      flowState.data.email = messageText.trim()

      // Update customer
      await supabase
        .from('customers')
        .update({ email: messageText })
        .eq('id', customer?.id)

      response = `Perfeito! Qual serviço deseja agendar?\n\nNossos serviços:\n`
      const { data: services } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('barbershop_id', barbershopId)
        .eq('is_active', true)

      services?.forEach((service) => {
        response += `\n${service.name} - R$ ${service.price}`
      })

      nextStep = 'select_service'
      break

    case 'select_service':
      // Find service by name or number
      const { data: selectedService } = await supabase
        .from('services')
        .select('id, name, duration_minutes')
        .eq('barbershop_id', barbershopId)
        .ilike('name', `%${messageText}%`)
        .single()

      if (selectedService) {
        flowState.data.selectedService = selectedService.id
        response = `${selectedService.name} selecionado! Qual data você prefere?\n\nFormato: DD/MM/YYYY`
        nextStep = 'select_date'
      } else {
        response = `Serviço não encontrado. Por favor, selecione um dos nossos serviços.`
        nextStep = 'select_service'
      }
      break

    case 'select_date':
      flowState.data.selectedDate = messageText
      response = `Data ${messageText} confirmada! Que horário você prefere?\n\nOpções: 09:00, 10:00, 14:00, 15:00`
      nextStep = 'select_time'
      break

    case 'select_time':
      flowState.data.selectedTime = messageText.trim()

      // Create appointment
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          barbershop_id: barbershopId,
          customer_id: customer?.id,
          service_id: flowState.data.selectedService,
          start_time: `${flowState.data.selectedDate} ${flowState.data.selectedTime}`,
          end_time: `${flowState.data.selectedDate} ${flowState.data.selectedTime}`,
          status: 'pending',
          total_price: '0',
        })
        .select()
        .single()

      if (error || !appointment) {
        response = `Desculpe, houve um erro ao agendar. Tente novamente.`
        nextStep = 'select_time'
      } else {
        const accessToken = customer?.id
        const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meus-agendamentos?token=${customer?.id}`

        response = `✅ Agendamento confirmado!\n\nData: ${flowState.data.selectedDate}\nHorário: ${flowState.data.selectedTime}\n\nAcompanhe aqui: ${dashboardLink}`
        nextStep = 'completed'
      }
      break

    case 'completed':
      response = `Há algo mais em que eu possa ajudar?`
      nextStep = 'greeting'
      break

    default:
      response = `Desculpe, não entendi. Como posso ajudar?`
      nextStep = 'greeting'
  }

  // Update conversation state
  await supabase
    .from('whatsapp_conversations')
    .update({
      current_flow: nextStep,
      flow_state: flowState,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversation.id)

  return response
}

async function greeting(barbershopId: string, supabase: SupabaseClient): Promise<string> {
  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('name')
    .eq('id', barbershopId)
    .single()

  return `Olá! Bem-vindo(a) a ${barbershop?.name}! 👋\n\nPara começar, qual é o seu nome completo?`
}
