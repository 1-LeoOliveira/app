'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Home, ChevronUp, ShoppingCart, Menu, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useDisponibilidadeProdutos } from '../../utils/googleSheets'

// Dados do cardápio (mantido local para estrutura e preços)
const cardapioData = {
  "categorias": [
    {
      "nome": "Hamburgueres",
      "itens": [
        {
          "id": 1,
          "nome": "Clássico",
          "categoria": "Hamburgueres",
          "descricao": "Pão brioche, hambúrguer 180g, queijo cheddar, alface, tomate e molho especial",
          "imagem": "/hamburgueres/classico.jpg",
          "preco": 28.90,
          "opcoes": [
            {
              "nome": "Bacon",
              "preco": 5.00
            },
            {
              "nome": "Ovo",
              "preco": 3.00
            }
          ]
        },
        {
          "id": 2,
          "nome": "Vegetariano",
          "categoria": "Hamburgueres",
          "descricao": "Pão integral, hambúrguer de grão-de-bico, queijo coalho, rúcula e molho de iogurte",
          "imagem": "/hamburgueres/vegetariano.jpg",
          "preco": 32.90
        },
        {
          "id": 3,
          "nome": "Bacon Crunch",
          "categoria": "Hamburgueres",
          "descricao": "Pão brioche, hambúrguer 200g, queijo prato, bacon crocante, cebola caramelizada e molho barbecue",
          "imagem": "/hamburgueres/bacon.jpg",
          "preco": 34.90
        },
        {
          "id": 4,
          "nome": "Frango Empanado",
          "categoria": "Hamburgueres",
          "descricao": "Pão australiano, filé de frango empanado, queijo mussarela, alface e molho de ervas",
          "imagem": "/hamburgueres/frango.jpg",
          "preco": 29.90
        },
        {
          "id": 5,
          "nome": "Costela BBQ",
          "categoria": "Hamburgueres",
          "descricao": "Pão de brioche, hambúrguer de costela 200g, queijo cheddar, cebola roxa e molho barbecue",
          "imagem": "/hamburgueres/costela.jpg",
          "preco": 36.90
        },
        {
          "id": 6,
          "nome": "Duplo Cheddar",
          "categoria": "Hamburgueres",
          "descricao": "Pão brioche, 2 hambúrgueres 150g, duplo cheddar, cebola crispy e molho especial",
          "imagem": "/hamburgueres/duplo.jpg",
          "preco": 38.90
        }
      ]
    },
    {
      "nome": "Acompanhamentos",
      "itens": [
        {
          "id": 101,
          "nome": "Batata Frita",
          "categoria": "Acompanhamentos",
          "descricao": "Porção de batata frita crocante com tempero da casa",
          "imagem": "/acompanhamentos/batata.jpg",
          "preco": 15.90,
          "opcoes": [
            {
              "nome": "Pequena",
              "preco": 10.90
            },
            {
              "nome": "Grande",
              "preco": 15.90
            }
          ]
        },
        {
          "id": 102,
          "nome": "Onion Rings",
          "categoria": "Acompanhamentos",
          "descricao": "Anéis de cebola empanados e crocantes",
          "imagem": "/acompanhamentos/onion.jpg",
          "preco": 12.90
        },
        {
          "id": 103,
          "nome": "Nuggets de Frango",
          "categoria": "Acompanhamentos",
          "descricao": "6 unidades de nuggets crocantes com molho à escolha",
          "imagem": "/acompanhamentos/nuggets.jpg",
          "preco": 14.90,
          "opcoes": [
            "Barbecue",
            "Mostarda e Mel",
            "Cheddar"
          ]
        },
        {
          "id": 104,
          "nome": "Polenta Frita",
          "categoria": "Acompanhamentos",
          "descricao": "Porção de polenta frita crocante",
          "imagem": "/acompanhamentos/polenta.jpg",
          "preco": 11.90
        },
        {
          "id": 105,
          "nome": "Mandioca Frita",
          "categoria": "Acompanhamentos",
          "descricao": "Porção de mandioca frita com tempero especial",
          "imagem": "/acompanhamentos/mandioca.jpg",
          "preco": 13.90
        },
        {
          "id": 106,
          "nome": "Mix de Fritas",
          "categoria": "Acompanhamentos",
          "descricao": "Porção com batata, mandioca e polenta fritas",
          "imagem": "/acompanhamentos/mix.jpg",
          "preco": 18.90
        }
      ]
    },
    {
      "nome": "Bebidas",
      "itens": [
        {
          "id": 201,
          "nome": "Refrigerantes",
          "categoria": "Bebidas",
          "descricao": "Lata 350ml",
          "imagem": "/bebidas/refri.jpg",
          "preco": 7.90,
          "opcoes": [
            "Coca-Cola",
            "Guaraná",
            "Fanta"
          ]
        },
        {
          "id": 202,
          "nome": "Sucos Naturais",
          "categoria": "Bebidas",
          "descricao": "Copo 500ml",
          "imagem": "/bebidas/sucos.jpg",
          "preco": 10.90,
          "opcoes": [
            "Laranja",
            "Abacaxi com Hortelã",
            "Maracujá",
            "Manga"
          ]
        },
        {
          "id": 203,
          "nome": "Água Mineral",
          "categoria": "Bebidas",
          "descricao": "Garrafa 500ml",
          "imagem": "/bebidas/agua.jpg",
          "preco": 4.90,
          "opcoes": [
            "Com gás",
            "Sem gás"
          ]
        },
        {
          "id": 204,
          "nome": "Cervejas",
          "categoria": "Bebidas",
          "descricao": "Long neck 355ml",
          "imagem": "/bebidas/cervejas.jpg",
          "preco": 8.90,
          "opcoes": [
            "Pilsen",
            "IPA",
            "Weiss"
          ]
        },
        {
          "id": 205,
          "nome": "Chá Gelado",
          "categoria": "Bebidas",
          "descricao": "Copo 500ml",
          "imagem": "/bebidas/cha.jpg",
          "preco": 9.90,
          "opcoes": [
            "Pêssego",
            "Limão",
            "Manga"
          ]
        },
        {
          "id": 206,
          "nome": "Energético",
          "categoria": "Bebidas",
          "descricao": "Lata 250ml",
          "imagem": "/bebidas/energetico.jpg",
          "preco": 12.90,
          "opcoes": [
            "Original",
            "Zero Açúcar"
          ]
        }
      ]
    },
    {
      "nome": "Sobremesas",
      "itens": [
        {
          "id": 301,
          "nome": "Milkshake",
          "categoria": "Sobremesas",
          "descricao": "Copo 400ml com sorvete artesanal",
          "imagem": "/sobremesas/milk.jpg",
          "preco": 18.90,
          "opcoes": [
            "Chocolate",
            "Morango",
            "Baunilha"
          ]
        },
        {
          "id": 302,
          "nome": "Brownie",
          "categoria": "Sobremesas",
          "descricao": "Brownie de chocolate com sorvete de creme",
          "imagem": "/sobremesas/brownie.jpg",
          "preco": 14.90,
          "opcoes": [
            "Com calda de chocolate",
            "Com calda de caramelo"
          ]
        },
        {
          "id": 303,
          "nome": "Petit Gateau",
          "categoria": "Sobremesas",
          "descricao": "Bolo de chocolate com recheio cremoso e sorvete",
          "imagem": "/sobremesas/petit.jpg",
          "preco": 19.90
        },
        {
          "id": 304,
          "nome": "Torta de Limão",
          "categoria": "Sobremesas",
          "descricao": "Fatia de torta de limão com merengue",
          "imagem": "/sobremesas/torta.jpg",
          "preco": 12.90
        },
        {
          "id": 305,
          "nome": "Sorvete",
          "categoria": "Sobremesas",
          "descricao": "3 bolas de sorvete artesanal",
          "imagem": "/sobremesas/sorvete.jpg",
          "preco": 13.90,
          "opcoes": [
            "Chocolate",
            "Morango",
            "Creme",
            "Flocos"
          ]
        },
        {
          "id": 306,
          "nome": "Cheesecake",
          "categoria": "Sobremesas",
          "descricao": "Fatia de cheesecake com calda de frutas vermelhas",
          "imagem": "/sobremesas/chees.jpg",
          "preco": 16.90,
          "opcoes": [
            "Morango",
            "Mirtilo",
            "Maracujá"
          ]
        }
      ]
    }
  ]
};

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

