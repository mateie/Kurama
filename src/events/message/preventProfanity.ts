import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { Guild, Message } from 'discord.js';

export default class PreventProfanityEvent extends Event implements IEvent {

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {
        if (message.author.bot) return;

        const guild = await this.client.database.guilds.get(message.guild as Guild);

        if (!guild.toggles.preventProfanity) return;

        const word = message.content;

        const isWhitelisted = await this.client.moderation.whitelist.check(word, message.guild as Guild);
        if (isWhitelisted) return;

        const toxic = await this.client.moderation.whitelist.isToxic(word);

        if (!toxic) return;
        if (message.deletable) message.delete();
        const attachment = this.client.util.attachment('https://c.tenor.com/7R0cugwI7k0AAAAC/watch-your-mouth-watch-your-profanity.gif');
        await message.channel.send({ files: [attachment] }).then(msg => setTimeout(() => msg.delete().catch(console.error), 3000));
    }
}