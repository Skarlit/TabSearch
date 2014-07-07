document.addEventListener('DOMContentLoaded', init, false);

var TabSearch = document.TabSearch = {}


function init(){

  chrome.tabs.query({}, function(tabs){
    var result = document.getElementById('result');
    TabSearch.tabs = tabs;
  })

  var searchbar = document.getElementById('search');
  searchbar.focus();
  searchbar.addEventListener('keyup', filter)
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

  for(var i = 0; i < TabSearch.tabs.length; i++){
    for(var j = 0; j < firstPass.length; j++){
      if(TabSearch.tabs[i].url.search(firstPass[j]) > -1 || 
        TabSearch.tabs[i].title.search(firstPass[j]) > -1 ){
        //result.push(TabSearch.tabs[i]);
      }else{
        matched = false;
      }
    }
    if(matched){
      result.push(TabSearch.tabs[i])
      checked[TabSearch.tabs[i].id] = true;
    }
    matched = true;
    if(result.length > 6){
      break;
    }
  }

  // if(result.length < 6){
  //   for(var i = 0; i < TabSearch.tabs.length; i++){
  //     if(!checked[TabSearch.tabs[i]]){
  //       if(TabSearch.tabs[i].url.search(secondPass) > -1 || 
  //         TabSearch.tabs[i].title.search(secondPass) > -1 ){
  //         result.push(TabSearch.tabs[i]);
  //       }
  //     }
  //   }
  // }

  var resultList = document.getElementById('result');
  resultList.innerHTML ="";
  for(var i = 0; i < result.length; i++){
    appendResult(result[i]);
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

