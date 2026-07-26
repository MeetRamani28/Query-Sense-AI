import psycopg2
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

def init_and_seed_db():
    """
    Description: Drops existing sample tables, creates new tables with relations, and seeds mock data.
    Usecase: Provides sample business tables (customers, products, orders) for Text-to-SQL synthesis testing.
    """
    print("⏳ Initializing database tables and mock data...")
    
    conn = psycopg2.connect(settings.DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    schema_sql = """
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;

    CREATE TABLE customers (
        customer_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        region VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT NOT NULL
    );

    CREATE TABLE orders (
        order_id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(customer_id) ON DELETE CASCADE,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        order_date DATE NOT NULL,
        quantity INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED'))
    );

    -- Seed Data
    INSERT INTO customers (name, email, region) VALUES
    ('Aarav Mehta', 'aarav@example.com', 'West'),
    ('Priya Sharma', 'priya@example.com', 'North'),
    ('Rohan Patel', 'rohan@example.com', 'West'),
    ('Ananya Iyer', 'ananya@example.com', 'South');

    INSERT INTO products (product_name, category, price, stock_quantity) VALUES
    ('Enterprise Analytics Suite', 'Software', 1500.00, 50),
    ('Cloud Database Connector', 'Software', 499.99, 100),
    ('AI Agent Server', 'Hardware', 3500.00, 15),
    ('Developer Workstation', 'Hardware', 2200.00, 25);

    INSERT INTO orders (customer_id, product_id, order_date, quantity, total_amount, status) VALUES
    (1, 1, '2026-01-15', 2, 3000.00, 'COMPLETED'),
    (2, 2, '2026-01-20', 1, 499.99, 'COMPLETED'),
    (3, 3, '2026-02-01', 1, 3500.00, 'PENDING'),
    (4, 4, '2026-02-10', 2, 4400.00, 'COMPLETED'),
    (1, 2, '2026-02-15', 3, 1499.97, 'CANCELLED');
    """

    cursor.execute(schema_sql)
    print("✅ Database successfully initialized and seeded with mock business data!")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    init_and_seed_db()