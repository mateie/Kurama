import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";
import { inspect } from "util";

export default class UncaughtExceptionEvent extends Event implements IEvent {
  constructor(client: Client) {
    super(client);

    this.name = "uncaughtException";
    this.process = true;
  }

  async run(reason: Error, origin: string) {
    const channel = this.client.botLogs;

    const embed = this.util
      .embed()
      .setTitle("There was an Uncaught Exception/Catch")
      .setColor("RED")
      .setURL("https://nodejs.org/api/process.html#event-uncaughtexception")
      .addField(
        "Error",
        `\`\`\`${inspect(reason, { depth: 0 })}\`\`\``.substring(0, 1000)
      )
      .addField(
        "Origin",
        `\`\`\`${inspect(origin, { depth: 0 })}\`\`\``.substring(0, 1000)
      );

    channel.send({ embeds: [embed] });
  }
}
