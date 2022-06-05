import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { PermissionResolvable } from "discord.js";
import Client from "../Client";
import Util from "@classes/util";

export default class Command {
  readonly client: Client;
  readonly util: Util;

  name: string | undefined;
  description: string | "No Description";
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
}
