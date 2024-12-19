import { applets } from "@web-applets/sdk";

const context = applets.getContext();

const map = new google.maps.Map(document.getElementById("map"), {
  center: new google.maps.LatLng(13, 13),
  zoom: 2
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

// Keep track of active info windows in the maps
let activeInfoWindows = [];

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

    // Define styles for the info window
    const styles = {
      title: "margin-top: 0;margin-bottom: 5px",
      ratingContainer: "display: flex;align-items: center;gap: 5px",
      ratingText: "font-size: 14px",
      starsContainer: "display: flex;gap: 1px",
      totalRatings: "color: #666; font-size: 14px",
      address: "margin-bottom: 0"
    };

    // Create a star rating visualization based on the given rating
    // It generates a string of HTML img elements representing full, half, and empty stars
    // The rating is rounded to the nearest half-star
    // Returns a string of HTML to be inserted into the infowindow content
    const createStarRating = (rating) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

      const starUrls = {
        full: "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_14.png",
        half: "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_half_14.png",
        empty: "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_empty_14.png"
      };

      return [
        ...Array(fullStars).fill(`<img src="${starUrls.full}" style="height: 14px; width: 14px;">`),
        ...(hasHalfStar ? [`<img src="${starUrls.half}" style="height: 14px; width: 14px;">`] : []),
        ...Array(emptyStars).fill(`<img src="${starUrls.empty}" style="height: 14px; width: 14px;">`)
      ].join("");
    };

    // Add an info window to each marker, with the following place details: name, rating (as shown in Google Maps), address
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <h3 style="${styles.title}">${place.name}</h3>
        ${
          place.rating
            ? `
          <div style="${styles.ratingContainer}">
            <span style="${styles.ratingText}">${place.rating.toFixed(1)}</span>
            <div style="${styles.starsContainer}">
              ${createStarRating(place.rating)}
            </div>
            <span style="${styles.totalRatings}">(${place.user_ratings_total.toLocaleString()})</span>
          </div>
        `
            : ""
        }
        <p style="${styles.address}">${place.formatted_address}</p>
      `
    });

    marker.addListener("click", () => {
      // Close all other info windows
      activeInfoWindows.forEach((window) => window.close());

      // Clear the array
      activeInfoWindows = [];

      // Open the new info window and add it to the tracking array
      infoWindow.open(map, marker);
      activeInfoWindows.push(infoWindow);
    });
  });

  // Fit the map to the bounds considering all the given places and center it
  map.fitBounds(bounds);

  // If there's only one place, set an appropriate zoom level
  if (places.length === 1) {
    map.setZoom(15);
  }
};
