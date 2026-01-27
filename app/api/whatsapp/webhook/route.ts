import { NextRequest, NextResponse } from 'next/server'
import type { WhatsAppWebhookPayload, WhatsAppMessage } from '@/lib/whatsapp/types'
import { handleIncomingMessage } from '@/lib/whatsapp/message-handler'

// Webhook verification (GET) - Required by WhatsApp Cloud API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.log('[WhatsApp Webhook] Verification failed')
  return new NextResponse('Forbidden', { status: 403 })
}

// Webhook handler (POST) - Receives messages from WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppWebhookPayload = await request.json()

    // Validate it's a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue

        const { messages, contacts, metadata } = change.value

        // Skip status updates
        if (!messages || messages.length === 0) continue

        // Process each message
        for (const message of messages) {
          const contact = contacts?.find((c) => c.wa_id === message.from)
          const senderName = contact?.profile?.name || 'Cliente'

          console.log(`[WhatsApp Webhook] Message from ${message.from} (${senderName}):`, {
            type: message.type,
            text: message.text?.body,
            interactive: message.interactive,
          })

          // Handle the message asynchronously (don't block webhook response)
          handleIncomingMessage(message, senderName, metadata.phone_number_id).catch((error) => {
            console.error('[WhatsApp Webhook] Error handling message:', error)
          })
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook:', error)
    // Still return 200 to prevent WhatsApp from retrying
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}
