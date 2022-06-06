import Client from "@classes/Client";
import { IUser } from "@schemas/User";
import {
    Presence,
    CommandInteraction,
    ButtonInteraction,
    ContextMenuInteraction,
    GuildMember,
    ModalSubmitInteraction,
    MessageActionRow,
} from "discord.js";
import { roleMention } from "@discordjs/builders";
import Util from ".";

export default class UtilMember {
    client: Client;
    util: Util;

    constructor(client: Client, util: Util) {
        this.client = client;
        this.util = util;
    }

    statusColor(presence: Presence) {
        if (!presence) return "#808080";
        switch (presence.status) {
            case "online": {
                return "#43B581";
            }
            case "dnd": {
                return "#F04747";
            }
            case "idle": {
                return "#FAA61A";
            }
            case "offline":
            case "invisible": {
                return "#747F8E";
            }
        }
    }

    statusEmoji(type: string): string {
        switch (type) {
            case "dnd":
                return ":red_circle:";
            case "idle":
                return ":yellow_circle:";
            case "online":
                return ":green_circle:";
            default:
                return ":white_circle:";
        }
    }

    async getCardData(user: IUser) {
        const currentXP =
            user.xp - this.client.xp.calculateXPForLevel(user.level);
        const neededXP = this.client.xp.calculateReqXP(user.level);

        const rank = await this.getRank(user);

        const info = {
            rank,
            card: user.card,
            level: user.level,
            currentXP,
            neededXP,
        };

        return info;
    }

    async getRank(user: IUser) {
        const users = await this.client.database.users.getAll();
        const sorted = users.sort((a, b) => b.xp - a.xp);

        const mapped = sorted.map((u, i) => ({
            id: u.id,
            xp: u.xp,
            rank: i + 1,
        }));

        const rank = mapped.find((u) => u.id === user.id)?.rank;

        return rank;
    }

    async info(
        interaction:
            | CommandInteraction
            | ButtonInteraction
            | ContextMenuInteraction
            | ModalSubmitInteraction,
        member: GuildMember
    ) {
        const avatar = member.user.displayAvatarURL({ dynamic: true });
        const activities: string[] = [];
        const status = {
            emoji: ":white_circle:",
            text: "Offline",
        };

        if (member.presence) {
            member.presence.activities.forEach((act) => {
                const type = `***${
                    act.type.charAt(0).toUpperCase() +
                    act.type.split("_").join(" ").slice(1).toLowerCase()
                }***:`;

                activities.push(`
                    ${type} ${
                    act.state ? this.util.list(act.state.split("; ")) : ""
                } ${act.type === "PLAYING" ? act.name : ""} ${
                    act.type === "LISTENING" ? "-" : ""
                } ${act.details ? act.details : ""}
                `);
            });

            status.emoji = this.statusEmoji(member.presence.status);
            status.text =
                member.presence.status !== "dnd"
                    ? `${member.presence.status
                          .charAt(0)
                          .toUpperCase()}${member.presence.status.slice(1)}`
                    : "Do Not Disturb";
        }

        const roles = member.roles.cache.filter(
            (role) => role.name !== "@everyone"
        );
        const mappedRoles = roles
            .map((role) => roleMention(role.id))
            .join(", ");

        const embed = this.util
            .embed()
            .setAuthor({
                name: member.user.tag,
                iconURL: avatar,
                url: avatar,
            })
            .setColor(member.displayHexColor)
            .setURL(avatar)
            .setThumbnail(avatar)
            .setDescription(
                `**Status**: ${status.emoji} ${status.text} ${
                    activities.length > 0
                        ? `\n**Activities**: ${activities.join("")}`
                        : ""
                }`
            )
            .addFields([
                {
                    name: "Joined Server",
                    value: `<t:${Math.floor(
                        (member.joinedTimestamp as number) / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: "Joined Discord",
                    value: `<t:${Math.floor(
                        (member.user.createdTimestamp as number) / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: `Roles(${roles.size})`,
                    value: mappedRoles,
                },
            ])
            .setFooter({ text: `ID: ${member.id}` });

        const rows = await this.actionRow(interaction.member as GuildMember);
        return interaction.reply({ embeds: [embed], components: rows });
    }

    async actionRow(executer: GuildMember): Promise<MessageActionRow[]> {
        const topRow = this.util
            .row()
            .addComponents(
                this.util
                    .button()
                    .setCustomId("show_rank")
                    .setLabel("Show Rank")
                    .setStyle("SECONDARY")
            );

        const midRow = this.util
            .row()
            .addComponents(
                this.util
                    .button()
                    .setCustomId("report_member")
                    .setLabel("Report Member")
                    .setStyle("DANGER"),
                this.util
                    .button()
                    .setCustomId("show_reports")
                    .setLabel("Show Reports")
                    .setStyle("PRIMARY")
            );

        const bottomRow = this.util
            .row()
            .addComponents(
                this.util
                    .button()
                    .setCustomId("warn_member")
                    .setLabel("Warn Member")
                    .setStyle("DANGER"),
                this.util
                    .button()
                    .setCustomId("show_warns")
                    .setLabel("Show Warns")
                    .setStyle("PRIMARY")
            );

        return executer.permissions.has("VIEW_AUDIT_LOG")
            ? [topRow, midRow, bottomRow]
            : [topRow];
    }
}
