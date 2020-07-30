import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import * as d3 from 'd3';
import _ from 'lodash';
import { Attachment } from 'discord.js';

type TGraphSize = {
	width: number;
	height: number;
	margin?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
};

type TGraphField = {
	key: string;
	value: number;
	viktor?: boolean;
};

export default class BotGraph {
	private size: TGraphSize;

	constructor(size: TGraphSize) {
		this.size = size;
	}

	generate = async (dataObject: TGraphField[]): Promise<Attachment> => {
		const { document } = new JSDOM(
			`<html><body></body></html>`,
		).window;
		(<any>global).document = document;
		const width = this.size.width;
		const height = this.size.height;
		const day = 86400000;
		const margin = 25;
		const days = timestamp =>
			parseInt(((Date.now() - timestamp) / day).toFixed(0));
		let data = _.orderBy(dataObject, ['value'], ['desc']);
		data = data.map(d => ({
			...d,
			value: days(d.value),
		}));

		const xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, d => d.value)])
			.nice()
			.range([margin, width - 2 * margin]);
		const yScale = d3
			.scaleBand()
			.domain(d3.range(data.length))
			.range([height - margin, margin])
			.padding(0.1);

		const xAxis = g =>
			g
				.attr('transform', `translate(0,${margin})`)
				.call(
					d3
						.axisTop(xScale)
						.tickFormat(d => `${d}d`),
				);
		const yAxis = g =>
			g
				.attr('transform', `translate(${margin},0)`)
				.call(
					d3
						.axisRight(yScale)
						.tickFormat(() => ''),
				);

		const graph = d3
			.select('body')
			.append('svg')
			.attr('width', width)
			.attr('height', height);
		graph.append('rect')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('fill', 'rgba(47,49,54,0.8)');
		const bar = graph.selectAll('.bar').data(data).enter();

		bar.append('rect')
			.attr('fill', d => (d.color ? d.color : '#434d66'))
			.attr('x', (_d, i: number) => xScale(i))
			.attr('y', (_d, i: number) => yScale(i))
			.attr('height', yScale.bandwidth())
			.attr('width', d => xScale(d.value) - margin);
		bar.append('text')
			.attr('x', (_d, i: number) => xScale(i) + margin)
			.attr(
				'y',
				(_d, i: number) =>
					yScale(i) + 0.65 * yScale.bandwidth(),
			)
			.attr('font-size', '12')
			.text(d => `${d.key.toUpperCase()}`);
		graph.append('g').call(xAxis);
		graph.append('g').call(yAxis);
		graph.selectAll('text')
			.attr('text-anchor', 'center')
			.attr('fill', 'white')
			.attr('font-family', 'Verdana');
		graph.selectAll('line').attr('stroke', '#ddd');
		graph.selectAll('path').attr('stroke', '#ddd');

		const htmlData = d3.select('body').html();
		const inputBuffer = Buffer.from(htmlData.trim());
		const pngBuffer = await sharp(inputBuffer, {
			density: 600,
		})
			.png({ compressionLevel: 9 })
			.toBuffer();
		const attachmentBuffer = new Attachment(pngBuffer, 'graph.png');
		return attachmentBuffer;
	};
}
