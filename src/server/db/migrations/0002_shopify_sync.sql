CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    shopify_product_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    total_inventory INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, shopify_product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    shopify_order_id VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    total_price DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10),
    order_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, shopify_order_id)
);

CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    shopify_variant_id VARCHAR(255) NOT NULL,
    product_title VARCHAR(255),
    inventory_quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, shopify_variant_id)
);
