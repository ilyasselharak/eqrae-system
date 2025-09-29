import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

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
    const teachers = db.collection('teachers');
    const subjects = db.collection('subjects');
    const subscriptions = db.collection('subscriptions');

    // Get data for this specific admin
    const [studentsData, teachersData, subjectsData, subscriptionsData] = await Promise.all([
      students.find({ adminId: payload.userId }).toArray(),
      teachers.find({ adminId: payload.userId }).toArray(),
      subjects.find({ adminId: payload.userId }).toArray(),
      subscriptions.find({ adminId: payload.userId }).toArray()
    ]);

    console.log('Found data for reports:', {
      students: studentsData.length,
      teachers: teachersData.length,
      subjects: subjectsData.length,
      subscriptions: subscriptionsData.length
    });

    // Student Report - Group by grade
    const studentReport: Record<string, { totalStudents: number; activeStudents: number; inactiveStudents: number }> = {};
    studentsData.forEach(student => {
      const grade = student.grade || 'غير محدد';
      if (!studentReport[grade]) {
        studentReport[grade] = { totalStudents: 0, activeStudents: 0, inactiveStudents: 0 };
      }
      studentReport[grade].totalStudents++;
      if (student.status === 'نشط') {
        studentReport[grade].activeStudents++;
      } else {
        studentReport[grade].inactiveStudents++;
      }
    });

    const studentReportArray = Object.entries(studentReport).map(([grade, data]) => ({
      key: grade,
      grade,
      totalStudents: data.totalStudents,
      activeStudents: data.activeStudents,
      inactiveStudents: data.inactiveStudents,
      percentage: data.totalStudents > 0 ? (data.activeStudents / data.totalStudents) * 100 : 0
    }));

    // Teacher Report - Calculate revenue and student count per teacher
    const teacherReport: Record<string, { teacher: string; subject: string; studentsCount: number; revenue: number; rating: number }> = {};
    teachersData.forEach(teacher => {
      const teacherKey = teacher.name;
      if (!teacherReport[teacherKey]) {
        teacherReport[teacherKey] = {
          teacher: teacher.name,
          subject: teacher.subject || 'غير محدد',
          studentsCount: 0,
          revenue: 0,
          rating: 4.5 // Default rating, can be enhanced later
        };
      }
    });

    // Calculate student count and revenue from subscriptions
    subscriptionsData.forEach(subscription => {
      const teacherName = subscription.teacher;
      if (teacherReport[teacherName]) {
        teacherReport[teacherName].studentsCount++;
        teacherReport[teacherName].revenue += subscription.price || 0;
      }
    });

    const teacherReportArray = Object.values(teacherReport);

    // Subject Report - Calculate revenue and student count per subject
    const subjectReport: Record<string, { subject: string; studentsCount: number; revenue: number; completionRate: number }> = {};
    subjectsData.forEach(subject => {
      const subjectKey = subject.name;
      if (!subjectReport[subjectKey]) {
        subjectReport[subjectKey] = {
          subject: subject.name,
          studentsCount: 0,
          revenue: 0,
          completionRate: 75 // Default completion rate, can be enhanced later
        };
      }
    });

    // Calculate student count and revenue from subscriptions
    subscriptionsData.forEach(subscription => {
      const subjectName = subscription.subject;
      if (subjectReport[subjectName]) {
        subjectReport[subjectName].studentsCount++;
        subjectReport[subjectName].revenue += subscription.price || 0;
      }
    });

    const subjectReportArray = Object.values(subjectReport);

    // Calculate summary statistics
    const totalStudents = studentsData.length;
    const totalRevenue = subscriptionsData.reduce((sum, sub) => sum + (sub.price || 0), 0);
    const averageRating = teacherReportArray.length > 0 
      ? teacherReportArray.reduce((sum, teacher) => sum + teacher.rating, 0) / teacherReportArray.length 
      : 0;

    return NextResponse.json({
      studentReport: studentReportArray,
      teacherReport: teacherReportArray,
      subjectReport: subjectReportArray,
      summary: {
        totalStudents,
        totalRevenue,
        averageRating,
        totalTeachers: teachersData.length,
        totalSubjects: subjectsData.length,
        totalSubscriptions: subscriptionsData.length
      }
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
