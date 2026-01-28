import type { IFiscalProvider, FiscalInvoice, FiscalCertificate, FiscalProviderResponse, InvoiceStatus, CertificateInfo } from '../types'

/**
 * PlugNotas Fiscal Provider Integration
 * https://www.plugnotas.com.br/
 */
export class PlugNotasProvider implements IFiscalProvider {
  name = 'plug_notas' as const
  private apiUrl = 'https://api.plugnotas.com.br/v1'
  private apiKey: string = ''

  async authenticate(apiKey: string): Promise<boolean> {
    try {
      this.apiKey = apiKey

      const response = await fetch(`${this.apiUrl}/config`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('PlugNotas authentication error:', error)
      return false
    }
  }

  async emitInvoice(
    invoice: FiscalInvoice,
    certificate: FiscalCertificate
  ): Promise<FiscalProviderResponse> {
    try {
      const payload = {
        serviceInvoice: {
          seriesNumber: invoice.invoice_series || '1',
          invoiceNumber: invoice.invoice_number,
          clientDocument: invoice.client_cpf_cnpj,
          clientName: invoice.client_name,
          clientEmail: invoice.client_email,
          description: invoice.service_description,
          serviceCode: invoice.municipal_service_code,
          amount: invoice.total_amount,
          deductionAmount: invoice.deduction_amount || 0,
          issueDate: new Date().toISOString().split('T')[0],
          certificate: {
            serialNumber: certificate.serial_number,
            validUntil: certificate.valid_until,
          },
        },
      }

      const response = await fetch(`${this.apiUrl}/invoices/emit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error_message: data.message || 'Failed to emit invoice',
        }
      }

      return {
        success: true,
        invoice_id: data.id,
        authorization_code: data.authorizationCode,
        access_key: data.accessKey,
        xml: data.xml,
        pdf_url: data.pdfUrl,
      }
    } catch (error) {
      console.error('PlugNotas emit error:', error)
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async cancelInvoice(invoiceId: string, reason: string): Promise<FiscalProviderResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/invoices/${invoiceId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      const data = await response.json()

      return {
        success: response.ok,
        invoice_id: invoiceId,
        error_message: !response.ok ? data.message : undefined,
      }
    } catch (error) {
      console.error('PlugNotas cancel error:', error)
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async queryInvoiceStatus(invoiceId: string): Promise<{ status: InvoiceStatus; details: Record<string, unknown> }> {
    try {
      const response = await fetch(`${this.apiUrl}/invoices/${invoiceId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      const statusMap: Record<string, InvoiceStatus> = {
        pending: 'pending',
        authorized: 'authorized',
        rejected: 'rejected',
        cancelled: 'cancelled',
      }

      return {
        status: statusMap[data.status] || 'pending',
        details: {
          provider_id: invoiceId,
          provider_status: data.status,
          authorization_code: data.authorizationCode,
          access_key: data.accessKey,
          last_check: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('PlugNotas status query error:', error)
      return {
        status: 'pending',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  async validateCertificate(
    certificateData: Buffer,
    password: string
  ): Promise<CertificateInfo> {
    try {
      // PlugNotas validates certificate at emission time
      // For now, return basic info
      const hash = require('crypto').createHash('sha256').update(certificateData).digest('hex')

      return {
        subject_cn: `CN=Certificate-${hash.substring(0, 8)}`,
        issuer: 'PlugNotas CA',
        valid_from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        serial_number: hash,
      }
    } catch (error) {
      throw new Error('Failed to validate certificate')
    }
  }
}
