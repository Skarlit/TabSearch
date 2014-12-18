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
                    this.activeElement.classList.remove("active");
                    this.activeElement = this.activeElement.previousSibling;
                    this.activeElement.classList.add("active");
                }
            event.preventDefault();
        }
        //Down
        else if(event.keyCode == this.setting['downKey'] ){
            if(this.activeElement.nextSibling){
                this.activeElement.classList.remove("active");
                this.activeElement = this.activeElement.nextSibling;
                this.activeElement.classList.add("active");
            }
            event.preventDefault();
        }
    };

    TabSearch.prototype.keyInputHandler = function(event) {
        if (!event.altKey && !event.ctrlKey &&
            event.keyCode != this.setting['upKey'] &&
            event.keyCode != this.setting['downKey']) {
            if (event.keyIdentifier == "Enter" && this.activeElement) {
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
        // Handle Japanese space char. 
        var keywords = searchStr.split(/\u3000|\s/);
        var keywordRegex = [];
        var result = [];

        // Storing search keywords.
        for(var i = 0; i < keywords.length; i++){
            keywordRegex.push(new RegExp(keywords[i],'i'));
        }

        if(searchStr.length > 0){
            for(var i = 0; i < this.tabs.length; i++){
                var score = 0;
                for(var j = 0; j < keywordRegex.length; j++) {
                    var urlMatch = keywordRegex[j].exec(this.tabs[i].url);
                    score += urlMatch ? urlMatch.length : 0;

                    var titleMatch = keywordRegex[j].exec(this.tabs[i].title);
                    score += titleMatch ? 2 * titleMatch.length : 0;
                }
                if(score > 0){
                    result.push({tab: this.tabs[i], score: score});
                }
            }
        }
      
        this.resultList.innerHTML = '';
        // Sort by score.
        result.sort(function(tabA, tabB) {
            return tabB.score - tabA.score;
        });
        for(var i = 0; i < result.length; i++){
            this.appendResult(result[i].tab);
            console.log(result[i].tab.title + ' ' + result[i].score);
        }
        if(this.resultList.children.length > 0){
            this.activeElement = this.resultList.children[0];
            this.resultList.children[0].classList.add("active");
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
}(window));


