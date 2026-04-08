import * as React from 'react'
import type { RefObject } from 'react'
import type { Map as LeafletMap } from 'leaflet'

declare module 'leaflet-place-search' {
  export interface PlaceSearchProps {
    mapRef: RefObject<LeafletMap> | LeafletMap
    searchPlaceholder?: string
    showWeather?: boolean
    showImages?: boolean
    className?: string
    nominatimUrl?: string
    openMeteoUrl?: string
  }

  const PlaceSearch: React.FC<PlaceSearchProps>
  export default PlaceSearch
}
