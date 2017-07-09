
var width = window.innerWidth - document.documentElement.clientWidth;
var scroll_x = window.pageXOffset;
var scroll_y = window.pageYOffset;
var gframe = document.getElementById("game_frame");
var frame = gframe.getBoundingClientRect();
var left = frame.left;
var Top = frame.top;

var window_w = window.outerWidth - window.innerWidth;
var window_h = window.outerHeight - document.documentElement.clientHeight;
//var window_w = document.body.clientWidth;
//var window_h = document.body.clientHeight;


var obj = {width, left, Top, scroll_x, scroll_y, window_w, window_h};
obj;
