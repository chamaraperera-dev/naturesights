var $3opbc$axios = require("axios");
var $3opbc$mapboxgldistmapboxgljs = require("mapbox-gl/dist/mapbox-gl.js");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
// import 'core-js';

const $8dfbfa351d503cce$export$596d806903d1f59e = async (email, password)=>{
    try {
        const res = await (0, ($parcel$interopDefault($3opbc$axios)))({
            method: "POST",
            url: "http://localhost:3000/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        const data = res.data;
        if (data.status === "success") {
            alert("Logged in successfully!");
            window.setTimeout(()=>{
                location.assign("/");
            }, 1500);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
};



const $c744b6dbb97cd186$export$4c5dd147b21b9176 = (locations)=>{
    (0, ($parcel$interopDefault($3opbc$mapboxgldistmapboxgljs))).accessToken = "pk.eyJ1IjoiY2hhbXBlcnp1bWFiIiwiYSI6ImNsZXd2MHJ3dDA4enkzcW53d3Ftb2c5emQifQ.ebKa_ILJ6g3078eO8zBFpg";
    const map = new (0, ($parcel$interopDefault($3opbc$mapboxgldistmapboxgljs))).Map({
        //There should be a div with id map in the html file
        container: "map",
        style: "mapbox://styles/champerzumab/clex9oui7000s01mg2qk7k9nh",
        //Disable map zoom when using scroll
        scrollZoom: false
    });
    const bounds = new (0, ($parcel$interopDefault($3opbc$mapboxgldistmapboxgljs))).LngLatBounds();
    locations.forEach((loc)=>{
        // Create  marker
        const el = document.createElement("div");
        el.className = "marker";
        // Add marker
        //anchor: 'bottom' is to make the marker point to the bottom of the pin
        new (0, ($parcel$interopDefault($3opbc$mapboxgldistmapboxgljs))).Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new (0, ($parcel$interopDefault($3opbc$mapboxgldistmapboxgljs))).Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        // Add margins to the map
        padding: {
            top: 200,
            bottom: 150,
            left: 200,
            right: 200
        }
    });
};


document.querySelector(".form")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    (0, $8dfbfa351d503cce$export$596d806903d1f59e)(email, password);
});
const $3f537b47474a1af7$var$mapElement = document.getElementById("map");
const $3f537b47474a1af7$var$locationsData = $3f537b47474a1af7$var$mapElement?.dataset.locations;
if (!$3f537b47474a1af7$var$mapElement || !$3f537b47474a1af7$var$locationsData) throw new Error("Map element or location data not found");
const $3f537b47474a1af7$var$locations = JSON.parse($3f537b47474a1af7$var$locationsData);
(0, $c744b6dbb97cd186$export$4c5dd147b21b9176)($3f537b47474a1af7$var$locations);


//# sourceMappingURL=bundle.js.map
