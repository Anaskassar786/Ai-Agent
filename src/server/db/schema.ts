/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Relational Database Schema Definition
 * Compliant with PostgreSQL / Prisma ORM specification
 */

export const POSTGRESQL_DDL_SCHEMA = `
-- ==============================================================================
-- PROFIT TOOL ENTERPRISE RELATIONAL DATABASE SCHEMA (PostgreSQL / Prisma)
-- ==============================================================================

CREATE TABLE stores (
    id VARCHAR(36) PRIMARY KEY,
    shopify_domain VARCHAR(255) UNIQUE NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    access_token TEXT,
    active_plan VARCHAR(50) DEFAULT 'Starter'
    subscription_id TEXT,
    subscription_status VARCHAR(50),
    plan_name VARCHAR(50),
    billing_approved BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_activated_at TIMESTAMP WITH TIME ZONE,
    recommendations_used INTEGER DEFAULT 0,
    recommendations_limit INTEGER DEFAULT 300,
    month_start TIMESTAMP WITH TIME ZONE,
    month_end TIMESTAMP WITH TIME ZONE
);

CREATE TABLE store_configurations (
    store_id VARCHAR(36) PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    min_cart_value_threshold DECIMAL(12, 2) DEFAULT 100.00,
    abandoned_timeout_minutes INTEGER DEFAULT 60,
    auto_snooze_days INTEGER DEFAULT 7,
    enable_daily_email_digest BOOLEAN DEFAULT TRUE,
    enable_critical_email_alerts BOOLEAN DEFAULT TRUE,
    enable_in_app_alerts BOOLEAN DEFAULT TRUE,
    notification_email VARCHAR(255),
    currency_symbol VARCHAR(10) DEFAULT '$',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    shopify_customer_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    is_vip BOOLEAN DEFAULT FALSE,
    last_order_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, shopify_customer_id)
);

CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    shopify_cart_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(36) REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    items JSONB NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    checkout_url TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    discount_code VARCHAR(100),
    shipping_country VARCHAR(10)
);

CREATE TABLE recommendations (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    cart_id VARCHAR(36) UNIQUE NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    customer_id VARCHAR(36) REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    action_summary TEXT NOT NULL,
    suggested_action_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Open' NOT NULL,
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    opportunity_value DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    snoozed_until TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    current_evidence_snapshot_id VARCHAR(36),
    rules_fired_count INTEGER DEFAULT 0
);

CREATE TABLE evidence_snapshots (
    snapshot_id VARCHAR(36) PRIMARY KEY,
    recommendation_id VARCHAR(36) REFERENCES recommendations(id) ON DELETE CASCADE,
    cart_id VARCHAR(36) REFERENCES carts(id) ON DELETE CASCADE,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cart_value_at_eval DECIMAL(12, 2) NOT NULL,
    customer_total_spent_at_eval DECIMAL(12, 2) NOT NULL,
    customer_total_orders_at_eval INTEGER NOT NULL,
    cart_age_hours INTEGER NOT NULL,
    items_snapshot JSONB NOT NULL,
    rules_fired JSONB NOT NULL,
    raw_ai_reasoning TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE rule_versions (
    id VARCHAR(36) PRIMARY KEY,
    rule_id VARCHAR(36) NOT NULL,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    priority_weight INTEGER DEFAULT 10,
    condition_field VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    threshold_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    entity_id VARCHAR(36) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    id VARCHAR(36) PRIMARY KEY,
    recommendation_id VARCHAR(36) REFERENCES recommendations(id) ON DELETE CASCADE,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    is_useful BOOLEAN NOT NULL,
    reason VARCHAR(255),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    store_id VARCHAR(36) REFERENCES stores(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link_to_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
