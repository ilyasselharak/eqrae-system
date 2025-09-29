'use client';

import { Card, Table, Button, Space, Tag, Typography, Input, Select, Row, Col, Modal, Form, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title } = Typography;
const { Search } = Input;

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  status: string;
  joinDate: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  status: string;
}

export default function TeachersPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // API functions
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/teachers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched teachers data:', data.teachers);
        setTeachers(data.teachers || []);
      } else {
        message.error('Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      message.error('Error fetching teachers');
    } finally {
      setLoading(false);
    }
  };

  const createTeacher = async (teacherData: TeacherFormData) => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          ...teacherData,
        }),
      });

      if (response.ok) {
        fetchTeachers(); // Refresh the list
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to create teacher');
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      message.error('Error creating teacher');
    }
  };

  const updateTeacher = async (teacherData: TeacherFormData) => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/teachers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: editingTeacher?._id,
          ...teacherData,
        }),
      });

      if (response.ok) {
        fetchTeachers(); // Refresh the list
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      message.error('Error updating teacher');
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    try {
      console.log('Attempting to delete teacher with ID:', teacherId);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/teachers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: teacherId,
        }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        fetchTeachers(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        message.error(error.error || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      message.error('Error deleting teacher');
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

  // Load teachers and subjects on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchTeachers(),
        fetchSubjects()
      ]);
    };
    loadAllData();
  }, []);

  const columns = [
    {
      title: 'رقم الأستاذ',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'الهاتف',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'المادة',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'الخبرة',
      dataIndex: 'experience',
      key: 'experience',
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
      render: (record: Teacher) => (
        <Space>
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
    setEditingTeacher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.setFieldsValue(teacher);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for teacher ID:', id);
    deleteTeacher(id);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingTeacher) {
        updateTeacher(values);
      } else {
        createTeacher(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingTeacher(null);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
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
          إدارة الاساتذة
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          إضافة أستاذ جديد
        </Button>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="البحث عن أستاذ..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
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
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="فلترة حسب الحالة"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value="active">نشط</Select.Option>
              <Select.Option value="inactive">غير نشط</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={teachers.map(teacher => ({ ...teacher, key: teacher._id }))}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} أستاذ`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingTeacher ? 'تعديل الأستاذ' : 'إضافة أستاذ جديد'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form
          form={form}
          layout="vertical"
          name="teacherForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="الاسم الكامل"
                rules={[{ required: true, message: 'يرجى إدخال الاسم' }]}
              >
                <Input placeholder="أدخل الاسم الكامل" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="البريد الإلكتروني"
                rules={[
                  { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                  { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                ]}
              >
                <Input placeholder="أدخل البريد الإلكتروني" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="رقم الهاتف"
                rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
              >
                <Input placeholder="أدخل رقم الهاتف" />
              </Form.Item>
            </Col>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="experience"
                label="سنوات الخبرة"
                rules={[{ required: true, message: 'يرجى إدخال سنوات الخبرة' }]}
              >
                <Input placeholder="أدخل سنوات الخبرة" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="الحالة"
                rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
              >
                <Select placeholder="اختر الحالة">
                  <Select.Option value="نشط">نشط</Select.Option>
                  <Select.Option value="غير نشط">غير نشط</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

    </div>
  );
}
