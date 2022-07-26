import { Map, View } from "ol";
import { getCenter } from "ol/extent";
import Projection from "ol/proj/Projection";
import Image from "ol/layer/Image"
import ImageStatic from "ol/source/ImageStatic";
import Parallax from "./ParallaxLayer";

class MapLoader {
	static async loadMap(mapName) {
		return this.loadMapJson(mapName)
			.then((data) => this.createMap(data));
	}

	static async loadMapJson(name) {
		const request = new Request(`maps/${ name }/map.json`);
		const response = await fetch(request);
		if (!response.ok) {
			throw new Error(`Failed to retrive map data! Status: ${response.status}`);
		}
		return await response.json();
	}

	static async loadLayers(map, name) {
		this.loadMapJson(name)
			.then(data => {
				const projection = new Projection({
					code: 'map-image',
					units: 'pixels',
					extent: data.extent,
				});

				const view = new View({
					projection: projection,
					center: getCenter(data.extent),
					zoom: 1,
					resolutions: [4, 2, 1, 1 / 2, 1 / 4],
					constrainResolution: true,
				});

				map.setView(view);

				map.setLayers(this.createLayers(data, projection));
			});
	}

	static createMap(data) {
		const projection = new Projection({
			code: 'map-image',
			units: 'pixels',
			extent: data.extent,
		});

		const layers = this.createLayers(data, projection);

		const map = new Map({
			layers: layers,
			target: 'map',
			view: new View({
				projection: projection,
				center: getCenter(data.extent),
				zoom: 1,
				resolutions: [4, 2, 1, 1 / 2, 1 / 4],
				constrainResolution: true,
			}),
		});

		map.on('singleclick', function (evt) {
			console.log(evt.coordinate);
		});

		map.set('map-name', data.name);

		return map;
	}

	static createLayers(data, projection) {
		const parallaxLayers = new Array();

		if (data.parallax != undefined) {
			for (const parallaxData of data.parallax) {

				const source = new ImageStatic({
					url: parallaxData.source.url,
					imageExtent: parallaxData.source.extent,
					interpolate: false,
					projection: projection
				});
				
				const parallax = new Parallax(parallaxData.scale, parallaxData.offset, {
					simple: parallaxData.simple, 
					//extent: data.extent,
					minScale: parallaxData.minScale,
					layers: parallaxData.layers,
					source: source
				});
	
				parallaxLayers.push(parallax);
			}
		}

		let mapLayer;

		if (data.tiled) {
			//TODO: Implement map tiling
			mapLayer = new Image({
				//className: 'map',
				source: new ImageStatic({
					attributions: data.attributions,
					url: data.url,
					interpolate: false,
					projection: projection,
					imageExtent: data.extent,
					imageSmoothing: false
				}),
			});

		} else {
			
			mapLayer = new Image({
				source: new ImageStatic({
					attributions: data.attributions,
					url: data.url,
					interpolate: false,
					projection: projection,
					imageExtent: data.extent,
					imageSmoothing: false
				}),
			});
		
		}

		mapLayer.on('prerender', function (evt) {
			if (evt.frameState.viewState.zoom < 2) {
				evt.context.imageSmoothingEnabled = true;
				evt.context.webkitImageSmoothingEnabled = true;
				evt.context.mozImageSmoothingEnabled = true;
				evt.context.msImageSmoothingEnabled = true;
				evt.context.imageSmoothingQuality = "high";
			} else {
				evt.context.imageSmoothingEnabled = false;
				evt.context.webkitImageSmoothingEnabled = false;
				evt.context.mozImageSmoothingEnabled = false;
				evt.context.msImageSmoothingEnabled = false;
			}
		});

		return [...parallaxLayers, mapLayer];
	}
}

export default MapLoader;