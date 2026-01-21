'use client';

/**
 * SampleTable 화면
 * @description 샘플 테이블 화면 - 필터 및 페이징 테스트용
 */

import { useState } from 'react';
import { Table, Input, Select, Button, Space, Card, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface DataType {
  key: string;
  id: number;
  name: string;
  status: string;
  quantity: number;
  date: string;
}

const initialData: DataType[] = Array.from({ length: 50 }, (_, i) => ({
  key: String(i + 1),
  id: i + 1,
  name: `품목 ${i + 1}`,
  status: ['진행중', '완료', '대기'][i % 3],
  quantity: Math.floor(Math.random() * 1000),
  date: `2026-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
}));

const statusOptions = [
  { value: '', label: '전체' },
  { value: '진행중', label: '진행중' },
  { value: '완료', label: '완료' },
  { value: '대기', label: '대기' },
];

export default function SampleTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: ColumnsType<DataType> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '품목명', dataIndex: 'name', key: 'name' },
    { title: '상태', dataIndex: 'status', key: 'status', width: 100 },
    { title: '수량', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: '일자', dataIndex: 'date', key: 'date', width: 120 },
  ];

  const filteredData = initialData.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div data-testid="screen-sample-table" className="p-6">
      <Title level={3}>샘플 테이블</Title>

      <Card className="mb-4">
        <Space wrap>
          <Input
            data-testid="table-search-input"
            placeholder="품목명 검색"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            data-testid="filter-dropdown"
            placeholder="상태 선택"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            style={{ width: 120 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
          >
            초기화
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          data-testid="sample-table"
          columns={columns}
          dataSource={filteredData}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      </Card>
    </div>
  );
}
