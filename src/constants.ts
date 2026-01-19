import { Person, Task, SmallGroup, PrayerRequest, Interaction, Attendance, CalendarEvent, Giving } from './types';

// Helper to get dates relative to today
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const daysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};
const daysFromNow = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};
// For birthdays - same month/day, different year
const birthdayToday = () => {
  const d = new Date(today);
  d.setFullYear(d.getFullYear() - 35); // 35 years old
  return formatDate(d);
};
const birthdayInDays = (days: number, yearsOld: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  d.setFullYear(d.getFullYear() - yearsOld);
  return formatDate(d);
};

export const SAMPLE_PEOPLE: Person[] = [
  // ===== BIRTHDAYS TODAY =====
  {
    id: '1',
    firstName: 'Amanda',
    lastName: 'Richardson',
    email: 'amanda.richardson@email.com',
    phone: '(555) 101-0001',
    status: 'member',
    birthDate: birthdayToday(),
    joinDate: '2020-03-15',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    tags: ['worship-team', 'volunteer'],
    smallGroups: ['1'],
    notes: 'Birthday today! Serves on worship team as vocalist. Very encouraging to others.'
  },
  {
    id: '2',
    firstName: 'Marcus',
    lastName: 'Thompson',
    email: 'marcus.t@email.com',
    phone: '(555) 101-0002',
    status: 'leader',
    birthDate: birthdayToday(),
    joinDate: '2018-06-01',
    address: '456 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    tags: ['elder', 'small-group-leader', 'teacher'],
    smallGroups: ['2'],
    notes: 'Birthday today! Elder and small group leader. Teaches adult Sunday school.'
  },

  // ===== BIRTHDAYS THIS WEEK =====
  {
    id: '3',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@email.com',
    phone: '(555) 101-0003',
    status: 'member',
    birthDate: birthdayInDays(2, 42),
    joinDate: '2019-09-22',
    address: '789 Pine Road',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    tags: ['womens-ministry', 'hospitality'],
    smallGroups: ['3'],
    notes: 'Birthday in 2 days. Leads hospitality team. Great at organizing events.'
  },
  {
    id: '4',
    firstName: 'Christopher',
    lastName: 'Martinez',
    email: 'chris.martinez@email.com',
    phone: '(555) 101-0004',
    status: 'regular',
    birthDate: birthdayInDays(5, 28),
    firstVisit: '2024-06-15',
    address: '321 Elm Court',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    tags: ['young-adult', 'tech-savvy'],
    smallGroups: ['1'],
    notes: 'Birthday this week. Recently started attending regularly. Works in IT.'
  },

  // ===== ANNIVERSARY THIS WEEK (Member anniversary) =====
  {
    id: '5',
    firstName: 'Patricia',
    lastName: 'Anderson',
    email: 'patricia.a@email.com',
    phone: '(555) 101-0005',
    status: 'member',
    birthDate: '1975-08-20',
    joinDate: daysFromNow(3), // Anniversary in 3 days (joined X years ago)
    address: '654 Birch Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    tags: ['prayer-team', 'intercessor'],
    smallGroups: ['3'],
    notes: '5-year member anniversary coming up! Faithful prayer warrior.'
  },

  // ===== NEW VISITORS (Need follow-up) =====
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 101-0006',
    status: 'visitor',
    firstVisit: daysAgo(2),
    address: '987 Cedar Drive',
    city: 'Springfield',
    state: 'IL',
    zip: '62706',
    tags: ['first-time', 'young-adult'],
    smallGroups: [],
    notes: 'First-time visitor 2 days ago. Came with friend Maria. Very interested in community.'
  },
  {
    id: '7',
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel.kim@email.com',
    phone: '(555) 101-0007',
    status: 'visitor',
    firstVisit: daysAgo(5),
    address: '147 Walnut Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    tags: ['first-time', 'family'],
    smallGroups: [],
    notes: 'Visited last week with wife and 2 kids. Looking for family-friendly church.'
  },
  {
    id: '8',
    firstName: 'Michelle',
    lastName: 'Rodriguez',
    email: 'michelle.r@email.com',
    phone: '(555) 101-0008',
    status: 'visitor',
    firstVisit: daysAgo(1),
    address: '258 Spruce Way',
    city: 'Springfield',
    state: 'IL',
    zip: '62708',
    tags: ['first-time'],
    smallGroups: [],
    notes: 'Visited yesterday. Recently moved to area. Seeking church home.'
  },

  // ===== INACTIVE MEMBERS (Need outreach) =====
  {
    id: '9',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.j@email.com',
    phone: '(555) 101-0009',
    status: 'inactive',
    birthDate: '1992-04-12',
    joinDate: '2022-01-10',
    address: '369 Ash Boulevard',
    city: 'Springfield',
    state: 'IL',
    zip: '62709',
    tags: [],
    smallGroups: [],
    notes: 'Inactive 6 weeks. Mentioned job stress in last conversation. Needs pastoral care.'
  },
  {
    id: '10',
    firstName: 'William',
    lastName: 'Taylor',
    email: 'will.taylor@email.com',
    phone: '(555) 101-0010',
    status: 'inactive',
    birthDate: '1985-11-30',
    joinDate: '2021-05-20',
    address: '741 Hickory Place',
    city: 'Springfield',
    state: 'IL',
    zip: '62710',
    tags: ['former-volunteer'],
    smallGroups: [],
    notes: 'Inactive 8 weeks. Used to volunteer in parking team. Health issues mentioned.'
  },
  {
    id: '11',
    firstName: 'Rachel',
    lastName: 'Brown',
    email: 'rachel.b@email.com',
    phone: '(555) 101-0011',
    status: 'inactive',
    birthDate: '1998-07-25',
    joinDate: '2023-02-14',
    address: '852 Willow Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62711',
    tags: ['young-adult'],
    smallGroups: [],
    notes: 'Inactive 4 weeks. College student - may be related to school schedule.'
  },

  // ===== ACTIVE MEMBERS =====
  {
    id: '12',
    firstName: 'James',
    lastName: 'Peterson',
    email: 'james.p@email.com',
    phone: '(555) 101-0012',
    status: 'member',
    birthDate: '1978-03-18',
    joinDate: '2023-06-15',
    address: '963 Poplar Road',
    city: 'Springfield',
    state: 'IL',
    zip: '62712',
    tags: ['volunteer', 'greeter', 'parking-team'],
    smallGroups: ['2'],
    notes: 'Faithful greeter every Sunday. Always has a warm smile for visitors.'
  },
  {
    id: '13',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '(555) 101-0013',
    status: 'regular',
    birthDate: '1995-12-05',
    firstVisit: '2024-08-10',
    address: '174 Chestnut Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62713',
    tags: ['young-adult', 'inviter'],
    smallGroups: ['1'],
    notes: 'Brought friend Sarah to church. Very social and welcoming personality.'
  },
  {
    id: '14',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@email.com',
    phone: '(555) 101-0014',
    status: 'leader',
    birthDate: '1970-09-08',
    joinDate: '2020-03-01',
    address: '285 Sycamore Avenue',
    city: 'Springfield',
    state: 'IL',
    zip: '62714',
    tags: ['elder', 'small-group-leader', 'counselor'],
    smallGroups: ['2'],
    notes: 'Elder. Leads Tuesday night men\'s group. Licensed counselor - helps with pastoral care.'
  },
  {
    id: '15',
    firstName: 'David',
    lastName: 'Williams',
    email: 'david.w@email.com',
    phone: '(555) 101-0015',
    status: 'member',
    birthDate: '1988-06-22',
    joinDate: '2021-09-20',
    address: '396 Magnolia Court',
    city: 'Springfield',
    state: 'IL',
    zip: '62715',
    tags: ['worship-team', 'musician', 'audio-visual'],
    smallGroups: ['1'],
    notes: 'Lead guitarist on worship team. Also helps with sound board.'
  },
  {
    id: '16',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'lisa.t@email.com',
    phone: '(555) 101-0016',
    status: 'visitor',
    birthDate: '1983-02-14',
    firstVisit: daysAgo(7),
    address: '507 Redwood Drive',
    city: 'Springfield',
    state: 'IL',
    zip: '62716',
    tags: ['first-time', 'family'],
    smallGroups: [],
    notes: 'Second-time visitor. Has 2 kids (ages 5, 8). Kids loved children\'s ministry.'
  },
  {
    id: '17',
    firstName: 'Michael',
    lastName: 'Clark',
    email: 'michael.clark@email.com',
    phone: '(555) 101-0017',
    status: 'member',
    birthDate: '1965-10-31',
    joinDate: '2019-11-15',
    address: '618 Dogwood Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62717',
    tags: ['deacon', 'finance-team', 'facilities'],
    smallGroups: ['2'],
    notes: 'Deacon serving on finance committee. Also oversees building maintenance.'
  },
  {
    id: '18',
    firstName: 'Jessica',
    lastName: 'Lee',
    email: 'jessica.lee@email.com',
    phone: '(555) 101-0018',
    status: 'member',
    birthDate: '1990-01-20',
    joinDate: '2022-04-10',
    address: '729 Juniper Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62718',
    tags: ['childrens-ministry', 'teacher', 'creative'],
    smallGroups: ['3'],
    notes: 'Teaches 3rd-4th grade Sunday school. Very creative with lessons.'
  },
  {
    id: '19',
    firstName: 'Andrew',
    lastName: 'Wilson',
    email: 'andrew.w@email.com',
    phone: '(555) 101-0019',
    status: 'regular',
    birthDate: '1993-05-17',
    firstVisit: '2024-10-01',
    address: '840 Hawthorn Road',
    city: 'Springfield',
    state: 'IL',
    zip: '62719',
    tags: ['young-adult', 'newcomer'],
    smallGroups: ['1'],
    notes: 'Attending regularly since October. Recently joined young adults small group.'
  },
  {
    id: '20',
    firstName: 'Elizabeth',
    lastName: 'Moore',
    email: 'elizabeth.m@email.com',
    phone: '(555) 101-0020',
    status: 'member',
    birthDate: '1958-12-25',
    joinDate: '2015-08-01',
    address: '951 Laurel Avenue',
    city: 'Springfield',
    state: 'IL',
    zip: '62720',
    tags: ['senior', 'prayer-team', 'mentor'],
    smallGroups: ['3'],
    notes: 'Long-time member. Mentors younger women. Faithful prayer warrior.'
  },
  {
    id: '21',
    firstName: 'Kevin',
    lastName: 'Harris',
    email: 'kevin.h@email.com',
    phone: '(555) 101-0021',
    status: 'member',
    birthDate: '1982-08-08',
    joinDate: '2020-01-15',
    address: '162 Cypress Court',
    city: 'Springfield',
    state: 'IL',
    zip: '62721',
    tags: ['missions', 'outreach', 'evangelist'],
    smallGroups: ['2'],
    notes: 'Passionate about local outreach. Leads monthly community service projects.'
  },
  {
    id: '22',
    firstName: 'Stephanie',
    lastName: 'White',
    email: 'stephanie.w@email.com',
    phone: '(555) 101-0022',
    status: 'member',
    birthDate: '1987-04-02',
    joinDate: '2021-03-20',
    address: '273 Locust Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62722',
    tags: ['worship-team', 'vocalist', 'choir'],
    smallGroups: ['1'],
    notes: 'Alto vocalist on worship team. Also sings in community choir.'
  },
  {
    id: '23',
    firstName: 'Brian',
    lastName: 'Jackson',
    email: 'brian.j@email.com',
    phone: '(555) 101-0023',
    status: 'leader',
    birthDate: '1975-11-11',
    joinDate: '2017-09-01',
    address: '384 Beech Boulevard',
    city: 'Springfield',
    state: 'IL',
    zip: '62723',
    tags: ['deacon', 'small-group-leader', 'mens-ministry'],
    smallGroups: ['2'],
    notes: 'Deacon. Leads men\'s accountability group. Works as high school coach.'
  },
  {
    id: '24',
    firstName: 'Nicole',
    lastName: 'Martin',
    email: 'nicole.m@email.com',
    phone: '(555) 101-0024',
    status: 'regular',
    birthDate: '1996-07-07',
    firstVisit: '2024-09-15',
    address: '495 Cherry Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62724',
    tags: ['young-adult', 'single', 'professional'],
    smallGroups: ['1'],
    notes: 'New to area for work. Looking for community. Works as nurse.'
  },
  {
    id: '25',
    firstName: 'Thomas',
    lastName: 'Scott',
    email: 'thomas.s@email.com',
    phone: '(555) 101-0025',
    status: 'member',
    birthDate: '1962-03-30',
    joinDate: '2016-06-01',
    address: '606 Mulberry Road',
    city: 'Springfield',
    state: 'IL',
    zip: '62725',
    tags: ['usher', 'security', 'greeter'],
    smallGroups: ['2'],
    notes: 'Head usher. Former police officer. Helps with church security planning.'
  },
  {
    id: '26',
    firstName: 'Ashley',
    lastName: 'Young',
    email: 'ashley.y@email.com',
    phone: '(555) 101-0026',
    status: 'member',
    birthDate: '1991-09-19',
    joinDate: '2022-07-04',
    address: '717 Alder Way',
    city: 'Springfield',
    state: 'IL',
    zip: '62726',
    tags: ['media-team', 'social-media', 'creative'],
    smallGroups: ['1'],
    notes: 'Manages church social media. Very creative with graphics and video.'
  },
  {
    id: '27',
    firstName: 'Jonathan',
    lastName: 'Adams',
    email: 'jonathan.a@email.com',
    phone: '(555) 101-0027',
    status: 'member',
    birthDate: '1980-06-15',
    joinDate: '2019-02-14',
    address: '828 Fir Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62727',
    tags: ['youth-leader', 'volunteer', 'mentor'],
    smallGroups: ['2'],
    notes: 'Youth group volunteer. Great rapport with teenagers. Works as teacher.'
  },
  {
    id: '28',
    firstName: 'Megan',
    lastName: 'Hall',
    email: 'megan.h@email.com',
    phone: '(555) 101-0028',
    status: 'regular',
    birthDate: '1994-02-28',
    firstVisit: '2024-11-10',
    address: '939 Hemlock Court',
    city: 'Springfield',
    state: 'IL',
    zip: '62728',
    tags: ['young-adult', 'engaged'],
    smallGroups: ['3'],
    notes: 'Recently engaged. Looking for premarital counseling. Very enthusiastic.'
  },
  {
    id: '29',
    firstName: 'Gregory',
    lastName: 'King',
    email: 'greg.king@email.com',
    phone: '(555) 101-0029',
    status: 'member',
    birthDate: '1972-12-01',
    joinDate: '2018-04-22',
    address: '140 Linden Drive',
    city: 'Springfield',
    state: 'IL',
    zip: '62729',
    tags: ['finance-team', 'accountant', 'giving-champion'],
    smallGroups: ['2'],
    notes: 'CPA who helps with church finances. Very generous giver. Quiet but faithful.'
  },
  {
    id: '30',
    firstName: 'Rebecca',
    lastName: 'Wright',
    email: 'rebecca.w@email.com',
    phone: '(555) 101-0030',
    status: 'member',
    birthDate: birthdayInDays(1, 45),
    joinDate: '2020-10-18',
    address: '251 Pecan Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62730',
    tags: ['womens-ministry', 'hospitality', 'coordinator'],
    smallGroups: ['3'],
    notes: 'Birthday tomorrow! Coordinates women\'s ministry events. Excellent organizer.'
  },
];

