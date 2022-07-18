import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { AutocompleteInteraction, InteractionType } from "discord.js";

export default class WarframeACEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
    }

    async run(interaction: AutocompleteInteraction) {
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete)
            return;

        if (interaction.commandName !== "warframe") return;

        return this.client.games.warframe.itemAutocomplete(interaction);
    }
}
