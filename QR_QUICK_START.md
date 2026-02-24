# 📱 QR Code Book Issue System - Quick Reference

## 🚀 What's New?

LibriFlow now supports **QR code-based book issuing** for faster, more accurate checkouts at the library counter!

---

## ⚡ Quick Start

### Main Endpoint
```
POST /api/borrow/scan
```

**Admin Only** | **Requires JWT Token**

### Request
```json
{
  "qrCode": "BOOK-QR-12345",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Test It
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

## 📋 Implementation Checklist

### ✅ What Was Created

**1. Database Changes**
- [x] Added `qrCode` field to Book model
- [x] Added unique index for fast lookup
- [x] Supports null values (sparse index)

**2. Service Layer** (`src/services/borrowing.service.js`)
- [x] `issueBookByQRCode()` method
- [x] Validates QR code exists
- [x] Checks book availability
- [x] Validates user status
- [x] Enforces borrowing limit (5 books)
- [x] Updates inventory automatically

**3. Controller Layer** (`src/modules/borrowings/borrowing.controller.js`)
- [x] `scanQRCode()` endpoint handler
- [x] Admin authorization check
- [x] Input validation
- [x] Error handling with proper HTTP codes

**4. Routes** (`src/modules/borrow/borrow.routes.js`)
- [x] POST /api/borrow/scan
- [x] JWT authentication middleware
- [x] Admin authorization middleware

**5. Integration** (`src/app.js`)
- [x] Registered `/api/borrow` routes
- [x] No conflicts with existing routes

---

## 🎯 How It Works

```
Admin Scans QR → System Finds Book → Validates Everything → Creates Borrowing → Updates Inventory → Success!
```

### Validation Steps
1. ✅ QR code provided and valid
2. ✅ User ID provided and valid
3. ✅ Admin authorization
4. ✅ Book exists with QR code
5. ✅ Book is available (quantity > 0)
6. ✅ User exists in system
7. ✅ User under borrowing limit (< 5)
8. ✅ User doesn't already have this book

---

## 📝 Usage Examples

### Scenario 1: Standard Book Issue
```bash
# Admin scans book QR code: BOOK-QR-12345
# Admin looks up user ID: 65a1b2c3d4e5f6g7h8i9j0k1

curl -X POST "http://localhost:5000/api/borrow/scan" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BOOK-QR-12345",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Book \"Clean Code\" successfully issued to john_doe",
  "data": {
    "dueDate": "3/10/2026",
    "remainingCopies": 2
  }
}
```

### Scenario 2: Book Not Available
```bash
curl -X POST "http://localhost:5000/api/borrow/scan" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BOOK-OUT-OF-STOCK",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Book \"Popular Book\" is not available for borrowing. Available copies: 0"
}
```

### Scenario 3: User at Borrowing Limit
```bash
curl -X POST "http://localhost:5000/api/borrow/scan" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BOOK-QR-12345",
    "userId": "USER_WITH_5_BOOKS"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "User has reached the maximum borrowing limit (5 books). Current active: 5"
}
```

---

## 🔧 Setup Guide

### Step 1: Add QR Codes to Books

**Option A: Single Book**
```bash
curl -X PUT "http://localhost:5000/api/admin/books/BOOK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "BOOK-QR-12345"}'
```

**Option B: Via MongoDB**
```javascript
// Update single book
db.books.updateOne(
  { _id: ObjectId("BOOK_ID") },
  { $set: { qrCode: "BOOK-QR-12345" } }
);

// Bulk update with pattern
db.books.find().forEach(function(book) {
  db.books.updateOne(
    { _id: book._id },
    { $set: { qrCode: `BOOK-${book.isbn}-001` } }
  );
});
```

### Step 2: Generate QR Codes

**Recommended Format:**
```
BOOK-{ISBN}-{COPY_NUMBER}
```

**Examples:**
- `BOOK-9780132350884-001` (Clean Code, Copy 1)
- `BOOK-9780132350884-002` (Clean Code, Copy 2)
- `BOOK-9780201633610-001` (Design Patterns, Copy 1)

**Online QR Generator:**
1. Visit: https://www.qr-code-generator.com/
2. Enter QR code value (e.g., `BOOK-9780132350884-001`)
3. Download and print
4. Attach to book

### Step 3: Test the System

```bash
# 1. Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin_password"}' \
  | jq -r '.data.token')

