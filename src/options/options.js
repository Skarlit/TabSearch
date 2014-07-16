
window.onload = loadSetting;

function loadSetting(callback){
    chrome.storage.sync.get('setting', function(config){
      var opt = new OptionController(config['setting'])
    })
}


function OptionController(setting){
    this.mountUI();
    this.renderSetting(setting);
}

OptionController.prototype.mountUI = function() {
    this.uiElement = {
      'upKey' : document.getElementById('upKey'),
      'downKey' : document.getElementById('downKey')
    }

    document.getElementById('save').addEventListener('click', this.saveSetting.bind(this));
};

OptionController.prototype.renderSetting = function(setting) {
    var elements = Object.keys(this.uiElement);
    for(var i = 0; i < elements.length; i++){
        var element = elements[i]; 
        this.uiElement[element].value = setting[element];
    }
};

OptionController.prototype.buildSetting = function() {
    var setting = {};
    var elements = Object.keys(this.uiElement);

    for(var i = 0; i < elements.length; i++){
      var element = elements[i];
      setting[element] = this.uiElement[element].value;
    }
    return setting;
};

OptionController.prototype.saveSetting = function() {
    var setting = this.buildSetting();
    var output = document.getElementById('output')
    chrome.storage.sync.set( {'setting' : setting },
        function() {
            if(chrome.runtime.lastError){        
                output.innerHTML = "Failed to save setting...";
                output.style.color = "red";
                output.style.fontSize = "12pt";
            }else{
                output.innerHTML = "Setting saved...";
                output.style.color = "green";
                output.style.fontSize = "12pt";
            }
        }
    )
};
