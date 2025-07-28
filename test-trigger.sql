-- Test if the trigger function exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'create_default_categories_trigger';

-- Test if the function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'create_default_categories';

-- Check if categories table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'categories'; 