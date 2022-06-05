import Client from "@classes/Client";
import Event from "@classes/base/Event";
import { IEvent } from "@types";
import { inspect } from "util";

export default class ProcessErrorEvent extends Event implements IEvent {
  constructor(client: Client) {
    super(client);

    this.name = "error";
    this.process = true;
  }

  async run(err: Error) {
    const channel = this.client.botLogs;

    const embed = this.util
      .embed()
      .setTitle("Error")
      .setURL("https://discordjs.guide/popular-topics/errors.html#api-errors")
      .setColor("RED")
      .setDescription(`\`\`\`${inspect(err, { depth: 0 })}\`\`\``);

    channel.send({ embeds: [embed] });
  }
}
