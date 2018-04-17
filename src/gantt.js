import * as d3 from 'd3';

const lineHeight = 10;
const lineDistance = 20;

const parseTime = d3.timeParse("%Y-%m-%d");

export class Gantt {

	jobArray(jobArray) {
		this._jobArray = jobArray.map(objectData => {
			const transformedObjectData = Object.assign({}, objectData);
			for (let dateField of ['planned_start', 'planned_due', 'actual_due', 'actual_start', 'target_due', 'target_start', 'predicted_start', 'predicted_due', 'user_estimated_start', 'user_estimated_due']) {
				transformedObjectData[dateField] = objectData[dateField] ? parseTime(objectData[dateField]) : null;
			}
			transformedObjectData.days = transformedObjectData.days || [];
			return transformedObjectData;
		});
		return this;
	}

	startDate(startDate) {
		this._startDate = startDate;
		return this;
	}

	endDate(endDate) {
		this._endDate = endDate;
		return this;
	}

	cellWidth(width) {
		this._cellWidth = width;
		return this;
	}

	objectHeight(height) {
		this._objectHeight = height;
		return this;
	}

	draw(selection) {
		const gantt = this;
		const today = new Date();

		const objectWrapper = selection.selectAll('.object-wrapper')
									   .data(this._jobArray)
									   .enter()
									   .append('div')
									   .attr('class', 'object-wrapper')
									   .style('top', (d, i) => `${this._objectHeight * i}px`)
									   .style('height', this._objectHeight);

		const cells = objectWrapper.selectAll('.cell')
								   .data(objectData => objectData.cells)
								   .enter()
								   .append('div')
								   .attr('class', 'cell')
								   .style('left', cell => `${cell.ganttChartDateOffset * gantt._cellWidth}px`);

		cells.filter(cell => {
				 return cell.plannedPredicted && cell.plannedPredicted.plannedType;
			 })
			 .append('div')
			 .attr('class', 'planned')
			 .style('height', `${lineHeight}px`)
			 .style('width', `${gantt._cellWidth}px`)
			 .classed('planned--start', cell => cell.plannedPredicted.plannedType === 'start')
			 .classed('planned--within', cell => cell.plannedPredicted.plannedType === 'within')
			 .classed('planned--end', cell => cell.plannedPredicted.plannedType === 'end');

		cells.filter(cell => {
				 return cell.plannedPredicted && cell.plannedPredicted.predictedType;
			 })
			 .append('div')
			 .attr('class', 'predicted')
			 .style('width', `${gantt._cellWidth}px`)
			 .style('top', `${lineHeight / 2 + 0.5}px`)
			 .classed('predicted--early', cell => cell.plannedPredicted.predictedType === 'early')
			 .classed('predicted--within', cell => cell.plannedPredicted.predictedType === 'within')
			 .classed('predicted--late', cell => cell.plannedPredicted.predictedType === 'late');

		cells.filter(cell => {
				 return cell.targetActual && cell.targetActual.relativePositionToTargetRange === 'within' && cell.targetActual.relativePositionToActualRange !== 'within';
			 })
			 .append('div')
			 .attr('class', 'target')
			 .style('height', `${lineHeight}px`)
			 .style('width', `${gantt._cellWidth}px`)
			 .style('top', `${lineDistance + lineHeight / 2}px`)
			 .classed('target--normal', cell => cell.targetActual.relativePositionToActualRange === 'after')
			 .classed('target--late', cell => cell.targetActual.relativePositionToActualRange === 'before')
			 .classed('has-border-left', cell => cell.targetActual.borderType === 'start')
			 .classed('has-border-right', cell => cell.targetActual.borderType === 'end');

		cells.filter(cell => {
				 return cell.targetActual && cell.targetActual.relativePositionToActualRange === 'within';
			 })
			 .append('div')
			 .attr('class', 'actual')
			 .style('height', `${lineHeight}px`)
			 .style('width', `${gantt._cellWidth}px`)
			 .style('top', `${lineDistance + lineHeight / 2}px`)
			 .classed('actual--normal', cell => cell.targetActual.relativePositionToTargetRange === 'within')
			 .classed('actual--late', cell => cell.targetActual.relativePositionToTargetRange === 'after')
			 .classed('actual--early', cell => cell.targetActual.relativePositionToTargetRange === 'before')
			 .classed('has-border-left', cell => cell.targetActual.borderType === 'start')
			 .classed('has-border-right', cell => cell.targetActual.borderType === 'end');

		cells.filter(cell => {
				 return cell.targetActual && cell.targetActual.hasWorkLog === 'false';
			 })
			 .append('div')
			 .attr('class', 'worklog')
			 .style('height', `${lineHeight}px`)
			 .style('width', `${gantt._cellWidth}px`)
			 .style('top', `${lineDistance + lineHeight / 2}px`)
			 .classed('worklog--normal', cell => cell.targetActual.relativePositionToTargetRange === 'within')
			 .classed('worklog--late', cell => cell.targetActual.relativePositionToTargetRange === 'after')
			 .classed('worklog--early', cell => cell.targetActual.relativePositionToTargetRange === 'before');
	}

}