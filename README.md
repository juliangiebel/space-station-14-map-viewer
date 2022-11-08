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
    - list.json
    - {mapid}
        - map.json
        - {image}.png
        - ...
    - {mapid}
     - ...

### Example map.json:
```json
{
    "Id": "Saltern", //(Must be the same as the folder name)
    "Name": "Saltern",
    "Grids": [ //Maps can contain multiple grids
        {
            "GridId": "854", //The grid id is used for positioning markers relative to a grid
            "Offset": { //Every grid other than the first one is positioned on the map accordng the their offset
                "X": 83.37305,
                "Y": -861.07245
            },
            "Tiled": false, //Whether the map uses tiles instead of one image (Not yet implemented!)
            "Url": "Saltern\\Saltern-0.webp", //The url to the map image used. Can be an external url
            "Extent": { //The size of the image in px
                "X1": 0.0,
                "Y1": 0.0,
                "X2": 4032.0,
                "Y2": 2368.0
            }
        }
    ],
    "Attributions": null,
    "ParallaxLayers": [
        {
            "Scale": {
                "X": 0.1,
                "Y": 0.1
            },
            "Offset": {
                "X": 0.0,
                "Y": 0.0
            },
            "Static": false, //If a parallax is marked as static it doesn't tile and doesn't use layers
            "MinScale": null, //Defaults to 1
            "Source": {
                "Url": "https://i.imgur.com/3YO8KRd.png",
                "Extent": {
                    "X1": 0.0,
                    "Y1": 0.0,
                    "X2": 6000.0,
                    "Y2": 4000.0
                }
            },
            "Layers": [
                {
                    "Url": "https://i.imgur.com/IannmmK.png",
                    "Composition": "source-over", //see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
                    "ParallaxScale": {
                        "X": 0.1,
                        "Y": 0.1
                    }
                },
                ...
            ]
        }
		{ //A simple parallax layer
			 "Scale": {
                "X": 0.1,
                "Y": 0.1
            },
            "Offset": {
                "X": 0.0,
                "Y": 0.0
            },
            "Static": true,
            "MinScale": null,
            "Source": {
                "Url": "https://i.imgur.com/3YO8KRd.png",
                "Extent": {
                    "X1": 0.0,
                    "Y1": 0.0,
                    "X2": 6000.0,
                    "Y2": 4000.0
                }
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


