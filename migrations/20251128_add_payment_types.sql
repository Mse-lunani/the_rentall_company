BEGIN;

-- Create payment_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'dynamic',
  amount NUMERIC(10,2),
  owner_id INTEGER REFERENCES owners(id) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_types_type_check CHECK (type IN ('fixed', 'dynamic'))
);

-- Insert default 'rent' row if it doesn't exist
INSERT INTO payment_types (name, type, amount, owner_id)
SELECT 'rent','fixed', NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM payment_types WHERE name = 'rent' AND type = 'fixed' LIMIT 1
);

-- Add payment_type_id column to payments if not present
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_type_id INTEGER DEFAULT 1;

-- Ensure the column has the default set and existing rows get default
ALTER TABLE payments ALTER COLUMN payment_type_id SET DEFAULT 1;
UPDATE payments SET payment_type_id = 1 WHERE payment_type_id IS NULL;

-- Add foreign key constraint if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_payment_type_id_fkey'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_payment_type_id_fkey FOREIGN KEY (payment_type_id) REFERENCES payment_types(id);
  END IF;
END$$;

COMMIT;
