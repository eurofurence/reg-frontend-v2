// Import the generated route tree
import * as Sentry from '@sentry/react'
import { captureException } from '@sentry/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { LocalizationProvider } from './localization'
import queryClient from './queryClient'
import reportWebVitals from './reportWebVitals'
import { routeTree } from './routeTree.gen'
import './stylesheets/styles.css'

Sentry.init({
  dsn: 'https://e8e1229e279c2f657ed851843d8f551e@sentry.eurofurence.org/10',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  enabled: import.meta.env.PROD,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: any
  }
}

// Create a new router instance
let router: ReturnType<typeof createRouter>
try {
  router = createRouter({
    routeTree,
    context: {},
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })
} catch (error) {
  captureException(error, {
    level: 'error',
    tags: { flow: 'app-init', step: 'router-creation' },
    extra: {
      reason: 'Failed to create router instance',
    },
  })
  throw error
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider>
            <RouterProvider router={router} />
          </LocalizationProvider>
        </QueryClientProvider>
      </StrictMode>,
    )
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'app-init', step: 'app-render' },
      extra: {
        reason: 'Failed to render application',
      },
    })
    throw error
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
