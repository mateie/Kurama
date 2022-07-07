import { CommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class ValorantCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "valorant";
        this.description = "Valorant Command";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("link")
                    .setDescription("Link your account (Name#tag)")
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription("Your name")
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("tag")
                            .setDescription("Your Tag")
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("unlink")
                    .setDescription("Unlink your account")
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("verify")
                    .setDescription(
                        "Check what valorant account are you linked to"
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        switch (options.getSubcommand()) {
            case "link": {
                return this.client.games.valorant.link(interaction);
            }
            case "unlink": {
                return this.client.games.valorant.unlink(interaction);
            }
            case "verify": {
                return this.client.games.valorant.verify(interaction);
            }
        }
    }
}
