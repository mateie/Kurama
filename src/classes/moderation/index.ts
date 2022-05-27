import Client from '@classes/Client';

import Reports from './Reports';
import Warns from './Warns';

export default class Moderation {
    client: Client;

    reports: Reports;
    warns: Warns;

    constructor(client: Client) {
        this.client = client;

        this.reports = new Reports(this.client);
        this.warns = new Warns(this.client);
    }
}