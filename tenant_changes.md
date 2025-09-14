# Database Restructure Plan: Tenants-Units Relationship

## **Problem Analysis**

The current database structure has fundamental flaws that prevent proper tenant management:

1. **No Tenant History**: When a tenant moves out, we lose all historical data
2. **No Multiple Tenancy**: Can't handle roommates or joint tenancy scenarios
3. **No Multi-Unit Tenants**: Same tenant can't rent multiple units
4. **No Eviction Tracking**: Can't track why tenancy ended or maintain legal records
5. **Payment Confusion**: Payments tied to tenant but not specific unit/tenancy period

## **Current Database Problems:**

### **Tenants Table Issues:**

```sql
-- Current problematic structure
tenants (
    id, full_name, phone, email,
    unit_id, -- PROBLEM: Direct 1-to-1 relationship
    password, created_at
)
```

**Problems:**

- One tenant can only be in one unit at a time
- No history when tenant moves out
- Can't handle roommate scenarios
- Eviction = data loss

## **Proposed Solution: Junction Table Approach**

### **New Tenants-Units Junction Table:**

```sql
CREATE TABLE tenants_units (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    unit_id INTEGER NOT NULL REFERENCES units(id),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = currently occupied
    occupancy_status VARCHAR(50) NOT NULL DEFAULT 'active',
    termination_reason VARCHAR(50), -- 'evicted', 'lease-expired', 'voluntary', 'transferred'
    monthly_rent NUMERIC(10,2) NOT NULL,
    deposit_paid NUMERIC(10,2),
    lease_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_status CHECK (occupancy_status IN ('active', 'terminated')),
    CONSTRAINT valid_termination CHECK (
        (occupancy_status = 'active' AND termination_reason IS NULL) OR
        (occupancy_status = 'terminated' AND termination_reason IS NOT NULL)
    )
);
```

### **Enhanced Payments Table:**

```sql
-- Add tenancy reference for proper payment tracking
ALTER TABLE payments ADD COLUMN tenancy_id INTEGER REFERENCES tenants_units(id);
ALTER TABLE payments ADD COLUMN unit_id INTEGER REFERENCES units(id);

-- Updated payments structure
payments (
    id, tenant_id, tenancy_id, unit_id,
    amount_paid, date_paid, notes, created_at
)
```

## **New Capabilities Enabled**

### **1. Complete Tenant History**

- Track all past tenancies for each unit
- Maintain records after tenant moves out
- Legal compliance for eviction documentation

### **2. Multiple Tenancy Scenarios**

```sql
-- Example: Roommates in Unit 5
INSERT INTO tenants_units VALUES
(1, 101, 5, '2024-01-01', NULL, 'active', NULL, 15000, 30000),
(2, 102, 5, '2024-01-01', NULL, 'active', NULL, 15000, 30000);

-- Example: One tenant, multiple units
INSERT INTO tenants_units VALUES
(3, 103, 7, '2024-01-01', NULL, 'active', NULL, 20000, 40000),
(4, 103, 8, '2024-02-01', NULL, 'active', NULL, 18000, 36000);
```

### **3. Proper Eviction Tracking**

```sql
-- Evict a tenant but keep records
UPDATE tenants_units SET
    end_date = '2024-12-01',
    occupancy_status = 'terminated',
    termination_reason = 'evicted',
    notes = 'Non-payment of rent for 3 months'
WHERE id = 1;
```

### **4. Enhanced Payment Tracking**

```sql
-- Payments now linked to specific tenancy periods
SELECT p.*, tu.unit_id, tu.start_date, tu.end_date
FROM payments p
JOIN tenants_units tu ON p.tenancy_id = tu.id
WHERE tu.tenant_id = 101;
```

## **Migration Strategy**

### **Phase 1: Database Schema Changes**

#### **Step 1: Create Junction Table**

```sql
CREATE TABLE tenants_units (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    unit_id INTEGER NOT NULL REFERENCES units(id),
    start_date DATE NOT NULL,
    end_date DATE,
    occupancy_status VARCHAR(50) NOT NULL DEFAULT 'active',
    termination_reason VARCHAR(50),
    monthly_rent NUMERIC(10,2) NOT NULL,
    deposit_paid NUMERIC(10,2),
    lease_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Step 2: Data Migration**

```sql
-- Migrate current tenant-unit relationships
INSERT INTO tenants_units (tenant_id, unit_id, start_date, occupancy_status, monthly_rent)
SELECT
    t.id as tenant_id,
    t.unit_id,
    COALESCE(t.created_at::date, CURRENT_DATE) as start_date,
    'active' as occupancy_status,
    u.rent_amount_kes as monthly_rent
FROM tenants t
JOIN units u ON t.unit_id = u.id
WHERE t.unit_id IS NOT NULL;
```

#### **Step 3: Update Payments**

```sql
-- Add new columns to payments
ALTER TABLE payments ADD COLUMN tenancy_id INTEGER;
ALTER TABLE payments ADD COLUMN unit_id INTEGER;

