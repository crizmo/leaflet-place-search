# leaflet-place-search
<img width="200" height="auto" alt="image" src="https://github.com/user-attachments/assets/318a4c81-ee9e-40cd-a0b7-2ce71092bf9e" />

A reusable React place search component built for Leaflet maps.

<div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center;">
  <img width="250" height="auto" alt="image" src="https://github.com/user-attachments/assets/1cbbb665-34aa-40c8-9d79-683fa350bb20" />
  <img width="243" height="auto" alt="image" src="https://github.com/user-attachments/assets/432fecb3-bdc7-43ee-a676-fe3f235e7d96" />
</div>

<br />
<a href="https://ko-fi.com/kurizu" target="_blank">
   <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" />
</a>

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

`leaflet-place-search` declares `react`, `react-dom`, and `leaflet` as peer dependencies, so your app should already have those installed.

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
