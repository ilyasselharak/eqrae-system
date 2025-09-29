'use client';

import { Card, Form, Input, Button, Select, Typography, Row, Col, message, Space, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'user';
}

export default function CreateRegisterAccountsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: UserFormData) => {
    try {
      setLoading(true);
      
      // Validate password confirmation
      if (values.password !== values.confirmPassword) {
        message.error('كلمات المرور غير متطابقة');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('تم إنشاء المستخدم بنجاح');
        form.resetFields();
        
        // Show success message with user details
        message.success({
          content: `تم إنشاء المستخدم "${data.user.username}" بنجاح`,
          duration: 3,
        });
      } else {
        message.error(data.error || 'فشل في إنشاء المستخدم');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }}>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
              إنشاء حساب مستخدم جديد
            </Title>
            <Text type="secondary">
              قم بإنشاء حساب مستخدم جديد في النظام
            </Text>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            size="large"
          >
            العودة للوحة التحكم
          </Button>
        </div>

        {/* Registration Form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="اسم المستخدم"
                  rules={[
                    { required: true, message: 'يرجى إدخال اسم المستخدم' },
                    { min: 3, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' },
                    { max: 20, message: 'اسم المستخدم يجب أن يكون أقل من 20 حرف' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="أدخل اسم المستخدم"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="البريد الإلكتروني"
                  rules={[
                    { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                    { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="كلمة المرور"
                  rules={[
                    { required: true, message: 'يرجى إدخال كلمة المرور' },
                    { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="أدخل كلمة المرور"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="confirmPassword"
                  label="تأكيد كلمة المرور"
                  rules={[
                    { required: true, message: 'يرجى تأكيد كلمة المرور' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="role"
                  label="نوع المستخدم"
                  rules={[{ required: true, message: 'يرجى اختيار نوع المستخدم' }]}
                  initialValue="user"
                >
                  <Select placeholder="اختر نوع المستخدم">
                    <Select.Option value="user">مستخدم عادي</Select.Option>
                    <Select.Option value="admin">مدير</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </Button>
                <Button
                  onClick={() => form.resetFields()}
                  size="large"
                >
                  إعادة تعيين
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Information Card */}
        <Card title="معلومات إضافية" type="inner">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <Title level={5} style={{ color: '#52c41a', margin: '0 0 8px 0' }}>
                  <UserOutlined style={{ marginLeft: 8 }} />
                  المستخدم العادي
                </Title>
                <Text type="secondary">
                  يمكن للمستخدم العادي الوصول إلى لوحة التحكم وإدارة الطلبة والمواد والاشتراكات
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px', backgroundColor: '#fff7e6', borderRadius: '6px', border: '1px solid #ffd591' }}>
                <Title level={5} style={{ color: '#fa8c16', margin: '0 0 8px 0' }}>
                  <TeamOutlined style={{ marginLeft: 8 }} />
                  المدير
                </Title>
                <Text type="secondary">
                  يمكن للمدير الوصول إلى جميع الميزات بما في ذلك إنشاء المستخدمين وإدارة النظام
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
}
