'use client';

/**
 * SampleForm 화면
 * @description 샘플 폼 화면 - 폼 상태 유지 테스트용
 */

import { Form, Input, Select, InputNumber, Button, Card, Typography, message } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

interface FormValues {
  name: string;
  description: string;
  category: string;
  quantity: number;
}

const categoryOptions = [
  { value: 'production', label: '생산' },
  { value: 'quality', label: '품질' },
  { value: 'equipment', label: '설비' },
  { value: 'material', label: '자재' },
];

export default function SampleForm() {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = (values: FormValues) => {
    message.success(`저장 완료: ${values.name}`);
    console.log('Form values:', values);
  };

  const handleReset = () => {
    form.resetFields();
    message.info('폼이 초기화되었습니다');
  };

  return (
    <div data-testid="screen-sample-form" className="p-6">
      <Title level={3}>샘플 폼</Title>

      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ quantity: 0 }}
        >
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input
              data-testid="form-name-input"
              placeholder="이름을 입력하세요"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명"
          >
            <TextArea
              data-testid="form-description-input"
              rows={4}
              placeholder="설명을 입력하세요"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요' }]}
          >
            <Select
              data-testid="form-category-select"
              placeholder="카테고리 선택"
              options={categoryOptions}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="수량"
            rules={[{ required: true, message: '수량을 입력해주세요' }]}
          >
            <InputNumber
              data-testid="form-quantity-input"
              min={0}
              style={{ width: '100%' }}
              placeholder="수량을 입력하세요"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              data-testid="form-submit-btn"
              className="mr-2"
            >
              저장
            </Button>
            <Button
              onClick={handleReset}
              data-testid="form-reset-btn"
            >
              초기화
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
