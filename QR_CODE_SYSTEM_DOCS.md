# 📱 QR Code-Based Book Issue System Documentation

## 🎯 Overview

LibriFlow's QR code system enables **fast, accurate book issuing** via QR code scanning. This admin-only feature streamlines the borrowing process at the library counter.

---

## 🚀 Quick Start

### Endpoint
```http
POST /api/borrow/scan
```

**Authentication:** Required (Admin only)

### Request Body
```json
{
  "qrCode": "BOOK-QR-12345",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Example Request
```bash
curl -X POST "http://localhost:5000/api/borrow/scan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "qrCode": "BOOK-QR-12345",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

---

## 📊 System Architecture

### Flow Diagram
```
┌─────────────┐
│ Admin Scans │
│   QR Code   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Find Book by QR     │
│ Code in Database    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Validate Book       │
│ - Exists?           │
│ - Available?        │
│ - Status OK?        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Validate User       │
│ - Exists?           │
│ - Active?           │
│ - Under limit?      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Create Borrowing    │
│ Record              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Update Book         │
│ availableQuantity   │
│ (decrease by 1)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Return Success      │
│ Response            │
└─────────────────────┘
```

---

## 🔧 Implementation Details

### 1. Book Model Changes

**Added Field:**
```javascript
qrCode: {
  type: String,
  unique: true,      // Each book has unique QR
  sparse: true,      // Allows multiple nulls
  trim: true,
  index: true        // Fast lookup
}
```

**Location:** `src/models/book.model.js`

### 2. Service Layer

**File:** `src/services/borrowing.service.js`

**Method:** `issueBookByQRCode(qrCode, userId)`

**Logic:**
```javascript
1. Validate inputs (qrCode, userId)
2. Find book by QR code
3. Check book availability (quantity > 0)
4. Validate user exists
5. Check borrowing limit (max 5 books)
6. Check duplicate borrow (same book)
7. Create borrowing record
8. Decrease availableQuantity
9. Update book status if out-of-stock
10. Return complete borrowing details
```

### 3. Controller Layer

**File:** `src/modules/borrowings/borrowing.controller.js`

**Method:** `scanQRCode(req, res, next)`

**Responsibilities:**
- Validate request body
- Check admin authorization
- Call service layer
- Handle errors with appropriate HTTP codes
- Format response

### 4. Routes Layer

**File:** `src/modules/borrow/borrow.routes.js`

**Route:** `POST /scan`

**Middleware Stack:**
1. `authMiddleware` - Validate JWT token
2. `adminMiddleware` - Ensure user is admin
3. `borrowingController.scanQRCode` - Handle request

---

## 📝 API Reference

### Request

**Endpoint:** `POST /api/borrow/scan`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| qrCode | String | Yes | QR code value from scanned book |
| userId | String | Yes | MongoDB ObjectId of user to issue book to |

**Example:**
```json
{
  "qrCode": "BOOK-QR-12345",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

---

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Book \"Clean Code\" successfully issued to john_doe",
  "data": {
    "borrowing": {
      "_id": "65x1y2z3a4b5c6d7e8f9g0h1",
      "user": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "book": {
        "_id": "65b1c2d3e4f5g6h7i8j9k0l1",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "isbn": "978-0132350884",
        "qrCode": "BOOK-QR-12345"
      },
      "borrowDate": "2026-02-24T10:30:00.000Z",
      "dueDate": "2026-03-10T10:30:00.000Z",
      "status": "active",
      "notes": "Issued via QR code scan: BOOK-QR-12345"
    },
    "bookDetails": {
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "978-0132350884",
      "qrCode": "BOOK-QR-12345"
    },
    "userDetails": {
      "username": "john_doe",
      "email": "john@example.com"
    },
    "dueDate": "3/10/2026",
    "remainingCopies": 2
  }
}
```

---

### Error Responses

#### 400 Bad Request - Missing QR Code
```json
{
  "success": false,
  "message": "QR code is required"
}
```

#### 400 Bad Request - Missing User ID
```json
{
  "success": false,
  "message": "User ID is required"
}
```

#### 403 Forbidden - Not Admin
```json
{
  "success": false,
  "message": "Access denied. QR code scanning is restricted to admins only"
}
```

