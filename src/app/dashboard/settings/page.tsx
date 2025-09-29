'use client';

import { Card, Form, Input, Button, Switch, Select, Typography, Row, Col, Divider, message, Upload, Avatar, Spin } from 'antd';
import { SettingOutlined, UserOutlined, UploadOutlined, SaveOutlined, LockOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';

const { Title, Text } = Typography;

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newStudentNotifications: boolean;
  paymentNotifications: boolean;
  maintenanceReminders: boolean;
  systemUpdates: boolean;
}

interface SystemSettings {
  systemName: string;
  systemDescription: string;
  maintenanceMode: boolean;
  autoLogin: boolean;
  currency: string;
  dateFormat: string;
}

export default function SettingsPage() {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // API functions
  const fetchSettings = useCallback(async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched settings data:', data);
        
        // Set form values
        profileForm.setFieldsValue(data.profile);
        notificationForm.setFieldsValue(data.settings.notifications);
        systemForm.setFieldsValue(data.settings.system);
        
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch settings:', errorData);
        message.error(errorData.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Error fetching settings');
    } finally {
      setDataLoading(false);
    }
  }, [profileForm, notificationForm, systemForm]);

  const updateSettings = async (type: string, data: ProfileData | NotificationSettings | SystemSettings | { currentPassword: string; newPassword: string }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user-token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          type,
          data
        }),
      });

      if (response.ok) {
        // Refresh data
        await fetchSettings();
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        message.error(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (values: ProfileData) => {
    await updateSettings('profile', values);
  };

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('كلمات المرور غير متطابقة');
      return;
    }
    
    await updateSettings('password', {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    });
    passwordForm.resetFields();
  };

  const handleNotificationSave = async (values: NotificationSettings) => {
    await updateSettings('notifications', values);
  };

  const handleSystemSave = async (values: SystemSettings) => {
    await updateSettings('system', values);
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (dataLoading) {
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
      <Title level={2} style={{ marginBottom: 24 }}>
        <SettingOutlined /> الإعدادات
      </Title>

      <Row gutter={[24, 24]}>
        {/* Profile Settings */}
        <Col xs={24} lg={12}>
          <Card title={
            <span>
              <UserOutlined style={{ marginLeft: 8 }} />
              إعدادات الملف الشخصي
            </span>
          }>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSave}
            >
              <Row gutter={16}>
                <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar size={100} icon={<UserOutlined />} />
                  <div style={{ marginTop: 16 }}>
                    <Upload>
                      <Button icon={<UploadOutlined />}>تغيير الصورة</Button>
                    </Upload>
                  </div>
                </Col>
              </Row>

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
                    name="language"
                    label="اللغة"
                    rules={[{ required: true, message: 'يرجى اختيار اللغة' }]}
                  >
                    <Select placeholder="اختر اللغة">
                      <Select.Option value="ar">العربية</Select.Option>
                      <Select.Option value="en">English</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="timezone"
                label="المنطقة الزمنية"
                rules={[{ required: true, message: 'يرجى اختيار المنطقة الزمنية' }]}
              >
                <Select placeholder="اختر المنطقة الزمنية">
                  <Select.Option value="Asia/Riyadh">الرياض (GMT+3)</Select.Option>
                  <Select.Option value="Asia/Dubai">دبي (GMT+4)</Select.Option>
                  <Select.Option value="Europe/London">لندن (GMT+0)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                >
                  حفظ التغييرات
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={24} lg={12}>
          <Card title={
            <span>
              <LockOutlined style={{ marginLeft: 8 }} />
              إعدادات الأمان
            </span>
          }>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="كلمة المرور الحالية"
                rules={[{ required: true, message: 'يرجى إدخال كلمة المرور الحالية' }]}
              >
                <Input.Password placeholder="أدخل كلمة المرور الحالية" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="كلمة المرور الجديدة"
                rules={[
                  { required: true, message: 'يرجى إدخال كلمة المرور الجديدة' },
                  { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                ]}
              >
                <Input.Password placeholder="أدخل كلمة المرور الجديدة" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                rules={[{ required: true, message: 'يرجى تأكيد كلمة المرور' }]}
              >
                <Input.Password placeholder="أعد إدخال كلمة المرور الجديدة" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<LockOutlined />}
                  loading={loading}
                  block
                >
                  تغيير كلمة المرور
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Notification Settings */}
        <Col xs={24} lg={12}>
          <Card title={
            <span>
              <BellOutlined style={{ marginLeft: 8 }} />
              إعدادات الإشعارات
            </span>
          }>
            <Form 
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSave}
            >
              <Form.Item label="إشعارات البريد الإلكتروني">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="newStudentNotifications" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <Text>إشعارات الطلبة الجدد</Text>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="paymentNotifications" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <Text>إشعارات المدفوعات</Text>
                  </Col>
                </Row>
              </Form.Item>

              <Divider />

              <Form.Item label="إشعارات النظام">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="maintenanceReminders" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <Text>تذكيرات الصيانة</Text>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="systemUpdates" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <Text>تحديثات النظام</Text>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                >
                  حفظ إعدادات الإشعارات
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* System Settings */}
        <Col xs={24} lg={12}>
          <Card title={
            <span>
              <GlobalOutlined style={{ marginLeft: 8 }} />
              إعدادات النظام
            </span>
          }>
            <Form 
              form={systemForm}
              layout="vertical"
              onFinish={handleSystemSave}
            >
              <Form.Item
                name="systemName"
                label="اسم النظام"
              >
                <Input placeholder="أدخل اسم النظام" />
              </Form.Item>

              <Form.Item
                name="systemDescription"
                label="وصف النظام"
              >
                <Input.TextArea rows={3} placeholder="أدخل وصف النظام" />
              </Form.Item>

              <Form.Item label="إعدادات عامة">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="maintenanceMode" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <Text>وضع الصيانة</Text>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="autoLogin" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <Text>تسجيل الدخول التلقائي</Text>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                >
                  حفظ إعدادات النظام
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
