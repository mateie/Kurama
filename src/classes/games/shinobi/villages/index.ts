import ShinobiGame from "..";
import { Collection, CommandInteraction, Message } from "discord.js";
import { ShinobiVillage } from "@types";
import Villages from "./Villages";
import Shinobi from "@schemas/Shinobi";
import Client from "@classes/Client";

export default class ShinobiVillages {
    private readonly client: Client;
    private readonly game: ShinobiGame;

    private readonly list: Collection<string, ShinobiVillage>;

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

    embed = (village: ShinobiVillage) =>
        this.client.util
            .embed()
            .setTitle(`${village.name.en} (${village.name.jp})`)
            .setDescription(village.description)
            .setThumbnail(village.icon)
            .setFooter({ text: `Population: ${village.population}` });

    async pagination(interaction: CommandInteraction) {
        const villages = this.getAll();

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

        const embeds = villages.map((village) => this.embed(village));

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
        Villages.forEach(async (village) => {
            village.population = (
                await Shinobi.find({ village: village.id })
            ).length;
            this.list.set(village.id, village);
        });
}
