import Client from "@classes/Client";
import { User as DiscordUser } from "discord.js";
import Database from ".";

import User, { IUser } from "@schemas/User";

export default class DatabaseUsers {
    readonly client: Client;
    readonly database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async check(user: DiscordUser) {
        const dbUser = await User.findOne({ id: user.id });
        if (!dbUser) return false;
        return true;
    }

    async create(user: DiscordUser) {
        if (user.bot) return;

        const dbUser = new User({
            id: user.id,
            username: user.username,
        });

        await dbUser.save().catch(console.error);

        console.log(
            `Member added to the Database (ID: ${user.id} - Name: ${user.tag})`
        );

        return dbUser;
    }

    async get(user: DiscordUser) {
        const dbUser = await User.findOne({ id: user.id });
        if (!dbUser) return (await this.create(user)) as IUser;
        return dbUser as IUser;
    }

    getAll = async () => await User.find();

    async verify(user: DiscordUser) {
        const exists = await this.check(user);
        if (exists) return;
        this.create(user);
    }

    verifyAll() {
        this.client.users.cache.forEach(async (user) => {
            const exists = await this.check(user);
            if (exists) return;
            this.create(user);
        });
    }
}
