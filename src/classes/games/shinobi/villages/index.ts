import ShinobiGame from "..";
import { Collection } from "discord.js";
import { ShinobiVillage } from "@types";
import Villages from "./Villages";
import Shinobi from "@schemas/Shinobi";

export default class ShinobiVillages {
    private readonly game: ShinobiGame;

    private readonly list: Collection<string, ShinobiVillage>;

    constructor(game: ShinobiGame) {
        this.game = game;

        this.list = new Collection();
        this.setup();
    }

    get(name: string) {
        const clan = this.list.get(name);
        if (!clan) return false;
        return clan;
    }

    getAll = () => this.list;

    random = () => this.list.random();

    private setup() {
        Villages.forEach(async (village) => {
            village.population = (
                await Shinobi.find({ village: village.id })
            ).length;
            this.list.set(village.id, village);
        });
    }
}
