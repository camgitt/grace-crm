-- GRACE CRM Seed Data
-- Run this after migrations to populate demo data

-- ============================================
-- CHURCH
-- ============================================
INSERT INTO churches (id, name, slug, email, phone, address, city, state, zip, website)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Grace Community Church',
  'grace-community',
  'office@gracechurch.com',
  '(555) 123-4567',
  '123 Main Street',
  'Springfield',
  'IL',
  '62701',
  'https://gracechurch.com'
);

-- ============================================
-- PEOPLE (50 total)
-- ============================================
INSERT INTO people (id, church_id, first_name, last_name, email, phone, status, birth_date, join_date, first_visit, tags, family_id, notes) VALUES
-- Original people
('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sarah', 'Mitchell', 'sarah.mitchell@email.com', '(555) 123-4567', 'visitor', '1995-03-15', NULL, '2024-12-29', ARRAY['first-time', 'young-adult'], NULL, 'Came with friend Maria. Interested in small groups.'),
('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'James', 'Peterson', 'james.p@email.com', '(555) 234-5678', 'member', '1985-01-26', '2023-06-15', NULL, ARRAY['volunteer', 'greeter'], NULL, 'Serves on greeting team every 2nd Sunday.'),
('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Maria', 'Garcia', 'maria.garcia@email.com', '(555) 345-6789', 'regular', '1992-07-22', NULL, '2024-08-10', ARRAY['young-adult'], NULL, 'Brought friend Sarah on 12/29.'),
('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Robert', 'Chen', 'robert.chen@email.com', '(555) 456-7890', 'leader', '1985-01-29', '2020-03-01', NULL, ARRAY['elder', 'small-group-leader'], NULL, 'Elder. Leads Tuesday night men''s group.'),
('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Emily', 'Johnson', 'emily.j@email.com', '(555) 567-8901', 'inactive', '1988-11-30', '2022-01-10', NULL, ARRAY[]::TEXT[], NULL, 'Hasn''t attended in 6 weeks. Last contact was about job stress.'),
('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'David', 'Williams', 'david.w@email.com', '(555) 678-9012', 'member', CURRENT_DATE - INTERVAL '30 years', '2021-09-20', NULL, ARRAY['worship-team', 'musician'], NULL, 'Test user for AI email features.'),
('p0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Lisa', 'Thompson', 'lisa.t@email.com', '(555) 789-0123', 'visitor', '1984-04-12', NULL, '2025-01-01', ARRAY['first-time', 'family'], NULL, 'New Year''s service visitor. Has 2 kids (ages 5, 8).'),
('p0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Michael', 'Brown', 'michael.b@email.com', '(555) 890-1234', 'member', '1975-08-03', '2019-11-15', NULL, ARRAY['deacon', 'finance-team'], NULL, 'Serves on finance committee.'),
('p0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Amanda', 'Foster', 'amanda.foster@email.com', '(555) 901-2345', 'member', CURRENT_DATE - INTERVAL '30 years' + INTERVAL '1 day', '2022-05-20', NULL, ARRAY['womens-ministry', 'prayer-team'], NULL, 'Active in women''s Bible study. Great encourager.'),
('p0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Kevin', 'Martinez', 'kevin.m@email.com', '(555) 012-3456', 'member', CURRENT_DATE - INTERVAL '30 years' + INTERVAL '3 days', '2021-01-22', NULL, ARRAY['tech-team', 'young-professional'], NULL, 'Runs sound booth. Works in IT.'),
('p0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Rachel', 'Kim', 'rachel.kim@email.com', '(555) 123-4560', 'member', CURRENT_DATE - INTERVAL '30 years' + INTERVAL '6 days', CURRENT_DATE - INTERVAL '1 year', NULL, ARRAY['childrens-ministry', 'teacher'], NULL, 'Teaches 3rd grade Sunday school. Very dedicated.'),
('p0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Thomas', 'Wright', 'tom.wright@email.com', '(555) 234-5670', 'leader', '1970-12-25', '2018-06-10', NULL, ARRAY['elder', 'missions-team'], NULL, 'Oversees missions committee. Went on 3 mission trips.'),
('p0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'Jennifer', 'Adams', 'jen.adams@email.com', '(555) 345-6780', 'visitor', '1990-02-14', NULL, CURRENT_DATE - INTERVAL '3 days', ARRAY['first-time', 'young-family'], NULL, 'Test user for AI email features.'),
('p0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'Marcus', 'Taylor', 'marcus.t@email.com', '(555) 456-7801', 'visitor', '1987-09-08', NULL, CURRENT_DATE - INTERVAL '1 day', ARRAY['first-time'], NULL, 'Coworker of James Peterson. First church visit in 5 years.'),
('p0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'Ashley', 'Robinson', 'ashley.r@email.com', '(555) 567-8902', 'visitor', '1993-05-21', NULL, CURRENT_DATE, ARRAY['first-time', 'college-student'], NULL, 'Graduate student at local university. Interested in young adults group.'),
('p0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'Brian', 'Cooper', 'brian.cooper@email.com', '(555) 678-9013', 'regular', '1982-10-30', NULL, '2024-09-15', ARRAY['mens-group'], NULL, 'Been attending regularly for 4 months. Ready for membership class?'),
('p0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'Nicole', 'Davis', 'nicole.d@email.com', '(555) 789-0124', 'regular', CURRENT_DATE - INTERVAL '30 years' + INTERVAL '4 days', NULL, '2024-10-01', ARRAY['young-adult', 'creative'], NULL, 'Graphic designer. Volunteered for bulletin design.'),
('p0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'Daniel', 'Lee', 'daniel.lee@email.com', '(555) 890-1235', 'member', '1979-06-18', CURRENT_DATE - INTERVAL '2 years' + INTERVAL '2 days', NULL, ARRAY['usher', 'parking-team'], NULL, 'Faithful usher. Never misses a Sunday.'),
('p0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'Stephanie', 'Moore', 'steph.moore@email.com', '(555) 901-2346', 'member', '1986-01-07', CURRENT_DATE - INTERVAL '3 years' + INTERVAL '5 days', NULL, ARRAY['hospitality', 'events-team'], NULL, 'Coordinates fellowship meals. Amazing cook!'),
('p0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'Christopher', 'Hall', 'chris.hall@email.com', '(555) 012-3457', 'regular', '1991-03-25', NULL, '2024-11-10', ARRAY['young-professional'], NULL, 'Attending for 2 months. Made first donation last week!'),
('p0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'Lauren', 'White', 'lauren.w@email.com', '(555) 123-4561', 'member', '1989-08-14', '2023-03-12', NULL, ARRAY['choir', 'worship-team'], NULL, 'Beautiful soprano voice. Joined choir immediately.'),
('p0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'Andrew', 'Clark', 'andrew.c@email.com', '(555) 234-5671', 'inactive', CURRENT_DATE - INTERVAL '30 years' + INTERVAL '1 day', '2021-04-15', NULL, ARRAY[]::TEXT[], NULL, 'Stopped attending after job change. Moved across town.'),
('p0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'Michelle', 'Young', 'michelle.y@email.com', '(555) 345-6781', 'inactive', '1983-04-02', '2020-08-20', NULL, ARRAY[]::TEXT[], NULL, 'Family health issues. Last contact 2 months ago.'),
('p0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'Richard', 'Anderson', 'richard.a@email.com', '(555) 456-7802', 'member', '1965-11-12', '2015-01-10', NULL, ARRAY['elder', 'major-donor'], NULL, 'Retired business owner. Very generous supporter of missions.'),
('p0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'Patricia', 'Thomas', 'patricia.t@email.com', '(555) 567-8903', 'member', '1958-07-30', '2017-06-25', NULL, ARRAY['prayer-team', 'major-donor'], NULL, 'Prayer warrior. Supports benevolence fund regularly.'),
('p0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000001', 'Mark', 'Thompson', 'mark.thompson@email.com', '(555) 789-0125', 'member', '1982-04-18', '2025-01-05', NULL, ARRAY['family'], 'f0000000-0000-0000-0000-000000000001', 'Lisa Thompson''s husband. Joined after visiting on New Year''s.'),
('p0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000001', 'Emma', 'Thompson', 'emma.thompson@email.com', '(555) 789-0125', 'member', '2017-06-10', '2025-01-05', NULL, ARRAY['child', 'kids-ministry'], 'f0000000-0000-0000-0000-000000000001', 'Lisa & Mark''s daughter, age 8. Loves Sunday school.'),
('p0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'Ethan', 'Thompson', NULL, NULL, 'member', '2020-03-22', '2025-01-05', NULL, ARRAY['child', 'kids-ministry'], 'f0000000-0000-0000-0000-000000000001', 'Lisa & Mark''s son, age 5. In preschool class.'),
-- Expanded mock data (29-50)
('p0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000001', 'Catherine', 'Brooks', 'catherine.brooks@email.com', '(555) 111-2233', 'member', '1978-05-20', '2022-03-15', NULL, ARRAY['hospitality', 'greeter'], NULL, 'Always first to volunteer for events.'),
('p0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'William', 'Scott', 'will.scott@email.com', '(555) 222-3344', 'member', '1982-09-12', '2021-07-10', NULL, ARRAY['parking-team', 'mens-group'], NULL, 'Former military. Great leader.'),
('p0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', 'Jessica', 'Rivera', 'jessica.r@email.com', '(555) 333-4455', 'regular', '1994-12-03', NULL, '2024-06-20', ARRAY['young-adult', 'creative'], NULL, 'Photographer. Offers to help with church events.'),
('p0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', 'Jonathan', 'Hughes', 'jon.hughes@email.com', '(555) 444-5566', 'leader', '1975-02-28', '2019-01-20', NULL, ARRAY['elder', 'teaching'], NULL, 'Teaches adult Sunday school class.'),
('p0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000001', 'Samantha', 'Price', 'sam.price@email.com', '(555) 555-6677', 'member', CURRENT_DATE - INTERVAL '30 years' + INTERVAL '7 days', '2023-04-08', NULL, ARRAY['worship-team', 'musician'], NULL, 'Plays keyboard. Music teacher.'),
('p0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000001', 'Benjamin', 'Morris', 'ben.morris@email.com', '(555) 666-7788', 'member', '1988-07-15', '2020-11-01', NULL, ARRAY['tech-team', 'streaming'], NULL, 'Runs live stream production.'),
('p0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000001', 'Hannah', 'Nelson', 'hannah.n@email.com', '(555) 777-8899', 'visitor', '1996-04-25', NULL, CURRENT_DATE - INTERVAL '7 days', ARRAY['first-time', 'young-adult'], NULL, 'Found us online. Looking for community.'),
('p0000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000001', 'Alexander', 'King', 'alex.king@email.com', '(555) 888-9900', 'inactive', '1980-10-08', '2019-08-15', NULL, ARRAY[]::TEXT[], NULL, 'Moved to different part of city. Should follow up.'),
('p0000000-0000-0000-0000-000000000037', 'a0000000-0000-0000-0000-000000000001', 'Olivia', 'Green', 'olivia.green@email.com', '(555) 999-0011', 'member', '1991-01-17', '2022-09-25', NULL, ARRAY['childrens-ministry', 'nursery'], NULL, 'Nursery volunteer. Very patient with kids.'),
('p0000000-0000-0000-0000-000000000038', 'a0000000-0000-0000-0000-000000000001', 'Ethan', 'Walker', 'ethan.walker@email.com', '(555) 000-1122', 'regular', '1999-06-30', NULL, '2024-09-01', ARRAY['college-student'], NULL, 'Engineering student at local university.'),
('p0000000-0000-0000-0000-000000000039', 'a0000000-0000-0000-0000-000000000001', 'Mia', 'Adams', 'mia.adams@email.com', '(555) 112-2334', 'member', '1987-03-09', '2021-12-12', NULL, ARRAY['prayer-team', 'intercessor'], NULL, 'Leads prayer ministry. Very discerning.'),
('p0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000001', 'Jacob', 'Campbell', 'jacob.c@email.com', '(555) 223-3445', 'visitor', '1985-08-22', NULL, CURRENT_DATE - INTERVAL '14 days', ARRAY['second-time'], NULL, 'Came back for second visit. Interested in mens group.'),
('p0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000001', 'Sophia', 'Mitchell', 'sophia.m@email.com', '(555) 334-4556', 'member', '1993-11-05', '2023-02-14', NULL, ARRAY['womens-ministry', 'events-team'], NULL, 'Great event planner. Organized last retreat.'),
('p0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000001', 'Lucas', 'Parker', 'lucas.parker@email.com', '(555) 445-5667', 'leader', '1972-09-14', '2018-05-20', NULL, ARRAY['elder', 'finance-team'], NULL, 'CPA. Oversees church finances.'),
('p0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000001', 'Isabella', 'Evans', 'isabella.e@email.com', '(555) 556-6778', 'member', '1990-02-19', '2022-06-30', NULL, ARRAY['worship-team', 'vocals'], NULL, 'Soprano vocalist. Sings every other Sunday.'),
('p0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000001', 'Mason', 'Turner', 'mason.t@email.com', '(555) 667-7889', 'regular', '1998-12-28', NULL, '2024-07-15', ARRAY['young-adult'], NULL, 'Just moved to area for new job.'),
('p0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000001', 'Ava', 'Phillips', 'ava.phillips@email.com', '(555) 778-8990', 'member', '1983-07-04', '2020-02-28', NULL, ARRAY['missions-team', 'outreach'], NULL, 'Passionate about local outreach. Leads food pantry.'),
('p0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000001', 'Logan', 'Collins', 'logan.c@email.com', '(555) 889-9001', 'inactive', '1995-05-16', '2021-03-10', NULL, ARRAY[]::TEXT[], NULL, 'Work schedule conflicts. Wants to return.'),
('p0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000001', 'Charlotte', 'Stewart', 'charlotte.s@email.com', '(555) 990-0112', 'member', '1976-04-11', '2019-10-05', NULL, ARRAY['womens-ministry', 'counselor'], NULL, 'Licensed counselor. Provides pastoral care support.'),
('p0000000-0000-0000-0000-000000000048', 'a0000000-0000-0000-0000-000000000001', 'Aiden', 'Sanchez', 'aiden.sanchez@email.com', '(555) 001-1223', 'visitor', '1992-10-31', NULL, CURRENT_DATE - INTERVAL '2 days', ARRAY['first-time'], NULL, 'Came with coworker. Seemed engaged during service.'),
('p0000000-0000-0000-0000-000000000049', 'a0000000-0000-0000-0000-000000000001', 'Emma', 'Ramirez', 'emma.ramirez@email.com', '(555) 112-2345', 'member', '1989-06-08', '2022-08-20', NULL, ARRAY['hospitality', 'coffee-team'], NULL, 'Runs coffee ministry. Always has a smile.'),
('p0000000-0000-0000-0000-000000000050', 'a0000000-0000-0000-0000-000000000001', 'Noah', 'Bennett', 'noah.bennett@email.com', '(555) 223-3456', 'member', '1984-01-25', '2023-01-08', NULL, ARRAY['security-team', 'usher'], NULL, 'Background in security. Helps with safety protocols.');

-- ============================================
-- SMALL GROUPS
-- ============================================
INSERT INTO small_groups (id, church_id, name, description, leader_id, meeting_day, meeting_time, location, is_active) VALUES
('g0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Men of Faith', 'Tuesday night men''s Bible study and accountability group.', 'p0000000-0000-0000-0000-000000000004', 'Tuesday', '19:00', 'Room 201', true),
('g0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Young Adults', 'Community for 20s and 30s. Life, faith, and fellowship.', 'p0000000-0000-0000-0000-000000000010', 'Thursday', '19:30', 'Coffee House', true),
('g0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Women of Grace', 'Wednesday morning women''s Bible study and prayer group.', 'p0000000-0000-0000-0000-000000000009', 'Wednesday', '09:30', 'Fellowship Hall', true);

-- ============================================
-- GROUP MEMBERSHIPS
-- ============================================
INSERT INTO group_memberships (group_id, person_id) VALUES
-- Men of Faith
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000008'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000012'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000016'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000018'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000030'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000032'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000042'),
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000050'),
-- Young Adults
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000006'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000010'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000017'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000031'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000034'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000038'),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000044'),
-- Women of Grace
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000009'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000011'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000019'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000021'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000025'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000029'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000033'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000037'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000039'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000041'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000043'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000045'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000047'),
('g0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000049');

-- ============================================
-- TASKS (30 total)
-- ============================================
INSERT INTO tasks (id, church_id, person_id, title, description, due_date, completed, priority, category) VALUES
('t0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Follow up with Sarah Mitchell', 'First-time visitor on 12/29. Send welcome email and invite to coffee.', '2025-01-05', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000007', 'Connect Lisa Thompson with kids ministry', 'New visitor with 2 kids. Introduce to children''s pastor.', '2025-01-06', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 'Check in on Emily Johnson', 'Inactive 6 weeks. Last mentioned job stress. Care call needed.', CURRENT_DATE + INTERVAL '2 days', false, 'medium', 'care'),
('t0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NULL, 'Prepare Q1 giving report', 'Compile giving data for elder meeting.', CURRENT_DATE + INTERVAL '15 days', false, 'low', 'admin'),
('t0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 'Thank Maria for bringing guest', 'She brought Sarah to service. Send appreciation note.', CURRENT_DATE - INTERVAL '2 days', true, 'medium', 'outreach'),
('t0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000013', 'Follow up with Jennifer Adams', 'First-time visitor looking for church home. Send welcome email.', CURRENT_DATE + INTERVAL '1 day', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000014', 'Follow up with Marcus Taylor', 'James Peterson''s coworker. First church visit in 5 years.', CURRENT_DATE + INTERVAL '2 days', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000015', 'Connect Ashley Robinson with young adults', 'Graduate student interested in young adults group.', CURRENT_DATE + INTERVAL '3 days', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000022', 'Birthday outreach to Andrew Clark', 'Inactive member with birthday tomorrow. Good re-engagement opportunity.', CURRENT_DATE + INTERVAL '1 day', false, 'medium', 'care'),
('t0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000023', 'Check on Michelle Young''s family', 'Family health issues. Send care package and follow up.', CURRENT_DATE + INTERVAL '2 days', false, 'high', 'care'),
('t0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000016', 'Invite Brian Cooper to membership class', 'Regular attender for 4 months. Ready for next step.', CURRENT_DATE + INTERVAL '7 days', false, 'medium', 'follow-up'),
('t0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000017', 'Thank Nicole Davis for design help', 'Volunteered to redesign bulletin. Send thank you note.', CURRENT_DATE, false, 'low', 'outreach'),
('t0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000020', 'Thank Christopher Hall for first gift', 'Made first donation last week. Personal thank you from pastor.', CURRENT_DATE, false, 'medium', 'outreach'),
('t0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000024', 'Acknowledge Richard Anderson''s missions gift', '$5,000 missions gift. Schedule coffee with pastor.', CURRENT_DATE + INTERVAL '1 day', false, 'high', 'outreach'),
('t0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', NULL, 'Send birthday greetings this week', 'Multiple birthdays coming up.', CURRENT_DATE, false, 'medium', 'admin'),
('t0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', NULL, 'Process membership anniversaries', 'Rachel Kim - 1 year, Daniel Lee - 2 years, Stephanie Moore - 3 years.', CURRENT_DATE + INTERVAL '5 days', false, 'low', 'admin'),
('t0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000035', 'Follow up with Hannah Nelson', 'First-time visitor from last week. Found us online.', CURRENT_DATE + INTERVAL '1 day', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000040', 'Connect Jacob Campbell with mens group', 'Second-time visitor interested in mens group.', CURRENT_DATE + INTERVAL '2 days', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000036', 'Reach out to Alexander King', 'Moved to different part of city. Check if he found new church.', CURRENT_DATE + INTERVAL '3 days', false, 'medium', 'care'),
('t0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000046', 'Check in with Logan Collins', 'Work schedule conflicts. See if evening services help.', CURRENT_DATE + INTERVAL '4 days', false, 'medium', 'care'),
('t0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000048', 'Follow up with Aiden Sanchez', 'First-time visitor from 2 days ago. Came with coworker.', CURRENT_DATE + INTERVAL '1 day', false, 'high', 'follow-up'),
('t0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000031', 'Discuss photography with Jessica Rivera', 'Offered to help with church event photos.', CURRENT_DATE + INTERVAL '5 days', false, 'low', 'outreach'),
('t0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000033', 'Birthday celebration for Samantha Price', 'Birthday in 7 days. Coordinates with worship team.', CURRENT_DATE + INTERVAL '7 days', false, 'low', 'care'),
('t0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000038', 'Invite Ethan Walker to young adults', 'Engineering student new to area. Connect with Kevin.', CURRENT_DATE + INTERVAL '2 days', false, 'medium', 'follow-up'),
('t0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000044', 'Welcome Mason Turner', 'Just moved for new job. Needs community.', CURRENT_DATE + INTERVAL '3 days', false, 'medium', 'follow-up'),
('t0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000001', NULL, 'Prepare volunteer appreciation event', 'Plan thank you event for all ministry volunteers.', CURRENT_DATE + INTERVAL '14 days', false, 'medium', 'admin'),
('t0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000045', 'Food pantry supply check with Ava', 'Monthly inventory and restocking coordination.', CURRENT_DATE + INTERVAL '6 days', false, 'medium', 'outreach'),
('t0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000047', 'Schedule counselor training with Charlotte', 'Organize pastoral care volunteer training.', CURRENT_DATE + INTERVAL '10 days', false, 'low', 'admin'),
('t0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000001', NULL, 'Update security protocols', 'Review with Noah Bennett and safety team.', CURRENT_DATE + INTERVAL '8 days', false, 'medium', 'admin'),
('t0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000034', 'Live stream equipment check', 'Ben Morris to review and test all equipment.', CURRENT_DATE + INTERVAL '4 days', true, 'high', 'admin');

-- ============================================
-- GIVING RECORDS (50 total)
-- ============================================
INSERT INTO giving (id, church_id, person_id, amount, fund, date, method, is_recurring, note) VALUES
-- Original giving
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 250.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004', 500.00, 'tithe', CURRENT_DATE, 'check', false, NULL),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000008', 150.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000008', 100.00, 'missions', CURRENT_DATE, 'online', false, NULL),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000006', 75.00, 'offering', CURRENT_DATE, 'cash', false, NULL),
-- First-time givers
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000020', 50.00, 'tithe', CURRENT_DATE - INTERVAL '7 days', 'online', false, 'First gift! Welcome gift from Christopher.'),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000013', 25.00, 'offering', CURRENT_DATE - INTERVAL '2 days', 'card', false, 'First-time visitor Jennifer''s first gift.'),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000016', 100.00, 'tithe', CURRENT_DATE - INTERVAL '1 day', 'online', false, 'Brian''s first tithe - becoming more committed!'),
-- Large gifts
('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000024', 5000.00, 'missions', CURRENT_DATE - INTERVAL '3 days', 'check', false, 'Year-end missions gift from Richard Anderson.'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000024', 2500.00, 'building', CURRENT_DATE - INTERVAL '10 days', 'bank', false, 'Building fund contribution.'),
('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000025', 1500.00, 'benevolence', CURRENT_DATE - INTERVAL '5 days', 'check', false, 'Patricia''s quarterly benevolence gift.'),
('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000012', 2000.00, 'missions', CURRENT_DATE, 'online', false, 'Thomas Wright - missions trip sponsorship.'),
-- Recurring gifts
('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000009', 200.00, 'tithe', CURRENT_DATE - INTERVAL '30 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000009', 200.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000010', 150.00, 'tithe', CURRENT_DATE - INTERVAL '30 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000010', 150.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
('d0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000011', 300.00, 'tithe', CURRENT_DATE - INTERVAL '30 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000011', 300.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
('d0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000018', 175.00, 'tithe', CURRENT_DATE - INTERVAL '30 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000018', 175.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
('d0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000021', 125.00, 'tithe', CURRENT_DATE - INTERVAL '30 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000021', 125.00, 'tithe', CURRENT_DATE, 'online', true, NULL),
-- Various fund donations
('d0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000019', 50.00, 'benevolence', CURRENT_DATE - INTERVAL '14 days', 'cash', false, NULL),
('d0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000017', 40.00, 'offering', CURRENT_DATE - INTERVAL '7 days', 'card', false, NULL),
('d0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 75.00, 'tithe', CURRENT_DATE - INTERVAL '7 days', 'online', false, NULL),
('d0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000026', 200.00, 'tithe', CURRENT_DATE - INTERVAL '3 days', 'online', false, 'Mark Thompson - new member first gift.'),
-- Expanded giving data
('d0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000029', 175.00, 'tithe', CURRENT_DATE - INTERVAL '7 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000030', 225.00, 'tithe', CURRENT_DATE - INTERVAL '7 days', 'check', false, NULL),
('d0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000032', 400.00, 'tithe', CURRENT_DATE - INTERVAL '3 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000033', 100.00, 'tithe', CURRENT_DATE - INTERVAL '5 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000034', 150.00, 'tithe', CURRENT_DATE - INTERVAL '2 days', 'card', false, NULL),
('d0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000037', 300.00, 'offering', CURRENT_DATE - INTERVAL '1 day', 'cash', false, NULL),
('d0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000039', 250.00, 'tithe', CURRENT_DATE - INTERVAL '4 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000041', 175.00, 'tithe', CURRENT_DATE - INTERVAL '6 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000042', 500.00, 'tithe', CURRENT_DATE, 'bank', true, NULL),
('d0000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000042', 200.00, 'building', CURRENT_DATE - INTERVAL '10 days', 'check', false, NULL),
('d0000000-0000-0000-0000-000000000037', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000043', 125.00, 'tithe', CURRENT_DATE - INTERVAL '3 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000038', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000045', 200.00, 'benevolence', CURRENT_DATE - INTERVAL '8 days', 'check', false, NULL),
('d0000000-0000-0000-0000-000000000039', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000045', 175.00, 'tithe', CURRENT_DATE - INTERVAL '1 day', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000047', 300.00, 'tithe', CURRENT_DATE - INTERVAL '2 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000049', 150.00, 'tithe', CURRENT_DATE - INTERVAL '5 days', 'online', true, NULL),
('d0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000050', 200.00, 'tithe', CURRENT_DATE - INTERVAL '3 days', 'check', false, NULL),
('d0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000031', 75.00, 'offering', CURRENT_DATE - INTERVAL '9 days', 'card', false, NULL),
('d0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000038', 50.00, 'offering', CURRENT_DATE - INTERVAL '11 days', 'cash', false, NULL),
('d0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000044', 100.00, 'tithe', CURRENT_DATE - INTERVAL '4 days', 'online', false, NULL),
('d0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000029', 175.00, 'tithe', CURRENT_DATE, 'online', true, NULL);

-- ============================================
-- PRAYER REQUESTS
-- ============================================
INSERT INTO prayer_requests (id, church_id, person_id, content, is_private, is_answered, testimony) VALUES
('pr000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 'Please pray for guidance in my job search. Feeling overwhelmed.', false, false, NULL),
('pr000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 'Thankful for my mother''s successful surgery. Praying for quick recovery.', false, false, NULL),
('pr000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000008', 'Wisdom needed for a difficult family decision.', true, true, 'God provided clarity through counsel from Pastor and peace in prayer.');

-- ============================================
-- INTERACTIONS
-- ============================================
INSERT INTO interactions (id, church_id, person_id, type, content, created_by_name) VALUES
('i0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'note', 'First visit! Came with Maria Garcia. Very engaged during service. Asked about small groups.', 'Pastor John'),
('i0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 'call', 'Called to check in. Emily shared she''s been stressed with job situation. Prayed together.', 'Pastor John'),
('i0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000007', 'note', 'New Year''s service visitor. Family of 4. Kids enjoyed children''s church.', 'Welcome Team');

-- ============================================
-- CALENDAR EVENTS
-- ============================================
INSERT INTO calendar_events (id, church_id, title, description, start_date, end_date, all_day, location, category) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sunday Service', 'Weekly Sunday worship service', '2025-01-26 10:00:00', '2025-01-26 11:30:00', false, 'Main Sanctuary', 'service'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Men of Faith', 'Weekly men''s Bible study', '2025-01-28 19:00:00', '2025-01-28 20:30:00', false, 'Room 201', 'small-group'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Elder Meeting', 'Monthly elder meeting', '2025-01-29 18:00:00', '2025-01-29 19:30:00', false, 'Conference Room', 'meeting'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Young Adults', 'Weekly young adults gathering', '2025-01-30 19:30:00', '2025-01-30 21:00:00', false, 'Coffee House', 'small-group');