-- Link existing payments to tenancies
UPDATE payments p SET
    tenancy_id = tu.id,
    unit_id = tu.unit_id
FROM tenants_units tu
WHERE p.tenant_id = tu.tenant_id
AND tu.occupancy_status = 'active';

-- Add foreign key constraints
ALTER TABLE payments ADD CONSTRAINT fk_payments_tenancy
    FOREIGN KEY (tenancy_id) REFERENCES tenants_units(id);
ALTER TABLE payments ADD CONSTRAINT fk_payments_unit
    FOREIGN KEY (unit_id) REFERENCES units(id);
```

#### **Step 4: Remove Old Structure**

```sql
-- Remove direct unit reference from tenants
ALTER TABLE tenants DROP COLUMN unit_id;
```

### **Phase 2: Application Updates**

#### **API Endpoint Changes:**

**1. Tenant Queries:**

```javascript
// OLD: Get tenant with unit
SELECT t.*, u.name as unit_name FROM tenants t
LEFT JOIN units u ON t.unit_id = u.id

// NEW: Get tenant with current units
SELECT t.*, tu.unit_id, u.name as unit_name
FROM tenants t
LEFT JOIN tenants_units tu ON t.id = tu.tenant_id AND tu.occupancy_status = 'active'
LEFT JOIN units u ON tu.unit_id = u.id
```

**2. Unit Occupancy:**

```javascript
// OLD: Check if unit is occupied
SELECT * FROM tenants WHERE unit_id = ?

// NEW: Check current tenancy
SELECT * FROM tenants_units
WHERE unit_id = ? AND occupancy_status = 'active'
```

**3. Payment Tracking:**

```javascript
// NEW: Get payments for specific tenancy
SELECT p.*, tu.unit_id, u.name as unit_name
FROM payments p
JOIN tenants_units tu ON p.tenancy_id = tu.id
JOIN units u ON tu.unit_id = u.id
WHERE tu.tenant_id = ?
```

#### **New API Endpoints:**

```javascript
// Tenancy Management
POST /api/tenancies - Start new tenancy
PUT /api/tenancies/:id/terminate - End tenancy
GET /api/tenancies/history/:unit_id - Unit tenancy history
GET /api/tenancies/tenant/:tenant_id - Tenant's all tenancies

// Enhanced Tenant Management
GET /api/tenants/:id/current-units - Get tenant's current units
GET /api/tenants/:id/history - Get tenant's tenancy history
POST /api/tenants/:id/move - Move tenant between units
```

### **Phase 3: Owner Dashboard Enhancements**

#### **New Features Enabled:**

**1. Tenant History Management:**

- View all past and current tenants per unit
- Track tenant movement between units
- Maintain eviction records

**2. Multi-Tenant Support:**

- Manage roommate situations
- Handle joint tenancies
- Track individual payments from roommates

**3. Enhanced Reporting:**

- Tenancy duration analysis
- Eviction rate tracking
- Tenant turnover reports
- Revenue per tenancy period

**4. Better Financial Tracking:**

- Payments linked to specific tenancy periods
- Deposit tracking per tenancy
- Rent adjustment history

## **Benefits for Owner Dashboard**

### **1. Complete Property History**

```javascript
// Owner can see full unit history
GET /api/owner/units/:id/tenancy-history
// Returns: All tenancies, durations, termination reasons
```

### **2. Better Tenant Management**

```javascript
// Handle complex scenarios
- Tenant moves from Unit A to Unit B (keep history)
- Roommate joins existing tenancy
- Evict one roommate, keep others
- Track partial payments from multiple tenants
```

### **3. Legal Compliance**

```javascript
// Maintain records for legal purposes
- Eviction documentation
- Lease termination reasons
- Payment history per tenancy
- Deposit return tracking
```

### **4. Financial Accuracy**

```javascript
// Precise financial tracking
- Revenue per unit per time period
- Tenant profitability analysis
- Vacancy period tracking
- Deposit utilization records
```

## **Revised Implementation Phases**

### **Phase 1: Database Schema Changes (Keep unit_id in tenants)**

#### **Step 1: Create Junction Table with Full Constraints**

```sql
-- Create the new tenants_units junction table
CREATE TABLE tenants_units (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    unit_id INTEGER NOT NULL REFERENCES units(id),
    start_date DATE NOT NULL,
    end_date DATE,
    occupancy_status VARCHAR(50) NOT NULL DEFAULT 'active',
    termination_reason VARCHAR(50), -- 'evicted', 'lease-expired', 'voluntary', 'transferred'
    monthly_rent NUMERIC(10,2) NOT NULL,
    deposit_paid NUMERIC(10,2),
    lease_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_status CHECK (occupancy_status IN ('active', 'terminated')),
    CONSTRAINT valid_termination CHECK (
        (occupancy_status = 'active' AND termination_reason IS NULL) OR
        (occupancy_status = 'terminated' AND termination_reason IS NOT NULL)
    )
);

