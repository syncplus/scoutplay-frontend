import Link from 'next/link'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <img src="/images/logo.png" alt="ScoutPlay" className="h-20 w-auto mx-auto mb-6" />

        <h1 className="text-white text-2xl font-semibold mb-1">ScoutPlay</h1>
        <p className="text-white/40 text-sm mb-10">Análise de Futevôlei</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/mock"
            className="w-full bg-[#F0A500] text-white font-medium py-3 rounded-xl text-sm hover:bg-[#D4920A] transition-colors text-center"
          >
            Ver protótipo (mock)
          </Link>
        </div>
      </div>
    </div>
  )
}
