import { Canvas as CanvasM } from 'skia-canvas';
import getColors from 'get-image-colors';

import fetch from 'node-fetch';

import Client from '../Client';
import MemberCanvas from './Member';

export default class Canvas {
    client: Client;
    member: MemberCanvas;

    constructor(client: Client) {
        this.client = client;

        this.member = new MemberCanvas(this.client, this);
    }

    applyText(canvas: CanvasM, text: string, defaultFontSize: number, width: number, font: string){
        const ctx = canvas.getContext('2d');
        do {
            ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
        } while (ctx.measureText(text).width > width);
        return ctx.font;
    }
    
    async popularColor(url: string) {
        const buffer = await fetch(url).then(res => res.buffer());

        const colors = (await getColors(buffer, 'image/png')).map((color: any) => color.hex());
        return colors;
    }
}