-- Add indexes for performance
CREATE INDEX idx_tenants_units_tenant_id ON tenants_units(tenant_id);
CREATE INDEX idx_tenants_units_unit_id ON tenants_units(unit_id);
CREATE INDEX idx_tenants_units_occupancy ON tenants_units(occupancy_status);
CREATE INDEX idx_tenants_units_dates ON tenants_units(start_date, end_date);
```

#### **Step 2: Migrate Existing Data**

```sql
-- Migrate current tenant-unit relationships to new junction table
INSERT INTO tenants_units (tenant_id, unit_id, start_date, occupancy_status, monthly_rent, deposit_paid)
SELECT
    t.id as tenant_id,
    t.unit_id,
    COALESCE(t.created_at::date, CURRENT_DATE) as start_date,
    'active' as occupancy_status,
    u.rent_amount_kes as monthly_rent,
    u.deposit_amount_kes as deposit_paid
FROM tenants t
JOIN units u ON t.unit_id = u.id
WHERE t.unit_id IS NOT NULL;
```

#### **Step 3: Update Related Tables**

```sql
-- Add tenancy reference to payments
ALTER TABLE payments ADD COLUMN tenancy_id INTEGER;
ALTER TABLE payments ADD COLUMN unit_id INTEGER;

-- Link existing payments to tenancies
UPDATE payments p SET
    tenancy_id = tu.id,
    unit_id = tu.unit_id
FROM tenants_units tu
WHERE p.tenant_id = tu.tenant_id
AND tu.occupancy_status = 'active';

-- Add constraints
ALTER TABLE payments ADD CONSTRAINT fk_payments_tenancy
    FOREIGN KEY (tenancy_id) REFERENCES tenants_units(id);
ALTER TABLE payments ADD CONSTRAINT fk_payments_unit
    FOREIGN KEY (unit_id) REFERENCES units(id);

-- Update maintenance logs
ALTER TABLE maintenance_logs ADD COLUMN tenancy_id INTEGER;
ALTER TABLE maintenance_logs ADD COLUMN reported_by INTEGER REFERENCES tenants(id);

-- Link maintenance to tenancies
UPDATE maintenance_logs ml SET
    tenancy_id = tu.id,
    reported_by = tu.tenant_id
FROM tenants_units tu
WHERE ml.unit_id = tu.unit_id
AND tu.occupancy_status = 'active';

ALTER TABLE maintenance_logs ADD CONSTRAINT fk_maintenance_tenancy
    FOREIGN KEY (tenancy_id) REFERENCES tenants_units(id);
```

### **Phase 2: API Updates and New Endpoints**

#### **Create New Tenancy Management APIs**

```javascript
// New API endpoints for tenancy management
POST /api/tenancies - Start new tenancy
PUT /api/tenancies/:id/terminate - End tenancy with reason
GET /api/tenancies/history/:unit_id - Get unit tenancy history
GET /api/tenancies/tenant/:tenant_id - Get tenant's all tenancies
POST /api/tenancies/:id/extend - Extend existing tenancy
PUT /api/tenancies/:id/update - Update tenancy details
POST /api/tenants/:id/move - Move tenant between units
```

#### **Update Existing APIs (Parallel Support)**

```javascript
// Update tenant queries to support both old and new structure
// Keep backward compatibility during transition
SELECT t.*,
       t.unit_id as legacy_unit_id,  -- Keep old field
       tu.unit_id as current_unit_id, -- New structure
       tu.start_date, tu.occupancy_status
FROM tenants t
LEFT JOIN tenants_units tu ON t.id = tu.tenant_id
    AND tu.occupancy_status = 'active'
```

### **Phase 3: Application Integration**

#### **Update Frontend Components**

- Modify tenant management pages to show tenancy history
- Add eviction workflow interfaces
- Update payment forms to link to specific tenancies
- Create multi-unit tenant management views

#### **Test All Functionality**

- Verify existing admin dashboard still works
- Test new tenancy management features
- Ensure payment tracking works with new structure
- Validate maintenance request workflows

### **Phase 4: Final Cleanup (Remove Legacy Structure)**

#### **Step 1: Verify Complete Migration**

```sql
-- Ensure all code uses new tenants_units structure
-- Verify no references to tenants.unit_id in application
-- Test all API endpoints work correctly
```

#### **Step 2: Remove unit_id from Tenants Table (FINAL STEP)**

```sql
-- FINAL STEP: Remove the old direct relationship
-- Only do this after confirming everything works
ALTER TABLE tenants DROP COLUMN unit_id;
```

#### **Step 3: Update Final Schema**

```sql
-- Update schema.sql to reflect final structure
-- Remove tenants.unit_id from schema
-- Document new relationship model

-- Final tenants table structure:
tenants (
    id, full_name, phone, email,
    password, password_text, created_at
    -- Additional fields we might add later:
    -- emergency_contact, id_number, employment_info
)
```
