import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { ChannelType, Guild, GuildMember, TextChannel } from "discord.js";

export default class MemberJoinEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "guildMemberAdd";
    }

    async run(member: GuildMember) {
        if (member.user.bot) return;

        const guild = member.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        this.client.database.users.verify(member.user);

        if (!dbGuild.toggles.welcomeMessage) return;
        if (!dbGuild.channels.welcome) return;

        const channel = guild.channels.cache.get(
            dbGuild.channels.welcome
        ) as TextChannel;

        if (channel.type !== ChannelType.GuildText) {
            const owner = guild.members.cache.get(guild.ownerId);
            owner?.send({
                content:
                    "You enabled Goodbye message and the Channel you set for it is not a Text Channel",
            });
        }

        const attachment = await this.client.canvas.member.welcome(member);

        channel.send({ files: [attachment] });

        if (!dbGuild.toggles.justJoined) return;

        const joinedRole = guild.roles.cache.get(dbGuild.roles.joined);

        if (!joinedRole) return;

        member.roles.add(joinedRole);
    }
}
