/**
 * External competitive and industry reference for CrwdCtrl Brain.
 * Used alongside RAG — not a substitute for verifying internal product claims.
 */
export const COMPETITIVE_BENCHMARKS = `
CONTINUOUS LEARNING — Benchmark against these platforms when analyzing gaps, loops, monetization, and retention:

| Platform | What to learn from them |
|----------|-------------------------|
| **Meetup** | Community discovery, recurring events, organizer tools — and why it failed youth in India |
| **District** (Zomato) | Local discovery UX, metro experiences, brand distribution — campus/long-tail gap |
| **BookMyShow** | Ticketing at scale, check-in, enterprise sales — what they ignore (campus, communities) |
| **Townscript** | Event registration, Indian payments, organizer dashboards — direct competitor patterns |
| **Eventbrite** | Self-serve organizer onboarding, fee model, analytics — global playbook |
| **Reddit Communities** | Identity, belonging, UGC, moderation — community moat without transactions |
| **Strava Clubs** | Recurring fitness groups, social proof, streaks — individual vs community tension |
| **AllTrails** | Trail discovery, reviews, difficulty ratings, trust signals — trek vertical playbook |
| **Discord Communities** | Member engagement, announcements, roles — ops layer communities actually use |
| **Local discovery** (Google Maps events, Instagram, WhatsApp) | Fragmentation CrwdCtrl consolidates |

When comparing, always identify for CrwdCtrl:
- Missing features (product gaps vs benchmarks)
- Missing growth loops (supply/demand/community flywheels)
- Missing monetization (beyond 3% platform fee)
- Missing retention systems (notifications, recurring, social, gamification)
`;

export const INDUSTRY_FRAMEWORKS = `
INDUSTRY KNOWLEDGE — Apply when internal docs are silent or incomplete:

**Marketplace theory:** Solve chicken-and-egg via supply-first wedge (campus density). Liquidity = organizers × events × registrations in a geography. Single-player mode for organizers must work before network effects.

**Growth frameworks:** 
- Flywheel: organizers → events → users → proof → more organizers
- Activation: first registration in session 1
- Retention: repeat registrations + community membership
- Referral: user invites user, organizer invites organizer
- Content-led growth: FOMO recaps → discovery intent

**Community-building theory:**
- Recurring > one-off (run clubs, trek groups)
- Identity + history = switching costs
- Leaders need ops tools, members need discovery
- Third place: belonging beyond chat

**Consumer internet / platform businesses:**
- Low-frequency categories need push, email, seasonal spikes, and content hooks
- Mobile-first, India-native payments (UPI/Cashfree)
- Long-tail aggregation before head events
- Data moat at scale (pricing, attendance patterns)

**Startup best practices:**
- Validate before scale; one campus playbook before five
- Talk to 10 users per persona
- Measure north star (Monthly Active Registrations), not vanity
- Build in public for trust, sell in private for conversion
`;
