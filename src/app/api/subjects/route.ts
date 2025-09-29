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
    console.log('Create subject request:', { body, adminId: payload.userId });
    
    const db = await getDatabase();
    const subjects = db.collection('subjects');

    // Add adminId to the subject data
    const subjectData = {
      ...body,
      adminId: payload.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Subject data to insert:', subjectData);

    const result = await subjects.insertOne(subjectData);
    console.log('Insert result:', result);

    return NextResponse.json({
      message: 'Subject created successfully',
      subject: {
        id: result.insertedId,
        ...subjectData
      }
    });
  } catch (error) {
    console.error('Subject creation error:', error);
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
    const subjects = db.collection('subjects');

    console.log('Fetching subjects for adminId:', payload.userId);

    // Get subjects for this specific admin
    const userSubjects = await subjects.find({ 
      adminId: payload.userId 
    }).toArray();

    console.log('Found subjects:', userSubjects.length);

    return NextResponse.json({
      subjects: userSubjects
    });
  } catch (error) {
    console.error('Subjects fetch error:', error);
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
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const subjects = db.collection('subjects');

    // Update subject data
    const result = await subjects.updateOne(
      { 
        _id: new ObjectId(id),
        adminId: payload.userId // Ensure user can only update their own subjects
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
        { error: 'Subject not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Subject update error:', error);
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
    
    console.log('Delete subject request:', { id, adminId: payload.userId });
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const subjects = db.collection('subjects');

    // Delete subject
    const result = await subjects.deleteOne({
      _id: new ObjectId(id),
      adminId: payload.userId // Ensure user can only delete their own subjects
    });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subject not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Subject deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}