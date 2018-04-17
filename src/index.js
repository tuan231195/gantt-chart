import {Calendar} from './calendar';
import {Gantt} from "./gantt";
import * as d3 from 'd3';

const startDateString = "2018-02-27";
const endDateString = "2018-06-01";
const CELL_WIDTH = 30;
const CELL_HEIGHT = 35;
const OBJECT_HEIGHT = 50;

const graph = d3.select("#chart-area").append('div').attr("class", "calendar-days");

const jobArray = require('./data.json');

const ganttHeight = OBJECT_HEIGHT * jobArray.length;

const calendar = new Calendar().cellWidth(CELL_WIDTH).cellHeight(CELL_HEIGHT).totalGanttHeight(ganttHeight).range([startDateString, endDateString]);

graph.call(calendar.build.bind(calendar));

const startDate = calendar.startDate();
const endDate = calendar.endDate();

const gantt = new Gantt()
	.startDate(startDate)
	.endDate(endDate)
	.objectHeight(OBJECT_HEIGHT)
	.cellWidth(CELL_WIDTH)
	.jobArray(jobArray);

graph
	.append('div')
	.attr('class', 'object-group')
	.style('top', `${CELL_HEIGHT * 2}px`)
	.call(gantt.draw.bind(gantt));
