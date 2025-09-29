'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme, Spin, Drawer } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CreditCardOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('0');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, loading, logout } = useUser();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Mobile detection and responsive handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  const menuItems = [
    {
      key: '0',
      icon: <BarChartOutlined />,
      label: 'لوحة التحكم',
      path: '/dashboard',
    },
    {
      key: '1',
      icon: <TeamOutlined />,
      label: 'الاساتدة',
      path: '/dashboard/teachers',
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'الطلبة',
      path: '/dashboard/students',
    },
    {
      key: '3',
      icon: <BookOutlined />,
      label: 'المواد',
      path: '/dashboard/subjects',
    },
    {
      key: '4',
      icon: <AppstoreOutlined />,
      label: 'المستويات',
      path: '/dashboard/levels',
    },
    {
      key: '5',
      icon: <CreditCardOutlined />,
      label: 'الاشتراكات',
      path: '/dashboard/subscriptions',
    },
    {
      key: '6',
      icon: <DollarOutlined />,
      label: 'الارادات',
      path: '/dashboard/revenue',
    },
    {
      key: '7',
      icon: <BarChartOutlined />,
      label: 'التقارير',
      path: '/dashboard/reports',
    },
    {
      key: '8',
      icon: <TeamOutlined />,
      label: 'إنشاء مستخدمين',
      path: '/create-register-accounts',
    },
    {
      key: '9',
      icon: <SettingOutlined />,
      label: 'الاعدادات',
      path: '/dashboard/settings',
    },
    
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
    const selectedItem = menuItems.find(item => item.key === key);
    if (selectedItem) {
      router.push(selectedItem.path);
      // Close mobile menu after navigation
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'الملف الشخصي',
    },
  ];

  // Mobile menu component
  const MobileMenu = () => (
    <div style={{ padding: '16px 0' }}>
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 16
      }}>
        <h3 style={{ margin: 0, color: '#1890ff' }}>
          نظام الدراسة
        </h3>
      </div>
      
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
      
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #f0f0f0',
        marginTop: 16
      }}>
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          size="large"
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px'
          }}
        >
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }} dir="rtl">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            background: colorBgContainer,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        <div className="demo-logo-vertical" style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h3 style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'ن.د' : 'نظام الدراسة'}
          </h3>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
          />
        </div>
        
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          background: colorBgContainer
        }}>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            size="large"
            style={{
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '8px'
            }}
          >
            {!collapsed && 'تسجيل الخروج'}
          </Button>
        </div>
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          body: { padding: 0 },
          header: { display: 'none' }
        }}
      >
        <MobileMenu />
      </Drawer>

      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuFoldOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            )}
            
            {/* Desktop menu toggle */}
            {!isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            )}
          </div>
          
          <div style={{ marginLeft: 'auto', marginRight: 24 }}>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.3s'
              }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginRight: 8, marginLeft: 8 }}>
                  {user?.username || 'المستخدم'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? '16px 8px' : '24px 16px',
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
