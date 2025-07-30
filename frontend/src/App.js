import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DataUpload from './components/DataUpload';
import RFMAnalysis from './components/RFMAnalysis';
import CustomerSegments from './components/CustomerSegments';
import ProductRecommendations from './components/ProductRecommendations';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<DataUpload />} />
              <Route path="/rfm-analysis" element={<RFMAnalysis />} />
              <Route path="/customer-segments" element={<CustomerSegments />} />
              <Route path="/recommendations" element={<ProductRecommendations />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;