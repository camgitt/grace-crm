-- ============================================
-- GRACE CRM - Comprehensive Demo Data
-- Run this after migrations to populate demo church
-- ============================================

-- Clean existing demo data (if re-running)
DELETE FROM attendance WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM giving WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM interactions WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM tasks WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM prayer_requests WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM group_memberships WHERE group_id IN (SELECT id FROM small_groups WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
DELETE FROM small_groups WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM calendar_events WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM people WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM users WHERE church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM churches WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================
-- CHURCH
-- ============================================
INSERT INTO churches (id, name, slug, email, phone, address, city, state, zip, website, timezone, settings)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Grace Community Church',
  'grace-community',
  'info@gracechurch.example.com',
  '555-123-4567',
  '123 Faith Avenue',
  'Springfield',
  'IL',
  '62701',
  'https://gracechurch.example.com',
  'America/Chicago',
  '{"sundayServiceTime": "10:00 AM", "wednesdayServiceTime": "7:00 PM", "denomination": "Non-denominational"}'
);

-- ============================================
-- STAFF USERS
-- ============================================
INSERT INTO users (id, church_id, email, first_name, last_name, role, is_active)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'pastor.james@gracechurch.example.com', 'James', 'Anderson', 'admin', true),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@gracechurch.example.com', 'Mary', 'Thompson', 'admin', true),
  ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'youth@gracechurch.example.com', 'Chris', 'Martinez', 'staff', true),
  ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'worship@gracechurch.example.com', 'Lisa', 'Chen', 'staff', true);

