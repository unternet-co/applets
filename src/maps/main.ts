import { applets } from '@web-applets/sdk';
import { Loader } from '@googlemaps/js-api-loader';

const self = applets.register();

self.setActionHandler('search', async ({ query }) => {
  self.data = { query, error: undefined };
  try {
    const places = await getPlacesForQuery(query);
    self.data = { query, places };
  } catch (error) {
    // Update to new error handling by throwing an error
    const errorMessage = getErrorMessage(error);
    self.data = { query, error: errorMessage };
  }
});

self.ondata = () => {
  clearAllPins();

  if (self.data.error) {
    renderAlert(self.data.error);
  }
  if (self.data.places) {
    renderPinsForPlaces(self.data.places);
  }
};

type Place = {
  placeId: string | undefined;
  name: string | undefined;
  icon: string | undefined;
  iconBGColor: string | undefined;
  address: string | undefined;
  location: {
    lat: number;
    lng: number;
  };
  rating: number | undefined;
  ratingTotal: number | undefined;
};

let map;
let infoWindow;
let currentMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

const loader = new Loader({
  apiKey: import.meta.env.VITE_PUBLIC_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['maps', 'places'],
});

async function initialiseMap() {
  const mapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    mapId: 'DEMO_MAP_ID' /** @TODO: Do we need a real mapId */,
  };

  const { Map, InfoWindow } = await loader.importLibrary('maps');
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    map = new Map(mapContainer, mapOptions);
    infoWindow = new InfoWindow();
  }
}

function placeResultHasLocation(
  place: google.maps.places.PlaceResult
): place is google.maps.places.PlaceResult & {
  geometry: { location: { lat: () => number; lng: () => number } };
} {
  return !!place.geometry?.location?.lat && !!place.geometry?.location?.lng;
}

function processPlaceResults(
  places: google.maps.places.PlaceResult[]
): Place[] {
  return places.filter(placeResultHasLocation).map((place) => ({
    placeId: place.place_id,
    name: place.name,
    icon: place.icon,
    iconBGColor: place.icon_background_color,
    address: place.formatted_address,
    location: {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    },
    rating: place.rating,
    ratingTotal: place.user_ratings_total,
  }));
}

async function getPlacesForQuery(query: string) {
  const { PlacesService } = await loader.importLibrary('places');

  const service = new PlacesService(map);

  const request = {
    query: query,
    fields: ['place_id', 'geometry', 'formatted_address', 'name'],
  };

  const places = await new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === 'OK' && results) {
        resolve(processPlaceResults(results));
      } else {
        reject(new Error(`Places search failed with status: ${status}`));
      }
    });
  });

  return places;
}

function generateContentForPlace(place: Place) {
  return `
  <div style="font-family: Arial, sans-serif; width: 300px; line-height: 1.5;">
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <img
        src="${place.icon}"
        alt="${place.name} icon"
        style="width: 30px; height: 30px; margin-right: 10px; background-color: ${place.iconBGColor}; border-radius: 50%;"
      />
      <h2 style="font-size: 18px; margin: 0;">${place.name}</h2>
    </div>
    <p style="margin: 0; font-size: 14px; color: gray;">${place.address}</p>
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 14px; margin-right: 8px;">Rating: ${place.rating}</span>
      <span style="font-size: 14px; color: gray;">(${place.ratingTotal} reviews)</span>
    </div>
  </div>`;
}

async function renderPinsForPlaces(places: Place[]) {
  const { LatLngBounds } = await loader.importLibrary('core');
  const { AdvancedMarkerElement } = await loader.importLibrary('marker');
  const bounds = new LatLngBounds();
  places.forEach((place) => {
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: place.location.lat, lng: place.location?.lng },
      title: place.name,
      gmpClickable: true,
    });
    marker.addListener('click', () => {
      infoWindow.close();
      const content = generateContentForPlace(place);
      infoWindow.setContent(content);
      infoWindow.open(marker.map, marker);
    });

    currentMarkers.push(marker);

    bounds.extend(place.location);
  });
  map.fitBounds(bounds);
}

function clearAllPins() {
  currentMarkers.forEach((marker) => {
    marker.map = null;
  });

  currentMarkers = [];
}

function errorHasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

function getErrorMessage(error: unknown) {
  if (errorHasMessage(error)) {
    return error.message;
  } else {
    return 'Something went wrong. Please try again.';
  }
}

function renderAlert(message: string) {
  const alertDiv = document.createElement('div');
  alertDiv.style.position = 'absolute';
  alertDiv.style.zIndex = '1000';
  alertDiv.style.bottom = '24px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.width = 'max-content';
  alertDiv.style.opacity = '0';
  alertDiv.style.transition = 'opacity 0.3s ease-in-out';
  alertDiv.innerHTML = `
      <div style="background-color: #FDEAEA; color: #E63946; padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; border: solid 1px #E63946; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            view-box="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="2"
            stroke-winecap="round"
            stroke-winejoin="round"
            width="24"
            height="24"
            style="flex-shrink: 0;"
          >
            <circle cx="12" cy="12" r="10" fill="#E63946" />
            <line x1="12" y1="7" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="white" />
          </svg>
          <div>
            ${message}
          </div>
        </div>
      </div>
    `;

  map.getDiv().appendChild(alertDiv);

  /** Fade the alert in */
  setTimeout(() => {
    alertDiv.style.opacity = '1';
  }, 1);

  /** Set a timeout to fade the alert out, then remove the alert */
  setTimeout(() => {
    alertDiv.style.opacity = '0';

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 300);
  }, 4000);
}

window.onload = () => initialiseMap();
