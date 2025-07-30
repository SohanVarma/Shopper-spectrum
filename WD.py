import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import datetime as dt

# --- Part 1: Data Preprocessing and RFM Calculation ---

def preprocess_data(df):
    print("Starting data preprocessing...")

    df.dropna(subset=['CustomerID'], inplace=True)
    df['CustomerID'] = df['CustomerID'].astype(int)

    df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]

    df = df[df['Quantity'] > 0]
    df = df[df['UnitPrice'] > 0]

    print("Data preprocessing complete.")
    return df

def calculate_rfm(df):
    print("Calculating RFM values...")

    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['TotalPrice'] = df['Quantity'] * df['UnitPrice']

    snapshot_date = df['InvoiceDate'].max() + dt.timedelta(days=1)

    rfm_df = df.groupby('CustomerID').agg(
        Recency=('InvoiceDate', lambda date: (snapshot_date - date.max()).days),
        Frequency=('InvoiceNo', 'nunique'),
        Monetary=('TotalPrice', 'sum')
    ).reset_index()

    print("RFM calculation complete.")
    return rfm_df

# --- Part 2: Customer Segmentation Model (KMeans) ---

def train_customer_segmentation_model(rfm_df, n_clusters=4):
    print(f"Training KMeans model with up to {n_clusters} clusters...")
    n_clusters = min(n_clusters, rfm_df.shape[0])
    print(f"Actual clusters used: {n_clusters}")

    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm_df[['Recency', 'Frequency', 'Monetary']])
    rfm_scaled_df = pd.DataFrame(rfm_scaled, columns=['Recency_Scaled', 'Frequency_Scaled', 'Monetary_Scaled'])

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    rfm_df['Cluster'] = kmeans.fit_predict(rfm_scaled_df)

    cluster_centers = rfm_df.groupby('Cluster')[['Recency', 'Frequency', 'Monetary']].mean().sort_values(by='Recency')
    print("\nCluster Centers (Mean RFM Values):")
    print(cluster_centers)

    print("\nCustomer Segmentation Model training complete.")
    return kmeans, scaler, rfm_df

def save_model(model, filename):
    joblib.dump(model, filename)
    print(f"Model saved to {filename}")

# --- Part 3: Product Recommendation Model (Collaborative Filtering) ---

def create_product_similarity_matrix(df):
    print("Creating product-item matrix for recommendation system...")

    customer_product_matrix = df.pivot_table(index='CustomerID', columns='StockCode', values='TotalPrice').fillna(0)
    product_customer_matrix = customer_product_matrix.T

    product_similarity = cosine_similarity(product_customer_matrix)
    product_similarity_df = pd.DataFrame(
        product_similarity,
        index=product_customer_matrix.index,
        columns=product_customer_matrix.index
    )

    print("Product similarity matrix created.")
    return product_similarity_df, product_customer_matrix.index.tolist()

def get_product_recommendations(product_name, product_similarity_df, product_description_map, top_n=5):
    print(f"Getting recommendations for '{product_name}'...")

    target_stock_code = None
    for stock_code, desc in product_description_map.items():
        if desc.lower() == product_name.lower():
            target_stock_code = stock_code
            break

    if target_stock_code is None:
        print(f"Product '{product_name}' not found in the product list.")
        return []

    if target_stock_code not in product_similarity_df.index:
        print(f"Product '{product_name}' (StockCode: {target_stock_code}) not found in similarity matrix.")
        return []

    similar_products_scores = product_similarity_df[target_stock_code].sort_values(ascending=False)
    similar_products_scores = similar_products_scores.drop(target_stock_code)
    top_recommendations = similar_products_scores.head(top_n)

    recommended_product_names = [product_description_map.get(sc, f"Unknown Product (Code: {sc})") for sc in top_recommendations.index]

    print("Recommendations generated.")
    return recommended_product_names

