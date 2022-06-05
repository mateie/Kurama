import Client from "@classes/Client";
import mongoose from "mongoose";

import DatabaseGuilds from "./Guilds";
import DatabaseUsers from "./Members";

const { DB } = process.env;

export default class Database {
  client: Client;

  connection: typeof mongoose;

  guilds: DatabaseGuilds;
  users: DatabaseUsers;

  constructor(client: Client) {
    this.client = client;

    this.connection = mongoose;

    this.guilds = new DatabaseGuilds(this.client, this);
    this.users = new DatabaseUsers(this.client, this);
  }

  connect() {
    this.connection
      .connect(DB as string)
      .then(() => console.log("Connected to the Database"))
      .catch(console.error);
  }
}
