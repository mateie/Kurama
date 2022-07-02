import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { ButtonInteraction, Message, MessageEmbed } from "discord.js";

export default class CreatePasteEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        if (interaction.customId !== "create_paste") return;

        const message = interaction.message as Message;

        const embed = message.embeds[0] as MessageEmbed;

        const type = embed.title?.split("Orders for")[0].trim().toLowerCase();
        const user = embed.fields[0].value
            .split("`Reputation`")[0]
            .split(":")[1]
            .trim();
        const item = embed.title?.split("Orders for")[1].trim();
        const price = embed.description
            ?.split("(each)")[0]
            .split(":")[1]
            .trim();

        return interaction.reply({
            content: `/w ${user} Hi! I want to ${
                type === "sell" ? "buy" : "sell"
            }: ${item} for ${price} platinum. (warframe.market)`,
            ephemeral: true,
        });
    }
}