#### 404 Not Found - Book Not Found
```json
{
  "success": false,
  "message": "Book not found with provided QR code"
}
```

#### 404 Not Found - User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 400 Bad Request - Book Not Available
```json
{
  "success": false,
  "message": "Book \"Clean Code\" is not available for borrowing. Available copies: 0"
}
```

#### 400 Bad Request - Borrowing Limit Reached
```json
{
  "success": false,
  "message": "User has reached the maximum borrowing limit (5 books). Current active: 5"
}
```

#### 400 Bad Request - Book Already Borrowed
```json
{
  "success": false,
  "message": "User already has \"Clean Code\" borrowed. Due date: 3/10/2026"
}
```

---

## ✅ Validation Rules

### QR Code Validation
- ✅ Must be provided
- ✅ Must be non-empty string
- ✅ Trimmed automatically
- ✅ Must exist in database

### Book Validation
- ✅ Book must exist with given QR code
- ✅ Book status must be "available"
- ✅ Book availableQuantity must be > 0
- ✅ Book not discontinued

### User Validation
- ✅ User must exist in database
- ✅ User must have active account
- ✅ User must not exceed borrowing limit (5 books)
- ✅ User must not already have this book borrowed

---

## 🔐 Security Features

### Admin-Only Access
```javascript
if (req.user.role !== "admin") {
  return res.status(403).json({
    success: false,
    message: "Access denied. QR code scanning is restricted to admins only"
  });
}
```

### JWT Authentication
- All requests require valid JWT token
- Token validated by `authMiddleware`
- Admin role checked by `adminMiddleware`

### Input Sanitization
- QR codes trimmed to remove whitespace
- User IDs validated as MongoDB ObjectIds
- SQL injection prevented by Mongoose

---

## 🎯 Business Logic

### Borrowing Record Creation
```javascript
{
  user: userId,
  book: bookId,
  borrowDate: new Date(),
  dueDate: new Date() + 14 days,
  status: "active",
  notes: "Issued via QR code scan: {qrCode}"
}
```

### Inventory Management
```javascript
// Decrease available copies
await Book.findByIdAndUpdate(bookId, {
  $inc: { availableQuantity: -1 }
});

// Update status if out of stock
if (book.availableQuantity - 1 === 0) {
  await Book.findByIdAndUpdate(bookId, {
    status: "out-of-stock"
  });
}
```

### Borrowing Limit
- **Maximum:** 5 active borrowings per user
- **Purpose:** Prevent hoarding, ensure fair access
- **Checked before:** Creating new borrowing

### Default Due Date
- **Duration:** 14 days from borrow date
- **Calculation:** `dueDate.setDate(borrowDate.getDate() + 14)`
- **Customizable:** Can be modified in service layer

---

## 📱 QR Code Format Recommendations

### Suggested Format
```
BOOK-{ISBN}-{COPY_NUMBER}
```

**Examples:**
- `BOOK-9780132350884-001`
- `BOOK-9780132350884-002`
- `BOOK-9780132350884-003`

### Alternative Formats
```
LIB-{BOOK_ID}-{YEAR}
```
**Example:** `LIB-65ABC123-2026`

```
{LIBRARY_CODE}-{CATEGORY}-{SERIAL}
```
**Example:** `CENTRAL-TECH-00123`

### Best Practices
1. **Unique:** Each book copy has unique QR code
2. **Readable:** Include meaningful information
3. **Short:** Easier to scan and store
4. **Consistent:** Follow standard format across library
5. **Validated:** Test QR codes before printing

---

## 🧪 Testing Guide

### Step 1: Setup Book with QR Code

```bash
# Add QR code to existing book (Admin)
curl -X PUT "http://localhost:5000/api/admin/books/BOOK_ID" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BOOK-QR-12345"
  }'
```

### Step 2: Get User ID

```bash
# Get user details
curl -X GET "http://localhost:5000/api/admin/users" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Copy user's _id from response
```

### Step 3: Scan QR Code to Issue Book

```bash
curl -X POST "http://localhost:5000/api/borrow/scan" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BOOK-QR-12345",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

### Step 4: Verify Borrowing Created

```bash
# Check user's active borrowings
curl -X GET "http://localhost:5000/api/borrowings/my/active" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Step 5: Verify Book Inventory Updated

