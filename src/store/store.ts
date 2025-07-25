import { configureStore } from '@reduxjs/toolkit';
import web3Reducer from './web3Slice';
import petReducer from './petSlice';

export const store = configureStore({
  reducer: {
    web3: web3Reducer,
    pet: petReducer
  },
});

// 导出RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;    