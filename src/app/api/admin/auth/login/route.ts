import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await loginAdmin(email, password);

    return NextResponse.json({
      success: true,
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.first_name || result.user.firstName,
        lastName: result.user.last_name || result.user.lastName,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    if (error.message === 'Access denied. Admin role required.') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}