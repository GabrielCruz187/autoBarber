// Fiscal configuration constants

export const FISCAL_ENCRYPTION_KEY = process.env.FISCAL_ENCRYPTION_KEY || 'default-key-for-development'

export const FISCAL_PROVIDERS = {
  MOCK: 'mock',
  PLUG_NOTAS: 'plug_notas',
  FOCUS_NFE: 'focus_nfe',
} as const

export const TAX_REGIMES = {
  SIMPLES_NACIONAL: 'simples_nacional',
  PRESUMIDO: 'presumido',
  LUCRO_REAL: 'lucro_real',
} as const

export const INVOICE_TYPES = {
  NFSE: 'nfse',
  NFE: 'nfe',
} as const

export const INVOICE_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const

export const config = {
  encryption: {
    algorithm: 'aes-256-cbc',
    key: FISCAL_ENCRYPTION_KEY,
  },
  providers: FISCAL_PROVIDERS,
  taxRegimes: TAX_REGIMES,
  invoiceTypes: INVOICE_TYPES,
  invoiceStatus: INVOICE_STATUS,
}

export default config
