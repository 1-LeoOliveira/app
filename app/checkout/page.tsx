'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Copy, Check, Trash2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ItemCarrinho {
  id: string
  nome: string
  descricao?: string
  preco: number
  quantidade: number
  imagem?: string
  opcaoSelecionada?: string
  opcoes?: Array<{
    nome: string
    preco?: number
  }> | string[]
}

interface PedidoCompleto {
  numeroPedido: string
  itens: ItemCarrinho[]
  cliente: {
    nome: string
    telefone: string
    endereco: string
    localizacao?: string
    observacoes?: string
  }
  pagamento: string
}

const paymentMethods = [
  { id: 'dinheiro', name: 'Dinheiro' },
  { id: 'pix', name: 'PIX' },
  { id: 'cartao', name: 'Cartão' }
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [etapaAtual, setEtapaAtual] = useState(1)
  const totalEtapas = 3
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    localizacao: '',
    observacoes: ''
  })
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro')
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [showLocationOption, setShowLocationOption] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')
  const chavePix = "lanchonete@exemplo.com"

  // Gera número de pedido aleatório ao montar o componente
  useEffect(() => {
    const numero = Math.floor(10000 + Math.random() * 90000).toString()
    setNumeroPedido(numero)
  }, [])

  // Carrega carrinho do localStorage ou dos parâmetros de busca
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('carrinho')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          if (parsedCart.length > 0) {
            setCarrinho(parsedCart)
            return
          }
        }

        const carrinhoParam = searchParams.get('carrinho')
        if (carrinhoParam) {
          const parsedParam = JSON.parse(decodeURIComponent(carrinhoParam))
          setCarrinho(parsedParam)
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
        setCarrinho([])
      }
    }

    loadCart()
  }, [searchParams])

  // Salva carrinho no localStorage quando atualizado
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(carrinho))
  }, [carrinho])

  const copiarChavePix = async () => {
    try {
      await navigator.clipboard.writeText(chavePix)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const getLocation = () => {
    setIsLoadingLocation(true)
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationError('Seu navegador não suporta geolocalização')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setDadosCliente(prev => ({ 
          ...prev, 
          localizacao: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        }))
        setIsLoadingLocation(false)
        setShowLocationOption(true)
      },
      (err) => {
        setLocationError(`Erro ao obter localização: ${err.message}`)
        setIsLoadingLocation(false)
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    enviarPedido()
  }

  const enviarPedido = () => {
    if (!dadosCliente.nome || !dadosCliente.telefone) {
      alert('Por favor, informe seu nome e telefone')
      return
    }

    if (!dadosCliente.endereco) {
      alert('Por favor, informe seu endereço')
      return
    }

    if (!metodoPagamento) {
      alert('Por favor, selecione o método de pagamento')
      return
    }

    const pedidoCompleto: PedidoCompleto = {
      numeroPedido,
      itens: carrinho,
      cliente: dadosCliente,
      pagamento: metodoPagamento
    }

    const mensagemWhatsApp = gerarMensagemWhatsApp(pedidoCompleto)
    const telefoneEmpresa = '+5591982690087'
    const linkWhatsApp = `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagemWhatsApp)}`

    window.open(linkWhatsApp, '_blank')
  }

  const gerarMensagemWhatsApp = (pedido: PedidoCompleto) => {
    let mensagem = `*Novo Pedido - Lanchonete*\n`
    mensagem += `*Número do Pedido:* #${pedido.numeroPedido}\n\n`
    mensagem += `*Cliente:* ${pedido.cliente.nome}\n`
    mensagem += `*Telefone:* ${pedido.cliente.telefone}\n`
    mensagem += `*Endereço:* ${pedido.cliente.endereco}\n`
    
    if (pedido.cliente.localizacao) {
      mensagem += `*Localização:* ${pedido.cliente.localizacao}\n`
    }
    
    mensagem += `\n*Itens do Pedido:*\n`
    pedido.itens.forEach((item) => {
      mensagem += `- ${item.nome} x${item.quantidade}: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      if (item.descricao) {
        mensagem += `  ${item.descricao}\n`
      }
      if (item.opcaoSelecionada) {
        mensagem += `  Opção: ${item.opcaoSelecionada}\n`
      }
    })
  
    mensagem += `\n*Valor Total:* R$ ${pedido.itens.reduce((total, item) => 
      total + item.preco * item.quantidade, 0).toFixed(2)}\n\n`
  
    mensagem += `*Método de Pagamento:* ${paymentMethods.find(m => m.id === pedido.pagamento)?.name || pedido.pagamento.toUpperCase()}\n`
  
    if (pedido.cliente.observacoes) {
      mensagem += `*Observações:* ${pedido.cliente.observacoes}\n`
    }
  
    return mensagem
  }

  const valorTotal = carrinho.reduce((total, item) =>
    total + item.preco * item.quantidade, 0
  )

  const removerItem = (itemId: string) => {
    const novoCarrinho = carrinho.filter(item => item.id !== itemId)
    setCarrinho(novoCarrinho)
  }

  const avancarEtapa = () => {
    if (etapaAtual === 1 && (!dadosCliente.nome || !dadosCliente.telefone)) {
      alert('Por favor, preencha seu nome e telefone')
      return
    }
    
    if (etapaAtual === 2 && !dadosCliente.endereco) {
      alert('Por favor, informe seu endereço')
      return
    }

    if (etapaAtual < totalEtapas) {
      setEtapaAtual(prev => prev + 1)
    }
  }

  const voltarEtapa = () => {
    setEtapaAtual(prev => Math.max(prev - 1, 1))
  }

  const renderizarEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Informações Pessoais</h2>
            
            <div>
              <label className="block mb-2 text-gray-700 text-sm">Nome Completo*</label>
              <input
                type="text"
                value={dadosCliente.nome}
                onChange={(e) => setDadosCliente({ ...dadosCliente, nome: e.target.value })}
                className="w-full border rounded p-2 text-gray-800 bg-white focus:ring-2 focus:ring-gray-300 text-sm"
                required
                placeholder="Digite seu nome"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 text-sm">Telefone*</label>
              <input
                type="tel"
                value={dadosCliente.telefone}
                onChange={(e) => setDadosCliente({ ...dadosCliente, telefone: e.target.value })}
                className="w-full border rounded p-2 text-gray-800 bg-white focus:ring-2 focus:ring-gray-300 text-sm"
                required
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Endereço de Entrega</h2>
            
            <div>
              <label className="block mb-2 text-gray-700 text-sm">Endereço Completo*</label>
              <input
                type="text"
                value={dadosCliente.endereco}
                onChange={(e) => setDadosCliente({ ...dadosCliente, endereco: e.target.value })}
                className="w-full border rounded p-2 text-gray-800 bg-white focus:ring-2 focus:ring-gray-300 text-sm"
                required
                placeholder="Rua, número, bairro, complemento"
              />
            </div>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={getLocation}
                disabled={isLoadingLocation}
                className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 text-sm ${
                  isLoadingLocation 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isLoadingLocation ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Obtendo localização...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>Adicionar minha localização atual</span>
                  </>
                )}
              </button>
              
              {showLocationOption && dadosCliente.localizacao && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">Localização obtida:</p>
                  <p className="text-xs text-gray-600">{dadosCliente.localizacao}</p>
                  <button
                    type="button"
                    onClick={() => setDadosCliente(prev => ({ ...prev, localizacao: '' }))}
                    className="text-red-500 text-xs mt-1"
                  >
                    Remover localização
                  </button>
                </div>
              )}
              
              {locationError && (
                <p className="text-red-500 text-sm mt-1">{locationError}</p>
              )}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pagamento e Finalização</h2>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Número do Pedido:</span>
                <span className="font-bold">#{numeroPedido}</span>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-gray-700 text-sm">Método de Pagamento*</label>
              <select
                value={metodoPagamento}
                onChange={(e) => {
                  setMetodoPagamento(e.target.value)
                  if (e.target.value === 'pix') {
                    setIsQRCodeModalOpen(true)
                  }
                }}
                className="w-full border rounded p-2 text-gray-800 bg-white focus:ring-2 focus:ring-gray-300 text-sm"
                required
              > 
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>

            {metodoPagamento === 'pix' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsQRCodeModalOpen(true)}
                  className="w-full text-gray-600 underline text-sm mb-2"
                >
                  Visualizar QR Code PIX
                </button>
              </div>
            )}

            <div>
              <label className="block mb-2 text-gray-700 text-sm">Observações</label>
              <textarea
                value={dadosCliente.observacoes}
                onChange={(e) => setDadosCliente({ ...dadosCliente, observacoes: e.target.value })}
                className="w-full border rounded p-2 text-gray-800 bg-white focus:ring-2 focus:ring-gray-300 text-sm"
                rows={4}
                placeholder="Alguma observação especial?"
              />
            </div>

            <button
              type="button"
              onClick={enviarPedido}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center mt-4"
            >
              <FaWhatsapp className="mr-2" /> Finalizar Pedido
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col bg-gray-50">
      <div className="relative flex items-center justify-between mb-8">
        <Link
          href="/cardapio"
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" /> Voltar ao Cardápio
        </Link>
        <Link
          href="/"
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <Home className="mr-2" /> Início
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
        Finalizar Pedido
      </h1>

      {/* Progresso das etapas */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between relative">
          {/* Linha de progresso */}
          <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0">
            <div 
              className="h-full bg-gray-600 transition-all duration-300" 
              style={{ width: `${((etapaAtual - 1) / (totalEtapas - 1)) * 100}%` }}
            ></div>
          </div>
          
          {[1, 2, 3].map((etapa) => (
            <div key={etapa} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa <= etapaAtual ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {etapa}
              </div>
              <span className="text-xs mt-1 text-gray-700">
                {etapa === 1 ? 'Dados' : etapa === 2 ? 'Endereço' : 'Pagamento'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md flex-grow"
      >
        {carrinho.length > 0 ? (
          <>
            {/* Resumo do pedido */}
            <div className="mb-6">
              <h2 className="text-gray-800 font-bold mb-3 text-lg">Seu Pedido</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {carrinho.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    {item.imagem && (
                      <div className="w-16 h-16 flex-shrink-0 mr-3 relative rounded overflow-hidden">
                        <Image
                          src={item.imagem}
                          alt={item.nome}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.nome}</h3>
                      {item.descricao && (
                        <p className="text-xs text-gray-500">{item.descricao}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantidade}
                        {item.opcaoSelecionada && ` • ${item.opcaoSelecionada}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <span className="font-medium text-gray-800">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerItem(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t border-gray-200 text-right">
                <span className="font-bold text-gray-800 text-lg">
                  Total: R$ {valorTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Conteúdo da etapa atual */}
            {renderizarEtapa()}

            {/* Navegação entre etapas (apenas para etapas 1 e 2) */}
            {etapaAtual < 3 && (
              <div className="mt-6 flex justify-between">
                {etapaAtual > 1 ? (
                  <button
                    type="button"
                    onClick={voltarEtapa}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
                  >
                    <ChevronLeft className="mr-1" size={18} />
                    Voltar
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="button"
                  onClick={avancarEtapa}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                >
                  Próximo
                  <ChevronRight className="ml-1" size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600 mb-4">Seu carrinho está vazio</p>
            <Link
              href="/cardapio"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 inline-block"
            >
              Voltar ao Cardápio
            </Link>
          </div>
        )}
      </form>

      {/* Modal QR Code PIX */}
      <Dialog open={isQRCodeModalOpen} onOpenChange={setIsQRCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code PIX</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/img/qrpix.png"
              alt="QR Code PIX"
              width={256}
              height={256}
              className="object-contain"
            />
            <div className="text-center space-y-2">
              <p className="font-medium">Valor Total: R$ {valorTotal.toFixed(2)}</p>
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-500">
                  Escaneie o QR Code acima ou copie a chave PIX abaixo
                </p>
                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg w-full max-w-xs">
                  <span className="text-sm text-gray-600 truncate">
                    {chavePix}
                  </span>
                  <button
                    type="button"
                    onClick={copiarChavePix}
                    className="flex items-center justify-center p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {copiado ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {copiado && (
                  <span className="text-xs text-green-500">
                    Chave PIX copiada!
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}