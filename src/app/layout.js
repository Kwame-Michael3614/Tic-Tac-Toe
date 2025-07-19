import './globals.css'
import './style.css'

export const metadata = {
  title: 'Advanced Tic-Tac-Toe',
  description: 'An intelligent tic-tac-toe game with AI opponents and multiple difficulty levels',
  keywords: ['tic-tac-toe', 'game', 'AI', 'React', 'Next.js'],
  author: 'Kwame Michael',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}