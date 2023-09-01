import ImageTile from "ol/Tile";
import AsyncImage from "./AsyncImage.js";
import * as TileState from "ol/TileState.js";

class TileImagePreloader
{
    /**
     *
     * @param tile { ImageTile }
     * @param src { string }
     */
    static load(tile, src)
    {
        new AsyncImage(src + "?preload=true").executeOnLoad((image, data, isAsync) => {
            tile.setImage(image);
            const fullImage = new AsyncImage(src);
            fullImage.executeOnLoad((image, data, isAsync) => {
               tile.setImage(image);
            }, null);

            fullImage.promise.catch(e => tile.setState(TileState.ERROR));
        }, null);
    }
}

export default TileImagePreloader;
