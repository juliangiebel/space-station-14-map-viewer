
class AsyncImage {

    /**
     * 
     * @param {string} url The url of the image to load
     */
    constructor(url) {
        
        this.loaded = false;

        this.promise = new Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.src = url;
        })
        .then(image => {this.image = image; this.loaded = true;})
        .catch((reason) => console.error('Failed to load image: ' + reason));

    }

    /**
     * 
     * @param {(image: HTMLImageElement, data: any) => void} callback A function that gets executed when the image is loaded
     * @param {*} data additional data to pass to that function
     */
    executeOnLoad(callback, data) {
        if (this.loaded) {
            callback(this.image, data, false);
            return;
        }

        this.promise.then(() => callback(this.image, data, true));
    }
}

export default AsyncImage;
