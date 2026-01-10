# 🏠 Zoopla API Integration Setup

## Overview

The Dashboard now uses **real property data from Zoopla API** with location-based filtering. Properties are fetched dynamically based on user location (geolocation, profile, or search input).

## 🔑 API Key Setup

### Step 1: Get Zoopla API Key

1. Sign up at [PropAPIS](https://propapis.com) or [Zoopla Developer Portal](https://developer.zoopla.co.uk/)
2. Create an API key
3. Add to your `.env` file:

```env
VITE_ZOOPLA_API_KEY=your_zoopla_api_key_here
```

### Step 2: Update Environment Variables

The app will automatically use the API key from `.env` file.

## 📍 Location Detection

The system detects user location in this priority order:

1. **Search Input** - Postcode, street, or full address entered by user
2. **Profile Location** - Location saved in user profile
3. **Browser Geolocation** - Automatic location from browser
4. **Default** - London (SW1A 1AA) if nothing else available

## 🎯 Features

### Featured Properties
- Fetched from Zoopla API based on user location
- Criteria: Agent-selected OR high-value OR newest listings
- Displays top 6 featured properties
- Shows in carousel/grid at top of dashboard

### Most Viewed Properties
- Aggregated from `viewed_properties` table in Supabase
- Filtered by user's location
- Shows top 3 most viewed properties
- Displays view count badges

### Nearby Fallback
- If no properties found in exact location:
  - Automatically searches within 5-20 mile radius
  - Shows message: "No properties found in [postcode]. Showing properties within X miles."
  - Sorts by relevance and distance

## 🔄 Property Tracking

### Viewed Properties
- Automatically tracked when user views property details
- Stored in `viewed_properties` table
- Used to calculate "most viewed" properties

### Saved Properties
- Users can save properties to favorites
- Stored in `saved_properties` table

### Applied Properties
- Users can apply to properties
- Stored in `applied_properties` table

## 🗺️ Map Integration

- Properties with coordinates are displayed on map
- Click markers to see property preview
- Map synced with featured and most viewed properties

## 🚀 Usage

### For Users:

1. **Automatic Location Detection:**
   - Dashboard automatically detects your location
   - Shows properties near you

2. **Search by Location:**
   - Enter postcode, street, or address in search bar
   - Properties update based on search

3. **View Properties:**
   - Featured properties at top
   - Most viewed properties below
   - Click "View Details" to see full property info

4. **Track Interactions:**
   - Views are automatically tracked
   - Save properties to favorites
   - Apply to properties

### For Developers:

```javascript
// Fetch featured properties
const featured = await propertyDataService.getFeaturedProperties({
  location: { postcode: 'SW1A 1AA', latitude: 51.5074, longitude: -0.1278 },
  limit: 6,
  userId: currentUser?.id,
});

// Fetch most viewed
const mostViewed = await propertyDataService.getMostViewedProperties({
  location: activeLocation,
  limit: 3,
  userId: currentUser?.id,
});

// Fetch with nearby fallback
const results = await propertyDataService.fetchPropertiesWithFallback({
  location: activeLocation,
  radius: 5,
  maxRadius: 20,
});
```

## ⚙️ Configuration

### Location Service
- Uses `postcodes.io` for UK postcode geocoding (free)
- Browser geolocation API for coordinates
- Reverse geocoding to get postcode from coordinates

### Zoopla API
- Base URL: `https://api.zoopla.co.uk/api/v1`
- Supports both sale and rent listings
- Radius search: 0-20 miles
- Pagination support

## 🐛 Troubleshooting

### No Properties Showing

1. **Check API Key:**
   - Verify `VITE_ZOOPLA_API_KEY` in `.env`
   - Restart dev server after adding

2. **Check Location:**
   - Verify location is detected correctly
   - Try searching for a specific postcode

3. **Check API Limits:**
   - Zoopla API has rate limits
   - Check API usage in developer portal

### Location Not Detected

1. **Browser Permissions:**
   - Allow location access in browser
   - Check browser console for errors

2. **Profile Location:**
   - Add location to user profile
   - Or use search input

### API Errors

- Check network tab for API responses
- Verify API key is valid
- Check Zoopla API status

## 📝 Notes

- **Real Data Only:** All properties are from Zoopla API (real listings)
- **Location-Based:** Properties filtered by user location
- **Automatic Fallback:** Shows nearby properties if no exact matches
- **Performance:** Results are cached and memoized
- **Responsive:** Works on desktop and mobile

---

**Ready to use!** Just add your Zoopla API key to `.env` and the dashboard will show real properties based on user location! 🎉

