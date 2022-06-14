import Client from "../Client";

export default class Marriage {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    marry() {
        throw new Error("Method not implemented");
    }

    divorce() {
        throw new Error("Method not implemented");
    }

    status() {
        throw new Error("Method not implemented");
    }
}
