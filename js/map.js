import MapLoader from "./MapLoader";
import MapSelector from "./MapSelector";
import Markers from "./Markers";

let map = null;
const query = new URLSearchParams(window.location.search);
const defaultMap = 'Saltern';

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
