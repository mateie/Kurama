import Client from "@classes/Client";
import { CommandHandlerOptions, ICommand, IMenu } from "@types";
import Handler from ".";
import { Collection } from "discord.js";

import fs from "fs";

import Ascii from "ascii-table";
import path from "path";
import { IBaseJSON } from "../../@types/index";

export default class CommandHandler extends Handler {
    table: any;

    readonly commands: Collection<string, ICommand | IMenu>;
    readonly categories: Collection<string, Collection<string, IBaseJSON>>;

    constructor(client: Client, { directory }: CommandHandlerOptions) {
        super(client, { directory });

        this.table = new Ascii("Commands Loaded").setHeading(
            "Command Name",
            "Category",
            "Command Type",
            "Availability",
            "Status"
        );

        this.commands = new Collection();
        this.categories = new Collection();
    }

    async load(file: string) {
        const { default: Command } = require(file);
        if (typeof Command !== "function")
            return this.table.addRow("❌ Command is not a class");
        const command = new Command(this.client);

        if (!command.name)
            return this.table.addRow(
                file.split("/")[6],
                "Missing Name",
                "❌ Failed"
            );
        if (!command.description)
            return this.table.addRow(
                command.name,
                "Missing Description",
                "❌ Failed"
            );
        if (!command.run)
            return this.table.addRow(
                command.name,
                "Missing `run` function",
                "❌ Failed"
            );
        if (typeof command.run !== "function")
            return this.table.addRow(
                command.name,
                "`run` should be a function",
                "❌ Failed"
            );

        command.category = file.split("\\")[5] || file.split("/")[5];
        const category = this.categories.get(command.category);
        category?.set(command.name, command.toJSON());

        this.commands.set(command.name, command);

        this.table.addRow(
            command.name,
            command.category,
            command.data && command.data.type ? "Menu" : "Slash",
            command.global ? "Global" : "Private Guilds",
            "✔ Loaded"
        );
    }

    async loadAll() {
        const categories = fs
            .readdirSync(this.directory)
            .filter((category) => !category.includes("."));

        categories.forEach((category) => {
            const files = fs
                .readdirSync(path.resolve(this.directory, category))
                .filter((file) => file.endsWith(".js"));

            this.categories.set(category, new Collection());
            files.forEach(
                async (file) =>
                    await this.load(
                        path.resolve(this.directory, category, file)
                    )
            );
        });

        console.log(this.table.toString());
    }
}
