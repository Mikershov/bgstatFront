"use strict";

function getAddMatchForm(){
  GB.contentLoader.stop();
}

//установки даты по умолчанию
GB.match.setDefaultDateMatchForm =  function() {
  var dateNow = new Date();
  S("#matchDateDay").value = dateNow.getDate();
  S("#matchDateMonth").value = dateNow.getMonth()+1;
  S("#matchDateYear").value = dateNow.getFullYear();
}
GB.match.setDefaultDateMatchForm();

//закрывашка формы
GB.match.closeAddMatchForm = function() {
  window.history.back();
}

S("#addMatchFormCloseBtn").addEventListener("click", function() {
  GB.match.closeAddMatchForm();
});

//установка названия, ID и картинки игры
GB.match.gameSetup = function(gameId, gameName, gameImg) {
  S("#matchGameTitle").textContent = gameName;
  S("#matchGameTitle").setAttribute("data-tesera-id", gameId);
  S("#matchGameTitle").setAttribute("data-name", gameName);
  S("#matchGameTitle").setAttribute("data-img", gameImg);
}

//обработка поля поиска
var matchTeseraApiRequest = new Ajax();
matchTeseraApiRequest.method = "GET";
matchTeseraApiRequest.success = liveSearchDataToTemplete("#gameInSearchListTemplate", "#matchGameSearchList");

S("#seacrhMatchGameField").addEventListener("input", function() {
  if (this.value.length >= 1) {
    startLoader();
    S("#match-gameSearchBlock").classList.add("shadow_drop");
    S("#matchGameSearchList").classList.remove("hide");
    S("#closeSearchMatchGameBtn").classList.remove("btn_collapsed");
    S("#seacrhMatchGameField").classList.add("search_active");

    matchTeseraApiRequest.endpoint = "https://api.tesera.ru/search?query="+this.value;
    matchTeseraApiRequest.reopen();
    matchTeseraApiRequest.start();
  } else {
    S("#match-gameSearchBlock").classList.remove("shadow_drop");
    S("#matchGameSearchList").classList.add("hide");
    S("#closeSearchMatchGameBtn").classList.add("btn_collapsed");
    S("#seacrhMatchGameField").classList.remove("search_active");
  }
});

//отчистка поля поиска
GB.match.matchSearchClear = function() {
  S("#match-gameSearchBlock").classList.remove("shadow_drop");
  S("#matchGameSearchList").innerHTML = "";
  S("#seacrhMatchGameField").value = "";
  S("#matchGameSearchList").classList.add("hide");
  S("#closeSearchMatchGameBtn").classList.add("btn_collapsed");
  S("#seacrhMatchGameField").classList.remove("search_active");
}

S("#closeSearchMatchGameBtn").addEventListener("click", function() {
  GB.match.matchSearchClear();
});

//добавление игры из поиска в форму
S("#matchGameSearchList").addEventListener("click", function(e) {
  var btn = checkBtn(e.target, "matchGameSearchList", "btn");
  if(btn){
    var searchItem = btn.parentNode;
    var gameName = searchItem.querySelector(".text_in_search").textContent;
    var gameImg = searchItem.querySelector(".img_in_search").src;
    var teseraId = searchItem.querySelector(".text_in_search").getAttribute("data-tesera-id");

    GB.match.gameSetup(teseraId, gameName, gameImg);
    GB.match.matchSearchClear();
  }
});

//очистка тайтла состава
GB.match.clearGroupTitle = function() {
  var groupTitle = S("#matchGroupId");
  if (groupTitle.textContent != "") {
    groupTitle.textContent = "";
    groupTitle.setAttribute("data-group-id", 0);
    groupTitle.classList.remove("sub_block_opened");
    groupTitle.classList.remove("match_group_title_correct");
  }
}

//выбор состава
S("#matchGroupSelectBtn").addEventListener("click", function(e) {
  function groupsRender(data) {
    GB.pup.setContent(contentRender(data, "#selectOneTemplate"));
    GB.pup.show();

    GB.pup.bodyHandler = function(e) {
      var btn = checkBtn(e.target, "popup", "add_btn");
      if (btn) {
        var groupId = btn.getAttribute("data-id");
        var groupName = btn.parentNode.querySelector(".name").value;
        var groupTitle = S("#matchGroupId");
        groupTitle.textContent = groupName;
        groupTitle.setAttribute("data-group-id", groupId);
        groupTitle.classList.add("sub_block_opened");
        groupTitle.classList.add("match_group_title_correct");

        S("#playersInMatch").innerHTML = "";
        getObjectFromArrayByFieldValue(GB.userGroups, 0, "id", groupId).playersList.forEach(function(playerId) {
          var playerName = getObjectFromArrayByFieldValue(GB.userPlayers, 0, "id", playerId).name;
          var playerHtml = contentRender({"id":playerId, "name":playerName}, "#playerInListFromGroupTemplate");
          S("#playersInMatch").insertAdjacentHTML("beforeEnd", playerHtml);
        });

        GB.pup.hide();
      }
    }
  }

  if (GB.userGroups) {
    groupsRender(GB.userGroups);
  } else {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
    serverRequestBtn( this, "groupGet.php", body, function(data) {
      GB.userGroups = data;
      groupsRender(GB.userGroups);
    });
  }

  if (!GB.userPlayers) {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
    serverRequestBtn( GB.pup.activeBtn, "playerGet.php", body, function(data) {
      GB.userPlayers = data;
    });
  }
});

