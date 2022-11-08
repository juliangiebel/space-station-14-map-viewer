import MapLoader from "./MapLoader";
import MapSelector from "./MapSelector";
import Markers from "./Markers";

let map = null;
const query = new URLSearchParams(window.location.search);
const defaultMap = 'default';

const mapId = query.has('map') ? query.get('map').toLowerCase() : defaultMap;
const hideSelector = query.has('no-selector');

function getMarkers()
{
	return query.has('markers') ? Markers.parseMarkerList(query.get('markers')) : [];
}

function onMapChangedHandler(selectedMap, map) {
	const url = new URL(window.location);
	url.searchParams.set('map',selectedMap.id);
	window.history.pushState({}, '', url);
	map.addLayer(Markers.drawMarkerLayer(getMarkers()));
}

MapLoader.loadMap(mapId).then((loadedMap) => {
	map = loadedMap
	
	if (!hideSelector) map.addControl(new MapSelector({selected: {name: loadedMap.get('map-name'), id: mapId}, onMapChanged: onMapChangedHandler}));
	
	map.addLayer(Markers.drawMarkerLayer(getMarkers()));
});

/*const spaceLayer = new Parallax([0.1, 0.1], [0,0], {
	source: new ImageStatic({
		url: 'https://i.imgur.com/3YO8KRd.png',
		interpolate: false,
		projection: projection,
		imageExtent: [0, 0, 6000, 4000],//extent,
		imageSmoothing: false,
	}),
	layers: [
		{
			url: "https://i.imgur.com/IannmmK.png",
			composite: "source-over",
			parallaxScale: [0.1, 0.1],
		},
		{
			url: "https://i.imgur.com/T3W6JsE.png",
			composite: "lighter",
			parallaxScale: [0.2, 0.2],
		},
		{
			url: "https://i.imgur.com/69jsYV1.png",
			composite: "lighter",
			parallaxScale: [0.3, 0.3],
		},
	],
	minScale: 1
})

const testLayer = new Parallax([0.1, 0.1], [800,450], {
	source: new ImageStatic({
		url: './image/misc/singularity.png',
		interpolate: false,
		projection: projection,
		imageExtent: [0, 0, 864, 864],
	}),
	extent: data.extent,
	simple: true
});*/