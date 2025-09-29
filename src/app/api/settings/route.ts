import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyRequestToken } from '@/lib/auth-utils';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const { verifyToken } = await import('@/lib/jwt');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');
    const settings = db.collection('settings');

    // Get user profile
    const user = await users.findOne({ _id: new (await import('mongodb')).ObjectId(payload.userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user settings
    const userSettings = await settings.findOne({ adminId: payload.userId });

    console.log('Fetching settings for adminId:', payload.userId);

    return NextResponse.json({
      profile: {
        name: user.username,
        email: user.email,
        phone: user.phone || '',
        language: user.language || 'ar',
        timezone: user.timezone || 'Asia/Riyadh',
        avatar: user.avatar || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || null
      },
      settings: userSettings || {
        notifications: {
          emailNotifications: true,
          newStudentNotifications: true,
          paymentNotifications: true,
          maintenanceReminders: true,
          systemUpdates: true
        },
        system: {
          systemName: 'نظام الدراسة',
          systemDescription: 'نظام إدارة الدراسة والتعليم',
          maintenanceMode: false,
          autoLogin: true,
          currency: 'دم',
          dateFormat: 'DD/MM/YYYY'
        }
      }
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyRequestToken(request);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { payload, body } = authResult;
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');
    const settings = db.collection('settings');

    if (type === 'profile') {
      // Update user profile
      const updateData: {
        username?: string;
        email?: string;
        phone?: string;
        language?: string;
        timezone?: string;
        avatar?: string;
        updatedAt: string;
      } = {
        updatedAt: new Date().toISOString()
      };

      if (data.name) updateData.username = data.name;
      if (data.email) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.language) updateData.language = data.language;
      if (data.timezone) updateData.timezone = data.timezone;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;

      await users.updateOne(
        { _id: new (await import('mongodb')).ObjectId(payload.userId) },
        { $set: updateData }
      );

      console.log('Updated profile for adminId:', payload.userId);
    } else if (type === 'password') {
      // Update password
      const { currentPassword, newPassword } = data;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      // Get current user to verify current password
      const user = await users.findOne({ _id: new (await import('mongodb')).ObjectId(payload.userId) });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await hash(newPassword, 10);

      await users.updateOne(
        { _id: new (await import('mongodb')).ObjectId(payload.userId) },
        { 
          $set: { 
            password: hashedNewPassword,
            updatedAt: new Date().toISOString()
          } 
        }
      );

      console.log('Updated password for adminId:', payload.userId);
    } else if (type === 'notifications') {
      // Update notification settings
      await settings.updateOne(
        { adminId: payload.userId },
        { 
          $set: { 
            'notifications': data,
            updatedAt: new Date().toISOString()
          } 
        },
        { upsert: true }
      );

      console.log('Updated notification settings for adminId:', payload.userId);
    } else if (type === 'system') {
      // Update system settings
      await settings.updateOne(
        { adminId: payload.userId },
        { 
          $set: { 
            'system': data,
            updatedAt: new Date().toISOString()
          } 
        },
        { upsert: true }
      );

      console.log('Updated system settings for adminId:', payload.userId);
    } else {
      return NextResponse.json(
        { error: 'Invalid settings type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
