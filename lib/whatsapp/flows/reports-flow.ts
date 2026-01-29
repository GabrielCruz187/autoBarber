import type { ConversationState } from '../types'
import { stateManager } from '../state-menager'
import { whatsappClient } from '../client'
import {
  getDailyRevenue,
  getWeeklyCommission,
  getBarberRevenue,
  getBarberByPhone,
  getBarberByName,
  getBarbers,
} from '../data-service'

export async function handleReportsFlow(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  switch (state.current_step) {
    case 'reports_menu':
      await handleReportsMenu(phoneNumber, messageContent, state)
      break

    case 'awaiting_report_query':
      await handleReportQuery(phoneNumber, messageContent, state)
      break

    default:
      await showReportsMenu(phoneNumber, state)
  }
}

async function handleReportsMenu(
  phoneNumber: string,
  messageContent: string,
  state: ConversationState
): Promise<void> {
  if (messageContent === 'start' || messageContent === '') {
    await showReportsMenu(phoneNumber, state)
    return
  }

  // Handle menu selections
  switch (messageContent) {
    case 'report_today':
      await sendTodayReport(phoneNumber, state)
      break

    case 'report_my_commission':
      await sendMyCommission(phoneNumber, state)
      break

    case 'report_query':
      await stateManager.setStep(phoneNumber, 'awaiting_report_query')
      await whatsappClient.sendText(
        phoneNumber,
        `Voce pode me perguntar coisas como:

- "Quanto faturei hoje"
- "Minha comissao da semana"
- "Quanto o Joao faturou"
- "O que vendeu ontem"
- "Faturamento do mes"

Digite sua pergunta:`
      )
      break

    case 'report_back':
      await stateManager.setStep(phoneNumber, 'idle')
      await whatsappClient.sendText(phoneNumber, 'Ok! Se precisar de mais alguma coisa, e so chamar.')
      break

    default:
      // Try to interpret as a natural language query
      await handleReportQuery(phoneNumber, messageContent, state)
  }
}

async function showReportsMenu(phoneNumber: string, state: ConversationState): Promise<void> {
  const isBarber = state.user_role === 'barber'
  const isAdmin = state.user_role === 'manager' || state.user_role === 'owner'

  let menuText = '*Menu de Relatorios*\n\nEscolha uma opcao:'
  const buttons: { id: string; title: string }[] = []

  if (isBarber || isAdmin) {
    buttons.push({ id: 'report_today', title: 'Faturamento Hoje' })
    buttons.push({ id: 'report_my_commission', title: 'Minha Comissao' })
  }

  buttons.push({ id: 'report_query', title: 'Fazer Pergunta' })

  if (buttons.length === 0) {
    await whatsappClient.sendText(
      phoneNumber,
      'Voce nao tem permissao para acessar os relatorios.'
    )
    await stateManager.setStep(phoneNumber, 'idle')
    return
  }

  await whatsappClient.sendButtons(phoneNumber, menuText, buttons.slice(0, 3), 'Relatorios')
}

async function sendTodayReport(phoneNumber: string, state: ConversationState): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // If user is a barber, show only their stats
  const barberId = state.user_role === 'barber' ? state.barber_id || undefined : undefined

  const report = await getDailyRevenue(state.barbershop_id, today, barberId)

  const [year, month, day] = today.split('-')
  const displayDate = `${day}/${month}/${year}`

  let message = `*Relatorio de ${displayDate}*\n\n`

  if (state.user_role === 'barber') {
    message += `Seus resultados de hoje:\n\n`
  }

  message += `Total Faturado: R$ ${report.total_revenue.toFixed(2)}\n`
  message += `Atendimentos: ${report.completed_appointments}\n`

  if (report.cancelled_appointments > 0) {
    message += `Cancelamentos: ${report.cancelled_appointments}\n`
  }

  if (report.services_breakdown.length > 0) {
    message += `\n*Servicos:*\n`
    for (const service of report.services_breakdown) {
      message += `- ${service.service_name}: ${service.count}x (R$ ${service.revenue.toFixed(2)})\n`
    }
  }

  await whatsappClient.sendText(phoneNumber, message)
  await showReportsMenu(phoneNumber, state)
}

async function sendMyCommission(phoneNumber: string, state: ConversationState): Promise<void> {
  if (!state.barber_id) {
    // Try to find barber by phone
    const barber = await getBarberByPhone(state.barbershop_id, phoneNumber)
    if (barber) {
      await stateManager.updateState(phoneNumber, { barber_id: barber.id })
      state.barber_id = barber.id
    } else {
      await whatsappClient.sendText(
        phoneNumber,
        'Nao foi possivel identificar seu cadastro de barbeiro.'
      )
      await showReportsMenu(phoneNumber, state)
      return
    }
  }

  const commission = await getWeeklyCommission(state.barbershop_id, state.barber_id)

  const message = `*Sua Comissao da Semana*\n\n` +
    `Faturamento Total: R$ ${commission.total_revenue.toFixed(2)}\n` +
    `Sua Comissao: R$ ${commission.commission.toFixed(2)}\n` +
    `Atendimentos: ${commission.appointments}`

  await whatsappClient.sendText(phoneNumber, message)
  await showReportsMenu(phoneNumber, state)
}

