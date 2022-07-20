import Client from "@classes/Client";
import Util from ".";

import { ButtonInteraction, CommandInteraction, Message } from "discord.js";

export default class UtilPagination {
    private readonly client: Client;
    private readonly util: Util;

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
                .setStyle("SECONDARY")
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
                text: `Page ${index + 1} of ${contents.length}`
            });
            if (title) embed.setTitle(title);

            return embed;
        });

        if (interaction.deferred === false) {
            await interaction.deferReply({ ephemeral });
        }

        const currPage = (await interaction.editReply({
            embeds: [embeds[page]],
            components: [row]
        })) as Message;

        const filter = (i: { customId: string | null }) =>
            i.customId === buttons[0].customId ||
            i.customId === buttons[1].customId;

        const collector = currPage.createMessageComponentCollector({
            filter,
            time: timeout
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
                    components: [row]
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
                        components: [disabledRow]
                    });
                }
            });

        return currPage;
    }

    async shinobiClans(interaction: CommandInteraction) {
        const clans = this.client.games.shinobi.clans.getAll();

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
                .setStyle("SECONDARY")
        ];

        const row = this.util.row().addComponents(buttons);

        const embeds = clans.map((clan) => {
            return this.client.util
                .embed()
                .setTitle(clan.name)
                .setDescription(
                    `
                ${clan.description}

                \`Base Chakra\`: ${clan.stats.chakra}
                \`Base Ninjutsu\`: ${clan.stats.ninjutsu}
                \`Base Genjutsu\`: ${clan.stats.genjutsu}
                \`Base Taijutsu\`: ${clan.stats.taijutsu}
                \`Base Kenjutsu\`: ${clan.stats.kenjutsu}
                `
                )
                .setThumbnail(clan.icon)
                .setFooter({ text: `Members: ${clan.members}` });
        });

        if (interaction.deferred === false) await interaction.deferReply();

        const message = (await interaction.editReply({
            embeds: [embeds[page]],
            components: [row]
        })) as Message;

        const collector = message.createMessageComponentCollector({
            filter: (i) =>
                i.customId === buttons[0].customId ||
                i.customId === buttons[1].customId,
            time: 60000
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
                    components: [row]
                });

                collector.resetTimer();
            })
            .on("end", () => {
                message.delete();
            });
    }

    async shinobiVillages(interaction: CommandInteraction) {
        const villages = this.client.games.shinobi.villages.getAll();

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
                .setStyle("SECONDARY")
        ];

        const row = this.util.row().addComponents(buttons);

        const embeds = villages.map((village) => {
            return this.client.util
                .embed()
                .setTitle(`${village.name.en} (${village.name.jp})`)
                .setDescription(village.description)
                .setThumbnail(village.icon)
                .setFooter({ text: `Members: ${village.population}` });
        });

        if (interaction.deferred === false) await interaction.deferReply();

        const message = (await interaction.editReply({
            embeds: [embeds[page]],
            components: [row]
        })) as Message;

        const collector = message.createMessageComponentCollector({
            filter: (i) =>
                i.customId === buttons[0].customId ||
                i.customId === buttons[1].customId,
            time: 60000
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
                    components: [row]
                });

                collector.resetTimer();
            })
            .on("end", () => {
                message.delete();
            });
    }
}
