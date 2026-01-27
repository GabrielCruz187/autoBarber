import type { WhatsAppMessage, ConversationState } from './types'
import { stateManager } from './state-manager'
import { whatsappClient } from './client'
import { handleSchedulingFlow } from './flows/scheduling-flow'
import { handleReportsFlow } from './flows/reports-flow'

export async function handleIncomingMessage(
  message: WhatsAppMessage,
  senderName: string,
  _phoneNumberId: string
): Promise<void> {
  const phoneNumber = message.from

  // Get or create conversation state
  const state = await stateManager.getOrCreateState(phoneNumber)

  // Extract message content
  const messageContent = extractMessageContent(message)

  console.log(`[MessageHandler] Processing message from ${phoneNumber}:`, {
    step: state.current_step,
    content: messageContent,
  })

  // Handle based on current state
  switch (state.current_step) {
    case 'idle':
      await handleIdleState(phoneNumber, senderName, messageContent, state)
      break

    case 'main_menu':
      await handleMainMenu(phoneNumber, messageContent, state)
      break

    // Scheduling flow steps
    case 'select_service':
    case 'select_barber':
    case 'select_date':
    case 'select_time':
    case 'confirm_appointment':
      await handleSchedulingFlow(phoneNumber, messageContent, state)
      break

    // Reports flow steps
    case 'reports_menu':
    case 'awaiting_report_query':
      await handleReportsFlow(phoneNumber, messageContent, state)
      break

    default:
      await sendGreeting(phoneNumber, senderName)
  }
}

function extractMessageContent(message: WhatsAppMessage): string {
  switch (message.type) {
    case 'text':
      return message.text?.body || ''

    case 'interactive':
      if (message.interactive?.type === 'button_reply') {
        return message.interactive.button_reply?.id || ''
      }
      if (message.interactive?.type === 'list_reply') {
        return message.interactive.list_reply?.id || ''
      }
      return ''

    case 'button':
      return message.button?.payload || message.button?.text || ''

    default:
      return ''
  }
}

async function handleIdleState(
  phoneNumber: string,
  senderName: string,
  _messageContent: string,
  _state: ConversationState
): Promise<void> {
  await sendGreeting(phoneNumber, senderName)
}

async function sendGreeting(phoneNumber: string, senderName: string): Promise<void> {
  await stateManager.setStep(phoneNumber, 'main_menu')

  await whatsappClient.sendButtons(
    phoneNumber,
    `Ola ${senderName}! Bem-vindo a nossa barbearia.\n\nComo posso ajudar voce hoje?`,
    [
      { id: 'schedule', title: 'Agendar horario' },
      { id: 'my_appointments', title: 'Meus agendamentos' },
      { id: 'reports', title: 'Relatorios' },
    ],
    'Barbearia Pro'
  )
}

async function handleMainMenu(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  const normalizedContent = messageContent.toLowerCase().trim()

  // Check for button responses or text matches
  if (normalizedContent === 'schedule' || normalizedContent.includes('agendar')) {
    await stateManager.setStep(phoneNumber, 'select_service')
    await handleSchedulingFlow(phoneNumber, 'start', state)
    return
  }

  if (normalizedContent === 'my_appointments' || normalizedContent.includes('meus agendamentos')) {
    // Show user's appointments
    await whatsappClient.sendText(
      phoneNumber,
      'Funcionalidade de consulta de agendamentos em desenvolvimento.'
    )
    await stateManager.setStep(phoneNumber, 'idle')
    return
  }

  if (normalizedContent === 'reports' || normalizedContent.includes('relatorio')) {
    // Check if user has permission for reports
    if (state.user_role === 'barber' || state.user_role === 'manager' || state.user_role === 'owner') {
      await stateManager.setStep(phoneNumber, 'reports_menu')
      await handleReportsFlow(phoneNumber, 'start', state)
    } else {
      await whatsappClient.sendText(
        phoneNumber,
        'Desculpe, voce nao tem permissao para acessar os relatorios.'
      )
      await stateManager.setStep(phoneNumber, 'idle')
    }
    return
  }

  // Invalid option - resend menu
  await whatsappClient.sendText(
    phoneNumber,
    'Desculpe, nao entendi. Por favor, escolha uma das opcoes abaixo:'
  )
  await sendGreeting(phoneNumber, 'Cliente')
}
