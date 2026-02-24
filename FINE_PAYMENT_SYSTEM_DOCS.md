# LibriFlow - Fine Management & Payment System

## 📋 System Overview

Production-ready fine management system with multi-gateway payment integration for the LibriFlow library backend.

**Key Features:**
- ✅ Automatic fine calculation (Rs 5 per day overdue)
- ✅ Multi-gateway payment support (Khalti, eSewa, Stripe, Cash)
- ✅ Complete payment tracking and verification
- ✅ Admin dashboard for fine management
- ✅ User fine notifications and history

---

## 📊 Database Models

### Borrowing Model

```javascript
{
  user: ObjectId (ref: User),
  book: ObjectId (ref: Book),
  borrowDate: Date,
  dueDate: Date (14 days default),
  returnedDate: Date (null until returned),
  status: String (active/returned/overdue/lost),
  fineAmount: Number (initially 0),
  finePaid: Boolean (false until paid),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{user: 1, status: 1}` - For user's active borrows
- `{dueDate: 1, status: 1}` - For overdue searches
- `{user: 1, fineAmount: 1, finePaid: 1}` - For unpaid fines

### Payment Model

```javascript
{
  user: ObjectId (ref: User),
  borrowing: ObjectId (ref: Borrowing),
  amount: Number,
  paymentStatus: String (pending/success/failed/cancelled),
  paymentMethod: String (khalti/esewa/stripe/cash),
  transactionId: String (unique),
  externalTransactionId: String (from gateway),
  paymentGatewayResponse: Mixed (gateway response),
  description: String,
  paidAt: Date,
  failureReason: String,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{user: 1, paymentStatus: 1}` - For user payment status
- `{borrowing: 1}` - For borrowing's payments
- `{transactionId: 1}` - For transaction lookup
- `{externalTransactionId: 1}` - For gateway transaction lookup

---

## 💰 Fine Calculation Logic

```
Fine = Days Overdue × Rs 5

Example:
- Due Date: Feb 20, 2026
- Returned: Feb 25, 2026 (5 days late)
- Fine: 5 × 5 = Rs 25
```

**Auto-calculation Trigger:** When book is returned

---

## 🌐 Payment Gateway Integration

### Khalti (Nepal's largest payment gateway)

**Configuration:**
```env
KHALTI_PUBLIC_KEY=your_public_key
KHALTI_SECRET_KEY=your_secret_key
```

**Flow:**
1. Create payment → Get Khalti payment page URL
2. User completes payment on Khalti
3. Webhook callback → Verify with API
4. Update payment status & mark fine as paid

**Documentation:** https://docs.khalti.com/

### eSewa (Popular in Nepal & Bangladesh)

**Configuration:**
```env
ESEWA_MERCHANT_CODE=merchant_code
```

**Flow:**
1. Create payment → Generate signature
2. Redirect to eSewa payment page
3. eSewa returns verification params
4. Verify with eSewa API
5. Update payment status

**Documentation:** https://esewa.com.np/developers

### Stripe (International)

**Configuration:**
```env
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

**Flow:**
1. Create payment intent
2. Frontend handles Stripe checkout
3. Webhook confirms payment
4. Backend updates records

### Cash Payment (Counter Payment)

**Flow:**
1. User selects cash payment method
2. System records pending payment
3. Admin verifies payment at counter
4. Mark payment as success

---

## 🔌 API Endpoints

### Borrowing Endpoints

#### User Routes

**Create Borrowing**
```
POST /api/borrowings
Authorization: Bearer <token>

Body:
{
  "bookId": "book_id",
  "dueDays": 14  // optional, defaults to 14
}

Response:
{
  "success": true,
  "message": "Book borrowed successfully. Due date: ...",
  "data": {
    "_id": "borrowing_id",
    "user": {...},
    "book": {...},
    "borrowDate": "2026-02-23T...",
    "dueDate": "2026-03-09T...",
    "status": "active",
    "fineAmount": 0,
    "finePaid": false
  }
}
```

**Return Book**
```
POST /api/borrowings/:id/return
Authorization: Bearer <token>

Response (On Time):
{
  "success": true,
  "message": "Book returned on time. No fine charged.",
  "data": {
    "borrowing": {...},
    "fineDetails": {
      "daysOverdue": 0,
      "fineAmount": 0,
      "fineRate": "Rs 5 per day",
      "finePaid": true
    }
  }
}

