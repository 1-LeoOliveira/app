// utils/googleSheets.ts - Versão com Fallback Local
import { useState, useEffect, useCallback } from 'react';

export interface ProdutoDisponibilidade {
  id: number;
  nome: string;
  disponivel: boolean;
  categoria?: string;
}

// Configuração
const GOOGLE_SHEETS_API_KEY = 'AIzaSyA09Jv2bQ8DcdqtbL4Zje5WM2YAGJFI8S8';
const SPREADSHEET_ID = '1PB83VB1tQj2mNTiEsk-FIOIDxjPsDDck-3LpeKjm9Q4';

// DADOS DE FALLBACK LOCAL - Para testar enquanto resolve a API
const DADOS_FALLBACK: Record<number, boolean> = {
  // Hamburgueres
  1: true,    // Clássico
  2: false,   // Vegetariano - TESTE: Indisponível
  3: true,    // Bacon Crunch
  4: true,    // Frango Empanado
  5: false,   // Costela BBQ - TESTE: Indisponível
  6: true,    // Duplo Cheddar
  
  // Acompanhamentos
  101: true,  // Batata Frita
  102: false, // Onion Rings - TESTE: Indisponível
  103: true,  // Nuggets de Frango
  104: true,  // Polenta Frita
  105: true,  // Mandioca Frita
  106: false, // Mix de Fritas - TESTE: Indisponível
  
  // Bebidas
  201: true,  // Refrigerantes
  202: true,  // Sucos Naturais
  203: true,  // Água Mineral
  204: false, // Cervejas - TESTE: Indisponível
  205: true,  // Chá Gelado
  206: true,  // Energético
  
  // Sobremesas
  301: true,  // Milkshake
  302: false, // Brownie - TESTE: Indisponível
  303: true,  // Petit Gateau
  304: true,  // Torta de Limão
  305: true,  // Sorvete
  306: false  // Cheesecake - TESTE: Indisponível
};

