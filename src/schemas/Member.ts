import { model, Schema, Document } from 'mongoose';

export interface IMember extends Document {
    id: string;
    username: string;
    xp: number;
    level: number;
    card: {
        background: string;
        text: string;
        progressbar: string;
    },
    warns: [
        {
            guildId: string;
            by: string;
            reason: string;
        }
    ]
}

export const Member: Schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    card: {
        background: {
            type: String,
            default: '#222216',
        },
        text: {
            type: String,
            default: '#ec8e44',
        },
        progressbar: {
            type: String,
            default: '#FF5349',
        },
    },
    warns: [
        {
            guildId: String,
            by: String,
            reason: String,
        }
    ]
});

const name = 'members';

export default model<IMember>(name, Member, name);