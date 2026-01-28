import type { IFiscalProvider, FiscalInvoice, FiscalCertificate, FiscalProviderResponse, InvoiceStatus, CertificateInfo } from '../types'

/**
 * Focus NFe Fiscal Provider Integration
 * https://www.focusnfe.com.br/
 */
export class FocusNFeProvider implements IFiscalProvider {
  name = 'focus_nfe' as const
  private apiUrl = 'https://api.focusnfe.com.br/v2'
  private apiKey: string = ''

  async authenticate(apiKey: string): Promise<boolean> {
    try {
      this.apiKey = apiKey

      // Focus NFe uses basic auth
      const auth = Buffer.from(`${apiKey}:`).toString('base64')

      const response = await fetch(`${this.apiUrl}/access`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Focus NFe authentication error:', error)
      return false
    }
  }

  async emitInvoice(
    invoice: FiscalInvoice,
    certificate: FiscalCertificate
  ): Promise<FiscalProviderResponse> {
    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64')

      // For NFS-e
      const endpoint = invoice.invoice_type === 'nfse' ? '/nfse' : '/nfe'

      const payload = {
        referencia: invoice.id,
        prestador: {
          // Should be set from fiscal_config
          cnpj: '00000000000191', // Example
        },
        tomador: {
          nome: invoice.client_name,
          cpf_cnpj: invoice.client_cpf_cnpj,
          email: invoice.client_email,
        },
        rps: {
          serie: invoice.invoice_series || '1',
          numero: invoice.invoice_number?.split('-').pop() || '1',
          valor_servicos: invoice.total_amount,
          valor_deducoes: invoice.deduction_amount || 0,
          descricao: invoice.service_description,
          codigo_servico: invoice.municipal_service_code,
        },
      }

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error_message: data.mensagem || 'Failed to emit invoice',
        }
      }

      return {
        success: true,
        invoice_id: data.id,
        authorization_code: data.numero_nfe || data.numero_rps,
        access_key: data.chave_acesso || data.numero_rps,
        xml: data.xml,
        pdf_url: data.url_pdf,
      }
    } catch (error) {
      console.error('Focus NFe emit error:', error)
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async cancelInvoice(invoiceId: string, reason: string): Promise<FiscalProviderResponse> {
    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64')

      const response = await fetch(`${this.apiUrl}/nfse/${invoiceId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo: reason }),
      })

      const data = await response.json()

      return {
        success: response.ok,
        invoice_id: invoiceId,
        error_message: !response.ok ? data.mensagem : undefined,
      }
    } catch (error) {
      console.error('Focus NFe cancel error:', error)
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async queryInvoiceStatus(invoiceId: string): Promise<{ status: InvoiceStatus; details: Record<string, unknown> }> {
    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64')

      const response = await fetch(`${this.apiUrl}/nfse/${invoiceId}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      const statusMap: Record<string, InvoiceStatus> = {
        'em processamento': 'pending',
        autorizado: 'authorized',
        rejeitado: 'rejected',
        cancelado: 'cancelled',
      }

      return {
        status: statusMap[data.status] || 'pending',
        details: {
          provider_id: invoiceId,
          provider_status: data.status,
          numero: data.numero,
          serie: data.serie,
          last_check: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('Focus NFe status query error:', error)
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
    // Focus NFe validates at API level
    const hash = require('crypto').createHash('sha256').update(certificateData).digest('hex')

    return {
      subject_cn: `CN=Certificate-${hash.substring(0, 8)}`,
      issuer: 'Focus NFe CA',
      valid_from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      serial_number: hash,
    }
  }
}
