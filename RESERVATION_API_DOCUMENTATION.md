# LibriFlow - Book Reservation System API

## Overview

Complete Book Reservation System with queue management, auto-approval, and expiration handling for the LibriFlow Library Management System.

## Features

✅ **Auto-Approval Logic**
- If book is available → reservation auto-approved
- If not available → user added to queue with position

✅ **Queue Management**
- Automatic queue position calculation
- Auto-reordering when reservations are cancelled
- Next in queue auto-approved when book becomes available

✅ **Duplicate Prevention**
- Users cannot reserve same book multiple times while active

✅ **Expiration Handling**
- Reservations expire after 2 days if not collected
- Automatic restoration of book quantity on expiration
- Next person in queue gets approved automatically

✅ **Role-Based Access**
- User routes: create, view own, cancel
- Admin routes: view all, complete, manual expiration trigger

---

## API Endpoints

### 🔓 User Routes (Authentication Required)

#### 1. Create Reservation
```
POST /api/reservations
```

**Request Body:**
```json
{
  "bookId": "book_object_id_here"
}
```

**Response (Auto-Approved):**
```json
{
  "success": true,
  "message": "Reservation approved! Please collect the book within 2 days.",
  "data": {
    "_id": "reservation_id",
    "user": { ... },
    "book": { ... },
    "status": "approved",
    "queuePosition": null,
    "expiresAt": "2026-02-25T...",
    "approvedAt": "2026-02-23T...",
    "createdAt": "2026-02-23T..."
  }
}
```

**Response (Added to Queue):**
```json
{
  "success": true,
  "message": "Reservation created. You are number 3 in the queue.",
  "data": {
    "_id": "reservation_id",
    "user": { ... },
    "book": { ... },
    "status": "pending",
    "queuePosition": 3,
    "expiresAt": "2026-02-25T...",
    "createdAt": "2026-02-23T..."
  }
}
```

---

#### 2. Get My Reservations
```
GET /api/reservations/my?page=1&limit=10&status=approved
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending/approved/cancelled/completed/expired)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "reservation_id",
      "book": {
        "_id": "book_id",
        "title": "Clean Code",
        "author": "Robert Martin",
        "isbn": "978-0132350884",
        "coverImageUrl": "...",
        "availableQuantity": 2
      },
      "status": "approved",
      "queuePosition": null,
      "expiresAt": "2026-02-25T...",
      "createdAt": "2026-02-23T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10
  }
}
```

---

#### 3. Cancel Reservation
```
PATCH /api/reservations/:id/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "data": {
    "_id": "reservation_id",
    "status": "cancelled",
    "cancelledAt": "2026-02-23T...",
    ...
  }
}
```

**Business Logic:**
- If reservation was **approved**: book quantity restored, next in queue auto-approved
- If reservation was **pending**: queue reordered automatically

---

#### 4. Get Reservation by ID
```
GET /api/reservations/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "reservation_id",
    "user": { ... },
    "book": { ... },
    "status": "approved",
    "queuePosition": null,
    "expiresAt": "2026-02-25T...",
    "createdAt": "2026-02-23T..."
  }
}
```

---

#### 5. Get Book Reservations
```
GET /api/reservations/book/:bookId?page=1&limit=10&status=pending
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "reservation_id",
      "user": {
        "_id": "user_id",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "queuePosition": 1,
      "expiresAt": "2026-02-25T...",
      "createdAt": "2026-02-23T..."
    }
  ],
  "pagination": { ... }
}
```

---

#### 6. Get Queue Status for Book
```
GET /api/reservations/book/:bookId/queue
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": "book_id",
      "title": "Clean Code",
      "availableQuantity": 0
    },
    "queueLength": 5,
    "approvedCount": 2,
    "queue": [
      {
        "id": "reservation_id",
        "user": {
          "_id": "user_id",
          "username": "john_doe",
          "email": "john@example.com"
        },
        "status": "approved",
        "queuePosition": null,
        "expiresAt": "2026-02-25T...",
        "createdAt": "2026-02-23T..."
      },
      {
        "id": "reservation_id_2",
        "user": { ... },
        "status": "pending",
        "queuePosition": 1,
        "expiresAt": "2026-02-25T...",
        "createdAt": "2026-02-23T..."
      }
    ]
  }
}
```

---

### 🔒 Admin Only Routes

