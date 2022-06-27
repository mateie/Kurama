import Client from "@classes/Client";
import Cryptr from "cryptr";

const { CRYPT_SECRET } = process.env;

export default class Crypt extends Cryptr {
    client: Client;

    constructor(client: Client) {
        super(CRYPT_SECRET as string);

        this.client = client;
    }
}