```bash
# Check book availability
curl -X GET "http://localhost:5000/api/admin/books/BOOK_ID" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# availableQuantity should be decreased by 1
```

---

## 🔄 Complete Workflow Example

### Scenario: Admin Issues Book at Counter

**1. User Approaches Counter**
- User: "I'd like to borrow 'Clean Code'"
- Admin: Locates book, scans QR code

**2. Admin Scans QR Code**
```bash
# QR Scanner reads: BOOK-QR-12345
```

**3. Admin Enters User Info**
```bash
# Admin looks up user by email/phone
# Gets user ID: 65a1b2c3d4e5f6g7h8i9j0k1
```

**4. System Issues Book**
```bash
POST /api/borrow/scan
{
  "qrCode": "BOOK-QR-12345",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**5. System Validates**
- ✅ Book exists with QR code
- ✅ Book available (3 copies)
- ✅ User exists and active
- ✅ User has 2 active borrowings (under limit)
- ✅ User hasn't borrowed this book already

**6. System Creates Record**
- Creates borrowing record
- Sets due date: 14 days from now
- Decreases available copies: 3 → 2

**7. System Returns Response**
```json
{
  "success": true,
  "message": "Book \"Clean Code\" successfully issued to john_doe",
  "dueDate": "3/10/2026",
  "remainingCopies": 2
}
```

**8. Admin Confirms**
- Admin: "Book issued! Please return by March 10th."
- User receives book

---

## 📊 Database Changes

### Book Schema Update
```javascript
// Before
{
  title: String,
  isbn: String,
  availableQuantity: Number,
  // ... other fields
}

// After
{
  title: String,
  isbn: String,
  qrCode: String,        // NEW FIELD
  availableQuantity: Number,
  // ... other fields
}
```

### Borrowing Record Format
```javascript
{
  user: ObjectId,
  book: ObjectId,
  borrowDate: Date,
  dueDate: Date,
  returnedDate: Date | null,
  status: "active",
  fineAmount: 0,
  finePaid: false,
  notes: "Issued via QR code scan: BOOK-QR-12345"  // QR code logged
}
```

---

## 🚀 Integration with Frontend

### React Example

```javascript
import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';

function QRBookIssueSystem() {
  const [qrCode, setQrCode] = useState('');
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setQrCode(data.text);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const issueBook = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/borrow/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ qrCode, userId })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Issue failed:', error);
    }
  };

  return (
    <div>
      <h2>Scan Book QR Code</h2>
      
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />

      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button onClick={issueBook}>Issue Book</button>

      {result && (
        <div>
          <h3>{result.message}</h3>
          <p>Due Date: {result.data.dueDate}</p>
          <p>Remaining Copies: {result.data.remainingCopies}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Benefits

### For Library Staff
✅ **Fast Processing** - Scan QR, issue in seconds  
✅ **No Manual Entry** - Reduces typing errors  
✅ **Real-Time Validation** - Instant availability check  
✅ **Auto Inventory Update** - No manual stock management  

### For Library System
✅ **Accurate Records** - Every transaction logged  
✅ **Inventory Tracking** - Real-time availability  
✅ **User Management** - Automatic limit enforcement  
✅ **Audit Trail** - QR code logged in notes  

### For Users
✅ **Quick Service** - Faster checkouts  
✅ **Accurate** - Correct book every time  
✅ **Professional** - Modern library experience  

---

## 🔮 Future Enhancements

### Phase 1 (Current) ✅
- QR code field in database
- Admin scan endpoint
- Validation logic
- Inventory management

### Phase 2 (Planned)
- QR code generation API
- Bulk QR code printing
- Self-service kiosks
- Mobile app for users

### Phase 3 (Advanced)
- RFID integration
- Auto-checkout gates
- Real-time analytics
- Predictive inventory

---

## 📞 Support

### Common Issues

**Issue:** QR code not found
- **Solution:** Verify book has qrCode field populated
- **Check:** `db.books.findOne({ qrCode: "BOOK-QR-12345" })`

**Issue:** Book not available
- **Solution:** Check availableQuantity > 0
- **Check:** Book status is "available"

**Issue:** Access denied
- **Solution:** Ensure user has admin role
- **Check:** JWT token is valid and for admin user

---

**Version:** 1.0  
**Last Updated:** February 24, 2026  
**Status:** Production Ready ✅
