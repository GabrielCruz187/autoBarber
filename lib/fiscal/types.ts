// Fiscal Module Types - NFS-e and NF-e Management

export type TaxRegime = 'simples_nacional' | 'presumido' | 'lucro_real'
export type InvoiceType = 'nfse' | 'nfe'
export type InvoiceStatus = 'pending' | 'authorized' | 'rejected' | 'cancelled'
export type FiscalProvider = 'plug_notas' | 'focus_nfe' | 'mock'

export interface FiscalConfig {
  id: string
  barbershop_id: string
  
  // Legal
  legal_name: string
  cnpj: string
  inscricao_municipal: string | null
  inscricao_estadual: string | null
  cnae: string
  
  // Tax
  tax_regime: TaxRegime
  
  // Address
  address: string
  number: string
  complement: string | null
  city: string
  state: string
  zip_code: string
  ibge_code: string
  
  // Contact
  phone: string | null
  email: string | null
  
  // Provider
  fiscal_provider: FiscalProvider | null
  fiscal_provider_api_key: string | null // Never returns encrypted value
  
  // Defaults
  default_nfse_description: string | null
  default_service_code: string | null
  default_nfe_series: number
  
  // Status
  is_active: boolean
  verified_at: string | null
  
  created_at: string
  updated_at: string
}

export interface FiscalCertificate {
  id: string
  barbershop_id: string
  fiscal_config_id: string
  
  // Cert info
  certificate_hash: string
  subject_cn: string
  issuer: string
  serial_number: string
  
  // Content (never returned, only stored)
  // certificate_data_encrypted: never exposed
  // certificate_password_hash: never exposed
  
  // Validity
  valid_from: string
  valid_until: string
  
  // Status
  is_active: boolean
  is_default: boolean
  
  created_at: string
  updated_at: string
}

export interface FiscalInvoice {
  id: string
  barbershop_id: string
  fiscal_config_id: string
  
  // Type
  invoice_type: InvoiceType
  
  // References
  appointment_id: string | null
  transaction_id: string | null
  
  // Client/Service Provider
  client_id: string | null
  client_name: string
  client_cpf_cnpj: string | null
  client_email: string | null
  
  // Invoice data
  service_description: string
  municipal_service_code: string | null
  invoice_number: string | null
  invoice_series: string | null
  
  // Amounts
  total_amount: number
  deduction_amount: number
  taxable_amount: number | null
  
  // Taxes
  iss_rate: number | null
  iss_amount: number | null
  cofins_amount: number | null
  pis_amount: number | null
  ir_amount: number | null
  
  // Status
  status: InvoiceStatus
  status_reason: string | null
  
  // Provider response
  fiscal_provider_id: string | null
  authorization_code: string | null
  authorization_date: string | null
  
  // Documents
  xml_content: string | null
  pdf_url: string | null
  access_key: string | null
  
  // Metadata
  metadata: Record<string, unknown>
  
  created_at: string
  updated_at: string
}

export interface FiscalInvoiceItem {
  id: string
  fiscal_invoice_id: string
  barbershop_id: string
  
  // Details
  sequence: number
  service_id: string | null
  description: string
  quantity: number
  unit_price: number
  total_amount: number
  
  // Municipal code
  municipal_service_code: string | null
  
  created_at: string
}

export type FiscalLogAction = 
  | 'certificate_uploaded'
  | 'certificate_updated'
  | 'certificate_expired'
  | 'invoice_created'
  | 'invoice_authorized'
  | 'invoice_rejected'
  | 'invoice_cancelled'
  | 'config_updated'
  | 'sync_started'
  | 'sync_completed'

export interface FiscalLog {
  id: string
  barbershop_id: string
  
  // What happened
  action: FiscalLogAction
  
  // Related entities
  fiscal_invoice_id: string | null
  fiscal_config_id: string | null
  certificate_id: string | null
  
  // Details
  description: string | null
  error_message: string | null
  metadata: Record<string, unknown>
  
  // Who
  user_id: string | null
  
  created_at: string
}

export interface FiscalWebhookEvent {
  id: string
  barbershop_id: string
  
  // Event
  event_type: string
  fiscal_provider: FiscalProvider
  fiscal_provider_id: string | null
  
  // Related
  fiscal_invoice_id: string | null
  
  // Payload
  payload: Record<string, unknown>
  
  // Processing
  is_processed: boolean
  processed_at: string | null
  error_message: string | null
  
  created_at: string
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface CreateFiscalConfigRequest {
  legal_name: string
  cnpj: string
  inscricao_municipal?: string
  inscricao_estadual?: string
  cnae: string
  tax_regime: TaxRegime
  address: string
  number: string
  complement?: string
  city: string
  state: string
  zip_code: string
  ibge_code: string
  phone?: string
  email?: string
  fiscal_provider?: FiscalProvider
  fiscal_provider_api_key?: string
  default_nfse_description?: string
  default_service_code?: string
}

export interface UpdateFiscalConfigRequest extends Partial<CreateFiscalConfigRequest> {}

export interface CreateFiscalInvoiceRequest {
  invoice_type: InvoiceType
  appointment_id?: string
  transaction_id?: string
  client_id?: string
  client_name: string
  client_cpf_cnpj?: string
  client_email?: string
  service_description: string
  municipal_service_code?: string
  total_amount: number
  deduction_amount?: number
  items?: Omit<FiscalInvoiceItem, 'id' | 'fiscal_invoice_id' | 'barbershop_id' | 'created_at'>[]
}

export interface UploadCertificateRequest {
  certificate_file: File // .pfx file
  certificate_password: string
}

export interface FiscalProviderResponse {
  success: boolean
  invoice_id?: string
  authorization_code?: string
  access_key?: string
  xml?: string
  pdf_url?: string
  error_message?: string
}

export interface EmitInvoiceResponse {
  success: boolean
  invoice_id: string
  fiscal_provider_id?: string
  status: InvoiceStatus
  error?: string
}

export interface FiscalDashboardStats {
  total_invoices: number
  invoices_by_status: {
    pending: number
    authorized: number
    rejected: number
    cancelled: number
  }
  invoices_by_type: {
    nfse: number
    nfe: number
  }
  total_revenue: number
  total_taxes: number
  recent_invoices: FiscalInvoice[]
  certificate_expiring_soon: FiscalCertificate | null
}

// =====================================================
// Fiscal Provider Integration Abstraction
// =====================================================

export interface IFiscalProvider {
  name: FiscalProvider
  authenticate(apiKey: string): Promise<boolean>
  emitInvoice(invoice: FiscalInvoice, certificate: FiscalCertificate): Promise<FiscalProviderResponse>
  cancelInvoice(invoiceId: string, reason: string): Promise<FiscalProviderResponse>
  queryInvoiceStatus(invoiceId: string): Promise<{ status: InvoiceStatus; details: Record<string, unknown> }>
  validateCertificate(certificateData: Buffer, password: string): Promise<{
    valid: boolean
    subject_cn: string
    issuer: string
    valid_from: Date
    valid_until: Date
    serial_number: string
  }>
}

export interface CertificateInfo {
  subject_cn: string
  issuer: string
  valid_from: Date
  valid_until: Date
  serial_number: string
}
