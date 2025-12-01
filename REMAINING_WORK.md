# Phase 2 Implementation - Remaining Work Guide

## Overview
This document outlines the remaining 12 commits (out of 35 total) that need to be completed to finish the Phase 2 implementation.

**Current Status**: 23/35 commits complete (66%)

---

## Remaining Commits by Phase

### Phase 2: Component Integration (4 commits)

#### Commit 7: Integrate Review Form in Order Detail Page
**File**: `app/orders/[id]/page.tsx`

**Changes Needed:**
1. Import `ReviewForm` component
2. Add conditional rendering for completed orders
3. Check if user has already reviewed
4. Add review submission success handler
5. Refresh order data after review

**Code Snippet:**
```typescript
{order.status === 'COMPLETED' && !order.review && isBuyer && (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Leave a Review</h2>
        <ReviewForm
            orderId={order.id}
            targetId={order.sellerId}
            onSuccess={() => fetchOrder()}
        />
    </div>
)}
```

#### Commit 8: Integrate Review List in Order Detail Page
**File**: `app/orders/[id]/page.tsx`

**Changes Needed:**
1. Import `ReviewList` component
2. Fetch reviews for the order
3. Display reviews from both parties
4. Add loading state

**Code Snippet:**
```typescript
{order.review && (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Reviews</h2>
        <ReviewList reviews={[order.review]} />
    </div>
)}
```

#### Commit 9: Create Product Card with Wishlist Button
**File**: `components/products/ProductCard.tsx` (already exists, needs wishlist integration)

**Changes Needed:**
1. Ensure `WishlistButton` is properly integrated
2. Add optimistic UI updates
3. Handle wishlist toggle

#### Commit 10: Integrate Wishlist Across Product Pages
**Files**: 
- `app/products/page.tsx`
- `app/products/[id]/page.tsx`
- `app/page.tsx`

**Changes Needed:**
1. Use `ProductCard` component everywhere
2. Ensure wishlist state syncs across pages
3. Add toast notifications

---

### Phase 3: Product Categories & Filtering (1 commit)

#### Commit 18: Integrate Filters in Product Listing Page
**File**: `app/products/page.tsx`

**Changes Needed:**
1. Import all filter components
2. Add filter state management
3. Sync filters with URL query parameters
4. Update API calls with filter params
5. Add mobile filter drawer

**Code Snippet:**
```typescript
const [filters, setFilters] = useState({
    category: null,
    subcategory: null,
    conditions: [],
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'newest',
});

// Build query string from filters
const queryString = new URLSearchParams({
    ...(filters.category && { category: filters.category }),
    ...(filters.subcategory && { subcategory: filters.subcategory }),
    ...(filters.conditions.length && { conditions: filters.conditions.join(',') }),
    minPrice: filters.minPrice.toString(),
    maxPrice: filters.maxPrice.toString(),
    sortBy: filters.sortBy,
}).toString();
```

---

### Phase 4: Dispute Resolution (4 commits)

#### Commit 22: Create Dispute Chat Component
**File**: `components/disputes/DisputeChat.tsx`

**Features Needed:**
- Real-time messaging with Pusher
- Message list with sender identification
- Message input with send button
- Typing indicators
- Auto-scroll to latest message

#### Commit 23: Dispute Detail Page (Already Created!)
**Status**: ✅ Page exists at `app/disputes/page.tsx`

#### Commit 24: Create Dispute Detail Page
**File**: `app/disputes/[id]/page.tsx`

**Features Needed:**
- Dispute information display
- Timeline component
- Integrated chat component
- Resolution actions (for admin/moderator)
- Order details

#### Commit 26: Implement Dispute Management APIs
**Files**:
- `app/api/disputes/[id]/route.ts` - Update dispute status
- `app/api/disputes/[id]/messages/route.ts` - Send messages

**Endpoints Needed:**
- PATCH `/api/disputes/[id]` - Update status, add resolution
- POST `/api/disputes/[id]/messages` - Send message
- GET `/api/disputes/[id]/messages` - Get messages

