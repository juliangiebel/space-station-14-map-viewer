import { fromUserExtent } from "ol/proj";
import Parallax from "./ParallaxLayer";
import { IMAGE_SMOOTHING_DISABLED, IMAGE_SMOOTHING_ENABLED } from "ol/src/renderer/canvas/common";
import CanvasImageLayerRenderer from "ol/renderer/canvas/ImageLayer";
import { compose as composeTransform, makeInverse, toString as toTransformString } from "ol/transform";
import { assign } from "ol/obj";
import { containsExtent, intersects as intersectsExtent } from "ol/extent";
import AsyncImage from "./AsyncImage";

class ParallaxRenderer extends CanvasImageLayerRenderer {

	/**
	 * 
	 * @param {Parallax} parallaxLayer 
	 */
	constructor(parallaxLayer) {
		super(parallaxLayer);
		this.layers = parallaxLayer.layers || [];
		this.offset = parallaxLayer.offset;
		this.scale = parallaxLayer.scale;
		this.parentExtent = parallaxLayer.parentExtent;
		this.isSimple = parallaxLayer.isSimple;
		this.changed = () => parallaxLayer.changed();
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
		const imageScale = (pixelRatio * imageResolution) / (viewResolution * imagePixelRatio);

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

		const xOffsetFromCenter = (viewCenter[0] - this.parentExtent[2] / 2) * this.scale[0] * (this.isSimple ? 1 : (imageScale / 100)) + this.offset[0];
		const yOffsetFromCenter = (viewCenter[1] - this.parentExtent[3] / 2) * this.scale[1] * (this.isSimple ? 1 : (imageScale / 100)) + this.offset[1];

		const transform = composeTransform(
			this.tempTransform,
			width / 2,
			height / 2,
			imageScale,
			imageScale,
			0,
			(imagePixelRatio * (imageExtent[0] - viewCenter[0])) + xOffsetFromCenter / imageResolution,
			(imagePixelRatio * (viewCenter[1] - imageExtent[3])) - yOffsetFromCenter / imageResolution
		);
		this.renderedResolution = (imageResolution * pixelRatio) / imagePixelRatio;

		const img = image.getImage();

		if (!this.isSimple) {
			for (const layer of this.layers) {
				if (!layer.img)
					layer.img = new AsyncImage(layer.url);
			}
		}

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

			if (!this.isSimple) {

				this.drawPatternParallaxLayers(context, img, viewResolution, xOffsetFromCenter, yOffsetFromCenter, viewCenter, this.parentExtent);
			
			} else {
				context.globalCompositeOperation = 'source-over';
				context.drawImage(
					img,
					0,
					0,
					+img.width,
					+img.height,
					Math.round(dx),
					Math.round(dy),
					Math.round(dw),
					Math.round(dh)
				);
			}



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

	/**
	 * @private
	 */
	fillWithImage(context, xOffset, yOffset, size, scale, image) {
		const startX = Math.floor(-xOffset - image.width) % image.width;
		const startY = Math.floor(yOffset - image.height) % image.height;
		const w = image.width * scale;
		const h = image.height * scale;

		var drawX = startX;
		var drawY = startY;
		while (true) {
			context.drawImage(image, drawX, drawY, w, h);
			drawX += w;
			if (drawX >= size[0]) {
				drawX = startX;
				drawY += h;
			}
			if (drawY >= size[1])
				break;
		}
	}

	/**
	 * @private
	 */
	drawPatternParallaxLayers(context, img, imageScale, xOffsetFromCenter, yOffsetFromCenter, viewCenter, imageExtent) {
		const clientWidth = context.canvas.clientWidth;
		const clientHeight = context.canvas.clientHeight;
		
		const matrixScale = Math.max(1 / imageScale, 1);//1 + (imageScale - 1) / 20

		var matrix = new DOMMatrix();
		matrix = matrix.scaleSelf(matrixScale, matrixScale);
		matrix = matrix.translateSelf(-xOffsetFromCenter /*+ (-xOffsetFromCenter * matrixScale)*/, yOffsetFromCenter /*+ (yOffsetFromCenter * matrixScale)*/);
		
		if (!this.layers) {
			context.globalCompositeOperation = 'source-over';
			this.fillWithImage(context, xOffsetFromCenter, yOffsetFromCenter, [clientWidth, clientHeight], 1, img);
		}

		for (const layer of this.layers) {
			if (!layer.img.loaded)
				continue;

			const data = {
				context: context,
				viewCenter: viewCenter,
				xOffsetFromCenter: (viewCenter[0] - imageExtent[2] / 2) * layer.parallaxScale[0] * (imageScale / 100) + this.offset[0],
				yOffsetFromCenter: (viewCenter[1] - imageExtent[3] / 2) * layer.parallaxScale[1] * (imageScale / 100) + this.offset[1],
				composite: layer.composite,
				size: [clientWidth, clientHeight],
				scale: matrixScale
			};;

			layer.img.executeOnLoad((image, data, isAsync) => {
				data.context.globalCompositeOperation = data.composite;
				this.fillWithImage(data.context, data.xOffsetFromCenter, data.yOffsetFromCenter, data.size, data.scale, image);
				if (isAsync) this.changed();
			}, data);
			
		}
	}
}

export default ParallaxRenderer;