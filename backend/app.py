from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import datetime as dt
from typing import List, Optional
import io
import json
from pydantic import BaseModel

app = FastAPI(title="Customer Analytics & Recommendation API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models and data
kmeans_model = None
rfm_scaler = None
product_similarity_matrix = None
product_description_map = None
current_data = None
rfm_data = None

# Pydantic models for request/response
class ProductRecommendationRequest(BaseModel):
    product_name: str
    top_n: int = 5

class CustomerSegmentationResponse(BaseModel):
    customer_id: int
    recency: float
    frequency: int
    monetary: float
    cluster: int

class ProductRecommendationResponse(BaseModel):
    product_name: str
    recommendations: List[str]

# --- Core Analytics Functions ---

def preprocess_data(df):
    """Clean and preprocess the customer data"""
    df = df.copy()
    df.dropna(subset=['CustomerID'], inplace=True)
    df['CustomerID'] = df['CustomerID'].astype(int)
    
    # Remove cancelled orders (those starting with 'C')
    df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
    
    # Remove negative quantities and prices
    df = df[df['Quantity'] > 0]
    df = df[df['UnitPrice'] > 0]
    
    return df

def calculate_rfm(df):
    """Calculate RFM (Recency, Frequency, Monetary) values"""
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
    
    snapshot_date = df['InvoiceDate'].max() + dt.timedelta(days=1)
    
    rfm_df = df.groupby('CustomerID').agg(
        Recency=('InvoiceDate', lambda date: (snapshot_date - date.max()).days),
        Frequency=('InvoiceNo', 'nunique'),
        Monetary=('TotalPrice', 'sum')
    ).reset_index()
    
    return rfm_df

def train_customer_segmentation_model(rfm_df, n_clusters=4):
    """Train KMeans clustering model for customer segmentation"""
    global kmeans_model, rfm_scaler
    
    n_clusters = min(n_clusters, rfm_df.shape[0])
    
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm_df[['Recency', 'Frequency', 'Monetary']])
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    rfm_df['Cluster'] = kmeans.fit_predict(rfm_scaled)
    
    # Update global models
    kmeans_model = kmeans
    rfm_scaler = scaler
    
    return rfm_df

