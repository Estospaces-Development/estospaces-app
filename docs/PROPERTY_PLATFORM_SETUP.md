# UK Property Platform - Setup Guide

This guide will help you set up the full-featured UK property platform with Supabase integration.

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Environment Configuration](#environment-configuration)
3. [Features Overview](#features-overview)
4. [API Integration](#api-integration)
5. [Usage Examples](#usage-examples)

## 🗄️ Database Setup

### Step 1: Run the SQL Schema

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase_properties_schema.sql`
5. Click **Run** to execute

This will create:
- `properties` table with all required fields
- `saved_properties` table for user favorites
- `applied_properties` table for applications
- `viewed_properties` table for viewing history
- All necessary indexes for performance
- Row Level Security (RLS) policies

### Step 2: Verify Tables

After running the schema, verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'saved_properties', 'applied_properties', 'viewed_properties');
```

## 🔧 Environment Configuration

Your `.env` file should already contain:

```env
VITE_SUPABASE_URL=https://yydtsteyknbpfpxjtlxe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_aa7e18b6759fab96eb05bd8711784e2c4559dc1f
SUPABASE_PROJECT_REF=yydtsteyknbpfpxjtlxe
```

## ✨ Features Overview

### 1. Properties Management

- **Fetch UK Properties**: Automatically filters for `country = 'UK'` and `status = 'online'`
- **Search**: Full-text search across title, description, city, and postcode
- **Filters**: Location, property type (rent/sale), price range, bedrooms, bathrooms
- **Pagination**: Server-side pagination with configurable page size

### 2. User Interactions

- **Save Properties**: Users can save properties to favorites
- **Apply to Properties**: Users can apply to properties with status tracking
- **View Tracking**: Automatically tracks when users view properties
- **Status Indicators**: Visual badges showing saved/applied/viewed status

### 3. Map Integration

- **Interactive Map**: Mapbox/Google Maps integration
- **Property Markers**: Shows all properties with location data
- **Marker Clustering**: Groups markers at low zoom levels
- **Property Preview**: Click markers to see property details

### 4. Dashboard Features

- **Latest Properties Feed**: Shows newest UK properties
- **Most Viewed**: Displays properties sorted by view count
- **Quick Stats**: Total properties, saved favorites, applications
- **View All CTA**: Link to Browse Properties page

## 🔌 API Integration

### Properties Service

Located in `src/services/propertiesService.js`, provides:

```javascript
import * as propertiesService from '../services/propertiesService';

// Get UK properties
const { data, error } = await propertiesService.getUKProperties({
  status: 'online',
  country: 'UK',
  propertyType: 'rent', // or 'sale'
  city: 'London',
  minPrice: 500,
  maxPrice: 2000,
  minBedrooms: 2,
  limit: 20,
  offset: 0,
  userId: currentUser?.id, // Optional: for user status
});

// Search properties
const { data, error } = await propertiesService.searchProperties({
  searchQuery: 'apartment london',
  country: 'UK',
  status: 'online',
  userId: currentUser?.id,
});

// Save property
await propertiesService.saveProperty(propertyId, userId);

// Apply to property
await propertiesService.applyToProperty(propertyId, userId, {
  // application data
});

// Track view
await propertiesService.trackPropertyView(propertyId, userId);
```

### Properties Context

Located in `src/contexts/PropertiesContext.jsx`, provides:

```javascript
import { useProperties } from '../contexts/PropertiesContext';

const {
  properties,           // Array of properties
  savedProperties,      // User's saved properties
  appliedProperties,    // User's applications
  viewedProperties,     // User's viewing history
  currentUser,         // Current authenticated user
  loading,             // Loading state
  error,               // Error state
  filters,             // Current filters
  pagination,          // Pagination info
  setFilters,          // Update filters
  fetchProperties,     // Fetch properties
  searchProperties,    // Search properties
  saveProperty,        // Save a property
  unsaveProperty,      // Unsave a property
  applyToProperty,     // Apply to property
  trackPropertyView,   // Track view
} = useProperties();
```

## 📝 Usage Examples

### Example 1: Fetching Properties in a Component

```javascript
import { useProperties } from '../contexts/PropertiesContext';
import { useEffect } from 'react';

function MyComponent() {
  const { properties, loading, error, fetchProperties } = useProperties();

  useEffect(() => {
    fetchProperties(true); // true = reset pagination
  }, [fetchProperties]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {properties.map(property => (
        <div key={property.id}>{property.title}</div>
      ))}
    </div>
  );
}
```

### Example 2: Saving a Property

```javascript
import { useProperties } from '../contexts/PropertiesContext';

function PropertyCard({ property }) {
  const { saveProperty, unsaveProperty, currentUser } = useProperties();

  const handleSave = async () => {
    if (!currentUser) {
      alert('Please log in to save properties');
      return;
    }

    if (property.is_saved) {
      await unsaveProperty(property.id);
    } else {
      await saveProperty(property.id);
    }
  };

  return (
    <button onClick={handleSave}>
      {property.is_saved ? 'Unsave' : 'Save'}
    </button>
  );
}
```

### Example 3: Applying Filters

```javascript
import { useProperties } from '../contexts/PropertiesContext';

function Filters() {
  const { setFilters, fetchProperties } = useProperties();

  const handleFilterChange = (newFilters) => {
    setFilters({
      country: 'UK',
      status: 'online',
      propertyType: newFilters.type,
      city: newFilters.city,
      minPrice: newFilters.minPrice,
      maxPrice: newFilters.maxPrice,
      minBedrooms: newFilters.bedrooms,
    });
    // Filters will trigger automatic refetch
  };

  return (
    // Your filter UI
  );
}
```

## 🗺️ Map Integration

The map view is integrated using the existing `MapView` component. Properties with `latitude` and `longitude` will automatically appear on the map.

To enable map functionality:
1. Ensure properties have `latitude` and `longitude` values
2. The map will show markers for all properties
3. Click markers to see property details

## 🔒 Authentication

The platform uses Supabase authentication. Users must be authenticated to:
- Save properties
- Apply to properties
- Track viewing history

Anonymous users can still:
- Browse properties
- View property details
- Search and filter

## 📊 Performance Optimizations

1. **Indexing**: All common query fields are indexed
2. **Pagination**: Server-side pagination reduces data transfer
3. **Caching**: Properties context caches results
4. **Debouncing**: Search queries are debounced (500ms)
5. **Lazy Loading**: Images use lazy loading
6. **Memoization**: Components use React.memo where appropriate

## 🎨 UI Features

- **Dark Mode**: Full dark mode support
- **Responsive**: Mobile and desktop optimized
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no results

## 🚀 Next Steps

1. **Add Sample Data**: Insert test properties into the database
2. **Configure Map**: Set up Mapbox/Google Maps API keys if needed
3. **Test Authentication**: Ensure Supabase auth is working
4. **Customize Filters**: Adjust filter options as needed
5. **Add More Features**: Extend with additional functionality

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Context API](https://react.dev/reference/react/useContext)

## 🐛 Troubleshooting

### Properties not showing

1. Check Supabase connection in `.env`
2. Verify tables exist in database
3. Check browser console for errors
4. Ensure RLS policies allow reads

### Save/Apply not working

1. Verify user is authenticated
2. Check RLS policies for `saved_properties` and `applied_properties`
3. Check browser console for errors

### Map not displaying

1. Verify properties have `latitude` and `longitude`
2. Check MapView component configuration
3. Ensure map API keys are configured (if required)

---

**Need Help?** Check the code comments in:
- `src/services/propertiesService.js`
- `src/contexts/PropertiesContext.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/DashboardDiscover.jsx`

