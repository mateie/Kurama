import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionResolvable } from "discord.js";
import Client from "../Client";
import Util from "@classes/util";
import { IBaseJSON } from "../../@types/index";

export default class Command {
    readonly client: Client;
    readonly util: Util;

    name!: string | undefined;
    description!: string | "No Description";
    category: string | undefined;

    ownerOnly: boolean;
    test: boolean;

    permission: PermissionResolvable | null;
    data!: SlashCommandBuilder;

    constructor(client: Client) {
        this.client = client;
        this.util = client.util;

        this.description = "No Description";

        this.ownerOnly = false;
        this.test = false;

        this.permission = null;
        this.data = new SlashCommandBuilder();
    }

    toJSON(): IBaseJSON {
        return {
            name: this.name,
            description: this.description,
            category: this.category,
            permission: this.permission ? this.permission.toString() : null,
            ownerOnly: this.ownerOnly,
            data: this.data.toJSON(),
        };
    }

    toString = () => this.name;
}
