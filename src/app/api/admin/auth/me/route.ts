import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [userId] = decoded.split(':');
      
      const user = getUserById(userId);
      
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Invalid token or not an admin' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}