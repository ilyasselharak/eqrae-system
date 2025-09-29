import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/auth-utils';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { username, email, role, isActive, password } = body;
    const { id } = await params;

    const db = await getDatabase();
    const users = db.collection('users');

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await users.findOne({ 
        username, 
        _id: { $ne: new ObjectId(id) } 
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: {
      username?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
      updatedAt: Date;
      password?: string;
    } = {
      username,
      email,
      role,
      isActive,
      updatedAt: new Date()
    };

    // Only update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get updated user data
    const updatedUser = await users.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === payload.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    const result = await users.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}