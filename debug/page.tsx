import React from 'react';
import { useDisponibilidadeProdutos } from '../utils/googleSheets';

export default function DebugPlanilha() {
  const {
    produtos,
    loading,
    error,
    lastUpdate,
    isProdutoDisponivel,
    recarregar,
    usingFallback
  } = useDisponibilidadeProdutos();

  // Lista de IDs para testar
  const idsParaTestar = [1, 2, 3, 101, 102, 201, 301];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">🧪 Debug - Monitor da Planilha</h1>
      
      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h2 className="font-bold mb-2">📊 Status da Conexão</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Estado:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              loading ? 'bg-yellow-100 text-yellow-800' :
              error ? 'bg-red-100 text-red-800' :
              usingFallback ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }`}>
              {loading ? 'Carregando' :
               error ? 'Erro' :
               usingFallback ? 'Local' :
               'Conectado'}
            </span>
          </div>
          <div>
            <strong>Produtos:</strong> {produtos.length}
          </div>
          <div>
            <strong>Fonte:</strong> {usingFallback ? 'Dados Locais' : 'Google Sheets'}
          </div>
          <div>
            <strong>Última Atualização:</strong> 
            <br/>{lastUpdate ? lastUpdate.toLocaleTimeString() : 'Nunca'}
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <strong className="text-red-800">Erro:</strong>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        )}
      </div>

      {/* Botões de Controle */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={recarregar}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '⏳ Carregando...' : '🔄 Recarregar Agora'}
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔃 Recarregar Página
        </button>
      </div>

      {/* Teste de Disponibilidade */}
      <div className="mb-6">
        <h2 className="font-bold mb-3">🧪 Teste de Disponibilidade por ID</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {idsParaTestar.map(id => {
            const disponivel = isProdutoDisponivel(id);
            return (
              <div 
                key={id} 
                className={`p-3 rounded border-2 text-center ${
                  disponivel 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="font-bold">ID {id}</div>
                <div className={`text-sm ${
                  disponivel ? 'text-green-700' : 'text-red-700'
                }`}>
                  {disponivel ? '✅ Disponível' : '❌ Esgotado'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dados da Planilha */}
      <div className="mb-6">
        <h2 className="font-bold mb-3">📋 Dados da Planilha</h2>
        {produtos.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Nenhum produto carregado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Nome</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Disponível</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Categoria</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(produto => (
                  <tr key={produto.id} className={
                    produto.disponivel ? 'bg-green-50' : 'bg-red-50'
                  }>
                    <td className="border border-gray-300 px-3 py-2 font-mono">
                      {produto.id}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {produto.nome}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        produto.disponivel 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {produto.disponivel ? 'TRUE' : 'FALSE'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {produto.categoria}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-bold text-blue-800 mb-2">📝 Como Testar:</h3>
        <ol className="list-decimal list-inside text-blue-700 text-sm space-y-1">
          <li>Abra sua planilha Google Sheets em outra aba</li>
          <li>Mude um valor na coluna C de TRUE para FALSE (ou vice-versa)</li>
          <li>Salve a planilha (Ctrl+S)</li>
          <li>Aguarde 30 segundos OU clique em "Recarregar Agora"</li>
          <li>Veja a mudança refletida na tabela acima</li>
        </ol>
        
        <div className="mt-3 text-xs text-blue-600">
          <strong>Atualização automática:</strong> A cada 30 segundos<br/>
          <strong>Próxima atualização:</strong> Veja no console os logs de "[Hook] 🔄 Recarga automática"
        </div>
      </div>
    </div>
  );
}