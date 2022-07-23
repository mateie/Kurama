import Client from "@classes/Client";
import { Collection, CommandInteraction, Message } from "discord.js";
import ShinobiGame from "../";
import Weapons from "./Weapons";
import { ShinobiWeapon } from "@types";

export default class ShinobiWeapons {
    private readonly client: Client;
    private readonly game: ShinobiGame;

    private readonly list: Collection<string, ShinobiWeapon>;

    constructor(game: ShinobiGame) {
        this.client = game.client;
        this.game = game;

        this.list = new Collection();
        this.setup();
    }

    get(id: string) {
        const weapon = this.list.get(id);
        if (!weapon) return null;
        return weapon;
    }

    getAll = () => this.list;

    random = () => this.list.random();

    embed = (weapon: ShinobiWeapon) =>
        this.client.util
            .embed()
            .setTitle(weapon.name)
            .setDescription(`\`Attack\`: ${weapon.attack}`)
            .setThumbnail(weapon.icon)
            .setFooter({ text: `Cost: ${weapon.cost}` });

    async pagination(interaction: CommandInteraction) {
        const weapons = this.getAll();

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

        const embeds = weapons.map((weapon) => this.embed(weapon));

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
        Weapons.forEach((weapon) => this.list.set(weapon.id, weapon));
}
