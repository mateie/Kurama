import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { PermissionResolvable } from "discord.js";
import Client from "../Client";
import Util from "@classes/util";
import { IBaseJSON } from "@types";

export default class Command {
    readonly client: Client;
    readonly util: Util;

    name!: string | undefined;
    description!: string | "No Description";
    category: string | undefined;

    ownerOnly: boolean;

    permission: PermissionResolvable | null;
    data!: ContextMenuCommandBuilder;

    constructor(client: Client) {
        this.client = client;
        this.util = client.util;

        this.description = "No Description";

        this.ownerOnly = false;

        this.permission = null;
        this.data = new ContextMenuCommandBuilder();
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
