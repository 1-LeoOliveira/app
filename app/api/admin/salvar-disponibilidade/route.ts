// app/api/admin/salvar-disponibilidade/route.ts
import { NextRequest, NextResponse } from 'next/server';

// TESTE SIMPLES PRIMEIRO
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 🔄 Recebendo requisição POST...');
    
    const body = await request.json();
    console.log('[API] 📦 Dados recebidos:', body);
    
    const { alteracoes, spreadsheetId } = body;

    if (!alteracoes || !Array.isArray(alteracoes)) {
      return NextResponse.json({ 
        error: 'Dados inválidos' 
      }, { status: 400 });
    }

    console.log(`[API] 💾 Processando ${alteracoes.length} alterações...`);

    // URL do Google Apps Script configurada
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRf_EJA9VM1-BR4Y27eQmN7KqOJARr6hCk9CWDigIiBmAR5lsUGbl7OE0Plm0Rq3tx/exec';
    
    if (SCRIPT_URL.includes('COLE_SUA_URL')) {
      return NextResponse.json({
        error: 'Google Apps Script não configurado ainda',
        message: 'Substitua SCRIPT_URL pela URL real do seu script',
        alteracoes: alteracoes.length
      }, { status: 500 });
    }

    // Processar alterações usando Google Apps Script
    const results = await Promise.allSettled(
      alteracoes.map(async (alteracao) => {
        try {
          console.log(`[API] 📝 Atualizando produto ${alteracao.id} na linha ${alteracao.linha}`);
          
          const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'updateCell',
              spreadsheetId,
              range: `Sheet1!C${alteracao.linha}`, // Coluna C = disponibilidade
              value: alteracao.disponivel ? 'TRUE' : 'FALSE'
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const resultado = await response.json();
          console.log(`[API] ✅ Produto ${alteracao.id} atualizado:`, resultado);

          return { 
            sucesso: true, 
            id: alteracao.id,
            resultado 
          };

        } catch (error) {
          console.error(`[API] ❌ Erro ao atualizar produto ${alteracao.id}:`, error);
          return { 
            sucesso: false, 
            id: alteracao.id, 
            erro: error instanceof Error ? error.message : 'Erro desconhecido' 
          };
        }
      })
    );

    // Contar sucessos e erros
    const sucessos = results.filter(result => 
      result.status === 'fulfilled' && result.value.sucesso
    ).length;
    
    const erros = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.sucesso)
    );

    console.log(`[API] 📊 Resultado: ${sucessos} sucessos, ${erros.length} erros`);
    
    return NextResponse.json({
      sucesso: sucessos,
      erros: erros.length,
      total: alteracoes.length,
      message: `${sucessos} produtos atualizados com sucesso`,
      detalhes: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] ❌ Erro:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}