import * as d3 from 'd3';

const DAYS_IN_MONTH_THRESHOLD = 5;
const parseTime = d3.timeParse('%Y-%m-%d');
const monthFormat = d3.timeFormat("%b %Y");
const dayFormat = d3.timeFormat("%d");

export class Calendar {

	constructor() {
		this._cellWidth = 30;
		this._cellHeight = 35;
	}

	static getStartDateInMonth(date) {
		return new Date(date.getFullYear(), date.getMonth(), 1);
	}

	static getEndDateInMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0);
	}

	static groupDatesByMonth(days) {
		return d3
			.nest()
			.key(d => d3.timeMonth.floor(d))
			.entries(days);
	}

	static extendsBoundaryDates([startDate, endDate]) {
		let count = d3.timeDay.count(
			startDate,
			Calendar.getEndDateInMonth(startDate),
		);

		if (count < DAYS_IN_MONTH_THRESHOLD) {
			startDate = d3.timeDay.offset(
				startDate,
				-(DAYS_IN_MONTH_THRESHOLD - count)
			);
		}
		count = d3.timeDay.count(
			Calendar.getStartDateInMonth(endDate),
			endDate
		);

		if (count < DAYS_IN_MONTH_THRESHOLD) {
			endDate = d3.timeDay.offset(endDate, DAYS_IN_MONTH_THRESHOLD - count);
		}
		return [startDate, endDate];
	}

	cellWidth(width) {
		this._cellWidth = width;
		return this;
	}

	cellHeight(height) {
		this._cellHeight = height;
		return this;
	}

	totalGanttHeight(height) {
		this._chartHeight = height;
		return this;
	}

	startDate() {
		return this._days[0];
	}

	endDate() {
		return this._days[this._days[length - 1]];
	}

	range([startDateString, endDateString]) {
		let startDate = parseTime(startDateString);
		let endDate = d3.timeDay.offset(parseTime(endDateString), 1);
		let [extendedStartDate, extendedEndDate] = Calendar.extendsBoundaryDates([startDate, endDate]);
		this._days = d3.timeDay.range(extendedStartDate, extendedEndDate);
		return this;
	}

	build(selection) {
		const today = new Date();
		const daysGroupedByMonth = Calendar.groupDatesByMonth(this._days);

		const months = selection
			.selectAll(".month")
			.data(daysGroupedByMonth)
			.enter()
			.append("div")
			.attr('class', 'month normal-text')
			.style('width', monthData => `${monthData.values.length * this._cellWidth}px`);

		months.append("div")
			  .attr('class', 'month__text')
			  .style('height', `${this._cellHeight}px`)
			  .style('line-height', `${this._cellHeight}px`)
			  .text(month => monthFormat(new Date(month.key)));


		const daysInMonths = months
			.append('div')
			.attr('class', 'days')
			.selectAll(".day")
			.data(monthData => monthData.values)
			.enter()
			.append("div")
			.attr("class", "day")
			.style('width', `${this._cellWidth}px`)
			.style("height", `${this._chartHeight + this._cellHeight}px`)
			.classed("day--weekends", date => date.getDay() === 0 || date.getDay() === 6)
			.classed('day--today', date => {
				return d3.timeDay.count(date, today) === 0;
			});

		daysInMonths.append('div')
					.attr('class', 'day__text')
					.style('height', `${this._cellHeight}px`)
					.text((date => dayFormat(date)));
	}

}