# --- Main execution block ---
if __name__ == "__main__":
    print("Creating dummy dataset for demonstration...")

    data = {
        'InvoiceNo': [
            '536365', '536365', '536366', '536367', '536368',
            '536369', '536370', '536371', '536372', '536373',
            '536374', '536375', '536376', '536377', '536378',
            '536379', '536380', '536381', '536382', '536383'
        ],
        'StockCode': [
            '85123A', '71053', '84406B', '84029G', '22728',
            '85123A', '71053', '84406B', '84029G', '22728',
            '85123A', '71053', '84406B', '84029G', '22728',
            '85123A', '71053', '84406B', '84029G', '22728'
        ],
        'Description': [
            'WHITE HANGING HEART T-LIGHT HOLDER',
            'WHITE METAL LANTERN',
            'CREAM CUPID HEARTS COFFEE MUG',
            'JUMBO BAG RED RETROSPOT',
            'ALARM CLOCK BAKELIKE PINK',
            'WHITE HANGING HEART T-LIGHT HOLDER',
            'WHITE METAL LANTERN',
            'CREAM CUPID HEARTS COFFEE MUG',
            'JUMBO BAG RED RETROSPOT',
            'ALARM CLOCK BAKELIKE PINK',
            'WHITE HANGING HEART T-LIGHT HOLDER',
            'WHITE METAL LANTERN',
            'CREAM CUPID HEARTS COFFEE MUG',
            'JUMBO BAG RED RETROSPOT',
            'ALARM CLOCK BAKELIKE PINK',
            'WHITE HANGING HEART T-LIGHT HOLDER',
            'WHITE METAL LANTERN',
            'CREAM CUPID HEARTS COFFEE MUG',
            'JUMBO BAG RED RETROSPOT',
            'ALARM CLOCK BAKELIKE PINK'
        ],
        'Quantity': [
            6, 6, 8, 10, 2,
            12, 12, 4, 5, 3,
            7, 5, 6, 9, 2,
            10, 8, 7, 3, 4
        ],
        'InvoiceDate': [
            '2022-12-01 08:26:00',
            '2022-12-01 08:26:00',
            '2022-12-01 08:28:00',
            '2022-12-01 08:34:00',
            '2022-12-01 08:50:00',
            '2022-12-02 09:00:00',
            '2022-12-02 09:10:00',
            '2022-12-02 09:15:00',
            '2022-12-02 09:20:00',
            '2022-12-02 09:25:00',
            '2022-12-03 10:00:00',
            '2022-12-03 10:05:00',
            '2022-12-03 10:10:00',
            '2022-12-03 10:15:00',
            '2022-12-03 10:20:00',
            '2022-12-04 11:00:00',
            '2022-12-04 11:05:00',
            '2022-12-04 11:10:00',
            '2022-12-04 11:15:00',
            '2022-12-04 11:20:00'
        ],
        'UnitPrice': [
            2.55, 3.39, 2.75, 1.65, 3.75,
            2.55, 3.39, 2.75, 1.65, 3.75,
            2.55, 3.39, 2.75, 1.65, 3.75,
            2.55, 3.39, 2.75, 1.65, 3.75
        ],
        'CustomerID': [
            10001, 10001, 10002, 10003, 10004,
            10005, 10006, 10007, 10008, 10009,
            10010, 10001, 10002, 10003, 10004,
            10005, 10006, 10007, 10008, 10009
        ],
        'Country': ['United Kingdom'] * 20
    }
    df = pd.DataFrame(data)
    print("Dummy dataset created.")

    product_description_map = {
        '85123A': 'WHITE HANGING HEART T-LIGHT HOLDER',
        '71053': 'WHITE METAL LANTERN',
        '84406B': 'CREAM CUPID HEARTS COFFEE MUG',
        '84029G': 'JUMBO BAG RED RETROSPOT',
        '22728': 'ALARM CLOCK BAKELIKE PINK'
    }

    cleaned_df = preprocess_data(df.copy())
    rfm_data = calculate_rfm(cleaned_df)
    print("\nRFM Data Head:")
    print(rfm_data.head())

    kmeans_model, rfm_scaler, rfm_with_clusters = train_customer_segmentation_model(rfm_data.copy(), n_clusters=4)
    print("\nRFM Data with Clusters Head:")
    print(rfm_with_clusters.head())

    save_model(kmeans_model, 'kmeans_model.joblib')
    save_model(rfm_scaler, 'rfm_scaler.joblib')

    product_similarity_matrix, all_stock_codes = create_product_similarity_matrix(cleaned_df)
    print("\nProduct Similarity Matrix Head (first 5x5):")
    print(product_similarity_matrix.iloc[:5, :5])

    save_model(product_similarity_matrix, 'product_similarity_matrix.joblib')
    save_model(product_description_map, 'product_description_map.joblib')

    print("\n--- Testing Product Recommendation ---")
    example_product_name = "WHITE METAL LANTERN"
    recommended_products = get_product_recommendations(
        example_product_name,
        product_similarity_matrix,
        product_description_map
    )
    if recommended_products:
        print(f"Recommended products for '{example_product_name}':")
        for product in recommended_products:
            print(f"- {product}")
    else:
        print(f"Could not find recommendations for '{example_product_name}'.")

    print("\nModel creation script execution complete.")
