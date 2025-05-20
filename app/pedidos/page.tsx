'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CarrinhoItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
  opcaoSelecionada?: string;
}

export default function PedidosPage() {
  const router = useRouter()
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [numeroPedido, setNumeroPedido] = useState<string>('')
  // Gera número de pedido aleatório ao montar o componente
  useEffect(() => {
    const numero = Math.floor(10000 + Math.random() * 90000).toString()
    setNumeroPedido(numero)
  }, [])

  // Carrega carrinho do localStorage ao montar o componente
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho')
    if (carrinhoSalvo) {
      const itens = JSON.parse(carrinhoSalvo)
      // Adiciona quantidade se não existir
      const itensComQuantidade = itens.map((item: any) => ({
        ...item,
        quantidade: item.quantidade || 1
      }))
      setCarrinho(itensComQuantidade)
    }
    setCarregando(false)
  }, [])

  // Salva carrinho no localStorage quando atualizado
  useEffect(() => {
    if (!carregando) {
      if (carrinho.length > 0) {
        localStorage.setItem('carrinho', JSON.stringify(carrinho))
      } else {
        localStorage.removeItem('carrinho')
      }
    }
  }, [carrinho, carregando])

  // Calcula total
  const calcularTotal = () => {
    return carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0)
  }

  // Remove item do carrinho
  const removerItem = (idItem: string) => {
    const novoCarrinho = carrinho.filter(item => item.id !== idItem)
    setCarrinho(novoCarrinho)
  }

  // Adiciona quantidade ao item
  const aumentarQuantidade = (idItem: string) => {
    const novoCarrinho = carrinho.map(item => {
      if (item.id === idItem) {
        return { ...item, quantidade: (item.quantidade || 1) + 1 }
      }
      return item
    })
    setCarrinho(novoCarrinho)
  }

  // Diminui quantidade do item
  const diminuirQuantidade = (idItem: string) => {
    const novoCarrinho = carrinho.map(item => {
      if (item.id === idItem && item.quantidade > 1) {
        return { ...item, quantidade: item.quantidade - 1 }
      }
      return item
    })
    setCarrinho(novoCarrinho)
  }

  // Prosseguir para checkout
  const prosseguirParaCheckout = () => {
    const carrinhoParam = encodeURIComponent(JSON.stringify(carrinho))
    router.push(`/checkout?carrinho=${carrinhoParam}`)
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando seu carrinho...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/cardapio" 
              className="flex items-center text-gray-700"
            >
              <ArrowLeft className="mr-1" size={20} />
              <span className="hidden sm:inline">Voltar ao Cardápio</span>
            </Link>
            
            <h1 className="text-xl font-bold text-gray-800">Seu Pedido</h1>
            
            <Link href="/" className="flex items-center text-gray-700">
              <Home className="mr-1" size={20} />
              <span className="hidden sm:inline">Início</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {carrinho.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-6">Adicione itens do cardápio para continuar</p>
            <Link 
              href="/cardapio" 
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <>
            {/* Número do Pedido */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Número do Pedido</h2>
                <span className="text-xl font-bold text-gray-800">#{numeroPedido}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Itens do Pedido</h2>
              
              <div className="space-y-4">
                {carrinho.map(item => (
                  <div key={item.id} className="flex border-b pb-4">
                    {/* Imagem (se disponível) */}
                    {item.imagem && (
                      <div className="w-20 h-20 flex-shrink-0 mr-4 relative rounded overflow-hidden">
                        <Image
                          src={item.imagem}
                          alt={item.nome}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    
                    {/* Detalhes do Item */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-800">{item.nome}</h3>
                        <button 
                          className="text-gray-400 hover:text-red-500 ml-2"
                          onClick={() => removerItem(item.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        R$ {item.preco.toFixed(2)}
                        {item.opcaoSelecionada && ` • ${item.opcaoSelecionada}`}
                      </p>
                      
                      {/* Controle de Quantidade */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button 
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => diminuirQuantidade(item.id)}
                            disabled={item.quantidade <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1">{item.quantidade}</span>
                          <button 
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            onClick={() => aumentarQuantidade(item.id)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <span className="font-medium">
                          R$ {(item.preco * item.quantidade).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Resumo e Total */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  *Taxa de entrega calculada na finalização do pedido
                </p>
              </div>
            </div>
            
            {/* Botão de Finalizar */}
            <button
              onClick={prosseguirParaCheckout}
              className="w-full bg-gray-800 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Prosseguir para Finalização
            </button>
          </>
        )}
      </main>
    </div>
  )
}