import Client from '@classes/Client';
import { EventHandlerOptions, IEvent } from '@types';
import { Collection } from 'discord.js';
import Handler from '.';

import fs from 'fs';

import Ascii from 'ascii-table';
import Category from '@classes/base/Category';
import path from 'path';

export default class EventHandler extends Handler {
    table: any;

    readonly events: Collection<string, IEvent>;
    readonly categories: Collection<string, Category>;

    constructor(client: Client, { directory }: EventHandlerOptions) {
        super(client, { directory });

        this.table = new Ascii('Events Loaded').setHeading('Event Name', 'Description', 'Category', 'Status');

        this.events = new Collection();
        this.categories = new Collection();
    }

    async load(file: string) {
        const { default: Event } = require(file);
        if (typeof Event !== 'function') return this.table.addRow('❌ Event is not a class');
        const event = new Event(this.client);

        if (!event.description) return this.table.addRow(event.name, '❌ Missing Description');

        this.events.set(event.name, event);

        const category = this.categories.get(file.split('\\' || '/')[5]);
        event.category = category;
        category?.set(event.name, event);
        
        if (event.once) {
            if (event.process) {
                process.once(event.name, (...args) => event.run(...args));
            }

            if (category?.id.toLowerCase() == 'music') {
                this.client.music.once(event.name, (...args: any) => event.run(...args));
            } else {
                this.client.once(event.name, (...args) => event.run(...args));
            }
        } else {
            if (event.process) {
                process.on(event.name, (...args) => event.run(...args));
            }

            if (category?.id.toLowerCase() == 'music') {
                this.client.music.on(event.name, (...args: any) => event.run(...args));
            } else {
                this.client.on(event.name, (...args) => event.run(...args));
            }
        }

        await this.table.addRow(event.name, event.description, event.category, '✔ Loaded');
    }

    async loadAll() {
        const categories = fs.readdirSync(this.directory).filter(category => !category.includes('.'));

        categories.forEach(category => {
            const files = fs.readdirSync(path.resolve(this.directory, category)).filter(file => file.endsWith('.js'));
            this.categories.set(category, new Category(this.client.util.capFirstLetter(category)));
            files.forEach(async file => await this.load(path.resolve(this.directory, category, file)));
        });

        console.log(this.table.toString());
    }
}