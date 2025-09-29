import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/auth-utils';
import { verifyToken } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
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

    const { payload, body } = authResult;
    const db = await getDatabase();
    const teachers = db.collection('teachers');

    // Add adminId to the teacher data
    const teacherData = {
      ...body,
      adminId: payload.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await teachers.insertOne(teacherData);

    return NextResponse.json({
      message: 'Teacher created successfully',
      teacher: {
        id: result.insertedId,
        ...teacherData
      }
    });
  } catch (error) {
    console.error('Teacher creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const teachers = db.collection('teachers');

    // Get teachers for this specific admin
    const userTeachers = await teachers.find({ 
      adminId: payload.userId 
    }).toArray();

    return NextResponse.json({
      teachers: userTeachers
    });
  } catch (error) {
    console.error('Teachers fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyRequestToken(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { payload, body } = authResult;
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const teachers = db.collection('teachers');

    // Update teacher data
    const result = await teachers.updateOne(
      { 
        _id: new ObjectId(id),
        adminId: payload.userId // Ensure user can only update their own teachers
      },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Teacher not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    console.error('Teacher update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyRequestToken(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { payload, body } = authResult;
    const { id } = body;
    
    console.log('Delete teacher request:', { id, adminId: payload.userId });
    
    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const teachers = db.collection('teachers');

    // Delete teacher
    const result = await teachers.deleteOne({
      _id: new ObjectId(id),
      adminId: payload.userId // Ensure user can only delete their own teachers
    });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Teacher not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Teacher deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}