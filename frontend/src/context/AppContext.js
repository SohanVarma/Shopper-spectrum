import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  isDataUploaded: false,
  uploadedFileName: null,
  analyticsData: null,
  rfmData: null,
  customerSegments: null,
  products: [],
  loading: false,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'DATA_UPLOADED':
      return {
        ...state,
        isDataUploaded: true,
        uploadedFileName: action.payload.fileName,
        loading: false,
      };
    case 'SET_ANALYTICS_DATA':
      return { ...state, analyticsData: action.payload };
    case 'SET_RFM_DATA':
      return { ...state, rfmData: action.payload };
    case 'SET_CUSTOMER_SEGMENTS':
      return { ...state, customerSegments: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'RESET_DATA':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setDataUploaded = (fileName) => {
    dispatch({ type: 'DATA_UPLOADED', payload: { fileName } });
  };

  const setAnalyticsData = (data) => {
    dispatch({ type: 'SET_ANALYTICS_DATA', payload: data });
  };

  const setRFMData = (data) => {
    dispatch({ type: 'SET_RFM_DATA', payload: data });
  };

  const setCustomerSegments = (data) => {
    dispatch({ type: 'SET_CUSTOMER_SEGMENTS', payload: data });
  };

  const setProducts = (products) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };

  const resetData = () => {
    dispatch({ type: 'RESET_DATA' });
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    setDataUploaded,
    setAnalyticsData,
    setRFMData,
    setCustomerSegments,
    setProducts,
    resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};