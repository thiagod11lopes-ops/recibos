import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ContractDatabaseProvider } from './context/ContractDatabaseContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContractDatabaseProvider>
      <App />
    </ContractDatabaseProvider>
  </StrictMode>,
)
