import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { Guild, GuildMember, TextChannel } from 'discord.js';

export default class MemberJoinEvent extends Event implements IEvent {

    constructor(client: Client) {
        super(client);

        this.name = 'guildMemberAdd';
    }

    async run(member: GuildMember) {
        if (member.user.bot) return;

        const guild = member.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        this.client.database.members.verify(guild);

        if (!dbGuild.toggles.welcomeMessage) return;
        if (!dbGuild.channels.welcome) return;

        const channel = guild.channels.cache.get(dbGuild.channels.welcome) as TextChannel;

        const attachment = await this.client.canvas.member.welcome(member);

        channel.send({ files: [attachment] });
    }
}