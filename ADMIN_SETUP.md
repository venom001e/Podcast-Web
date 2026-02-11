# Admin Panel Setup Guide

## Overview

A comprehensive admin panel system has been implemented for your podcast web application. This document outlines the features, setup, and usage of the admin system.

## Features Implemented

### 1. Admin Role System
- ✅ **Role field added to User model** - Users can have either `"user"` or `"admin"` role
- ✅ **Server-side protection** - All admin endpoints check if the user is authenticated and has admin role
- ✅ **Route protection** - Admin routes (`/admin/*`) are protected and redirect to home if access is denied

### 2. Admin Dashboard (`/admin`)
Shows key metrics:
- **Total Users Count** - Total number of registered users
- **Total Podcasts Count** - Total number of podcasts in the system
- **Total Premium Podcasts** - Count of premium (subscription-only) content
- Quick navigation cards to Manage Podcasts and Manage Users

### 3. Manage Podcasts (`/admin/podcasts`)
**Features:**
- View all podcasts with thumbnails and details
- Add new podcasts with:
  - Title (required)
  - Description (required)
  - Category
  - Thumbnail URL
  - Audio URL
  - Premium toggle
- Edit existing podcasts
- Delete podcasts with confirmation dialog
- Real-time updates after actions

### 4. Manage Users (`/admin/users`)
**Features:**
- View all registered users
- User information display:
  - Name and email
  - Current role (User/Admin)
  - Subscription status
- Update user roles (promote/demote admin)
- Toggle subscription status
- Delete users with confirmation
- Real-time updates

## Backend API Endpoints

All endpoints require authentication and admin role verification.

### Admin Stats
```
GET /api/admin/stats
Response: { totalUsers, totalPodcasts, totalPremiumPodcasts }
```

### Manage Podcasts
```
GET /api/admin/podcasts
- List all podcasts

POST /api/podcasts (via existing endpoint, works for admins)
- Create new podcast

PUT /api/admin/podcasts/:id
- Update podcast details

DELETE /api/admin/podcasts/:id
- Delete podcast
```

### Manage Users
```
GET /api/admin/users
- List all users

PUT /api/admin/users/:id
- Update user (role, subscription status)
- Body: { role?: "user" | "admin", isSubscribed?: boolean }

DELETE /api/admin/users/:id
- Delete user
```

## Security Implementation

### Server-Side Protection
1. **isAdmin Middleware** - Validates user authentication and admin role
2. **Database Queries** - Uses Drizzle ORM with proper parameterized queries
3. **Type Safety** - Full TypeScript support with proper types

### Storage Layer
The `DatabaseStorage` class handles all data operations:
- `getPodcasts()` - Retrieve podcasts with filtering
- `createPodcast()` - Create new podcast
- `updatePodcast()` - Update podcast details
- `deletePodcast()` - Delete podcast
- `getUsers()` - Retrieve all users
- `updateUser()` - Update user properties
- `deleteUser()` - Delete user

## Database Schema

### Users Table
Already exists in `/shared/models/auth.ts`:
```typescript
{
  id: string (UUID)
  email?: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  isSubscribed: boolean
  role: "user" | "admin" // NEW FIELD
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Podcasts Table
Already exists in `/shared/schema.ts`:
```typescript
{
  id: number (serial)
  title: string
  description: string
  thumbnail: string (URL)
  audioUrl: string (URL)
  category: string
  isPremium: boolean
  createdAt: timestamp
}
```

## File Structure

### Created Files
- `client/src/pages/AdminDashboard.tsx` - Admin dashboard with stats
- `client/src/pages/AdminPodcasts.tsx` - Manage podcasts interface
- `client/src/pages/AdminUsers.tsx` - Manage users interface

### Modified Files
- `client/src/App.tsx` - Added admin routes
- `client/src/components/Navigation.tsx` - Added admin panel link for admin users
- `server/routes.ts` - API endpoints and isAdmin middleware
- `server/storage.ts` - Added User type import
- `shared/routes.ts` - API route definitions with schemas

## How to Access Admin Panel

1. **Make yourself an admin** (requires database access):
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 'your-user-id';
   ```

2. **Log in** to the application with your user account

3. **Click your profile** in the top-right corner

4. **You'll see "Admin Panel"** option if you're an admin

5. **Click "Admin Panel"** to access the dashboard

## Authentication Flow

```
User Login
    ↓
Check /api/auth/user (returns User with role)
    ↓
User object includes role: "user" | "admin"
    ↓
Navigation component checks user.role
    ↓
If admin, show "Admin Panel" link
    ↓
Accessing /admin routes requires admin check on client + server
    ↓
API endpoints verify admin status before returning data
```

## Error Handling

All admin pages handle common error scenarios:
- **403 Forbidden** - User is not an admin, redirected to home
- **401 Unauthorized** - User is not logged in, redirected to login
- **400 Bad Request** - Validation errors on forms
- **500 Internal Server Error** - Server-side issues

Toast notifications provide user feedback for all operations.

## Development Notes

### Adding New Admin Features

1. **Create API route** in `server/routes.ts`:
```typescript
app.get("/api/admin/new-endpoint", isAdmin, async (req, res) => {
  // Your logic
});
```

2. **Add route definition** in `shared/routes.ts`:
```typescript
export const api = {
  admin: {
    newEndpoint: {
      method: 'GET',
      path: '/api/admin/new-endpoint',
      // ...
    },
  },
};
```

3. **Create client component** in `client/src/pages/AdminNewFeature.tsx`

4. **Add route** in `client/src/App.tsx`:
```typescript
<Route path="/admin/new-feature" component={AdminNewFeature} />
```

### Testing Admin Functionality

1. Create a test user
2. Promote them to admin via database
3. Log in as that user
4. Access admin panel
5. Test CRUD operations

## Environment Setup

Ensure `DATABASE_URL` is set in your environment variables. The database should be connected and migrations run before accessing the admin panel.

## Future Enhancements

Potential additions to the admin system:
- Analytics dashboard with charts
- User activity logs
- Content moderation queue
- Backup and restore functionality
- Bulk operations (upload multiple podcasts)
- Admin user management (create admin users directly)
- Audit logs for all admin actions

## Troubleshooting

### "Access Denied" on Admin Pages
- Check if your user role is set to "admin" in the database
- Try logging out and logging back in
- Clear browser cache

### API Returns 403
- Verify your user role in the database
- Check that the API endpoint is correctly protected with isAdmin middleware

### Podcast/User not updating
- Check browser console for errors
- Verify API endpoint is returning data
- Try refreshing the page

### UI Components not rendering
- Ensure all UI component imports are available in `components/ui/`
- Check for missing prop values in components