//выбор игрока
S("#matchPlayersSelectBtn").addEventListener("click", function() {
  function playersRender(data) {
    var leftPlayers = getNotSelectedItems(data, "#playersInMatch [data-player-id]", "data-player-id");

    GB.pup.setContent(contentRender(leftPlayers, "#multiSelectTemplate"));
    GB.pup.show();

    GB.pup.bodyHandler = GB.pup.setupMultiSelectHandler(function(selectedPlayers) {
      selectedPlayers.forEach(function(playerId) {
        var playerName = getObjectFromArrayByFieldValue(GB.userPlayers, 0, "id", playerId).name;
        var playerHtml = contentRender({"id":playerId, "name":playerName}, "#playerInListFromGroupTemplate");
        S("#playersInMatch").insertAdjacentHTML("beforeEnd", playerHtml);
      });

      GB.match.clearGroupTitle();
    });
  }

  if (GB.userPlayers) {
    playersRender(GB.userPlayers);
  } else {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
    serverRequestBtn( GB.pup.activeBtn, "playerGet.php", body, function(data) {
      GB.userPlayers = data;
      playersRender(GB.userPlayers);
    });
  }
});

//удаление игрока из списка
S("#playersInMatch").addEventListener("click", function(e){
  var btn = checkBtn(e.target, "playersInMatch", "btn");
  if (btn) {
    btn.parentNode.parentNode.classList.add("invis");
    animateEnd(btn.parentNode.parentNode, "opacity", "0", function() {
      S("#playersInMatch").removeChild(btn.parentNode.parentNode);
      GB.match.clearGroupTitle();
    });
  }
});


//навешивание обработчика переключателя победителя
S("#matchWinnerToggle").addEventListener("click", function(e) {
  var btn = checkBtn(e.target, "matchWinnerToggle", "toggle_btn");
  if (btn) {
    var winStatus = btn.getAttribute("data-value");

    if (winStatus == "no") {
      S("#matchWinnerSelectBtn").classList.add("btn_height_rollout");
    } else {
      S("#matchWinnerSelectBtn").classList.remove("btn_height_rollout");
      S("#matchWinner").classList.remove("sub_block_opened");
    }

    toggleWidgetHandler(btn);
  }
});

//обработчик кнопки выбора победителя
S("#matchWinnerSelectBtn").addEventListener("click", function() {
  var playersInMatch = new Array();
  SA("#playersInMatch [data-player-id]").forEach(function(player) {
    playersInMatch.push({"name":player.textContent, "id":player.getAttribute("data-player-id")});
  });
  playersInMatch.push({"name":GB.noWinnerText, "id":"noWinner"});

  GB.pup.show();
  GB.pup.setContent(contentRender(playersInMatch, "#selectOneTemplate"));

  GB.pup.bodyHandler = function(e) {
    var btn = checkBtn(e.target, "popup", "add_btn");
    if (btn) {
      GB.pup.hide();
      S("#matchWinner").classList.add("sub_block_opened");
      S("#matchWinner").textContent = btn.parentNode.firstElementChild.value;
      S("#matchWinner").setAttribute("data-winner-id", btn.getAttribute("data-id"));
    }
  }
});


//Обработчик выбора места
S("#matchPlaceSelectBtn").addEventListener("click", function(){
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
  serverRequestBtn( this, "locationGet.php", body, function(data) {
    GB.pup.show();
    GB.pup.setContent(contentRender(data, "#selectOneTemplate"));
    GB.pup.bodyHandler = function(e) {
      var btn = checkBtn(e.target, "popup", "add_btn");
      if (btn) {
        GB.pup.hide();
        S("#matchPlace").classList.add("sub_block_opened");
        S("#matchPlace").textContent = btn.parentNode.firstElementChild.value;
        S("#matchPlace").setAttribute("data-place-id", btn.getAttribute("data-id"));
      }
    }
  });
});

//обработчик комментария и совета
S("#matchComment").addEventListener("focus", function() {
  S("#matchComment").classList.add("big_text");
});

