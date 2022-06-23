import Client from "@classes/Client";
import Util from ".";

import { ButtonInteraction, CommandInteraction, Message } from "discord.js";

export default class UtilPagination {
    readonly client: Client;
    readonly util: Util;

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
}
