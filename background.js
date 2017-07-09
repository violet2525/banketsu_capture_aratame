const img_w = 1024;
const img_h = 576;
const limit = 30;

chrome.runtime.onStartup.addListener(function(){
	localStorage.removeItem("icon");
	localStorage.removeItem("width");
	localStorage.removeItem("height");
	localStorage.removeItem("top");
	localStorage.removeItem("left");
	localStorage.removeItem("mute");
});

//ショートカットキー操作
chrome.commands.onCommand.addListener(function(command) {
	chrome.tabs.query( {active: true, lastFocusedWindow: true}, function (tabs) {
		var tab = tabs[0];
		//URLの取得
		var url = tab.url;
		if (checkURL(url)){
			switch (command){
				case "screen_shot_key":
					//スクリーンショット
					screenshot();
					break;
				case "record_startstop_key":
					//録画
					if (localStorage['icon'] === "icon_rec.png"){
						//録画中→録画停止
						setIcon('icon.png');
						rec_stop();
					}else{
						//録画停止中→録画開始
						setIcon('icon_rec.png');
						rec_start();
					}
					break;
				default:
					console.log('Command:', command);
			}
		}else{
			return;
		};
	});
});

//タブ選択時
chrome.tabs.onSelectionChanged.addListener(function(tabid){
	chrome.tabs.get(tabid, function(tab){
		//URLの取得
		var url = tab.url;
		// changeIcon
		if (checkURL(url)){
			chrome.browserAction.enable();
		}else{
			chrome.browserAction.disable();
		};
	});
});

//タブフォーカス時
chrome.windows.onFocusChanged.addListener(function(winid){
	chrome.tabs.getSelected(winid, function(tab){
		//URLの取得
  		var url = tab.url;
		// changeIcon
		if (checkURL(url)){
			chrome.browserAction.enable();
		}else{
			chrome.browserAction.disable();
		};
	});
});

//タイマー
chrome.alarms.onAlarm.addListener(function(alarm){
	if (alarm.name == 'recordStop'){
		//録画中→録画停止
		rec_stop();
	}else if (alarm.name == 'recordStart'){
		//録画停止→録画開始
		record();
	}else if (alarm.name ==='downloadshelf'){
		//ダウンロードシェルフ再表示
		chrome.downloads.setShelfEnabled(true);
	}
});

//URLチェック
function checkURL(url){
	if(url == "http://www.dmm.com/netgame/social/-/gadgets/=/app_id=486104/"){
		//ON
		return true;
	}
	else{
		//OFF
		return false;
	}
}

var chunks = [];
var mediaRecorder = new MediaStream();

//録画開始処理
function rec_start(){
	chunks = [];
	chrome.tabs.query( {active: true, lastFocusedWindow: true}, function (tabs) {
		var tab = tabs[0];
		chrome.windows.get(//{
			tab.windowId
		,	function(window){
				localStorage['window_new'] = window.id;
				chrome.windows.create({
					tabId: tab.id
				,	state: "normal"
				}
				,function(fwin){
					chrome.windows.update(
						fwin.id
					,	{	width: fwin.width + img_w - fwin.tabs[0].width
						,	height: fwin.height + img_h - fwin.tabs[0].height
						}
					,	function(){}
					);
				});
			//ローカルストレージに保存
			localStorage['top'] = window.top;
			localStorage['left'] = window.left;
			localStorage['width'] = window.width;
			localStorage['height'] = window.height;
			localStorage['mute'] = Number(tab.mutedInfo.muted);
		});
		chrome.tabs.executeScript(tab.id, {code: 'var el = document.body'});
		chrome.tabs.executeScript(tab.id, {code: 'el.style.position = "fixed"'});
		chrome.tabs.executeScript(tab.id, {code: 'el.style.top = "-96px"'});
		chrome.tabs.executeScript(tab.id, {code: 'el.style.left = "-128px"'});
	});
	//0.1秒遅らせる
	chrome.alarms.create('recordStart', { when : Date.now() + 0.1 * 1000 });
};

