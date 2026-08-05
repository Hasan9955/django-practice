import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";


interface OrderItem {
  storeId: string;
  variantId: string;
  name: string;
  productName: string; 
  bundleId?: string;
  price: number;
  finalPrice?: number;
  quantity: number;
}

interface OrderState {
  paymentMethod: "stripe" | "paystack" | null;
  currency: string;
  deliveryAddress: string;
  region: string;
  zipCode: string;
  state: string;
  city: string;
  country: string;
  fullName: string;
  phone: string;
  orders: OrderItem[];
}

// 🏁 Initial State
const initialState: OrderState = {
  paymentMethod: null,
  currency: "usd",
  deliveryAddress: "",
  region: "",
  state: "",
  zipCode: "",
  city: "",
  country: "",
  fullName: "",
  phone: "",
  orders: [],
};

// 🧩 Slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setPaymentMethod: (state, action: PayloadAction<"stripe" | "paystack">) => {
      state.paymentMethod = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setDeliveryAddress: (state, action: PayloadAction<string>) => {
      state.deliveryAddress = action.payload;
    },
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload;
    },
    setZipCode: (state, action: PayloadAction<string>) => {
      state.zipCode = action.payload;
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
    },
    setState: (state, action: PayloadAction<string>) => {
      state.state = action.payload;
    },
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload;
    },
    setFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    addOrderItem: (state, action: PayloadAction<OrderItem>) => {
      const existing = state.orders.find(
        (item) =>
          item.variantId === action.payload.variantId &&
          item.bundleId === action.payload.bundleId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.orders.push(action.payload);
      }
    },
    updateOrderQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>
    ) => {
      const item = state.orders.find(
        (o) => o.variantId === action.payload.variantId
      );
      if (item) item.quantity = action.payload.quantity;
    },
    removeOrderItem: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(
        (item) => item.variantId !== action.payload
      );
    },
    resetOrder: () => initialState,
  },
});

// ⚙️ Export Actions
export const {
  setPaymentMethod,
  setCurrency,
  setDeliveryAddress,
  setRegion,
  setZipCode,
  setState,
  setCity,
  setCountry,
  setFullName,
  setPhone,
  addOrderItem,
  updateOrderQuantity,
  removeOrderItem,
  resetOrder,
} = orderSlice.actions;

// 🔍 Selectors
export const selectOrder = (state: RootState) => state.order;
export const selectAllOrderItems = (state: RootState) => state.order.orders;

// ✅ Get a single order item by variantId (and optionally bundleId)
export const selectOrderItem =
  (variantId: string, bundleId?: string) => (state: RootState) =>
    state.order.orders.find(
      (item) =>
        item.variantId === variantId &&
        (bundleId !== undefined ? item.bundleId === bundleId : true)
    );

// 🏁 Export Reducer
export default orderSlice.reducer;