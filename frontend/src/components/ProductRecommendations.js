import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const ProductRecommendations = () => {
  const { 
    isDataUploaded, 
    products, 
    loading, 
    error,
    setLoading, 
    setError, 
    setProducts 
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [topN, setTopN] = useState(5);

  useEffect(() => {
    if (isDataUploaded && products.length === 0) {
      fetchProducts();
    }
  }, [isDataUploaded, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch products');
    }
  };

  const getRecommendations = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const data = await apiService.getProductRecommendations(selectedProduct, topN);
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get recommendations');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isDataUploaded) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No data available</h3>
        <p className="text-gray-600">Please upload customer data first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Recommendations</h1>
        <p className="mt-2 text-gray-600">
          Get product recommendations based on customer purchase patterns and similarity analysis
        </p>
      </div>

      {/* Product Selection */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Select a Product for Recommendations
        </h3>
        
        {/* Search Products */}
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Product
            </label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a product...</option>
              {filteredProducts.map((product) => (
                <option key={product.stock_code} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topN" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Recommendations
            </label>
            <select
              id="topN"
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={3}>3 recommendations</option>
              <option value={5}>5 recommendations</option>
              <option value={10}>10 recommendations</option>
              <option value={15}>15 recommendations</option>
            </select>
          </div>
        </div>

        {/* Get Recommendations Button */}
        <button
          onClick={getRecommendations}
          disabled={!selectedProduct || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="spinner mr-2"></div>
              Getting Recommendations...
            </span>
          ) : (
            <span className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Get Recommendations
            </span>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="text-red-800">
            <h3 className="font-medium">Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recommendations for "{selectedProduct}"
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary-700">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {rec.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Stock Code: {rec.stock_code}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Similarity Score
                    </p>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(rec.similarity_score * 100).toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {(rec.similarity_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation Insights */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Recommendation Insights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• These recommendations are based on customer purchase patterns and product similarity</li>
              <li>• Higher similarity scores indicate stronger correlations in customer behavior</li>
              <li>• Consider these products for cross-selling and bundle offers</li>
              <li>• Products frequently bought together by similar customer segments</li>
            </ul>
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          How Product Recommendations Work
        </h3>
        <div className="prose text-gray-600">
          <p className="mb-4">
            Our recommendation system uses collaborative filtering with cosine similarity to find products 
            that are frequently purchased together by similar customers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-gray-900">Data Analysis</h4>
              <p className="text-sm text-gray-600">
                Analyze customer purchase patterns and product relationships
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-medium text-gray-900">Similarity Calculation</h4>
              <p className="text-sm text-gray-600">
                Calculate product similarity using cosine similarity metrics
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900">Smart Recommendations</h4>
              <p className="text-sm text-gray-600">
                Generate personalized product recommendations based on patterns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;