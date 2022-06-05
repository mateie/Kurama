import { ApolloServer } from "apollo-server";

import Client from "../Client";

import resolvers from "./gql/resolvers";
import typeDefs from "./gql/typeDefs";

export default class DashboardBE {
  readonly client: Client;
  readonly server: ApolloServer;

  constructor(client: Client) {
    this.client = client;

    this.server = new ApolloServer({
      resolvers,
      typeDefs,
      context: ({ req }) => ({ client: this.client, req }),
    });
  }

  async init() {
    await this.server
      .listen()
      .then(({ url }) => console.log(`Server running at ${url}`))
      .catch(console.error);
  }
}
