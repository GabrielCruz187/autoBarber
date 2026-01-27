// WhatsApp Cloud API Types

export interface WhatsAppWebhookPayload {
  object: string
  entry: WhatsAppEntry[]
}

export interface WhatsAppEntry {
  id: string
  changes: WhatsAppChange[]
}

export interface WhatsAppChange {
  value: {
    messaging_product: string
    metadata: {
      display_phone_number: string
      phone_number_id: string
    }
    contacts?: WhatsAppContact[]
    messages?: WhatsAppMessage[]
    statuses?: WhatsAppStatus[]
  }
  field: string
}

export interface WhatsAppContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  type: 'text' | 'interactive' | 'button' | 'image' | 'document' | 'audio' | 'video' | 'location'
  text?: {
    body: string
  }
  interactive?: {
    type: 'button_reply' | 'list_reply'
    button_reply?: {
      id: string
      title: string
    }
    list_reply?: {
      id: string
      title: string
      description?: string
    }
  }
  button?: {
    payload: string
    text: string
  }
}

export interface WhatsAppStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id: string
}

// Conversation State Types
export type ConversationStep =
  | 'idle'
  | 'greeting'
  | 'main_menu'
  // Scheduling flow
  | 'select_service'
  | 'select_barber'
  | 'select_date'
  | 'select_time'
  | 'confirm_appointment'
  // Reports flow
  | 'reports_menu'
  | 'awaiting_report_query'

export interface ConversationState {
  id: string
  phone_number: string
  barbershop_id: string
  current_step: ConversationStep
  context: ConversationContext
  user_role: 'client' | 'barber' | 'manager' | 'owner' | null
  barber_id: string | null
  client_id: string | null
  created_at: string
  updated_at: string
}

export interface ConversationContext {
  selected_service_id?: string
  selected_service_name?: string
  selected_barber_id?: string
  selected_barber_name?: string
  selected_date?: string
  selected_time?: string
  available_times?: string[]
  temp_data?: Record<string, unknown>
}

// WhatsApp Send Message Types
export interface WhatsAppTextMessage {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'text'
  text: {
    preview_url?: boolean
    body: string
  }
}

export interface WhatsAppInteractiveButton {
  type: 'reply'
  reply: {
    id: string
    title: string
  }
}

export interface WhatsAppInteractiveMessage {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'interactive'
  interactive: {
    type: 'button' | 'list'
    header?: {
      type: 'text'
      text: string
    }
    body: {
      text: string
    }
    footer?: {
      text: string
    }
    action: {
      buttons?: WhatsAppInteractiveButton[]
      button?: string
      sections?: WhatsAppListSection[]
    }
  }
}

export interface WhatsAppListSection {
  title: string
  rows: {
    id: string
    title: string
    description?: string
  }[]
}

export type WhatsAppOutboundMessage = WhatsAppTextMessage | WhatsAppInteractiveMessage