// Função para buscar dados do Google Sheets
async function buscarDadosDaPlanilha(): Promise<ProdutoDisponibilidade[]> {
  try {
    console.log('[GoogleSheets] 🔄 Tentando buscar dados da planilha...');
    
    const range = 'Sheet1!A:D';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    console.log('[GoogleSheets] 🌐 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('[GoogleSheets] 📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      let errorDetails;
      try {
        const errorText = await response.text();
        errorDetails = `Status: ${response.status}, Message: ${response.statusText}, Body: ${errorText}`;
      } catch (e) {
        errorDetails = `Status: ${response.status}, Message: ${response.statusText}`;
      }
      
      console.error('[GoogleSheets] ❌ Erro na resposta:', errorDetails);
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[GoogleSheets] 📊 Dados recebidos - Range:', data.range);
    console.log('[GoogleSheets] 📊 Número de linhas:', data.values ? data.values.length : 0);
    console.log('[GoogleSheets] 📊 Primeira linha (cabeçalho):', data.values ? data.values[0] : 'Nenhuma');
    
    if (!data.values || data.values.length === 0) {
      console.log('[GoogleSheets] ⚠️ Nenhum dado encontrado na planilha');
      throw new Error('Planilha vazia ou sem dados');
    }
    
    if (data.values.length === 1) {
      console.log('[GoogleSheets] ⚠️ Apenas cabeçalho encontrado, sem dados de produtos');
      throw new Error('Planilha contém apenas cabeçalho, sem produtos');
    }
    
    // Processar dados
    const linhas = data.values.slice(1); // Pular cabeçalho
    console.log('[GoogleSheets] 🔍 Processando linhas:', linhas);
    console.log('[GoogleSheets] 🔍 Total de linhas para processar:', linhas.length);
    
    const produtos: ProdutoDisponibilidade[] = linhas
      .map((linha: string[], index: number) => {
        try {
          // Verificar se a linha tem dados válidos
          if (!linha || linha.length < 2) {
            console.log(`[GoogleSheets] ⚠️ Linha ${index + 2} inválida ignorada:`, linha);
            return null;
          }
          
          const id = parseInt(linha[0] || '0');
          const nome = (linha[1] || '').trim();
          const disponivel = parseDisponibilidade(linha[2]);
          const categoria = (linha[3] || '').trim();
          
          console.log(`[GoogleSheets] 🔍 Linha ${index + 2}: ID="${linha[0]}" Nome="${linha[1]}" Disponivel="${linha[2]}" → Parseado: ID=${id}, Disponivel=${disponivel}`);
          
          // Verificar se ID é válido
          if (isNaN(id) || id <= 0) {
            console.log(`[GoogleSheets] ⚠️ ID inválido ignorado na linha ${index + 2}: "${linha[0]}"`);
            return null;
          }
          
          // Verificar se nome não está vazio
          if (!nome) {
            console.log(`[GoogleSheets] ⚠️ Nome vazio ignorado para ID ${id} na linha ${index + 2}`);
            return null;
          }
          
          const produto = { id, nome, disponivel, categoria };
          console.log(`[GoogleSheets] ✅ Produto válido: ID=${id}, Nome=${nome}, Disponível=${disponivel}`);
          return produto;
          
        } catch (error) {
          console.error(`[GoogleSheets] ❌ Erro ao processar linha ${index + 2}:`, linha, error);
          return null;
        }
      })
      .filter((produto) => {
        const valido = produto !== null && 
               produto !== undefined && 
               typeof produto === 'object' &&
               'id' in produto && 
               'nome' in produto &&
               produto.id > 0 && 
               produto.nome.length > 0;
        
        if (!valido && produto) {
          console.log('[GoogleSheets] ⚠️ Produto filtrado:', produto);
        }
        
        return valido;
      }) as ProdutoDisponibilidade[];
    
    console.log(`[GoogleSheets] 📊 RESULTADO FINAL: ${produtos.length} produtos válidos carregados`);
    produtos.forEach(p => {
      console.log(`[GoogleSheets] 📋 Produto final: ID=${p.id}, Nome="${p.nome}", Disponível=${p.disponivel}`);
    });
    
    console.log(`[GoogleSheets] 🎉 Sucesso! ${produtos.length} produtos carregados da planilha`);
    return produtos;
    
  } catch (error) {
    console.error('[GoogleSheets] 💥 Erro completo:', error);
    throw error;
  }
}

// Função para usar dados locais como fallback
function usarDadosLocais(): ProdutoDisponibilidade[] {
  console.log('[GoogleSheets] 🏠 Usando dados locais como fallback');
  
  const produtos: ProdutoDisponibilidade[] = Object.entries(DADOS_FALLBACK).map(([id, disponivel]) => ({
    id: parseInt(id),
    nome: `Produto ${id}`,
    disponivel,
    categoria: 'Local'
  }));
  
  console.log(`[GoogleSheets] 📦 ${produtos.length} produtos carregados localmente`);
  return produtos;
}

// Função para interpretar disponibilidade com logs detalhados
function parseDisponibilidade(valor: any): boolean {
  console.log(`[GoogleSheets] 🔍 Parseando disponibilidade - Valor recebido:`, valor, `(tipo: ${typeof valor})`);
  
  if (!valor || valor === '' || valor === null || valor === undefined) {
    console.log(`[GoogleSheets] ✅ Valor vazio → assumindo DISPONÍVEL (true)`);
    return true;
  }
  
  const valorStr = String(valor).toLowerCase().trim();
  console.log(`[GoogleSheets] 🔍 Valor convertido para string:`, `"${valorStr}"`);
  
  const valoresIndisponiveis = ['false', 'não', 'nao', 'no', '0', 'indisponivel', 'indisponível', 'esgotado'];
  const indisponivel = valoresIndisponiveis.includes(valorStr);
  const disponivel = !indisponivel;
  
  console.log(`[GoogleSheets] 🎯 Resultado: "${valor}" → ${disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'} (${disponivel})`);
  
  return disponivel;
}

// Hook com fallback automático
export function useDisponibilidadeProdutos() {
  const [produtos, setProdutos] = useState<ProdutoDisponibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      console.log('[Hook] 🚀 Iniciando carregamento...');
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      // Tentar carregar da planilha primeiro
      const dadosPlanilha = await buscarDadosDaPlanilha();
      
      setProdutos(dadosPlanilha);
      setLastUpdate(new Date());
      setLoading(false);
      
      console.log('[Hook] ✅ Dados da planilha carregados com sucesso!');
      
    } catch (err) {
      console.warn('[Hook] ⚠️ Erro ao carregar planilha, usando dados locais...');
      
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      
      // Usar dados locais como fallback
      const dadosLocais = usarDadosLocais();
      setProdutos(dadosLocais);
      setUsingFallback(true);
      setLastUpdate(new Date());
      setLoading(false);
      
      console.log('[Hook] 🏠 Funcionando com dados locais (fallback)');
    }
  }, []);

  // Função para verificar disponibilidade
  const isProdutoDisponivel = useCallback((id: number): boolean => {
    if (usingFallback) {
      // Usar dados locais
      const disponivel = DADOS_FALLBACK[id] ?? true;
      console.log(`[Hook] 🏠 LOCAL - Produto ${id}: ${disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'}`);
      return disponivel;
    } else {
      // Usar dados da planilha
      const produto = produtos.find(p => p.id === id);
      const disponivel = produto ? produto.disponivel : true;
      console.log(`[Hook] 🌐 PLANILHA - Produto ${id}: ${disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'}`);
      return disponivel;
    }
  }, [produtos, usingFallback]);

  const recarregar = useCallback(() => {
    console.log('[Hook] 🔄 Recarregamento manual solicitado');
    carregarDados();
  }, [carregarDados]);

  // Carregar dados na inicialização
  useEffect(() => {
    console.log('[Hook] 🎬 Iniciando hook...');
    carregarDados();
  }, [carregarDados]);

  // Auto-reload com tempo reduzido para testes (30 segundos)
  useEffect(() => {
    if (!error && !usingFallback) {
      console.log('[Hook] ⏰ Configurando recarga automática (30 seg para testes)');
      const interval = setInterval(() => {
        console.log('[Hook] 🔄 Recarga automática (30s)...');
        carregarDados();
      }, 30 * 1000); // 30 segundos para testes

      return () => clearInterval(interval);
    }
  }, [error, usingFallback, carregarDados]);

  return {
    produtos,
    loading,
    error,
    lastUpdate,
    isProdutoDisponivel,
    recarregar,
    usingFallback, // NOVO: indica se está usando dados locais
    // Compatibilidade
    pendingUpdates: 0,
    apiStatus: usingFallback ? 'fallback' : error ? 'error' : loading ? 'loading' : 'success'
  };
}

// Função para testar a API diretamente
export async function testarAPIManualmente() {
  try {
    console.log('🧪 TESTE MANUAL DA API');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:D?key=${GOOGLE_SHEETS_API_KEY}`;
    console.log('🔗 URL:', url);
    
    const response = await fetch(url);
    console.log('📡 Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro:', error);
      return { sucesso: false, erro: error };
    }
    
    const data = await response.json();
    console.log('✅ Dados:', data);
    return { sucesso: true, dados: data };
    
  } catch (error) {
    console.error('💥 Erro na requisição:', error);
    return { sucesso: false, erro: error };
  }
}

// Para debug no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testarAPI = testarAPIManualmente;
  console.log('🔧 Debug: Use window.testarAPI() no console para testar manualmente');
}