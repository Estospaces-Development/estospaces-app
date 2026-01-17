# Map Integration Setup Guide

## Current Implementation

The dashboard includes a map view component that shows nearby houses and agencies. Currently, it uses a placeholder implementation that demonstrates the UI structure and marker positioning.

## To Enable Real Mapbox Integration

### 1. Install Dependencies

```bash
npm install react-map-gl mapbox-gl
```

### 2. Get Mapbox Access Token

1. Sign up at [Mapbox](https://account.mapbox.com/)
2. Create an access token
3. Add to your `.env` file:

```
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Add Mapbox CSS

Add to `src/index.css`:

```css
@import 'mapbox-gl/dist/mapbox-gl.css';
```

### 4. Switch to Real Map Component

In `src/pages/Dashboard.jsx`, you can replace the import:

```javascript
// Current (placeholder)
import MapView from '../components/Dashboard/MapView';

// Real Mapbox (when ready)
import MapViewReal from '../components/Dashboard/MapViewReal';
```

Or uncomment the Mapbox code in `MapView.jsx` once the package is installed.

## Features

- ✅ Clickable pins for properties (red) and agencies (blue)
- ✅ Popup information on click
- ✅ Responsive design
- ✅ Legend showing marker types
- ✅ Ready for WebSocket integration for real-time updates

## Alternative: Google Maps

If you prefer Google Maps, you can use `@react-google-maps/api`:

```bash
npm install @react-google-maps/api
```

Update the component to use Google Maps API instead.


