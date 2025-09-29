'use client';

import { Card, Table, Button, Space, Tag, Typography, Input, Select, Row, Col, DatePicker, Statistic, Progress, Spin, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface RevenueData {
  _id: string;
  date: string;
  studentName: string;
  subject: string;
  amount: number;
  paymentMethod: string;
  status: string;
  teacher: string;
  startDate: string;
  endDate: string;
}

interface RevenueStatistics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  averageRevenue: number;
  totalTransactions: number;
}

interface PaymentMethodStat {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface SubjectStat {
  subject: string;
  revenue: number;
  students: number;
}

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [statistics, setStatistics] = useState<RevenueStatistics>({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    averageRevenue: 0,
    totalTransactions: 0
  });
  const [paymentMethodStats, setPaymentMethodStats] = useState<PaymentMethodStat[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  // API functions
  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/revenue', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched revenue data:', data);
        setRevenueData(data.revenueData || []);
        setStatistics(data.statistics || {});
        setPaymentMethodStats(data.paymentMethodStats || []);
        setSubjectStats(data.subjectStats || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch revenue data:', errorData);
        message.error(errorData.error || 'Failed to fetch revenue data');
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      message.error('Error fetching revenue data');
    } finally {
      setLoading(false);
    }
  };

  // Load revenue data on component mount
  useEffect(() => {
    fetchRevenueData();
  }, []);

  const columns = [
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: RevenueData, b: RevenueData) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'اسم الطالب',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'المادة',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'الأستاذ',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'المبلغ (دم)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount} دم`,
      sorter: (a: RevenueData, b: RevenueData) => a.amount - b.amount,
    },
    {
      title: 'طريقة الدفع',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'مدفوع' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
  ];

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
          إدارة الإيرادات ({statistics.totalTransactions} معاملة)
        </Title>
        <Space>
          <Button 
            icon={<SearchOutlined />}
            onClick={fetchRevenueData}
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

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="إجمالي الإيرادات"
              value={statistics.totalRevenue}
              prefix="دم"
              valueStyle={{ color: '#3f8600' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="الإيرادات المدفوعة"
              value={statistics.paidRevenue}
              prefix="دم"
              valueStyle={{ color: '#3f8600' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="الإيرادات المعلقة"
              value={statistics.pendingRevenue}
              prefix="دم"
              valueStyle={{ color: '#cf1322' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="متوسط الإيراد"
              value={statistics.averageRevenue}
              prefix="دم"
              valueStyle={{ color: '#1890ff' }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] || [dayjs().subtract(30, 'day'), dayjs()])}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="البحث عن طالب..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="فلترة حسب طريقة الدفع"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value="bank">تحويل بنكي</Select.Option>
              <Select.Option value="visa">فيزا</Select.Option>
              <Select.Option value="mastercard">ماستركارد</Select.Option>
              <Select.Option value="cash">نقداً</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Revenue Table */}
      <Card title="سجل الإيرادات" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={revenueData.map(item => ({ ...item, key: item._id }))}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} معاملة`
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: revenueData.length === 0 ? 'لا توجد معاملات إيراد. قم بإنشاء اشتراكات لرؤية الإيرادات.' : 'لا توجد بيانات'
          }}
        />
      </Card>

      {/* Payment Method Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="إحصائيات طرق الدفع">
            {paymentMethodStats.length > 0 ? (
              paymentMethodStats.map((stat, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>{stat.method}</span>
                    <span>{stat.amount.toFixed(2)} دم ({stat.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress 
                    percent={stat.percentage} 
                    strokeColor="#1890ff"
                    showInfo={false}
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                لا توجد بيانات طرق دفع
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="إحصائيات المواد">
            {subjectStats.length > 0 ? (
              subjectStats.map((stat, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>{stat.subject}</span>
                    <span>{stat.revenue.toFixed(2)} دم ({stat.students} طالب)</span>
                  </div>
                  <Progress 
                    percent={statistics.totalRevenue > 0 ? (stat.revenue / statistics.totalRevenue) * 100 : 0} 
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                لا توجد بيانات مواد
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
