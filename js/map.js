		import { Map, Feature, View } from "ol";
		import { extend, getCenter } from "ol/extent";
		import Style from "ol/style/Style";
		import Circle from "ol/geom/Circle";
		import Projection from "ol/proj/Projection";
		import Point from "ol/geom/Point";
		import Fill from "ol/style/Fill";
		import Stroke from "ol/style/Stroke";
		import VectorLayer from "ol/layer/Vector";
		import VectorSource from "ol/source/Vector";
		import Image from "ol/layer/Image"
		import ImageStatic from "ol/source/ImageStatic";
		import Parallax from "./ParallaxLayer";

		let map = null;
		const query = new URLSearchParams(window.location.search);
		const defaultMap = 'bagelstation';

		const mapName = query.has('map') ? query.get('map').toLowerCase() : defaultMap;

		//if (query.has('map')) {
			loadMapJson(mapName)
				.then(data => {
					map = createMap(data);
					document.map = map;
				});
		//}

		function createMap(data) {
			//const extent = [0, 0, 5056, 4480];
			const projection = new Projection({
				code: 'map-image',
				units: 'pixels',
				extent: data.extent,
			});

			const parallaxLayers = new Array();

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
			
			}

			const map = new Map({
				layers: [
					...parallaxLayers,
					mapLayer
				],
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

			return map;
		}
		

		async function loadMapJson(name) {
			const request = new Request(`maps/${ name }/map.json`);
			const response = await fetch(request);
			if (!response.ok) {
				throw new Error(`Failed to retrive map data! Status: ${response.status}`);
			}
			return await response.json();
		}


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