import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { ButtonInteraction, Guild, GuildMember, Message } from "discord.js";

export default class MemberActionsEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        if (
            ![
                "show_rank",
                "show_warns",
                "show_reports",
                "report_member",
                "warn_member",
            ].includes(interaction.customId)
        )
            return;

        const guild = interaction.guild as Guild;
        const message = interaction.message as Message;
        const member = interaction.member as GuildMember;

        const target = await guild?.members.fetch(
            message.embeds[0].footer?.text.split(":")[1] as string
        );

        switch (interaction.customId) {
            case "show_rank": {
                const attachment = await this.client.canvas.member.rank(target);
                return interaction.reply({
                    files: [attachment],
                    ephemeral: true,
                });
            }
            case "report_member": {
                const modal = this.client.moderation.reports.modal(target);

                return interaction.showModal(modal);
                break;
            }
            case "warn_member": {
                if (!member.permissions.has("MODERATE_MEMBERS"))
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });
                const modal = this.client.moderation.warns.modal(target);

                return interaction.showModal(modal);
                break;
            }
            case "show_reports": {
                if (!member.permissions.has("VIEW_AUDIT_LOG"))
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });
                const reports = await this.client.moderation.reports.get(
                    target
                );
                if (reports.length < 1)
                    return interaction.reply({
                        content: `${target} has no reports`,
                        ephemeral: true,
                    });
                const mapped = reports.map(
                    (report) => `
                    ***Reported by***: ${guild.members.cache.get(report.by)}
                    ***Reason***: ${report.reason}
                `
                );

                return this.util.pagination.default(
                    interaction,
                    mapped,
                    `${target.user.tag} Reports`,
                    true
                );
            }
            case "show_warns": {
                if (!member.permissions.has("VIEW_AUDIT_LOG"))
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });
                const warns = await this.client.moderation.warns.get(target);
                if (warns.length < 1)
                    return interaction.reply({
                        content: `${target} has no warns`,
                        ephemeral: true,
                    });
                const mapped = warns.map(
                    (warn) => `
                    ***Warned by***: ${guild.members.cache.get(warn.by)}
                    ***Reason***: ${warn.reason}
                `
                );

                return this.client.util.pagination.default(
                    interaction,
                    mapped,
                    `${target.user.tag} Warns`,
                    true
                );
            }
        }
    }
}
