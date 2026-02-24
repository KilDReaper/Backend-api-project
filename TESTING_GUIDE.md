# 🧪 AI Recommendation System - Testing Guide

## 🎯 Complete Test Workflow

### Prerequisites
```bash
# 1. Start MongoDB
mongod

# 2. Start the server
cd "C:\Backend api project"
npm run dev

# Server should start on http://localhost:5000
```

---

## Test Scenario 1: Guest User Experience

### Step 1: Get Trending Recommendations (No Login)
```bash
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Trending recommendations retrieved successfully",
  "data": {
    "personalized": false,
    "total": 10,
    "recommendations": [...books...],
    "metadata": {
      "algorithm": "trending",
      "message": "Login to get personalized recommendations based on your reading history"
    }
  }
}
```

### Step 2: Get Genre-Specific Recommendations
```bash
# Technology books
curl -X GET "http://localhost:5000/api/books/recommendations/genre/Technology?limit=5"

# Fiction books
curl -X GET "http://localhost:5000/api/books/recommendations/genre/Fiction?limit=5"
```

### Step 3: Get Trending Books
```bash
curl -X GET "http://localhost:5000/api/books/recommendations/trending?limit=10"
```

---

## Test Scenario 2: Registered User - Personalization

### Step 1: Register New User
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ai_test_user",
    "email": "aitest@example.com",
    "password": "Test@1234",
    "phoneNumber": "+1234567890"
  }'
```

### Step 2: Login and Get Token
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aitest@example.com",
    "password": "Test@1234"
  }'
```

**Copy the JWT token from response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 3: Get Initial Recommendations (New User)
```bash
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** Should return trending books (user has no history yet)

### Step 4: Borrow Books to Build Profile

**Borrow a Technology Book:**
```bash
curl -X POST "http://localhost:5000/api/borrowings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID_1",
    "dueDays": 14
  }'
```

**Borrow a Science Book:**
```bash
curl -X POST "http://localhost:5000/api/borrowings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID_2",
    "dueDays": 14
  }'
```

**Borrow a Non-Fiction Book:**
```bash
curl -X POST "http://localhost:5000/api/borrowings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID_3",
    "dueDays": 14
  }'
```

### Step 5: Get Personalized Recommendations
```bash
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Personalized recommendations retrieved successfully",
  "data": {
    "personalized": true,
    "total": 10,
    "recommendations": [
      {
        "_id": "...",
        "title": "...",
        "genre": ["Technology", "Non-Fiction"],
        "reason": "Based on your reading preferences",
        "recommendationScore": 18.5
      }
    ],
    "metadata": {
      "userPreferences": {
        "topGenres": ["Technology", "Science", "Non-Fiction"],
        "totalBorrowings": 3
      },
      "algorithm": "hybrid",
      "strategies": [
        "content-based (genre preferences)",
        "collaborative filtering",
        "trending books",
        "quality-based (ratings)"
      ]
    }
  }
}
```

**✅ Verify:**
- `personalized: true`
- `topGenres` includes Technology, Science, Non-Fiction
- Recommendations match these genres
- Borrowed books are excluded

---

## Test Scenario 3: Similar Books Feature

### Step 1: Get Book ID
```bash
# First, get a book (use admin or books endpoint)
curl -X GET "http://localhost:5000/api/admin/books?limit=1" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 2: Get Similar Books
```bash
curl -X GET "http://localhost:5000/api/books/recommendations/similar/BOOK_ID?limit=5"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Similar books retrieved successfully",
  "data": {
    "basedOn": {
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "genres": ["Technology", "Non-Fiction"]
    },
    "total": 5,
    "recommendations": [
      {
        "title": "The Pragmatic Programmer",
        "genre": ["Technology", "Non-Fiction"],
        "reason": "Similar to \"Clean Code\""
      }
    ]
  }
}
```

---

## Test Scenario 4: Recommendation Explanation

