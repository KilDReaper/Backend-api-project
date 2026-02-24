# 📚 AI Book Recommendation System - Quick Start Guide

## 🎯 What's New?

LibriFlow now features an intelligent AI-powered recommendation engine that suggests books based on:
- **User's reading history** (personalized)
- **Similar users' preferences** (collaborative filtering)
- **Trending books** (popularity-based)
- **Genre preferences** (content-based)
- **Book ratings and reviews** (quality-based)

---

## 🚀 Quick Start

### 1. Main Recommendation Endpoint

```bash
# Get recommendations (works for both logged-in and guest users)
GET /api/books/recommendations?limit=10
```

**Logged In:** Personalized recommendations based on your reading history  
**Guest:** Trending and popular books

### 2. Test It Now

**Without login (Trending books):**
```bash
curl http://localhost:5000/api/books/recommendations?limit=10
```

**With login (Personalized):**
```bash
curl http://localhost:5000/api/books/recommendations?limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📍 All Available Endpoints

| Endpoint | Auth Required | Description |
|----------|---------------|-------------|
| `GET /api/books/recommendations` | Optional | Main recommendation endpoint |
| `GET /api/books/recommendations/trending` | No | Trending books |
| `GET /api/books/recommendations/genre/:genre` | Optional | Genre-specific recommendations |
| `GET /api/books/recommendations/similar/:bookId` | No | Similar books |
| `GET /api/books/recommendations/explain/:bookId` | Optional | Why was this recommended? |

---

## 🧪 Testing Guide

### Step 1: Import Postman Collection
Import `LibriFlow_AI_Recommendations.postman_collection.json` into Postman.

### Step 2: Set Variables
- `base_url`: http://localhost:5000/api
- `jwt_token`: Your JWT token from login
- `book_id`: Any book's MongoDB ObjectId

### Step 3: Run Test Scenarios
1. **Guest Experience:** Run "Get Recommendations (Guest)"
2. **Logged-in Experience:** 
   - Register/Login
   - Borrow some books
   - Run "Get Recommendations (Logged In)"
   - Compare the difference!

---

## 🎨 How It Works

### For New Users (No Borrowing History)
```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │ Trending Mode   │
    ├─────────────────┤
    │ • Most borrowed │
    │ • Trending now  │
    │ • High rated    │
    │ • New releases  │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Top 10 Books   │
    └─────────────────┘
```

### For Returning Users (With History)
```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │ Personalized Mode   │
    ├─────────────────────┤
    │ 40% Genre Match     │
    │ 30% Similar Users   │
    │ 20% Trending        │
    │ 10% High Rated      │
    └────────┬────────────┘
             │
    ┌────────▼────────────┐
    │ Exclude Already     │
    │ Borrowed Books      │
    └────────┬────────────┘
             │
    ┌────────▼────────┐
    │  Top 10 Books   │
    └─────────────────┘
```

---

## 💡 Use Cases

### 1. Homepage - Show Trending Books
```javascript
fetch('http://localhost:5000/api/books/recommendations/trending?limit=5')
```

### 2. User Dashboard - Personalized "For You"
```javascript
fetch('http://localhost:5000/api/books/recommendations?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 3. Book Detail Page - "Similar Books"
```javascript
fetch(`http://localhost:5000/api/books/recommendations/similar/${bookId}?limit=5`)
```

### 4. Genre Page - Best in Category
```javascript
fetch('http://localhost:5000/api/books/recommendations/genre/Technology?limit=10')
```

### 5. Recommendation Explanation - "Why this book?"
```javascript
fetch(`http://localhost:5000/api/books/recommendations/explain/${bookId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## 🔧 Configuration

### Recommendation Weights (Customizable)
Edit `src/modules/recommendations/recommendation.service.js`:

```javascript
// Personalized Mode
genreBasedBooks: 40%    // Content-based filtering
collaborativeBooks: 30% // Similar users
trendingBooks: 20%      // Popular now
highRatedBooks: 10%     // Quality-based

// Trending Mode (Guests)
mostBorrowed: 35%       // All-time popular
trending: 35%           // Recent popular
highRated: 20%          // Quality
newReleases: 10%        // Fresh content
```

### Performance Tuning
```javascript
// How far back to look for trending books
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// Minimum reviews for "highly rated" books
totalReviews: { $gte: 5 }

// Minimum rating for quality recommendations
rating: { $gte: 4 }
```

---

## 📊 Example Response

```json
{
  "success": true,
  "message": "Personalized recommendations retrieved successfully",
  "data": {
    "personalized": true,
    "total": 10,
    "recommendations": [
      {
        "_id": "65abc...",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "genre": ["Technology", "Non-Fiction"],
        "rating": 4.7,
        "totalReviews": 125,
        "availableQuantity": 3,
        "reason": "Based on your reading preferences",
        "recommendationScore": 23.5
      }
    ],
    "metadata": {
      "userPreferences": {
        "topGenres": ["Technology", "Science"],
        "totalBorrowings": 15
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

---

## 🎓 Algorithm Details

### Content-Based Filtering
- Analyzes user's genre preferences from borrowing history
- Finds books matching top 3 preferred genres
- Scores based on genre overlap and book quality

### Collaborative Filtering
- Finds users who borrowed same books
- Calculates similarity score
- Recommends books from similar users' collections

### Popularity-Based
- Most borrowed books (all time)
- Trending books (last 30 days + rating)
- Combines recency with popularity

### Quality-Based
- Minimum 4.0 rating
- Minimum 5 reviews for credibility
- Prevents low-quality recommendations

---

## 🔍 MongoDB Aggregation Power

The system uses MongoDB's aggregation framework for performance:
- **Parallel queries** for different recommendation strategies
- **Indexed lookups** for fast user history retrieval
- **Efficient joins** using `$lookup` for book details
- **Score calculation** directly in database

---

## 📈 Future Enhancements

Ready for ML integration:
1. **TF-IDF** on book descriptions
2. **Neural collaborative filtering**
3. **Word embeddings** for semantic similarity
4. **Context-aware** recommendations (time, season)
5. **A/B testing** framework

---

## 🐛 Troubleshooting

### No recommendations returned?
- Ensure books exist with `status: "available"`
- Check `availableQuantity > 0`
- Verify borrowing data exists for collaborative filtering

### Only getting trending recommendations?
- User needs borrowing history for personalization
- Borrow 2-3 books to see personalized recommendations

### Slow response times?
- Check MongoDB indexes are created
- Reduce limit parameter
- Ensure database connection is stable

---

## 📚 Documentation

- **Full Documentation:** `AI_RECOMMENDATION_SYSTEM_DOCS.md`
- **Postman Collection:** `LibriFlow_AI_Recommendations.postman_collection.json`
- **Source Code:** `src/modules/recommendations/`

---

## ✨ Key Features

✅ **Smart Personalization** - Adapts to user preferences  
✅ **Guest Mode** - Works without login  
✅ **Multiple Strategies** - Hybrid algorithm for best results  
✅ **Collaborative Filtering** - Learn from similar users  
✅ **Genre-Based** - Perfect for category pages  
✅ **Similar Books** - Great for product pages  
✅ **Explainable AI** - Show why books are recommended  
✅ **Scalable** - Ready for ML/AI enhancements  
✅ **Fast** - Optimized MongoDB aggregations  
✅ **Production-Ready** - Clean code, error handling

---

## 🎉 Getting Started

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test without login:**
   ```bash
   curl http://localhost:5000/api/books/recommendations
   ```

3. **See the magic!** 🚀

---

**Version:** 1.0  
**Created:** February 24, 2026  
**Happy Recommending!** 📚✨
