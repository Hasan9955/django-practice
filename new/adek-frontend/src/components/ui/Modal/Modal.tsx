import React from "react";
import { Button, Modal, Empty, Spin, Row, Col } from "antd";
import { useGetStoreCouponsQuery } from "@/redux/features/dashborad/products/productsApi";
import OfferCard from "../Card/offer-card";

interface LoadingModalProps {
  open: boolean;
  onClose: () => void;
  onReload: () => void;
  title?: string;
  storeId: string;
}

interface Offer {
  id: string;
  code: string;
  storeId: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  validFrom: string;
  validTill: string;
  createdAt: string;
  updatedAt: string;
}

const StoreCouponsModal: React.FC<LoadingModalProps> = ({
  open,
  onClose,
  onReload,
  title = "Available Offers",
  storeId,
}) => {
  const { data, isLoading } = useGetStoreCouponsQuery(storeId); // Replace "storeId" with actual store ID
  const offers: Offer[] = data?.result?.data || [];

  return (
    <Modal
      title={<div style={{ fontSize: "18px", fontWeight: "600" }}>{title}</div>}
      footer={
        <Button type="primary" onClick={onReload} loading={isLoading}>
          Reload Offers
        </Button>
      }
      open={open}
      onCancel={onClose}
      width={700}
      centered
    >
      <Spin spinning={isLoading} tip="Loading offers...">
        {offers.length > 0 ? (
          <Row gutter={[16, 16]}>
            {offers.map((offer) => (
              <Col key={offer.id} xs={24} sm={24} md={24}>
                <OfferCard offer={offer} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="No offers available"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          />
        )}
      </Spin>
    </Modal>
  );
};

export default StoreCouponsModal;
