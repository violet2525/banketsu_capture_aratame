//バックグラウンドページ取得
var bgPage = chrome.extension.getBackgroundPage();
// ローカルストレージ初期化
if (localStorage['icon'] === null) {
	setIcon('icon.png');
}

//ポップアップ表示時
window.addEventListener("load",function(){
	//ショートカットキー取得
	chrome.commands.getAll(function(commands){
		for(var idx = 0; idx < commands.length; idx++){
			if (commands[idx].name == 'screen_shot_key'){
				//静止画
				document.getElementById("ss").textContent = commands[idx].shortcut;
			}else if (commands[idx].name == 'record_startstop_key'){
				//動画
				document.getElementById("recst").textContent = commands[idx].shortcut;
				document.getElementById("reced").textContent = commands[idx].shortcut;
			}
		}
	});

	//メニューセット
	if (localStorage['icon'] === "icon_rec.png"){
		//録画中
		setRecStop();
	}else{
		//録画停止
		setRecStart();
	}
});

//スクショ撮影
var SS = document.getElementById("screenshot");
SS.addEventListener("click", bgPage.screenshot, false);

//録画開始
var RSTR = document.getElementById("recstart");
RSTR.addEventListener("click", r_str, false);

//録画停止
var REND = document.getElementById("recstop");
REND.addEventListener("click", r_stop, false);

function r_str(){
	setIcon('icon_rec.png');	//アイコン変更
	setRecStop();			//メニュー変更
	bgPage.rec_start();		//録画開始
}

function r_stop(){
	setIcon('icon.png');		//アイコン変更
	setRecStart();			//メニュー変更
	bgPage.rec_stop();		//録画停止
}

