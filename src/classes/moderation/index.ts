import Client from '@classes/Client';

import Warns from './Warns';
import Whitelist from './Whitelist';

export default class Moderation {
    client: Client;

    warns: Warns;
    whitelist: Whitelist;

    constructor(client: Client) {
        this.client = client;

        this.warns = new Warns(this.client);
        this.whitelist = new Whitelist(this.client);
    }
}