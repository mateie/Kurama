import Client from '@classes/Client';
import axios, { AxiosRequestConfig } from 'axios';
import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Guild } from 'discord.js';

const { RAPID_API } = process.env;

export default class Whitelist {
    client: Client;
    
    constructor(client: Client) {
        this.client = client;
    }

    async add(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        word: string,
        guild: Guild,
    ) {
        const dbGuild = await this.client.database.guilds.get(guild);

        dbGuild.whitelistedWords.push(word);

        await dbGuild.save();

        return interaction.reply({ content: `Added **${word}** to the Word Whitelist`, ephemeral: true });
    }

    async addMultiple(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        words: string[],
        guild: Guild,
    ) {
        const dbGuild = await this.client.database.guilds.get(guild);

        words.forEach(word => dbGuild.whitelistedWords.push(word));

        await dbGuild.save();

        return interaction.reply({ content: `Added **${this.client.util.list(words)}** to the Word whitelist`, ephemeral: true });
    }

    async check(
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.guilds.get(guild);

        if (dbGuild.whitelistedWords.includes(word)) return true;
        return false;
    }

    async checkMultiple(
        words: string[],
        guild: Guild
    ) {
        const dbGuild = await this.client.database.guilds.get(guild);

        const already: string[] = [];

        words.forEach(word => {
            if (dbGuild.whitelistedWords.some(dbWord => word === dbWord)) already.push(word);
        });

        return already;
    }

    async get(guild: Guild) {
        const dbGuild = await this.client.database.guilds.get(guild);

        return dbGuild.whitelistedWords;
    }

    async isToxic(
        word: string | string[],
    ) {
        const opts: AxiosRequestConfig = {
            method: 'GET',
            url: 'https://community-purgomalum.p.rapidapi.com/containsprofanity',
            params: {text: word},
            headers: {
                'X-RapidAPI-Host': 'community-purgomalum.p.rapidapi.com',
                'X-RapidAPI-Key': RAPID_API as string,
            }
        };

        try {
            const { data: toxic } = await axios.request(opts);
            if (!toxic) return false;
            return true;
        } catch (err) {
            console.error(err);
        }
    }

    async remove(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.guilds.get(guild);

        dbGuild.whitelistedWords = dbGuild.whitelistedWords.filter(dbWord => dbWord !== word);

        await dbGuild.save();

        return interaction.reply({ content: `Removed **${word}** from the Word Whitelist`, ephemeral: true });
    }

    async removeMultiple(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        words: string[],
        guild: Guild
    ) {
        const dbGuild = await this.client.database.guilds.get(guild);

        words.forEach(word => {
            dbGuild.whitelistedWords = dbGuild.whitelistedWords.filter(dbWord => dbWord !== word);
        });

        await dbGuild.save();

        return interaction.reply({ content: `Removed **${this.client.util.list(words)}** from the Word Whitelist`, ephemeral: true });
    }
}