import * as d3 from 'd3';

const lineHeight = 10;
const lineDistance = 20;
export class LineHelper {

	startDate(startDate) {
		this._startDate = startDate;
		return this;
	}

	cellWidth(cellWidth) {
		this._cellWidth = cellWidth;
		return this;
	}

	drawPlannedLine(selection, {start, end}) {
		const lineHelper = this;
		selection
			.filter(object => object.table === 'task')
			.append("rect")
			.attr("class", "planned-line")
			.attr(
				"x",
				object => d3.timeDay.count(lineHelper._startDate, start(object)) * this._cellWidth
			)
			.attr("height", lineHeight)
			.attr(
				"width",
				object =>
					d3.timeDay.count(start(object), end(object)) *
					lineHelper._cellWidth
			)
			.attr("rx", 10)
			.attr("ry", 10);

		selection
			.filter(object => object.table !== 'task')
			.append("polygon")
			.attr("class", "planned-line")
			.attr("points", object => {
				const polygonPoints = [];
				const startPoint = d3.timeDay.count(lineHelper._startDate, start(object)) * this._cellWidth;
				const width = d3.timeDay.count(start(object), end(object)) * lineHelper._cellWidth;
				const endPoint = startPoint + width;
				polygonPoints.push({x: startPoint, y: 0});
				polygonPoints.push({x: endPoint, y: 0});
				polygonPoints.push({x: endPoint, y: lineHeight + 5});
				polygonPoints.push({x: endPoint - 5, y: lineHeight});
				polygonPoints.push({x: startPoint + 5, y: lineHeight});
				polygonPoints.push({x: startPoint, y: lineHeight + 5});
				return polygonPoints.map(point => {
					return [point.x, point.y].join(",");
				}).join(" ");
			});
	}

	drawPredictedLine(selection, {type, start, end}) {
		const lineHelper = this;
		const style = {
			early: 'predicted-line--early',
			normal: 'predicted-line--normal',
			late: 'predicted-line--late',
		};

		selection.append('line')
			.attr('class', 'predicted-line')
			.classed(style[type], true)
			.attr('x1', object => d3.timeDay.count(lineHelper._startDate, start(object)) * lineHelper._cellWidth)
			.attr('y1', lineHeight / 2 + 0.4)
			.attr('y2', lineHeight/2 + 0.4)
			.attr('x2', function (object) {
				const width =
					d3.timeDay.count(
						start(object),
						end(object),
					) * lineHelper._cellWidth;
				return +d3.select(this).attr("x1") + width;
			});
	}

	drawDottedLine(selection, {type, start, end}) {
		const lineHelper = this;

		const style = {
			late: 'dotted-line--late',
			normal: 'dotted-line--normal',
		};

		selection.append('rect')
			.attr('class', 'dotted-line')
			.classed(style[type], true)
			.attr('x', object => d3.timeDay.count(lineHelper._startDate, start(object)) * lineHelper._cellWidth)
			.attr('y', lineDistance)
			.attr('width', function (object) {
				return d3.timeDay.count(
					start(object),
					end(object),
				) * lineHelper._cellWidth;
			})
			.attr('height', lineHeight);
	}

	drawSolidLine(selection, {type, start, end}) {
		const lineHelper = this;

		const style = {
			early: 'solid-line--early',
			normal: 'solid-line--normal',
			late: 'solid-line-late'
		};

		selection.append('rect')
			.attr('class', 'solid-line')
			.classed(style[type], true)
			.attr('x', object => d3.timeDay.count(lineHelper._startDate, start(object)) * lineHelper._cellWidth)
			.attr('y', lineDistance)
			.attr('width', function (object) {
				return d3.timeDay.count(
					start(object),
					end(object),
				) * lineHelper._cellWidth;
			})
			.attr('height', lineHeight);
	}

	drawToday(selection, {y1, lineHeight}) {
		const today = new Date();
		const x = d3.timeDay.count(this._startDate, today) * this._cellWidth;
		selection.append('line').attr('class', 'today-line').attr('x1', x).attr('x2', x).attr('y1', y1).attr('y2', y1 + lineHeight);
	}

	fillWorkLog(selection) {
		selection.append('rect').attr('class', 'work-log')
			.attr('y', lineDistance)
			.attr('x', data => {
				return d3.timeDay.count(this._startDate, data.day) * this._cellWidth;
			})
			.attr('width', this._cellWidth)
			.attr('height', lineHeight)
			.classed('work-log--early', data => data.object.target_start && data.object.target_start.getTime() > data.day.getTime())
			.classed('work-log--normal', data => data.object.target_start && data.object.target_due && data.object.target_start.getTime() <= data.day.getTime() && data.object.target_due.getTime() >= data.day.getTime())
			.classed('work-log--late', data => data.object.target_due && data.object.target_due.getTime() < data.day.getTime());
	}
}