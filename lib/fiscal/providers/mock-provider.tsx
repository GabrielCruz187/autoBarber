import type { IFiscalProvider, FiscalInvoice, FiscalCertificate, FiscalProviderResponse, InvoiceStatus, CertificateInfo } from '../types'

/**
 * Mock Fiscal Provider for testing and development
 * Simulates API responses without actual integration
 */
export class MockFiscalProvider implements IFiscalProvider {
  name = 'mock' as const

  async authenticate(apiKey: string): Promise<boolean> {
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return apiKey.length > 0
  }

  async emitInvoice(
    invoice: FiscalInvoice,
    certificate: FiscalCertificate
  ): Promise<FiscalProviderResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 90% success rate for testing
    const success = Math.random() > 0.1

    if (!success) {
      return {
        success: false,
        error_message: 'Simulated API error: Municipality service unavailable',
      }
    }

    const invoiceNumber = `${invoice.invoice_series || '1'}-${Date.now()}`
    const accessKey = this.generateAccessKey()

    return {
      success: true,
      invoice_id: `mock-${Date.now()}`,
      authorization_code: `AUTH-${Math.random().toString(36).substring(7).toUpperCase()}`,
      access_key: accessKey,
      xml: this.generateMockXML(invoice, accessKey),
      pdf_url: `https://mock-pdf.example.com/invoices/${invoice.id}.pdf`,
    }
  }

  async cancelInvoice(invoiceId: string, reason: string): Promise<FiscalProviderResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      invoice_id: invoiceId,
      error_message: undefined,
    }
  }

  async queryInvoiceStatus(invoiceId: string): Promise<{ status: InvoiceStatus; details: Record<string, unknown> }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock status cycling for demo
    const statuses: InvoiceStatus[] = ['pending', 'authorized', 'authorized', 'rejected']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return {
      status: randomStatus,
      details: {
        provider_id: invoiceId,
        last_check: new Date().toISOString(),
        retry_count: 0,
      },
    }
  }

  async validateCertificate(
    certificateData: Buffer,
    password: string
  ): Promise<CertificateInfo> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      subject_cn: 'CN=Mock Company CNPJ 00.000.000/0000-00',
      issuer: 'Mock CA',
      valid_from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      serial_number: `${Date.now()}`,
    }
  }

  private generateAccessKey(): string {
    // Format: 35 digits (state + YYMMDD + CNPJ + Model + series + number + verification)
    const digits = Array.from({ length: 35 }, () => Math.floor(Math.random() * 10)).join('')
    return digits
  }

  private generateMockXML(invoice: FiscalInvoice, accessKey: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<RPS>
  <Id>${invoice.id}</Id>
  <AccessKey>${accessKey}</AccessKey>
  <InvoiceNumber>${invoice.invoice_number}</InvoiceNumber>
  <ServiceDescription>${invoice.service_description}</ServiceDescription>
  <ClientName>${invoice.client_name}</ClientName>
  <TotalAmount>${invoice.total_amount}</TotalAmount>
  <IssueDate>${new Date().toISOString()}</IssueDate>
  <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
</RPS>`
  }
}
