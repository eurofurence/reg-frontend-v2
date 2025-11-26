import { afterEach } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()

// Clean up after each test to prevent DOM state pollution
afterEach(() => {
  // Clear the entire document
  document.body.innerHTML = ''
  document.head.innerHTML = ''

  // Reset any global state that might persist
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
})
