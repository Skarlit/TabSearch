document.addEventListener('DOMContentLoaded', function() {new TabSearch();}, false);

(function(root){
    var TabSearch = root.TabSearch = function (){
        this.setting = {
            'upKey' : 38,
            'downKey' : 40,
            'numOfResult' : 6
        }
        //Initializing UI and keyHandling
        this.searchbar = document.getElementById('search');
        this.resultList = document.getElementById('result');
        this.searchbar.focus();
        this.resultList.addEventListener('mouseover', this.mouseHandler.bind(this));
        window.addEventListener('keydown', this.navigation.bind(this));
        this.searchbar.addEventListener('keyup', this.keyInputHandler.bind(this));

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
                if (this.activeElement.getBoundingClientRect().top < 0) {
                    this.activeElement.scrollIntoView(true);
                }
            }
            event.preventDefault();
        }
        //Down
        else if(event.keyCode == this.setting['downKey'] ){
            if(this.activeElement.nextSibling){
                this.activeElement.classList.remove("active");
                this.activeElement = this.activeElement.nextSibling;
                this.activeElement.classList.add("active");
                if (this.activeElement.getBoundingClientRect().bottom >= window.innerHeight) {
                    this.activeElement.scrollIntoView(false);
                }
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
                    console.log(this.tabs[i]);
                    result.push({tab: this.tabs[i], score: score});
                }
            }
        }
      
        this.resultList.innerHTML = '';
        // Sort by score.
        result.sort(function(tabA, tabB) {
            return tabB.score - tabA.score;
        });
 
        this.appendResult(result);

        if(this.resultList.children.length > 0){
            this.activeElement = this.resultList.children[0];
            this.resultList.children[0].classList.add("active");
        }
    }

    TabSearch.prototype.appendResult = function(result) {
        var htmlString = '';
        for (var i = 0; i < result.length; i++) {
            htmlString += (
                '<li id="' + result[i].tab.id + '"><div class="tab-icon"><img src="' 
                    + result[i].tab.favIconUrl + '"></img></div>' +
                    '<div class="tab-title">' + result[i].tab.title + '</div>' +
                    '<p class="tab-url">' + result[i].tab.url + 
                '</p></li>');
        }
        this.resultList.appendChild(
            document.createRange().createContextualFragment(htmlString));
    };
}(window));


