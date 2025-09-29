'use client';

import { Card, Table, Button, Space, Tag, Typography, Input, Select, Row, Col, Modal, Form, message, InputNumber, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacher: string;
  grade: string;
  price: number;
  duration: string;
  status: string;
  studentsCount?: number;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  teacher: string;
  grade: string;
  price: number;
  duration: string;
  status: string;
}

export default function SubjectsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // API functions
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/subjects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched subjects data:', data.subjects);
        console.log('Number of subjects:', data.subjects?.length || 0);
        setSubjects(data.subjects || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch subjects:', errorData);
        message.error(errorData.error || 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      message.error('Error fetching subjects');
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subjectData: SubjectFormData) => {
    try {
      console.log('Creating subject with data:', subjectData);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          ...subjectData,
        }),
      });

      console.log('Create response status:', response.status);
      
      if (response.ok) {
        fetchSubjects(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Create error:', error);
        message.error(error.error || 'Failed to create subject');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      message.error('Error creating subject');
    }
  };

  const updateSubject = async (subjectData: SubjectFormData) => {
    try {
      console.log('Updating subject with data:', subjectData, 'ID:', editingSubject?._id);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/subjects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: editingSubject?._id,
          ...subjectData,
        }),
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        fetchSubjects(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        message.error(error.error || 'Failed to update subject');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      message.error('Error updating subject');
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      console.log('Attempting to delete subject with ID:', subjectId);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/subjects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: subjectId,
        }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        fetchSubjects(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        message.error(error.error || 'Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      message.error('Error deleting subject');
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

  // Load subjects and teachers on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchSubjects(),
        fetchTeachers()
      ]);
    };
    loadAllData();
  }, []);

  const columns = [
    {
      title: 'رقم المادة',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'اسم المادة',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <BookOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'كود المادة',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'الأستاذ',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'الصف',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'السعر (دم)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price} دم`,
    },
    {
      title: 'المدة',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'عدد الطلبة',
      dataIndex: 'studentsCount',
      key: 'studentsCount',
      render: (count: number) => (
        <Tag color="blue">{count} طالب</Tag>
      ),
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
      title: 'الإجراءات',
      key: 'actions',
      render: (record: Subject) => (
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
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    form.setFieldsValue(subject);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for subject ID:', id);
    deleteSubject(id);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingSubject) {
        updateSubject(values);
      } else {
        createSubject(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingSubject(null);
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
          إدارة المواد ({subjects.length} مادة)
        </Title>
        <Space>
          <Button 
            icon={<SearchOutlined />}
            onClick={fetchSubjects}
            loading={loading}
          >
            تحديث البيانات
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            إضافة مادة جديدة
          </Button>
        </Space>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="البحث عن مادة..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="فلترة حسب الصف"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value="grade1">الصف الأول الثانوي</Select.Option>
              <Select.Option value="grade2">الصف الثاني الثانوي</Select.Option>
              <Select.Option value="grade3">الصف الثالث الثانوي</Select.Option>
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
          dataSource={subjects.map(subject => ({ ...subject, key: subject._id }))}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} مادة`
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: subjects.length === 0 ? 'لا توجد مواد. اضغط "إضافة مادة جديدة" لإنشاء مادة.' : 'لا توجد بيانات'
          }}
        />
      </Card>

      <Modal
        title={editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form
          form={form}
          layout="vertical"
          name="subjectForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="اسم المادة"
                rules={[{ required: true, message: 'يرجى إدخال اسم المادة' }]}
              >
                <Input placeholder="أدخل اسم المادة" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="كود المادة"
                rules={[{ required: true, message: 'يرجى إدخال كود المادة' }]}
              >
                <Input placeholder="أدخل كود المادة" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="وصف المادة"
            rules={[{ required: true, message: 'يرجى إدخال وصف المادة' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="أدخل وصف المادة" 
            />
          </Form.Item>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="grade"
                label="الصف"
                rules={[{ required: true, message: 'يرجى اختيار الصف' }]}
              >
                <Select placeholder="اختر الصف">
                  <Select.Option value="الصف الأول الثانوي">الصف الأول الثانوي</Select.Option>
                  <Select.Option value="الصف الثاني الثانوي">الصف الثاني الثانوي</Select.Option>
                  <Select.Option value="الصف الثالث الثانوي">الصف الثالث الثانوي</Select.Option>
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
                name="duration"
                label="المدة"
                rules={[{ required: true, message: 'يرجى إدخال المدة' }]}
              >
                <Input placeholder="أدخل المدة" />
              </Form.Item>
            </Col>
            <Col span={8}>
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
