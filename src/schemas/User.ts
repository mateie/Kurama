import { HydratedDocument, model, Schema } from "mongoose";

export interface IUser extends HydratedDocument<any> {
    id: string;
    username: string;
    xp: number;
    level: number;
    valorant: {
        name: string | null;
        tag: string | null;
    };
    card: {
        background: {
            type: "banner" | "color" | "image";
            color: string;
            image: Buffer;
        };
        outlines: {
            type: "banner" | "avatar" | "color";
            color: string;
        };
        text: {
            type: "banner" | "avatar" | "color";
            color: string;
        };
    };
    marriage: {
        married: boolean;
        to: string;
        since: string;
    };
    playlists: [
        {
            guildId: string;
            channelId: string;
            tracks: string[];
            sharedWith: string[];
        }
    ];
    warns: [
        {
            guildId: string;
            by: string;
            reason: string;
        }
    ];
    reports: [
        {
            guildId: string;
            by: string;
            reason: string;
        }
    ];
}

export const User: Schema = new Schema<IUser>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    valorant: {
        name: String,
        tag: String
    },
    card: {
        background: {
            type: {
                type: String,
                default: "color"
            },
            color: {
                type: String,
                default: "#222216"
            },
            image: Buffer
        },
        outlines: {
            type: {
                type: String,
                default: "avatar"
            },
            color: {
                type: String,
                default: "#222216"
            }
        },
        text: {
            type: {
                type: String,
                default: "color"
            },
            color: {
                type: String,
                default: "#ffffff"
            }
        }
    },
    marriage: {
        married: {
            type: Boolean,
            default: false
        }
    },
    playlist: [
        {
            guildId: String,
            channelId: String,
            tracks: [],
            sharedWith: []
        }
    ],
    warns: [
        {
            guildId: String,
            by: String,
            reason: String
        }
    ],
    reports: [
        {
            guildId: String,
            by: String,
            reason: String
        }
    ]
});

const name = "users";

export default model<IUser>(name, User, name);