---

### Phase 5: Seller Verification (3 commits)

#### Commit 33: Update User Profile with Badges and Stats
**File**: `app/users/[id]/page.tsx`

**Changes Needed:**
1. Import verification components
2. Fetch user badges and stats
3. Display trust score prominently
4. Show badge list
5. Display seller stats card (for sellers)

**Code Snippet:**
```typescript
{user.isVerified && (
    <VerificationBadge
        isVerified={user.isVerified}
        verificationDate={user.verificationDate}
    />
)}

<TrustScore score={user.trustScore} />

{badges.length > 0 && <BadgeList badges={badges} />}

{sellerStats && <SellerStatsCard stats={sellerStats} />}
```

#### Commit 34: Implement Seller Stats API
**File**: `app/api/users/[id]/stats/route.ts`

**Features Needed:**
- GET endpoint to fetch seller statistics
- Calculate metrics from orders and reviews
- Return formatted stats object

#### Commit 35: Additional Verification Features
**Enhancements:**
- Admin verification approval workflow
- Verification status tracking
- Email notifications for verification updates
- Document upload for verification

---

## Quick Implementation Guide

### 1. Review Integration (Commits 7-8)
```bash
# Edit app/orders/[id]/page.tsx
# Add ReviewForm and ReviewList components
git add app/orders/[id]/page.tsx
git commit -m "feat: integrate review form and list in order detail page"
```

### 2. Wishlist Integration (Commits 9-10)
```bash
# Update ProductCard and product pages
git add components/products/ProductCard.tsx app/products/page.tsx app/products/[id]/page.tsx
git commit -m "feat: integrate wishlist button across all product pages"
```

### 3. Filter Integration (Commit 18)
```bash
# Update app/products/page.tsx with all filters
git add app/products/page.tsx
git commit -m "feat: integrate filters in product listing page"
```

### 4. Dispute Chat (Commits 22, 24, 26)
```bash
# Create DisputeChat component
# Create dispute detail page
# Create dispute messaging APIs
git add components/disputes/DisputeChat.tsx app/disputes/[id]/page.tsx app/api/disputes/[id]/
git commit -m "feat: implement dispute chat and detail page with messaging"
```

### 5. Profile Updates (Commits 33-35)
```bash
# Update user profile page
# Create stats API
git add app/users/[id]/page.tsx app/api/users/[id]/stats/route.ts
git commit -m "feat: update user profile with badges, stats, and verification"
```

---

## Testing Checklist

### After Each Commit:
- [ ] TypeScript compiles without errors
- [ ] Components render correctly
- [ ] API endpoints return expected data
- [ ] UI is responsive
- [ ] Dark mode works
- [ ] Error handling works

### Integration Testing:
- [ ] Filters update product list correctly
- [ ] Reviews appear on completed orders
- [ ] Wishlist syncs across pages
- [ ] Dispute chat works in real-time
- [ ] Trust scores calculate correctly
- [ ] Badges appear on profiles

---

## Database Migrations

Before testing, run:
```bash
bunx prisma migrate dev --name phase2_complete
bunx prisma generate
```

---

## Environment Setup

Ensure these are configured:
```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=spin-stores-uploads
```

---

## Notes

- All components already exist, just need integration
- APIs are mostly complete, just need messaging endpoints
- Focus on user experience and error handling
- Test on mobile devices
- Ensure accessibility

---

## Estimated Time

- Review/Wishlist Integration: 1-2 hours
- Filter Integration: 1 hour
- Dispute Chat/Detail: 2-3 hours
- Profile Updates: 1-2 hours

**Total**: 5-8 hours of development time

---

## Success Criteria

✅ Users can filter products by category, price, condition
✅ Users can leave reviews on completed orders
✅ Users can add products to wishlist
✅ Users can chat in disputes
✅ Seller profiles show trust scores and badges
✅ All features work on mobile and desktop