//録画中
function record(){
	chrome.tabCapture.capture({
		video: true
	,	audio: true
	,	videoConstraints: {
			mandatory: {
				minWidth: img_w
			,	minHeight: img_h
			,	maxWidth: img_w
			,	maxHeight: img_h
			,	maxFrameRate: 60  // Note: Frame rate is variable (0 <= x <= 60).
			}
		}
	}
,	function(stream) {
		if (!stream) {
			console.error(chrome.runtime.lastError.message || 'UNKNOWN');
			return;
		}

		//音声再生
		var audio = new Audio();
		audio.srcObject  = stream;
		audio.play();

		//録画開始
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.start();
		mediaRecorder.onstop = function(e) {
			var blob = new Blob(chunks, { 'type' : 'video/webm; codecs="vp8, opus"' });
			var videoURL = window.URL.createObjectURL(blob);
			//ダウンロード
			chrome.downloads.download({
				url: videoURL
			,	filename: "バンケツ_" + getDate() + ".webm"
			,	conflictAction: "uniquify"
			,	saveAs: false
			}
		,	function(e){
				var tracks = stream.getTracks();
				for (var i = 0; i < tracks.length; ++i) {
					tracks[i].stop();
				}
			});
			//チャンク初期化・音声停止
			chunks = [];
			audio = null;
		};

		mediaRecorder.ondataavailable = function(e) {
			chunks.push(e.data);
		}
	});
	//録画時間は30分まで
	chrome.alarms.create('recordStop', {delayInMinutes: limit});
}

//録画停止
function rec_stop(){
	chrome.alarms.clear('recordStop');
	mediaRecorder.stop();

	//ウィンドウを初期状態に戻す
	chrome.tabs.get(parseInt(localStorage['tab_id'], 10), function (tab) {
		chrome.tabs.executeScript(tab.id, {code: 'var el = document.body'});
		chrome.tabs.executeScript(tab.id, {code: 'el.style = ""'});
		chrome.windows.update(tab.windowId
		,	{	width: parseInt(localStorage['width'], 10)
			,	height: parseInt(localStorage['height'], 10)
			,	top: Math.round(parseInt(localStorage['top'], 10))
			,	left: Math.round(parseInt(localStorage['left'], 10))
			}
		,	function(win){
				chrome.tabs.update(tab.id
				,	{
						muted: Boolean(parseInt(localStorage['mute']))
					}
				,	function(ftab){
					}
				);
			}
		);
	});
	setIcon('icon.png');
}


//スクショ撮影
function screenshot(){
	var tab_left;
	var tab_top;
	var scroll;
	var scroll_x;
	var scroll_y;
	var scroll_bar;
	chrome.tabs.getSelected(null, function(tab) {  
		chrome.tabs.executeScript(tab.id
			, {file: "content.js"}
			, function(results){
				scroll = results[0]
				tab_left = scroll.left;
				tab_top = scroll.Top;
				scroll_bar = scroll.width - 1;
				scroll_x = scroll.scroll_x;
				scroll_y = scroll.scroll_y;
				chrome.tabs.getCurrent(function(tab) {
		
				// キャプチャー取得
				chrome.tabs.captureVisibleTab({ format: 'png' }, function(dataUrl){
					var img = new Image();
					img.src = dataUrl;
			
					var cvs = document.createElement('canvas'); 
					cvs.id = "gamecanvas";
					cvs.width = img_w;
					cvs.height = img_h;
					cvs.style = "display:none"
					document.body.appendChild(cvs);
			        	var ctx = cvs.getContext("2d");
			
					img.onload = function(){
						var tab_x = Math.ceil(tab_left + 128);	//マージン128px
						var tab_y = Math.ceil(tab_top + 35);	//マージン35px
						ctx.drawImage(img, tab_x, tab_y, img_w, img_h, 0, 0, img_w, img_h);
						//ダウンロードシェルフを非表示
						if(localStorage['icon'] === "icon_rec.png"){
							chrome.downloads.setShelfEnabled(false);
						}
						chrome.downloads.download({
							url: cvs.toDataURL()
						,	filename: "バンケツ_" + getDate() + ".png"
						,	conflictAction: "uniquify"
						,	saveAs: false
						},	function(e){
								//10秒後にダウンロードシェルフを再表示
								chrome.alarms.create('downloadshelf', { when : Date.now() + 10 * 1000 });
							}
						);
					}
			
				});
			});
		});
	});
};

function getDate(){
	var now = new Date();
	var y = now.getFullYear();
	var m = now.getMonth() + 1;
	var d = now.getDate();
	var w = now.getDay();
	var h = now.getHours();
	var mi = now.getMinutes();
	var s = now.getSeconds();
	var ms = now.getMilliseconds();
	var mm = ("0" + m).slice(-2);
	var dd = ("0" + d).slice(-2);
	var hh = ("0" + h).slice(-2);
	var mmi = ("0" + mi).slice(-2);
	var ss = ("0" + s).slice(-2);
	var mss = ("0" + ms).slice(-3);
	return y + mm + dd + hh + mmi + ss + mss;
}