export const SAMPLE_TASKS: Task[] = [
  // HIGH PRIORITY - Overdue
  {
    id: '1',
    personId: '9',
    title: 'Care call for Emily Johnson',
    description: 'Inactive 6 weeks. Mentioned job stress. Check in and offer support.',
    dueDate: daysAgo(3),
    completed: false,
    priority: 'high',
    category: 'care',
    createdAt: daysAgo(10)
  },
  {
    id: '2',
    personId: '10',
    title: 'Follow up with William Taylor',
    description: 'Inactive 8 weeks. Health issues mentioned. Send care package.',
    dueDate: daysAgo(2),
    completed: false,
    priority: 'high',
    category: 'care',
    createdAt: daysAgo(7)
  },
  // HIGH PRIORITY - Due today/soon
  {
    id: '3',
    personId: '6',
    title: 'Welcome call to Sarah Mitchell',
    description: 'First-time visitor 2 days ago. Send welcome email and invite to coffee.',
    dueDate: formatDate(today),
    completed: false,
    priority: 'high',
    category: 'follow-up',
    createdAt: daysAgo(2)
  },
  {
    id: '4',
    personId: '8',
    title: 'Connect with Michelle Rodriguez',
    description: 'Visited yesterday. New to area. Help her find community.',
    dueDate: daysFromNow(1),
    completed: false,
    priority: 'high',
    category: 'follow-up',
    createdAt: daysAgo(1)
  },
  {
    id: '5',
    personId: '1',
    title: 'Send birthday message to Amanda Richardson',
    description: 'Birthday today! Send personalized message and maybe coordinate team card.',
    dueDate: formatDate(today),
    completed: false,
    priority: 'high',
    category: 'care',
    createdAt: daysAgo(7)
  },
  {
    id: '6',
    personId: '2',
    title: 'Birthday celebration for Marcus Thompson',
    description: 'Elder birthday today. Coordinate recognition in service.',
    dueDate: formatDate(today),
    completed: false,
    priority: 'high',
    category: 'care',
    createdAt: daysAgo(7)
  },
  // MEDIUM PRIORITY
  {
    id: '7',
    personId: '7',
    title: 'Connect Daniel Kim with kids ministry',
    description: 'Visitor with 2 kids. Introduce to children\'s pastor.',
    dueDate: daysFromNow(2),
    completed: false,
    priority: 'medium',
    category: 'follow-up',
    createdAt: daysAgo(5)
  },
  {
    id: '8',
    personId: '16',
    title: 'Second follow-up with Lisa Thompson',
    description: 'Second-time visitor with family. Invite to newcomers lunch.',
    dueDate: daysFromNow(3),
    completed: false,
    priority: 'medium',
    category: 'follow-up',
    createdAt: daysAgo(7)
  },
  {
    id: '9',
    personId: '11',
    title: 'Check on Rachel Brown',
    description: 'Inactive college student. May need support with school/life balance.',
    dueDate: daysFromNow(2),
    completed: false,
    priority: 'medium',
    category: 'care',
    createdAt: daysAgo(4)
  },
  {
    id: '10',
    personId: '3',
    title: 'Birthday prep for Jennifer Davis',
    description: 'Birthday in 2 days. Coordinate hospitality team recognition.',
    dueDate: daysFromNow(1),
    completed: false,
    priority: 'medium',
    category: 'care',
    createdAt: daysAgo(5)
  },
  {
    id: '11',
    personId: '5',
    title: 'Plan anniversary recognition for Patricia Anderson',
    description: '5-year member anniversary. Plan special acknowledgment.',
    dueDate: daysFromNow(2),
    completed: false,
    priority: 'medium',
    category: 'admin',
    createdAt: daysAgo(3)
  },
  {
    id: '12',
    personId: '28',
    title: 'Schedule premarital counseling for Megan Hall',
    description: 'Recently engaged. Connect with pastoral team for counseling.',
    dueDate: daysFromNow(5),
    completed: false,
    priority: 'medium',
    category: 'care',
    createdAt: daysAgo(2)
  },
  // LOW PRIORITY
  {
    id: '13',
    title: 'Prepare monthly giving report',
    description: 'Compile giving data for elder meeting next week.',
    dueDate: daysFromNow(7),
    completed: false,
    priority: 'low',
    category: 'admin',
    createdAt: daysAgo(3)
  },
  {
    id: '14',
    title: 'Update small group directory',
    description: 'Add new members and update contact info.',
    dueDate: daysFromNow(10),
    completed: false,
    priority: 'low',
    category: 'admin',
    createdAt: daysAgo(1)
  },
  {
    id: '15',
    personId: '19',
    title: 'Check in with Andrew Wilson',
    description: 'New to small group. See how integration is going.',
    dueDate: daysFromNow(4),
    completed: false,
    priority: 'low',
    category: 'follow-up',
    createdAt: daysAgo(2)
  },
  // COMPLETED
  {
    id: '16',
    personId: '13',
    title: 'Thank Maria for bringing guest',
    description: 'She brought Sarah to service. Send appreciation note.',
    dueDate: daysAgo(1),
    completed: true,
    priority: 'medium',
    category: 'outreach',
    createdAt: daysAgo(3)
  },
  {
    id: '17',
    personId: '24',
    title: 'Welcome Nicole Martin to community',
    description: 'New to area for work. Sent welcome basket.',
    dueDate: daysAgo(5),
    completed: true,
    priority: 'high',
    category: 'follow-up',
    createdAt: daysAgo(10)
  },
];

