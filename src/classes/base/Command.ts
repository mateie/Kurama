import { SlashCommandBuilder, channelMention, roleMention } from '@discordjs/builders';
import { PermissionResolvable } from 'discord.js';
import Client from '../Client';

export default class Command {
    readonly client: Client;
    
    name: string | undefined;
    description: string | 'No Description';
    category: string | undefined;

    permission: PermissionResolvable | null;
    data!: SlashCommandBuilder;

    constructor(client: Client) {
        this.client = client;

        this.description = 'No Description';

        this.permission = null;
        this.data = new SlashCommandBuilder();
    }

    mentionRole = (roleId: string) => roleMention(roleId);
    mentionChannel = (channelId: string) => channelMention(channelId);
}