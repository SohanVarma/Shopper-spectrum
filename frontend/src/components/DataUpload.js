import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const DataUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { 
    loading, 
    error, 
    isDataUploaded, 
    uploadedFileName,
    setLoading, 
    setError, 
    clearError, 
    setDataUploaded 
  } = useApp();

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setLoading(true);
      clearError();
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await apiService.uploadData(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setDataUploaded(file.name);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file');
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Customer Data</h1>
        <p className="mt-2 text-gray-600">
          Upload your customer transaction data in CSV format to begin analysis
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Upload CSV File
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop your file here, or click to browse
          </p>
          
          <div className="mt-6">
            <button
              onClick={handleUploadClick}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Uploading...
                </span>
              ) : (
                'Select File'
              )}
            </button>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Success Message */}
        {isDataUploaded && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Upload Successful!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  File "{uploadedFileName}" has been uploaded and processed successfully.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="btn-primary text-sm"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Upload Failed
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="mt-8 card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          CSV File Requirements
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
            Required columns: InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
            Maximum file size: 10MB
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
            Date format: YYYY-MM-DD HH:MM:SS
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
            Numeric columns should contain valid numbers
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataUpload;