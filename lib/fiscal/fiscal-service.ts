import { createServerClient } from '@/lib/supabase/server'
import { certificateService } from './certificate-service'
import { FiscalProviderFactory } from './providers/fiscal-provider-factory'
import type {
  FiscalConfig,
  FiscalInvoice,
  FiscalInvoiceItem,
  CreateFiscalInvoiceRequest,
  EmitInvoiceResponse,
  FiscalDashboardStats,
} from './types'

export class FiscalService {
  private supabase = createServerClient()

  /**
   * Create or update fiscal config for barbershop
   */
  async saveFiscalConfig(barbershopId: string, config: any): Promise<FiscalConfig> {
    const { data: existing } = await this.supabase
      .from('fiscal_configs')
      .select('id')
      .eq('barbershop_id', barbershopId)
      .single()

    let result

    if (existing) {
      const { data, error } = await this.supabase
        .from('fiscal_configs')
        .update(config)
        .eq('barbershop_id', barbershopId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      const { data, error } = await this.supabase
        .from('fiscal_configs')
        .insert({ ...config, barbershop_id: barbershopId })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Log the action
    await this.logAction(
      barbershopId,
      'config_updated',
      'Fiscal configuration updated',
      result.id
    )

    return result
  }

  /**
   * Get fiscal config for barbershop
   */
  async getFiscalConfig(barbershopId: string): Promise<FiscalConfig | null> {
    const { data, error } = await this.supabase
      .from('fiscal_configs')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Not found is ok
    return data
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    barbershopId: string,
    request: CreateFiscalInvoiceRequest
  ): Promise<FiscalInvoice> {
    const config = await this.getFiscalConfig(barbershopId)
    if (!config) throw new Error('Barbershop fiscal configuration not found')

    // Generate invoice number
    const invoiceNumber = await this.getNextInvoiceNumber(barbershopId, request.invoice_type)

    const { data, error } = await this.supabase
      .from('fiscal_invoices')
      .insert({
        barbershop_id: barbershopId,
        fiscal_config_id: config.id,
        invoice_type: request.invoice_type,
        appointment_id: request.appointment_id,
        transaction_id: request.transaction_id,
        client_id: request.client_id,
        client_name: request.client_name,
        client_cpf_cnpj: request.client_cpf_cnpj,
        client_email: request.client_email,
        service_description: request.service_description,
        municipal_service_code: request.municipal_service_code || config.default_service_code,
        invoice_number: invoiceNumber,
        invoice_series: config.default_nfe_series.toString(),
        total_amount: request.total_amount,
        deduction_amount: request.deduction_amount || 0,
        taxable_amount: request.total_amount - (request.deduction_amount || 0),
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Insert items if provided
    if (request.items && request.items.length > 0) {
      const items = request.items.map((item, index) => ({
        ...item,
        fiscal_invoice_id: data.id,
        barbershop_id: barbershopId,
        sequence: index + 1,
      }))

      const { error: itemsError } = await this.supabase
        .from('fiscal_invoice_items')
        .insert(items)

      if (itemsError) throw itemsError
    }

    // Log
    await this.logAction(
      barbershopId,
      'invoice_created',
      `Invoice ${invoiceNumber} created`,
      config.id,
      data.id
    )

    return data
  }

  /**
   * Emit invoice to fiscal provider
   */
  async emitInvoice(barbershopId: string, invoiceId: string): Promise<EmitInvoiceResponse> {
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('fiscal_invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('barbershop_id', barbershopId)
      .single()

    if (invoiceError) throw invoiceError

    if (invoice.status !== 'pending') {
      throw new Error(`Invoice status is ${invoice.status}, cannot emit`)
    }

    const config = await this.getFiscalConfig(barbershopId)
    if (!config || !config.fiscal_provider) {
      throw new Error('Fiscal provider not configured')
    }

    try {
      // Get active certificate
      const certificate = await certificateService.getActiveCertificate(barbershopId)

      // Get fiscal provider
      const provider = FiscalProviderFactory.createProvider(config.fiscal_provider)

      // Emit invoice
      const response = await provider.emitInvoice(invoice, certificate)

      if (!response.success) {
        // Update invoice with error
        await this.supabase
          .from('fiscal_invoices')
          .update({
            status: 'rejected',
            status_reason: response.error_message,
          })
          .eq('id', invoiceId)

        await this.logAction(
          barbershopId,
          'invoice_rejected',
          response.error_message || 'Invoice rejected by provider',
          config.id,
          invoiceId
        )

        return {
          success: false,
          invoice_id: invoiceId,
          status: 'rejected',
          error: response.error_message,
        }
      }

      // Update invoice with provider response
      const updateData: any = {
        status: 'authorized',
        fiscal_provider_id: response.invoice_id,
        authorization_code: response.authorization_code,
        authorization_date: new Date().toISOString(),
        xml_content: response.xml,
        pdf_url: response.pdf_url,
        access_key: response.access_key,
      }

      const { data: updatedInvoice, error: updateError } = await this.supabase
        .from('fiscal_invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single()

      if (updateError) throw updateError

      await this.logAction(
        barbershopId,
        'invoice_authorized',
        `Invoice authorized with code ${response.authorization_code}`,
        config.id,
        invoiceId
      )

      return {
        success: true,
        invoice_id: invoiceId,
        fiscal_provider_id: response.invoice_id,
        status: 'authorized',
      }
    } catch (error) {
      await this.logAction(
        barbershopId,
        'invoice_rejected',
        error instanceof Error ? error.message : 'Unknown error',
        config?.id,
        invoiceId
      )

      return {
        success: false,
        invoice_id: invoiceId,
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * List invoices with filters
   */
  async listInvoices(
    barbershopId: string,
    filters?: {
      status?: string
      type?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<FiscalInvoice[]> {
    let query = this.supabase
      .from('fiscal_invoices')
      .select('*')
      .eq('barbershop_id', barbershopId)

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.type) query = query.eq('invoice_type', filters.type)
    if (filters?.startDate) query = query.gte('created_at', filters.startDate)
    if (filters?.endDate) query = query.lte('created_at', filters.endDate)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string, barbershopId: string): Promise<FiscalInvoice | null> {
    const { data, error } = await this.supabase
      .from('fiscal_invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('barbershop_id', barbershopId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  /**
   * Get invoice items
   */
  async getInvoiceItems(invoiceId: string): Promise<FiscalInvoiceItem[]> {
    const { data, error } = await this.supabase
      .from('fiscal_invoice_items')
      .select('*')
      .eq('fiscal_invoice_id', invoiceId)
      .order('sequence')

    if (error) throw error
    return data
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(
    barbershopId: string,
    invoiceId: string,
    reason: string
  ): Promise<void> {
    const { data: invoice, error } = await this.supabase
      .from('fiscal_invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('barbershop_id', barbershopId)
      .single()

    if (error) throw error

    const config = await this.getFiscalConfig(barbershopId)

    if (invoice.status === 'authorized' && invoice.fiscal_provider_id) {
      if (config?.fiscal_provider) {
        const provider = FiscalProviderFactory.createProvider(config.fiscal_provider)
        await provider.cancelInvoice(invoice.fiscal_provider_id, reason)
      }
    }

    await this.supabase
      .from('fiscal_invoices')
      .update({
        status: 'cancelled',
        status_reason: reason,
      })
      .eq('id', invoiceId)

    await this.logAction(
      barbershopId,
      'invoice_cancelled',
      reason,
      config?.id,
      invoiceId
    )
  }

  /**
   * Get fiscal dashboard stats
   */
  async getDashboardStats(barbershopId: string): Promise<FiscalDashboardStats> {
    const { data: invoices } = await this.supabase
      .from('fiscal_invoices')
      .select('*')
      .eq('barbershop_id', barbershopId)

    const invoiceList = invoices || []

    const byStatus = {
      pending: invoiceList.filter((i) => i.status === 'pending').length,
      authorized: invoiceList.filter((i) => i.status === 'authorized').length,
      rejected: invoiceList.filter((i) => i.status === 'rejected').length,
      cancelled: invoiceList.filter((i) => i.status === 'cancelled').length,
    }

    const byType = {
      nfse: invoiceList.filter((i) => i.invoice_type === 'nfse').length,
      nfe: invoiceList.filter((i) => i.invoice_type === 'nfe').length,
    }

    const totalRevenue = invoiceList.reduce((sum, i) => sum + (i.total_amount || 0), 0)
    const totalTaxes = invoiceList.reduce((sum, i) => sum + (i.iss_amount || 0) + (i.cofins_amount || 0) + (i.pis_amount || 0), 0)

    const recentInvoices = invoiceList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

    const expiringCertificates = await certificateService.getExpiringCertificates(barbershopId)

    return {
      total_invoices: invoiceList.length,
      invoices_by_status: byStatus,
      invoices_by_type: byType,
      total_revenue: totalRevenue,
      total_taxes: totalTaxes,
      recent_invoices: recentInvoices,
      certificate_expiring_soon: expiringCertificates[0] || null,
    }
  }

  /**
   * Helper: Get next invoice number
   */
  private async getNextInvoiceNumber(barbershopId: string, invoiceType: string): Promise<string> {
    const { data } = await this.supabase.rpc('get_next_invoice_number', {
      barbershop_id_param: barbershopId,
      invoice_type_param: invoiceType,
    })

    return data || `${invoiceType}-${Date.now()}`
  }

  /**
   * Helper: Log fiscal action
   */
  private async logAction(
    barbershopId: string,
    action: string,
    description: string,
    fiscalConfigId?: string,
    invoiceId?: string
  ): Promise<void> {
    await this.supabase
      .from('fiscal_logs')
      .insert({
        barbershop_id: barbershopId,
        action,
        description,
        fiscal_config_id: fiscalConfigId,
        fiscal_invoice_id: invoiceId,
      })
      .catch((err) => console.error('Failed to log fiscal action:', err))
  }
}

export const fiscalService = new FiscalService()
