-- Make description field optional in transactions table
ALTER TABLE transactions ALTER COLUMN description DROP NOT NULL; 