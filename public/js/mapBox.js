
export const displayMap= (locations)=>{

mapboxgl.accessToken = 'pk.eyJ1IjoibmljZW1hcHNmb3JtZSIsImEiOiJjbHNkOHg5ZGYwb2xxMmtvMWQ3d2xkeHRlIn0.fhzDJPw5eWMHzrbRbJG4qw';
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/nicemapsforme/clsd9f1gg000y01qu839y7z02', // style URL
	scrollZoom: false
	//center: [-74.5, 40], // starting position [lng, lat]
	//zoom: 9, // starting zoom
	//interactive : false
});

//console.log(map)

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {

	// console.log(loc);
	// Create marker
	const el = document.createElement('div');
	el.className = 'marker';

	// Add marker
	new mapboxgl.Marker({
		element: el,
		anchor: 'bottom'
	})
		.setLngLat(loc.coordinates)
		.addTo(map);

	// Add popup
	new mapboxgl.Popup({
		offset: 30
	})
		.setLngLat(loc.coordinates)
		.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
		.addTo(map);

	// Extend map bounds to include current location
	bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
	padding: {
		top: 200,
		bottom: 150,
		left: 100,
		right: 100
	}
});
}