### Get Explanation for a Specific Book
```bash
curl -X GET "http://localhost:5000/api/books/recommendations/explain/BOOK_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Recommendation explanation retrieved successfully",
  "data": {
    "book": {
      "title": "Clean Code",
      "author": "Robert C. Martin"
    },
    "reasons": [
      {
        "type": "genre_match",
        "explanation": "Matches your preferred genres: Technology, Non-Fiction",
        "weight": "high"
      },
      {
        "type": "high_rating",
        "explanation": "Highly rated: 4.7/5 (125 reviews)",
        "weight": "medium"
      },
      {
        "type": "popular",
        "explanation": "Popular book borrowed 45 times",
        "weight": "medium"
      }
    ],
    "confidence": "high"
  }
}
```

---

## Test Scenario 5: All Genres Test

### Automated Genre Test Script

Create `test_genres.sh`:
```bash
#!/bin/bash

GENRES=("Fiction" "Non-Fiction" "Technology" "Science" "History" "Mystery" "Romance" "Fantasy" "Thriller" "Self-Help" "Business" "Biography")
BASE_URL="http://localhost:5000/api/books/recommendations/genre"

for genre in "${GENRES[@]}"
do
  echo "Testing $genre..."
  curl -X GET "$BASE_URL/$genre?limit=5"
  echo ""
  echo "---"
done
```

Run:
```bash
chmod +x test_genres.sh
./test_genres.sh
```

---

## Test Scenario 6: Collaborative Filtering Test

### Step 1: Create Multiple Users with Similar Taste

**User 1: Borrow Technology books**
```bash
# Register user1
curl -X POST "http://localhost:5000/api/auth/register" -H "Content-Type: application/json" -d '{"username": "tech_user1", "email": "tech1@test.com", "password": "Test@123", "phoneNumber": "+1111111111"}'

# Login user1
TOKEN1=$(curl -s -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email": "tech1@test.com", "password": "Test@123"}' | jq -r '.data.token')

# Borrow books (Technology genre)
curl -X POST "http://localhost:5000/api/borrowings" -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" -d '{"bookId": "TECH_BOOK_1", "dueDays": 14}'
curl -X POST "http://localhost:5000/api/borrowings" -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" -d '{"bookId": "TECH_BOOK_2", "dueDays": 14}'
```

**User 2: Borrow Same Technology books**
```bash
# Register user2
curl -X POST "http://localhost:5000/api/auth/register" -H "Content-Type: application/json" -d '{"username": "tech_user2", "email": "tech2@test.com", "password": "Test@123", "phoneNumber": "+2222222222"}'

# Login user2
TOKEN2=$(curl -s -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email": "tech2@test.com", "password": "Test@123"}' | jq -r '.data.token')

# Borrow SAME books + one extra
curl -X POST "http://localhost:5000/api/borrowings" -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" -d '{"bookId": "TECH_BOOK_1", "dueDays": 14}'
curl -X POST "http://localhost:5000/api/borrowings" -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" -d '{"bookId": "TECH_BOOK_2", "dueDays": 14}'
curl -X POST "http://localhost:5000/api/borrowings" -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" -d '{"bookId": "TECH_BOOK_3", "dueDays": 14}'
```

### Step 2: Get User1 Recommendations
```bash
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10" \
  -H "Authorization: Bearer $TOKEN1"
```

**Expected:** Should include TECH_BOOK_3 (borrowed by similar user2)

**✅ Verify:**
- User1 has not borrowed TECH_BOOK_3
- Recommendations include TECH_BOOK_3
- Reason mentions "Users with similar taste"

---

## Test Scenario 7: Performance Test

### Concurrent Requests Test
```bash
# Install Apache Bench (if not installed)
# Windows: Download from Apache website
# Linux: sudo apt-get install apache2-utils

# Run 100 requests with 10 concurrent
ab -n 100 -c 10 "http://localhost:5000/api/books/recommendations?limit=10"
```

**Expected Performance:**
- Response time: < 500ms per request
- No errors
- Consistent results

---

## 🔍 Verification Checklist

### ✅ Guest User Features
- [ ] Can get trending recommendations without login
- [ ] Can browse by genre without login
- [ ] Can see similar books without login
- [ ] Receives message to login for personalization

### ✅ Logged-in User Features
- [ ] Gets trending recommendations if no history
- [ ] Gets personalized recommendations after borrowing
- [ ] Borrowed books excluded from recommendations
- [ ] Top 3 genres reflected in recommendations
- [ ] Can get recommendation explanations

