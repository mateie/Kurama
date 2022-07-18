import { ChatInputCommandInteraction } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";

export default class WFCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "warframe";
        this.description = "Warframe Utilities";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("market")
                    .setDescription("Access Warframe.market")
                    .addStringOption((option) =>
                        option
                            .setName("item")
                            .setDescription("Item to search")
                            .setAutocomplete(true)
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("user_status")
                            .setDescription(
                                "Status for the user that placed the order"
                            )
                            .addChoices(
                                { name: "In Game", value: "ingame" },
                                { name: "On Site", value: "online" }
                            )
                    )
            );
    }

    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        switch (options.getSubcommand()) {
            case "market": {
                return this.client.games.warframe.orders(interaction);
            }
        }
    }
}
