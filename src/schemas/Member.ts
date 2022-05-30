import { model, Schema, Document } from 'mongoose';

export interface IMember extends Document {
    id: string;
    username: string;
    xp: number;
    level: number;
    card: {
        type: 'banner' | 'color' | 'image';
        background: {
            color: string;
            image: Buffer;
        };
    },
    warns: [
        {
            guildId: string;
            by: string;
            reason: string;
        }
    ],
    reports: [
        {
            guildId: string,
            by: string,
            reason: string,
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
        type: {
            type: String,
            default: 'color',
        },
        background: {
            color: {
                type: String,
                default: '#222216'
            },
            image: Buffer,
        }
    },
    warns: [
        {
            guildId: String,
            by: String,
            reason: String,
        }
    ],
    reports: [
        {
            guildId: String,
            by: String,
            reason: String,
        }
    ]
});

const name = 'members';

export default model<IMember>(name, Member, name);