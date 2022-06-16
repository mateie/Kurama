import { ApolloServer } from "apollo-server";

import Client from "../Client";
import Auth from "./Auth";

import resolvers from "./gql/resolvers";
import typeDefs from "./gql/typeDefs";

export default class DashboardBE extends ApolloServer {
    readonly client: Client;
    readonly auth: Auth;

    constructor(client: Client) {
        super({
            resolvers,
            typeDefs,
            context: ({ req }) => ({ client: this.client, req }),
        });

        this.client = client;

        this.listen()
            .then(({ url }) => console.log(`Server running at ${url}`))
            .catch(console.error);

        this.auth = new Auth(this.client);
    }
}
