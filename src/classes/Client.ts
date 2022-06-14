import {
    Client as DiscordClient,
    Guild,
    PresenceData,
    TextChannel,
} from "discord.js";
import path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import Nekos from "nekos.life";
import logs from "discord-logs";

import Dashboard from "./dashboard";

import Canvas from "./canvas";
import Database from "./database";
import Moderation from "./moderation";
import Music from "./systems/Music";
import Playlists from "./systems/Playlists";
import Util from "./util";
import XP from "./systems/XP";

import EventHandler from "./handlers/EventHandler";
import CommandHandler from "./handlers/CommandHandler";
import Valorant from "./games/Valorant";
import Marriage from "./systems/Marriage";

const { TOKEN } = process.env;

export default class Client extends DiscordClient {
    readonly owners: string[];

    dashboard: Dashboard;

    canvas: Canvas;
    database: Database;
    marriage: Marriage;
    moderation: Moderation;
    music: Music;
    nekos: Nekos;
    playlists: Playlists;
    util: Util;
    valorant: Valorant;
    xp: XP;

    eventHandler: EventHandler;
    commandHandler: CommandHandler;

    mainGuild!: Guild;

    botLogs!: TextChannel;

    constructor() {
        super({ intents: 32767 });

        this.owners = ["401269337924829186", "190120411864891392"];

        this.dashboard = new Dashboard(this);

        this.canvas = new Canvas(this);
        this.database = new Database(this);
        this.marriage = new Marriage(this);
        this.moderation = new Moderation(this);
        this.music = new Music(this);
        this.nekos = new Nekos();
        this.playlists = new Playlists(this);
        this.util = new Util(this);
        this.valorant = new Valorant(this);
        this.xp = new XP(this);

        this.eventHandler = new EventHandler(this, {
            directory: path.resolve(process.cwd(), "build", "events"),
        });
        this.commandHandler = new CommandHandler(this, {
            directory: path.resolve(process.cwd(), "build", "commands"),
        });

        this.token = TOKEN as string;

        this.login();

        this.database.connect();

        this.eventHandler.loadAll();
        this.commandHandler.loadAll();

        logs(this, { debug: true });
    }

    async deploy() {
        const clientId = this.user?.id as string;
        const guild = this.mainGuild;
        const guild2 = this.guilds.cache.get("706334426514063411") as Guild;
        const guild3 = this.guilds.cache.get("834292702715052033") as Guild;
        const token = this.token as string;

        const body: any[] = [];

        this.commandHandler.commands.forEach((command) =>
            body.push(command.data.toJSON())
        );

        const rest = new REST({ version: "10" }).setToken(token);

        try {
            console.info("Pushing Application Commands to REST");

            await rest.put(
                Routes.applicationGuildCommands(clientId, guild.id),
                {
                    body,
                }
            );

            await rest.put(
                Routes.applicationGuildCommands(clientId, guild2.id),
                {
                    body,
                }
            );

            await rest.put(
                Routes.applicationGuildCommands(clientId, guild3.id),
                {
                    body,
                }
            );

            console.info("Pushed Application Commands to REST");
        } catch (err) {
            console.error(err);
        }
    }

    async setPresence() {
        const users = await this.database.users.getAll();

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
                        name: `${users.length} Users`,
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
