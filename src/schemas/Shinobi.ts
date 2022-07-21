import { ShinobiRanks } from "@types";
import { HydratedDocument, model, Schema } from "mongoose";
import { ShinobiStats } from "@types";

export interface IShinobi extends HydratedDocument<any> {
    memberId: string;
    clan: string;
    village: string;
    rank: ShinobiRanks;
    xp: number;
    level: number;
    ryo: number;
    stats: ShinobiStats;
    cooldowns: {
        daily: number;
    }
}

export const Shinobi: Schema = new Schema<IShinobi>({
    memberId: {
        type: String,
        required: true,
        unique: true,
    },
    clan: {
        type: String,
        required: true,
    },
    village: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
        default: "genin",
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    ryo: {
        type: Number,
        default: 0,
    },
    stats: {},
    cooldowns: {
        daily: {
            type: Number
        }
    }
});

const name = "shinobis";

export default model<IShinobi>(name, Shinobi, name);
