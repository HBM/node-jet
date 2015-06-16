/*
 * Jet client-server communications:
 */

var jet = require('node-jet');
var d3 = require('d3');
var shared = require('./shared');

var peer = new jet.Peer({
	url: 'ws://' + window.location.host
});

var randomColor = function () {
	var hue = Math.abs(Math.random()) * 360;
	var saturation = 40 + Math.abs(Math.random()) * 60;
	return 'hsl(' + hue + ',' + saturation + '%,60%)';
};

var ants = {};

var renderAnt = function (ant) {
	var circle;
	if (ant.event === 'add') {
		ants[ant.path] = circle = svgContainer.append('circle');
		circle
			.transition()
			.attr('r', 8)
			.attr('cx', ant.value.pos.x)
			.attr('cy', ant.value.pos.y)
			.style('fill', ant.value.color);
		circle.on('click', function () {
			peer.set(ant.path, {
				color: randomColor(),

			});
		});
	} else if (ant.event === 'change') {
		circle = ants[ant.path];
		circle
			.transition()
			.attr('cx', ant.value.pos.x)
			.attr('cy', ant.value.pos.y)
			.style('fill', ant.value.color);
	} else {
		circle = ants[ant.path];
		circle
			.remove();
		delete ants[ant.path];
	}
};

var allAnts = new jet.Fetcher()
	.path('startsWith', 'ants/#')
	.on('data', function (ant) {
		renderAnt(ant)
	});

peer.fetch(allAnts);

var delayValue = new jet.Fetcher()
	.path('equals', 'ants/delay')
	.on('data', function (data) {
		d3.select('#delay').attr('value', data.value);
	});

peer.fetch(delayValue);

d3.select('#delay')
	.on('change', function () {
		var val = d3.select('#delay').attr('value');
		peer.set('ants/delay', event.target.value);
	});

var svgContainer = d3.select('svg')
	.attr('width', shared.canvasSize)
	.attr('height', shared.canvasSize);

d3.select('#shake')
	.on('click', function () {
		peer.call('ants/shake', []);
	});

d3.select('#edge')
	.on('click', function () {
		peer.call('ants/edge', []);
	});

d3.select('#add')
	.on('click', function () {
		peer.call('ants/add');
	});

d3.select('#remove')
	.on('click', function () {
		peer.call('ants/remove');
	});