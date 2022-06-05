import { CommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class WarnCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "warn";
        this.description = "Warn a memebr";
        this.permission = "MODERATE_MEMBERS";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName("member")
                    .setDescription("Member to warn")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option.setName("reason").setDescription("Reason to warn this member")
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember("member") as GuildMember;
        const reason = options.getString("reason") || "No reason specified";

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true,
            });

        return this.client.moderation.warns.create(interaction, member, reason);
    }
}
