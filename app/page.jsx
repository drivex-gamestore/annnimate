import AppProviders from './providers'
import RootLayout from './layout'

export default function annnimatePage({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}