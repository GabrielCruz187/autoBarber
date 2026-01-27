import type {
  WhatsAppTextMessage,
  WhatsAppInteractiveMessage,
  WhatsAppOutboundMessage,
  WhatsAppListSection,
  WhatsAppInteractiveButton,
} from './types'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

export class WhatsAppClient {
  private phoneNumberId: string
  private accessToken: string

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || ''
  }

  async sendMessage(message: WhatsAppOutboundMessage): Promise<boolean> {
    try {
      const response = await fetch(
        `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('[WhatsApp] Send message error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('[WhatsApp] Send message exception:', error)
      return false
    }
  }

  async sendText(to: string, text: string): Promise<boolean> {
    const message: WhatsAppTextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    }
    return this.sendMessage(message)
  }

  async sendButtons(
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[],
    headerText?: string,
    footerText?: string
  ): Promise<boolean> {
    const buttonActions: WhatsAppInteractiveButton[] = buttons.slice(0, 3).map((btn) => ({
      type: 'reply' as const,
      reply: {
        id: btn.id,
        title: btn.title.slice(0, 20),
      },
    }))

    const message: WhatsAppInteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        ...(headerText && {
          header: {
            type: 'text',
            text: headerText,
          },
        }),
        body: {
          text: bodyText,
        },
        ...(footerText && {
          footer: {
            text: footerText,
          },
        }),
        action: {
          buttons: buttonActions,
        },
      },
    }
    return this.sendMessage(message)
  }

  async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: WhatsAppListSection[],
    headerText?: string,
    footerText?: string
  ): Promise<boolean> {
    const message: WhatsAppInteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        ...(headerText && {
          header: {
            type: 'text',
            text: headerText,
          },
        }),
        body: {
          text: bodyText,
        },
        ...(footerText && {
          footer: {
            text: footerText,
          },
        }),
        action: {
          button: buttonText,
          sections,
        },
      },
    }
    return this.sendMessage(message)
  }
}

export const whatsappClient = new WhatsAppClient()
