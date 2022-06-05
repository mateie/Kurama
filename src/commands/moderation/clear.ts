import { CommandInteraction, GuildMember, TextChannel } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ClearCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "clear";
        this.description = "Clear a channel";
        this.permission = "MANAGE_MESSAGES";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addNumberOption((option) =>
                option
                    .setName("amount")
                    .setDescription("Amount of messages")
                    .setRequired(true)
            )
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription("Member to clear their messages")
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const channel = interaction.channel as TextChannel;

        const amount = options.getNumber("amount") as number;
        const member = options.getMember("target") as GuildMember;

        const embed = this.util.embed();

        if (member) {
            const messages = (await channel.messages.fetch()).filter(
                (m) => m.author.id === member.id
            );

            await channel.bulkDelete(messages, true).then((messages) => {
                embed.setDescription(
                    `Cleared ${messages.size} from ${member} in this channel`
                );
            });

            return interaction.reply({ embeds: [embed] });
        }

        await channel.bulkDelete(amount, true).then((messages) => {
            embed.setDescription(`Cleared ${messages.size} from this channel`);
        });

        return interaction.reply({ embeds: [embed] });
    }
}
