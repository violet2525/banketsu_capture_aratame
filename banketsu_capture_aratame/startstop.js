function setIcon(icon){
	localStorage['icon'] = icon;
	chrome.browserAction.setIcon({path:localStorage['icon']});
}

function setRecStart(){
	var recstart = document.getElementById("recstart");
	var recstop = document.getElementById("recstop");
	recstart.style = "display:block";
	recstop.style = "display:none";
}

function setRecStop(){
	var recstart = document.getElementById("recstart");
	var recstop = document.getElementById("recstop");
	recstart.style = "display:none";
	recstop.style = "display:block";
}

