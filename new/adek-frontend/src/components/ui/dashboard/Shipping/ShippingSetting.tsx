/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useCreateSellerShippingOptionsMutation,
  useGetSellerShippingOptionsQuery,
} from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Skeleton,
  Switch,
  Input,
  notification,
  Typography,
  Divider,
} from "antd";
import { GlobalOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ShippingSetting() {
  const [form] = Form.useForm();
  const [isFreeShippingEnabled, setIsFreeShippingEnabled] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (type: "success" | "error", message: string) => {
    api[type]({ message, placement: "topRight", duration: 3 });
  };

  const seller = useAppSelector((state: RootState) => state?.auth?.user);
  const storeId = seller?.store?.[0]?.id;

  const [createShippingOptions, { isLoading: isSaving }] =
    useCreateSellerShippingOptionsMutation();

  const { data: shippingData, isLoading: isFetching } =
    useGetSellerShippingOptionsQuery(storeId ?? "", { skip: !storeId });

  useEffect(() => {
    if (shippingData?.result?.length > 0) {
      const latest = shippingData.result[shippingData.result.length - 1];
      setIsFreeShippingEnabled(!!latest.isFreeShippingEnabled);
      form.setFieldsValue({
        shippingZone: latest.shippingZone || "",
        insideCityRate: latest.insideCityRate ?? undefined,
        outsideCityRate: latest.outsideCityRate ?? undefined,
        freeShippingZone: latest.freeShippingZone || "",
      });
    }
  }, [shippingData, form]);

  const handleSave = async () => {
    const fieldsToValidate = [
      "shippingZone",
      "insideCityRate",
      "outsideCityRate",
      ...(isFreeShippingEnabled ? ["freeShippingZone"] : []),
    ];

    let values: any;
    try {
      values = await form.validateFields(fieldsToValidate);
    } catch {
      showNotification("error", "Please fill in all required fields correctly.");
      return;
    }

    if (!storeId) {
      showNotification("error", "Store ID is missing");
      return;
    }

    const payload = {
      storeId,
      shippingZone: values.shippingZone.trim(),
      insideCityRate: values.insideCityRate,
      outsideCityRate: values.outsideCityRate,
      freeShippingZone: isFreeShippingEnabled
        ? values.freeShippingZone.trim()
        : "",
      isFreeShippingEnabled,
    };

    try {
      await createShippingOptions(payload).unwrap();
      showNotification("success", "Shipping options saved successfully!");
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      showNotification("error", message);
    }
  };

  if (isFetching) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        <Form form={form} layout="vertical" requiredMark={false}>

          {/* Shipping Zone Card */}
          <Card
            style={{ borderRadius: 12, marginBottom: 24 }}
            styles={{ body: { padding: 28 } }}
          >
            <Title level={4} style={{ marginBottom: 2 }}>
              Shipping Zone
            </Title>
            <Text type="secondary">
              Configure your main shipping zone and delivery rates
            </Text>
            <Divider style={{ margin: "16px 0 24px" }} />

            <Form.Item
              label={
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <GlobalOutlined style={{ color: "#1677ff" }} />
                  Zone Name
                </span>
              }
              name="shippingZone"
              rules={[{ required: true, message: "Please enter the shipping zone name" }]}
            >
              <Input
                placeholder="e.g., Dhaka City"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Local Delivery $"
                  name="insideCityRate"
                  rules={[{ required: true, message: "Please enter local delivery rate" }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="e.g., 100"
                    size="large"
                    style={{ width: "100%", borderRadius: 8 }}
                    prefix="$"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="International Delivery $"
                  name="outsideCityRate"
                  rules={[{ required: true, message: "Please enter international delivery rate" }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="e.g., 10"
                    size="large"
                    style={{ width: "100%", borderRadius: 8 }}
                    prefix="$"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Free Shipping Zone Card */}
          <Card
            style={{ borderRadius: 12, marginBottom: 24 }}
            styles={{ body: { padding: 28 } }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <Title level={4} style={{ marginBottom: 2 }}>
                  Free Shipping Zone
                </Title>
                <Text type="secondary">
                  Enable to configure areas eligible for free shipping (optional)
                </Text>
              </div>
              <Switch
                checked={isFreeShippingEnabled}
                onChange={(checked) => {
                  setIsFreeShippingEnabled(checked);
                  if (!checked) {
                    form.setFieldsValue({ freeShippingZone: "" });
                  }
                }}
              />
            </div>

            {/* freeShippingZone only renders when switch is ON */}
            {isFreeShippingEnabled && (
              <>
                <Divider style={{ margin: "16px 0 24px" }} />
                <Form.Item
                  label={
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <GlobalOutlined style={{ color: "#1677ff" }} />
                      Zone Name
                    </span>
                  }
                  name="freeShippingZone"
                  rules={[
                    { required: true, message: "Please enter the free shipping zone name" },
                  ]}
                >
                  <Input
                    placeholder="e.g., Uttara"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </>
            )}
          </Card>
        </Form>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSave}
            style={{ borderRadius: 8, paddingInline: 32 }}
          >
            {isSaving ? "Saving..." : "Save Shipping Options"}
          </Button>
        </div>
      </div>
    </>
  );
}