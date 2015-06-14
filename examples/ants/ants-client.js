/*
 * Jet client-server communications:
 */

var jet = require('node-jet');
var d3 = require('d3');

var peer = new jet.Peer({
	url: 'ws://' + window.location.host
});

var renderAnts = function (ants) {
	var circles = svgContainer.selectAll('circle');
	circles
		.data(ants)
		.enter()
		.append('circle')
		.attr('r', 4)
		.attr('cx', function (ant) {
			return ant.value.x;
		})
		.attr('cy', function (ant) {
			return ant.value.y;
		});

	circles
		.transition()
		.attr('cx', function (ant) {
			return ant.value.x;
		})
		.attr('cy', function (ant) {
			return ant.value.y;
		});

};

var ants = new jet.Fetcher()
	.path('startsWith', 'ants/#')
	.sortByPath()
	.range(1, 100)
	.on('data', function (ants) {
		renderAnts(ants)
	});

peer.fetch(ants);

var svgContainer = d3.select('body').append('svg')
	.attr('width', '100%')
	.attr('height', '100%');