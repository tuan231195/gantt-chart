import {Calendar} from './calendar';
import {Gantt} from "./gantt";
import * as d3 from 'd3';
import {LineHelper} from "./line-helper";

const startDateString = "2018-02-27";
const endDateString = "2018-06-01";
const CELL_WIDTH = 30;
const CELL_HEIGHT = 35;
const OBJECT_HEIGHT = 50;

const svg = d3.select("#chart-area").append("svg");

const jobArray = require('./data.json');

const ganttHeight = OBJECT_HEIGHT * jobArray.length;

const calendar = new Calendar().cellWidth(CELL_WIDTH).cellHeight(CELL_HEIGHT).totalGanttHeight(ganttHeight).range([startDateString, endDateString]);

const graph = svg.append('g').attr("class", "calendar-days");

graph.call(calendar.build.bind(calendar));

const startDate = calendar.startDate();
const endDate = calendar.endDate();

const gantt = new Gantt()
	.startDate(startDate)
	.endDate(endDate)
	.objectHeight(OBJECT_HEIGHT)
	.cellWidth(CELL_WIDTH)
	.jobArray(jobArray);

const lineHelper = new LineHelper().startDate(startDate).cellWidth(CELL_WIDTH);

graph.call(lineHelper.drawToday.bind(lineHelper), {y1: CELL_HEIGHT, lineHeight: ganttHeight + CELL_HEIGHT});

svg
	.append('g')
	.attr('class', 'object-group')
	.attr('transform', `translate(0, ${CELL_HEIGHT * 2})`)
	.call(gantt.draw.bind(gantt));

const bbBox = svg.node().getBBox();
svg.attr("width", bbBox.width);
svg.attr("height", bbBox.height);