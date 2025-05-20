import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-xl shadow-md w-full max-w-md mx-4">
        <div className="mb-6">
          <Image 
            src="/logo.png" 
            alt="Logo do Restaurante" 
            width={160}
            height={160}
            className="mx-auto rounded-full w-40 h-40 object-cover border-2 border-gray-200"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Nome do Restaurante
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Gastronomia de qualidade
        </p>
        
        <div className="space-y-4">
          <Link
            href="/cardapio"
            className="block w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Ver Cardápio
          </Link>
          
          <Link
            href="/sobre"
            className="block w-full border border-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Conheça Nosso Restaurante
          </Link>
        </div>
      </div>
    </div>
  )
}