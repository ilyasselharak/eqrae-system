'use client';

import { Card, Table, Button, Space, Tag, Typography, Input, Select, Row, Col, Modal, Form, message, DatePicker, InputNumber, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CreditCardOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

interface Subscription {
  _id: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  teacher: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionFormData {
  studentName: string;
  studentEmail: string;
  subject: string;
  teacher: string;
  price: number;
  startDate: string | dayjs.Dayjs;
  endDate: string | dayjs.Dayjs;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
}

export default function SubscriptionsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [teachers, setTeachers] = useState<{_id: string, name: string}[]>([]);
  const [students, setStudents] = useState<{_id: string, name: string, email: string}[]>([]);
  const [subjects, setSubjects] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // API functions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/subscriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched subscriptions data:', data.subscriptions);
        setSubscriptions(data.subscriptions || []);
      } else {
        message.error('Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      message.error('Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (subscriptionData: SubscriptionFormData) => {
    try {
      console.log('Creating subscription with data:', subscriptionData);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      // Format dates
      const formattedData = {
        ...subscriptionData,
        startDate: subscriptionData.startDate instanceof dayjs ? subscriptionData.startDate.format('YYYY-MM-DD') : subscriptionData.startDate,
        endDate: subscriptionData.endDate instanceof dayjs ? subscriptionData.endDate.format('YYYY-MM-DD') : subscriptionData.endDate,
      };

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          ...formattedData,
        }),
      });

      console.log('Create response status:', response.status);
      
      if (response.ok) {
        fetchSubscriptions(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Create error:', error);
        message.error(error.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      message.error('Error creating subscription');
    }
  };

  const updateSubscription = async (subscriptionData: SubscriptionFormData) => {
    try {
      console.log('Updating subscription with data:', subscriptionData, 'ID:', editingSubscription?._id);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      // Format dates
      const formattedData = {
        ...subscriptionData,
        startDate: subscriptionData.startDate instanceof dayjs ? subscriptionData.startDate.format('YYYY-MM-DD') : subscriptionData.startDate,
        endDate: subscriptionData.endDate instanceof dayjs ? subscriptionData.endDate.format('YYYY-MM-DD') : subscriptionData.endDate,
      };

      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: editingSubscription?._id,
          ...formattedData,
        }),
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        fetchSubscriptions(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        message.error(error.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      message.error('Error updating subscription');
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    try {
      console.log('Attempting to delete subscription with ID:', subscriptionId);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: subscriptionId,
        }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        fetchSubscriptions(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        message.error(error.error || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      message.error('Error deleting subscription');
    }
  };

  // Fetch teachers data
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) return;

      const response = await fetch('/api/teachers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) return;

      const response = await fetch('/api/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch subjects data
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) return;

      const response = await fetch('/api/subjects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchSubscriptions(),
        fetchTeachers(),
        fetchStudents(),
        fetchSubjects()
      ]);
    };
    loadAllData();
  }, []);

  const columns = [
    {
      title: 'رقم الاشتراك',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'اسم الطالب',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'studentEmail',
      key: 'studentEmail',
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
      title: 'السعر (دم)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price} دم`,
    },
    {
      title: 'تاريخ البداية',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'تاريخ النهاية',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'حالة الاشتراك',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'نشط' ? 'green' : status === 'منتهي' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'حالة الدفع',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={status === 'مدفوع' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'طريقة الدفع',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (record: Subscription) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            عرض
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingSubscription(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    form.setFieldsValue({
      ...subscription,
      startDate: subscription.startDate ? dayjs(subscription.startDate) : null,
      endDate: subscription.endDate ? dayjs(subscription.endDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleView = (subscription: Subscription) => {
    message.info(`عرض تفاصيل الاشتراك: ${subscription.studentName}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for subscription ID:', id);
    deleteSubscription(id);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingSubscription) {
        updateSubscription(values);
      } else {
        createSubscription(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingSubscription(null);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingSubscription(null);
  };

  const handleStudentChange = (studentName: string) => {
    const selectedStudent = students.find(student => student.name === studentName);
    if (selectedStudent) {
      form.setFieldsValue({
        studentEmail: selectedStudent.email
      });
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

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          إدارة الاشتراكات
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          إضافة اشتراك جديد
        </Button>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="البحث عن اشتراك..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="فلترة حسب الحالة"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value="active">نشط</Select.Option>
              <Select.Option value="expired">منتهي</Select.Option>
              <Select.Option value="pending">معلق</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="فلترة حسب الدفع"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value="paid">مدفوع</Select.Option>
              <Select.Option value="unpaid">غير مدفوع</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="فلترة حسب المادة"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value="math">الرياضيات</Select.Option>
              <Select.Option value="physics">الفيزياء</Select.Option>
              <Select.Option value="chemistry">الكيمياء</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={subscriptions.map(subscription => ({ ...subscription, key: subscription._id }))}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} اشتراك`
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={editingSubscription ? 'تعديل الاشتراك' : 'إضافة اشتراك جديد'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form
          form={form}
          layout="vertical"
          name="subscriptionForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentName"
                label="اسم الطالب"
                rules={[{ required: true, message: 'يرجى اختيار الطالب' }]}
              >
                <Select 
                  placeholder="اختر الطالب" 
                  showSearch 
                  optionFilterProp="children"
                  onChange={handleStudentChange}
                >
                  {students.map(student => (
                    <Select.Option key={student._id} value={student.name}>
                      {student.name} ({student.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentEmail"
                label="البريد الإلكتروني"
                rules={[
                  { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                  { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                ]}
              >
                <Input placeholder="سيتم ملؤه تلقائياً عند اختيار الطالب" readOnly />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="المادة"
                rules={[{ required: true, message: 'يرجى اختيار المادة' }]}
              >
                <Select placeholder="اختر المادة" showSearch optionFilterProp="children">
                  {subjects.map(subject => (
                    <Select.Option key={subject._id} value={subject.name}>
                      {subject.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teacher"
                label="الأستاذ"
                rules={[{ required: true, message: 'يرجى اختيار الأستاذ' }]}
              >
                <Select placeholder="اختر الأستاذ" showSearch optionFilterProp="children">
                  {teachers.map(teacher => (
                    <Select.Option key={teacher._id} value={teacher.name}>
                      {teacher.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="السعر (دم)"
                rules={[{ required: true, message: 'يرجى إدخال السعر' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="أدخل السعر"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startDate"
                label="تاريخ البداية"
                rules={[{ required: true, message: 'يرجى اختيار تاريخ البداية' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endDate"
                label="تاريخ النهاية"
                rules={[{ required: true, message: 'يرجى اختيار تاريخ النهاية' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="حالة الاشتراك"
                rules={[{ required: true, message: 'يرجى اختيار حالة الاشتراك' }]}
              >
                <Select placeholder="اختر الحالة">
                  <Select.Option value="active">نشط</Select.Option>
                  <Select.Option value="expired">منتهي</Select.Option>
                  <Select.Option value="pending">معلق</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentStatus"
                label="حالة الدفع"
                rules={[{ required: true, message: 'يرجى اختيار حالة الدفع' }]}
              >
                <Select placeholder="اختر حالة الدفع">
                  <Select.Option value="paid">مدفوع</Select.Option>
                  <Select.Option value="unpaid">غير مدفوع</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentMethod"
                label="طريقة الدفع"
                rules={[{ required: true, message: 'يرجى اختيار طريقة الدفع' }]}
              >
                <Select placeholder="اختر طريقة الدفع">
                  <Select.Option value="bank">تحويل بنكي</Select.Option>
                  <Select.Option value="visa">فيزا</Select.Option>
                  <Select.Option value="mastercard">ماستركارد</Select.Option>
                  <Select.Option value="cash">نقداً</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
