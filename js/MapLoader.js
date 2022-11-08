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
		return this.loadMapJson(name)
			.then(data => {
				const map0Extent = data.Grids[0].Extent;

				const projection = new Projection({
					code: 'map-image',
					units: 'pixels',
					extent: [map0Extent.X1, map0Extent.Y1, map0Extent.X2, map0Extent.Y2],
				});

				const view = new View({
					projection: projection,
					center: getCenter([map0Extent.X1, map0Extent.Y1, map0Extent.X2, map0Extent.Y2]),
					zoom: 1,
					resolutions: [4, 2, 1, 1 / 2, 1 / 4],
					constrainResolution: true,
				});

				map.setView(view);

				map.setLayers(this.createLayers(data, projection));
			});
	}

	static createMap(data) {

		const map0Extent = data.Grids[0].Extent;

		const projection = new Projection({
			code: 'map-image',
			units: 'pixels',
			extent: [map0Extent.X1, map0Extent.Y1, map0Extent.X2, map0Extent.Y2],
		});

		const layers = this.createLayers(data, projection);

		const map = new Map({
			layers: layers,
			target: 'map',
			view: new View({
				projection: projection,
				center: getCenter([map0Extent.X1, map0Extent.Y1, map0Extent.X2, map0Extent.Y2]),
				zoom: 1,
				resolutions: [4, 2, 1, 1 / 2, 1 / 4],
				constrainResolution: true,
			}),
		});

		map.on('singleclick', function (evt) {
			console.log(evt.coordinate);
		});

		map.set('map-name', data.Name);

		return map;
	}

	/**
	 * 
	 * @param {*} data 
	 * @param {Projection} projection 
	 * @returns 
	 */
	static createLayers(data, projection) {

		const parallaxLayers = new Array();

		if (data.ParallaxLayers != undefined) {
			for (const parallaxData of data.ParallaxLayers) {

				let extent = parallaxData.Source.Extent;

				const source = new ImageStatic({
					url: parallaxData.Source.Url,
					imageExtent: [extent.X1, extent.Y1, extent.X2, extent.Y2],
					interpolate: false,
					projection: projection
				});
				
				const parallax = new Parallax([parallaxData.Scale.X, parallaxData.Scale.Y], [parallaxData.Offset.X, parallaxData.Offset.Y], {
					simple: parallaxData.Static, 
					//extent: data.extent,
					minScale: 1,
					layers: parallaxData.Layers,
					source: source
				});
	
				parallaxLayers.push(parallax);
			}
		}


		const baseGridOffset = data.Grids[0].Offset;
		const baseGridExtent = data.Grids[0].Extent;

		const gridLayers = new Array();

		let i = 0;
		for(const gridLayer of data.Grids)
		{
			let mapLayer;
			var extent = gridLayer.Extent;
			
			if (i > 0)
			{
				extent.X1 -= 4.12 * gridLayer.Offset.X;
				extent.Y1 += baseGridExtent.Y2 + 36 * gridLayer.Offset.Y;
				extent.X2 -= 4.12 * gridLayer.Offset.X;
				extent.Y2 += baseGridExtent.Y2 + 36 * gridLayer.Offset.Y;
			}

			/*const projection = new Projection({
				code: 'grid-image-' + i,
				units: 'pixels',
				extent: [extent.X1, extent.Y1, extent.X2, extent.Y2],
			});*/

			console.log(gridLayer.Url);

			if (gridLayer.Tiled) {
				//TODO: Implement map tiling
				mapLayer = new Image({
					//className: 'map',
					source: new ImageStatic({
						attributions: gridLayer.Attributions,
						url: gridLayer.Url,
						interpolate: false,
						projection: projection,
						imageExtent: [extent.X1, extent.Y1, extent.X2, extent.Y2],
						imageSmoothing: false
					}),
				});

			} else {
				
				mapLayer = new Image({
					source: new ImageStatic({
						attributions: gridLayer.Attributions,
						url: gridLayer.Url,
						interpolate: false,
						projection: projection,
						imageExtent: [extent.X1, extent.Y1, extent.X2, extent.Y2],
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

			gridLayers.push(mapLayer);
			i++;
		}
		return [...parallaxLayers, ...gridLayers];
	}
}

export default MapLoader;