S("#matchAdvice").addEventListener("focus", function() {
  S("#matchAdvice").classList.add("big_text");
});


//создаем и добавляем виджеты оценки
//настоение, интерес, сложность, оценка
GB.match.mood = new RatingWidget(3, "Настроение");
S("#matchMood").appendChild(GB.match.mood.getElement());

GB.match.interest = new RatingWidget(3, "Интерес");
S("#matchInterest").appendChild(GB.match.interest.getElement());

GB.match.complexity = new RatingWidget(3, "Сложность");
S("#matchComplexity").appendChild(GB.match.complexity.getElement());

GB.match.score = new RatingWidget(3, "Оценка");
S("#matchScore").appendChild(GB.match.score.getElement());


//обработка добавления новых тегов
S("#addNewTagForMatch").addEventListener("click", function() {
  function tagsRender(data) {
    var leftTags = getNotSelectedItems(data, "#matchTags .tag [data-id]");
    GB.pup.setContent(contentRender(leftTags, "#multiSelectTemplate"));
    GB.pup.show();

    GB.pup.bodyHandler = GB.pup.setupMultiSelectHandler(function(selectedTags) {
      selectedTags.forEach(function(tagId) {
        var tagName = getObjectFromArrayByFieldValue(GB.userMatchTags, 0, "id", tagId).name;
        var tagHtml = contentRender({"id":tagId, "name":tagName}, "#gameTagTemplate");
        S("#matchTags .content_in_block").insertAdjacentHTML("beforeEnd", tagHtml);
      });
    });
  }

  if (GB.userMatchTags) {
    tagsRender(GB.userMatchTags);
  } else {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
    serverRequestBtn(this, "tagGet.php?type=match", body, function(data) {
      GB.userMatchTags = data;
      tagsRender(GB.userMatchTags);
    });
  }
});

//удаление тегов
S("#matchTags .content_in_block").addEventListener("click", function(e) {
  var btn = checkBtn(e.target, "matchTags", "close_tag");
  if (btn) {
    delTagLink(btn, "#matchTags");
  }
});

//объект таймер
var matchTimer = {
  "startTime": 0,
  "playedTime": 0,
  "currentPauseTime": 0,
  "allPauseTime": 0,
  "startPauseTime": 0,
  "status": "",

  "timeToClock": function(time) {
    if (time < 10) {
      return "0"+time;
    }
    return time;
  },

  "updateTimer": function() {
    var currentTime = Math.floor(Date.now() / 1000);
    matchTimer.playedTime = currentTime - matchTimer.startTime - matchTimer.allPauseTime;
    S("#matchTimeHours").value = matchTimer.timeToClock(Math.floor(matchTimer.playedTime/3600));
    S("#matchTimeMinutes").value = matchTimer.timeToClock(Math.floor(matchTimer.playedTime%3600/60));
    S("#matchTimeSeconds").value = matchTimer.timeToClock(Math.floor(matchTimer.playedTime%3600%60));
  },

  "start": function(fromPause) {
    S("#matchTimerPlay").firstElementChild.textContent = GB.pauseBtnIcon;

    if (fromPause) {
      clearInterval(matchTimer.pauseTimerId);
      matchTimer.allPauseTime += matchTimer.currentPauseTime;
      matchTimer.currentPauseTime = 0;
      matchTimer.startPauseTime = 0;
    } else {
      matchTimer.startTime = Math.floor(Date.now() / 1000);
    }

    matchTimer.timer = setInterval(matchTimer.updateTimer, 100);
  },

  "pauseTimer": function() {
    var currentTime = Math.floor(Date.now() / 1000);
    matchTimer.currentPauseTime = currentTime - matchTimer.startPauseTime;
  },

  "pause": function() {
    clearInterval(matchTimer.timer);
    S("#matchTimerPlay").firstElementChild.textContent = GB.playBtnIcon;
    matchTimer.startPauseTime = Math.floor(Date.now() / 1000);
    matchTimer.pauseTimerId = setInterval(matchTimer.pauseTimer, 100);
  },

  "stop": function() {
    clearInterval(matchTimer.timer);
    clearInterval(matchTimer.pauseTimerId);
    S("#matchTimerPlay").setAttribute("data-status", "stop");
    S("#matchTimerPlay").firstElementChild.textContent = GB.playBtnIcon;
    matchTimer.startTime = 0;
    matchTimer.playedTime = 0;
    matchTimer.allPauseTime = 0;
    matchTimer.startPauseTime = 0;
    matchTimer.currentPauseTime = 0;
    S("#matchTimeHours").value = "";
    S("#matchTimeMinutes").value = "";
    S("#matchTimeSeconds").value = "";
  },

  "getTime": function() {
    var time = 0;
    time += Number(S("#matchTimeHours").value)*3600;
    time += Number(S("#matchTimeMinutes").value)*60;
    time += Number(S("#matchTimeSeconds").value);
    return time;
  },

  "getDate": function() { //не к месту, но зато удобно
    var date = S("#matchDateYear").value;
    date += "-"+S("#matchDateMonth").value;
    date += "-"+S("#matchDateDay").value;
    return date;
  }
}

