# Admin Panel Implementation Plan

## Overview

This document describes the implementation of the BusP Admin Panel - a web-based admin dashboard for managing user-submitted reports related to bus incidents in Plovdiv, Bulgaria.

---

## 1. Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Data Storage**: localStorage-based "pseudo database"
- **API**: Mock API routes (simulates RESTful endpoints)
- **Authentication**: JWT-like tokens stored in localStorage

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── admin/
│   │       ├── auth/
│   │       │   ├── login/       # POST /api/admin/auth/login
│   │       │   └── me/         # GET /api/admin/auth/me
│   │       ├── reports/        # GET/POST /api/admin/reports
│   │       │   └── [id]/      # GET/DELETE /api/admin/reports/[id]
│   │       └── bus-lines/      # GET /api/admin/bus-lines
│   └── admin/
│       ├── login/              # /admin/login
│       ├── dashboard/          # /admin/dashboard
│       ├── reports/           # /admin/reports
│       └── bus-lines/         # /admin/bus-lines
├── contexts/
│   └── AdminAuthContext.tsx   # Admin authentication context
└── lib/
    ├── admin-api.ts          # API client functions
    ├── data.ts              # Data access functions
    └── types.ts             # TypeScript types
```

---

## 2. Authentication & Access Control

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: string;
}
```

### Login Flow
1. User submits email/password to `/api/admin/auth/login`
2. API validates credentials against database
3. API checks if user has `role: 'admin'`
4. On success: returns JWT-like token
5. Token stored in localStorage (`busp_admin_token`)
6. Redirect to `/admin/dashboard`

### Default Admin Credentials
- **Email**: `admin@busp.bg`
- **Password**: `admin123`
- Auto-created when first user registers in the system

---

## 3. Reports Management

### Report Types
1. **Problem** - Bus incidents, complaints
2. **Lost** - Lost items reported by users
3. **Found** - Found items reported by users

### Report Status Flow
```
Active → Resolved
         ↓
    (moved to resolved table)
```

### Features
- **Active Tab**: Shows all new/in-progress reports
- **Resolved Tab**: Shows resolved reports
- **Filters**: By type, bus line, date
- **Actions**:
  - View Details (modal)
  - Mark as Resolved (moves to resolved table)
  - Delete (removes from database)

### Anonymous Reports
- If `isAnonymous: true` - reporter info is hidden
- If `isAnonymous: false` - shows name, phone, email

---

## 4. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| GET | `/api/admin/auth/me` | Get current admin |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reports` | List all reports (with filters) |
| POST | `/api/admin/reports` | Resolve report |
| GET | `/api/admin/reports/[id]` | Get single report |
| DELETE | `/api/admin/reports/[id]` | Delete report |

### Bus Lines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/bus-lines` | Get all bus lines with counts |

---

## 5. Pages

### /admin/login
- Email/Password fields
- Error message display
- Login button

### /admin/dashboard
- Total reports count
- Reports by type (Problem, Lost, Found)
- Recent reports list (5 items)

### /admin/reports
- Two tabs: Active / Resolved
- Filters: Type, Bus Line, Date
- Table with columns: ID, Type, Title/Item, Bus Line, Date, Location, Anonymous, Actions
- Detail modal with full report info
- Mark as Resolved / Delete actions

### /admin/bus-lines
- List of all 30 bus lines
- Report counts per line (Problems, Lost, Found)
- Search functionality

---

## 6. Data Functions

### Admin Data Functions (src/lib/data.ts)
```typescript
// Get all reports
getAllProblems(): Problem[]
getAllLostItems(): LostItem[]
getAllFoundItems(): FoundItem[]
getAllReports(): { problems, lostItems, foundItems, total, resolvedCount }

// Get by ID
getProblemById(id): Problem | undefined
getLostItemById(id): LostItem | undefined
getFoundItemById(id): FoundItem | undefined

// Delete
deleteProblem(id): boolean
deleteLostItem(id): boolean
deleteFoundItem(id): boolean

// Resolve
addResolvedReport(report: ResolvedReport): ResolvedReport

// Queries
getReportsByBusLine(busLine): { problems, lostItems, foundItems, total }
getReportsByType(type): { reports, total }
```

---

## 7. Resolved Reports

### ResolvedReport Type
```typescript
interface ResolvedReport {
  id: string;
  originalId: string;
  type: 'problem' | 'lost' | 'found';
  title: string;
  itemName?: string;
  description: string;
  busLine: string;
  busRegistration: string;
  date: string;
  time: string;
  location: string;
  photoUrl: string | null;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  finderName?: string;
  finderPhone?: string;
  status: 'resolved';
  resolvedAt: string;
  resolvedBy: string;
}
```

---

## 8. MVP Scope

### Included
- ✅ Authentication (email/password)
- ✅ Role-based access control
- ✅ Dashboard with stats
- ✅ Reports list with filters
- ✅ Report detail view
- ✅ Mark as Resolved
- ✅ Delete report
- ✅ Bus lines with report counts
- ✅ Anonymous report handling

### Not Included (MVP)
- ❌ Real-time updates
- ❌ Notifications
- ❌ Advanced analytics
- ❌ Role management UI
- ❌ Mobile optimization
- ❌ Add/edit bus lines

---

## 9. Default Admin Setup

The first time a user registers in the system, an admin account is automatically created:

```javascript
{
  id: 'admin-001',
  email: 'admin@busp.bg',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  createdAt: '...'
}
```

---

## 10. Testing the Admin Panel

1. Open the app: `http://localhost:3000`
2. Login as regular user or register a new account
3. Go to `/admin/login`
4. Login with:
   - Email: `admin@busp.bg`
   - Password: `admin123`
5. View the admin dashboard
6. Create some test reports in the user app
7. See them in the admin panel

---

## 11. Future Improvements

Potential enhancements for future versions:
- Add more admin users via UI
- Export reports to CSV/PDF
- Bulk actions (multiple reports)
- Activity log
- User management
- Statistics and charts
- Email notifications to reporters when status changes