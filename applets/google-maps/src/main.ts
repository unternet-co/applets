import { applets } from "@web-applets/sdk";
import { Loader } from "@googlemaps/js-api-loader";

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

const loader = new Loader({
  apiKey: import.meta.env.VITE_PUBLIC_MAPS_API_KEY,
  version: "weekly",
  libraries: ["maps", "places"],
});

async function initialiseMap() {
  const mapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    mapId: "DEMO_MAP_ID" /** @TODO: Do we need a real mapId */,
  };

  const { Map, InfoWindow } = await loader.importLibrary("maps");
  const mapContainer = document.getElementById("map");
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
  const { PlacesService } = await loader.importLibrary("places");

  const service = new PlacesService(map);

  const request = {
    query: query,
    fields: ["place_id", "geometry", "formatted_address", "name"],
  };

  const places = await new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === "OK" && results) {
        resolve(processPlaceResults(results));
      } else {
        /** @TODO: handle error state */
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
  const { LatLngBounds } = await loader.importLibrary("core");
  const { AdvancedMarkerElement } = await loader.importLibrary("marker");
  const bounds = new LatLngBounds();
  places.forEach((place) => {
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: place.location.lat, lng: place.location?.lng },
      title: place.name,
      gmpClickable: true,
    });
    marker.addListener("click", () => {
      infoWindow.close();
      const content = generateContentForPlace(place);
      infoWindow.setContent(content);
      infoWindow.open(marker.map, marker);
    });

    bounds.extend(place.location);
  });
  map.fitBounds(bounds);
}

const context = applets.getContext();

context.defineAction("search", {
  params: {
    query: {
      type: "string",
      description: "The search query for locations on the map.",
    },
  },
  handler: async ({ query }) => {
    try {
      const places = await getPlacesForQuery(query);
      context.data = { query, places };
    } catch (error) {
      context.data = { query };
      console.log(error);
    }
  },
});

context.ondata = () => {
  if (context.data.places) {
    renderPinsForPlaces(context.data.places);
  }
};

initialiseMap();