# 2. Get user ID
USER_ID=$(curl -s http://localhost:5000/api/admin/users?limit=1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.data.users[0]._id')

# 3. Scan QR code
curl -X POST http://localhost:5000/api/borrow/scan \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"qrCode\":\"BOOK-QR-12345\",\"userId\":\"$USER_ID\"}"
```

---

## 🎨 QR Code Format Guidelines

### Best Practices

**✅ DO:**
- Use consistent format across library
- Include ISBN for reference
- Add copy number for multiple copies
- Keep codes short and readable
- Test codes before printing

**❌ DON'T:**
- Use special characters (/, \, etc.)
- Make codes too long (> 50 chars)
- Reuse codes across different books
- Use spaces in codes

### Recommended Formats

**Format 1: ISBN-Based**
```
BOOK-{ISBN}-{COPY}
Example: BOOK-9780132350884-001
```

**Format 2: Library Code**
```
LIB-{CATEGORY}-{SERIAL}
Example: LIB-TECH-00123
```

**Format 3: Simple Serial**
```
BK-{YEAR}-{SERIAL}
Example: BK-2026-00001
```

---

## 📊 Complete Response Format

### Success Response
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

## 🐛 Troubleshooting

### Common Errors

**Error: "QR code is required"**
```bash
# Fix: Include qrCode in request body
{"qrCode": "BOOK-QR-12345", "userId": "..."}
```

**Error: "Book not found with provided QR code"**
```bash
# Fix: Add QR code to book first
curl -X PUT http://localhost:5000/api/admin/books/BOOK_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"qrCode": "BOOK-QR-12345"}'
```

**Error: "Access denied. QR code scanning is restricted to admins only"**
```bash
# Fix: Use admin JWT token, not regular user token
# Check: User role should be "admin"
```

**Error: "Book not available for borrowing"**
```bash
# Check 1: availableQuantity > 0
# Check 2: Book status is "available"
# Check 3: Book not discontinued
```

---

## 📱 Frontend Integration

### React Component Example

```jsx
import React, { useState } from 'react';
import QrReader from 'react-qr-reader';

function QRBookIssue() {
  const [qrCode, setQrCode] = useState('');
  const [userId, setUserId] = useState('');

  const handleScan = (data) => {
    if (data) {
      setQrCode(data);
      issueBook(data, userId);
    }
  };

  const issueBook = async (qr, user) => {
    const response = await fetch('/api/borrow/scan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ qrCode: qr, userId: user })
    });
    
    const result = await response.json();
    alert(result.message);
  };

  return (
    <div>
      <QrReader onScan={handleScan} />
      <input value={userId} onChange={e => setUserId(e.target.value)} />
    </div>
  );
}
```

---

## 🎯 Key Features

✅ **Fast Processing** - Scan and issue in seconds  
✅ **Admin Only** - Secure, controlled access  
✅ **Auto Validation** - Checks everything automatically  
✅ **Inventory Sync** - Updates availability instantly  
✅ **Borrowing Limits** - Enforces 5 book maximum  
✅ **Duplicate Check** - Prevents issuing same book twice  
✅ **Audit Trail** - Logs QR code in borrowing notes  
✅ **Error Handling** - Clear error messages  

---

## 📈 Statistics

After implementation, you can track:
- Books issued via QR code (check notes field)
- Average checkout time (faster with QR)
- Error rates (QR code not found, etc.)
- Most scanned books

---

## 📞 Support

### Need Help?

**Documentation:**
- Full docs: `QR_CODE_SYSTEM_DOCS.md`
- Postman collection: `LibriFlow_QR_Code_System.postman_collection.json`

**Common Issues:**
1. Book not found → Add QR code to book first
2. Access denied → Use admin token
3. Not available → Check inventory
4. Limit reached → User has 5 active borrows

**Testing:**
1. Import Postman collection
2. Run "Complete Workflow Test"
3. Follow steps 1-7 in order

---

## 🚀 Next Steps

1. **Setup QR Codes**
   - Add QR codes to all books
   - Print and attach labels

2. **Train Staff**
   - Show how to scan QR codes
   - Explain error messages

3. **Test System**
   - Use Postman collection
   - Issue test books

4. **Go Live**
   - Start using at counter
   - Monitor for issues

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Date:** February 24, 2026

**Happy Scanning!** 📱📚✨
