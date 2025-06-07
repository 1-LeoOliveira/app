// app/admin/page.tsx - Versão Simplificada
'use client'

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Settings, Save, Loader, Wifi, WifiOff, Home, LogOut } from 'lucide-react';
import Link from 'next/link';

// Interfaces
interface ProdutoAdmin {
  id: number;
  nome: string;
  disponivel: boolean;
  categoria: string;
  linha: number;
}

// Configuração
const GOOGLE_SHEETS_API_KEY = 'AIzaSyA09Jv2bQ8DcdqtbL4Zje5WM2YAGJFI8S8';
const SPREADSHEET_ID = '1PB83VB1tQj2mNTiEsk-FIOIDxjPsDDck-3LpeKjm9Q4';

// Credenciais simples (em produção, use variáveis de ambiente)
const ADMIN_CREDENTIALS = {
  email: 'admin@hamburgueria.com',
  senha: 'admin123'
};

// Componente de Login Simplificado
function LoginSimples({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = () => {
    if (!email || !senha) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    // Simulação de autenticação
    setTimeout(() => {
      if (email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha) {
        // Login bem-sucedido
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_user', email);
        onLoginSuccess();
      } else {
        setError('Email ou senha incorretos');
      }
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Área Administrativa</h1>
          <p className="text-gray-400">Digite suas credenciais para acessar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@hamburgueria.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  disabled={loading}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
             <strong>Credenciais de teste:</strong><br />
              Email: admin@hamburgueria.com<br />
              Senha: admin123
            </p>*/
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificandoAuth, setVerificandoAuth] = useState(true);
  const [usuario, setUsuario] = useState<string>('');
  
  // Estados do admin
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [produtosOriginais, setProdutosOriginais] = useState<ProdutoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mudancasPendentes, setMudancasPendentes] = useState(new Set<number>());
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [mostrarApenaIndisponiveis, setMostrarApenaIndisponiveis] = useState(false);
  const [mostrarApenasAlterados, setMostrarApenasAlterados] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const verificarAuth = () => {
      const authStatus = localStorage.getItem('admin_auth');
      const userEmail = localStorage.getItem('admin_user');
      
      if (authStatus === 'true' && userEmail) {
        setAutenticado(true);
        setUsuario(userEmail);
        buscarProdutos();
      }
      
      setVerificandoAuth(false);
    };

    verificarAuth();
  }, []);

  const handleLoginSuccess = () => {
    setAutenticado(true);
    const userEmail = localStorage.getItem('admin_user');
    if (userEmail) {
      setUsuario(userEmail);
      buscarProdutos();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_user');
    setAutenticado(false);
    setUsuario('');
  };

  // Função para buscar produtos da planilha
  const buscarProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[Admin] 🔄 Buscando produtos da planilha...');
      
      const possiveisAbas = ['Sheet1', 'Planilha1', 'Página1', 'Aba1'];
      let dadosEncontrados = null;
      
      for (const nomeAba of possiveisAbas) {
        try {
          const range = `${nomeAba}!A:D`;
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
          
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            if (data.values && data.values.length > 1) {
              dadosEncontrados = data;
              console.log(`[Admin] ✅ Dados encontrados na aba: ${nomeAba}`);
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }
      
      if (!dadosEncontrados) {
        throw new Error('Nenhuma aba com dados válidos encontrada');
      }
      
      const linhas = dadosEncontrados.values.slice(1);
      const produtosMapeados: ProdutoAdmin[] = linhas
        .map((linha: string[], index: number) => {
          const id = parseInt(linha[0] || '0');
          const nome = (linha[1] || '').trim();
          const disponivel = parseDisponibilidade(linha[2]);
          const categoria = (linha[3] || '').trim();
          
          if (id > 0 && nome) {
            return {
              id,
              nome,
              disponivel,
              categoria,
              linha: index + 2
            };
          }
          return null;
        })
        .filter((produto: ProdutoAdmin | null): produto is ProdutoAdmin => produto !== null);
      
      setProdutos(produtosMapeados);
      setProdutosOriginais(JSON.parse(JSON.stringify(produtosMapeados)));
      setLastUpdate(new Date());
      setMudancasPendentes(new Set());
      
      console.log(`[Admin] ✅ ${produtosMapeados.length} produtos carregados`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[Admin] ❌ Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponibilidade = (produtoId: number) => {
    setProdutos(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        const novaDisponibilidade = !produto.disponivel;
        
        const original = produtosOriginais.find(p => p.id === produtoId);
        const foiAlterado = original ? original.disponivel !== novaDisponibilidade : true;
        
        setMudancasPendentes(prev => {
          const nova = new Set(prev);
          if (foiAlterado) {
            nova.add(produtoId);
          } else {
            nova.delete(produtoId);
          }
          return nova;
        });
        
        return { ...produto, disponivel: novaDisponibilidade };
      }
      return produto;
    }));
  };

  const salvarAlteracoes = async () => {
    if (mudancasPendentes.size === 0) return;
    
    setSalvando(true);
    setError(null);
    
    try {
      console.log('[Admin] 💾 Salvando alterações...');
      
      const alteracoes = Array.from(mudancasPendentes).map(id => {
        const produto = produtos.find(p => p.id === id);
        return produto ? {
          id: produto.id,
          linha: produto.linha,
          disponivel: produto.disponivel
        } : null;
      }).filter(Boolean);
      
      // Usar SUA API existente - não precisa mudar nada!
      const response = await fetch('/api/admin/salvar-disponibilidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alteracoes,
          spreadsheetId: SPREADSHEET_ID
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao salvar: ${response.status} - ${errorData.error || response.statusText}`);
      }
      
      const resultado = await response.json();
      console.log('[Admin] ✅ Alterações salvas:', resultado);
      
      // Atualizar estado após sucesso
      setProdutosOriginais(JSON.parse(JSON.stringify(produtos)));
      setMudancasPendentes(new Set());
      setLastUpdate(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(errorMessage);
      console.error('[Admin] ❌ Erro ao salvar:', err);
    } finally {
      setSalvando(false);
    }
  };

  const descartarAlteracoes = () => {
    setProdutos(JSON.parse(JSON.stringify(produtosOriginais)));
    setMudancasPendentes(new Set());
  };

  const parseDisponibilidade = (valor: string | boolean | number): boolean => {
    if (!valor) return true;
    const valorStr = String(valor).toLowerCase().trim();
    const indisponiveis = ['false', 'não', 'nao', 'no', '0', 'indisponivel', 'indisponível'];
    return !indisponiveis.includes(valorStr);
  };

  // Filtros
  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = !filtroCategoria || produto.categoria.toLowerCase().includes(filtroCategoria.toLowerCase());
    const passaDisponibilidade = !mostrarApenaIndisponiveis || !produto.disponivel;
    const passaAlterado = !mostrarApenasAlterados || mudancasPendentes.has(produto.id);
    return passaCategoria && passaDisponibilidade && passaAlterado;
  });

  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
  const totalProdutos = produtos.length;
  const produtosDisponiveis = produtos.filter(p => p.disponivel).length;
  const produtosIndisponiveis = totalProdutos - produtosDisponiveis;

  // Loading de verificação
  if (verificandoAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Tela de login
  if (!autenticado) {
    return <LoginSimples onLoginSuccess={handleLoginSuccess} />;
  }

  // Painel administrativo (resto do código igual ao original)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header com logout */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/cardapio" 
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Home size={20} className="mr-2" />
                Voltar ao Cardápio
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                🛠️ Painel Administrativo
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Logado como: <strong>{usuario}</strong>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Sair
              </button>
              
              {mudancasPendentes.size > 0 && (
                <>
                  <button
                    onClick={descartarAlteracoes}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={salvarAlteracoes}
                    disabled={salvando}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {salvando ? (
                      <Loader size={18} className="mr-2 animate-spin" />
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    Salvar {mudancasPendentes.size} Alteraç{mudancasPendentes.size > 1 ? 'ões' : 'ão'}
                  </button>
                </>
              )}
              
              <button
                onClick={buscarProdutos}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {error ? (
                  <WifiOff size={14} className="text-red-500 mr-1" />
                ) : (
                  <Wifi size={14} className="text-green-500 mr-1" />
                )}
                <span className={error ? 'text-red-500' : 'text-green-600'}>
                  {error ? 'Erro' : 'Conectado'}
                </span>
              </div>

              {mudancasPendentes.size > 0 && (
                <div className="flex items-center text-orange-600">
                  <AlertCircle size={14} className="mr-1" />
                  {mudancasPendentes.size} não salva{mudancasPendentes.size > 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex items-center text-gray-600">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : (
                <span>
                  {loading ? 'Carregando...' : 
                    lastUpdate ? `Última atualização: ${lastUpdate.toLocaleTimeString()}` : 'Pronto'
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total</h3>
                <p className="text-2xl font-bold text-blue-600">{totalProdutos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Disponíveis</h3>
                <p className="text-2xl font-bold text-green-600">{produtosDisponiveis}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Esgotados</h3>
                <p className="text-2xl font-bold text-red-600">{produtosIndisponiveis}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Alterações</h3>
                <p className="text-2xl font-bold text-orange-600">{mudancasPendentes.size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Filtros</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mostrarApenaIndisponiveis}
                onChange={(e) => setMostrarApenaIndisponiveis(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Apenas esgotados</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mostrarApenasAlterados}
                onChange={(e) => setMostrarApenasAlterados(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Apenas alterados</span>
            </label>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              📦 Produtos ({produtosFiltrados.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtosFiltrados.map((produto) => {
                    const foiAlterado = mudancasPendentes.has(produto.id);
                    
                    return (
                      <tr key={produto.id} className={`hover:bg-gray-50 ${foiAlterado ? 'bg-orange-50 border-l-4 border-orange-400' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{produto.id}
                          {foiAlterado && <span className="ml-2 text-orange-600">●</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{produto.nome}</div>
                            <div className="text-xs text-gray-500">Linha {produto.linha}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {produto.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            produto.disponivel 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {produto.disponivel ? (
                              <>
                                <CheckCircle size={12} className="mr-1" />
                                Disponível
                              </>
                            ) : (
                              <>
                                <XCircle size={12} className="mr-1" />
                                Esgotado
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleDisponibilidade(produto.id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                              produto.disponivel
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                            }`}
                          >
                            {produto.disponivel ? (
                              <>
                                <EyeOff size={14} className="mr-1" />
                                Esgotar
                              </>
                            ) : (
                              <>
                                <Eye size={14} className="mr-1" />
                                Disponibilizar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Instruções:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. <strong>Altere a disponibilidade</strong> clicando nos botões "Esgotar" ou "Disponibilizar"</p>
            <p>2. <strong>Produtos alterados</strong> ficam destacados em laranja</p>
            <p>3. <strong>Clique em "Salvar"</strong> para aplicar as mudanças na planilha Google Sheets</p>
            <p>4. <strong>Use os filtros</strong> para encontrar produtos específicos</p>
            <p>5. <strong>Credenciais de teste:</strong> admin@hamburgueria.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}