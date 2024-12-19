import { applets } from "@web-applets/sdk";

const context = applets.getContext();

const location = new google.maps.LatLng(-33.867, 151.195);
const map = new google.maps.Map(document.getElementById("map"), {
  center: location,
  zoom: 15
});

context.setActionHandler("search", async ({ query }) => {
  const googlePlacesService = new google.maps.places.PlacesService(map);
  const requestSearch = {
    query,
    fields: ["name", "geometry"]
  };

  googlePlacesService.textSearch(requestSearch, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // From the results set an object with the data we need from the places
      const places = results.map((place) => ({
        business_status: place.business_status,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: {
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        place_id: place.place_id
      }));

      context.data = { places };
    } else {
      context.data = { error: "No results" };
    }
  });
});

context.ondata = (event) => {
  if (!event.data.places) {
    document.body.innerHTML = `<p>${event.data.error}</p>`;
  } else {
    updateMap(event.data.places);
  }
};

/**
 * Update the map with the given places
 * @param {Array<Object>} places - Array of Google Maps place objects
 */
const updateMap = (places) => {
  // Create bounds object to encompass all places
  const bounds = new google.maps.LatLngBounds();

  places.forEach((place) => {
    if (place.business_status !== "OPERATIONAL") {
      return;
    }

    // Add a marker for each place
    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    // Extend bounds to include this place
    bounds.extend(place.geometry.location);

    // Add a info window to each marker
    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${place.name}</h3><p>${place.formatted_address}</p>`
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });

  // Fit the map to the bounds considering all the given places and center it
  map.fitBounds(bounds);

  // If there's only one place, set an appropriate zoom level
  if (places.length === 1) {
    map.setZoom(15);
  }
};
