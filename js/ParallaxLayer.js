import BaseImageLayer from "ol/layer/BaseImage";
import ParallaxRenderer from "./ParallaxRenderer";

/**
 * @template {import("ol/Image").default} ImageSourceType
 */
class Parallax extends BaseImageLayer {
	/**
	 * 
	 * @param {[number, number]} scale 
	 * @param {[number, number]} offset 
	 * @param {import("ol/Collection").Options<ImageSourceType>} opt_options 
	 */
	constructor(scale, offset, opt_options) {
		super(opt_options);
		this.scale = scale;
		this.offset = offset;
		this.layers = opt_options.layers;
		this.isSimple = !!opt_options.simple;
	}

	createRenderer() {
		return new ParallaxRenderer(this);
	}

	/**
	 * 
	 * @param {import("ol/pixel").Pixel} pixel 
	 * @returns {Uint8ClampedArray}
	 */
	getData(pixel) {
		return super.getData(pixel);
	}
}

export default Parallax;