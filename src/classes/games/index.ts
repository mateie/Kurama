import Client from "@classes/Client";

import Warframe from "./Warframe";
import Valorant from "./Valorant";

export default class Games {
    private readonly client: Client;

    readonly warframe: Warframe;
    readonly valorant: Valorant;

    constructor(client: Client) {
        this.client = client;

        this.warframe = new Warframe(this.client);
        this.valorant = new Valorant(this.client);
    }
}
