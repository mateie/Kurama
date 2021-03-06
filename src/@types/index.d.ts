import Client from "@classes/Client";
import Util from "@classes/util";
import {
    ContextMenuCommandBuilder,
    SlashCommandBuilder
} from "@discordjs/builders";
import { Region } from "@survfate/valorant.js";
import {
    CommandInteraction,
    ContextMenuInteraction,
    PermissionResolvable
} from "discord.js";

import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export interface IBase {
    readonly client: Client;
    readonly util: Util;

    name: string | undefined;
    description: string | "No Description";
    category: string | undefined;

    ownerOnly: boolean;
    global: boolean;

    permission: [PermissionResolvable] | null;

    toJSON(): IBaseJSON;

    toString(): string | undefined;
}

export interface IBaseJSON {
    name: string | undefined;
    description: string | undefined;
    category: string | undefined;
    permission: string | null;
    ownerOnly: boolean;
    data: RESTPostAPIApplicationCommandsJSONBody;
}

export interface ICommand extends IBase {
    data: SlashCommandBuilder;
    run(interaction: CommandInteraction): any | Promise<any>;
}

export interface IMenu extends IBase {
    data: ContextMenuCommandBuilder;
    run(interaction: ContextMenuInteraction): any | Promise<any>;
}

export interface IEvent {
    readonly client: Client;
    name: Events;
    description: string | "No Description";
    category: string | undefined;
    once: boolean;
    process: boolean;
    rss: boolean;
}

export interface HandlerOptions {
    directory: string;
}

export type CommandHandlerOptions = HandlerOptions;
export type EventHandlerOptions = HandlerOptions;

export interface ValorantLogin {
    username: string;
    password: string;
    region: Region;
}

// Shinobi Types
export interface ShinobiClan {
    id: string;
    name: string;
    description: string;
    members: number;
    icon: string;
    stats: ShinobiStats;
}

export interface ShinobiVillage {
    id: string;
    name: {
        en: string;
        jp: string;
    };
    description: string;
    population: number;
    icon: string;
}

export interface ShinobiStats {
    hp: number;
    chakra: number;
    ninjutsu: number;
    genjutsu: number;
    taijutsu: number;
    kenjutsu: number;
}

export interface ShinobiWeapon {
    id: string;
    name: string;
    icon: string;
    attack: number;
    cost: number;
}

export type ShinobiRanks =
    | "genin"
    | "chunin"
    | "jonin"
    | "special_jonin"
    | "hokage"
    | "anbu"
    | "medical"
    | "rogue";

// Event Types
export type ClientEvents =
    | "rateLimit"
    | "invalidRequestWarning"
    | "apiResponse"
    | "apiRequest"
    | "ready"
    | "inviteCreate"
    | "inviteDelete"
    | "webhookUpdate"
    | "interactionCreate"
    | "error"
    | "warn"
    | "debug"
    | "cacheSweep"
    | "shardDisconnect"
    | "shardError"
    | "shardReconnecting"
    | "shardReady"
    | "shardResume"
    | "invalidated"
    | "raw"
    | "stageInstanceCreate"
    | "stageInstanceUpdate"
    | "stageInstanceDelete"
    | "stickerCreate"
    | "stickerDelete"
    | "stickerUpdate";

export type ChannelEvents =
    | "channelCreate"
    | "channelDelete"
    | "channelUpdate"
    | "channelPinsUpdate"
    | "typingStart"
    | "guildChannelPermissionsUpdate"
    | "guildChannelTopicUpdate";

export type ThreadChannelEvents =
    | "threadCreate"
    | "threadDelete"
    | "threadUpdate"
    | "threadListSync"
    | "threadMemberUpdate"
    | "threadMembersUpdate"
    | "threadStateUpdate"
    | "threadNameUpdate"
    | "threadLockStateUpdate"
    | "threadRateLimitPerUserUpdate"
    | "threadAutoArchiveDurationUpdate";

export type MemberEvents =
    | "guildMemberAdd"
    | "guildMemberRemove"
    | "guildMemberUpdate"
    | "guildMemberAvailable"
    | "guildMembersChunk"
    | "guildMemberBoost"
    | "guildMemberUnboost"
    | "guildMemberRoleAdd"
    | "guildMemberRoleRemove"
    | "guildMemberNicknameUpdate"
    | "guildMemberEntered"
    | "guildMemberOffline"
    | "guildMemberOnline";

export type UserEvents =
    | "userUpdate"
    | "presenceUpdate"
    | "userAvatarUpdate"
    | "userUsernameUpdate"
    | "userDiscriminatorUpdate"
    | "userFlagsUpdate";

export type VoiceChannelEvents =
    | "voiceServerUpdate"
    | "voiceStateUpdate"
    | "voiceChannelJoin"
    | "voiceChannelLeave"
    | "voiceChannelSwitch"
    | "voiceChannelMute"
    | "voiceChannelUnmute"
    | "voiceChannelDeaf"
    | "voiceChannelUndeaf"
    | "voiceStreamingStart"
    | "voiceStreamingStop";

export type GuildEvents =
    | "guildCreate"
    | "guildDelete"
    | "guildUpdate"
    | "guildUnavailable"
    | "guildBoostLevelUp"
    | "guildBoostLevelDown"
    | "guildBannerAdd"
    | "guildAfkChannelAdd"
    | "guildVanityURLAdd"
    | "guildVanityURLRemove"
    | "guildVanityURLUpdate"
    | "guildFeaturesUpdate"
    | "guildAcronymUpdate"
    | "guildOwnerUpdate"
    | "guildPartnerAdd"
    | "guildPartnerRemove"
    | "guildVerificationAdd"
    | "guildIntegrationsUpdate"
    | "guildBanAdd"
    | "guildBanRemove"
    | "guildScheduledEventCreate"
    | "guildScheduledEventUpdate"
    | "guildScheduledEventDelete"
    | "guildScheduledEventUserAdd"
    | "guildScheduledEventUserRemove";

export type MessageEvents =
    | "messageCreate"
    | "messageDelete"
    | "messageUpdate"
    | "messageDeleteBulk"
    | "messagePinned"
    | "messageContentEdited"
    | "messageReactionAdd"
    | "messageReactionRemove"
    | "messageReactionRemoveAll"
    | "messageReactionRemoveEmoji";

export type RoleEvents =
    | "roleCreate"
    | "roleDelete"
    | "roleUpdate"
    | "rolePositionUpdate"
    | "rolePermissionsUpdate";

export type EmojiEvents = "emojiCreate" | "emojiDelete" | "emojiUpdate";

export type MusicEvents =
    | "botDisconnect"
    | "channelEmpty"
    | "connectionCreate"
    | "connectionError"
    | "queueEnd"
    | "trackAdd"
    | "trackEnd"
    | "tracksAdd"
    | "trackStart";

export type ProcessEvents =
    | "multipleResolves"
    | "uncaughtException"
    | "uncaughtExceptionMonitor"
    | "unhandledRejection";

export type DiscordEvents =
    | ClientEvents
    | ChannelEvents
    | ThreadChannelEvents
    | MemberEvents
    | UserEvents
    | VoiceChannelEvents
    | GuildEvents
    | MessageEvents
    | RoleEvents
    | EmojiEvents;

export type RSSEvents = "valorantRSS";

export type Events = DiscordEvents | MusicEvents | ProcessEvents | RSSEvents;
