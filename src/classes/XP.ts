import { GuildMember } from 'discord.js';
import Client from './Client';

export default class XP {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }
    
    calculateLevel = (xp: number) => Math.floor(0.1 * Math.sqrt(xp));

    async giveXP(member: GuildMember, amount = 1) {
        const db = await this.client.database.members.get(member);

        db.xp += amount;
        await db.save();
    }

    async setLevel(member: GuildMember, level: number) {
        const db = await this.client.database.members.get(member);

        db.level = level;
        await db.save();
    }

    async levelUp(member: GuildMember) {
        const db = await this.client.database.members.get(member);

        db.level += 1;
        await db.save();
    }

    async getXP(member: GuildMember) {
        const db = await this.client.database.members.get(member);

        return db.xp;
    }

    async getLevel(member: GuildMember) {
        const db = await this.client.database.members.get(member);

        return db.level;
    }

    calculateXPForLevel(level: number) {
        let xp = 0;
        let currentLevel = 0;

        while (currentLevel != level) {
            xp++;
            currentLevel = this.calculateLevel(xp);
        }

        return xp;
    }

    calculateReqXP = (level: number) => level * level * 100 + 100; 
}