interface FlyingItem {
  id: number;
  nome: string;
  imagem: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
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
  
  // Estados para animação
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([])
  const [cartShake, setCartShake] = useState(false)
  const [flyingId, setFlyingId] = useState(0)
  const cartRef = useRef<HTMLDivElement>(null)

  // Hook simplificado do Google Sheets
  const {
    loading,
    error,
    lastUpdate,
    isProdutoDisponivel,
    recarregar
  } = useDisponibilidadeProdutos();

  // Gerenciamento do carrinho
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho')
    if (carrinhoSalvo) {
      try {
        setCarrinho(JSON.parse(carrinhoSalvo))
      } catch (error) {
        localStorage.removeItem('carrinho')
      }
    }
  }, [])

  useEffect(() => {
    if (carrinho.length > 0) {
      localStorage.setItem('carrinho', JSON.stringify(carrinho))
    } else {
      localStorage.removeItem('carrinho')
    }
  }, [carrinho])

  // Controle do scroll
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

  // Função para criar animação de voo
  const createFlyingAnimation = (item: ItemCardapio, sourceElement: HTMLElement) => {
    if (!cartRef.current) return

    const sourceRect = sourceElement.getBoundingClientRect()
    const cartRect = cartRef.current.getBoundingClientRect()
    
    const newFlyingId = flyingId + 1
    setFlyingId(newFlyingId)

    const flyingItem: FlyingItem = {
      id: newFlyingId,
      nome: item.nome,
      imagem: item.imagem,
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      endX: cartRect.left + cartRect.width / 2,
      endY: cartRect.top + cartRect.height / 2
    }

    setFlyingItems(prev => [...prev, flyingItem])

    setTimeout(() => {
      setFlyingItems(prev => prev.filter(f => f.id !== newFlyingId))
      setCartShake(true)
      setTimeout(() => setCartShake(false), 600)
    }, 800)
  }

  const abrirModalOpcoes = (item: ItemCardapio) => {
    const disponivel = isProdutoDisponivel(item.id);
    
    if (!disponivel) {
      console.log(`[Cardapio] Produto ${item.nome} indisponível - modal não será aberto`);
      return;
    }
    
    setItemSelecionado(item)
    setOpcoesSelecionadas({})
    setQuantidade(1)
    setModalOpen(true)
  }

  const adicionarAoCarrinhoSemOpcoes = (item: ItemCardapio, event: React.MouseEvent<HTMLButtonElement>) => {
    const disponivel = isProdutoDisponivel(item.id);
    
    if (!disponivel) {
      console.log(`[Cardapio] Produto ${item.nome} indisponível - não adicionado ao carrinho`);
      return;
    }
    
    const novoItem: CarrinhoItem = {
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      imagem: item.imagem,
      quantidade: 1
    }
    
    setCarrinho([...carrinho, novoItem])
    
    // Animação de voo
    const button = event.currentTarget
    const productCard = button.closest('.product-card') as HTMLElement
    if (productCard) {
      createFlyingAnimation(item, productCard)
    }
  }

  const adicionarAoCarrinhoComOpcoes = () => {
    if (!itemSelecionado) return;
    
    const disponivel = isProdutoDisponivel(itemSelecionado.id);
    
    if (!disponivel) {
      console.log(`[Cardapio] Produto ${itemSelecionado.nome} indisponível - modal será fechado`);
      setModalOpen(false);
      return;
    }
    
    const opcoesFormatadas: string[] = []
    let precoTotal = itemSelecionado.preco

    if (itemSelecionado.opcoes && Array.isArray(itemSelecionado.opcoes)) {
      if (typeof itemSelecionado.opcoes[0] === 'string') {
        if (opcoesSelecionadas.opcao) {
          opcoesFormatadas.push(opcoesSelecionadas.opcao as string)
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
    
    setCartShake(true)
    setTimeout(() => setCartShake(false), 600)
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

  const temOpcoes = (item: ItemCardapio): boolean => {
    return !!item.opcoes && item.opcoes.length > 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flying Items */}
      {flyingItems.map((flyingItem) => (
        <div
          key={flyingItem.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${flyingItem.startX}px`,
            top: `${flyingItem.startY}px`,
            transform: 'translate(-50%, -50%)',
            animation: `flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
          }}
        >
          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-400">
            <div className="w-8 h-8 relative">
              <Image
                src={flyingItem.imagem}
                alt={flyingItem.nome}
                fill
                className="object-contain rounded"
                sizes="32px"
              />
            </div>
          </div>
        </div>
      ))}

      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center text-gray-800">
              <Home className="mr-1" size={20} />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            
            <h1 className="text-xl font-bold text-gray-800">Hamburgueria</h1>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={recarregar}
                disabled={loading}
                className={`p-2 transition-colors ${
                  loading 
                    ? 'text-blue-600 cursor-not-allowed' 
                    : error 
                      ? 'text-red-600 hover:text-red-800' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Atualizar disponibilidade"
              >
                <RefreshCw 
                  size={18} 
                  className={loading ? 'animate-spin' : ''}
                />
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 p-2"
              >
                <Menu size={24} />
              </button>
              
              <Link href="/pedidos" className="relative p-2 text-gray-700">
                <div 
                  ref={cartRef}
                  className={`transition-transform duration-150 ${
                    cartShake ? 'animate-bounce' : ''
                  }`}
                >
                  <ShoppingCart 
                    size={24} 
                    className={cartShake ? 'text-green-600' : ''}
                  />
                  {carrinho.length > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                      cartShake ? 'animate-pulse bg-green-500 scale-110' : ''
                    }`}>
                      {carrinho.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
          
          {/* Navegação e Status */}
          <div className="flex justify-between items-center py-2 border-t">
            <nav className="hidden md:flex justify-center flex-1">
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
            
            {/* Status simplificado */}
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <div className="flex items-center">
                {error ? (
                  <WifiOff size={14} className="text-red-500 mr-1" />
                ) : (
                  <Wifi size={14} className="text-green-500 mr-1" />
                )}
                <span className={error ? 'text-red-500' : 'text-green-600'}>
                  {error ? 'Erro de Conexão' : 'Conectado'}
                </span>
              </div>

              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-400' : 'bg-green-400'
                }`} />
                {loading ? 'Carregando...' : 
                  error ? 'Usando cache' :
                  lastUpdate ? `Atualizado ${lastUpdate.toLocaleTimeString()}` : 'Pronto'
                }
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
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
              {categoria.itens.map(item => {
                // FOCO: Verificar disponibilidade diretamente da planilha
                const disponivel = isProdutoDisponivel(item.id);
                
                console.log(`[Cardapio] Renderizando ${item.nome} (ID: ${item.id}) - Disponível: ${disponivel}`);
                
                return (
                  <div 
                    key={item.id} 
                    className={`product-card bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col h-full ${
                      disponivel 
                        ? 'hover:shadow-lg cursor-pointer' 
                        : 'cursor-not-allowed'
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden group">
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        fill
                        className={`object-contain object-center transition-all duration-300 ease-in-out transform p-2 ${
                          disponivel 
                            ? 'group-hover:scale-110 group-hover:blur-sm' 
                            : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                      />
                      
                      {/* Mensagem sutil de esgotado */}
                      {!disponivel && (
                        <div className="absolute top-3 right-3 z-30">
                          <span className="text-white font-semibold text-xs bg-red-500 px-2 py-1 rounded-md shadow-md">
                            Esgotado
                          </span>
                        </div>
                      )}
                      
                      {disponivel && (
                        <>
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <span className="text-white font-bold text-lg shadow-lg">{item.nome}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{item.nome}</h3>
                        <span className="text-lg font-bold text-gray-900">
                          R$ {item.preco.toFixed(2)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm flex-grow">{item.descricao}</p>
                      
                      {temOpcoes(item) && (
                        <div className="mb-3 text-xs text-gray-500">
                          {Array.isArray(item.opcoes) && typeof item.opcoes[0] === 'object' 
                            ? `Opções: ${(item.opcoes as OpcaoItem[]).map(opt => opt.nome).join(', ')}`
                            : `Opções: ${(item.opcoes as string[]).join(', ')}`
                          }
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          if (disponivel) {
                            if (temOpcoes(item)) {
                              abrirModalOpcoes(item);
                            } else {
                              adicionarAoCarrinhoSemOpcoes(item, e);
                            }
                          }
                        }}
                        disabled={!disponivel}
                        className={`w-full py-2 rounded text-sm font-medium transition-all duration-200 mt-auto ${
                          disponivel
                            ? 'bg-gray-800 text-white hover:bg-gray-700 transform hover:scale-105 active:scale-95'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {!disponivel 
                          ? "ESGOTADO"
                          : temOpcoes(item) 
                            ? "Selecionar Opções" 
                            : "Adicionar ao Carrinho"
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Modal simplificado */}
      {modalOpen && itemSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{itemSelecionado.nome}</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Verificação simples de disponibilidade */}
            {!isProdutoDisponivel(itemSelecionado.id) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-red-700 font-medium">
                  Este produto está esgotado
                </span>
              </div>
            )}
            
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
              disabled={!isProdutoDisponivel(itemSelecionado.id)}
              className={`w-full py-3 rounded-lg transition-all duration-200 ${
                isProdutoDisponivel(itemSelecionado.id)
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProdutoDisponivel(itemSelecionado.id) 
                ? "Adicionar ao Carrinho" 
                : "Produto Esgotado"
              }
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

      <style jsx>{`
        @keyframes flyToCart {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(
              calc(${flyingItems[0]?.endX || 0}px - ${flyingItems[0]?.startX || 0}px - 50%), 
              calc(${flyingItems[0]?.endY || 0}px - ${flyingItems[0]?.startY || 0}px - 150px)
            ) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(
              calc(${flyingItems[0]?.endX || 0}px - ${flyingItems[0]?.startX || 0}px - 50%), 
              calc(${flyingItems[0]?.endY || 0}px - ${flyingItems[0]?.startY || 0}px - 50%)
            ) scale(0.3);
            opacity: 0;
          }
        }
        
        .animate-bounce {
          animation: cartBounce 0.6s ease-in-out;
        }
        
        @keyframes cartBounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-8px) rotate(-5deg); }
          50% { transform: translateY(0) rotate(5deg); }
          75% { transform: translateY(-4px) rotate(-2deg); }
        }
      `}</style>
    </div>
  )
}