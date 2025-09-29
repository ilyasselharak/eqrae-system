import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyRequestToken } from '@/lib/auth-utils';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
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
    const subscriptions = db.collection('subscriptions');

    // Get subscriptions for this specific admin
    const userSubscriptions = await subscriptions.find({ 
      adminId: payload.userId 
    }).toArray();

    return NextResponse.json({
      subscriptions: userSubscriptions
    });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    console.log('Create subscription request:', { body, adminId: payload.userId });
    
    const db = await getDatabase();
    const subscriptions = db.collection('subscriptions');

    // Add adminId to the subscription data
    const subscriptionData = {
      ...body,
      adminId: payload.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Subscription data to insert:', subscriptionData);

    const result = await subscriptions.insertOne(subscriptionData);
    console.log('Insert result:', result);

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: {
        id: result.insertedId,
        ...subscriptionData
      }
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
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
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const subscriptions = db.collection('subscriptions');

    // Update subscription data
    const result = await subscriptions.updateOne(
      { 
        _id: new ObjectId(id),
        adminId: payload.userId // Ensure user can only update their own subscriptions
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
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Subscription update error:', error);
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
    
    console.log('Delete subscription request:', { id, adminId: payload.userId });
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const subscriptions = db.collection('subscriptions');

    // Delete subscription
    const result = await subscriptions.deleteOne({
      _id: new ObjectId(id),
      adminId: payload.userId // Ensure user can only delete their own subscriptions
    });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Subscription deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
