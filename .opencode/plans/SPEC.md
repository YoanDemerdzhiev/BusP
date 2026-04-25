# SPEC.md - Public Transport Incident Management App

## 1. Project Overview

**Project Name:** BusP (Сигнали за обществен транспорт)

**Project Type:** Mobile-first responsive web application

**Core Functionality:** A smartphone-style app for reporting and managing incidents (problems, lost items, found items) in public transport. Users can submit reports, browse lost/found items, and manage their profiles.

**Target Users:** Public transport passengers and drivers in Bulgaria

**Tech Stack:**
- Frontend: Next.js 14 (App Router), React, TypeScript
- Styling: CSS Modules / Tailwind CSS
- State Management: React Context + useState
- Data Storage: Local JSON file (simulated backend)
- Authentication: Custom auth with JWT tokens stored in localStorage

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Phone Frame Container:**
- Max-width: 420px (mobile device width)
- Centered on desktop with shadow/border to simulate phone
- Full-width on actual mobile devices (responsive)
- Border-radius: 24px for iOS feel
- Safe area padding for notched devices

**Page Structure:**
```
┌─────────────────────────────┐
│      Status Bar (spacer)    │  ← 44px
├─────────────────────────────┤
│      Header / Nav Bar       │  ← 56px
├─────────────────────────────┤
│                             │
│      Main Content           │
│      (scrollable)           │
│                             │
├─────────────────────────────┤
│      Bottom Actions         │  ← 80px
└─────────────────────────────┘
```

### 2.2 Visual Design

**Color Palette:**
- Primary: `#2563EB` (Blue - trust, transport)
- Primary Dark: `#1D4ED8`
- Secondary: `#10B981` (Green - success, found)
- Accent: `#F59E0B` (Amber - warnings, lost)
- Danger: `#EF4444` (Red - problems, errors)
- Background: `#F8FAFC` (light) / `#0F172A` (dark)
- Surface: `#FFFFFF` (light) / `#1E293B` (dark)
- Text Primary: `#1E293B` (light) / `#F8FAFC` (dark)
- Text Secondary: `#64748B`

**Typography:**
- Font Family: `"Inter", -apple-system, BlinkMacSystemFont, sans-serif`
- Headings: 
  - H1: 24px, weight 700
  - H2: 20px, weight 600
  - H3: 18px, weight 600
- Body: 16px, weight 400
- Small: 14px, weight 400
- Caption: 12px, weight 400

**Spacing System:**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

