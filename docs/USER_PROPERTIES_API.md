# User Properties API Documentation

## Overview

Production-ready API for listing properties owned by authenticated users in the User Dashboard.

## Endpoint

**Service Function:** `getUserProperties()`

**Location:** `src/services/userPropertiesService.js`

## Authentication

- **Required:** Yes
- **Method:** Supabase Auth Session
- **Enforcement:** RLS (Row Level Security) policies

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | `string` | `null` | Filter by status: `'draft'` or `'published'` |
| `page` | `number` | `1` | Page number (1-indexed) |
| `limit` | `number` | `10` | Items per page (max: 100) |
| `sortBy` | `string` | `'created_at'` | Sort field (see allowed fields below) |
| `order` | `string` | `'desc'` | Sort order: `'asc'` or `'desc'` |

### Allowed Sort Fields

- `created_at`
- `updated_at`
- `title`
- `price`
- `bedrooms`
- `bathrooms`
- `city`
- `postcode`

## Response Format

### Success Response

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Property Title",
      "description": "Property description",
      "price": 250000,
      "property_type": "sale",
      "status": "published",
      "bedrooms": 3,
      "bathrooms": 2,
      "city": "London",
      "postcode": "SW1A 1AA",
      "user_id": "user-uuid",
      "agent_id": "user-uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      // ... other property fields
    }
  ],
  "error": null,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Response

```json
{
  "data": null,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "pagination": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | User not authenticated |
| `AUTH_ERROR` | Authentication session error |
| `VALIDATION_ERROR` | Invalid query parameters |
| `TABLE_NOT_FOUND` | Properties table doesn't exist |
| `RLS_ERROR` | Row Level Security policy violation |
| `QUERY_ERROR` | Database query error |
| `INTERNAL_ERROR` | Internal server error |

## Usage Examples

### Basic Usage

```javascript
import { getUserProperties } from '../services/userPropertiesService';

// Get first page of user's properties
const result = await getUserProperties();

if (result.error) {
  console.error('Error:', result.error.message);
} else {
  console.log('Properties:', result.data);
  console.log('Total:', result.pagination.totalCount);
}
```

### Filter by Status

```javascript
// Get only published properties
const result = await getUserProperties({ status: 'published' });

// Get only draft properties
const result = await getUserProperties({ status: 'draft' });
```

### Pagination

```javascript
// Get page 2 with 20 items per page
const result = await getUserProperties({
  page: 2,
  limit: 20
});

if (result.pagination.hasNextPage) {
  // Load next page
  const nextPage = await getUserProperties({
    page: result.pagination.page + 1,
    limit: 20
  });
}
```

### Sorting

```javascript
// Sort by price (ascending)
const result = await getUserProperties({
  sortBy: 'price',
  order: 'asc'
});

// Sort by title (descending)
const result = await getUserProperties({
  sortBy: 'title',
  order: 'desc'
});
```

### Complete Example

```javascript
// Get published properties, sorted by price (low to high), page 1, 15 per page
const result = await getUserProperties({
  status: 'published',
  page: 1,
  limit: 15,
  sortBy: 'price',
  order: 'asc'
});

if (result.error) {
  // Handle error
  if (result.error.code === 'UNAUTHORIZED') {
    // Redirect to login
  } else {
    // Show error message
    alert(result.error.message);
  }
} else {
  // Display properties
  result.data.forEach(property => {
    console.log(property.title, property.price);
  });
  
  // Show pagination info
  console.log(`Page ${result.pagination.page} of ${result.pagination.totalPages}`);
}
```

## Security

### Row Level Security (RLS)

The API enforces security through Supabase RLS policies:

- Users can only view properties where `user_id = auth.uid()` OR `agent_id = auth.uid()`
- All queries are automatically filtered by the authenticated user's ID
- No client-side filtering is relied upon

### RLS Policies

```sql
-- Users can view their own properties
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = agent_id
  );
```

## Setup Instructions

### 1. Run SQL Migration

Execute the SQL file in Supabase SQL Editor:

```bash
supabase_user_properties_api.sql
```

This will:
- Update status constraint to include 'draft' and 'published'
- Add `user_id` column if it doesn't exist
- Create/update RLS policies
- Add performance indexes

### 2. Verify Setup

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check if user_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('user_id', 'agent_id', 'status');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'properties';
```

## Testing

### Manual Testing

1. **Authenticate** as a user
2. **Create test properties** with `user_id` or `agent_id` set to your user ID
3. **Test different queries:**
   - Get all properties: `getUserProperties()`
   - Get published: `getUserProperties({ status: 'published' })`
   - Get drafts: `getUserProperties({ status: 'draft' })`
   - Test pagination: `getUserProperties({ page: 2, limit: 5 })`
   - Test sorting: `getUserProperties({ sortBy: 'price', order: 'asc' })`

### Browser Console Testing

```javascript
// In browser console (after importing the service)
import { getUserProperties } from './src/services/userPropertiesService';

// Test 1: Get all properties
const all = await getUserProperties();
console.log('All properties:', all);

// Test 2: Get published only
const published = await getUserProperties({ status: 'published' });
console.log('Published:', published);

// Test 3: Get drafts only
const drafts = await getUserProperties({ status: 'draft' });
console.log('Drafts:', drafts);

// Test 4: Pagination
const page1 = await getUserProperties({ page: 1, limit: 5 });
const page2 = await getUserProperties({ page: 2, limit: 5 });
console.log('Page 1:', page1);
console.log('Page 2:', page2);

// Test 5: Verify only user-owned properties appear
// Create properties with different user_id values
// Verify only your properties are returned
```

## Performance

- **Indexes:** Composite indexes on `(user_id, status)` and `(agent_id, status)`
- **Pagination:** Uses Supabase `range()` for efficient pagination
- **No Over-fetching:** Only requested fields and count are fetched
- **No Duplicates:** Unique constraints prevent duplicate rows

## Production Checklist

- [x] Authentication enforced
- [x] RLS policies in place
- [x] Parameter validation
- [x] Error handling
- [x] Pagination support
- [x] Sorting support
- [x] Status filtering
- [x] Performance indexes
- [x] No mock data
- [x] Clear error messages
- [x] Type safety (JSDoc comments)

## Support

For issues or questions:
1. Check error codes and messages
2. Verify RLS policies are active
3. Check Supabase logs
4. Verify user authentication status

