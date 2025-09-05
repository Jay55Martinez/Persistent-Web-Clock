import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
    // Enable Redux DevTools extension with a custom name
    devTools: {
        name: 'Persistent Web Clock',
        trace: true,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;