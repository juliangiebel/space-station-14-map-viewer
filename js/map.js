import MapLoader from "./MapLoader";
import MapSelector from "./MapSelector";

let map = null;
const query = new URLSearchParams(window.location.search);
const defaultMap = 'default';

const mapId = query.has('map') ? query.get('map').toLowerCase() : defaultMap;

function onMapChangedHandler(map) {
	const url = new URL(window.location);
	url.searchParams.set('map', map.id);
	window.history.pushState({}, '', url);
}

MapLoader.loadMap(mapId).then((loadedMap) => {
	map = loadedMap
	map.addControl(new MapSelector({selected: {name: loadedMap.get('map-name'), id: mapId}, onMapChanged: onMapChangedHandler}));
});

		/*const marker = new Feature({
	geometry: new Point([550, 130])
});

const fill = new Fill({
	color: 'rgba(0,0,255,0.4)',
});
const stroke = new Stroke({
	color: '#3399CC',
	width: 1.25,
});

marker.setStyle(
	new Style({
		image: new Circle({
			fill: fill,
			stroke: stroke,
			radius: 10,
		}),
		fill: fill,
		stroke: stroke,
	})
);

const vectorLayer = new VectorLayer({
	source: new VectorSource({
		//features: [marker]
	})
});*/


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