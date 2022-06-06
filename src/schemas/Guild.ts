import { model, Schema, HydratedDocument } from "mongoose";

export interface IGuild extends HydratedDocument<any> {
    id: string;
    name: string;
    channels: {
        welcome: string;
        goodbye: string;
        rules: string;
        reports: string;
        playlists: string;
    };
    channelsArray: {
        commands: string[];
        music: string[];
    };
    roles: {
        member: string;
    };
    toggles: {
        welcomeMessage: boolean;
        goodbyeMessage: boolean;
        preventProfanity: boolean;
        strictCommands: boolean;
        strictMusicChannels: boolean;
    };
    whitelistedWords: string[];
};

export const Guild: Schema = new Schema<IGuild>({
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
        welcome: String,
        goodbye: String,
        rules: String,
        reports: String,
        playlists: String,
    },
    channelsArray: {
        commands: [String],
        music: [String],
    },
    roles: {
        member: String,
    },
    toggles: {
        welcomeMessage: {
            type: Boolean,
            default: false,
        },
        goodbyeMessage: {
            type: Boolean,
            default: false,
        },
        preventProfanity: {
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

const name = "guilds";

export default model<IGuild>(name, Guild, name);
