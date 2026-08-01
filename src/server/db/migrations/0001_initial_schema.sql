-- ============================================================================
-- PROFIT TOOL — ENTERPRISE POSTGRESQL 16 DDL SCHEMA MIGRATION
-- Version: 1.0.0 (Document 13B Exact Match)
-- Implements referential integrity, JSONB immutable evidence snapshots,
-- append-only audit ledgers, and indexed query optimizations.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BILLING PLANS TABLE
CREATE TABLE IF NOT EXISTS billing_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_orders_per_month INTEGER NOT NULL DEFAULT 500,
    max_recommendations INTEGER NOT NULL DEFAULT 100,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. STORES TABLE (Shopify Merchants)
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(100) PRIMARY KEY,
    shopify_domain VARCHAR(255) UNIQUE NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    access_token VARCHAR(512) NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    billing_plan VARCHAR(50) REFERENCES billing_plans(id) ON DELETE RESTRICT DEFAULT 'Growth',
    billing_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (billing_status IN ('ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED')),

    subscription_id TEXT,
    subscription_status VARCHAR(50),
    plan_name VARCHAR(50),
    billing_approved BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    plan_activated_at TIMESTAMPTZ,

    recommendations_used INTEGER DEFAULT 0,
    recommendations_limit INTEGER DEFAULT 300,
    month_start TIMESTAMPTZ,
    month_end TIMESTAMPTZ,

    installed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stores_shopify_domain ON stores(shopify_domain);
CREATE INDEX idx_stores_owner_email ON stores(owner_email);

-- 3. STORE CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS store_configs (
    store_id VARCHAR(100) PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    min_cart_value_threshold NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    vip_customer_spend_threshold NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    auto_snooze_hours INTEGER NOT NULL DEFAULT 24,
    enable_email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    alert_email_address VARCHAR(255),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    ai_sensitivity_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (ai_sensitivity_level IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    );updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS TABLE (Synced Shopify Profiles)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    shopify_customer_id VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL DEFAULT '',
    last_name VARCHAR(100) NOT NULL DEFAULT '',
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    last_order_date TIMESTAMPTZ,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_store_shopify_customer UNIQUE (store_id, shopify_customer_id)
);

CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_vip ON customers(store_id, is_vip);

-- 5. CARTS TABLE (Abandoned & Active Checkouts)
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    shopify_cart_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(100) REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'Abandoned' CHECK (status IN ('Active', 'Abandoned', 'Recovered', 'Expired')),
    checkout_url TEXT,
    abandoned_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    );updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carts_store_status ON carts(store_id, status);
CREATE INDEX idx_carts_abandoned_at ON carts(abandoned_at);
CREATE INDEX idx_carts_customer_id ON carts(customer_id);

-- 6. RULE VERSIONS TABLE (Business Threshold Logic Studio)
CREATE TABLE IF NOT EXISTS rule_versions (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CORE', 'EDGE', 'CUSTOM')),
    condition_field VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '==', '!=', 'IN', 'CONTAINS')),
    threshold_value TEXT NOT NULL,
    weight INTEGER NOT NULL DEFAULT 10 CHECK (weight BETWEEN 1 AND 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rule_versions_store_active ON rule_versions(store_id, is_active);
CREATE INDEX idx_rule_versions_type ON rule_versions(type);

-- 7. RECOMMENDATIONS TABLE (Explainable AI Engine Output)
-- Enforces: One Active Recommendation per Cart via filtered unique index
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cart_id VARCHAR(100) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    customer_id VARCHAR(100) REFERENCES customers(id) ON DELETE SET NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Updated', 'Snoozed', 'Completed', 'Blocked')),
    action_title VARCHAR(255) NOT NULL,
    action_description TEXT NOT NULL,
    suggested_discount_code VARCHAR(50),
    suggested_discount_value NUMERIC(5, 2),
    confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
    rules_fired JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_explanation TEXT NOT NULL,
    evidence_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Constraint: One Open/Updated Recommendation per Cart
CREATE UNIQUE INDEX uq_active_cart_recommendation ON recommendations (cart_id) WHERE status IN ('Open', 'Updated');
CREATE INDEX idx_recommendations_store_status ON recommendations(store_id, status);
CREATE INDEX idx_recommendations_priority ON recommendations(store_id, priority);

-- 8. EVIDENCE SNAPSHOTS TABLE (Immutable Cryptographic Snapshots)
CREATE TABLE IF NOT EXISTS evidence_snapshots (
    id VARCHAR(100) PRIMARY KEY,
    recommendation_id VARCHAR(100) NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cart_id VARCHAR(100) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_snapshots_rec_id ON evidence_snapshots(recommendation_id);
CREATE INDEX idx_evidence_snapshots_created_at ON evidence_snapshots(created_at);

-- 9. AUDIT LOGS TABLE (Append-Only Immutable Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    actor_id VARCHAR(100) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL CHECK (actor_role IN ('SYSTEM', 'AI_ENGINE', 'OWNER', 'STAFF', 'SHOPIFY_WEBHOOK')),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('RECOMMENDATION', 'RULE', 'CONFIG', 'AUTH', 'BILLING', 'WEBHOOK')),
    resource_id VARCHAR(100) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Protect Audit Log from modification
CREATE INDEX idx_audit_logs_store_timestamp ON audit_logs(store_id, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- 10. MERCHANT FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS merchant_feedback (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(100) NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('USEFUL', 'NOT_USEFUL', 'ACCURATE', 'INACCURATE')),
    comments TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_merchant_feedback_store_id ON merchant_feedback(store_id);
CREATE INDEX idx_merchant_feedback_rec_id ON merchant_feedback(recommendation_id);

-- 11. NOTIFICATION ALERTS TABLE
CREATE TABLE IF NOT EXISTS notification_alerts (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CRITICAL_REC', 'RULE_UPDATE', 'SYSTEM_WARN', 'BILLING_NOTICE')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_store_read ON notification_alerts(store_id, is_read);

-- ============================================================================
-- SEED ENTERPRISE BILLING PLANS
-- ============================================================================
INSERT INTO billing_plans (id, name, price_monthly, max_orders_per_month, max_recommendations, features)
VALUES 
('Launch', 'Launch Plan', 19.00, 500, 300, '["Core Abandoned Cart Detection", "Basic AI Reasoning", "Daily Email Digest", "Standard Rule Engine", "7-day Evidence Retention"]'::jsonb),
('Growth', 'Growth Plan', 49.00, 2500, 1000, '["VIP Customer Detection", "Advanced Explainable AI", "Instant Critical Email Alerts", "Custom Edge Rules", "30-day Immutable Evidence", "Multi-currency Support"]'::jsonb),
('Pro', 'Pro Plan', 99.00, 25000, -1, '["Real-time Stock Drop Automation", "Dedicated AI Model Fine-tuning", "Custom Webhook Integrations", "Unlimited Evidence Archiving", "24/7 Priority Support"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
