import ShinobiGame from "..";
import { Collection } from "discord.js";
import { ShinobiClan } from "@types";

import Clans from "./Clans";
import Shinobi from "@schemas/Shinobi";

export default class ShinobiClans {
    private readonly game: ShinobiGame;

    private readonly list: Collection<string, ShinobiClan>;

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
        Clans.forEach(async (clan) => {
            clan.members = (await Shinobi.find({ clan: clan.id })).length;
            this.list.set(clan.id, clan);
        });
    }
}