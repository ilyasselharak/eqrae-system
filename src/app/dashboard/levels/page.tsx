'use client';

import { Card, Table, Button, Space, Tag, Typography, Input, Select, Row, Col, Modal, Form, message, InputNumber, Spin, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface Level {
  _id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface LevelFormData {
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

export default function LevelsPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // API functions
  const fetchLevels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/levels', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched levels data:', data.levels);
        setLevels(data.levels || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch levels:', errorData);
        message.error(errorData.error || 'Failed to fetch levels');
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      message.error('Error fetching levels');
    } finally {
      setLoading(false);
    }
  };

  const createLevel = async (levelData: LevelFormData) => {
    try {
      console.log('Creating level with data:', levelData);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          ...levelData,
        }),
      });

      console.log('Create response status:', response.status);
      
      if (response.ok) {
        ('تم إنشاء المستوى بنجاح');
        fetchLevels(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Create error:', error);
        message.error(error.error || 'Failed to create level');
      }
    } catch (error) {
      console.error('Error creating level:', error);
      message.error('Error creating level');
    }
  };

  const updateLevel = async (levelData: LevelFormData) => {
    try {
      console.log('Updating level with data:', levelData, 'ID:', editingLevel?._id);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/levels', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: editingLevel?._id,
          ...levelData,
        }),
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        fetchLevels(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        message.error(error.error || 'Failed to update level');
      }
    } catch (error) {
      console.error('Error updating level:', error);
      message.error('Error updating level');
    }
  };

  const deleteLevel = async (levelId: string) => {
    try {
      console.log('Attempting to delete level with ID:', levelId);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/levels', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          id: levelId,
        }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        fetchLevels(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Delete error:', error);
        message.error(error.error || 'Failed to delete level');
      }
    } catch (error) {
      console.error('Error deleting level:', error);
      message.error('Error deleting level');
    }
  };

  // Load levels on component mount
  useEffect(() => {
    fetchLevels();
  }, []);

  const columns = [
    {
      title: 'رقم المستوى',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'اسم المستوى',
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
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'الترتيب',
      dataIndex: 'order',
      key: 'order',
      render: (order: number) => (
        <Tag color="blue">{order}</Tag>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (record: Level) => (
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
    setEditingLevel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    form.setFieldsValue({
      ...level,
      isActive: level.isActive
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for level ID:', id);
    deleteLevel(id);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingLevel) {
        updateLevel(values);
      } else {
        createLevel(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingLevel(null);
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
          إدارة المستويات ({levels.length} مستوى)
        </Title>
        <Space>
          <Button 
            icon={<SearchOutlined />}
            onClick={fetchLevels}
            loading={loading}
          >
            تحديث البيانات
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            إضافة مستوى جديد
          </Button>
        </Space>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="البحث عن مستوى..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="فلترة حسب الحالة"
              style={{ width: '100%' }}
              size="large"
              allowClear
            >
              <Select.Option value={true}>نشط</Select.Option>
              <Select.Option value={false}>غير نشط</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="ترتيب حسب"
              style={{ width: '100%' }}
              size="large"
              defaultValue="order"
            >
              <Select.Option value="order">الترتيب</Select.Option>
              <Select.Option value="name">الاسم</Select.Option>
              <Select.Option value="createdAt">تاريخ الإنشاء</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={levels.map(level => ({ ...level, key: level._id }))}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} مستوى`
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: levels.length === 0 ? 'لا توجد مستويات. اضغط "إضافة مستوى جديد" لإنشاء مستوى.' : 'لا توجد بيانات'
          }}
        />
      </Card>

      <Modal
        title={editingLevel ? 'تعديل المستوى' : 'إضافة مستوى جديد'}
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
          name="levelForm"
        >
          <Form.Item
            name="name"
            label="اسم المستوى"
            rules={[{ required: true, message: 'يرجى إدخال اسم المستوى' }]}
          >
            <Input placeholder="مثال: ثانية باك، اولى باك" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="وصف المستوى"
          >
            <TextArea 
              rows={3} 
              placeholder="أدخل وصف المستوى" 
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="order"
                label="الترتيب"
                rules={[{ required: true, message: 'يرجى إدخال الترتيب' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="أدخل الترتيب"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="الحالة"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="نشط" 
                  unCheckedChildren="غير نشط" 
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
