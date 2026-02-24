# AI-Based Book Recommendation System Documentation

## Overview

LibriFlow's AI-powered recommendation engine uses a **hybrid recommendation algorithm** combining multiple strategies to provide intelligent, personalized book suggestions.

---

## 🧠 Recommendation Algorithms

### 1. **Content-Based Filtering**
- Analyzes user's past borrowed book genres
- Recommends books matching preferred categories
- Weight: **40%** for personalized recommendations

### 2. **Collaborative Filtering**
- Finds users with similar reading patterns
- Recommends books borrowed by similar users
- Uses similarity scoring based on common books
- Weight: **30%** for personalized recommendations

### 3. **Popularity-Based**
- Trending books (borrowed recently + highly rated)
- Most borrowed books across all users
- Weight: **20%** for personalized recommendations

### 4. **Quality-Based**
- Highest rated books (4+ stars, 5+ reviews minimum)
- Weight: **10%** for personalized recommendations

---

## 🎯 Recommendation Modes

### Personalized Mode (Logged-in Users)
**Algorithm Mix:**
- 40% Genre preferences (content-based)
- 30% Similar users (collaborative filtering)
- 20% Trending books
- 10% Highest rated books

**Features:**
- Excludes already borrowed books
- Adapts to user's reading history
- Top 3 preferred genres used for matching
- Combines multiple recommendation sources

### Trending Mode (Guest Users)
**Algorithm Mix:**
- 35% Most borrowed books
- 35% Trending books (recent + rated)
- 20% Highest rated books
- 10% New releases

**Features:**
- No personalization
- Pure popularity and quality-based
- Encourages user registration for better recommendations

---

## 📡 API Endpoints

### 1. Get Recommendations
```http
GET /api/books/recommendations
```

**Authentication:** Optional (personalizes if logged in)

**Query Parameters:**
- `limit` (optional, default: 10) - Number of recommendations

**Request Examples:**

