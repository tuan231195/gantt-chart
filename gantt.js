import * as d3 from 'd3';
import {LineHelper} from "./line-helper";

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
		this._lineHelper = new LineHelper().startDate(this._startDate).cellWidth(this._cellWidth);
		const objectWrapper = selection.selectAll(".object-wrapper")
			.data(this._jobArray)
			.enter()
			.append("svg")
			.attr('class', "object-wrapper")
			.attr('width', '100%')
			.attr('height', this._objectHeight)
			.attr('x', 0)
			.attr('y', (d, i) => this._objectHeight * i);

		const objects = objectWrapper.append('svg');

		objects.call(this._lineHelper.drawPlannedLine.bind(this._lineHelper), {
			start(object) {
				return object.planned_start;
			},
			end(object) {
				return object.planned_due;
			}
		});

		const objectsWithPredictedDates = objects.filter(
			object => object.predicted_start && object.predicted_due
		);

		objectsWithPredictedDates.filter(
			object =>
				object.predicted_start.getTime() < object.planned_start.getTime()
		).call(this._lineHelper.drawPredictedLine.bind(this._lineHelper),
			{
				type: 'early', start(object) {
					return object.predicted_start;
				}, end(object) {
					return object.planned_start;
				}
			});

		objectsWithPredictedDates.filter(
			object =>
				!(
					object.predicted_due.getTime() < object.planned_start.getTime() ||
					object.predicted_start.getTime() > object.planned_due.getTime()
				))
			.call(this._lineHelper.drawPredictedLine.bind(this._lineHelper),
				{
					type: 'normal', start(object) {
						return Math.max(object.predicted_start, object.planned_start);
					}, end(object) {
						return Math.min(object.predicted_due, object.planned_due);
					}
				});

		objectsWithPredictedDates.filter(
			object => object.predicted_due.getTime() > object.planned_due.getTime()
		).call(this._lineHelper.drawPredictedLine.bind(this._lineHelper),
			{
				type: 'late', start(object) {
					return object.planned_due;
				}, end(object) {
					return object.predicted_due;
				}
			});

		objects.selectAll('.work-log')
			.data(object => object.days.map(day => ({object, day: parseTime(day)})))
			.enter().append('g').attr('class', 'work-log')
			.call(this._lineHelper.fillWorkLog.bind(this._lineHelper));

		objects.filter(
			object => object.target_start && (object.target_start.getTime() < (object.actual_start || today).getTime()) && (today.getTime() > object.target_start.getTime())
		).call(this._lineHelper.drawDottedLine.bind(this._lineHelper),
			{
				type: 'late', start(object) {
					return object.target_start;
				}, end(object) {
					return object.actual_start || today;
				}
			});

		objects.filter(
			object => object.target_due && (object.actual_start || today).getTime() < today.getTime()
		).call(this._lineHelper.drawSolidLine.bind(this._lineHelper),
			{
				type: 'normal', start(object) {
					return object.actual_start || today;
				}, end(object) {
					return Math.min(object.target_due, object.actual_due || today, today);
				}
			});

		objects.filter(
			object => object.target_due && ((!object.actual_due && today.getTime() < object.target_due.getTime()) || object.actual_due && object.actual_due.getTime() < object.target_due.getTime())
		).call(this._lineHelper.drawDottedLine.bind(this._lineHelper),
			{
				type: 'normal', start(object) {
					if (!object.actual_due) {
						return Math.max(object.target_start, today);
					} else {
						return object.actual_due
					}
				}, end(object) {
					return object.target_due;
				}
			});

		objects.filter(
			object => object.target_due && object.actual_due && object.actual_due.getTime() > object.target_due.getTime()
		).call(this._lineHelper.drawSolidLine.bind(this._lineHelper),
			{
				type: 'late', start(object) {
					return object.target_due;
				}, end(object) {
					return object.actual_due;
				}
			});

		objects.filter(
			object => object.actual_start && object.target_start && object.actual_start.getTime() < object.target_start.getTime()
		).call(this._lineHelper.drawSolidLine.bind(this._lineHelper),
			{
				type: 'early', start(object) {
					return object.actual_start;
				}, end(object) {
					return object.target_start;
				}
			});

		objects.attr('y', function() {
			return (gantt._objectHeight - this.getBBox().height - 0.5) / 2;
		});
	}

}