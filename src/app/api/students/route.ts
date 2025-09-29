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
    const students = db.collection('students');

    // Add adminId to the student data
    const studentData = {
      ...body,
      adminId: payload.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await students.insertOne(studentData);

    return NextResponse.json({
      message: 'Student created successfully',
      student: {
        id: result.insertedId,
        ...studentData
      }
    });
  } catch (error) {
    console.error('Student creation error:', error);
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
    const students = db.collection('students');

    // Get students for this specific admin
    const userStudents = await students.find({ 
      adminId: payload.userId 
    }).toArray();

    return NextResponse.json({
      students: userStudents
    });
  } catch (error) {
    console.error('Students fetch error:', error);
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
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const students = db.collection('students');

    // Update student data
    const result = await students.updateOne(
      { 
        _id: new ObjectId(id),
        adminId: payload.userId // Ensure user can only update their own students
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
        { error: 'Student not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Student update error:', error);
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
    
    console.log('Delete student request:', { id, adminId: payload.userId });
    
    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const students = db.collection('students');

    // Delete student
    const result = await students.deleteOne({
      _id: new ObjectId(id),
      adminId: payload.userId // Ensure user can only delete their own students
    });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Student deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}