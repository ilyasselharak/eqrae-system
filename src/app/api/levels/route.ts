import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyRequestToken } from '@/lib/auth-utils';

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
    const levels = db.collection('levels');

    console.log('Fetching levels for adminId:', payload.userId);

    // Get levels for this specific admin
    const userLevels = await levels.find({ 
      adminId: payload.userId 
    }).toArray();

    console.log('Found levels:', userLevels.length);

    return NextResponse.json({
      levels: userLevels
    });
  } catch (error) {
    console.error('Levels fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { name, description, order, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Level name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const levels = db.collection('levels');

    // Check if level name already exists for this admin
    const existingLevel = await levels.findOne({
      adminId: payload.userId,
      name: name
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'Level name already exists' },
        { status: 400 }
      );
    }

    const newLevel = {
      name,
      description: description || '',
      order: order || 0,
      isActive,
      adminId: payload.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await levels.insertOne(newLevel);

    console.log('Created level:', result.insertedId);

    return NextResponse.json({
      message: 'Level created successfully',
      level: {
        _id: result.insertedId.toString(),
        ...newLevel
      }
    });
  } catch (error) {
    console.error('Level creation error:', error);
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
    const { id, name, description, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const levels = db.collection('levels');

    // Check if level exists and belongs to this admin
    const existingLevel = await levels.findOne({
      _id: new (await import('mongodb')).ObjectId(id),
      adminId: payload.userId
    });

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing level
    if (name && name !== existingLevel.name) {
      const conflictingLevel = await levels.findOne({
        adminId: payload.userId,
        name: name,
        _id: { $ne: new (await import('mongodb')).ObjectId(id) }
      });

      if (conflictingLevel) {
        return NextResponse.json(
          { error: 'Level name already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      updatedAt: string;
      name?: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    } = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await levels.updateOne(
      { 
        _id: new (await import('mongodb')).ObjectId(id),
        adminId: payload.userId 
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }

    console.log('Updated level:', id);

    return NextResponse.json({
      message: 'Level updated successfully'
    });
  } catch (error) {
    console.error('Level update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const levels = db.collection('levels');

    // Check if level exists and belongs to this admin
    const existingLevel = await levels.findOne({
      _id: new (await import('mongodb')).ObjectId(id),
      adminId: payload.userId
    });

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }

    // Check if level is being used by students
    const students = db.collection('students');
    const studentsUsingLevel = await students.findOne({
      adminId: payload.userId,
      level: existingLevel.name
    });

    if (studentsUsingLevel) {
      return NextResponse.json(
        { error: 'Cannot delete level that is being used by students' },
        { status: 400 }
      );
    }

    const result = await levels.deleteOne({
      _id: new (await import('mongodb')).ObjectId(id),
      adminId: payload.userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }

    console.log('Deleted level:', id);

    return NextResponse.json({
      message: 'Level deleted successfully'
    });
  } catch (error) {
    console.error('Level deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