-- ============================================
-- CONGREGATION MEMBERS (25 people with diverse data)
-- ============================================
INSERT INTO people (id, church_id, first_name, last_name, email, phone, status, address, city, state, zip, birth_date, join_date, first_visit, notes, tags, family_id)
VALUES
  -- Leaders (5)
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Robert', 'Wilson', 'robert.wilson@email.com', '555-0201', 'leader', '456 Oak Street', 'Springfield', 'IL', '62702', '1975-03-15', '2015-01-10', '2014-12-01', 'Elder, leads Tuesday night Bible study. Very dependable.', ARRAY['elder', 'small-group-leader', 'volunteer'], 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Patricia', 'Wilson', 'patricia.wilson@email.com', '555-0202', 'leader', '456 Oak Street', 'Springfield', 'IL', '62702', '1978-07-22', '2015-01-10', '2014-12-01', 'Leads women''s ministry. Excellent organizer.', ARRAY['womens-ministry', 'small-group-leader'], 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Michael', 'Johnson', 'michael.j@email.com', '555-0203', 'leader', '789 Maple Lane', 'Springfield', 'IL', '62703', '1980-11-08', '2016-03-20', '2016-01-15', 'Deacon, coordinates volunteer teams for Sunday services.', ARRAY['deacon', 'volunteer-coordinator'], NULL),
  ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jennifer', 'Davis', 'jennifer.davis@email.com', '555-0204', 'leader', '321 Pine Road', 'Springfield', 'IL', '62704', '1985-02-28', '2017-06-01', '2017-04-10', 'Youth ministry volunteer leader. Great with teens.', ARRAY['youth-ministry', 'small-group-leader'], NULL),
  ('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'David', 'Martinez', 'david.m@email.com', '555-0205', 'leader', '654 Birch Avenue', 'Springfield', 'IL', '62705', '1982-09-10', '2018-01-15', '2017-11-20', 'Worship team leader, plays guitar and leads Sunday worship.', ARRAY['worship-team', 'musician'], NULL),

  -- Members (10)
  ('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sarah', 'Thompson', 'sarah.t@email.com', '555-0206', 'member', '111 Cedar Court', 'Springfield', 'IL', '62701', '1990-05-14', '2019-04-07', '2019-02-15', 'Active in young adults group. Recently engaged.', ARRAY['young-adults'], NULL),
  ('c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'James', 'Brown', 'james.brown@email.com', '555-0207', 'member', '222 Elm Street', 'Springfield', 'IL', '62702', '1988-08-30', '2020-01-12', '2019-10-05', 'Serves on hospitality team. Very welcoming personality.', ARRAY['hospitality', 'greeter'], 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Emily', 'Brown', 'emily.brown@email.com', '555-0208', 'member', '222 Elm Street', 'Springfield', 'IL', '62702', '1991-12-03', '2020-01-12', '2019-10-05', 'Volunteers in children''s ministry every other week.', ARRAY['childrens-ministry', 'volunteer'], 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'William', 'Garcia', 'will.garcia@email.com', '555-0209', 'member', '333 Walnut Drive', 'Springfield', 'IL', '62703', '1972-04-18', '2018-09-02', '2018-06-10', 'Retired teacher. Helps with senior adults ministry.', ARRAY['senior-adults'], NULL),
  ('c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Maria', 'Garcia', 'maria.garcia@email.com', '555-0210', 'member', '333 Walnut Drive', 'Springfield', 'IL', '62703', '1974-10-25', '2018-09-02', '2018-06-10', 'Prayer team coordinator. Passionate about intercession.', ARRAY['prayer-team', 'senior-adults'], NULL),
  ('c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Christopher', 'Lee', 'chris.lee@email.com', '555-0211', 'member', '444 Spruce Lane', 'Springfield', 'IL', '62704', '1995-01-20', '2021-05-16', '2021-03-07', 'Tech team volunteer. Runs sound and projection.', ARRAY['tech-team', 'young-adults'], NULL),
  ('c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Amanda', 'Taylor', 'amanda.t@email.com', '555-0212', 'member', '555 Ash Street', 'Springfield', 'IL', '62705', '1993-06-08', '2020-11-22', '2020-09-13', 'Small group member. Recently started serving in hospitality.', ARRAY['hospitality'], NULL),
  ('c13ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Daniel', 'Anderson', 'daniel.a@email.com', '555-0213', 'member', '666 Hickory Road', 'Springfield', 'IL', '62701', '1987-03-12', '2019-08-04', '2019-05-26', 'Consistent attender. Interested in missions trips.', ARRAY['missions'], NULL),
  ('c14ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jessica', 'White', 'jessica.w@email.com', '555-0214', 'member', '777 Poplar Avenue', 'Springfield', 'IL', '62702', '1989-09-27', '2022-01-09', '2021-11-14', 'New member. Very enthusiastic about getting involved.', ARRAY['new-member'], NULL),
  ('c15ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Matthew', 'Harris', 'matt.harris@email.com', '555-0215', 'member', '888 Willow Court', 'Springfield', 'IL', '62703', '1984-11-05', '2017-04-16', '2017-02-05', 'Usher on Sunday mornings. Faithful servant.', ARRAY['usher', 'volunteer'], NULL),

  -- Regular Attenders (5)
  ('c16ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ashley', 'Clark', 'ashley.c@email.com', '555-0216', 'regular', '999 Chestnut Lane', 'Springfield', 'IL', '62704', '1996-02-14', NULL, '2022-06-12', 'Attends regularly but hasn''t joined as member yet.', ARRAY['young-adults'], NULL),
  ('c17ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Brandon', 'Lewis', 'brandon.l@email.com', '555-0217', 'regular', '1010 Sycamore Street', 'Springfield', 'IL', '62705', '1992-07-31', NULL, '2023-01-08', 'College student. Attends when in town.', ARRAY['young-adults', 'college'], NULL),
  ('c18ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nicole', 'Robinson', 'nicole.r@email.com', '555-0218', 'regular', '1111 Magnolia Drive', 'Springfield', 'IL', '62701', '1998-04-19', NULL, '2022-09-04', 'Single mom. Brings kids to Sunday school.', ARRAY['single-parents'], 'f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('c19ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tyler', 'Robinson', 'tyler.robinson@email.com', NULL, 'regular', '1111 Magnolia Drive', 'Springfield', 'IL', '62701', '2015-08-22', NULL, '2022-09-04', 'Nicole''s son. Attends children''s ministry.', ARRAY['kids'], 'f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('c20ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kevin', 'Walker', 'kevin.w@email.com', '555-0220', 'regular', '1212 Redwood Road', 'Springfield', 'IL', '62702', '1979-12-01', NULL, '2021-08-15', 'Recently divorced. Looking for community.', ARRAY['recovery', 'mens-group'], NULL),

  -- Visitors (5)
  ('c21ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stephanie', 'Young', 'stephanie.y@email.com', '555-0221', 'visitor', '1313 Cypress Court', 'Springfield', 'IL', '62703', '1994-05-28', NULL, '2024-01-07', 'First time visitor. Seemed interested in young adults group.', ARRAY['first-time-visitor'], NULL),
  ('c22ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ryan', 'King', 'ryan.king@email.com', '555-0222', 'visitor', '1414 Dogwood Lane', 'Springfield', 'IL', '62704', '1990-10-16', NULL, '2024-01-14', 'Second visit. Looking for a church home after moving to area.', ARRAY['new-to-area'], NULL),
  ('c23ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Michelle', 'Scott', 'michelle.s@email.com', '555-0223', 'visitor', '1515 Juniper Street', 'Springfield', 'IL', '62705', '1986-08-09', NULL, '2024-01-21', 'Visited last Sunday. Has kids ages 5 and 8.', ARRAY['first-time-visitor', 'has-kids'], NULL),
  ('c24ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jason', 'Adams', 'jason.a@email.com', '555-0224', 'visitor', NULL, NULL, NULL, NULL, '1983-01-30', NULL, '2023-12-24', 'Visited on Christmas Eve. Friend of the Johnson family.', ARRAY['holiday-visitor'], NULL),
  ('c25ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Laura', 'Nelson', 'laura.n@email.com', '555-0225', 'visitor', '1616 Hawthorn Avenue', 'Springfield', 'IL', '62701', '1997-11-12', NULL, '2024-01-14', 'College friend of Brandon Lewis. Visited together.', ARRAY['college', 'first-time-visitor'], NULL);

-- ============================================
-- SMALL GROUPS
-- ============================================
INSERT INTO small_groups (id, church_id, name, description, leader_id, meeting_day, meeting_time, location, is_active)
VALUES
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tuesday Night Bible Study', 'In-depth study of Scripture for adults of all ages.', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tuesday', '19:00', 'Wilson Home - 456 Oak Street', true),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Women of Grace', 'Women''s fellowship and Bible study group.', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Thursday', '10:00', 'Church Fellowship Hall', true),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Young Adults Connect', 'Community group for ages 18-30.', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wednesday', '19:30', 'Davis Home - 321 Pine Road', true),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Men''s Breakfast Fellowship', 'Men''s group meeting for breakfast and discussion.', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Saturday', '07:30', 'Local Diner', true),
  ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Senior Saints', 'Fellowship and study for seniors 60+.', NULL, 'Friday', '14:00', 'Church Library', true);

