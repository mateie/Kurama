import Client from '@classes/Client';
import { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ContextMenuInteraction, PermissionResolvable } from 'discord.js';

export interface IBase {
    readonly client: Client;
    name: string | undefined;
    description: string | 'No Description';
    category: string | undefined;
    permission: PermissionResolvable | null;
}

export interface ICommand extends IBase {
    data: SlashCommandBuilder;
    run(interaction: CommandInteraction);
}

export interface IMenu extends IBase {
    data: ContextMenuCommandBuilder;
    run(interaction: ContextMenuInteraction);
}

export interface IEvent {
    readonly client: Client;
    name: Events;
    description: string | 'No Description';
    category: string | undefined;
    once: boolean | null;
}

export interface HandlerOptions {
    directory: string;
};

export type CommandHandlerOptions = HandlerOptions;
export type EventHandlerOptions = HandlerOptions;

export type Events =
    | 'rateLimit'
    | 'invalidRequestWarning'
    | 'apiResponse'
    | 'apiRequest'
    | 'ready'
    | 'guildCreate'
    | 'guildDelete'
    | 'guildUpdate'
    | 'inviteCreate'
    | 'inviteDelete'
    | 'guildUnavailable'
    | 'guildMemberAdd'
    | 'guildMemberRemove'
    | 'guildMemberUpdate'
    | 'guildMemberAvailable'
    | 'guildMembersChunk'
    | 'guildIntegrationsUpdate'
    | 'roleCreate'
    | 'roleDelete'
    | 'roleUpdate'
    | 'emojiCreate'
    | 'emojiDelete'
    | 'emojiUpdate'
    | 'guildBanAdd'
    | 'guildBanRemove'
    | 'channelCreate'
    | 'channelDelete'
    | 'channelUpdate'
    | 'channelPinsUpdate'
    | 'messageCreate'
    | 'messageDelete'
    | 'messageUpdate'
    | 'messageDeleteBulk'
    | 'messageReactionAdd'
    | 'messageReactionRemove'
    | 'messageReactionRemoveAll'
    | 'messageReactionRemoveEmoji'
    | 'threadCreate'
    | 'threadDelete'
    | 'threadUpdate'
    | 'threadListSync'
    | 'threadMemberUpdate'
    | 'threadMembersUpdate'
    | 'userUpdate'
    | 'presenceUpdate'
    | 'voiceServerUpdate'
    | 'voiceStateUpdate'
    | 'typingStart'
    | 'webhookUpdate'
    | 'interactionCreate'
    | 'error'
    | 'warn'
    | 'debug'
    | 'cacheSweep'
    | 'shardDisconnect'
    | 'shardError'
    | 'shardReconnecting'
    | 'shardReady'
    | 'shardResume'
    | 'invalidated'
    | 'raw'
    | 'stageInstanceCreate'
    | 'stageInstanceUpdate'
    | 'stageInstanceDelete'
    | 'stickerCreate'
    | 'stickerDelete'
    | 'stickerUpdate'
    | 'guildScheduledEventCreate'
    | 'guildScheduledEventUpdate'
    | 'guildScheduledEventDelete'
    | 'guildScheduledEventUserAdd'
    | 'guildScheduledEventUserRemove'
    | 'botDisconnect'
    | 'channelEmpty'
    | 'connectionCreate'
    | 'connectionError'
    | 'queueEnd'
    | 'trackAdd'
    | 'trackEnd'
    | 'tracksAdd'
    | 'trackStart';
    
