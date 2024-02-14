import Ajv from "ajv/dist/jtd";
import { Feature } from "ol";
import { Point } from "ol/geom";
import {Circle, Fill, Stroke, Style, Text} from 'ol/style';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

//console.log(Ajv);

const schema = {
    elements: {
        properties: {
            x: { type: "float64" },
            y: { type: "float64" }
        },
        optionalProperties: {
            name: { type: "string" },
            color: { type: "string" }
        }
    }
}

const markerStroke = new Stroke({
    color: '#FFFFFF',
    width: 1.25,
});

class Markers
{
    static ajv = new Ajv();

    static parseMarkerList(base64)
    {
        let object = JSON.parse(atob(base64));
        let validate = Markers.ajv.compile(schema);

        if(!validate(object))
        {
            console.log(validate.errors);
            return [];
        }

        return object;
    }

    static drawMarkerLayer(markers)
    {
        console.log(markers);
        let source = new VectorSource()
        let layer = new VectorLayer({ source: source, declutter: true });

        if(!Array.isArray(markers)) return 

        markers.forEach(marker => {
            let feature = new Feature({
                geometry: new Point([marker.x, marker.y])
            });

            let fill = new Fill({
                color: marker.color != undefined ? marker.color : "#000000"
            });

            let style = new Style({
                image: new Circle({
                    fill: fill,
                    stroke: markerStroke,
                    radius: 8
                }),
                fill: fill,
                stroke: markerStroke,
                text: new Text({
                    font: '16px Calibri,sans-serif',
                    text: marker.name != undefined ? marker.name : "",
                    textAlign: 'left',
                    textBaseline: 'center',
                    fill: new Fill({
                        color: '#FFFFFF',
                    }),
                    stroke: markerStroke,
                    backgroundFill: new Fill({ color: "#000000" }),
                    backgroundStroke: new Stroke({ color: "#000000"}),
                    offsetX: 16
                  }),
            });

            feature.setStyle(style);
            source.addFeature(feature);
        });

        return layer;
    }
}

export default Markers;