import { CartData } from "@/types/cartType";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  items: CartData[];
}

// Load cart state from localStorage
const loadCartState = (): CartState => {
  try {
    if (typeof window !== "undefined") {
      const serializedState = localStorage.getItem("cartState");
      if (serializedState) {
        return JSON.parse(serializedState) as CartState;
      }
    }
  } catch (e) {
    console.warn("Could not load cart state from localStorage", e);
  }
  return { items: [] };
};

// Save cart state to localStorage
const saveCartState = (state: CartState) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartState", JSON.stringify(state));
    }
  } catch (e) {
    console.warn("Could not save cart state to localStorage", e);
  }
};

const initialState: CartState = loadCartState();

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartData>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        existingItem.quantity =
          (existingItem.quantity || 0) + (action.payload.quantity || 1);
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
      saveCartState(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      saveCartState(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
      saveCartState(state);
    },

    clearCart: (state) => {
      state.items = [];
      saveCartState(state);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
