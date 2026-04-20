import type { ConversationState, ConversationStep, ConversationContext } from './types'

// In-memory store for conversation states (for production, use Redis or database)
const conversationStates = new Map<string, ConversationState>()

// Default barbershop ID - in production, this would be determined by the WhatsApp number
const DEFAULT_BARBERSHOP_ID = process.env.DEFAULT_BARBERSHOP_ID || 'default-barbershop'

export class ConversationStateManager {
  private getKey(phoneNumber: string, barbershopId: string): string {
    return `${barbershopId}:${phoneNumber}`
  }

  async getState(phoneNumber: string, barbershopId: string = DEFAULT_BARBERSHOP_ID): Promise<ConversationState | null> {
    const key = this.getKey(phoneNumber, barbershopId)
    return conversationStates.get(key) || null
  }

  async createState(
    phoneNumber: string,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<ConversationState> {
    const key = this.getKey(phoneNumber, barbershopId)
    const now = new Date().toISOString()

    const state: ConversationState = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phone_number: phoneNumber,
      barbershop_id: barbershopId,
      current_step: 'idle',
      context: {},
      user_role: null,
      barber_id: null,
      client_id: null,
      created_at: now,
      updated_at: now,
    }

    conversationStates.set(key, state)
    return state
  }

  async getOrCreateState(
    phoneNumber: string,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<ConversationState> {
    const existing = await this.getState(phoneNumber, barbershopId)
    if (existing) {
      return existing
    }
    return this.createState(phoneNumber, barbershopId)
  }

  async updateState(
    phoneNumber: string,
    updates: Partial<Pick<ConversationState, 'current_step' | 'context' | 'user_role' | 'barber_id' | 'client_id'>>,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<ConversationState | null> {
    const key = this.getKey(phoneNumber, barbershopId)
    const state = conversationStates.get(key)

    if (!state) {
      return null
    }

    const updatedState: ConversationState = {
      ...state,
      ...updates,
      context: updates.context ? { ...state.context, ...updates.context } : state.context,
      updated_at: new Date().toISOString(),
    }

    conversationStates.set(key, updatedState)
    return updatedState
  }

  async setStep(
    phoneNumber: string,
    step: ConversationStep,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<ConversationState | null> {
    return this.updateState(phoneNumber, { current_step: step }, barbershopId)
  }

  async updateContext(
    phoneNumber: string,
    context: Partial<ConversationContext>,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<ConversationState | null> {
    const key = this.getKey(phoneNumber, barbershopId)
    const state = conversationStates.get(key)

    if (!state) {
      return null
    }

    const updatedState: ConversationState = {
      ...state,
      context: { ...state.context, ...context },
      updated_at: new Date().toISOString(),
    }

    conversationStates.set(key, updatedState)
    return updatedState
  }

  async resetState(
    phoneNumber: string,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<ConversationState | null> {
    return this.updateState(
      phoneNumber,
      {
        current_step: 'idle',
        context: {},
      },
      barbershopId
    )
  }

  async deleteState(
    phoneNumber: string,
    barbershopId: string = DEFAULT_BARBERSHOP_ID
  ): Promise<boolean> {
    const key = this.getKey(phoneNumber, barbershopId)
    return conversationStates.delete(key)
  }
}

export const stateManager = new ConversationStateManager()
