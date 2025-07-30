# Customer Analytics & Product Recommendation System

A full-stack web application for customer behavior analysis and product recommendations using RFM analysis, customer segmentation, and collaborative filtering.

## Features

### 🎯 Customer Analytics
- **RFM Analysis**: Analyze customers based on Recency, Frequency, and Monetary value
- **Customer Segmentation**: Automatic clustering using KMeans algorithm
- **Interactive Visualizations**: Charts and graphs for data insights

### 🤖 Product Recommendations
- **Collaborative Filtering**: Product recommendations based on customer purchase patterns
- **Similarity Analysis**: Uses cosine similarity for accurate recommendations
- **Interactive Interface**: Easy-to-use recommendation engine

### 📊 Data Management
- **CSV Upload**: Easy data upload with validation
- **Data Processing**: Automatic data cleaning and preprocessing
- **Real-time Analytics**: Instant insights after data upload

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning algorithms
- **NumPy**: Numerical computing
- **Joblib**: Model persistence

### Frontend
- **React**: Modern JavaScript UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

## Project Structure

```
├── backend/
│   ├── app.py              # FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context for state management
│   │   ├── services/      # API service layer
│   │   ├── App.js         # Main App component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Tailwind configuration
├── WD.py                  # Original analysis script
└── README.md             # This file
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server**
   ```bash
   python app.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The application will open at `http://localhost:3000`

## API Documentation

### Endpoints

#### Data Upload
- **POST** `/upload-data` - Upload CSV file for analysis

#### Analytics
- **GET** `/analytics-summary` - Get overall analytics summary
- **GET** `/rfm-analysis` - Get RFM analysis results
- **GET** `/customer-segments` - Get customer segmentation data

#### Products
- **GET** `/products` - Get all available products
- **POST** `/product-recommendations` - Get product recommendations

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## CSV File Format

Your CSV file should contain the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| InvoiceNo | Invoice number | 536365 |
| StockCode | Product stock code | 85123A |
| Description | Product description | WHITE HANGING HEART T-LIGHT HOLDER |
| Quantity | Quantity purchased | 6 |
| InvoiceDate | Purchase date | 2022-12-01 08:26:00 |
| UnitPrice | Price per unit | 2.55 |
| CustomerID | Customer identifier | 10001 |

### Sample Data
The application includes sample data for testing. You can also use the provided `WD.py` script to generate test data.

## Customer Segmentation

The application automatically segments customers into the following categories:

- **👑 Champions**: Recent customers with high frequency and monetary value
- **💎 Loyal Customers**: Recent customers with high engagement
- **⭐ Potential Loyalists**: Recent customers with good monetary value
- **🌱 New Customers**: Recent but lower engagement customers
- **⚠️ At Risk**: Customers who haven't purchased recently
- **😴 Lost Customers**: Haven't purchased in a long time

## Product Recommendations

The recommendation system uses collaborative filtering with the following steps:

1. **Customer-Product Matrix**: Creates a matrix of customer purchases
2. **Similarity Calculation**: Uses cosine similarity to find similar products
3. **Recommendation Generation**: Returns top N similar products with scores

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# The built files will be in the build/ directory
```

## Deployment

### Backend Deployment
The FastAPI backend can be deployed using:
- **Docker**: Container-based deployment
- **Heroku**: Platform as a Service
- **AWS/GCP/Azure**: Cloud platforms
- **Vercel/Netlify**: Serverless functions

### Frontend Deployment
The React frontend can be deployed to:
- **Vercel**: Recommended for React apps
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: AWS static hosting
- **GitHub Pages**: Free static hosting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the troubleshooting section below

## Troubleshooting

### Common Issues

1. **CORS Error**: Make sure the backend is running on port 8000 and frontend on port 3000
2. **CSV Upload Fails**: Check that your CSV has all required columns
3. **Empty Recommendations**: Ensure you have sufficient data and products with purchase history
4. **Installation Issues**: Try deleting `node_modules` and running `npm install` again

### Debug Mode
- Backend: Set `DEBUG=True` in the FastAPI app
- Frontend: Check browser console for errors

## Roadmap

- [ ] Real-time data streaming
- [ ] Advanced ML models (Deep Learning)
- [ ] A/B testing framework
- [ ] Email campaign integration
- [ ] Advanced data visualization
- [ ] Mobile app support