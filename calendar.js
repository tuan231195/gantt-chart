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

	startDate(){
		return this._days[0];
	}

	endDate(){
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

		const widthArray = daysGroupedByMonth.map(
			d => d.values.length * this._cellWidth
		);

		const postXArr = daysGroupedByMonth.reduce(
			(posXArr, month, currentIndex) => {
				if (currentIndex === 0) {
					posXArr.push(0);
				} else {
					posXArr.push(
						posXArr[posXArr.length - 1] + widthArray[currentIndex - 1]
					);
				}
				return posXArr;
			},
			[]
		);

		const months = selection
			.selectAll("g")
			.data(daysGroupedByMonth)
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(${postXArr[i]}, 0)`);

		months
			.append("rect")
			.attr("class", "month")
			.attr("height", "35")
			.attr("width", monthData => monthData.values.length * this._cellWidth);

		months
			.append("text")
			.attr('class', 'normal-text')
			.attr("x", (d, i) => widthArray[i] / 2)
			.attr("y", this._cellWidth / 2 + 4)
			.text(month => monthFormat(new Date(month.key)));

		const daysInMonths = months
			.selectAll("g")
			.data(monthData => monthData.values)
			.enter()
			.append("g")
			.attr(
				"transform",
				(d, i) => `translate(${this._cellWidth * i}, ${this._cellHeight})`
			)
			.attr("class", "day")
			.classed('day--today', date => {
				return d3.timeDay.count(date, today) === 0;
			});

		daysInMonths
			.append("rect")
			.attr("class", "day__column day__cell")
			.classed("day__column--weekends", date => date.getDay() === 0 || date.getDay() === 6)
			.attr("width", this._cellWidth)
			.attr("height", this._cellHeight);


		daysInMonths
			.append("rect")
			.attr("class", "day__column")
			.classed("day__column--weekends", date => date.getDay() === 0 || date.getDay() === 6)
			.attr("width", this._cellWidth)
			.attr("y", this._cellHeight)
			.attr("height", this._chartHeight);


		daysInMonths
			.append("text")
			.attr("x", this._cellWidth / 2)
			.attr("y", this._cellHeight / 2 + 2)
			.attr('class', 'normal-text')
			.text(dayData => dayFormat(dayData));
	}

}