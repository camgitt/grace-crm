-- Add test users for AI email testing
-- These users have real emails to verify AI-generated messages work

-- Get the church_id (assumes single church setup, adjust if needed)
DO $$
DECLARE
  v_church_id UUID;
BEGIN
  -- Get the first church (or specify your church_id directly)
  SELECT id INTO v_church_id FROM churches LIMIT 1;

  IF v_church_id IS NULL THEN
    RAISE EXCEPTION 'No church found. Please create a church first.';
  END IF;

  -- Insert Cam Deich - Birthday TODAY for testing birthday greetings
  INSERT INTO people (
    church_id,
    first_name,
    last_name,
    email,
    phone,
    status,
    join_date,
    birth_date,
    tags,
    notes
  ) VALUES (
    v_church_id,
    'Cam',
    'Deich',
    'cdeichmiller11@gmail.com',
    '(555) 678-9012',
    'member',
    '2021-09-20',
    CURRENT_DATE,  -- Birthday is TODAY
    ARRAY['worship-team', 'musician', 'test-user'],
    'Test user for AI email features. Birthday set to today for testing.'
  )
  ON CONFLICT DO NOTHING;

  -- Insert Cam 1993 - Recent visitor for testing welcome emails
  INSERT INTO people (
    church_id,
    first_name,
    last_name,
    email,
    phone,
    status,
    first_visit,
    birth_date,
    tags,
    notes
  ) VALUES (
    v_church_id,
    'Cam',
    '1993',
    'camd1993@gmail.com',
    '(555) 345-6780',
    'visitor',
    CURRENT_DATE - INTERVAL '3 days',  -- Visited 3 days ago
    '1993-02-14',
    ARRAY['first-time', 'test-user'],
    'Test user for AI email features. Recent visitor for welcome message testing.'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Test users added successfully for church %', v_church_id;
END $$;