export const SAMPLE_GROUPS: SmallGroup[] = [
  {
    id: '1',
    name: 'Young Adults Community',
    description: 'Life, faith, and fellowship for 20s and 30s. We meet weekly for Bible study, discussion, and community.',
    leaderId: '15',
    meetingDay: 'Thursday',
    meetingTime: '7:00 PM',
    location: 'Coffee House Downtown',
    members: ['1', '4', '13', '15', '19', '22', '24', '26'],
    isActive: true
  },
  {
    id: '2',
    name: 'Men of Faith',
    description: 'Men\'s Bible study and accountability group. Iron sharpens iron.',
    leaderId: '14',
    meetingDay: 'Tuesday',
    meetingTime: '6:30 AM',
    location: 'Room 201',
    members: ['2', '12', '14', '17', '21', '23', '25', '27', '29'],
    isActive: true
  },
  {
    id: '3',
    name: 'Women of Grace',
    description: 'Women\'s ministry group focused on Bible study, prayer, and supporting one another.',
    leaderId: '3',
    meetingDay: 'Wednesday',
    meetingTime: '9:30 AM',
    location: 'Fellowship Hall',
    members: ['3', '5', '18', '20', '28', '30'],
    isActive: true
  }
];

export const SAMPLE_PRAYERS: PrayerRequest[] = [
  {
    id: '1',
    personId: '9',
    content: 'Please pray for guidance in my job search. Feeling overwhelmed and discouraged.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14)
  },
  {
    id: '2',
    personId: '10',
    content: 'Praying for healing from recent health issues. Doctors are still running tests.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21)
  },
  {
    id: '3',
    personId: '12',
    content: 'Thankful for my mother\'s successful surgery. Praying for quick recovery.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5)
  },
  {
    id: '4',
    personId: '17',
    content: 'Wisdom needed for a difficult family decision regarding elderly parents.',
    isPrivate: true,
    isAnswered: true,
    testimony: 'God provided clarity through counsel from Pastor and peace in prayer. Family is unified.',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10)
  },
  {
    id: '5',
    personId: '24',
    content: 'New to the area and feeling lonely. Praying for meaningful friendships.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7)
  },
  {
    id: '6',
    personId: '28',
    content: 'Excited but nervous about upcoming wedding. Praying for wisdom in planning and for our marriage.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
  },
  {
    id: '7',
    personId: '21',
    content: 'Praying for the upcoming community outreach event - that many would hear the gospel.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },
  {
    id: '8',
    personId: '27',
    content: 'Asking for prayers for my students - several are going through difficult situations at home.',
    isPrivate: false,
    isAnswered: false,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4)
  },
];

