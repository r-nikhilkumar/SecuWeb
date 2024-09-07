import { configureStore } from '@reduxjs/toolkit';
import securityCheckReducer from './reducers/securityCheckReducer';

const store = configureStore({
  reducer: {
    securityCheck: securityCheckReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
