import { ApolloServer } from 'apollo-server';

import Client from '../Client';


export default class Dashboard {
    readonly client: Client;
    readonly server: ApolloServer;

    constructor(client: Client) {
        this.client = client;

        this.server = new ApolloServer({
            context: ({ req }) => ({ client: this.client, req }),
        });
    }

    async init() {
        await this.server.listen()
            .then(({ url }) => console.log(`Server running at ${url}`))
            .catch(console.error);
    }
}