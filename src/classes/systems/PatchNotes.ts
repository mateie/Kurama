import Client from "@classes/Client";

import RSSFeedEmitter from "rss-feed-emitter";

export default class RSS {
    readonly client: Client;
    readonly emitter: RSSFeedEmitter;

    constructor(client: Client) {
        this.client = client;

        this.emitter = new RSSFeedEmitter();

        this.emitter.add({
            url: "https://createfeed.fivefilters.org/extract.php?url=https%3A%2F%2Fplayvalorant.com%2Fen-us%2Fnews%2F&item=div%5Bclass%2A%3D%22NewsCard-module--featured%22%5D+a&item_title=img+%40alt&item_desc=p%5Bclass%2A%3D%22copy-02+NewsCard-module--description%22%5D&item_date=p%5Bclass%2A%3D%22copy-02+NewsCard-module--dateWrapper%22%5D+span%5Bclass%2A%3D%22NewsCard-module--published%22%5D&item_date_format=m%2Fd%2Fy&feed_title=Valorant+RSS+News&max=5&order=document&guid=url",
            refresh: 2000,
            eventName: "valorantRSS",
        });
    }
}
