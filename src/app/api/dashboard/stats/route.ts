import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
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
    const adminId = payload.userId; // Use string instead of ObjectId

    // Get counts for this specific admin
    const [studentsCount, teachersCount, subjectsCount, subscriptionsCount] = await Promise.all([
      db.collection('students').countDocuments({ adminId }),
      db.collection('teachers').countDocuments({ adminId }),
      db.collection('subjects').countDocuments({ adminId }),
      db.collection('subscriptions').countDocuments({ adminId })
    ]);

    // Calculate revenue for this admin
    const revenuePipeline = [
      { $match: { adminId } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ];
    const revenueResult = await db.collection('subscriptions').aggregate(revenuePipeline).toArray();
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get recent students for this admin
    const recentStudents = await db.collection('students')
      .find({ adminId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      stats: {
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalSubscriptions: subscriptionsCount,
        totalRevenue
      },
      recentStudents
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
