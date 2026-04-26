# BusP - Business Plan
## Система за сигнализиране на обществен транспорт Пловдив

*"Your city. Your transport. Your control."*

---

## 1. Executive Summary

BusP is a mobile-first web application designed to improve the public transport experience in Plovdiv, Bulgaria by providing a unified platform for reporting and managing incidents. The application allows passengers to report problems encountered on buses, search for lost items, and report found items. Transport companies receive real-time incident reports through a dashboard, while drivers have access to a quick-reporting portal.

The company will be registered as a Limited Liability Company (OOD) with four owners, operating on a bootstrap budget of approximately €3,000. Revenue will be generated through advertising and voluntary donations, making the app free for all passengers, drivers, and transport companies.

Plovdiv's public transport network consists of 30 bus lines operated by multiple companies, serving approximately 50,000 daily passengers. This creates a significant opportunity for a dedicated incident management platform that currently does not exist in the market.

---

## 2. Company Description

### 2.1 Business Overview

The company will operate under the name BusP as a Limited Liability Company registered in Plovdiv, Bulgaria. The business is founded by four individuals who bring together skills in technology development, marketing, and local business development.

The mission of BusP is to create transparency in public transport by enabling direct communication between passengers and transport operators. We believe that better incident reporting leads to better service, which ultimately benefits everyone in the transportation ecosystem.

### 2.2 The Problem

Currently, passengers in Plovdiv face several challenges when dealing with public transport incidents:

First, there is no unified system for reporting problems. Passengers who experience issues such as bus delays, unclean vehicles, driver behavior problems, or other incidents have no efficient way to report these to the transport company. The existing options are limited to calling customer service lines or using social media, which are neither convenient nor systematic.

Second, lost items are rarely recovered. When passengers lose belongings on buses, they have no central place to check if those items have been found. The current system of checking with drivers or at stations is fragmented and often ineffective.

Third, transport companies lack real-time feedback. Without a systematic way to collect passenger complaints and incidents, companies cannot identify patterns or address systemic issues efficiently.

Fourth, communication is fragmented. Passengers and transport companies operate in separate spheres with no effective bridge between them.

### 2.3 The Solution

BusP addresses these problems through three interconnected platforms:

The Passenger App provides a smartphone-optimized interface where users can report problems with photos and location data, search a database of found items, report items they have found on buses, and track the status of their submitted reports. All of this is available completely free of charge.

The Transport Dashboard gives transport companies access to real-time incident feeds, allowing them to manage and update the status of reports, view analytics on incident trends, maintain a centralized lost-and-found registry, and export reports for management review.

The Driver Portal enables bus drivers to quickly log incidents they encounter during their routes, with automatic GPS capture of location data and pre-filled driver information.

---

## 3. Market Analysis

### 3.1 Plovdiv Public Transport Network

Plovdiv is Bulgaria's second-largest city with a metropolitan population exceeding 400,000. The city operates 30 bus lines with a single-ride ticket at 1 BGN. Key operators include Plovdiv Bus Transport EOOD (municipal), Meritrans, KZT Златанов, and Консорциум "Градски транспорт - 2026" (10-year contract awarded March 2026).

### 3.2 Target Market

Our target market consists of several distinct segments:

The primary segment is daily bus passengers, numbering approximately 50,000 people who use the bus system regularly. Based on similar apps in other markets, we estimate achieving 10% adoption within the first year, representing 5,000 registered users. This conservative estimate allows for realistic planning while still providing a solid user base for advertising revenue.

The secondary segment includes transport companies and their drivers. There are approximately 3-4 major transport companies operating in Plovdiv, along with about 200 bus drivers who could benefit from the driver portal.

A tertiary segment includes municipal authorities responsible for transport oversight, who may be interested in aggregated data and analytics.

### 3.3 Competitive Analysis

Several existing services partially address parts of our market, but none offer a comprehensive solution:

Moovit is a popular navigation app used in Plovdiv that provides real-time schedules and route planning. However, it does not include any incident reporting functionality. Its strength is real-time data but it lacks the user engagement features needed for incident management.

Facebook groups and community forums serve as informal channels where people discuss transport issues and sometimes post about lost items. However, these are disorganized, lack workflow management, and depend on individual engagement. There is no systematic follow-up or status tracking.

