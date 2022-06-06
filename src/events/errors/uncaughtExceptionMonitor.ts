import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";
import { inspect } from "util";

export default class UncaughtExceptionMonitorEvent
    extends Event
    implements IEvent
{
    constructor(client: Client) {
        super(client);

        this.name = "uncaughtExceptionMonitor";
        this.process = true;
    }

    async run(err: Error, origin: string) {
        const channel = this.client.botLogs;

        const embed = this.util
            .embed()
            .setTitle("There was an Uncaught Exception Monitor")
            .setColor("RED")
            .setURL(
                "https://nodejs.org/api/process.html#event-uncaughtexceptionmonitor"
            )
            .addField(
                "Error",
                `\`\`\`${inspect(err, {
                    depth: 0,
                })}\`\`\``.substring(0, 1000)
            )
            .addField(
                "Origin",
                `\`\`\`${inspect(origin, {
                    depth: 0,
                })}\`\`\``.substring(0, 1000)
            );

        channel.send({ embeds: [embed] });
    }
}
