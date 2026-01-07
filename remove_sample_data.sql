-- ============================================
-- Remove Sample/Test Properties
-- Run this to delete all sample data
-- ============================================

-- Delete all sample properties (identified by placeholder addresses)
DELETE FROM properties 
WHERE address_line_1 IN (
  '123 Westminster Street',
  '456 Oxford Road',
  '789 New Street',
  '321 Park Lane',
  '654 Royal Mile',
  '987 Mersey Road',
  '147 Harbour Side',
  '258 Steel Street',
  '369 Buchanan Street',
  '741 Shambles'
);

-- Alternative: Delete ALL properties if you want to start fresh
-- WARNING: This will delete ALL properties, including any real ones you've added!
-- DELETE FROM properties;

-- Verify deletion
SELECT COUNT(*) as remaining_properties FROM properties;

