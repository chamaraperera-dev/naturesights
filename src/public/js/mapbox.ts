import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

interface Location {
  day: number;
  description: string;
  coordinates: [number, number];
}

export const displayMap = (locations: Location[]) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiY2hhbXBlcnp1bWFiIiwiYSI6ImNsZXd2MHJ3dDA4enkzcW53d3Ftb2c5emQifQ.ebKa_ILJ6g3078eO8zBFpg';
  const map = new mapboxgl.Map({
    //There should be a div with id map in the html file
    container: 'map',
    style: 'mapbox://styles/champerzumab/clex9oui7000s01mg2qk7k9nh',
    //Disable map zoom when using scroll
    scrollZoom: false,
    //Longitude first then latitude
    /*   center: [-118.113491, 34.111745],
    zoom: 10,
    interactive: false, */
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create  marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add marker
    //anchor: 'bottom' is to make the marker point to the bottom of the pin
    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)

      .addTo(map);
    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    // Add margins to the map
    padding: {
      top: 200,
      bottom: 150,
      left: 200,
      right: 200,
    },
  });
};