The official transport.plovdiv.bg website provides static schedules and basic information but lacks mobile functionality, real-time features, and any incident reporting capabilities.

Police lost-and-found registries exist but are not specifically tied to the transport system and operate independently of the transport companies.

Our competitive advantage lies in being the first dedicated, mobile-first platform specifically designed for incident reporting in Plovdiv's transport network. We offer a comprehensive ecosystem that connects passengers, drivers, and companies in one place.

### 3.4 Market Trends

Several trends support our business opportunity:

Smartphone penetration in Bulgaria exceeds 85%, meaning most passengers have the capability to use a mobile app. The younger demographic (under 45) is particularly comfortable with mobile applications.

Digital transformation is a priority for Bulgarian municipalities, presenting opportunities for future partnerships with city government.

Post-pandemic public transport recovery is ongoing, with passenger numbers returning to pre-2020 levels, creating a growing user base.

Consumer expectations for transparency and accountability in public services are increasing, driving demand for better communication channels.

---

## 4. Product Specification

### 4.1 Technology Stack

The application is built using modern web technologies:

The frontend uses Next.js 14 with the App Router architecture, combined with React for interactive components and TypeScript for type safety. Styling is implemented through Tailwind CSS for efficient and responsive design.

State management relies on React Context combined with useState, providing a simple and effective solution without external dependencies.

For the initial MVP, data storage uses localStorage in the browser, simulating a database. This allows rapid deployment and testing without backend infrastructure.

Authentication uses custom JWT tokens stored in localStorage, providing secure access control while maintaining simplicity.

### 4.2 Feature Roadmap

- **Phase One (Current MVP):** User registration, problem reporting with photos, lost item search, found item reporting, profile management, dark/light mode.
- **Phase Two (Months 3-12):** Transport company dashboard, driver portal, PostgreSQL migration, analytics, municipal API access, real-time notifications.

### 4.3 Data Models

The system manages four primary data entities:

Users contain basic profile information including email, password, and name. Problems track incident reports with status (new, in_progress, resolved). Lost Items and Found Items manage the lost-and-found registry with status tracking (active, resolved).

---

## 5. Business Model

### 5.1 Revenue Model

Since all users receive free access, revenue is generated through advertising and voluntary donations:

**Primary: Advertising Revenue**
- In-app advertising (2,000+ users): €100-250/month
- Local business sponsorships (3,000+ users): €150-400/month
- Transport company promoted listings (5,000+ users): €250-500/month
- Municipal partnerships (10,000+ users): €5,000+/year

**Secondary: User Donations**
- Voluntary donations from grateful users
- "Support the platform" prompts after positive outcomes (item found, issue resolved)
- Reinforces community ownership and civic engagement

### 5.2 Cost Structure

**One-Time Costs (€):**
| Item | Cost |
|------|------|
| Initial setup (domain, hosting, UI/UX) | €200 |
| Legal / company registration | €50-200 |
| Contingency (15%) | €40-60 |
| **Total One-Time** | **€290-460** |

**Monthly Costs (€):**
| Item | Cost |
|------|------|
| Infrastructure + backend | €20-150 |
| Tools / subscriptions | €10-50 |
| Marketing | €100-300 |
| **Total Monthly** | **€130-500** |

### 5.3 Financial Projections

- **Year One:** 2,000 users, ~€1,000 revenue, ~€7,200 costs, net loss ~€6,200
- **Year Two:** 6,000 users, ~€9,000 revenue, ~€10,800 costs, net ~€-1,800
- **Year Three:** 15,000 users, ~€24,000 revenue, ~€18,000 costs, net ~€6,000
- **Break-even:** Month 24-30 from launch

### 5.4 Financial Insights

- Lean MVP budget (~€300-500 upfront) keeps initial risk minimal
- Realistic monthly operating costs require steady user growth to sustain
- User donations provide supplemental income and reinforce engagement
- Municipal contracts represent long-term sustainability at scale

---

## 6. Marketing Strategy

### 6.1 Positioning & Brand Identity

BusP is positioned as a platform for **urban transformation**, not a complaint app. We empower citizens while helping institutions improve city infrastructure and services.

