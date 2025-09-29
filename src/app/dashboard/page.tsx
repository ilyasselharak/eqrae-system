'use client';

import { Card, Row, Col, Statistic, Typography, Table, Tag, Button, Space, Spin, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface StudentData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  grade?: string;
  subjects?: string[];
  status: string;
  joinDate: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      title: 'إجمالي الطلبة',
      value: 0,
      icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      change: 0,
      changeType: 'increase' as const,
    },
    {
      title: 'إجمالي الاساتذة',
      value: 0,
      icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      change: 0,
      changeType: 'increase' as const,
    },
    {
      title: 'المواد المتاحة',
      value: 0,
      icon: <BookOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      change: 0,
      changeType: 'increase' as const,
    },
    {
      title: 'الإيرادات الشهرية',
      value: 0,
      prefix: 'دم',
      icon: <DollarOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
      change: 0,
      changeType: 'increase' as const,
    },
  ]);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Navigation functions for quick actions
  const handleAddStudent = () => {
    router.push('/dashboard/students');
  };

  const handleAddTeacher = () => {
    router.push('/dashboard/teachers');
  };

  const handleAddSubject = () => {
    router.push('/dashboard/subjects');
  };

  const handleViewStudent = (studentId: string) => {
    message.info(`عرض تفاصيل الطالب: ${studentId}`);
    // You can implement a modal or navigate to student details
  };

  const handleEditStudent = (studentId: string) => {
    message.info(`تعديل الطالب: ${studentId}`);
    // You can implement edit functionality
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/dashboard/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data fetched:', data);
        
        setStats([
          {
            title: 'إجمالي الطلبة',
            value: data.stats.totalStudents,
            icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
            change: 12,
            changeType: 'increase' as const,
          },
          {
            title: 'إجمالي الاساتذة',
            value: data.stats.totalTeachers,
            icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
            change: 3,
            changeType: 'increase' as const,
          },
          {
            title: 'المواد المتاحة',
            value: data.stats.totalSubjects,
            icon: <BookOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
            change: 2,
            changeType: 'increase' as const,
          },
          {
            title: 'الإيرادات الشهرية',
            value: data.stats.totalRevenue,
            prefix: 'دم',
            icon: <DollarOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
            change: 8,
            changeType: 'increase' as const,
          },
        ]);
        setRecentStudents(data.recentStudents || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch dashboard data:', errorData);
        message.error(errorData.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Use the fetched recent students data
  // const recentStudentsData = recentStudents;

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'المادة',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'نشط' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الانضمام',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (record: { _id?: string; id?: string }) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewStudent(record._id || record.id || '')}
          >
            عرض
          </Button>
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditStudent(record._id || record.id || '')}
          >
            تعديل
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <Title level={2} style={{ margin: 0 }}>
          لوحة التحكم الرئيسية
        </Title>
        <Button 
          icon={<ReloadOutlined />}
          onClick={fetchDashboardData}
          loading={loading}
          size="large"
        >
          تحديث البيانات
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: '#3f8600' }}
                suffix={
                  <span style={{ fontSize: 14, color: stat.changeType === 'increase' ? '#3f8600' : '#cf1322' }}>
                    {stat.changeType === 'increase' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {stat.change}%
                  </span>
                }
              />
              <div style={{ marginTop: 8 }}>
                {stat.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Students Table */}
      <Card title="الطلبة الجدد" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={recentStudents.map((student: StudentData, index: number) => ({
            ...student,
            key: student._id || student.id || `student-${index}`
          }))}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title="إضافة طالب جديد" 
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={handleAddStudent}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              إضافة طالب جديد إلى النظام
            </Text>
            <Button 
              type="primary" 
              block
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddStudent();
              }}
            >
              إضافة طالب
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title="إضافة أستاذ" 
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={handleAddTeacher}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              إضافة أستاذ جديد إلى النظام
            </Text>
            <Button 
              type="primary" 
              block
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddTeacher();
              }}
            >
              إضافة أستاذ
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            title="إضافة مادة" 
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={handleAddSubject}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              إضافة مادة دراسية جديدة
            </Text>
            <Button 
              type="primary" 
              block
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddSubject();
              }}
            >
              إضافة مادة
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
