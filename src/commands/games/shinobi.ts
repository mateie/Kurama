import { CommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ShinobiCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "sh";
        this.description = "Shinobi Adventure Game";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("start")
                    .setDescription("Start your adventure")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("info")
                    .setDescription("Shinobi Info")
                    .addUserOption((option) =>
                        option
                            .setName("shinobi")
                            .setDescription("Shinobi to check the info of")
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("delete")
                    .setDescription("Delete someone's progress")
                    .addUserOption((option) =>
                        option
                            .setName("shinobi")
                            .setDescription("Shinobi to delete the progress of")
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        switch (options.getSubcommand()) {
            case "start": {
                return this.client.games.shinobi.start(interaction);
            }
            case "info": {
                return this.client.games.shinobi.info(interaction);
            }
            case "delete": {
                return this.client.games.shinobi.delete(interaction);
            }
        }
    }
}
