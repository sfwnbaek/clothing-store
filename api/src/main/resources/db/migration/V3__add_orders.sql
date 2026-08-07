CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
    provider_payment_id VARCHAR(255),
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    processed_at TIMESTAMP
);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100),
    processed_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id, status);
CREATE INDEX idx_order_items_order ON order_items(order_id);