#### 7. Get All Reservations (Admin)
```
GET /api/reservations?page=1&limit=10&status=approved&userId=...&bookId=...
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `userId` (optional): Filter by user
- `bookId` (optional): Filter by book

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

#### 8. Complete Reservation (Admin)
```
PATCH /api/reservations/:id/complete
```

**Response:**
```json
{
  "success": true,
  "message": "Reservation marked as completed",
  "data": {
    "_id": "reservation_id",
    "status": "completed",
    "completedAt": "2026-02-23T...",
    ...
  }
}
```

**Business Logic:**
- Marks reservation as collected
- Next person in queue auto-approved if book available

---

#### 9. Expire Old Reservations (Admin)
```
POST /api/reservations/expire
```

**Description:** Manually trigger expiration check. Can also be set up as a cron job.

**Response:**
```json
{
  "success": true,
  "message": "Expired 3 reservation(s)",
  "data": {
    "expired": 3,
    "processed": ["res_id_1", "res_id_2", "res_id_3"]
  }
}
```

**Business Logic:**
- Finds all expired reservations (past expiresAt date)
- Updates status to "expired"
- Restores book quantity if was approved
- Reorders queue if was pending
- Auto-approves next in queue

---

## Database Schema

### Reservation Model

```javascript
{
  user: ObjectId (ref: User),
  book: ObjectId (ref: Book),
  status: String (enum: pending/approved/cancelled/completed/expired),
  queuePosition: Number (null if approved),
  expiresAt: Date (2 days from creation/approval),
  approvedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model

```javascript
{
  title: String,
  author: String,
  isbn: String (unique),
  publisher: String,
  publishedDate: Date,
  genre: [String],
  description: String,
  coverImageUrl: String,
  price: Number,
  stockQuantity: Number (total stock),
  availableQuantity: Number (currently available),
  language: String,
  pages: Number,
  rating: Number (0-5),
  totalReviews: Number,
  status: String (enum: available/out-of-stock/discontinued),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Business Logic Flows

### 1. Create Reservation Flow

```
User requests reservation
    ↓
Check if book exists
    ↓
Check if user already has active reservation for this book
    ↓
Is book available?
    ├─ YES → Auto-approve
    │         ├─ Set status: "approved"
    │         ├─ Decrease availableQuantity
    │         ├─ Set expiresAt: now + 2 days
    │         └─ Return success
    │
    └─ NO → Add to queue
              ├─ Set status: "pending"
              ├─ Calculate queuePosition (max + 1)
              ├─ Set expiresAt: now + 2 days
              └─ Return success with queue position
```

### 2. Cancel Reservation Flow

```
User cancels reservation
    ↓
Was reservation approved?
    ├─ YES → Restore availableQuantity
    │         ├─ Increase book.availableQuantity by 1
    │         ├─ Find next pending reservation
    │         ├─ Auto-approve next in queue
    │         └─ Update their expiresAt
    │
    └─ NO → Reorder queue
              └─ Decrease queuePosition for all after cancelled one
```

### 3. Expiration Flow

```
Cron job / Manual trigger
    ↓
Find all reservations where expiresAt < now
    ↓
For each expired reservation:
    ├─ Update status to "expired"
    ├─ Was it approved?
    │   ├─ YES → Restore availableQuantity
    │   │         └─ Process next in queue
    │   └─ NO → Reorder queue
    └─ Continue to next
```

---

## Authentication

All routes require JWT authentication via Bearer token.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

**User Object (from token):**
```javascript
req.user = {
  id: "user_id",
  role: "admin" | "user",
  username: "john_doe",
  email: "john@example.com",
  // ... other user fields
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Book ID is required"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admins only."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Book not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "You already have an approved reservation for this book"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Setup Cron Job for Auto-Expiration (Optional)

### Using node-cron

1. Install node-cron:
```bash
npm install node-cron
```

2. Create `src/utils/cronJobs.js`:
```javascript
import cron from "node-cron";
import { reservationService } from "../modules/reservations/reservation.service.js";

export const startCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("Running reservation expiration check...");
    try {
      const result = await reservationService.expireOldReservations();
      console.log(`Expired ${result.expired} reservations`);
    } catch (error) {
      console.error("Error in expiration cron job:", error);
    }
  });

  console.log("Cron jobs started");
};
```

3. Add to `src/server.js`:
```javascript
import { startCronJobs } from "./utils/cronJobs.js";

// After database connection
startCronJobs();
```

---

## Testing Examples

### Test with cURL

**Create Reservation:**
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId": "65f1234567890abcdef12345"}'
```

**Get My Reservations:**
```bash
curl -X GET http://localhost:5000/api/reservations/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Cancel Reservation:**
```bash
curl -X PATCH http://localhost:5000/api/reservations/RESERVATION_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Queue Status:**
```bash
curl -X GET http://localhost:5000/api/reservations/book/BOOK_ID/queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Files Created

```
src/
├── models/
│   ├── book.model.js          ✅ Book schema
│   └── reservation.model.js   ✅ Reservation schema with indexes
│
└── modules/
    └── reservations/
        ├── reservation.repository.js  ✅ Database operations
        ├── reservation.service.js     ✅ Business logic
        ├── reservation.controller.js  ✅ Request handlers
        └── reservation.routes.js      ✅ Route definitions
```

---

## Status Values

| Status | Description |
|--------|-------------|
| `pending` | In queue, waiting for book availability |
| `approved` | Book reserved, ready for collection |
| `cancelled` | User or admin cancelled reservation |
| `completed` | Book collected by user |
| `expired` | Not collected within 2 days |

---

## Production Considerations

1. **Indexes**: Already added for performance
   - User + Book + Status compound index
   - Book + Status + QueuePosition for queue queries
   - ExpiresAt + Status for expiration checks

2. **Concurrency**: Use MongoDB transactions for critical operations
3. **Notifications**: Add email/SMS notifications for:
   - Reservation approved
   - Reservation about to expire (24h before)
   - Next in queue notification

4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Caching**: Cache book availability for performance

---

## Support

For issues or questions, contact the LibriFlow development team.

**Version:** 1.0.0  
**Last Updated:** February 23, 2026
