'use client'

import { useState, useEffect, useRef } from 'react'
import cardapio from '../../data/cardapio.json'
import Image from 'next/image'
import Link from 'next/link'
import { Home, ChevronUp, ShoppingCart, Menu } from 'lucide-react'

export default function Cardapio() {
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('hamburgueres')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoriasRef = useRef<HTMLDivElement[]>([])

  // Carrega carrinho do localStorage ao montar o componente
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho')
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo))
    }
  }, [])

  // Salva carrinho no localStorage quando atualizado
  useEffect(() => {
    if (carrinho.length > 0) {
      localStorage.setItem('carrinho', JSON.stringify(carrinho))
    } else {
      localStorage.removeItem('carrinho')
    }
  }, [carrinho])

  // Configura observador de scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300)
      
      categoriasRef.current.forEach((ref, index) => {
        if (ref && window.scrollY >= ref.offsetTop - 120) {
          setActiveCategory(cardapio.categorias[index].nome.toLowerCase())
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const adicionarAoCarrinho = (item: any) => {
    const novoItem = {
      ...item,
      quantidade: 1 // Garante que cada novo item tenha quantidade 1
    }
    setCarrinho([...carrinho, novoItem])
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const scrollToCategory = (index: number) => {
    categoriasRef.current[index]?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center text-gray-800">
              <Home className="mr-1" size={20} />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            
            <h1 className="text-xl font-bold text-gray-800">Hamburgueria</h1>
            
            <div className="flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 p-2"
              >
                <Menu size={24} />
              </button>
              
              <Link
                href="/pedidos"
                className="relative p-2 text-gray-700"
              >
                <ShoppingCart size={24} />
                {carrinho.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {carrinho.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
          
          {/* Menu Horizontal (Desktop) */}
          <nav className="hidden md:flex justify-center py-2 border-t">
            <div className="flex space-x-1">
              {cardapio.categorias.map((categoria, index) => (
                <button
                  key={categoria.nome}
                  onClick={() => scrollToCategory(index)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === categoria.nome.toLowerCase() 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {categoria.nome}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
            </div>
            
            <nav className="p-2">
              {cardapio.categorias.map((categoria, index) => (
                <button
                  key={categoria.nome}
                  onClick={() => scrollToCategory(index)}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium mb-1 ${
                    activeCategory === categoria.nome.toLowerCase() 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {categoria.nome}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="pt-32 pb-12 container mx-auto px-4">
        {cardapio.categorias.map((categoria, index) => (
          <section 
            key={categoria.nome}
            ref={el => categoriasRef.current[index] = el as HTMLDivElement}
            className="mb-16"
            id={categoria.nome.toLowerCase()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
              {categoria.nome}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.itens.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={item.imagem}
                      alt={item.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.nome}</h3>
                      <span className="text-lg font-bold text-gray-900">
                        R$ {item.preco.toFixed(2)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm">{item.descricao}</p>
                    
                    {item.opcoes && (
                      <div className="mb-3 text-xs text-gray-500">
                        Opções: {item.opcoes.map(opt => opt.nome).join(', ')}
                      </div>
                    )}
                    
                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Botão para voltar ao topo */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-10"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  )
}