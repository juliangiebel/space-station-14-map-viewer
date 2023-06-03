import Ajv from "ajv/dist/jtd";

const schema = {
    properties: {
        defaultMap: { type: "string" },
        mapListUrl: { type: "string" },
        mapDataUrl: { type: "string" }
    }
}

class Config {
    static ajv = new Ajv();

    constructor(defaultMap, mapListUrl, mapDataUrl) {
        this.defaultMap = defaultMap;
        this.mapListUrl = mapListUrl;
        this.mapDataUrl = mapDataUrl;
    }

    /**
     * Loads a config.json file and returns the parsed configuration object
     * @param url
     * @returns {Config}
     */
    static async loadConfiguration(url) {
        const request = new Request(url);
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`Failed to retrieve configuration! Status: ${response.status}`);
        }
        const json = await response.json();
        const validate = Config.ajv.compile(schema);

        if (!validate(json))
        {
            console.log(validate.errors);
            return;
        }

        window.config = json;
    }

    static format(string) {
        var s = string,  i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };
}

export default Config;