import Event from "@classes/base/event";
import Client from "@classes/Client";
import { IEvent } from "@types";
import { AutocompleteInteraction } from "discord.js";

export default class ShinobiACEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;

        if (interaction.commandName !== "sh") return;

        const { options } = interaction;

        const focused = options.getFocused().toLowerCase();

        if (options.get("clan")) {
            console.log(focused);
            let clans = this.client.games.shinobi.clans.getAll();

            if (focused.length > 0)
                clans = clans.filter((item) =>
                    item.name.toLowerCase().startsWith(focused)
                );

            await interaction.respond(
                clans.map((clan) => ({ name: clan.name, value: clan.id }))
            );
        }

        if (options.get("village")) {
            let villages = this.client.games.shinobi.villages.getAll();

            if (focused.length > 0)
                villages = villages.filter(
                    (item) =>
                        item.name.en.toLowerCase().includes(focused) ||
                        item.name.jp.toLowerCase().includes(focused)
                );

            await interaction.respond(
                villages.map((village) => ({
                    name: `${village.name.en} (${village.name.jp})`,
                    value: village.id
                }))
            );
        }

        if (
            options.data.find((option) => option.type === "SUB_COMMAND_GROUP")
        ) {
            switch (options.getSubcommandGroup()) {
                case "weapons": {
                    let weapons = this.client.games.shinobi.weapons.getAll();

                    if (focused.length > 0)
                        weapons = weapons.filter(
                            (item) =>
                                item.id.toLowerCase().startsWith(focused) ||
                                item.name.toLowerCase().startsWith(focused)
                        );

                    await interaction.respond(
                        weapons.map((weapon) => ({
                            name: weapon.name,
                            value: weapon.id
                        }))
                    );
                }
            }
        }
    }
}
