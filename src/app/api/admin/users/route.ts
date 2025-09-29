import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/auth-utils';
import { getDatabase } from '@/lib/mongodb';
import { createUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyRequestToken(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { payload } = authResult;
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, email, role, isActive } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await createUser(username, password, email, role || 'user');

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: unknown) {
    console.error('User creation error:', error);
    
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyRequestToken(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { payload } = authResult;
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Get all users except the current admin
    const allUsers = await users.find(
      { _id: { $ne: new ObjectId(payload.userId) } },
      { projection: { password: 0 } } // Exclude password from response
    ).toArray();

    return NextResponse.json({
      users: allUsers
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}