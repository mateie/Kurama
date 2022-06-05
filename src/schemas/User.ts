import { model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    username: string;
    xp: number;
    level: number;
    card: {
        background: {
            type: 'banner' | 'color' | 'image';
            color: string;
            image: Buffer;
        };
        outlines: {
            type: 'banner' | 'avatar' | 'color';
            color: string;
        };
        text: {
            type: 'banner' | 'avatar' | 'color';
            color: string;
        };
    };
    warns: [
        {
            guildId: string;
            by: string;
            reason: string;
        }
    ];
    reports: [
        {
            guildId: string,
            by: string,
            reason: string,
        }
    ];
}

export const User: Schema = new Schema({
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
            type: {
                type: String,
                default: 'color',
            },
            color: {
                type: String,
                default: '#222216'
            },
            image: Buffer,
        },
        outlines: {
            type: {
                type: String,
                default: 'avatar',
            },
            color: {
                type: String,
                default: '#222216'
            }
        },
        text: {
            type: {
                type: String,
                default: 'color',
            },
            color: {
                type: String,
                default: '#ffffff'
            }
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

const name = 'users';

export default model<IUser>(name, User, name);