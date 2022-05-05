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

		// Map views always need a projection.  Here we just want to map image
		// coordinates directly to map coordinates, so we create a projection that uses
		// the image extent in pixels.
		const extent = [0, 0, 5344, 4864];
		const projection = new Projection({
			code: 'map-image',
			units: 'pixels',
			extent: extent,
		});

		const marker = new Feature({
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
		});

		const spaceLayer = new Parallax([1.5,1.5], [0,0], {
			source: new ImageStatic({
				//attributions: '© <a href="https://wiki.spacestation14.io/wiki/File:Deltastation.png">Space Station 14 wiki</a>',
				url: 'https://user-images.githubusercontent.com/7806367/164307499-dc5b8e8a-af21-4ddb-904b-6b7c17e99cde.png',
				interpolate: false,
				projection: projection,
				imageExtent: extent,
				imageSmoothing: false
			}),
		})
		
		/*new Image({
			className: 'test',
			source: new ImageCanvas({
				//attributions: '© <a href="https://wiki.spacestation14.io/wiki/File:Deltastation.png">Space Station 14 wiki</a>',
				canvasFunction: function (extend) {
					return document.getElementById("space");
				},
				interpolate: false,
				projection: projection,
				imageExtent: extent
			}),
		});*/

		const mapLayer = new Image({
			className: 'test',
			source: new ImageStatic({
				//attributions: '© <a href="https://wiki.spacestation14.io/wiki/File:Deltastation.png">Space Station 14 wiki</a>',
				url: 'https://user-images.githubusercontent.com/7806367/164307499-dc5b8e8a-af21-4ddb-904b-6b7c17e99cde.png',
				interpolate: false,
				projection: projection,
				imageExtent: extent,
				imageSmoothing: false
			}),
		});

		const map = new Map({
			layers: [
				spaceLayer,
				mapLayer,
				vectorLayer
			],
			target: 'map',
			view: new View({
				projection: projection,
				center: getCenter(extent),
				//zoom: 2,
				//maxZoom: 7
				zoom: 1,
				resolutions: [8, 4, 2, 1, 1 / 2, 1 / 4],
				constrainResolution: true,
			}),
		});

		map.on('singleclick', function (evt) {
			console.log(evt.coordinate);
		});

		mapLayer.on('prerender', function (evt) {
			if (evt.frameState.viewState.zoom > 3) {
				evt.context.imageSmoothingEnabled = false;
				evt.context.webkitImageSmoothingEnabled = false;
				evt.context.mozImageSmoothingEnabled = false;
				evt.context.msImageSmoothingEnabled = false;
			} else {
				evt.context.imageSmoothingEnabled = true;
				evt.context.webkitImageSmoothingEnabled = true;
				evt.context.mozImageSmoothingEnabled = true;
				evt.context.msImageSmoothingEnabled = true;
				evt.context.imageSmoothingQuality = "high";
			}
		});