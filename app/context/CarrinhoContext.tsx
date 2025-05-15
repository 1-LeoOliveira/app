'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface ItemCarrinho {
  id: number
  nome: string
  preco: number
  quantidade: number
  imagem: string
  opcoes?: string
}

interface CarrinhoContextType {
  carrinho: ItemCarrinho[]
  adicionarItem: (item: Omit<ItemCarrinho, 'quantidade'>) => void
  removerItem: (id: number) => void
  atualizarQuantidade: (id: number, quantidade: number) => void
  limparCarrinho: () => void
  total: number
  totalItens: number
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined)

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  // Carrega o carrinho do localStorage ao iniciar
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinhoHamburgueria')
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo))
    }
  }, [])

  // Salva no localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('carrinhoHamburgueria', JSON.stringify(carrinho))
  }, [carrinho])

  const adicionarItem = (item: Omit<ItemCarrinho, 'quantidade'>) => {
    setCarrinho(prev => {
      const itemExistente = prev.find(i => i.id === item.id && i.opcoes === item.opcoes)
      
      if (itemExistente) {
        return prev.map(i =>
          i.id === item.id && i.opcoes === item.opcoes
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }
      
      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  const removerItem = (id: number) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

  const atualizarQuantidade = (id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(id)
      return
    }
    
    setCarrinho(prev =>
      prev.map(item => (item.id === id ? { ...item, quantidade } : item))
    )
  }

  const limparCarrinho = () => {
    setCarrinho([])
  }

  const total = carrinho.reduce(
    (sum, item) => sum + item.preco * item.quantidade,
    0
  )

  const totalItens = carrinho.reduce(
    (sum, item) => sum + item.quantidade,
    0
  )

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        total,
        totalItens
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext)
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider')
  }
  return context
}