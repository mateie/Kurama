import { model, Schema, Document } from 'mongoose';

export interface IGuild extends Document {
    id: string;
    name: string;
    channels: {
        rules: string;
    };
    channelsArray: {
        commands: string[];
        music: string[];
    };
    roles: {
        member: string;
    };
    toggles: {
        preventProfanity: boolean;
        strictCommands: boolean;
        strictMusicChannels: boolean;
    };
    whitelistedWords: string[];
}

export const Guild: Schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    channels: {
        rules: String,
    },
    channelsArray: {
        commands: [String],
        music: [String],
    },
    roles: {
        member: String,
    },
    toggles: {
        prventProfanity: {
            type: Boolean,
            default: false,
        },
        strictCommands: {
            type: Boolean,
            default: false,
        },
        strictMusicChannels: {
            type: Boolean,
            default: false,
        },
    },
    whitelistedWords: [String],
});

const name = 'guilds';

export default model<IGuild>(name, Guild, name);