# leaflet-place-search

A reusable React place search component built for Leaflet maps.

## Features

- Search places using OpenStreetMap Nominatim
- Fly the map to the selected place
- Display place details from Wikipedia
- Optional image gallery from Wikimedia
- Optional weather forecast from Open-Meteo
- Lightweight plain React UI

## Requirements

- React 18+
- React DOM 18+
- Leaflet 1.9+
- React Leaflet 4+

## Installation

Install the package into your existing React/Leaflet app:

```bash
npm install leaflet-place-search
```

`leaflet-place-search` declares `react`, `react-dom`, and `leaflet` as peer dependencies, so your app should already have those installed. If your project does not yet include them, install them separately:

```bash
npm install react react-dom leaflet react-leaflet
```

## Usage

```jsx
import React, { useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import PlaceSearch from 'leaflet-place-search'

function App() {
  const mapRef = useRef(null)

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <PlaceSearch mapRef={mapRef} />
      </MapContainer>
    </div>
  )
}
```

## API / Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `mapRef` | `RefObject` | required | React ref with a Leaflet map instance. Must support `flyTo()`. |
| `searchPlaceholder` | `string` | `'Search for a place...'` | Placeholder text for the input field. |
| `showWeather` | `boolean` | `true` | Show the weather forecast tab. |
| `showImages` | `boolean` | `true` | Show the image gallery tab. |
| `className` | `string` | `''` | Additional wrapper CSS class. |
| `nominatimUrl` | `string` | `'https://nominatim.openstreetmap.org/search'` | Custom Nominatim search endpoint. |

## Notes

- The package is published as `leaflet-place-search` on npm.
- It works with any Leaflet map instance as long as the ref supports `flyTo()`.
- `react`, `react-dom`, and `leaflet` are peer dependencies.
- When you upload to GitHub, update the `repository` and `homepage` URLs in `package.json`.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.