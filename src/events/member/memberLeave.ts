import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";
import { Guild, GuildMember, TextChannel } from "discord.js";

export default class MemberLeaveEvent extends Event implements IEvent {
  constructor(client: Client) {
    super(client);

    this.name = "guildMemberRemove";
  }

  async run(member: GuildMember) {
    if (member.user.bot) return;

    const guild = member.guild as Guild;
    const dbGuild = await this.client.database.guilds.get(guild);

    if (!dbGuild.toggles.goodbyeMessage) return;
    if (!dbGuild.channels.goodbye) return;

    const channel = guild.channels.cache.get(
      dbGuild.channels.goodbye
    ) as TextChannel;

    const attachment = await this.client.canvas.member.goodbye(member);

    channel.send({ files: [attachment] });
  }
}
