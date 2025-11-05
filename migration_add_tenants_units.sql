-- Migration: Add tenants_units junction table
-- Date: 2025-11-02
-- Purpose: Create many-to-many relationship between tenants and units

-- Create tenants_units table
CREATE TABLE IF NOT EXISTS tenants_units (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_rent NUMERIC(10,2),
    deposit_paid NUMERIC(10,2),
    lease_terms TEXT,
    notes TEXT,
    occupancy_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_monthly_rent CHECK (monthly_rent >= 0),
    CONSTRAINT valid_deposit CHECK (deposit_paid >= 0),
    CONSTRAINT tenants_units_occupancy_status_check CHECK (occupancy_status IN ('active', 'inactive', 'ended'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_units_tenant_id ON tenants_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_units_unit_id ON tenants_units(unit_id);
CREATE INDEX IF NOT EXISTS idx_tenants_units_occupancy_status ON tenants_units(occupancy_status);

-- Optional: Migrate existing tenant-unit relationships from tenants table to tenants_units
-- INSERT INTO tenants_units (tenant_id, unit_id, start_date, occupancy_status)
-- SELECT id, unit_id, created_at::date, 'active'
-- FROM tenants
-- WHERE unit_id IS NOT NULL;

COMMENT ON TABLE tenants_units IS 'Junction table for many-to-many relationship between tenants and units';
COMMENT ON COLUMN tenants_units.occupancy_status IS 'Status: active, inactive, or ended';
