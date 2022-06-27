import { CommandInteraction } from "discord.js";
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
                            .setName("order_type")
                            .setDescription("What is the order type?")
                            .addChoices(
                                { name: "Sellers", value: "sell" },
                                { name: "Buyers", value: "buy" }
                            )
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setName("item")
                            .setDescription("Item to search")
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        switch (options.getSubcommand()) {
            case "market": {
                return this.client.games.warframe.orders(interaction);
            }
        }
    }
}
