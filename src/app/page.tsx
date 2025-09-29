'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export default function Home() {
  const [loginForm] = Form.useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login } = useUser();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      window.location.href = '/dashboard';
    }
  }, [user, authLoading]);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token in localStorage
        login(data.user, data.token);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        message.error(data.error || 'فشل في تسجيل الدخول');
      }
    } catch (error) {
      message.error('حدث خطأ أثناء تسجيل الدخول');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-center">
            نظام الدراسة
          </Title>
          <Text type="secondary" className="text-center block">
            مرحباً! يرجى تسجيل الدخول للمتابعة أو إنشاء حساب جديد.
          </Text>
        </div>

        <Card className="shadow-lg">
          <Form
            form={loginForm}
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="اسم المستخدم"
              rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="أدخل اسم المستخدم"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="كلمة المرور"
              rules={[{ required: true, message: 'يرجى إدخال كلمة المرور!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="أدخل كلمة المرور"
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
                تسجيل الدخول
              </Button>
            </Form.Item>

            <Form.Item>
              <Link href="/register">
                <Button
                  type="default"
                  block
                  size="large"
                >
                  إنشاء حساب جديد
                </Button>
              </Link>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
