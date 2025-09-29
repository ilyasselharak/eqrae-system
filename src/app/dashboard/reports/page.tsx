'use client';

import { Card, Button, Typography, Row, Col, Select, DatePicker, Table, Space, Tag, Statistic, Progress, Spin, message } from 'antd';
import { DownloadOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface StudentReportItem {
  key: string;
  grade: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  percentage: number;
}

interface TeacherReportItem {
  key: string;
  teacher: string;
  subject: string;
  studentsCount: number;
  revenue: number;
  rating: number;
}

interface SubjectReportItem {
  key: string;
  subject: string;
  studentsCount: number;
  revenue: number;
  completionRate: number;
}

interface ReportSummary {
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalTeachers: number;
  totalSubjects: number;
  totalSubscriptions: number;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('students');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);
  const [studentReport, setStudentReport] = useState<StudentReportItem[]>([]);
  const [teacherReport, setTeacherReport] = useState<TeacherReportItem[]>([]);
  const [subjectReport, setSubjectReport] = useState<SubjectReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  // API functions
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/reports', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched reports data:', data);
        setStudentReport(data.studentReport || []);
        setTeacherReport(data.teacherReport || []);
        setSubjectReport(data.subjectReport || []);
        setSummary(data.summary || {});
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch reports data:', errorData);
        message.error(errorData.error || 'Failed to fetch reports data');
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      message.error('Error fetching reports data');
    } finally {
      setLoading(false);
    }
  };

  // Load reports data on component mount
  useEffect(() => {
    fetchReportsData();
  }, []);

  const reportTypes = [
    { value: 'students', label: 'تقرير الطلبة', icon: <BarChartOutlined /> },
    { value: 'teachers', label: 'تقرير الاساتذة', icon: <PieChartOutlined /> },
    { value: 'subjects', label: 'تقرير المواد', icon: <LineChartOutlined /> },
    { value: 'revenue', label: 'تقرير الإيرادات', icon: <FileTextOutlined /> },
  ];

  const studentColumns = [
    {
      title: 'الصف',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'إجمالي الطلبة',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
    },
    {
      title: 'الطلبة النشطين',
      dataIndex: 'activeStudents',
      key: 'activeStudents',
    },
    {
      title: 'الطلبة غير النشطين',
      dataIndex: 'inactiveStudents',
      key: 'inactiveStudents',
    },
    {
      title: 'نسبة النشاط',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <Progress 
          percent={percentage} 
          strokeColor={percentage >= 90 ? '#52c41a' : percentage >= 70 ? '#faad14' : '#ff4d4f'}
          size="small"
        />
      ),
    },
  ];

  const teacherColumns = [
    {
      title: 'الأستاذ',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'المادة',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'عدد الطلبة',
      dataIndex: 'studentsCount',
      key: 'studentsCount',
    },
    {
      title: 'الإيرادات (دم)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `${revenue.toFixed(2)} دم`,
    },
    {
      title: 'التقييم',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Tag color={rating >= 4.5 ? 'green' : rating >= 4.0 ? 'blue' : 'orange'}>
          {rating.toFixed(1)}/5
        </Tag>
      ),
    },
  ];

  const subjectColumns = [
    {
      title: 'المادة',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'عدد الطلبة',
      dataIndex: 'studentsCount',
      key: 'studentsCount',
    },
    {
      title: 'الإيرادات (دم)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `${revenue.toFixed(2)} دم`,
    },
    {
      title: 'معدل الإكمال',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f'}
          size="small"
        />
      ),
    },
  ];

  const getReportData = () => {
    switch (selectedReport) {
      case 'students':
        return { data: studentReport, columns: studentColumns };
      case 'teachers':
        return { data: teacherReport, columns: teacherColumns };
      case 'subjects':
        return { data: subjectReport, columns: subjectColumns };
      default:
        return { data: studentReport, columns: studentColumns };
    }
  };

  const { data, columns } = getReportData();

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

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          التقارير والإحصائيات ({data.length} عنصر)
        </Title>
        <Space>
          <Button 
            icon={<BarChartOutlined />}
            onClick={fetchReportsData}
            loading={loading}
          >
            تحديث البيانات
          </Button>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
          >
            تصدير التقرير
          </Button>
        </Space>
      </div>

      {/* Report Type Selection */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={selectedReport}
              onChange={setSelectedReport}
              style={{ width: '100%' }}
              size="large"
            >
              {reportTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  <Space>
                    {type.icon}
                    {type.label}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              size="large"
              block
            >
              تصدير التقرير
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="إجمالي الطلبة"
              value={summary.totalStudents}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="إجمالي الإيرادات"
              value={summary.totalRevenue}
              prefix="دم"
              valueStyle={{ color: '#3f8600' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="متوسط التقييم"
              value={summary.averageRating}
              precision={1}
              suffix="/5"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="إجمالي الاشتراكات"
              value={summary.totalSubscriptions}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Report Table */}
      <Card title={`تقرير ${reportTypes.find(r => r.value === selectedReport)?.label}`}>
        <Table
          columns={columns}
          dataSource={data as (StudentReportItem | TeacherReportItem | SubjectReportItem)[]}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} عنصر`
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: data.length === 0 ? 'لا توجد بيانات للعرض. قم بإضافة بيانات أولاً.' : 'لا توجد بيانات'
          }}
        />
      </Card>
    </div>
  );
}
