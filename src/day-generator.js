const d3 = require('d3');
const startDateString = '2018-03-25';
const endDateString = '2018-04-12';
const parseTime = d3.timeParse('%Y-%m-%d');
const formatTime = d3.timeFormat('%Y-%m-%d');

const dates = d3.timeDay.range(parseTime(startDateString), parseTime(endDateString)).map(d => `"${formatTime(d)}"`).join(',');
console.log(dates);