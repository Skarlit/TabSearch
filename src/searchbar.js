document.addEventListener('DOMContentLoaded', init, false);

var TabSearch = document.TabSearch = {}


function init(){

  chrome.tabs.query({}, function(tabs){
    var result = document.getElementById('result');
    TabSearch.tabs = tabs;
  })

  var searchbar = document.getElementById('search');
  searchbar.focus();
  searchbar.addEventListener('keyup', keyInputHandler)
}

function keyInputHandler(event){
  if(!event.altKey && !event.ctrlKey){
    if(event.keyIdentifier == "Enter"){
      var tabId = parseInt(TabSearch.activeElement.dataset.id);
      chrome.tabs.get(tabId, function(tab){
        chrome.windows.update(tab.windowId, {focused: true}, function(window){
        })
      })
      chrome.tabs.update(
        tabId,
        {selected: true}
      );         
    }
    else if(event.keyIdentifier == "Up"){
      if(TabSearch.activeElement.previousSibling){
        removeClass(TabSearch.activeElement, "active");
        TabSearch.activeElement = TabSearch.activeElement.previousSibling;
        addClass(TabSearch.activeElement, "active");
      }
    }
    else if(event.keyIdentifier == "Down"){
      if(TabSearch.activeElement.nextSibling){
        removeClass(TabSearch.activeElement, "active");
        TabSearch.activeElement = TabSearch.activeElement.nextSibling;
        addClass(TabSearch.activeElement, "active");
      }
    }
    else{
      filter(event);
    }
  }
}

function addClass(domElement, classname){
  var case1 = new RegExp(classname + " ");
  var case2 = new RegExp(" " + classname);
  var case3 = new RegExp("^" + classname + "$");
  if(domElement.className.length == 0){
    domElement.className += classname;
  }
  else if(
    domElement.className.search(case1) < 0 &&
    domElement.className.search(case2) < 0 &&
    domElement.className.search(case3) < 0 ){

    domElement.className += (" " + classname);
  }
}

function hasClass(domElement, classname){
  var case1 = new RegExp(classname + " ");
  var case2 = new RegExp(" " + classname);
  var case3 = new RegExp("^" + classname + "$");
  if(
    domElement.className.search(case1) > -1 ||
    domElement.className.search(case2) > -1 ||
    domElement.className.search(case3) > -1 ){
    return true;
  }else{
    return false;
  }
}

function removeClass(domElement, classname){
  var case1 = new RegExp(classname + " ");
  var case2 = new RegExp(" " + classname);
  var case3 = new RegExp("^" + classname + "$");
  if(domElement.className.search(case1) > -1){
    domElement.className = domElement.className.replace(case1, "");
  }
  else if(domElement.className.search(case2) > -1){
    domElement.className = domElement.className.replace(case2, "");
  }
  else if(domElement.className.search(case3) > -1){
    domElement.className = domElement.className.replace(case3, "");
  }
}

function filter(event){
  var searchStr = event.target.value

  var first = searchStr.split(' ');
  var firstPass = [];
  for(var i = 0; i < first.length; i++){
    firstPass.push(new RegExp(first[i],'i'));
  }

  var secondPass = new RegExp(searchStr.replace(/\s*/,"").split('').join('.*'), 'i');

  var result = [];
  var checked = {};

  var matched = true;

  if(searchStr.length > 0){
    for(var i = 0; i < TabSearch.tabs.length; i++){
      for(var j = 0; j < firstPass.length; j++){
        if(TabSearch.tabs[i].url.search(firstPass[j]) < 0 && 
          TabSearch.tabs[i].title.search(firstPass[j]) < 0 ){
          matched = false;
        }
      }
      if(matched){
        result.push(TabSearch.tabs[i])
        checked[TabSearch.tabs[i].id] = true;
      }
      matched = true;
      if(result.length > 4){
        break;
      }
    }

    if(result.length < 6){
      for(var i = 0; i < TabSearch.tabs.length; i++){
        if(!checked[TabSearch.tabs[i].id]){
          if(TabSearch.tabs[i].url.search(secondPass) > -1 || 
            TabSearch.tabs[i].title.search(secondPass) > -1 ){
            result.push(TabSearch.tabs[i]);
          }
        }
        if(result.length > 4){
          break;
        }
      }
    }
  }

  var resultList = document.getElementById('result');
  resultList.innerHTML ="";
  for(var i = 0; i < result.length; i++){
    appendResult(result[i]);
  }
  if(searchStr.length > 0){
    TabSearch.activeElement = resultList.children[0];
    addClass(resultList.children[0], "active");
  }
}

function appendResult(tab){
  var tabEntry = document.createElement('li');
  var title = document.createElement('h4');
  var url = document.createElement('p');
  title.innerHTML = tab.title;
  url.innerHTML = tab.url;
  tabEntry.appendChild(title);
  tabEntry.appendChild(url);
  tabEntry.dataset.id = tab.id;
  result.appendChild(tabEntry);
}