-- ============================================
-- GROUP MEMBERSHIPS
-- ============================================
INSERT INTO group_memberships (group_id, person_id, joined_at)
VALUES
  -- Tuesday Night Bible Study
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2015-02-01'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2015-02-01'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2020-03-15'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2020-03-15'),
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c13ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2019-09-10'),
  -- Women of Grace
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2016-01-15'),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2020-05-01'),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2018-10-01'),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2021-02-01'),
  -- Young Adults Connect
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2017-08-01'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2019-05-01'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2021-06-01'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c16ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2022-08-01'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c17ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023-02-01'),
  -- Men's Breakfast
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2016-06-01'),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2015-06-01'),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2018-10-01'),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c15ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2017-08-01'),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c20ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2022-01-01'),
  -- Senior Saints
  ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2018-09-15'),
  ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2018-09-15');

-- ============================================
-- CALENDAR EVENTS (Upcoming & Recent)
-- ============================================
INSERT INTO calendar_events (id, church_id, title, description, start_date, end_date, all_day, location, category)
VALUES
  -- Weekly Services
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sunday Worship Service', 'Weekly worship gathering for all ages.', '2024-01-28 10:00:00-06', '2024-01-28 12:00:00-06', false, 'Main Sanctuary', 'service'),
  ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wednesday Night Service', 'Midweek prayer and teaching service.', '2024-01-24 19:00:00-06', '2024-01-24 20:30:00-06', false, 'Main Sanctuary', 'service'),
  -- Special Events
  ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'New Member Class', 'Four-week class for those interested in membership.', '2024-02-04 12:30:00-06', '2024-02-04 14:00:00-06', false, 'Room 201', 'meeting'),
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Youth Winter Retreat', 'Annual winter retreat for students grades 6-12.', '2024-02-16 00:00:00-06', '2024-02-18 00:00:00-06', true, 'Camp Lakewood', 'event'),
  ('e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Valentine''s Dinner', 'Special dinner event for married couples.', '2024-02-14 18:30:00-06', '2024-02-14 21:00:00-06', false, 'Fellowship Hall', 'event'),
  ('e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Church Work Day', 'Help beautify our church grounds and facilities.', '2024-02-24 08:00:00-06', '2024-02-24 12:00:00-06', false, 'Church Campus', 'event'),
  ('e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Elder Meeting', 'Monthly leadership meeting.', '2024-02-06 18:30:00-06', '2024-02-06 20:30:00-06', false, 'Conference Room', 'meeting'),
  ('e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Easter Sunday Service', 'Special celebration of the resurrection.', '2024-03-31 09:00:00-06', '2024-03-31 12:00:00-06', false, 'Main Sanctuary', 'service');