- **Slogan:** "Your city. Your transport. Your control."
- **Core message:** Problem → Solution → Outcome
- **Brand tone:** Transparent, modern, action-oriented
- **Feedback loop:** Every action produces visible feedback ("Fixed!", "Item found")

### 6.2 Target Audience Messaging

**Citizens:** Emotional messaging using real-life Plovdiv scenarios—overcrowded buses, lost items, broken systems—so users recognize their own experiences. Emphasizes community ownership and civic participation.

**Institutions:** Position as a diagnostic and optimization tool, not complaint management. Highlights structured data, efficiency gains, and cost reduction. Removes negative associations with reactive complaint handling.

### 6.3 Product Features

- **Signal 360°:** Verified reports with photos and GPS evidence, providing transparent incident documentation
- **Lost & Found:** Trust-building system that reconnects citizens with their belongings

### 6.4 User Journey

Clear status updates create a sense of transparency and momentum:
- **Received** → **In progress** → **Resolved**

Users see their contributions produce real outcomes, driving long-term engagement and loyalty.

### 6.5 Tactical Channels

**Launch (Month 1-3):**
- Cold outreach via LinkedIn/email to transport company operations directors
- Social media presence in Plovdiv Facebook groups and local forums
- University outreach at Пловдивски университет and Технически университет
- Press engagement with Plovdiv24.bg and Karl.bg

**Growth (Month 4-9):**
- Referral programs incentivizing user invites
- B2B sales to bring on additional transport companies
- Partner integrations with local businesses near major bus stops

**Scale (Month 10-18):**
- Native iOS/Android app development
- Municipal pitch for city-wide contract
- Geographic expansion to Варна and Бургас

### 6.6 Success Metrics

- Visible feedback driving engagement and loyalty
- Community ownership of urban infrastructure improvements
- Structured data value for municipal optimization

---

## 7. Operations

### 7.1 Team Structure

**Year One (Bootstrap):** Four owners handling development, marketing, sales, and operations with no paid employees.

**Year Two (Growth):** May add part-time developer, marketer, and sales person.

### 7.2 Key Partnerships

- **Pilot transport partner:** At least one company willing to use dashboard and promote the app
- **Technology:** Vercel (hosting), Supabase/Railway (database), SaaS tools for operations
- **Local businesses:** For advertising revenue as user base grows

---

## 8. Risk Analysis

| Risk | Mitigation |
|------|------------|
| Low user adoption | Continuous iteration, marketing investment, clear value proposition |
| Transport company engagement | Demonstrate ROI on reduced complaint handling, early adopter recognition |
| Advertising revenue delay | Bootstrap with minimal costs, explore premium features |
| Competition | First-mover advantage, build user loyalty and network effects |
| Funding run-out | Keep costs low, stay flexible, adapt model as needed |

### 8.2 Contingency Plans

- **Slow adoption:** Increase marketing spend, explore additional channels
- **Transport companies won't engage:** Explore alternative partnership models
- **Slow advertising revenue:** Reduce operating costs, extend runway
- **Funding runs out:** Reduce to minimal team, focus on highest-value features

---

## 9. Implementation Timeline

| Phase | Timeline | Key Actions | Milestone |
|-------|----------|-------------|-----------|
| Launch | Month 1-2 | OOD registration, MVP deployment, secure pilot partner | 500 users |
| Growth | Month 3-6 | Transport dashboard, driver portal, advertising sales | 2,000 users |
| Scale | Month 7-12 | PostgreSQL migration, analytics, municipal pitch | 5,000 users, break-even |

---

## 10. Conclusion

BusP addresses a clear gap in Plovdiv's public transport ecosystem. By providing a free, mobile-first platform for incident reporting, we create value for passengers, drivers, and transport companies alike.

The business model relies on advertising revenue and user donations, which requires a substantial user base before becoming viable. However, the lean bootstrap investment of approximately €3,000 keeps risk minimal while the product is validated.

With realistic projections of reaching 5,000 users by the end of Year One, the platform positions itself for sustainable growth and eventual profitability.

The next steps involve company registration and MVP deployment, followed by active outreach to secure our first transport partner.

---

*Document Version: 1.0*
*Created: April 2026*
*BusP - Сигнали за обществен транспорт Пловдив*