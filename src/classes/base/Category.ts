import { Collection } from 'discord.js';

export default class Category extends Collection<string, any> {
    id: string;

    constructor(id: string, iterable?: any) {
        super(iterable);

        this.id = id;
    }

    toString = () => this.id;
}