Response (Late):
{
  "success": true,
  "message": "Book returned. Fine calculated: Rs 25 for 5 days overdue.",
  "data": {
    "borrowing": {
      "status": "returned",
      "fineAmount": 25,
      "finePaid": false
    },
    "fineDetails": {
      "daysOverdue": 5,
      "fineAmount": 25,
      "fineRate": "Rs 5 per day",
      "finePaid": false
    }
  }
}
```

**Get User's Borrowings**
```
GET /api/borrowings/my?page=1&limit=10&status=active
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "borrowing_id",
      "book": {...},
      "dueDate": "2026-03-09T...",
      "status": "active",
      "daysRemaining": 5,
      "isOverdue": false,
      "fineAmount": 0
    }
  ],
  "pagination": {...}
}
```

**Get User's Active Borrowings**
```
GET /api/borrowings/my/active
Authorization: Bearer <token>

Response shows remaining days and estimated fine for each
```

**Get User's Unpaid Fines**
```
GET /api/borrowings/my/unpaid-fines
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "You have unpaid fines totaling Rs 125",
  "data": [
    {
      "book": {...},
      "fineAmount": 75,
      "daysOverdue": 15,
      "returnedDate": "..."
    },
    {
      "book": {...},
      "fineAmount": 50,
      "daysOverdue": 10,
      "returnedDate": "..."
    }
  ],
  "totalFine": 125
}
```

**Mark Book as Lost**
```
PATCH /api/borrowings/:id/lost
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Book marked as lost. Fine amount: Rs 500",
  "data": {
    "status": "lost",
    "fineAmount": 500  // Book price or default
  }
}
```

#### Admin Routes

**Get All Borrowings**
```
GET /api/borrowings?page=1&limit=10&status=active&userId=...
Authorization: Bearer <admin_token>
```

**Get Overdue Books**
```
GET /api/borrowings/overdue?page=1&limit=10
Authorization: Bearer <admin_token>

Response includes estimated fines
```

**Get All Unpaid Fines**
```
GET /api/borrowings/unpaid-fines?page=1&limit=10
Authorization: Bearer <admin_token>
```

**Get Borrowing Statistics**
```
GET /api/borrowings/stats
Authorization: Bearer <admin_token>

Response:
{
  "byStatus": {
    "active": {"count": 25, "totalFines": 0},
    "returned": {"count": 100, "totalFines": 5250},
    "lost": {"count": 3, "totalFines": 1500}
  },
  "unpaidFinesCount": 15
}
```

---

### Payment Endpoints

#### User Routes

**Create Payment**
```
POST /api/payments
Authorization: Bearer <token>

Body:
{
  "borrowingId": "borrowing_id",
  "paymentMethod": "khalti"  // khalti/esewa/stripe/cash
}

Response:
{
  "success": true,
  "message": "Payment initiated via khalti",
  "data": {
    "payment": {
      "_id": "payment_id",
      "amount": 25,
      "transactionId": "TXN_...",
      "paymentStatus": "pending"
    },
    "gateway": {
      "success": true,
      "paymentUrl": "https://khalti.com/checkout/",
      "payload": {...}
    }
  }
}
```

**Verify Payment (Khalti)**
```
PATCH /api/payments/:id/verify
Authorization: Bearer <token>

Body:
{
  "paymentMethod": "khalti",
  "token": "khalti_payment_token"
}

Response:
{
  "success": true,
  "message": "Payment verified and completed successfully",
  "data": {
    "_id": "payment_id",
    "paymentStatus": "success",
    "paidAt": "2026-02-23T...",
    "externalTransactionId": "khalti_txn_id"
  }
}
```

**Verify Payment (eSewa)**
```
PATCH /api/payments/:id/verify
Authorization: Bearer <token>

Body:
{
  "paymentMethod": "esewa",
  "amt": 25,
  "rid": "esewa_reference_id",
  "pid": "payment_transaction_id"
}
```

**Verify Payment (Cash - Admin)**
```
PATCH /api/payments/:id/verify
Authorization: Bearer <admin_token>

Body:
{
  "paymentMethod": "cash",
  "verifiedBy": "admin_id"
}
```

**Get User's Payments**
```
GET /api/payments/my?page=1&limit=10&status=success
Authorization: Bearer <token>

Returns all payment history
```

**Cancel Pending Payment**
```
PATCH /api/payments/:id/cancel
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "paymentStatus": "cancelled"
  }
}
```

**Retry Failed Payment**
```
POST /api/payments/:id/retry
Authorization: Bearer <token>

Reinitiates failed payment
```

#### Admin Routes

**Get All Payments**
```
GET /api/payments?status=success&paymentMethod=khalti
Authorization: Bearer <admin_token>

Filters: status, userId, paymentMethod
```

**Get Payment Statistics**
```
GET /api/payments/stats
Authorization: Bearer <admin_token>