export const SAMPLE_INTERACTIONS: Interaction[] = [
  {
    id: '1',
    personId: '6',
    type: 'note',
    content: 'First visit! Came with Maria Garcia. Very engaged during service. Asked about small groups and young adult community.',
    createdAt: daysAgo(2),
    createdBy: 'Pastor John'
  },
  {
    id: '2',
    personId: '9',
    type: 'call',
    content: 'Called to check in. Emily shared she\'s been stressed with job situation - was laid off 2 months ago. Prayed together. She seemed appreciative but tired.',
    createdAt: daysAgo(14),
    createdBy: 'Pastor John'
  },
  {
    id: '3',
    personId: '8',
    type: 'note',
    content: 'First-time visitor. Recently relocated from Chicago for new job. Looking for church community. Very warm and friendly.',
    createdAt: daysAgo(1),
    createdBy: 'Welcome Team'
  },
  {
    id: '4',
    personId: '7',
    type: 'note',
    content: 'Family of 4 visited. Kids (ages 6 and 9) loved children\'s ministry. Parents mentioned looking for family-friendly church with strong kids program.',
    createdAt: daysAgo(5),
    createdBy: 'Welcome Team'
  },
  {
    id: '5',
    personId: '10',
    type: 'email',
    content: 'Sent get-well card and church care package. William replied thanking us and mentioned he hopes to return soon after recovery.',
    createdAt: daysAgo(10),
    createdBy: 'Care Team'
  },
  {
    id: '6',
    personId: '24',
    type: 'call',
    content: 'Welcome call to Nicole. She\'s a nurse who just moved for work. Invited her to young adults group - she seemed excited.',
    createdAt: daysAgo(7),
    createdBy: 'Sarah (Connections)'
  },
  {
    id: '7',
    personId: '28',
    type: 'note',
    content: 'Megan shared she recently got engaged! Very excited. Connected her with Pastor for premarital counseling information.',
    createdAt: daysAgo(3),
    createdBy: 'Women\'s Ministry'
  },
  {
    id: '8',
    personId: '16',
    type: 'note',
    content: 'Second visit! Lisa and family returned. Kids asked to come back. Parents mentioned they\'re deciding between 2-3 churches.',
    createdAt: daysAgo(7),
    createdBy: 'Welcome Team'
  },
  {
    id: '9',
    personId: '13',
    type: 'note',
    content: 'Maria brought her friend Sarah to church! So encouraging to see her inviting others. Thanked her personally.',
    createdAt: daysAgo(2),
    createdBy: 'Pastor John'
  },
  {
    id: '10',
    personId: '19',
    type: 'note',
    content: 'Andrew attended young adults for the first time. Seemed a bit shy but opened up during discussion. Others were welcoming.',
    createdAt: daysAgo(14),
    createdBy: 'David (Group Leader)'
  },
];

