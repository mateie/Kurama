import Client from "@classes/Client";
import moment from "moment";
import WarframeMarket from "warframe-market";
import { Platform } from "warframe-market/lib/typings";
import { CommandInteraction, Message, GuildMember } from "discord.js";

const { MARKET_API } = process.env;

export default class Warframe {
    readonly client: Client;
    private readonly market: WarframeMarket;
    constructor(client: Client) {
        this.client = client;

        this.market = new WarframeMarket(MARKET_API as string);
    }

    async orders(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        const type = options.getString("order_type", true);
        const item = options.getString("item", true);

        await interaction.deferReply();

        const items = await this.market.Items.GetItemOrdersAsync(
            item.toLowerCase().replace(/ /g, "_"),
            Platform.PC
        );

        if (items.error) {
            const msg = (await interaction.editReply({
                content: `No Orders for **${item}** found`,
            })) as Message;
            setTimeout(() => {
                msg.delete().catch(() => {
                    return;
                });
            }, 2000);
            return;
        }

        const orders = items.payload.orders
            .filter((order) => order.order_type == type)
            .sort(
                (a, b) =>
                    a.platinum - b.platinum
            );

        let page = 0;

        const buttons = [
            this.client.util
                .button()
                .setCustomId("previous_order")
                .setLabel("Order")
                .setEmoji("⬅️")
                .setStyle("SECONDARY"),
            this.client.util
                .button()
                .setCustomId("next_order")
                .setLabel("Order")
                .setEmoji("➡️")
                .setStyle("SECONDARY"),
        ];

        const row = this.client.util.row().setComponents(buttons);

        const embeds = orders.map((order, index) => {
            const orderType = order.order_type === "sell" ? "Seller" : "Buyer";
            const embed = this.client.util
                .embed()
                .setTitle(`${orderType} Orders for ${item}`)
                .setDescription(
                    `
                    \`Cost\`: ${order.platinum} (each)
                    \`Quantity\`: ${order.quantity}
                    \`Last Updated\`: <t:${moment(order.last_update).unix()}:R>
                    \`Created\`: <t:${moment(order.creation_date).unix()}:R>
                `
                )
                .addField(
                    orderType,
                    `
                    \`In Game Name\`: ${order.user.ingame_name}
                    \`Reputation\`: ${order.user.reputation}
                    \`Status\`: ${this.client.util.capFirstLetter(
                        order.user.status
                    )}
                    \`Last Seen\`*: <t:${moment(order.user.last_seen).unix()}:R>
                `
                )
                .setFooter({ text: `Page ${index + 1} of ${orders.length}` });

            return embed;
        });

        const currPage = (await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        })) as Message;

        const collector = currPage.createMessageComponentCollector({
            filter: (i) =>
                (i.customId === buttons[0].customId ||
                    i.customId === buttons[1].customId) &&
                i.user.id === member.id,
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case buttons[0].customId: {
                    page = page > 0 ? --page : embeds.length - 1;
                    break;
                }
                case buttons[1].customId: {
                    page = page + 1 < embeds.length ? ++page : 0;
                    break;
                }
                default:
                    break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [row],
            });

            collector.resetTimer();
        });
    }
}
