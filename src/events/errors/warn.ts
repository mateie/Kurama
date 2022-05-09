import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { inspect } from 'util';

export default class WarnEvent extends Event implements IEvent {
    constructor(client: Client) {
        super(client);

        this.name = 'warn';
        this.process = true;
    }

    async run(warn: Error) {
        const channel = this.client.botLogs;

        const embed = this.client.util.embed()
            .setTitle('There was an Uncaught Exception Monitor Warning')
            .setColor('RED')
            .setURL('https://nodejs.org/api/process.html#event-warning')
            .addField('Warn', `\`\`\`${inspect(warn, { depth: 0 })}\`\`\``.substring(0, 1000));
        
        channel.send({ embeds: [embed] });
    }
}