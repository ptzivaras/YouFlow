-- Add price column to services table
ALTER TABLE services ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Remove default after adding the column (optional - keeps data integrity)
ALTER TABLE services ALTER COLUMN price DROP DEFAULT;
