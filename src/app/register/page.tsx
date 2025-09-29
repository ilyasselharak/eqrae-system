'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterForm>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          email: values.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        form.resetFields();
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        message.error(data.error || 'فشل في إنشاء الحساب');
      }
    } catch (error) {
      message.error('حدث خطأ أثناء إنشاء الحساب');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-center">
            إنشاء حساب جديد
          </Title>
          <Text type="secondary" className="text-center block">
            انضم إلى نظام الدراسة وابدأ رحلتك التعليمية
          </Text>
        </div>

        <Card className="shadow-lg">
          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="اسم المستخدم"
              rules={[
                { required: true, message: 'يرجى إدخال اسم المستخدم!' },
                { min: 3, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل!' },
                { max: 20, message: 'اسم المستخدم يجب أن يكون أقل من 20 حرف!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="أدخل اسم المستخدم"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="البريد الإلكتروني (اختياري)"
              rules={[
                { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="أدخل البريد الإلكتروني"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="كلمة المرور"
              rules={[
                { required: true, message: 'يرجى إدخال كلمة المرور!' },
                { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="أدخل كلمة المرور"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="تأكيد كلمة المرور"
              dependencies={['password']}
              rules={[
                { required: true, message: 'يرجى تأكيد كلمة المرور!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('كلمات المرور غير متطابقة!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="أعد إدخال كلمة المرور"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                إنشاء الحساب
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Text type="secondary">
              لديك حساب بالفعل؟{' '}
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                تسجيل الدخول
              </Link>
            </Text>
          </div>
        </Card>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftOutlined className="ml-2" />
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
