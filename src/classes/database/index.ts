import Client from '@classes/Client';
import mongoose from 'mongoose';

import DatabaseGuilds from './Guilds';
import DatabaseMembers from './Members';

const { DB } = process.env;

export default class Database {
    client: Client;

    connection: typeof mongoose;

    guilds: DatabaseGuilds;
    members: DatabaseMembers;

    constructor(client: Client) {
        this.client = client;

        this.connection = mongoose;

        this.guilds = new DatabaseGuilds(this.client, this);
        this.members = new DatabaseMembers(this.client, this);
    }

    connect() {
        this.connection.connect(DB as string)
            .then(() => console.log('Connected to the Database'))
            .catch(console.error);
    }
}