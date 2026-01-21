'use client';

/**
 * Dashboard 화면
 * @description 샘플 대시보드 화면
 */

import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function Dashboard() {
  return (
    <div data-testid="screen-dashboard" className="p-6">
      <Title level={3}>대시보드</Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="일일 생산량"
              value={1234}
              suffix="EA"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="불량률"
              value={2.3}
              suffix="%"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="설비 가동률"
              value={89.7}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="주문 달성률"
              value={95.2}
              suffix="%"
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="생산 현황">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <span className="text-gray-400">Line Chart Placeholder</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="품목별 생산량">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <span className="text-gray-400">Bar Chart Placeholder</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
