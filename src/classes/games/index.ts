import Client from "@classes/Client";

import Warframe from "./Warframe";
import Valorant from "./Valorant";
import ShinobiGame from "./shinobi";

export default class Games {
    private readonly client: Client;

    readonly shinobi: ShinobiGame;
    readonly warframe: Warframe;
    readonly valorant: Valorant;

    constructor(client: Client) {
        this.client = client;

        this.shinobi = new ShinobiGame(this.client);
        this.valorant = new Valorant(this.client);
        this.warframe = new Warframe(this.client);
    }
}
