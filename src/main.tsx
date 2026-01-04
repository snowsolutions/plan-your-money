import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app'
import { I18nProvider } from './providers/i18n-provider'
import { CurrencyProvider } from './providers/currency-provider'
import { ToastProvider } from './hooks/use-toast'
import { loadPreferences } from './utils/preferences-utils'

const initialPrefs = loadPreferences();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <I18nProvider initialLanguage={initialPrefs.global.language}>
            <CurrencyProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </CurrencyProvider>
        </I18nProvider>
    </StrictMode>,
)