### ✅ Algorithm Verification
- [ ] Content-based: Books match user's genres
- [ ] Collaborative: Includes books from similar users
- [ ] Popularity: Includes trending/most borrowed
- [ ] Quality: Includes highly rated books (4+)

### ✅ Response Quality
- [ ] All books have `availableQuantity > 0`
- [ ] All books have `status: "available"`
- [ ] No duplicate books in recommendations
- [ ] Metadata includes algorithm info
- [ ] Recommendation scores present

### ✅ Edge Cases
- [ ] New user (no history) → Returns trending
- [ ] User with 1 borrow → Returns trending
- [ ] User with 3+ borrows → Returns personalized
- [ ] Invalid book ID → Proper error
- [ ] Invalid genre → Empty result or error

---

## 🐛 Common Issues & Solutions

### Issue: No recommendations returned
**Solution:**
```bash
# Check if books exist
curl http://localhost:5000/api/admin/books?limit=10

# Ensure books have:
# - status: "available"
# - availableQuantity > 0
```

### Issue: Not personalized for logged-in user
**Solution:**
```bash
# User needs borrowing history
# Borrow at least 2-3 books first
curl -X POST http://localhost:5000/api/borrowings \
  -H "Authorization: Bearer TOKEN" \
  -d '{"bookId": "...", "dueDays": 14}'
```

### Issue: Collaborative filtering not working
**Solution:**
```bash
# Need multiple users with similar borrowing patterns
# Create 2+ users and have them borrow same books
```

### Issue: Slow response times
**Solution:**
```sql
-- Check MongoDB indexes
db.borrowings.getIndexes()
db.books.getIndexes()

-- Expected indexes:
-- borrowings: { user: 1, status: 1 }, { book: 1, borrowDate: -1 }
-- books: { genre: 1, status: 1 }, { rating: -1, totalReviews: -1 }
```

---

## 📊 Expected Results Summary

| Test | Expected Outcome | Success Criteria |
|------|------------------|------------------|
| Guest recommendations | Trending books | `personalized: false` |
| New user recommendations | Trending books | No history → trending |
| User with history | Personalized | `topGenres` matches borrows |
| Genre-specific | Genre books | All books in specified genre |
| Similar books | Related books | Same genre as base book |
| Explanation | Reasons listed | Genre match, rating, popularity |
| Collaborative | Books from similar users | Similarity score > 0 |

---

## 🎉 Success Indicators

### ✅ System is Working Correctly When:

1. **Guest users** see trending/popular books
2. **New registered users** see trending books initially
3. **Users with history** see personalized recommendations
4. **Genre-based** recommendations match the genre
5. **Similar books** share genres with base book
6. **Explanations** provide clear reasons
7. **No duplicates** in recommendation list
8. **Response times** under 500ms
9. **All books** are available for borrowing
10. **Metadata** includes algorithm info

---

## 📞 Quick Test Commands

### One-liner Tests
```bash
# Guest recommendations
curl -s http://localhost:5000/api/books/recommendations | jq

# Trending books
curl -s http://localhost:5000/api/books/recommendations/trending | jq

# Genre: Technology
curl -s "http://localhost:5000/api/books/recommendations/genre/Technology" | jq

# With token
curl -s http://localhost:5000/api/books/recommendations \
  -H "Authorization: Bearer $TOKEN" | jq '.data.personalized'
```

---

## 🔧 Postman Testing

### Import Collection
1. Open Postman
2. Import `LibriFlow_AI_Recommendations.postman_collection.json`
3. Set variables:
   - `base_url`: http://localhost:5000/api
   - `jwt_token`: Your JWT token
   - `book_id`: Any book ID

### Run Test Scenarios
1. **Test Scenario - Complete Flow** folder
   - Runs full user journey
   - Register → Login → Borrow → Recommendations

2. **Test All Genres** folder
   - Tests all 12 genres
   - Verifies genre filtering

---

**Happy Testing!** 🚀🧪

Need help? Check:
- `AI_RECOMMENDATION_SYSTEM_DOCS.md` - Full documentation
- `RECOMMENDATION_QUICK_START.md` - Quick reference
- `IMPLEMENTATION_SUMMARY.md` - Architecture overview
