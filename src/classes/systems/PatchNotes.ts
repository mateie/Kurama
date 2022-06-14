import Client from "@classes/Client";

export default class PatchNotes {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}
