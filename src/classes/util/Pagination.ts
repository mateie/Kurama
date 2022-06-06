import Client from "@classes/Client";
import Util from ".";

import {
    ButtonInteraction,
    CommandInteraction,
    Message,
    MessageEmbed,
} from "discord.js";

export default class UtilPagination {
    client: Client;
    util: Util;

    constructor(client: Client, util: Util) {
        this.client = client;
        this.util = util;
    }

    async default(
        interaction: ButtonInteraction | CommandInteraction,
        contents: string[] | string[][],
        title?: string,
        ephemeral = false,
        timeout = 12000
    ) {
        let page = 0;

        const buttons = [
            this.util
                .button()
                .setCustomId("previous_page")
                .setLabel("⬅️")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("next_page")
                .setLabel("➡️")
                .setStyle("SECONDARY"),
        ];

        const row = this.util.row().addComponents(buttons);

        const embeds = contents.map((content, index) => {
            const embed = this.util.embed();
            if (typeof content == "object") {
                embed.setDescription(content.join("\n"));
            } else {
                embed.setDescription(content);
            }

            embed.setFooter({
                text: `Page ${index + 1} of ${contents.length}`,
            });
            if (title) embed.setTitle(title);

            return embed;
        });

        if (interaction.deferred === false) {
            await interaction.deferReply({ ephemeral });
        }

        const currPage = (await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        })) as Message;

        const filter = (i: { customId: string | null }) =>
            i.customId === buttons[0].customId ||
            i.customId === buttons[1].customId;

        const collector = currPage.createMessageComponentCollector({
            filter,
            time: timeout,
        });

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case buttons[0].customId:
                        page = page > 0 ? --page : embeds.length - 1;
                        break;
                    case buttons[1].customId:
                        page = page + 1 < embeds.length ? ++page : 0;
                        break;
                    default:
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [embeds[page]],
                    components: [row],
                });

                collector.resetTimer();
            })
            .on("end", (_, reason) => {
                if (reason !== "messageDelete" && !ephemeral) {
                    const disabledRow = this.util
                        .row()
                        .addComponents(
                            buttons[0].setDisabled(true),
                            buttons[1].setDisabled(true)
                        );

                    currPage.edit({
                        embeds: [embeds[page]],
                        components: [disabledRow],
                    });
                }
            });

        return currPage;
    }

    async helpAll(
        interaction: CommandInteraction | ButtonInteraction,
        categories: any
    ) {
        let page = 0;

        const buttons = [
            this.util
                .button()
                .setCustomId("previous_page")
                .setLabel("⬅️")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("cancel_help")
                .setLabel("🚫")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("next_page")
                .setLabel("➡️")
                .setStyle("SECONDARY"),
        ];

        const row = this.util.row().addComponents(buttons);

        const embeds = categories.map((category: any) => {
            const embed = this.util
                .embed()
                .setTitle(`Category: ${category.toString()}`);

            const commands = category.map(
                (command: any) =>
                    `***Command***: ${command.name} - ***Description***: ${command.description}`
            );

            embed.setDescription(commands.join("\n"));

            return embed;
        });

        if (interaction.deferred === false) await interaction.deferReply();

        const currPage = (await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        })) as Message;

        const collector = currPage.createMessageComponentCollector({
            filter: (i) =>
                i.customId === buttons[0].customId ||
                i.customId === buttons[1].customId ||
                i.customId === buttons[2].customId,
            time: 12000,
        });

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case buttons[0].customId:
                        page = page > 0 ? --page : embeds.length - 1;
                        break;
                    case buttons[1].customId:
                        collector.stop();
                        return await i.deferUpdate();
                        break;
                    case buttons[2].customId:
                        page = page + 1 < embeds.length ? ++page : 0;
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [embeds[page]],
                    components: [row],
                });

                collector.resetTimer();
            })
            .on("end", (_, reason) => {
                if (reason !== "messageDelete") {
                    currPage.delete();
                }
            });
    }

    async helpCategory(
        interaction: CommandInteraction | ButtonInteraction,
        category: any
    ) {
        return interaction.reply({
            content: "Work in progress",
            ephemeral: true,
        });
        let page = 0;

        const buttons = [
            this.util
                .button()
                .setCustomId("previous_page")
                .setLabel("⬅️")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("cancel_help")
                .setLabel("🚫")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("next_page")
                .setLabel("➡️")
                .setStyle("SECONDARY"),
        ];

        const row = this.util.row().setComponents(buttons);

        const dropdown = this.util
            .dropdown()
            .setCustomId("select_subcommand")
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Select A Subcommand");

        const dropdownRow = this.util.row().setComponents(dropdown);

        const embeds = category.map((command: any) => {
            const embed = this.util
                .embed()
                .setTitle(`Command: ${command.name}`);
            const args: string[] = command.options.map((arg: any) => {
                const argType = this.util.optionType(arg.type);
                if (argType === "Sub Command" && arg.options.length > 0) {
                    dropdown.addOptions({
                        label: this.util.capFirstLetter(arg.name),
                        value: arg.name,
                    });
                }
                return `***${argType}***: ${arg.name}, ***Description***: ${
                    arg.description
                }${
                    arg.required
                        ? arg.required === true
                            ? " ***Required***: Yes"
                            : " ***Required***: No"
                        : ""
                }`;
            });

            embed.setDescription(`**${command.description}**`);

            if (args.length > 0)
                embed.setDescription(`
            **${command.description}**\n
            ${args.join("\n")}
            `);

            return embed;
        });

        if (interaction.deferred === false) await interaction.deferReply();

        const components =
            dropdown.options.length > 1 ? [row, dropdownRow] : [row];

        const currPage = (await interaction.editReply({
            embeds: [embeds[page]],
            components,
        })) as Message;

        const collector = currPage.createMessageComponentCollector({
            filter: (i) =>
                i.customId === buttons[0].customId ||
                i.customId === buttons[1].customId ||
                i.customId === buttons[2].customId ||
                i.customId === "back_to_command",
            time: 12000,
        });

        const selectCollector = currPage.createMessageComponentCollector({
            componentType: "SELECT_MENU",
            filter: (i) => i.customId === dropdown.customId,
            time: 12000,
        });

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case buttons[0].customId:
                        page = page > 0 ? --page : embeds.length - 1;
                        break;
                    case buttons[1].customId:
                        collector.stop();
                        await i.deferUpdate();
                        break;
                    case buttons[2].customId:
                        page = page + 1 < embeds.length ? ++page : 0;
                        break;
                    case "back_to_command":
                        page = 0;
                        row.setComponents(buttons);
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [embeds[page]],
                    components,
                });

                collector.resetTimer();
            })
            .on("end", (_, reason) => {
                if (reason !== "messageDelete") {
                    const disabledRow = this.util
                        .row()
                        .setComponents(
                            buttons[0].setDisabled(true),
                            buttons[1].setDisabled(true),
                            buttons[2].setDisabled(true)
                        );

                    currPage.edit({
                        embeds: [embeds[page]],
                        components: [disabledRow],
                    });
                }
            });

        selectCollector.on("collect", async (i) => {
            const currentEmbed = embeds[page] as MessageEmbed;
            const currentCommand = currentEmbed.title?.split(": ")[1];
            const value = i.values[0];
            const subcommand = category
                .get(currentCommand)
                .options.find((option: any) => option.name == value);

            const args = subcommand.options.map((arg: any) => {
                const type = this.util.optionType(arg.type);
                return `***${type}***: ${arg.name}, ***Description***: ${
                    arg.description
                }${
                    arg.required
                        ? arg.required === true
                            ? " ***Required***: Yes"
                            : " ***Required***: No"
                        : ""
                }`;
            });

            const embed = this.util
                .embed()
                .setTitle(
                    `Command: ${currentCommand} - Subcommand: ${subcommand.name}`
                ).setDescription(`
                **${subcommand.description}**\n
                ${args.join("\n")}
            `);

            await i.deferUpdate();
            await currPage.edit({
                embeds: [embed],
                components: [
                    row.addComponents(
                        this.util
                            .button()
                            .setCustomId("back_to_command")
                            .setLabel("Back to Command")
                            .setStyle("SUCCESS")
                    ),
                ],
            });
        });

        return currPage;
    }

    async helpCommand(
        interaction: CommandInteraction | ButtonInteraction,
        command: any
    ) {
        let page = 0;

        const buttons = [
            this.util
                .button()
                .setCustomId("previous_page")
                .setLabel("⬅️")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("cancel_help")
                .setLabel("🚫")
                .setStyle("SECONDARY"),
            this.util
                .button()
                .setCustomId("next_page")
                .setLabel("➡️")
                .setStyle("SECONDARY"),
        ];

        const row = this.util.row().setComponents(buttons);

        const embeds = command.options.map((option: any) => {
            const type = this.util.optionType(option.type);
            const embed = this.util
                .embed()
                .setTitle(`Command: ${command.name} - ${type}: ${option.name}`);

            const args = option.options.map((arg: any) => {
                const argType = this.util.optionType(arg.type);
                return `***${argType}***: ${arg.name}, ***Description***: ${
                    arg.description
                }${
                    arg.required
                        ? arg.required === true
                            ? " ***Required***: Yes"
                            : " ***Required***: No"
                        : ""
                }`;
            });

            embed.setDescription(`**${option.description}**`);

            if (args.length > 0)
                embed.setDescription(`
            **${option.description}**\n
            ${args.join("\n")}
            `);

            return embed;
        });

        if (interaction.deferred === false) await interaction.deferReply();

        const currPage = (await interaction.editReply({
            embeds: [embeds[page]],
            components: embeds.length > 1 ? [row] : [],
        })) as Message;

        const collector = currPage.createMessageComponentCollector({
            filter: (i) =>
                i.customId === buttons[0].customId ||
                i.customId === buttons[1].customId ||
                i.customId === buttons[2].customId,
            time: 12000,
        });

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case buttons[0].customId:
                        page = page > 0 ? --page : embeds.length - 1;
                        break;
                    case buttons[1].customId:
                        collector.stop();
                        await interaction.deleteReply();
                        break;
                    case buttons[2].customId:
                        page = page + 1 < embeds.length ? ++page : 0;
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [embeds[page]],
                    components: [row],
                });

                collector.resetTimer();
            })
            .on("end", (_, reason) => {
                if (reason !== "messageDelete") {
                    const disabledRow = this.util
                        .row()
                        .setComponents(
                            buttons[0].setDisabled(true),
                            buttons[1].setDisabled(true),
                            buttons[2].setDisabled(true)
                        );

                    currPage.edit({
                        embeds: [embeds[page]],
                        components: [disabledRow],
                    });
                }
            });

        return currPage;
    }
}