def create_product_similarity_matrix(df):
    """Create product similarity matrix for recommendations"""
    global product_similarity_matrix, product_description_map
    
    # Create customer-product matrix
    customer_product_matrix = df.pivot_table(
        index='CustomerID', 
        columns='StockCode', 
        values='TotalPrice'
    ).fillna(0)
    
    product_customer_matrix = customer_product_matrix.T
    
    # Calculate product similarity using cosine similarity
    product_similarity = cosine_similarity(product_customer_matrix)
    product_similarity_df = pd.DataFrame(
        product_similarity,
        index=product_customer_matrix.index,
        columns=product_customer_matrix.index
    )
    
    # Create product description mapping
    desc_map = df[['StockCode', 'Description']].drop_duplicates()
    desc_map = dict(zip(desc_map['StockCode'], desc_map['Description']))
    
    # Update global variables
    product_similarity_matrix = product_similarity_df
    product_description_map = desc_map
    
    return product_similarity_df

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Customer Analytics & Recommendation API", "version": "1.0.0"}

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    """Upload and process customer data CSV file"""
    global current_data, rfm_data
    
    try:
        # Read uploaded CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['InvoiceNo', 'StockCode', 'Description', 'Quantity', 'InvoiceDate', 'UnitPrice', 'CustomerID']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_columns}"
            )
        
        # Process the data
        cleaned_df = preprocess_data(df)
        rfm_df = calculate_rfm(cleaned_df)
        rfm_with_clusters = train_customer_segmentation_model(rfm_df.copy())
        create_product_similarity_matrix(cleaned_df)
        
        # Store processed data
        current_data = cleaned_df
        rfm_data = rfm_with_clusters
        
        return {
            "message": "Data uploaded and processed successfully",
            "total_records": len(df),
            "cleaned_records": len(cleaned_df),
            "unique_customers": len(rfm_df),
            "unique_products": len(cleaned_df['StockCode'].unique())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/rfm-analysis")
async def get_rfm_analysis():
    """Get RFM analysis results"""
    global rfm_data
    
    if rfm_data is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload data first.")
    
    # Calculate cluster statistics
    cluster_stats = rfm_data.groupby('Cluster').agg({
        'Recency': ['mean', 'min', 'max'],
        'Frequency': ['mean', 'min', 'max'],
        'Monetary': ['mean', 'min', 'max'],
        'CustomerID': 'count'
    }).round(2)
    
    # Flatten column names
    cluster_stats.columns = ['_'.join(col).strip() for col in cluster_stats.columns]
    cluster_stats = cluster_stats.reset_index()
    
    return {
        "rfm_data": rfm_data.to_dict('records'),
        "cluster_statistics": cluster_stats.to_dict('records'),
        "total_customers": len(rfm_data),
        "clusters": sorted(rfm_data['Cluster'].unique().tolist())
    }

@app.get("/customer-segments")
async def get_customer_segments():
    """Get customer segmentation analysis"""
    global rfm_data
    
    if rfm_data is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload data first.")
    
    # Define segment names based on RFM characteristics
    def assign_segment_name(row):
        if row['Recency'] <= 30 and row['Frequency'] >= 5 and row['Monetary'] >= 500:
            return "Champions"
        elif row['Recency'] <= 30 and row['Frequency'] >= 3:
            return "Loyal Customers"
        elif row['Recency'] <= 60 and row['Monetary'] >= 200:
            return "Potential Loyalists"
        elif row['Recency'] <= 90:
            return "New Customers"
        elif row['Recency'] <= 180:
            return "At Risk"
        else:
            return "Lost Customers"
    
    rfm_with_segments = rfm_data.copy()
    rfm_with_segments['Segment'] = rfm_with_segments.apply(assign_segment_name, axis=1)
    
    # Calculate segment statistics
    segment_stats = rfm_with_segments.groupby('Segment').agg({
        'CustomerID': 'count',
        'Recency': 'mean',
        'Frequency': 'mean',
        'Monetary': 'mean'
    }).round(2)
    
    segment_stats = segment_stats.reset_index()
    segment_stats.columns = ['Segment', 'Customer_Count', 'Avg_Recency', 'Avg_Frequency', 'Avg_Monetary']
    
    return {
        "customer_segments": rfm_with_segments.to_dict('records'),
        "segment_statistics": segment_stats.to_dict('records')
    }

@app.post("/product-recommendations")
async def get_product_recommendations(request: ProductRecommendationRequest):
    """Get product recommendations based on similarity"""
    global product_similarity_matrix, product_description_map
    
    if product_similarity_matrix is None or product_description_map is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload data first.")
    
    # Find stock code for the product name
    target_stock_code = None
    for stock_code, desc in product_description_map.items():
        if desc.lower() == request.product_name.lower():
            target_stock_code = stock_code
            break
    
    if target_stock_code is None:
        raise HTTPException(
            status_code=404, 
            detail=f"Product '{request.product_name}' not found"
        )
    
    if target_stock_code not in product_similarity_matrix.index:
        raise HTTPException(
            status_code=404, 
            detail=f"Product '{request.product_name}' not found in similarity matrix"
        )
    
    # Get similar products
    similar_products_scores = product_similarity_matrix[target_stock_code].sort_values(ascending=False)
    similar_products_scores = similar_products_scores.drop(target_stock_code)
    top_recommendations = similar_products_scores.head(request.top_n)
    
    recommended_products = [
        {
            "stock_code": sc,
            "name": product_description_map.get(sc, f"Unknown Product (Code: {sc})"),
            "similarity_score": float(score)
        }
        for sc, score in top_recommendations.items()
    ]
    
    return {
        "product_name": request.product_name,
        "recommendations": recommended_products
    }

@app.get("/products")
async def get_products():
    """Get all available products"""
    global product_description_map
    
    if product_description_map is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload data first.")
    
    products = [
        {"stock_code": code, "name": name}
        for code, name in product_description_map.items()
    ]
    
    return {"products": products}

@app.get("/analytics-summary")
async def get_analytics_summary():
    """Get overall analytics summary"""
    global current_data, rfm_data
    
    if current_data is None or rfm_data is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload data first.")
    
    # Calculate summary statistics
    total_revenue = current_data['Quantity'].sum() * current_data['UnitPrice'].sum()
    avg_order_value = (current_data['Quantity'] * current_data['UnitPrice']).mean()
    
    return {
        "total_customers": len(rfm_data),
        "total_products": len(current_data['StockCode'].unique()),
        "total_orders": len(current_data['InvoiceNo'].unique()),
        "total_revenue": float(total_revenue),
        "average_order_value": float(avg_order_value),
        "date_range": {
            "start": current_data['InvoiceDate'].min().isoformat(),
            "end": current_data['InvoiceDate'].max().isoformat()
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)