**Visual Effects:**
- Card shadows: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`
- Elevated shadows: `0 10px 15px -3px rgba(0,0,0,0.1)`
- Border radius: 12px (cards), 8px (buttons), 24px (phone frame)
- Transitions: 200ms ease-in-out

### 2.3 Components

**Button Variants:**
- Primary: Blue background, white text
- Secondary: White background, blue border/text
- Danger: Red background, white text
- Ghost: Transparent, text only
- States: default, hover (darken 10%), active (darken 15%), disabled (opacity 50%)

**Input Fields:**
- Height: 48px (touch-friendly)
- Border: 1px solid #E2E8F0
- Focus: Blue border, subtle shadow
- Error: Red border with error message below
- Border-radius: 8px

**Cards:**
- Background: white/dark-surface
- Padding: 16px
- Border-radius: 12px
- Shadow: default card shadow

**Icons:**
- Use Lucide React icons
- Size: 24px (navigation), 20px (inline)
- Stroke width: 2px

---

## 3. Functionality Specification

### 3.1 Authentication System

**Login Page (Вход):**
- Email input with validation
- Password input with show/hide toggle
- "Вход" button
- Link to register page
- Error messages in Bulgarian

**Register Page (Създай акаунт):**
- Email input
- Password input (min 6 chars)
- First Name (Име)
- Last Name (Фамилия)
- "Създай акаунт" button
- Link to login page
- Validation: all fields required, email format, password min 6 chars

**Auth Flow:**
- Store JWT token in localStorage
- Auth context provides user state globally
- Protected routes redirect to /login if not authenticated
- Logout clears token and redirects to login

### 3.2 Main Dashboard (Начало)

**Layout:**
- Welcome message with user's first name
- Large centered card "Подай сигнал" with icon
- Three action buttons stacked vertically:
  - Проблем (Problem) - Red icon
  - Изгубено (Lost) - Amber icon
  - Намерено (Found) - Green icon
- Each button: icon + label, full width, 56px height

### 3.3 Navigation

**Hamburger Menu (Left):**
- Slide-out panel from left
- Profile section at top (avatar, name, email)
- Menu items:
  - Моят профил (My Profile)
  - Моите сигнали (My Reports)
- Close on overlay click or X button

**Settings Icon (Right):**
- Opens settings page/modal
- Options:
  - Смяна на тема (Light/Dark Mode) - toggle
  - Редакция на профил (Edit Profile)
  - Изход (Logout)

### 3.4 Problem Reporting Flow (Проблем)

**Step 1: Select Bus Line**
- Scrollable list of bus lines (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, etc.)
- Each item: bus number with route info
- Tap to select → proceed to form

**Step 2: Report Form**
- Title (Какво се случи): text input
- Bus Registration (Рег. номер): text input
- Date (Дата): date picker
- Time (Час): time picker
- Location (Локация): text input
- Description (Описание): textarea
- Upload Photo (Качи снимка): file input (accept images)
- Anonymous checkbox (Анонимно подаване)
- Submit button: Изпрати сигнал
- Validation: title, date, location required

### 3.5 Lost Items Flow (Изгубено)

**Main Screen:**
- Search bar at top
- List of FOUND items (items people found)
- Each item shows: image thumbnail, item name, date, bus line
- Bottom sticky button: Създай сигнал

**Item Detail View:**
- Read-only display
- Item name
- Description
- Date, time, location
- Contact phone
- Bus registration

**Create Lost Report:**
- Item name (Изгубен предмет)
- Bus registration (Рег. номер на автобуса)
- Date (Дата)
- Time (Час)
- Location (Локация)
- Description (Описание)
- Photo (Снимка)
- Your name (Име)
- Phone (Телефонен номер)
- Submit: Изпрати

### 3.6 Found Items Flow (Намерено)

**Main Screen:**
- Search bar at top
- List of LOST items (items people lost)
- Each item shows: image thumbnail, item name, date, bus line
- Bottom sticky button: Създай сигнал

**Item Detail View:**
- Read-only display
- Item name
- Description
- Date, time, location
- Contact phone
- Bus registration

**Create Found Report:**
- Item name (Намерен предмет)
- Bus registration
- Date
- Time
- Location
- Description
- Photo
- Your name
- Phone
- Submit: Изпрати

### 3.7 User Profile

**Profile Display:**
- Full name
- Email
- Edit button → edit form

**Edit Profile:**
- First name, last name, email
- Save button

**My Reports:**
- List of user's submitted reports
- Filter tabs: Всички, Проблеми, Изгубени, Намерени
- Each item shows status and date

---

## 4. Data Models

### User
```json
{
  "id": "uuid",
  "email": "string",
  "password": "hashed string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "timestamp"
}
```

### Problem Report
```json
{
  "id": "uuid",
  "userId": "uuid | null",
  "title": "string",
  "busLine": "string",
  "busRegistration": "string",
  "date": "date",
  "time": "time",
  "location": "string",
  "description": "string",
  "photoUrl": "string | null",
  "isAnonymous": "boolean",
  "status": "new | in_progress | resolved",
  "createdAt": "timestamp"
}
```

### Lost Item Report
```json
{
  "id": "uuid",
  "userId": "uuid",
  "itemName": "string",
  "busLine": "string",
  "busRegistration": "string",
  "date": "date",
  "time": "time",
  "location": "string",
  "description": "string",
  "photoUrl": "string | null",
  "reporterName": "string",
  "reporterPhone": "string",
  "status": "active | resolved",
  "createdAt": "timestamp"
}
```

### Found Item Report
```json
{
  "id": "uuid",
  "userId": "uuid",
  "itemName": "string",
  "busLine": "string",
  "busRegistration": "string",
  "date": "date",
  "time": "time",
  "location": "string",
  "description": "string",
  "photoUrl": "string | null",
  "finderName": "string",
  "finderPhone": "string",
  "status": "active | resolved",
  "createdAt": "timestamp"
}
```

---

## 5. Local JSON Storage

**Implementation:**
- JSON file stored in project (e.g., `data/db.json`)
- API routes in Next.js handle CRUD operations
- Read/write to file using fs module
- Since this is client-side focused, use an API route wrapper

**Data File Structure:**
```json
{
  "users": [...],
  "problems": [...],
  "lostItems": [...],
  "foundItems": [...]
}
```

---

## 6. Pages Structure

```
/                     → Redirect to /login or /home
/login                → Login page (public)
/register             → Register page (public)
/home                 → Main dashboard (protected)
/problem              → Problem reporting flow (protected)
/problem/select-line  → Bus line selection
problem/report        → Problem form
/lost                 → Lost items list (protected)
/lost/create          → Create lost item report
/found                → Found items list (protected)
/found/create         → Create found item report
/profile              → User profile (protected)
/profile/edit         → Edit profile
/settings             → Settings page (protected)
/reports              → My reports list (protected)
```

---

## 7. Acceptance Criteria

1. App displays in phone-style container on desktop, full-width on mobile
2. All UI text is in Bulgarian
3. Unauthenticated users cannot access any protected route
4. Login with email/password works
5. Registration creates new user in local JSON
6. Dashboard shows three main action buttons
7. Navigation menu slides out from left
8. Settings page has dark mode toggle
9. Problem reporting flow: select bus line → fill form → submit
10. Lost items show found items, can create new lost report
11. Found items show lost items, can create new found report
12. User can view and edit their profile
13. User can view their submitted reports
14. Dark mode toggle works and persists
15. Responsive on actual mobile devices

---

## 8. Sample Bulgarian Text

| English | Bulgarian |
|---------|-----------|
| Login | Вход |
| Register | Регистрация |
| Email | Имейл |
| Password | Парола |
| First Name | Име |
| Last Name | Фамилия |
| Create Account | Създай акаунт |
| Submit Report | Подай сигнал |
| Problem | Проблем |
| Lost | Изгубено |
| Found | Намерено |
| Profile | Профил |
| My Reports | Моите сигнали |
| Settings | Настройки |
| Logout | Изход |
| Save | Запази |
| Cancel | Отмени |
| Submit | Изпрати |
| Date | Дата |
| Time | Час |
| Location | Локация |
| Description | Описание |
| Phone | Телефон |
| Search | Търси |
| No results | Няма резултати |
| Light Mode | Светла тема |
| Dark Mode | Тъмна тема |