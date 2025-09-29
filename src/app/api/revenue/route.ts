import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

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
    const subscriptions = db.collection('subscriptions');

    // Get subscriptions for this specific admin
    const userSubscriptions = await subscriptions.find({ 
      adminId: payload.userId 
    }).toArray();

    console.log('Found subscriptions for revenue:', userSubscriptions.length);

    // Calculate revenue statistics
    const totalRevenue = userSubscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
    const paidRevenue = userSubscriptions
      .filter(sub => sub.paymentStatus === 'مدفوع')
      .reduce((sum, sub) => sum + (sub.price || 0), 0);
    const pendingRevenue = userSubscriptions
      .filter(sub => sub.paymentStatus === 'غير مدفوع')
      .reduce((sum, sub) => sum + (sub.price || 0), 0);
    const averageRevenue = userSubscriptions.length > 0 ? totalRevenue / userSubscriptions.length : 0;

    // Payment method statistics
    const paymentMethods: Record<string, { count: number; amount: number }> = {};
    userSubscriptions.forEach(sub => {
      const method = sub.paymentMethod || 'غير محدد';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].amount += sub.price || 0;
    });

    const paymentMethodStats = Object.entries(paymentMethods).map(([method, data]: [string, { count: number; amount: number }]) => ({
      method,
      count: data.count,
      amount: data.amount,
      percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0
    }));

    // Subject statistics
    const subjects: Record<string, { revenue: number; students: Set<string> }> = {};
    userSubscriptions.forEach(sub => {
      const subject = sub.subject || 'غير محدد';
      if (!subjects[subject]) {
        subjects[subject] = { revenue: 0, students: new Set() };
      }
      subjects[subject].revenue += sub.price || 0;
      subjects[subject].students.add(sub.studentName);
    });

    const subjectStats = Object.entries(subjects).map(([subject, data]: [string, { revenue: number; students: Set<string> }]) => ({
      subject,
      revenue: data.revenue,
      students: data.students.size
    }));

    // Format revenue data for table
    const revenueData = userSubscriptions.map(sub => ({
      _id: sub._id,
      date: sub.createdAt ? new Date(sub.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      studentName: sub.studentName || 'غير محدد',
      subject: sub.subject || 'غير محدد',
      amount: sub.price || 0,
      paymentMethod: sub.paymentMethod || 'غير محدد',
      status: sub.paymentStatus || 'غير محدد',
      teacher: sub.teacher || 'غير محدد',
      startDate: sub.startDate,
      endDate: sub.endDate
    }));

    return NextResponse.json({
      revenueData,
      statistics: {
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        averageRevenue,
        totalTransactions: userSubscriptions.length
      },
      paymentMethodStats,
      subjectStats
    });
  } catch (error) {
    console.error('Revenue fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