export const SAMPLE_ATTENDANCE: Attendance[] = [
  // Recent Sunday attendance
  { id: '1', personId: '1', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:45:00' },
  { id: '2', personId: '2', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:30:00' },
  { id: '3', personId: '12', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:50:00' },
  { id: '4', personId: '14', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:35:00' },
  { id: '5', personId: '15', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T10:00:00' },
  { id: '6', personId: '17', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:40:00' },
  { id: '7', personId: '18', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:55:00' },
  { id: '8', personId: '20', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:25:00' },
  { id: '9', personId: '21', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:45:00' },
  { id: '10', personId: '25', eventType: 'sunday', date: daysAgo(0), checkedInAt: daysAgo(0) + 'T09:15:00' },
];

export const SAMPLE_GIVING: Giving[] = [
  // Regular givers - this month
  { id: '1', personId: '2', amount: 500, fund: 'tithe', date: daysAgo(3), method: 'online', isRecurring: true },
  { id: '2', personId: '14', amount: 750, fund: 'tithe', date: daysAgo(3), method: 'check', isRecurring: true },
  { id: '3', personId: '17', amount: 400, fund: 'tithe', date: daysAgo(3), method: 'online', isRecurring: true },
  { id: '4', personId: '29', amount: 1000, fund: 'tithe', date: daysAgo(3), method: 'online', isRecurring: true },
  { id: '5', personId: '20', amount: 200, fund: 'tithe', date: daysAgo(3), method: 'check', isRecurring: true },
  { id: '6', personId: '23', amount: 350, fund: 'tithe', date: daysAgo(3), method: 'online', isRecurring: false },
  { id: '7', personId: '12', amount: 250, fund: 'tithe', date: daysAgo(3), method: 'online', isRecurring: true },
  { id: '8', personId: '1', amount: 150, fund: 'tithe', date: daysAgo(3), method: 'online', isRecurring: true },
  // Special offerings
  { id: '9', personId: '21', amount: 200, fund: 'missions', date: daysAgo(5), method: 'online', isRecurring: false },
  { id: '10', personId: '29', amount: 500, fund: 'building', date: daysAgo(7), method: 'check', isRecurring: false },
  { id: '11', personId: '17', amount: 100, fund: 'benevolence', date: daysAgo(10), method: 'cash', isRecurring: false },
  // First-time giver (good for testing)
  { id: '12', personId: '19', amount: 50, fund: 'offering', date: daysAgo(1), method: 'online', isRecurring: false, note: 'First gift!' },
  { id: '13', personId: '24', amount: 75, fund: 'tithe', date: daysAgo(2), method: 'online', isRecurring: false, note: 'First gift!' },
];

export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Sunday Worship Service',
    startDate: formatDate(today) + 'T10:00:00',
    endDate: formatDate(today) + 'T11:30:00',
    allDay: false,
    location: 'Main Sanctuary',
    category: 'service'
  },
  {
    id: '2',
    title: 'Men of Faith Bible Study',
    startDate: daysFromNow(2) + 'T06:30:00',
    endDate: daysFromNow(2) + 'T07:30:00',
    allDay: false,
    location: 'Room 201',
    category: 'small-group'
  },
  {
    id: '3',
    title: 'Women of Grace Meeting',
    startDate: daysFromNow(3) + 'T09:30:00',
    endDate: daysFromNow(3) + 'T11:00:00',
    allDay: false,
    location: 'Fellowship Hall',
    category: 'small-group'
  },
  {
    id: '4',
    title: 'Young Adults Hangout',
    startDate: daysFromNow(4) + 'T19:00:00',
    endDate: daysFromNow(4) + 'T21:00:00',
    allDay: false,
    location: 'Coffee House Downtown',
    category: 'small-group'
  },
  {
    id: '5',
    title: 'Elder Meeting',
    startDate: daysFromNow(5) + 'T18:00:00',
    endDate: daysFromNow(5) + 'T19:30:00',
    allDay: false,
    location: 'Conference Room',
    category: 'meeting'
  },
  {
    id: '6',
    title: 'Community Outreach Day',
    startDate: daysFromNow(10) + 'T09:00:00',
    endDate: daysFromNow(10) + 'T14:00:00',
    allDay: false,
    location: 'City Park',
    category: 'event',
    description: 'Serving our community with food distribution and kids activities.'
  },
  {
    id: '7',
    title: 'Newcomers Lunch',
    startDate: daysFromNow(7) + 'T12:00:00',
    endDate: daysFromNow(7) + 'T13:30:00',
    allDay: false,
    location: 'Fellowship Hall',
    category: 'event',
    description: 'Welcome lunch for new visitors and members.'
  },
];

export const STATUS_COLORS: Record<string, string> = {
  visitor: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
  regular: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400',
  member: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400',
  leader: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-dark-400'
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-dark-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
};

export const PRIORITY_COLORS_DARK: Record<string, string> = {
  low: 'bg-dark-700 text-dark-300',
  medium: 'bg-amber-500/15 text-amber-400',
  high: 'bg-red-500/15 text-red-400'
};
