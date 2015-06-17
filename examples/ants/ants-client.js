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
			.duration(400)
			.ease('exp-out')
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
			.duration(200)
			.ease('exp-out')
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

var speedToDelay = {
	fast: 1,
	medium: 3,
	slow: 5
};

var delayToSpeed = {};
delayToSpeed[1] = 'fast';
delayToSpeed[3] = 'medium';
delayToSpeed[5] = 'slow';


var delayValue = new jet.Fetcher()
	.path('equals', 'ants/delay')
	.on('data', function (data) {
		var speed = delayToSpeed[data.value];
		d3.select('input[type="radio"]').attr('checked', false);
		d3.select('input[value="' + speed + '"]').attr('checked', true);
	});

peer.fetch(delayValue);

d3.selectAll('input[type="radio"]')
	.on('change', function () {
		var radio = d3.select(this);
		var delay = speedToDelay[radio.attr('value')];
		peer.set('ants/delay', delay);
	});

var svgContainer = d3.select('svg')
	.attr('width', shared.canvasSize)
	.attr('height', shared.canvasSize)
	.on('click', function () {
		var dist = function (x, y) {
			var dx = x - event.clientX;
			var dy = y - event.clientY;
			return Math.sqrt(dx * dx + dy * dy);
		};
		var radius = Math.random() * 50 + 50;
		for (var path in ants) {
			var ant = ants[path];
			var x = parseFloat(ant.attr('cx'));
			var y = parseFloat(ant.attr('cy'));
			var d = dist(x, y);
			var dir = Math.random() * 2 * Math.PI;
			if (d < radius) {

				var newPos = {
					x: event.clientX + Math.cos(dir) * radius,
					y: event.clientY + Math.sin(dir) * radius
				};
				peer.set(path, {
					pos: newPos
				});
			}
		}
	});

d3.select('#shake')
	.on('click', function () {
		peer.call('ants/shake', []);
	});

d3.select('#edge')
	.on('click', function () {
		peer.call('ants/edge', []);
	});

d3.select('#boom')
	.on('click', function () {
		peer.call('ants/boom', []);
	});

d3.select('#add')
	.on('click', function () {
		peer.call('ants/add');
	});

d3.select('#remove')
	.on('click', function () {
		peer.call('ants/remove');
	});