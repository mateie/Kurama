import Client from '@classes/Client';
import { Guild, GuildMember } from 'discord.js';
import Database from '.';

import Member, { IMember } from '@schemas/Member';

export default class DatabaseMembers {
    client: Client;
    database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async check(member: GuildMember) {
        const dbMember = await Member.findOne({ id: member.id });
        if (!dbMember) return false;
        return true;
    }

    async create(member: GuildMember) {
        if (member.user.bot) return;

        const newMember: IMember = new Member({
            id: member.id,
            username: member.user.username,
        });

        await newMember.save().catch(console.error);

        console.log(`Member added to the Database (ID: ${member.id} - Name: ${member.user.tag})`);

        return newMember;
    }

    async get(member: GuildMember) {
        const dbMember = await Member.findOne({ id: member.id });
        if (!dbMember) return await this.create(member) as IMember;
        return dbMember as IMember;
    }

    getAll = async () => await Member.find();

    verify(guild: Guild) {
        guild.members.cache.forEach(async member => {
            const exists = await this.check(member);
            if (exists) return;
            this.create(member);
        });
    }
}