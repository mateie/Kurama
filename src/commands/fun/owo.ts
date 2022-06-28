import { CommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class OwOCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "owo";
        this.description = "OwOify some text";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("text")
                    .setDescription("Text to OwOify")
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const text = interaction.options.getString("text", true);

        const { owo } = await this.client.nekos.OwOify({
            text,
        });

        return interaction.reply({ content: owo });
    }
}
