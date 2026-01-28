import type { IFiscalProvider, FiscalProvider } from '../types'
import { MockFiscalProvider } from './mock-provider'
import { PlugNotasProvider } from './plug-notas-provider'
import { FocusNFeProvider } from './focus-nfe-provider'

export class FiscalProviderFactory {
  static createProvider(provider: FiscalProvider): IFiscalProvider {
    switch (provider) {
      case 'mock':
        return new MockFiscalProvider()
      case 'plug_notas':
        return new PlugNotasProvider()
      case 'focus_nfe':
        return new FocusNFeProvider()
      default:
        throw new Error(`Unknown fiscal provider: ${provider}`)
    }
  }
}

export { MockFiscalProvider, PlugNotasProvider, FocusNFeProvider }