async function handleReportQuery(
  phoneNumber: string,
  query: string,
  state: ConversationState
): Promise<void> {
  const normalizedQuery = query.toLowerCase().trim()

  // Parse natural language queries
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  // Check for "quanto faturei" or similar patterns
  if (
    normalizedQuery.includes('faturei') ||
    normalizedQuery.includes('meu faturamento') ||
    normalizedQuery.includes('minha receita')
  ) {
    if (!state.barber_id) {
      const barber = await getBarberByPhone(state.barbershop_id, phoneNumber)
      if (barber) {
        state.barber_id = barber.id
        await stateManager.updateState(phoneNumber, { barber_id: barber.id })
      }
    }

    if (!state.barber_id) {
      await whatsappClient.sendText(
        phoneNumber,
        'Nao foi possivel identificar seu cadastro de barbeiro.'
      )
      return
    }

    let dateRange = { start: todayStr, end: todayStr, label: 'hoje' }

    if (normalizedQuery.includes('ontem')) {
      dateRange = { start: yesterdayStr, end: yesterdayStr, label: 'ontem' }
    } else if (normalizedQuery.includes('semana')) {
      dateRange = { start: weekAgoStr, end: todayStr, label: 'esta semana' }
    } else if (normalizedQuery.includes('mes')) {
      dateRange = { start: monthStartStr, end: todayStr, label: 'este mes' }
    }

    const report = await getBarberRevenue(
      state.barbershop_id,
      state.barber_id,
      dateRange.start,
      dateRange.end
    )

    const message =
      `*Seu faturamento de ${dateRange.label}:*\n\n` +
      `Total: R$ ${report.total_revenue.toFixed(2)}\n` +
      `Comissao: R$ ${report.commission.toFixed(2)}\n` +
      `Atendimentos: ${report.total_appointments}`

    await whatsappClient.sendText(phoneNumber, message)
    await stateManager.setStep(phoneNumber, 'reports_menu')
    return
  }

  // Check for "comissao" queries
  if (normalizedQuery.includes('comissao') || normalizedQuery.includes('comissão')) {
    await sendMyCommission(phoneNumber, state)
    return
  }

  // Check for queries about other barbers (admin only)
  if (
    (state.user_role === 'manager' || state.user_role === 'owner') &&
    normalizedQuery.includes('quanto')
  ) {
    // Try to extract barber name
    const barbers = await getBarbers(state.barbershop_id)
    let targetBarber = null

    for (const barber of barbers) {
      const barberName = barber.name.toLowerCase()
      const firstName = barber.first_name.toLowerCase()
      if (normalizedQuery.includes(firstName) || normalizedQuery.includes(barberName)) {
        targetBarber = barber
        break
      }
    }

    if (targetBarber) {
      let dateRange = { start: todayStr, end: todayStr, label: 'hoje' }

      if (normalizedQuery.includes('ontem')) {
        dateRange = { start: yesterdayStr, end: yesterdayStr, label: 'ontem' }
      } else if (normalizedQuery.includes('semana')) {
        dateRange = { start: weekAgoStr, end: todayStr, label: 'esta semana' }
      } else if (normalizedQuery.includes('mes')) {
        dateRange = { start: monthStartStr, end: todayStr, label: 'este mes' }
      }

      const report = await getBarberRevenue(
        state.barbershop_id,
        targetBarber.id,
        dateRange.start,
        dateRange.end
      )

      const message =
        `*Faturamento de ${targetBarber.name} (${dateRange.label}):*\n\n` +
        `Total: R$ ${report.total_revenue.toFixed(2)}\n` +
        `Comissao: R$ ${report.commission.toFixed(2)}\n` +
        `Atendimentos: ${report.total_appointments}`

      await whatsappClient.sendText(phoneNumber, message)
      await stateManager.setStep(phoneNumber, 'reports_menu')
      return
    }
  }

  // Check for "vendeu" or "vendas" queries
  if (normalizedQuery.includes('vendeu') || normalizedQuery.includes('vendas')) {
    let targetDate = todayStr
    let dateLabel = 'hoje'

    if (normalizedQuery.includes('ontem')) {
      targetDate = yesterdayStr
      dateLabel = 'ontem'
    }

    const report = await getDailyRevenue(state.barbershop_id, targetDate)

    let message = `*Vendas de ${dateLabel}:*\n\n`
    message += `Total Faturado: R$ ${report.total_revenue.toFixed(2)}\n`
    message += `Atendimentos: ${report.completed_appointments}\n`

    if (report.services_breakdown.length > 0) {
      message += `\n*Servicos mais vendidos:*\n`
      for (const service of report.services_breakdown.slice(0, 5)) {
        message += `- ${service.service_name}: ${service.count}x\n`
      }
    }

    await whatsappClient.sendText(phoneNumber, message)
    await stateManager.setStep(phoneNumber, 'reports_menu')
    return
  }

  // Could not understand query
  await whatsappClient.sendText(
    phoneNumber,
    `Desculpe, nao entendi sua pergunta.\n\nVoce pode perguntar coisas como:\n` +
      `- "Quanto faturei hoje"\n` +
      `- "Minha comissao da semana"\n` +
      `- "O que vendeu ontem"`
  )
  await stateManager.setStep(phoneNumber, 'reports_menu')
}
