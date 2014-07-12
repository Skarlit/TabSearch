document.addEventListener('DOMContentLoaded', function(){var opt = new OptionController()}, false);


function OptionController(){
  this.settings = this.loadSetting();
  this.renderSetting();
}

OptionController.prototype.loadSetting = function() {
  
};

OptionController.prototype.renderSetting = function() {
  
};

OptionController.prototype.saveSetting = function() {
  
};

OptionController.prototype.uiBinding = function() {
  this.upKey = document.getElementById('upKey');
  this.downKey = document.getElementById('downKey');
};