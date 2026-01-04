import { EmailTemplate } from '../types';

export const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Visitor',
    subject: 'Welcome to Grace Community Church!',
    body: `Dear {{firstName}},

Thank you so much for visiting Grace Community Church this past Sunday! We were so glad to have you with us.

We would love to help you get connected. Here are a few ways to learn more about our community:
- Join us for our Sunday services at 9:00 AM or 11:00 AM
- Check out our small groups that meet throughout the week
- Follow us on social media for updates and encouragement

If you have any questions or would like to learn more, please don't hesitate to reach out. We're here to help!

Looking forward to seeing you again soon.

Blessings,
The Grace Community Team`,
    category: 'welcome'
  },
  {
    id: '2',
    name: 'First-Time Follow Up',
    subject: 'Great to Meet You!',
    body: `Hi {{firstName}},

It was wonderful meeting you on Sunday! I hope you felt welcomed and blessed by your time with us.

I wanted to personally reach out and see if you have any questions about our church or how you can get involved. We have many opportunities to connect, serve, and grow in your faith.

Would you be interested in grabbing coffee sometime this week? I'd love to hear more about you and share what God is doing at Grace Community.

Let me know what works for your schedule!

Warmly,
{{senderName}}`,
    category: 'follow-up'
  },
  {
    id: '3',
    name: 'Missing You',
    subject: "We've Missed You!",
    body: `Dear {{firstName}},

We noticed you haven't been with us for a little while, and we just wanted you to know that you're missed!

Life gets busy, and we understand. But we want you to know that you're always welcome at Grace Community. Your presence matters to us and to our church family.

Is there anything we can do to support you or pray for you? Please don't hesitate to reach out.

We hope to see you soon!

With care,
The Grace Community Team`,
    category: 'care'
  },
  {
    id: '4',
    name: 'Event Invitation',
    subject: "You're Invited: {{eventName}}",
    body: `Hi {{firstName}},

We have an exciting event coming up and we'd love for you to join us!

{{eventName}}
Date: {{eventDate}}
Time: {{eventTime}}
Location: {{eventLocation}}

{{eventDescription}}

We hope you can make it! Feel free to bring friends and family.

Please RSVP by replying to this email or contacting the church office.

See you there!

Grace Community Church`,
    category: 'event'
  },
  {
    id: '5',
    name: 'Birthday Greeting',
    subject: 'Happy Birthday, {{firstName}}! 🎂',
    body: `Dear {{firstName}},

Happy Birthday! We hope your special day is filled with joy, love, and wonderful moments with family and friends.

May God bless you abundantly in this new year of life. We're so grateful to have you as part of our church family!

"The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you." - Numbers 6:24-25

Celebrating you today!

Your Grace Community Family`,
    category: 'care'
  },
  {
    id: '6',
    name: 'Prayer Request Follow-Up',
    subject: 'Praying for You',
    body: `Dear {{firstName}},

I wanted to reach out and let you know that we've been praying for your request. Your needs are important to us, and we're lifting you up before the Lord.

Please know that you don't have to walk through this alone. Our church family is here to support you in any way we can.

If you'd like to talk or if there's anything else we can do, please don't hesitate to reach out. We're here for you.

"Cast all your anxiety on him because he cares for you." - 1 Peter 5:7

In His love,
{{senderName}}`,
    category: 'care'
  },
  {
    id: '7',
    name: 'Small Group Invitation',
    subject: 'Join Our Small Group!',
    body: `Hi {{firstName}},

I wanted to personally invite you to join our small group! Small groups are a wonderful way to build deeper relationships, study the Bible together, and support one another in our faith journeys.

Group Details:
- Day: {{groupDay}}
- Time: {{groupTime}}
- Location: {{groupLocation}}

We're a friendly group and would love to have you! No pressure - come check us out and see if it's a good fit.

Let me know if you have any questions or need more information.

Hope to see you there!

{{senderName}}`,
    category: 'general'
  },
  {
    id: '8',
    name: 'Thank You for Serving',
    subject: 'Thank You for Your Service!',
    body: `Dear {{firstName}},

I wanted to take a moment to thank you for serving at Grace Community Church. Your dedication and heart for service make such a difference in our community.

"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms." - 1 Peter 4:10

We truly appreciate everything you do. Your time, talents, and energy help us fulfill our mission and bless so many people.

Thank you for being such an important part of our team!

With gratitude,
{{senderName}}`,
    category: 'general'
  }
];
