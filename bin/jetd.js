#!/usr/bin/env node

var peers = {};
var nodes = {};
var states = {};
var leaves = {};
var routes = {};

var routeMessage = function(peer,message) {
    var route = routes[message.id];
    if (route) {
        delete routes[message.id];
        route.receiver
    }
};

