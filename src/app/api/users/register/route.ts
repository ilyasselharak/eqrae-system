import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the request body directly without authentication check
    const body = await request.json();
    const { username, email, password, role = 'user' } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({ 
        error: 'Username, email, and password are required' 
      }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be admin or user' 
      }, { status: 400 });
    }

    // Create user
    const user = await createUser(username, email, password, role);

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error: unknown) {
    console.error('Error creating user:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json({ 
          error: 'Username or email already exists' 
        }, { status: 409 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}
