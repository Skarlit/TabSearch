document.addEventListener('DOMContentLoaded', 
    function(){ 
        chrome.storage.sync.get('setting', function(config){
            var ts = new TabSearch(config['setting']);     
        })
    }, 
false);

(function(root){
    var TabSearch = root.TabSearch = function (setting){
        if(setting){
            this.setting = setting;
        }else{
            this.setting = {
                'upKey' : 38,
                'downKey' : 40,
                'numOfResult' : 6
            }
        }
        //Initializing UI and keyHandling
        this.searchbar = document.getElementById('search');
        this.searchbar.focus();
        window.addEventListener('keydown', this.navigation.bind(this));
        this.searchbar.addEventListener('keyup', this.keyInputHandler.bind(this));
        this.resultList = document.getElementById('result');

        //Internal Variables
        this.activeElement = null;

        //Caching tabs on startup
        var that = this;
        chrome.tabs.query({}, function(tabs){
            that.tabs = tabs;
        })
    }

    TabSearch.prototype.navigation = function(event) {
        //Up 
        if(event.keyCode == this.setting['upKey'] ){
            if(this.activeElement.previousSibling){
                    removeClass(this.activeElement, "active");
                    this.activeElement = this.activeElement.previousSibling;
                    addClass(this.activeElement, "active");
                }
            event.preventDefault();
        }
        //Down
        else if(event.keyCode == this.setting['downKey'] ){
            if(this.activeElement.nextSibling){
                removeClass(this.activeElement, "active");
                this.activeElement = this.activeElement.nextSibling;
                addClass(this.activeElement, "active");
            }
            event.preventDefault();
        }
    };

    TabSearch.prototype.keyInputHandler = function(event) {
        if(!event.altKey &&
           !event.ctrlKey &&
           event.keyCode != this.setting['upKey'] &&
           event.keyCode != this.setting['downKey']
           ){
            if(event.keyIdentifier == "Enter" && this.activeElement){
                var tabId = parseInt(this.activeElement.dataset.id);
                chrome.tabs.get(tabId, function(tab){
                    chrome.windows.update(tab.windowId, {focused: true})
                })
                chrome.tabs.update(
                    tabId,
                    {selected: true}
                );
                window.close();         
            }
            else{
                this.filter(event);
            }
        }
    }

    TabSearch.prototype.filter = function(event) {
        var searchStr = event.target.value
        var keywords = searchStr.split(' ');
        var keywordRegex = [];
        var result = [];
        var checked = {};
        var matched = true;

        // Storing search keywords.
        for(var i = 0; i < keywords.length; i++){
            keywordRegex.push(new RegExp(keywords[i],'i'));
        }

        if(searchStr.length > 0){
            for(var i = 0; i < this.tabs.length; i++){
                for(var j = 0; j < keywordRegex.length; j++){
                    if(this.tabs[i].url.search(keywordRegex[j]) < 0 && 
                        this.tabs[i].title.search(keywordRegex[j]) < 0 ){
                        matched = false;
                    }
                }
                if(matched){
                    result.push(this.tabs[i])
                    checked[this.tabs[i].id] = true;
                }
                matched = true;
                if(result.length >= this.setting['numOfResult']){
                    break;
                }
            }
        }
      
        this.resultList.innerHTML ="";
        for(var i = 0; i < result.length; i++){
            this.appendResult(result[i]);
        }
        if(searchStr.length > 0){
            this.activeElement = this.resultList.children[0];
            addClass(this.resultList.children[0], "active");
        }
    }

    TabSearch.prototype.appendResult = function(tab) {
        var tabEntry = document.createElement('li');
        var title = document.createElement('h4');
        var url = document.createElement('p');
        title.innerHTML = tab.title;
        url.innerHTML = tab.url;
        tabEntry.appendChild(title);
        tabEntry.appendChild(url);
        tabEntry.dataset.id = tab.id;
        this.resultList.appendChild(tabEntry);
    };


    //Helper methods
    //Simple Version of addClass, removeClass, isClass implementation
    function addClass(domElement, classname) {
        var case1 = new RegExp(classname + " ");
        var case2 = new RegExp(" " + classname);
        var case3 = new RegExp("^" + classname + "$");
        if(domElement.className.length == 0) {
            domElement.className += classname;
        }
        else if(
            domElement.className.search(case1) < 0 &&
            domElement.className.search(case2) < 0 &&
            domElement.className.search(case3) < 0 ) {

            domElement.className += (" " + classname);
        }
    }

    function hasClass(domElement, classname) {
        var case1 = new RegExp(classname + " ");
        var case2 = new RegExp(" " + classname);
        var case3 = new RegExp("^" + classname + "$");
        if(
            domElement.className.search(case1) > -1 ||
            domElement.className.search(case2) > -1 ||
            domElement.className.search(case3) > -1 ) {

            return true;
        }else{
            return false;
        }
    }

    function removeClass(domElement, classname) {
        var case1 = new RegExp(classname + " ");
        var case2 = new RegExp(" " + classname);
        var case3 = new RegExp("^" + classname + "$");
        if(domElement.className.search(case1) > -1) {
            domElement.className = domElement.className.replace(case1, "");
        }
        else if(domElement.className.search(case2) > -1) {
            domElement.className = domElement.className.replace(case2, "");
        }
        else if(domElement.className.search(case3) > -1) {
            domElement.className = domElement.className.replace(case3, "");
        }
    }
}(window));