Response:
{
  "byStatus": {
    "success": {"count": 150, "total": 7500},
    "pending": {"count": 5, "total": 250},
    "failed": {"count": 2, "total": 100}
  }
}
```

---

## 🔑 Environment Variables

```env
# Payment Gateways
KHALTI_PUBLIC_KEY=your_khalti_public_key
KHALTI_SECRET_KEY=your_khalti_secret_key

ESEWA_MERCHANT_CODE=your_esewa_merchant_code

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

---

## 🧪 Testing Examples

### Test Fine Calculation

```bash
# 1. Borrow a book
curl -X POST http://localhost:5000/api/borrowings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID",
    "dueDays": 1
  }'

# 2. Wait 2+ days

# 3. Return book (will calculate fine)
curl -X POST http://localhost:5000/api/borrowings/BORROWING_ID/return \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows:
# "Fine calculated: Rs 10 for 2 days overdue"
```

### Test Khalti Payment

```bash
# 1. Get unpaid fine
curl -X GET http://localhost:5000/api/borrowings/my/unpaid-fines \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Create payment
curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "borrowingId": "BORROWING_ID",
    "paymentMethod": "khalti"
  }'

# 3. User pays on Khalti website

# 4. Verify payment
curl -X PATCH http://localhost:5000/api/payments/PAYMENT_ID/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "khalti",
    "token": "KHALTI_TOKEN_FROM_RESPONSE"
  }'
```

### Test Cash Payment (Admin Verification)

```bash
# 1. User initiates cash payment
curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"borrowingId": "...", "paymentMethod": "cash"}'

# 2. User pays at counter

# 3. Admin verifies payment
curl -X PATCH http://localhost:5000/api/payments/PAYMENT_ID/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "paymentMethod": "cash",
    "verifiedBy": "ADMIN_ID"
  }'
```

---

## 📊 Fine Calculation Examples

| Scenario | Days Overdue | Fine (Rs 5/day) |
|----------|--------------|-----------------|
| On time | 0 | 0 |
| 1 day late | 1 | 5 |
| 1 week late | 7 | 35 |
| 1 month late | 30 | 150 |
| Book lost | - | Book price (500+) |

---

## 🔄 Business Logic Flow

### Borrowing Return Flow

```
User returns book
    ↓
Is returnDate > dueDate?
    ├─ YES → Calculate days overdue
    │         ├─ daysOverdue × Rs 5 = fineAmount
    │         ├─ Update Borrowing: fineAmount, finePaid=false
    │         └─ Set status = "returned"
    │
    └─ NO → No fine
              └─ Set status = "returned", finePaid = true
```

### Payment Flow

```
User initiates payment
    ↓
Select payment method
    ↓
Create payment record (status: pending)
    ↓
Initiate with payment gateway
    ↓
User completes payment on gateway
    ↓
Receive verification (webhook or API call)
    ↓
Verify against gateway
    ├─ SUCCESS → Update payment status, mark fine as paid
    └─ FAILED → Record failure reason
```

---

## 🛠️ Service Layer Abstraction

The system abstracts payment gateway logic into services:

```
paymentController
    ↓
paymentService (business logic)
    ↓
paymentGateway.service (abstracted gateway calls)
    ├─ khaltiGateway
    ├─ esewaGateway
    ├─ stripeGateway
    └─ cashGateway
```

To add a new gateway:
1. Add gateway implementation in `paymentGateway.service.js`
2. Implement `initiate()` and `verify()` methods
3. Update `getPaymentGateway()` function
4. No changes needed in controller/routes!

---

## 📈 Production Considerations

✅ **Database Indexes** - Optimized for all queries  
✅ **Error Handling** - Try-catch on all operations  
✅ **Authorization** - Users can only see their own records  
✅ **Concurrency** - Proper transaction handling  
✅ **Logging** - All payment operations should be logged  
✅ **Webhooks** - Secure webhook endpoints  
✅ **Encryption** - Store sensitive payment data securely  

---

## 📝 Files Created

```
src/
├── models/
│   ├── borrowing.model.js
│   └── payment.model.js
│
├── modules/
│   ├── borrowings/
│   │   ├── borrowing.repository.js
│   │   ├── borrowing.controller.js
│   │   └── borrowing.routes.js
│   │
│   └── payments/
│       ├── payment.repository.js
│       ├── payment.controller.js
│       └── payment.routes.js
│
└── services/
    ├── borrowing.service.js
    ├── payment.service.js
    └── paymentGateway.service.js
```

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 23, 2026