-- ============================================
-- TASKS (Active follow-ups and to-dos)
-- ============================================
INSERT INTO tasks (id, church_id, person_id, title, description, due_date, completed, priority, category, assigned_to, created_at)
VALUES
  ('g1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c21ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Follow up with first-time visitor Stephanie', 'Send welcome email and invite to young adults group.', '2024-01-22', false, 'high', 'follow-up', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-08 10:00:00-06'),
  ('g2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c22ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Connect Ryan with small groups', 'He''s new to area and looking for community. Send small group info.', '2024-01-23', false, 'high', 'follow-up', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-15 11:30:00-06'),
  ('g3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c23ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Send children''s ministry info to Michelle', 'Has kids ages 5 and 8. Share VBS and Sunday school details.', '2024-01-24', false, 'medium', 'follow-up', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-21 14:00:00-06'),
  ('g4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c20ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Check in with Kevin Walker', 'Going through divorce. See how he''s doing and if he needs support.', '2024-01-25', false, 'high', 'care', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-18 09:00:00-06'),
  ('g5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c14ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Invite Jessica to serve', 'She expressed interest in getting involved. Connect with ministry leaders.', '2024-01-26', false, 'medium', 'outreach', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-10 15:00:00-06'),
  ('g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'Prepare for Elder Meeting', 'Compile reports and agenda for Feb 6 meeting.', '2024-02-04', false, 'medium', 'admin', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-20 10:00:00-06'),
  ('g7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'Finalize Youth Retreat logistics', 'Confirm transportation, meals, and speaker schedule.', '2024-02-10', false, 'high', 'admin', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-15 13:00:00-06'),
  ('g8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c18ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Connect Nicole with single parents ministry', 'She mentioned needing community with other single moms.', '2024-01-28', false, 'medium', 'care', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-12 11:00:00-06'),
  -- Completed tasks
  ('g9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c24ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Send thank you to Jason for Christmas Eve visit', 'Personal note thanking him for joining us.', '2024-01-05', true, 'low', 'follow-up', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2023-12-26 09:00:00-06'),
  ('g10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'Order new welcome packets', 'Running low on visitor welcome materials.', '2024-01-15', true, 'medium', 'admin', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-08 14:00:00-06');

-- Update completed_at for completed tasks
UPDATE tasks SET completed_at = '2024-01-04 10:00:00-06' WHERE id = 'g9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
UPDATE tasks SET completed_at = '2024-01-14 16:30:00-06' WHERE id = 'g10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================
-- INTERACTIONS (Notes and communication history)
-- ============================================
INSERT INTO interactions (id, church_id, person_id, type, content, created_by, created_by_name, created_at)
VALUES
  ('h1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c21ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note', 'First visit today! She found us through a friend. Works as a nurse at the hospital. Seems interested in the young adults group.', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pastor James Anderson', '2024-01-07 12:30:00-06'),
  ('h2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c22ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note', 'Second visit. Moved here from Chicago for work. Looking for a church home and community.', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mary Thompson', '2024-01-14 13:00:00-06'),
  ('h3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c22ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'email', 'Sent welcome email with information about our church and small groups. Included link to new member class registration.', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mary Thompson', '2024-01-15 10:00:00-06'),
  ('h4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c20ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'call', 'Called to check in. Divorce was finalized last month. He appreciated the call. Connected him with the men''s breakfast group for support.', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pastor James Anderson', '2024-01-10 14:00:00-06'),
  ('h5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note', 'Sarah shared that she just got engaged! Planning to marry in June. Asked about using the church for the wedding.', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mary Thompson', '2024-01-07 11:00:00-06'),
  ('h6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note', 'Chris has been doing excellent work on the tech team. He''s learned the soundboard quickly. Considering training him to lead the team.', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lisa Chen', '2024-01-14 15:30:00-06'),
  ('h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c18ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visit', 'Stopped by Nicole''s home to drop off meal from care team. She''s been struggling with work schedule and childcare. Tyler is adjusting well to Sunday school.', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mary Thompson', '2024-01-12 17:00:00-06'),
  ('h8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note', 'Robert mentioned he''ll be traveling for work in February. Will miss 2 weeks of Bible study. Patricia will lead in his absence.', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pastor James Anderson', '2024-01-16 09:30:00-06'),
  ('h9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c23ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'note', 'First visit with her two kids. They loved the children''s ministry! She seemed relieved to have found a welcoming church.', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chris Martinez', '2024-01-21 12:00:00-06'),
  ('h10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c14ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'text', 'Texted Jessica about volunteer opportunities. She replied she''s interested in hospitality or greeting team. Connecting her with Michael Johnson.', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mary Thompson', '2024-01-18 11:30:00-06');

-- ============================================
-- PRAYER REQUESTS
-- ============================================
INSERT INTO prayer_requests (id, church_id, person_id, content, is_private, is_answered, testimony, created_at)
VALUES
  ('i1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c20ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Going through a difficult divorce. Pray for peace and wisdom during this transition, and that I can maintain a good relationship with my kids.', true, false, NULL, '2024-01-08 10:00:00-06'),
  ('i2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c18ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Struggling as a single mom with work-life balance. Need wisdom for a better work schedule and reliable childcare.', false, false, NULL, '2024-01-10 14:30:00-06'),
  ('i3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'My sister was just diagnosed with breast cancer. Praying for healing and for peace for our whole family.', false, false, NULL, '2024-01-15 09:00:00-06'),
  ('i4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c13ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Considering a career change. Praying for direction about whether to pursue missions work full-time.', false, false, NULL, '2024-01-12 16:00:00-06'),
  ('i5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Praise! God answered our prayers - we found the perfect wedding venue! Now praying for wisdom in wedding planning.', false, true, 'We had been looking for months and finally found a beautiful venue within our budget!', '2024-01-05 11:00:00-06'),
  ('i6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Waiting on test results from my doctor. Pray for good news and that any issues are minor and treatable.', true, false, NULL, '2024-01-18 08:30:00-06'),
  ('i7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pray for our youth ministry - that the winter retreat would be transformative for our students and that many would grow in their faith.', false, false, NULL, '2024-01-20 10:00:00-06');

-- ============================================
-- ATTENDANCE RECORDS (Last 4 Sundays)
-- ============================================
INSERT INTO attendance (church_id, person_id, event_type, event_name, date, checked_in_at)
SELECT
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  p.id,
  'sunday',
  'Sunday Worship Service',
  d.date,
  d.date + TIME '10:00:00'
FROM people p
CROSS JOIN (
  SELECT DATE '2024-01-07' as date UNION ALL
  SELECT DATE '2024-01-14' UNION ALL
  SELECT DATE '2024-01-21' UNION ALL
  SELECT DATE '2023-12-31'
) d
WHERE p.church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND p.status IN ('leader', 'member')
  AND random() > 0.15;  -- 85% attendance for members/leaders

-- Add some regular attenders (70% attendance)
INSERT INTO attendance (church_id, person_id, event_type, event_name, date, checked_in_at)
SELECT
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  p.id,
  'sunday',
  'Sunday Worship Service',
  d.date,
  d.date + TIME '10:05:00'
FROM people p
CROSS JOIN (
  SELECT DATE '2024-01-07' as date UNION ALL
  SELECT DATE '2024-01-14' UNION ALL
  SELECT DATE '2024-01-21'
) d
WHERE p.church_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND p.status = 'regular'
  AND random() > 0.3
ON CONFLICT DO NOTHING;

-- ============================================
-- GIVING RECORDS (Sample donations)
-- ============================================
INSERT INTO giving (church_id, person_id, amount, fund, date, method, is_recurring, note)
VALUES
  -- Regular tithers
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 500.00, 'tithe', '2024-01-07', 'online', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 500.00, 'tithe', '2024-01-14', 'online', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 500.00, 'tithe', '2024-01-21', 'online', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 350.00, 'tithe', '2024-01-07', 'online', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 350.00, 'tithe', '2024-01-14', 'online', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 350.00, 'tithe', '2024-01-21', 'online', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 200.00, 'tithe', '2024-01-07', 'check', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 200.00, 'tithe', '2024-01-21', 'check', true, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 150.00, 'tithe', '2024-01-14', 'online', false, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 100.00, 'tithe', '2024-01-07', 'online', false, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 100.00, 'tithe', '2024-01-21', 'online', false, NULL),
  -- Special offerings
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 250.00, 'missions', '2024-01-14', 'online', false, 'Annual missions offering'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 100.00, 'missions', '2024-01-14', 'check', false, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 75.00, 'missions', '2024-01-14', 'cash', false, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c15ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50.00, 'building', '2024-01-21', 'online', false, 'Building fund contribution'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 25.00, 'offering', '2024-01-07', 'cash', false, NULL),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50.00, 'offering', '2024-01-14', 'online', false, NULL);

-- ============================================
-- Summary
-- ============================================
-- Church: 1 (Grace Community Church)
-- Staff Users: 4
-- People: 25 (5 leaders, 10 members, 5 regular, 5 visitors)
-- Small Groups: 5
-- Group Memberships: 21
-- Calendar Events: 8
-- Tasks: 10 (8 pending, 2 completed)
-- Interactions: 10
-- Prayer Requests: 7
-- Attendance Records: ~75 (dynamic based on random)
-- Giving Records: 17