//контроль таймера
S("#matchTimerPlay").addEventListener("click", function() {
  var matchStatus = S("#matchTimerPlay").getAttribute("data-status");

  if (matchStatus == "stop") {
    matchTimer.start();
    S("#matchTimerPlay").setAttribute("data-status", "play");
  } else if (matchStatus == "play") {
    matchTimer.pause();
    S("#matchTimerPlay").setAttribute("data-status", "pause");
  } else {
    matchTimer.start("pause");
    S("#matchTimerPlay").setAttribute("data-status", "play");
  }
});
S("#matchTimerStop").addEventListener("click", matchTimer.stop);


//Добавление партии
S("#addMatchBtn").addEventListener("click", function() {
  function clearMatchAddForm() {
    GB.match.setDefaultDateMatchForm();
    matchTimer.stop();
    GB.match.clearGroupTitle();
    S("#matchGameTitle").textContent = "";
    S("#matchGameTitle").setAttribute("data-tesera-id", "");
    S("#playersInMatch").innerHTML = "";
    S("#playersInMatchBlock .match_players_list_score input").value = "";
    S("#matchWinnerToggle").setAttribute("data-value", "");
    S("#matchWinnerToggle .toggle_btn_active").classList.remove("toggle_btn_active");
    S("#matchWinner").classList.remove("sub_block_opened");
    S("#matchPlace").classList.remove("sub_block_opened");
    S("#matchPlace").setAttribute("data-place-id", "");
    S("#matchComment").value = "";
    S("#matchComment").classList.remove("big_text");
    S("#matchAdvice").value = "";
    S("#matchAdvice").classList.remove("big_text");
    S("#matchTags .content_in_block").innerHTML = "";
  }

  var requestData = new Object();
  requestData["teseraGameName"] = S("#matchGameTitle").getAttribute("data-name");
  requestData["teseraGameImg"] = S("#matchGameTitle").getAttribute("data-img");
  requestData["teseraGameId"] = S("#matchGameTitle").getAttribute("data-tesera-id");
  requestData["date"] = matchTimer.getDate();
  requestData["matchTime"] = Math.floor(matchTimer.getTime()/60);
  requestData["groupId"] = S("#matchGroupId").getAttribute("data-group-id");

  requestData["playersList"] = new Array();
  SA("#playersInMatchBlock [data-player-id]").forEach(function(el) {
    requestData["playersList"].push(el.getAttribute("data-player-id"));
  });

  requestData["playersScore"] = new Array();
  SA("#playersInMatchBlock .match_players_list_score input").forEach(function(el) {
    if (el.value != "") {
      requestData["playersScore"].push(el.value);
    } else {
      requestData["playersScore"].push(null);
    }
  });

  requestData["winStatus"] = S("#matchWinnerToggle").getAttribute("data-value");
  requestData["winnerId"] = S("#matchWinner").getAttribute("data-winner-id");
  requestData["locationId"] = S("#matchPlace").getAttribute("data-place-id");
  requestData["mood"] = GB.match.mood.getValue();
  requestData["interest"] = GB.match.interest.getValue();
  requestData["complexity"] = GB.match.complexity.getValue();
  requestData["score"] = GB.match.score.getValue();
  requestData["comment"] = S("#matchComment").value;
  requestData["advice"] = S("#matchAdvice").value;

  requestData["tagList"] = new Array();
  SA("#matchTags .tag [data-id]").forEach(function(el) {
    requestData["tagList"].push(el.getAttribute("data-id"));
  });

  var body = getPostVars(requestData);
  serverRequestBtn(this, "matchAdd.php", body, function(data) {
    GB.pup.setContent(S("#afterMatchAddFromTemplate").innerHTML);
    GB.pup.bodyHandler = function(e) {
      var btn = checkBtn(e.target, "popup", "btn");
      if(btn) {
        var btnType = btn.getAttribute("data-value");
        if (btnType == "goAway") {
          clearMatchAddForm();
          GB.pup.hide();
          GB.match.closeAddMatchForm();
        } else if (btnType == "stayAndClear") {
          clearMatchAddForm();
          GB.pup.hide();
        } else {
          GB.pup.hide();
        }
      }
    }
    GB.pup.show();
  });
})
