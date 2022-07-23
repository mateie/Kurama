import { IShinobi } from "@schemas/Shinobi";
import { ShinobiStats, ShinobiWeapon } from "@types";

export default class ShinobiPlayer {
    readonly stats: ShinobiStats;
    readonly weapons: ShinobiWeapon[];

    constructor(shinobi: IShinobi) {
        this.stats = shinobi.stats;
        this.weapons = shinobi.weapons;
    }

    attack(target: ShinobiPlayer) {}

    defense(from: ShinobiPlayer) {}
}
