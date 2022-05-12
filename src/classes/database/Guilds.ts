import Client from '@classes/Client';
import { Guild as DiscordGuild } from 'discord.js';
import Database from '.';

import Guild, { IGuild } from '@schemas/Guild';

export default class DatabaseGuilds {
    client: Client;
    database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async check(guild: DiscordGuild) {
        const dbGuild = await Guild.findOne({ id: guild.id });
        if (!dbGuild) return false;
        return true;
    }

    async create(guild: DiscordGuild) {
        const newGuild: IGuild = new Guild({
            id: guild.id,
            name: guild.name,
        });

        await newGuild.save().catch(console.error);
        
        console.log(`Guild added to the database (ID: ${guild.id} - Name: ${guild.name})`);

        return newGuild;
    }

    async get(guild: DiscordGuild) {
        const dbGuild = await Guild.findOne({ id: guild.id });
        if (!dbGuild) return await this.create(guild);
        return dbGuild as IGuild;
    }

    getAll = async () => await Guild.find();

    verify() {
        this.client.guilds.cache.forEach(async guild => {
            const exists = await this.check(guild);
            if (exists) return;
            this.create(guild);
        });
    }
}