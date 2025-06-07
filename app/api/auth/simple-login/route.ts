import { NextRequest, NextResponse } from 'next/server';

const ADMIN_CREDENTIALS = {
  email: 'admin@hamburgueria.com',
  senha: 'admin123'
};

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && 
        senha === ADMIN_CREDENTIALS.senha) {
      
      return NextResponse.json({
        success: true,
        user: { email: email, role: 'admin' },
        message: 'Login realizado com sucesso'
      });
    } else {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}