**Logged-in User:**
```bash
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Guest User:**
```bash
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10"
```

**Response (Personalized):**
```json
{
  "success": true,
  "message": "Personalized recommendations retrieved successfully",
  "data": {
    "success": true,
    "personalized": true,
    "total": 10,
    "recommendations": [
      {
        "_id": "book_id_1",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "isbn": "978-0132350884",
        "genre": ["Technology", "Non-Fiction"],
        "description": "A handbook of agile software craftsmanship",
        "coverImageUrl": "https://example.com/cover.jpg",
        "price": 450,
        "rating": 4.7,
        "totalReviews": 125,
        "availableQuantity": 3,
        "reason": "Based on your reading preferences",
        "recommendationScore": 23.5
      },
      // ... more books
    ],
    "metadata": {
      "userPreferences": {
        "topGenres": ["Technology", "Science", "Non-Fiction"],
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

**Response (Trending):**
```json
{
  "success": true,
  "message": "Trending recommendations retrieved successfully",
  "data": {
    "success": true,
    "personalized": false,
    "total": 10,
    "recommendations": [
      // ... book objects
    ],
    "metadata": {
      "algorithm": "trending",
      "strategies": [
        "most borrowed",
        "trending now",
        "highest rated",
        "new releases"
      ],
      "message": "Login to get personalized recommendations based on your reading history"
    }
  }
}
```

---

### 2. Get Trending Books
```http
GET /api/books/recommendations/trending
```

**Authentication:** Not required

**Query Parameters:**
- `limit` (optional, default: 10)

**Example:**
```bash
curl -X GET "http://localhost:5000/api/books/recommendations/trending?limit=15"
```

---

### 3. Get Recommendations by Genre
```http
GET /api/books/recommendations/genre/:genre
```

**Authentication:** Optional (excludes borrowed books if logged in)

**Path Parameters:**
- `genre` - Genre name (Fiction, Technology, Science, etc.)

**Query Parameters:**
- `limit` (optional, default: 10)

**Example:**
```bash
# Guest user
curl -X GET "http://localhost:5000/api/books/recommendations/genre/Technology"

# Logged-in user (excludes borrowed books)
curl -X GET "http://localhost:5000/api/books/recommendations/genre/Fiction" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Recommendations for Technology genre retrieved successfully",
  "data": {
    "success": true,
    "genre": "Technology",
    "total": 10,
    "recommendations": [
      // ... books in Technology genre
    ],
    "metadata": {
      "algorithm": "genre-based"
    }
  }
}
```

**Available Genres:**
- Fiction
- Non-Fiction
- Science
- History
- Biography
- Mystery
- Romance
- Fantasy
- Thriller
- Self-Help
- Technology
- Business
- Other

---

### 4. Get Similar Books
```http
GET /api/books/recommendations/similar/:bookId
```

**Authentication:** Not required

**Path Parameters:**
- `bookId` - MongoDB ObjectId of the book

**Query Parameters:**
- `limit` (optional, default: 10)

**Example:**
```bash
curl -X GET "http://localhost:5000/api/books/recommendations/similar/65a1b2c3d4e5f6g7h8i9j0k1"
```

**Response:**
```json
{
  "success": true,
  "message": "Similar books retrieved successfully",
  "data": {
    "success": true,
    "basedOn": {
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt",
      "genres": ["Technology", "Non-Fiction"]
    },
    "total": 10,
    "recommendations": [
      {
        "_id": "book_id",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "genre": ["Technology", "Non-Fiction"],
        "reason": "Similar to \"The Pragmatic Programmer\"",
        "recommendationScore": 18.5,
        // ... other book fields
      }
    ],
    "metadata": {
      "algorithm": "similarity-based"
    }
  }
}
```

---

### 5. Get Recommendation Explanation
```http
GET /api/books/recommendations/explain/:bookId
```

**Authentication:** Optional

**Path Parameters:**
- `bookId` - MongoDB ObjectId of the book

**Example:**
```bash
curl -X GET "http://localhost:5000/api/books/recommendations/explain/65a1b2c3d4e5f6g7h8i9j0k1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Recommendation explanation retrieved successfully",
  "data": {
    "success": true,
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

## 🔄 Recommendation Flow Diagram

```
┌─────────────────┐
│   User Request  │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Logged? │
    └────┬────┘
         │
    ┌────▼────────────────────────┐
    │ YES                    NO    │
    │                              │
┌───▼────────────┐      ┌─────────▼────────┐
│  Personalized  │      │   Trending Mode  │
│     Mode       │      │                  │
├────────────────┤      ├──────────────────┤
│ Get User       │      │ Most Borrowed    │
│ History        │      │ (35%)            │
│                │      │                  │
│ Extract Top 3  │      │ Trending Books   │
│ Genres         │      │ (35%)            │
│                │      │                  │
│ ┌──────────┐  │      │ Highest Rated    │
│ │ 40% Genre│  │      │ (20%)            │
│ │ Based    │  │      │                  │
│ └──────────┘  │      │ New Releases     │
│               │      │ (10%)            │
│ ┌──────────┐  │      └──────────┬───────┘
│ │ 30% Col- │  │                 │
│ │ laborat. │  │                 │
│ └──────────┘  │                 │
│               │                 │
│ ┌──────────┐  │                 │
│ │ 20% Trend│  │                 │
│ └──────────┘  │                 │
│               │                 │
│ ┌──────────┐  │                 │
│ │ 10% Rated│  │                 │
│ └──────────┘  │                 │
└───────┬───────┘                 │
        │                         │
        └────────┬────────────────┘
                 │
        ┌────────▼────────┐
        │ Combine &       │
        │ Deduplicate     │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Return Top N    │
        │ Books           │
        └─────────────────┘
```

---

## 🧪 MongoDB Aggregation Examples

### Genre-Based Recommendation Pipeline
```javascript
// 1. Filter by available books in preferred genres
{ $match: { 
    status: "available",
    availableQuantity: { $gt: 0 },
    genre: { $in: ["Technology", "Science"] }
}}

// 2. Calculate matching score
{ $addFields: {
    genreMatchScore: {
      $size: { $setIntersection: ["$genre", ["Technology", "Science"]] }
    },
    qualityScore: {
      $add: [
        { $multiply: ["$rating", 2] },
        { $divide: ["$totalReviews", 10] }
      ]
    }
}}

// 3. Combine scores
{ $addFields: {
    personalizedScore: {
      $add: [
        { $multiply: ["$genreMatchScore", 5] },
        "$qualityScore"
      ]
    }
}}

// 4. Sort and limit
{ $sort: { personalizedScore: -1, rating: -1 } }
{ $limit: 10 }
```

### Collaborative Filtering Pipeline
```javascript
// 1. Get user's borrowed books
{ $match: { user: userId } }
{ $group: { _id: null, userBooks: { $addToSet: "$book" } } }

// 2. Find similar users
{ $lookup: {
    from: "borrowings",
    let: { userBooks: "$userBooks" },
    pipeline: [
      { $match: { $expr: {
        $and: [
          { $in: ["$book", "$$userBooks"] },
          { $ne: ["$user", userId] }
        ]
      }}},
      { $group: {
        _id: "$user",
        commonBooks: { $addToSet: "$book" },
        similarityScore: { $sum: 1 }
      }},
      { $sort: { similarityScore: -1 } },
      { $limit: 20 }
    ],
    as: "similarUsers"
}}

// 3. Get books from similar users
{ $lookup: {
    from: "borrowings",
    let: { similarUserId: "$similarUsers._id" },
    pipeline: [
      { $match: { $expr: { $eq: ["$user", "$$similarUserId"] } } },
      { $group: { _id: "$book", borrowCount: { $sum: 1 } } }
    ],
    as: "recommendedBooks"
}}

// 4. Calculate collaborative score
{ $group: {
    _id: "$recommendedBooks._id",
    collaborativeScore: {
      $sum: { $multiply: [
        "$similarUsers.similarityScore",
        "$recommendedBooks.borrowCount"
      ]}
    }
}}

// 5. Sort by score
{ $sort: { collaborativeScore: -1 } }
{ $limit: 10 }
```

---

## 🚀 Integration Examples

### Frontend Integration (React)

```javascript
// Fetch recommendations
const fetchRecommendations = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      'http://localhost:5000/api/books/recommendations?limit=10',
      {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      setRecommendations(result.data.recommendations);
      setIsPersonalized(result.data.personalized);
    }
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
  }
};

// Get similar books
const fetchSimilarBooks = async (bookId) => {
  const response = await fetch(
    `http://localhost:5000/api/books/recommendations/similar/${bookId}`
  );
  const result = await response.json();
  return result.data.recommendations;
};

// Get genre-specific recommendations
const fetchGenreRecommendations = async (genre) => {
  const response = await fetch(
    `http://localhost:5000/api/books/recommendations/genre/${genre}`
  );
  const result = await response.json();
  return result.data.recommendations;
};
```

---

## 📊 Recommendation Score Calculation

### Personalized Score Formula
```
personalizedScore = (genreMatchCount × 5) + qualityScore

where:
  qualityScore = (rating × 2) + (totalReviews / 10)
```

### Collaborative Score Formula
```
collaborativeScore = Σ(similarityScore × borrowCount)

where:
  similarityScore = number of common books between users
  borrowCount = times the book was borrowed by similar user
```

### Trending Score Formula
```
trendingScore = (recentBorrowCount × 2) + (rating × 1)

where:
  recentBorrowCount = borrows in last 30 days
```

---

## 🔧 Configuration & Optimization

### Recommendation Weights (Personalized Mode)
```javascript
// In recommendation.service.js
const WEIGHTS = {
  GENRE_BASED: 0.4,      // 40%
  COLLABORATIVE: 0.3,    // 30%
  TRENDING: 0.2,         // 20%
  HIGH_RATED: 0.1        // 10%
};
```

### Database Indexes for Performance
```javascript
// Borrowing collection indexes
borrowingSchema.index({ user: 1, status: 1 });
borrowingSchema.index({ book: 1, borrowDate: -1 });

// Book collection indexes
bookSchema.index({ genre: 1, status: 1 });
bookSchema.index({ rating: -1, totalReviews: -1 });
bookSchema.index({ availableQuantity: 1, status: 1 });
```

### Caching Strategy (Future Enhancement)
```javascript
// Cache recommendations for logged-in users
// Refresh every 1 hour or when user borrows new book
const CACHE_TTL = 3600; // 1 hour
```

---

## 🎓 Future ML/AI Enhancements

### Phase 1: Current Implementation ✅
- Content-based filtering (genre preferences)
- Collaborative filtering (similar users)
- Popularity and quality metrics
- MongoDB aggregation pipelines

### Phase 2: Advanced Features (Roadmap)
1. **TF-IDF for Book Descriptions**
   - Analyze book descriptions and summaries
   - Find semantic similarities

2. **Matrix Factorization**
   - SVD (Singular Value Decomposition)
   - ALS (Alternating Least Squares)

3. **Deep Learning Models**
   - Neural Collaborative Filtering
   - Word embeddings for book metadata

4. **Real-time Personalization**
   - Update recommendations on-the-fly
   - A/B testing for recommendation strategies

5. **Context-Aware Recommendations**
   - Time of day preferences
   - Seasonal trends
   - Reading speed analysis

---

## 🧪 Testing Examples

### Test Personalized Recommendations
```bash
# 1. Register and login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Borrow some books in specific genres
curl -X POST http://localhost:5000/api/borrowings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId":"book_id_technology"}'

# 3. Get personalized recommendations
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Guest Recommendations
```bash
# Get trending recommendations without login
curl -X GET "http://localhost:5000/api/books/recommendations?limit=10"
```

### Test Genre Recommendations
```bash
# Get Technology books
curl -X GET "http://localhost:5000/api/books/recommendations/genre/Technology?limit=15"
```

---

## 📈 Performance Metrics

### Expected Response Times
- Personalized recommendations: **200-500ms**
- Trending recommendations: **100-300ms**
- Genre-based: **50-200ms**
- Similar books: **50-150ms**

### Scalability Considerations
- MongoDB aggregation optimized with indexes
- Parallel execution of recommendation strategies
- Deduplication in-memory
- Limit queries to necessary data only

---

## 🐛 Error Handling

```javascript
// Service layer errors
try {
  const result = await recommendationService.getPersonalizedRecommendations(userId);
} catch (error) {
  // Fallback to trending recommendations
  const fallback = await recommendationService.getTrendingRecommendations();
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Failed to get recommendations: Database connection error",
  "error": "Internal server error"
}
```

---

## 📝 Best Practices

1. **Always provide fallback** - Trending recommendations if personalized fails
2. **Exclude borrowed books** - Don't recommend what user already has
3. **Diversity matters** - Mix genres and authors in recommendations
4. **Fresh content** - Include new releases in trending
5. **Quality threshold** - Minimum 5 reviews for "highly rated"
6. **Performance** - Use indexes, limit aggregation stages
7. **Feedback loop** - Track which recommendations are borrowed

---

## 🔐 Security & Privacy

- User borrowing history is private
- Recommendations don't expose other users' identities
- Optional authentication allows guest access
- JWT validation for personalized features
- No personally identifiable information in responses

---

## 🎯 Business Value

### For Users
- **Discovery**: Find books matching their taste
- **Time-saving**: Curated list instead of manual search
- **Exploration**: Exposed to similar books they might enjoy
- **Engagement**: Personalized experience increases retention

### For Library
- **Increased Borrowing**: Better recommendations = more borrows
- **User Retention**: Personalized features keep users coming back
- **Stock Optimization**: Identify popular genres and books
- **Data Insights**: User preferences for procurement decisions

---

## 📞 Support

For issues or questions about the recommendation system:
- Check error logs in console
- Verify MongoDB indexes are created
- Ensure borrowing and book collections have sufficient data
- Test with multiple users for collaborative filtering effectiveness

---

**Version:** 1.0  
**Last Updated:** February 24, 2026  
**Author:** LibriFlow Development Team
