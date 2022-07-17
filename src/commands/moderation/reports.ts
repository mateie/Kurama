import { CommandInteraction, Guild, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ReportsCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "reports";
        this.description = "Check reports of a member";
        this.permission = ["VIEW_AUDIT_LOG"];

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName("member")
                    .setDescription("Member to check warns of")
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember("member") as GuildMember;

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true,
            });

        const guild = interaction.guild as Guild;

        const reports = await this.client.moderation.reports.get(member);

        if (reports.length < 1)
            return interaction.reply({
                content: `${member} has no reports`,
                ephemeral: true,
            });

        const reportMap = reports.map(
            (report) => `
            **Reported by**: ${guild.members.cache.get(report.by)}
            **Reason**: ${report.reason} 
        `
        );

        return this.util.pagination.default(
            interaction,
            reportMap,
            `${member.user.tag} Reports`,
            true
        );
    }
}
