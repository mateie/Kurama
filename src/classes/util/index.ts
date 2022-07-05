import Client from "../Client";
import axios from "axios";
import {
    BufferResolvable,
    MessageActionRow,
    MessageActionRowComponent,
    MessageAttachment,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu,
    Modal,
    ModalActionRowComponent,
    TextInputComponent,
} from "discord.js";
import { Stream } from "stream";

import Nekos from "nekos.life";
import DIG from "discord-image-generation";

import { CDN } from "@discordjs/rest";

import UtilPagination from "./Pagination";
import UtilMember from "./Member";

export default class Util {
    readonly client: Client;
    readonly member: UtilMember;
    readonly pagination: UtilPagination;
    readonly nekos: Nekos;
    readonly dig: typeof DIG;
    readonly cdn: CDN;

    constructor(client: Client) {
        this.client = client;

        this.member = new UtilMember(this.client, this);
        this.pagination = new UtilPagination(this.client, this);
        this.nekos = new Nekos();
        this.dig = DIG;
        this.cdn = new CDN();
    }

    row = (): MessageActionRow<MessageActionRowComponent> =>
        new MessageActionRow<MessageActionRowComponent>();
    modalRow = (): MessageActionRow<ModalActionRowComponent> =>
        new MessageActionRow<ModalActionRowComponent>();
    button = () => new MessageButton();
    dropdown = () => new MessageSelectMenu();
    modal = () => new Modal();
    input = () => new TextInputComponent();
    durationMs = (dur: string) =>
        dur
            .split(":")
            .map(Number)
            .reduce((acc, curr) => curr + acc * 60) * 1000;
    embed = () =>
        new MessageEmbed()
            .setColor("ORANGE")
            .setTimestamp(new Date())
            .setFooter({ text: "Owned by Stealth" });
    convertToPercentage = (num: number) => Math.floor(num * 100);
    attachment = (file: BufferResolvable | Stream, name?: string) =>
        new MessageAttachment(file, name);
    embedURL = (title: string, url: string, display?: string) =>
        `[${title}](${url.replace(/\)/g, "%29")}${
            display ? ` "${display}"` : ""
        })`;
    capFirstLetter = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

    async imageToBuffer(url: string) {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
        });
        return response.data;
    }

    optionType(number: number) {
        switch (number) {
            case 1:
                return "Sub Command";
            case 2:
                return "Sub Command Group";
            case 3:
                return "String";
            case 4:
                return "Integer";
            case 5:
                return "Boolean";
            case 6:
                return "User";
            case 7:
                return "Channel";
            case 8:
                return "Role";
            case 9:
                return "Mentionable";
            case 10:
                return "Number";
            case 11:
                return "Attachment";
            default:
                return "Unknown";
        }
    }

    chunk(arr: any, size: number) {
        const temp = [];
        for (let i = 0; i < arr.length; i += size) {
            temp.push(arr.slice(i, i + size));
        }

        return temp;
    }

    list(arr: string[], conj = "and") {
        const len = arr.length;
        if (len == 0) return "";
        if (len == 1) return arr[0];
        return `${arr.slice(0, -1).join(", ")}${
            len > 1 ? `${len > 2 ? "," : ""} ${conj} ` : ""
        }${arr.slice(-1)}`;
    }

    capEachFirstLetter(str: string) {
        const temp: string[] = [];
        str.split(" ").forEach((str) => {
            temp.push(this.capFirstLetter(str));
        });

        return temp.join(" ");
    }

    abbrev(num: any) {
        if (!num || isNaN(num)) return "0";
        if (typeof num === "string") num = parseInt(num);
        const decPlaces = Math.pow(10, 1);
        const abbrev = ["K", "M", "B", "T"];
        for (let i = abbrev.length - 1; i >= 0; i--) {
            const size = Math.pow(10, (i + 1) * 3);
            if (size <= num) {
                num = Math.round((num * decPlaces) / size) / decPlaces;
                if (num == 1000 && i < abbrev.length - 1) {
                    num = 1;
                    i++;
                }
                num += abbrev[i];
                break;
            }
        }
        return num;
    }
}
