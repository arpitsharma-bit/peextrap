-- Make email column nullable in user_profiles table
ALTER TABLE user_profiles ALTER COLUMN email DROP NOT NULL; 