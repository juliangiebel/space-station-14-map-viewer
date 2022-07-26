# Space Station 14 map viewer

## Requirements
* Npm
* Vite https://vitejs.dev/
* OpenLayers https://openlayers.org/

## Building

```sh
yarn install
npm run build
```

## Map Json format

Maps are provided as json files containing the image paths and settings for the different layers.
The map selector is populated using the *list.json* file under *maps/list.json*
The file structure needs to follow the following example:

- maps
    list.json
    - {mapid}
        - map.json
        - {image}.png
        - ...
    - {mapid}
     - ...

### map.json:
```json
    {
	"id": "{map id}", //(Must be the same as the folder name)
	"name": "{map name}",
	"tiled": false, //Whether the map uses tiles instead of one image (Not yet implemented!)
	"url": "{map image url}", //The url to the map image used. Can be an external url
	"extent": [x1, y1, x2, y2], //The size of the image in px
    "attributions": "{Map author}",
    "parallax": [
		{
			"scale": [0.1, 0.1],
			"offset": [0, 0],
			"simple": false, //If a parallax is marked as simple it doesn't tile and doesn't use layers
			"minScale": 1, //This needs to be 1
			"source": {
				"url": "{parallax base image url}",
				"extent": [x1, y1, x2, y2]
			},
			"layers": [
				{
					"url": "{parallax layer url}",
					"composite": "{image composition}", //see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
					"parallaxScale": [0.1, 0.1]
				},
				...
			]
		},
		{ //A simple parallax layer
			"scale": [0.1, 0.1],
			"offset": [800,450],
			"simple": true,
			"source": {
				"url": "./image/misc/singularity.png",
				"extent": [0, 0, 864, 864]
			}
		}
	]
}
```

### list.json
```
{
	"maps": [
		{"name": "{map name}", "id": "{map id}"},
        ...
	]
}
```


