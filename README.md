# Space Station 14 map viewer

## Requirements
* Npm
* Vite https://vitejs.dev/
* OpenLayers https://openlayers.org/

## Building

```sh
npm install
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
    "id": "Saltern", //(Must be the same as the folder name)
    "name": "Saltern",
    "grids": [ //Maps can contain multiple grids
        {
            "gridId": "854", //The grid id is used for positioning markers relative to a grid
            "offset": { //Every grid other than the first one is positioned on the map accordng the their offset
                "x": 83.37305,
                "y": -861.07245
            },
            "tiled": false, //Whether the map uses tiles instead of one image (Not yet implemented!)
            "url": "Saltern\\Saltern-0.webp", //The url to the map image used. Can be an external url
            "extent": { //The size of the image in px
                "a": {
                    "x": 0.0,
                    "y": 0.0
                },
                "b": {
                  "x": 4032.0,
                  "y": 2368.0
                }
            }
        }
    ],
    "attributions": null,
    "parallaxLayers": [
        {
            "scale": {
                "x": 0.1,
                "y": 0.1
            },
            "offset": {
                "x": 0.0,
                "y": 0.0
            },
            "static": false, //If a parallax is marked as static it doesn't tile and doesn't use layers
            "minScale": null, //Defaults to 1
            "source": {
                "url": "https://i.imgur.com/3YO8KRd.png",
                "extent": {
                      //The size of the image in px
                      "a": {
                        "x": 0.0,
                        "y": 0.0
                      },
                      "b": {
                        "x": 4032.0,
                        "y": 2368.0
                      }
                }
            },
            "layers": [
                {
                    "url": "https://i.imgur.com/IannmmK.png",
                    "composition": "source-over", //see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
                    "parallaxScale": {
                        "x": 0.1,
                        "y": 0.1
                    }
                },
                ...
            ]
        }
		{ //A simple parallax layer
			 "scale": {
                "x": 0.1,
                "y": 0.1
            },
            "offset": {
                "X": 0.0,
                "Y": 0.0
            },
            "static": true,
            "minScale": null,
            "source": {
                "url": "https://i.imgur.com/3YO8KRd.png",
                "extent": {
                    //The size of the image in px
                    "a": {
                      "x": 0.0,
                      "y": 0.0
                    },
                    "b": {
                      "x": 4032.0,
                      "y": 2368.0
                    }
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


