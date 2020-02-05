import { Attachment } from 'discord.js';
import { JSDOM } from 'jsdom';
import { log } from './log';
import * as d3 from 'd3';

type TGraphSize = {
    width: number,
    height: number,
    margin?: {
        top: number,
        bottom: number,
        left: number,
        right: number
    }
}
const defaultGraphSize = {
    width: 400,
    height: 400,
    margin: { 
        top: 0, 
        right: 0, 
        bottom: 0, 
        left: 0,
    }
}

type TGraphDataset = {
    key: string;
    value: number;
    color?: string;
}

export default class BotGraph {
    private size: TGraphSize;
    private dataset: Array<TGraphDataset>;

    constructor(size: TGraphSize = defaultGraphSize, /*values:Array<TGraphDataset>*/) {
        this.size = size;
        // this.dataset = values;
    }

    generate = () => {
        const { document } = new JSDOM(`<html><body></body></html>`).window;
        (<any>global).document = document;
        const width = this.size.margin 
            ? this.size.width - this.size.margin.left - this.size.margin.right
            : this.size.width;
        const height = this.size.margin 
            ? this.size.height - this.size.margin.top - this.size.margin.bottom
            : this.size.height;
        const svg = d3.select('body')
            .append('svg')
            .attr('width', width + 20)
            .attr('height', height + 20);
        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr("id", "rect1")
            .attr("x", 10)
            .attr("y", 10)
            .style("fill", "green");
        const dataUri = `data:image/svg;base64,${d3.select('body').html()}`;
        const buffer = Buffer.from(dataUri.toString()).toString('base64');
        const image = new Attachment(buffer, 'graph.svg');
        return image;
    }    
}