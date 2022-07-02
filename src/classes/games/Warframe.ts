import Client from "@classes/Client";
import moment from "moment";
import WarframeMarket from "warframe-market";
import WarframeItems from "warframe-items";
import { Platform } from "warframe-market/lib/typings";
import {
    CommandInteraction,
    Message,
    GuildMember,
    AutocompleteInteraction,
} from "discord.js";

const { MARKET_API } = process.env;

export default class Warframe {
    readonly client: Client;

    private readonly market: WarframeMarket;
    private readonly items: WarframeItems;

    constructor(client: Client) {
        this.client = client;

        this.market = new WarframeMarket(MARKET_API as string);
        this.items = new WarframeItems({
            category: ["All"],
            ignoreEnemies: true,
        });
    }

    async itemAutocomplete(interaction: AutocompleteInteraction) {
        const { options } = interaction;

        const focused = options.getFocused() as string;

        let items = this.items.filter((item) => item.tradable);

        if (focused.length > 0)
            items = items.filter((item) => item.name.startsWith(focused));

        items = items.slice(0, 25);

        await interaction.respond(
            items.map((choice) => ({ name: choice.name, value: choice.name }))
        );
    }

    async orders(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        const item = options.getString("item", true);
        const userStatus = options.getString("user_status");

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

        let orders = items.payload.orders
            .sort((a, b) => a.platinum - b.platinum)
            .sort(
                (a, b) =>
                    moment(b.creation_date).unix() -
                    moment(a.creation_date).unix()
            );

        if (userStatus)
            orders = orders.filter((order) => order.user.status === userStatus);

        let page = 0;

        const typeButtons = [
            this.client.util
                .button()
                .setCustomId("orders_sellers")
                .setLabel("Sellers")
                .setStyle("PRIMARY"),
            this.client.util
                .button()
                .setCustomId("orders_buyers")
                .setLabel("Buyers")
                .setStyle("SUCCESS"),
        ];

        const navButtons = [
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

        const bottomButtons = [
            this.client.util
                .button()
                .setCustomId("create_paste")
                .setLabel("Create Paste")
                .setStyle("SUCCESS"),
        ];

        const typeRow = this.client.util.row().setComponents(typeButtons);
        const navRow = this.client.util.row().setComponents(navButtons);
        const bottomRow = this.client.util.row().setComponents(bottomButtons);

        const sellerEmbeds = orders.filter(order => order.order_type === "sell").map((order, index) => {
            const embed = this.client.util
                .embed()
                .setTitle(`Sell Orders for ${item}`)
                .setDescription(
                    `
                    \`Cost\`: ${order.platinum} (each)
                    \`Quantity\`: ${order.quantity}
                    \`Last Updated\`: <t:${moment(order.last_update).unix()}:R>
                    \`Created\`: <t:${moment(order.creation_date).unix()}:R>
                `
                )
                .addField(
                    "Seller",
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

        const buyerEmbeds = orders.filter(order => order.order_type === "buy").map((order, index) => {
            const embed = this.client.util
                .embed()
                .setTitle(`Buy Orders for ${item}`)
                .setDescription(
                    `
                    \`Cost\`: ${order.platinum} (each)
                    \`Quantity\`: ${order.quantity}
                    \`Last Updated\`: <t:${moment(order.last_update).unix()}:R>
                    \`Created\`: <t:${moment(order.creation_date).unix()}:R>
                `
                )
                .addField(
                    "Buyer",
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

        let embeds = sellerEmbeds;

        const currPage = (await interaction.editReply({
            embeds: [sellerEmbeds[page]],
            components: [typeRow, navRow, bottomRow],
        })) as Message;

        const collector = currPage.createMessageComponentCollector({
            filter: (i) =>
                (i.customId === navButtons[0].customId ||
                    i.customId === navButtons[1].customId ||
                    i.customId === typeButtons[0].customId ||
                    i.customId === typeButtons[1].customId) &&
                i.user.id === member.id,
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case typeButtons[0].customId: {
                    embeds = sellerEmbeds;
                    break;
                }
                case typeButtons[1].customId: {
                    embeds = buyerEmbeds;
                    break;
                }
                case navButtons[0].customId: {
                    page = page > 0 ? --page : embeds.length - 1;
                    break;
                }
                case navButtons[1].customId: {
                    page = page + 1 < embeds.length ? ++page : 0;
                    break;
                }
                default:
                    break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [typeRow, navRow, bottomRow],
            });

            collector.resetTimer();
        });
    }
}
