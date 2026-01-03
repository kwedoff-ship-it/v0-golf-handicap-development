import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-900">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-4 text-white">404</h2>
        <h3 className="text-2xl mb-4 text-slate-300">Page Not Found</h3>
        <p className="text-slate-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link 
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
