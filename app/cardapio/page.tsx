'use client'

import { useState, useEffect, useRef } from 'react'
import cardapioData from '../../data/cardapio.json'
import Image from 'next/image'
import Link from 'next/link'
import { Home, ChevronUp, ShoppingCart, Menu, X } from 'lucide-react'

interface OpcaoItem {
  nome: string;
  preco?: number;
}

interface ItemCardapio {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  opcoes?: string[] | OpcaoItem[];
}

interface Categoria {
  nome: string;
  itens: ItemCardapio[];
}

interface CarrinhoItem extends Omit<ItemCardapio, 'opcoes'> {
  quantidade: number;
  opcoesSelecionadas?: string[];
}

const cardapio: { categorias: Categoria[] } = cardapioData as { categorias: Categoria[] };

export default function Cardapio() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [activeCategory, setActiveCategory] = useState('hamburgueres')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoriasRef = useRef<(HTMLElement | null)[]>([])
  
  const [modalOpen, setModalOpen] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState<ItemCardapio | null>(null)
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState<Record<string, boolean | string>>({})
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho')
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo))
    }
  }, [])

  useEffect(() => {
    if (carrinho.length > 0) {
      localStorage.setItem('carrinho', JSON.stringify(carrinho))
    } else {
      localStorage.removeItem('carrinho')
    }
  }, [carrinho])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300)
      
      categoriasRef.current.forEach((ref, index) => {
        if (ref && cardapio.categorias[index] && window.scrollY >= ref.offsetTop - 120) {
          setActiveCategory(cardapio.categorias[index].nome.toLowerCase())
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const abrirModalOpcoes = (item: ItemCardapio) => {
    setItemSelecionado(item)
    setOpcoesSelecionadas({})
    setQuantidade(1)
    setModalOpen(true)
  }

  const adicionarAoCarrinhoSemOpcoes = (item: ItemCardapio) => {
    const novoItem: CarrinhoItem = {
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      imagem: item.imagem,
      quantidade: 1
    }
    setCarrinho([...carrinho, novoItem])
  }

  const adicionarAoCarrinhoComOpcoes = () => {
    if (!itemSelecionado) return
    
    const opcoesFormatadas: string[] = []
    let precoTotal = itemSelecionado.preco

    if (itemSelecionado.opcoes && Array.isArray(itemSelecionado.opcoes)) {
      if (typeof itemSelecionado.opcoes[0] === 'string') {
        if (typeof opcoesSelecionadas.opcao === 'string') {
          opcoesFormatadas.push(opcoesSelecionadas.opcao)
        }
      } else {
        (itemSelecionado.opcoes as OpcaoItem[]).forEach(opcao => {
          if (opcoesSelecionadas[opcao.nome]) {
            opcoesFormatadas.push(`${opcao.nome}${opcao.preco ? ` (+R$ ${opcao.preco.toFixed(2)})` : ''}`)
            if (opcao.preco) {
              precoTotal += opcao.preco
            }
          }
        })
      }
    }

    const novoItem: CarrinhoItem = {
      id: itemSelecionado.id,
      nome: itemSelecionado.nome,
      descricao: itemSelecionado.descricao,
      preco: precoTotal,
      imagem: itemSelecionado.imagem,
      quantidade: quantidade,
      opcoesSelecionadas: opcoesFormatadas.length > 0 ? opcoesFormatadas : undefined
    }

    setCarrinho([...carrinho, novoItem])
    setModalOpen(false)
  }

  const handleOpcaoSimples = (opcao: string) => {
    setOpcoesSelecionadas({ opcao })
  }

  const handleOpcaoComPreco = (nome: string, checked: boolean) => {
    setOpcoesSelecionadas({
      ...opcoesSelecionadas,
      [nome]: checked
    })
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

  const getBackgroundStyle = (imageSrc: string): string => {
    if (imageSrc.includes('hamburguer') || imageSrc.includes('frango') || imageSrc.includes('lanche')) {
      return 'bg-white'
    }
    return ''
  }

  const temOpcoes = (item: ItemCardapio): boolean => {
    return !!item.opcoes && item.opcoes.length > 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              
              <Link href="/pedidos" className="relative p-2 text-gray-700">
                <ShoppingCart size={24} />
                {carrinho.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {carrinho.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
          
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

      <main className="pt-32 pb-12 container mx-auto px-4">
        {cardapio.categorias.map((categoria, index) => (
          <section 
            key={categoria.nome}
            ref={el => {
              if (el) {
                categoriasRef.current[index] = el
              }
            }}
            className="mb-16"
            id={categoria.nome.toLowerCase()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
              {categoria.nome}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.itens.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className={`relative h-48 overflow-hidden group ${getBackgroundStyle(item.imagem)}`}>
                    <Image
                      src={item.imagem}
                      alt={item.nome}
                      fill
                      className="object-contain object-center transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:blur-sm p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <span className="text-white font-bold text-lg shadow-lg">{item.nome}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.nome}</h3>
                      <span className="text-lg font-bold text-gray-900">
                        R$ {item.preco.toFixed(2)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm">{item.descricao}</p>
                    
                    {temOpcoes(item) && (
                      <div className="mb-3 text-xs text-gray-500">
                        {Array.isArray(item.opcoes) && typeof item.opcoes[0] === 'object' 
                          ? `Opções: ${(item.opcoes as OpcaoItem[]).map(opt => opt.nome).join(', ')}`
                          : `Opções: ${(item.opcoes as string[]).join(', ')}`
                        }
                      </div>
                    )}
                    
                    <button
                      onClick={() => temOpcoes(item) ? abrirModalOpcoes(item) : adicionarAoCarrinhoSemOpcoes(item)}
                      className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                    >
                      {temOpcoes(item) ? "Selecionar Opções" : "Adicionar ao Carrinho"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {modalOpen && itemSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{itemSelecionado.nome}</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">{itemSelecionado.descricao}</p>
              <p className="font-bold">R$ {itemSelecionado.preco.toFixed(2)}</p>
            </div>
            
            {itemSelecionado.opcoes && itemSelecionado.opcoes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">
                  {Array.isArray(itemSelecionado.opcoes) && typeof itemSelecionado.opcoes[0] === 'object' 
                    ? "Adicionais" 
                    : "Opções"
                  }
                </h4>
                
                {Array.isArray(itemSelecionado.opcoes) && typeof itemSelecionado.opcoes[0] === 'string' && (
                  <div className="space-y-2">
                    {(itemSelecionado.opcoes as string[]).map((opcao, i) => (
                      <div key={i} className="flex items-center">
                        <input 
                          type="radio"
                          id={`opcao-${i}`}
                          name="opcao"
                          value={opcao}
                          checked={opcoesSelecionadas.opcao === opcao}
                          onChange={() => handleOpcaoSimples(opcao)}
                          className="mr-2"
                        />
                        <label htmlFor={`opcao-${i}`} className="text-gray-700">{opcao}</label>
                      </div>
                    ))}
                  </div>
                )}
                
                {Array.isArray(itemSelecionado.opcoes) && typeof itemSelecionado.opcoes[0] === 'object' && (
                  <div className="space-y-2">
                    {(itemSelecionado.opcoes as OpcaoItem[]).map((opcao, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input 
                            type="checkbox"
                            id={`opcao-${i}`}
                            checked={!!opcoesSelecionadas[opcao.nome]}
                            onChange={(e) => handleOpcaoComPreco(opcao.nome, e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor={`opcao-${i}`} className="text-gray-700">{opcao.nome}</label>
                        </div>
                        {opcao.preco && (
                          <span className="text-gray-600">+ R$ {opcao.preco.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Quantidade</h4>
              <div className="flex items-center border rounded-md w-32">
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => quantidade > 1 && setQuantidade(quantidade - 1)}
                >
                  -
                </button>
                <span className="flex-1 text-center">{quantidade}</span>
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => setQuantidade(quantidade + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <button
              onClick={adicionarAoCarrinhoComOpcoes}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      )}

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