import Event from "@classes/base/event";
import Client from "@classes/Client";
import { IEvent } from "@types";
import { AutocompleteInteraction } from "discord.js";

export default class ShinobiClansACEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;

        if (interaction.commandName !== "sh") return;

        const { options } = interaction;

        if (!options.get("clan")) return;

        const focused = options.getFocused().toLowerCase() as string;

        let clans = this.client.games.shinobi.clans.getAll();

        if (focused.length > 0)
            clans = clans.filter((item) =>
                item.name.toLowerCase().startsWith(focused)
            );

        await interaction.respond(
            clans.map((clan) => ({ name: clan.name, value: clan.id }))
        );
    }
}
