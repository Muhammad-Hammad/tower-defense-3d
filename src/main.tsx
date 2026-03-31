import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AudioBootstrap } from './audio/AudioBootstrap.tsx'
import { AudioDirector } from './audio/AudioDirector.tsx'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AudioBootstrap />
      <AudioDirector />
      <App />
    </QueryClientProvider>
  </StrictMode>
)
