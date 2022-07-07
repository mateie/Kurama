import Client from "@classes/Client";
import Event from "@classes/base/event";
import { IEvent } from "@types";
import { AutocompleteInteraction, Guild } from "discord.js";

export default class SetttingsACEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = "interactionCreate";
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;

        if (interaction.commandName !== "settings") return;

        const guild = interaction.guild as Guild;
        const dbGuild = await this.client.database.guilds.get(guild);

        const { options } = interaction;

        const focused = options.getFocused() as string;

        switch (options.getSubcommand()) {
            case "roles": {
                let roles = Object.keys(dbGuild.roles);

                if (focused.length > 0)
                    roles = roles.filter((role) => role.startsWith(focused));

                return await interaction.respond(
                    roles.map((choice) => ({
                        name: this.util.capFirstLetter(choice),
                        value: choice,
                    }))
                );
            }
            case "toggles": {
                let toggles = Object.keys(dbGuild.toggles).map((string) =>
                    string.split(/(?=[A-Z])/).join(" ")
                );

                if (focused.length > 0)
                    toggles = toggles.filter((toggle) =>
                        toggle.startsWith(focused)
                    );

                return await interaction.respond(
                    toggles.map((choice) => ({
                        name: this.util.capFirstLetter(choice),
                        value: choice.split(" ").join(""),
                    }))
                );
            }
        }

        switch (options.getSubcommandGroup()) {
            case "categories": {
                switch (options.getSubcommand()) {
                    case "set": {
                        let categories = Object.keys(dbGuild.categories);

                        if (focused.length > 0)
                            categories = categories.filter((category) =>
                                category.startsWith(focused)
                            );

                        await interaction.respond(
                            categories.map((choice) => ({
                                name: this.util.capFirstLetter(choice),
                                value: choice,
                            }))
                        );
                        break;
                    }
                }
                break;
            }
            case "channels": {
                switch (options.getSubcommand()) {
                    case "set": {
                        let channels = Object.keys(dbGuild.channels);

                        if (focused.length > 0)
                            channels = channels.filter((channel) =>
                                channel.startsWith(focused)
                            );

                        await interaction.respond(
                            channels.map((choice) => ({
                                name: this.util.capFirstLetter(choice),
                                value: choice,
                            }))
                        );
                        break;
                    }
                    case "add":
                    case "remove": {
                        let channelsArray = Object.keys(dbGuild.channelsArray);

                        if (focused.length > 0)
                            channelsArray = channelsArray.filter((channel) =>
                                channel.startsWith(focused)
                            );

                        await interaction.respond(
                            channelsArray.map((choice) => ({
                                name: this.util.capFirstLetter(choice),
                                value: choice,
                            }))
                        );
                        break;
                    }
                }
                break;
            }
        }
    }
}
