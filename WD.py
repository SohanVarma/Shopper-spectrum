import streamlit as st
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import datetime as dt

# --- Data Preprocessing ---
def preprocess_data(df):
    df.dropna(subset=['CustomerID'], inplace=True)
    df['CustomerID'] = df['CustomerID'].astype(int)
    df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
    df = df[df['Quantity'] > 0]
    df = df[df['UnitPrice'] > 0]
    return df

# --- RFM ---
def calculate_rfm(df):
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
    snapshot_date = df['InvoiceDate'].max() + dt.timedelta(days=1)
    rfm_df = df.groupby('CustomerID').agg(
        Recency=('InvoiceDate', lambda date: (snapshot_date - date.max()).days),
        Frequency=('InvoiceNo', 'nunique'),
        Monetary=('TotalPrice', 'sum')
    ).reset_index()
    return rfm_df

# --- KMeans ---
def train_customer_segmentation_model(rfm_df, n_clusters=4):
    n_clusters = min(n_clusters, rfm_df.shape[0])
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm_df[['Recency', 'Frequency', 'Monetary']])
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    rfm_df['Cluster'] = kmeans.fit_predict(rfm_scaled)
    cluster_centers = rfm_df.groupby('Cluster')[['Recency', 'Frequency', 'Monetary']].mean().sort_values(by='Recency')
    return kmeans, scaler, rfm_df, cluster_centers

# --- Recommendations ---
def create_product_similarity_matrix(df):
    customer_product_matrix = df.pivot_table(index='CustomerID', columns='StockCode', values='TotalPrice').fillna(0)
    product_customer_matrix = customer_product_matrix.T
    product_similarity = cosine_similarity(product_customer_matrix)
    product_similarity_df = pd.DataFrame(
        product_similarity,
        index=product_customer_matrix.index,
        columns=product_customer_matrix.index
    )
    return product_similarity_df

def get_product_recommendations(product_name, product_similarity_df, product_description_map, top_n=5):
    target_stock_code = None
    for stock_code, desc in product_description_map.items():
        if desc.lower() == product_name.lower():
            target_stock_code = stock_code
            break
    if target_stock_code is None or target_stock_code not in product_similarity_df.index:
        return []
    similar_products_scores = product_similarity_df[target_stock_code].sort_values(ascending=False)
    similar_products_scores = similar_products_scores.drop(target_stock_code)
    top_recommendations = similar_products_scores.head(top_n)
    recommended_product_names = [product_description_map.get(sc, f"Unknown Product (Code: {sc})") for sc in top_recommendations.index]
    return recommended_product_names

# --- Streamlit UI ---
st.title("🛍️ Customer Segmentation & Product Recommendation")

# --- Dummy Data ---
st.subheader("1️⃣ Dummy Data")
data = {
    'InvoiceNo': [f'53636{i}' for i in range(20)],
    'StockCode': ['85123A', '71053', '84406B', '84029G', '22728'] * 4,
    'Description': [
        'WHITE HANGING HEART T-LIGHT HOLDER',
        'WHITE METAL LANTERN',
        'CREAM CUPID HEARTS COFFEE MUG',
        'JUMBO BAG RED RETROSPOT',
        'ALARM CLOCK BAKELIKE PINK'
    ] * 4,
    'Quantity': [6, 6, 8, 10, 2, 12, 12, 4, 5, 3, 7, 5, 6, 9, 2, 10, 8, 7, 3, 4],
    'InvoiceDate': pd.date_range(start='2022-12-01', periods=20, freq='H'),
    'UnitPrice': [2.55, 3.39, 2.75, 1.65, 3.75] * 4,
    'CustomerID': [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010,
                   10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010],
    'Country': ['United Kingdom'] * 20
}
df = pd.DataFrame(data)
st.dataframe(df.head())

# --- Clean Data ---
cleaned_df = preprocess_data(df)

# --- RFM ---
rfm_data = calculate_rfm(cleaned_df)
st.subheader("2️⃣ RFM Table")
st.dataframe(rfm_data)

# --- KMeans ---
kmeans_model, rfm_scaler, rfm_with_clusters, cluster_centers = train_customer_segmentation_model(rfm_data, n_clusters=4)
st.subheader("3️⃣ Cluster Centers")
st.dataframe(cluster_centers)

st.subheader("4️⃣ RFM Data with Clusters")
st.dataframe(rfm_with_clusters)

# --- Product Similarity ---
product_similarity_matrix = create_product_similarity_matrix(cleaned_df)
st.subheader("5️⃣ Product Similarity Matrix (first 5x5)")
st.dataframe(product_similarity_matrix.iloc[:5, :5])

# --- Recommendations ---
product_description_map = {
    '85123A': 'WHITE HANGING HEART T-LIGHT HOLDER',
    '71053': 'WHITE METAL LANTERN',
    '84406B': 'CREAM CUPID HEARTS COFFEE MUG',
    '84029G': 'JUMBO BAG RED RETROSPOT',
    '22728': 'ALARM CLOCK BAKELIKE PINK'
}

st.subheader("6️⃣ Product Recommendations")
selected_product = st.selectbox("Select a product", list(product_description_map.values()))
if st.button("Get Recommendations"):
    recommendations = get_product_recommendations(selected_product, product_similarity_matrix, product_description_map)
    if recommendations:
        st.write(f"Recommendations for **{selected_product}**:")
        for rec in recommendations:
            st.write(f"- {rec}")
    else:
        st.write("No recommendations found.")
