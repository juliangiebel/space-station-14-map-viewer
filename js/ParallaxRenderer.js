import { fromUserExtent } from "ol/proj";
import Parallax from "./ParallaxLayer";
import { IMAGE_SMOOTHING_DISABLED, IMAGE_SMOOTHING_ENABLED } from "ol/src/renderer/canvas/common";
import CanvasImageLayerRenderer from "ol/renderer/canvas/ImageLayer";
import { compose as composeTransform, makeInverse, toString as toTransformString } from "ol/transform";
import { assign } from "ol/obj";
import { containsExtent, intersects as intersectsExtent } from "ol/extent";

class ParallaxRenderer extends CanvasImageLayerRenderer {

	/**
	 * 
	 * @param {Parallax} parallaxLayer 
	 */
	constructor(parallaxLayer) {
		super(parallaxLayer);
		this.offset = parallaxLayer.offset;
		this.scale = parallaxLayer.scale;
	}

	/**
	 * 
	 * @param {import("ol/pixel").Pixel} pixel 
	 * @returns {Uint8ClampedArray}
	 */
	getData(pixel) {
		super.getData(pixel);
	}

	prepareFrame(frameState) {
		return super.prepareFrame(frameState);
	}

	/**
   * Render the layer.
   * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target that may be used to render content to.
   * @return {HTMLElement} The rendered element.
   */
	renderFrame(frameState, target) {
		const image = this.image_;
		const imageExtent = image.getExtent();
		const imageResolution = image.getResolution();
		const imagePixelRatio = image.getPixelRatio();
		const layerState = frameState.layerStatesArray[frameState.layerIndex];
		const pixelRatio = frameState.pixelRatio;
		const viewState = frameState.viewState;
		const viewCenter = viewState.center;
		const viewResolution = viewState.resolution;
		const size = frameState.size;
		const scale =
			(pixelRatio * imageResolution) / (viewResolution * imagePixelRatio);

		let width = Math.round(size[0] * pixelRatio);
		let height = Math.round(size[1] * pixelRatio);
		const rotation = viewState.rotation;
		if (rotation) {
			const size = Math.round(Math.sqrt(width * width + height * height));
			width = size;
			height = size;
		}

		// set forward and inverse pixel transforms
		composeTransform(
			this.pixelTransform,
			frameState.size[0] / 2,
			frameState.size[1] / 2,
			1 / pixelRatio,
			1 / pixelRatio,
			rotation,
			-width / 2,
			-height / 2
		);
		makeInverse(this.inversePixelTransform, this.pixelTransform);

		const canvasTransform = toTransformString(this.pixelTransform);

		this.useContainer(
			target,
			canvasTransform,
			layerState.opacity,
			this.getBackground(frameState)
		);

		const context = this.context;
		const canvas = context.canvas;

		if (canvas.width != width || canvas.height != height) {
			canvas.width = width;
			canvas.height = height;
		} else if (!this.containerReused) {
			context.clearRect(0, 0, width, height);
		}

		// clipped rendering if layer extent is set
		let clipped = false;
		let render = true;
		if (layerState.extent) {
			const layerExtent = fromUserExtent(
				layerState.extent,
				viewState.projection
			);
			render = intersectsExtent(layerExtent, frameState.extent);
			clipped = render && !containsExtent(layerExtent, frameState.extent);
			if (clipped) {
				this.clipUnrotated(context, frameState, layerExtent);
			}
		}

		const img = image.getImage();

		const xOffsetFromCenter = (viewCenter[0] - imageExtent[2] / 2) * this.scale[0] + this.offset[0];
		const yOffsetFromCenter = (viewCenter[1] - imageExtent[3] / 2) * this.scale[1] + this.offset[1];

		const transform = composeTransform(
			this.tempTransform,
			width / 2,
			height / 2,
			scale,
			scale,
			0,
			(imagePixelRatio * (imageExtent[0] - viewCenter[0])) - xOffsetFromCenter / imageResolution,
			(imagePixelRatio * (viewCenter[1] - imageExtent[3])) + yOffsetFromCenter / imageResolution
		);
		this.renderedResolution = (imageResolution * pixelRatio) / imagePixelRatio;

		const dw = img.width * transform[0];
		const dh = img.height * transform[3];

		if (!this.getLayer().getSource().getInterpolate()) {
			assign(context, IMAGE_SMOOTHING_DISABLED);
		}

		this.preRender(context, frameState);
		if (render && dw >= 0.5 && dh >= 0.5) {
			const dx = transform[4];
			const dy = transform[5];
			const opacity = layerState.opacity;
			let previousAlpha;
			if (opacity !== 1) {
				previousAlpha = context.globalAlpha;
				context.globalAlpha = opacity;
			}

			const clientWidth = context.canvas.clientWidth;
			const clientHeight = context.canvas.clientHeight;

			var matrix = new DOMMatrix();
			matrix = matrix.translateSelf(-xOffsetFromCenter, yOffsetFromCenter);
			//matrix = matrix.scaleSelf(scale / 2, scale / 2);

			const pattern = context.createPattern(img, 'repeat');
			pattern.setTransform(matrix);
			context.fillStyle = pattern;
			context.fillRect(0, 0, clientWidth, clientHeight);

			//TODO: Make it an option to switch between pattern fill and drawing a single image!
			/*context.drawImage(
				img,
				0,
				0,
				+img.width,
				+img.height,
				Math.round(dx),
				Math.round(dy),
				Math.round(dw),
				Math.round(dh)
			);*/

			if (opacity !== 1) {
				context.globalAlpha = previousAlpha;
			}
		}
		this.postRender(context, frameState);

		if (clipped) {
			context.restore();
		}
		assign(context, IMAGE_SMOOTHING_ENABLED);

		if (canvasTransform !== canvas.style.transform) {
			canvas.style.transform = canvasTransform;
		}

		return this.container;
	}
}

export default ParallaxRenderer;