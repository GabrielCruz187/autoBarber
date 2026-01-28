import { createServerClient } from '@/lib/supabase/server'
import type { FiscalCertificate, CertificateInfo } from './types'
import crypto from 'crypto'

// For production, use a secure encryption library like 'crypto' or aws-kms
const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = process.env.FISCAL_ENCRYPTION_KEY || 'default-insecure-key-change-in-production'

export class CertificateService {
  private supabase = createServerClient()

  /**
   * Encrypt sensitive certificate data
   */
  private encryptData(data: Buffer): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32),
      iv
    )

    let encrypted = cipher.update(data)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  /**
   * Decrypt certificate data
   */
  private decryptData(encryptedData: string): Buffer {
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = Buffer.from(parts[1], 'hex')

    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32),
      iv
    )

    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted
  }

  /**
   * Extract certificate info from .pfx file (requires node-forge in production)
   * For now, we'll use a mock implementation
   */
  async extractCertificateInfo(
    certificateBuffer: Buffer,
    password: string
  ): Promise<CertificateInfo> {
    // In production, use node-forge or similar:
    // const forge = require('node-forge')
    // const pkcs12 = forge.pkcs12.asPem(...)

    // Mock implementation for demo
    const hash = crypto.createHash('sha256').update(certificateBuffer).digest('hex')

    return {
      subject_cn: `CN=Mock Certificate-${hash.substring(0, 8)}`,
      issuer: 'Mock Issuer',
      valid_from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      serial_number: hash,
    }
  }

  /**
   * Upload a new certificate
   */
  async uploadCertificate(
    barbershopId: string,
    fiscalConfigId: string,
    certificateBuffer: Buffer,
    password: string
  ): Promise<FiscalCertificate> {
    // Validate certificate
    const certInfo = await this.extractCertificateInfo(certificateBuffer, password)

    // Check expiration
    if (certInfo.valid_until < new Date()) {
      throw new Error('Certificate has expired')
    }

    // Hash for reference (don't store actual certificate plaintext)
    const certificateHash = crypto.createHash('sha256').update(certificateBuffer).digest('hex')

    // Hash password for verification
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    // Encrypt certificate data for storage
    const encryptedCertificate = this.encryptData(certificateBuffer)

    // Store in database
    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .insert({
        barbershop_id: barbershopId,
        fiscal_config_id: fiscalConfigId,
        certificate_hash: certificateHash,
        subject_cn: certInfo.subject_cn,
        issuer: certInfo.issuer,
        serial_number: certInfo.serial_number,
        certificate_data_encrypted: encryptedCertificate,
        certificate_password_hash: passwordHash,
        valid_from: certInfo.valid_from,
        valid_until: certInfo.valid_until,
        is_active: true,
        is_default: true, // Make it default unless there's another
      })
      .select()
      .single()

    if (error) throw error

    return this.sanitizeCertificate(data)
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(certificateId: string): Promise<FiscalCertificate> {
    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .select('*')
      .eq('id', certificateId)
      .single()

    if (error) throw error
    return this.sanitizeCertificate(data)
  }

  /**
   * Get active certificate for barbershop (returns encrypted data separately if needed)
   */
  async getActiveCertificate(barbershopId: string): Promise<FiscalCertificate> {
    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('is_active', true)
      .eq('is_default', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return this.sanitizeCertificate(data)
  }

  /**
   * Get all certificates for a barbershop
   */
  async listCertificates(barbershopId: string): Promise<FiscalCertificate[]> {
    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map((cert) => this.sanitizeCertificate(cert))
  }

  /**
   * Deactivate a certificate
   */
  async deactivateCertificate(certificateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('fiscal_certificates')
      .update({ is_active: false })
      .eq('id', certificateId)

    if (error) throw error
  }

  /**
   * Set default certificate
   */
  async setDefaultCertificate(barbershopId: string, certificateId: string): Promise<void> {
    // First deactivate all
    await this.supabase
      .from('fiscal_certificates')
      .update({ is_default: false })
      .eq('barbershop_id', barbershopId)

    // Then activate this one
    const { error } = await this.supabase
      .from('fiscal_certificates')
      .update({ is_default: true })
      .eq('id', certificateId)

    if (error) throw error
  }

  /**
   * Get decrypted certificate data (internal use only)
   */
  async getCertificateData(certificateId: string): Promise<Buffer> {
    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .select('certificate_data_encrypted')
      .eq('id', certificateId)
      .single()

    if (error) throw error

    return this.decryptData(data.certificate_data_encrypted)
  }

  /**
   * Verify certificate password
   */
  async verifyCertificatePassword(certificateId: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .select('certificate_password_hash')
      .eq('id', certificateId)
      .single()

    if (error) return false

    const providedHash = crypto.createHash('sha256').update(password).digest('hex')
    return providedHash === data.certificate_password_hash
  }

  /**
   * Get expiring certificates (within 30 days)
   */
  async getExpiringCertificates(barbershopId: string): Promise<FiscalCertificate[]> {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const { data, error } = await this.supabase
      .from('fiscal_certificates')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .lt('valid_until', thirtyDaysFromNow.toISOString())
      .gte('valid_until', new Date().toISOString())

    if (error) throw error
    return data.map((cert) => this.sanitizeCertificate(cert))
  }

  /**
   * Remove sensitive data before returning to client
   */
  private sanitizeCertificate(cert: any): FiscalCertificate {
    const { certificate_data_encrypted, certificate_password_hash, ...safe } = cert
    return safe as FiscalCertificate
  }
}

export const certificateService = new CertificateService()
