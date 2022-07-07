import {
    Client as DiscordClient,
    Guild,
    PresenceData,
    TextChannel,
} from "discord.js";
import path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import logs from "discord-logs";

import Dashboard from "./dashboard";

import Canvas from "./canvas";
import Crypt from "./systems/Crypt";
import Database from "./database";
import Games from "./games/index";
import Moderation from "./moderation";
import Music from "./systems/Music";
import Playlists from "./systems/Playlists";
import Util from "./util";
import XP from "./systems/XP";

import EventHandler from "./handlers/EventHandler";
import CommandHandler from "./handlers/CommandHandler";
import Marriage from "./systems/Marriage";
import RSS from "./systems/PatchNotes";

const { TOKEN } = process.env;

export default class Client extends DiscordClient {
    readonly owners: string[];

    readonly dashboard: Dashboard;

    readonly canvas: Canvas;
    readonly crypt: Crypt;
    readonly database: Database;
    readonly games: Games;
    readonly marriage: Marriage;
    readonly moderation: Moderation;
    readonly music: Music;
    readonly playlists: Playlists;
    readonly rss: RSS;
    readonly util: Util;
    readonly xp: XP;

    readonly eventHandler: EventHandler;
    readonly commandHandler: CommandHandler;

    mainGuild!: Guild;

    botLogs!: TextChannel;

    constructor() {
        super({ intents: 32767 });

        this.owners = ["401269337924829186"];

        this.dashboard = new Dashboard(this);

        this.canvas = new Canvas(this);
        this.crypt = new Crypt(this);
        this.database = new Database(this);
        this.games = new Games(this);
        this.marriage = new Marriage(this);
        this.moderation = new Moderation(this);
        this.music = new Music(this);
        this.playlists = new Playlists(this);
        this.rss = new RSS(this);
        this.util = new Util(this);
        this.xp = new XP(this);

        this.eventHandler = new EventHandler(this, {
            directory: path.resolve(process.cwd(), "build", "events"),
        });
        this.commandHandler = new CommandHandler(this, {
            directory: path.resolve(process.cwd(), "build", "commands"),
        });

        this.token = TOKEN as string;

        logs(this, { debug: true });
    }

    async init() {
        try {
            await this.login();

            this.database.connect();

            await this.eventHandler.loadAll();
            await this.commandHandler.loadAll();

            await this.deploy();
        } catch (err) {
            console.error(err);
        }
    }

    async deploy() {
        const clientId = this.user?.id as string;
        const token = this.token as string;

        const commands: any[] = [];
        const globalCommands: any[] = [];

        this.commandHandler.commands.forEach((command) =>
            command.global
                ? globalCommands.push(command.data.toJSON())
                : commands.push(command.data.toJSON())
        );

        const rest = new REST({ version: "10" }).setToken(token);

        try {
            console.info("Pushing Application Commands to REST");

            await rest.put(Routes.applicationCommands(clientId), {
                body: globalCommands,
            });

            await rest.put(
                Routes.applicationGuildCommands(clientId, this.mainGuild.id),
                {
                    body: commands,
                }
            );

            console.info("Pushed Application Commands to REST");
        } catch (err) {
            console.error(err);
        }
    }

    async setPresence() {
        const activities: PresenceData[] = [
            {
                status: "online",
                activities: [
                    {
                        name: `${this.guilds.cache.size} Servers`,
                        type: "WATCHING",
                    },
                ],
            },
            {
                status: "online",
                activities: [
                    {
                        name: `${this.users.cache.size} Users`,
                        type: "LISTENING",
                    },
                ],
            },
        ];

        this.user?.setPresence(
            activities[Math.floor(Math.random() * activities.length)]
        );
    }
}
