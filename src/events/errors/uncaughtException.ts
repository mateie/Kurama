import Client from "@classes/Client";
import ProcessEvent from "@classes/base/event/ProcessEvent";
import { IEvent } from "@types";
import { inspect } from "util";

export default class UncaughtExceptionEvent
    extends ProcessEvent
    implements IEvent
{
    constructor(client: Client) {
        super(client);

        this.name = "uncaughtException";
    }

    async run(reason: Error, origin: string) {
        console.error(reason);
        const channel = this.client.botLogs;
        if (!channel) return;

        const embed = this.util
            .embed()
            .setTitle("There was an Uncaught Exception/Catch")
            .setColor("Red")
            .setURL(
                "https://nodejs.org/api/process.html#event-uncaughtexception"
            )
            .addFields(
                {
                    name: "Error",
                    value: `\`\`\`${inspect(reason, {
                        depth: 0
                    })}\`\`\``.substring(0, 1000)
                },
                {
                    name: "Origin",
                    value: `\`\`\`${inspect(origin, {
                        depth: 0
                    })}\`\`\``.substring(0, 1000)
                }
            );

        channel.send({ embeds: [embed] });
    }
}
