// src/redux/features/chat/chatSlice.ts
import { RootState } from '@/redux/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  roomId: string | null;
  messages: Array<{ senderId: string; content: string; imageUrl?: string }>;
  status: 'idle' | 'loading' | 'error';
}

const initialState: ChatState = {
  roomId: null,
  messages: [],
  status: 'idle',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatState['messages'][number]>) {
      state.messages.push(action.payload);
    },
    setStatus(state, action: PayloadAction<ChatState['status']>) {
      state.status = action.payload;
    },
  },
});

export const { setRoomId, addMessage, setStatus } = chatSlice.actions;
export default chatSlice.reducer;

// Optional: typed selector (used in useSelector)
export const selectChat = (state: RootState) => state.chat;