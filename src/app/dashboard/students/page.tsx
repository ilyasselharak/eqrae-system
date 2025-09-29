'use client';

import { Card, Table, Button, Space, Tag, Typography, Input, Select, Row, Col, Modal, Form, message, DatePicker, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  status: string;
  joinDate: string;
  lastLogin?: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  status: string;
  joinDate: string | dayjs.Dayjs;
}

export default function StudentsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<{_id: string, name: string}[]>([]);
  const [levels, setLevels] = useState<{_id: string, name: string, order: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // API functions
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        message.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData: StudentFormData) => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          ...studentData,
          joinDate: typeof studentData.joinDate === 'string' ? studentData.joinDate : studentData.joinDate?.format('YYYY-MM-DD'),
        }),
      });

      if (response.ok) {
        fetchStudents(); // Refresh the list
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      message.error('Error creating student');
    }
  };

  const updateStudent = async (studentData: StudentFormData) => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: editingStudent?._id,
          ...studentData,
          joinDate: typeof studentData.joinDate === 'string' ? studentData.joinDate : studentData.joinDate?.format('YYYY-MM-DD'),
        }),
      });

      if (response.ok) {
        fetchStudents(); // Refresh the list
      } else {
        const error = await response.json();
        message.error(error.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      message.error('Error updating student');
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      console.log('Attempting to delete student with ID:', studentId);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/students', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: studentId,
        }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        fetchStudents(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        message.error(error.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('Error deleting student');
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

  // Fetch levels data
  const fetchLevels = async () => {
    try {
      const token = localStorage.getItem('user-token');
      if (!token) return;

      const response = await fetch('/api/levels', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort levels by order
        const sortedLevels = (data.levels || []).sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        setLevels(sortedLevels);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  // Load students, subjects, and levels on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchStudents(),
        fetchSubjects(),
        fetchLevels()
      ]);
    };
    loadAllData();
  }, []);

  const columns = [
    {
      title: 'رقم الطالب',
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
      title: 'الصف',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'المواد',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects: string[]) => (
        <Space wrap>
          {subjects.map((subject, index) => (
            <Tag key={index} color="blue">
              {subject}
            </Tag>
          ))}
        </Space>
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
      title: 'تاريخ الانضمام',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: 'آخر دخول',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (record: Student) => (
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
    setEditingStudent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      ...student,
      joinDate: student.joinDate ? dayjs(student.joinDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleView = (student: Student) => {
    message.info(`عرض تفاصيل الطالب: ${student.name}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for student ID:', id);
    deleteStudent(id);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingStudent) {
        updateStudent(values);
      } else {
        createStudent(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingStudent(null);
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
          إدارة الطلبة ({students.length} طالب)
        </Title>
        <Space>
          <Button 
            icon={<SearchOutlined />}
            onClick={() => {
              fetchStudents();
              fetchSubjects();
              fetchLevels();
            }}
            loading={loading}
          >
            تحديث البيانات
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            إضافة طالب جديد
          </Button>
        </Space>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
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
              placeholder="فلترة حسب الصف"
              style={{ width: '100%' }}
              size="large"
              allowClear
              showSearch
              optionFilterProp="children"
              notFoundContent={levels.length === 0 ? "لا توجد مستويات. قم بإنشاء مستويات أولاً." : "لا توجد بيانات"}
            >
              {levels.map(level => (
                <Select.Option key={level._id} value={level.name}>
                  {level.name}
                </Select.Option>
              ))}
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
          dataSource={students.map(student => ({ ...student, key: student._id }))}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} طالب`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد'}
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
          name="studentForm"
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
                name="grade"
                label="الصف"
                rules={[{ required: true, message: 'يرجى اختيار الصف' }]}
              >
                <Select 
                  placeholder="اختر الصف"
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={levels.length === 0 ? "لا توجد مستويات. قم بإنشاء مستويات أولاً." : "لا توجد بيانات"}
                >
                  {levels.map(level => (
                    <Select.Option key={level._id} value={level.name}>
                      {level.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subjects"
                label="المواد"
                rules={[{ required: true, message: 'يرجى اختيار المواد' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="اختر المواد"
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                >
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

          <Form.Item
            name="joinDate"
            label="تاريخ الانضمام"
            rules={[{ required: true, message: 'يرجى اختيار تاريخ الانضمام' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
