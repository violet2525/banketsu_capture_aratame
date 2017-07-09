//�o�b�N�O���E���h�y�[�W�擾
var bgPage = chrome.extension.getBackgroundPage();
// ���[�J���X�g���[�W������
if (localStorage['icon'] === null) {
	setIcon('icon.png');
}

//�|�b�v�A�b�v�\����
window.addEventListener("load",function(){
	//�V���[�g�J�b�g�L�[�擾
	chrome.commands.getAll(function(commands){
		for(var idx = 0; idx < commands.length; idx++){
			if (commands[idx].name == 'screen_shot_key'){
				//�Î~��
				document.getElementById("ss").textContent = commands[idx].shortcut;
			}else if (commands[idx].name == 'record_startstop_key'){
				//����
				document.getElementById("recst").textContent = commands[idx].shortcut;
				document.getElementById("reced").textContent = commands[idx].shortcut;
			}
		}
	});

	//���j���[�Z�b�g
	if (localStorage['icon'] === "icon_rec.png"){
		//�^�撆
		setRecStop();
	}else{
		//�^���~
		setRecStart();
	}
});

//�X�N�V���B�e
var SS = document.getElementById("screenshot");
SS.addEventListener("click", bgPage.screenshot, false);

//�^��J�n
var RSTR = document.getElementById("recstart");
RSTR.addEventListener("click", r_str, false);

//�^���~
var REND = document.getElementById("recstop");
REND.addEventListener("click", r_stop, false);

function r_str(){
	setIcon('icon_rec.png');	//�A�C�R���ύX
	setRecStop();			//���j���[�ύX
	bgPage.rec_start();		//�^��J�n
}

function r_stop(){
	setIcon('icon.png');		//�A�C�R���ύX
	setRecStart();			//���j���[�ύX
	bgPage.rec_stop();		//�^���~
}

