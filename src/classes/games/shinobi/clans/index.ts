import Client from "@classes/Client";
import ShinobiGame from "..";
import { Collection, CommandInteraction, Message } from "discord.js";
import { ShinobiClan } from "@types";

import Clans from "./Clans";
import Shinobi from "@schemas/Shinobi";

export default class ShinobiClans {
    private readonly client: Client;
    private readonly game: ShinobiGame;

    private readonly list: Collection<string, ShinobiClan>;

    constructor(game: ShinobiGame) {
        this.client = game.client;
        this.game = game;

        this.list = new Collection();
        this.setup();
    }

    get(name: string) {
        const clan = this.list.get(name);
        if (!clan) return null;
        return clan;
    }

    getAll = () => this.list;

    random = () => this.list.random();

    embed = (clan: ShinobiClan) =>
        this.client.util
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

    async pagination(interaction: CommandInteraction) {
        const clans = this.getAll();

        let page = 0;

        const buttons = [
            this.client.util
                .button()
                .setCustomId("previous_page")
                .setLabel("⬅️")
                .setStyle("SECONDARY"),
            this.client.util
                .button()
                .setCustomId("next_page")
                .setLabel("➡️")
                .setStyle("SECONDARY")
        ];

        const row = this.client.util.row().addComponents(buttons);

        const embeds = clans.map((clan) => this.embed(clan));

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

    private setup = () =>
        Clans.forEach(async (clan) => {
            clan.members = (await Shinobi.find({ clan: clan.id })).length;
            this.list.set(clan.id, clan);
        });
}
