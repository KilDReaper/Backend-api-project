# LibriFlow Reservation System - Quick Start Guide

## 📦 What Was Created

### ✅ Complete Reservation System Files

1. **Model** (`src/models/`)
   - `reservation.model.js` - Reservation schema with indexes
   - `book.model.js` - Book schema (required dependency)

2. **Repository** (`src/modules/reservations/`)
   - `reservation.repository.js` - All database operations

3. **Service** (`src/modules/reservations/`)
   - `reservation.service.js` - Complete business logic:
     - Auto-approval when book available
     - Queue management with position tracking
     - Duplicate prevention
     - 2-day expiration handling
     - Automatic queue reordering
     - Next-in-queue auto-approval

4. **Controller** (`src/modules/reservations/`)
   - `reservation.controller.js` - Request handlers

5. **Routes** (`src/modules/reservations/`)
   - `reservation.routes.js` - Protected API endpoints

6. **Utilities** (`src/utils/`)
   - `cronJobs.js` - Auto-expiration scheduler (optional)
   - `seedBooks.js` - Sample data for testing

7. **Documentation**
   - `RESERVATION_API_DOCUMENTATION.md` - Complete API docs

---

## 🚀 Getting Started

### Step 1: Verify Installation

Make sure you have the required packages:
```bash
npm install
```

### Step 2: Seed Sample Books (Optional)

```bash
node src/utils/seedBooks.js
```

This will add 8 sample books including:
- Clean Code (5 available)
- The Pragmatic Programmer (3 available)
- You Don't Know JS (0 available - for testing queue)

### Step 3: Start the Server

```bash
npm run dev
```

---

## 🧪 Testing the API

### Prerequisites
- You need a JWT token from authentication
- User should be registered and logged in

### Test Scenario 1: Reserve Available Book

```bash
# 1. Create reservation for available book (auto-approved)
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId": "BOOK_ID_FROM_SEEDER"}'

# Expected: Status "approved", no queue position
```

### Test Scenario 2: Reserve Out-of-Stock Book (Queue)

```bash
# 1. Create reservation for book with 0 available
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId": "OUT_OF_STOCK_BOOK_ID"}'

# Expected: Status "pending", queuePosition = 1

# 2. Check queue status
curl -X GET http://localhost:5000/api/reservations/book/OUT_OF_STOCK_BOOK_ID/queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Scenario 3: Cancel and Watch Queue Update

```bash
# 1. Create multiple reservations for same book
# 2. Cancel the first approved one
curl -X PATCH http://localhost:5000/api/reservations/RESERVATION_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Next in queue gets auto-approved
```

### Test Scenario 4: View My Reservations

```bash
curl -X GET http://localhost:5000/api/reservations/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Available Endpoints

### User Endpoints
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/my` - Get my reservations  
- `PATCH /api/reservations/:id/cancel` - Cancel reservation
- `GET /api/reservations/:id` - Get single reservation
- `GET /api/reservations/book/:bookId` - Get book's reservations
- `GET /api/reservations/book/:bookId/queue` - Get queue status

### Admin Endpoints
- `PATCH /api/reservations/:id/complete` - Mark as collected
- `POST /api/reservations/expire` - Manually expire old ones

---

## 🔄 Business Logic Summary

### When Creating Reservation:
```
Is book available?
├─ YES → Auto-approve, decrease availableQuantity
└─ NO  → Add to queue with position number
```

### When Cancelling Reservation:
```
Was it approved?
├─ YES → Restore quantity, approve next in queue
└─ NO  → Reorder remaining queue positions
```

### When Expiring (after 2 days):
```
Find expired reservations
├─ Was approved → Restore quantity, approve next
└─ Was pending → Reorder queue
```

---

## ⚙️ Optional: Enable Auto-Expiration

### Option 1: Cron Job (Recommended)

1. Install node-cron:
```bash
npm install node-cron
```

2. Add to `src/server.js` (after DB connection):
```javascript
import { startCronJobs } from "./utils/cronJobs.js";

// After mongoose.connect()
startCronJobs(); // Checks every hour
```

### Option 2: Manual Trigger (Admin)

```bash
curl -X POST http://localhost:5000/api/reservations/expire \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🗂️ Database Indexes Created

For optimal performance:
- `{user: 1, book: 1, status: 1}` - Prevent duplicates
- `{book: 1, status: 1, queuePosition: 1}` - Queue queries
- `{expiresAt: 1, status: 1}` - Find expired
- `{title: "text", author: "text", isbn: "text"}` - Book search

---

## 🔍 Monitoring Queue Status

### Check Book Queue:
```javascript
GET /api/reservations/book/:bookId/queue

Response shows:
- availableQuantity
- queueLength (pending)
- approvedCount
- Full queue with positions
```

---

## 🛡️ Security Features

✅ JWT authentication required on all routes  
✅ Users can only view/cancel their own reservations  
✅ Admins have full access  
✅ Duplicate reservation prevention  
✅ Input validation on all endpoints

---

## 📊 Reservation Statuses

| Status | Meaning |
|--------|---------|
| `pending` | In queue waiting |
| `approved` | Ready for pickup |
| `cancelled` | User/admin cancelled |
| `completed` | Book collected |
| `expired` | Not collected in 2 days |

---

## 🎯 Next Steps

1. ✅ Test all endpoints with Postman/Thunder Client
2. ✅ Review API documentation in `RESERVATION_API_DOCUMENTATION.md`
3. ✅ Set up cron job for auto-expiration
4. ⬜ Add email notifications (optional)
5. ⬜ Add SMS notifications (optional)
6. ⬜ Create admin dashboard to manage reservations

---

## 📝 Example User Flow

1. **Student browses books** → Finds "Clean Code"
2. **Clicks "Reserve"** → POST /api/reservations
3. **Book available?**
   - YES → "Approved! Collect within 2 days"
   - NO → "You're #3 in queue"
4. **After 2 days** → Auto-expires if not collected
5. **Next person** → Auto-approved automatically

---

## 🐛 Troubleshooting

### "Book not found"
- Make sure you ran `seedBooks.js` or have books in DB
- Check the bookId format (must be valid ObjectId)

### "Not authorized"
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer TOKEN`

### "You already have an active reservation"
- User can't reserve same book twice
- Cancel existing reservation first

### Queue not updating
- Check book availableQuantity
- Verify no MongoDB connection issues
- Check console logs for errors

---

## 📞 Support

For detailed API documentation, see:
- `RESERVATION_API_DOCUMENTATION.md` (complete guide)

**System Status:** Production Ready ✅  
**Version:** 1.0.0  
**Created:** February 23, 2026
