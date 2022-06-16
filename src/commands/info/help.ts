import { CommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class HelpCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "help";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("all")
                    .setDescription("Show all Categories and Commands")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("command")
                    .setDescription("View a Command")
                    .addStringOption((option) =>
                        option
                            .setName("command_view")
                            .setDescription("Command to view")
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        switch (options.getSubcommand()) {
            case "all": {
                const categories = this.client.commandHandler.categories;
                return this.util.pagination.helpAll(interaction, categories);
            }
            case "command": {
                const commandString = options
                    .getString("command_view", true)
                    .toLowerCase()
                    .trim();
                const command =
                    this.client.commandHandler.commands.get(commandString);
                if (!command)
                    return interaction.reply({
                        content: "That Command does not exist",
                        ephemeral: true,
                    });
                return this.util.pagination.helpCommand(
                    interaction,
                    command.data.toJSON()
                );
                break;
            }
        }
    }
}
