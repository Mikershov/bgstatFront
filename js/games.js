"use strict";

//загрузка и вывод игр
function getGames(){
  //грузим только если контента нет
  if (S("#gameContent").innerHTML != "") {
    //return true;
    S("#gameContent").innerHTML = "";
  }

  function setGlobalGameId(data) {
    for (var prop in data) {
      GB.gamesTeseraId.push(Number(data[prop].teseraId));
    }
  }

  var body = getPostVars();
  getContent("gameGet.php", body, "#gameBlockTemplate", "#gameContent", setGlobalGameId);
}

//сетап реквеста для обработки поля поиска
var teseraApiRequst = new Ajax();
teseraApiRequst.method = "GET";
teseraApiRequst.success = liveSearchDataToTemplete("#gameInSearchListTemplate", "#newGameSearchList");
//обработка поля поиска
S("#seacrhGameField").addEventListener("input", function() {
  if (this.value.length >= 1) {
    startLoader();
    S("#newGameSearchList").classList.remove("hide");
    S("#closeSearchGameBtn").classList.remove("btn_collapsed");
    S("#seacrhGameField").classList.add("search_active");
    S("#gameContent").classList.add("hide");

    teseraApiRequst.endpoint = "https://api.tesera.ru/search?query="+this.value;
    teseraApiRequst.reopen();
    teseraApiRequst.start();
  } else {
    S("#newGameSearchList").classList.add("hide");
    S("#closeSearchGameBtn").classList.add("btn_collapsed");
    S("#seacrhGameField").classList.remove("search_active");
    S("#gameContent").classList.remove("hide");
  }
});

//отчистка поля поиска
function searchClear() {
  S("#newGameSearchList").innerHTML = "";
  S("#seacrhGameField").value = "";
  S("#newGameSearchList").classList.add("hide");
  S("#closeSearchGameBtn").classList.add("btn_collapsed");
  S("#seacrhGameField").classList.remove("search_active");
  S("#gameContent").classList.remove("hide");
}

S("#closeSearchGameBtn").addEventListener("click", function() {
  searchClear();
});

//добавление игры
S("#newGameSearchList").addEventListener("click", function(e) {
  function addGameSuccess(data) {
    btn.firstElementChild.textContent = GB.haveItemBtnIcon;
    GB.gamesTeseraId.push(Number(data.teseraId));
    S("#gameContent").insertAdjacentHTML("afterBegin", contentRender(data, "#gameBlockTemplate"));
    //searchClear();
  }

  var btn = checkBtn(e.target, "newGameSearchList", "btn");
  if(btn){
    var searchItem = btn.parentNode;
    var gameName = searchItem.querySelector(".text_in_search").textContent;
    var teseraId = searchItem.querySelector(".text_in_search").getAttribute("data-tesera-id");
    var gameImg = searchItem.querySelector("img").src;

    if (btn.firstElementChild.textContent == "add") {
      var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                  "&userId="+localStorage["bgsId"]+"&gameName="+gameName+
                  "&teseraId="+teseraId+"&gameImg="+gameImg+"&date="+Date.now();
      serverRequestBtn(btn, "gameAdd.php", body, addGameSuccess);
    }
  }
});


//обработчики кликов по играм
S("#gameContent").addEventListener("click", function(e) {
  //закпреление/открепление
  var btn = checkBtn(e.target, "gameContent", "pinned_btn");
  if(btn){
    pinnedBlock(btn, "#gameContent", "small_title", "gamePinned.php", "textContent");
    return true;
  }

  //переход к детальному просмотру игры
  function getGameDatailSuccess(data) {
    S("#newGameSearchBlock").classList.add("hide");
    S("#gameContent").classList.add("hide");
    S("#gameDetailName").textContent = data.name;
    S("#gameDetailPrice").value = data.price;
    S("#gameDetailRrc").value = data.rrc_price;
    S("#gameDetailComment").value = data.personal_comment;
    S("#gameDetailOpinion").value = data.public_opinion;

    if (data.advices.length != 0) {
      S("#gameDetail .advices").classList.remove("hide");
      S("#gameDetail .advices .content_in_block").innerHTML = contentRender(data.advices, "#gameAdviceTemplate");
    } else {
      S("#gameDetail .advices").classList.add("hide");
    }

    S("#gameDetail .tags .content_in_block").innerHTML = contentRender(data.tags, "#gameTagTemplate");
    S("#gameDetail").classList.remove("hide");

    //создаем виджет рейтинга
    var ratingWidgetGame = new RatingWidget(data.rating, "Оценка");
    S("#gameDetail .rating_widget").appendChild(ratingWidgetGame.getElement());

    //добавочный код к клику по оценке, который сразу сейвит ее
    ratingWidgetGame.additionalSetupHandler = function() {
      var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                  "&userId="+localStorage["bgsId"]+"&gameId="+GB.gameDetail.id+"&rating="+this.getValue();
      serverRequestBtn(btn, "gameRating.php", body, function(data) {});
    }
  }

  var btn = checkBtn(e.target, "gameContent", "block_with_img");
  if (btn) {
    GB.gameDetail.id = btn.querySelector("div[data-id]").getAttribute("data-id");
    GB.gameDetail.teseraId = btn.querySelector("div[data-id]").getAttribute("data-tesera-id");
    GB.gameDetail.name = btn.querySelector("div[data-id]").textContent;
    GB.gameDetail.img = btn.querySelector(".img_in_block").src;

    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                "&userId="+localStorage["bgsId"]+"&gameId="+GB.gameDetail.id;
    serverRequestBtn(btn, "gameDetail.php", body, getGameDatailSuccess);
    return true;
  }
});

//закрывашка окна с детальной информацией об игре
GB.gameDetail.close = function() {
  S("#newGameSearchBlock").classList.remove("hide");
  S("#gameContent").classList.remove("hide");
  S("#gameDetail").classList.add("hide");
  S("#gameDetail .rating_widget").innerHTML = "";
}

//переход к форме добавления партии
S("#gameDetailAddMatchBtn").addEventListener("click", function() {
  GB.match.gameSetup(GB.gameDetail.teseraId, GB.gameDetail.name, GB.gameDetail.img);
  location.hash = "addMatch";
  setTimeout(GB.gameDetail.close, 500);
})

//кнопка закрывашка
S("#gameDetailCloseBtn").addEventListener("click", GB.gameDetail.close);


//привязка клика по тегам к функциям (удаление тегов)
S("#gameDetailTags .content_in_block").addEventListener("click", function(e) {
  var btn = checkBtn(e.target, "gameDetailTags", "close_tag");
  if (btn) {
    delTagLink(btn, "#gameDetailTags", "gameTagDel.php");
  }
});

//обработка добавления новых тегов
S("#addNewTagForGame").addEventListener("click", function() {
  function getTagSuccess(data) {
    GB.pup.setContent(contentRender(data, "#multiSelectTemplate"));
    GB.pup.show();

    //сетап обработчиков галочек
    var selectedHandler = function(data) {
      //inner потому что передается полный список тегов от сервера
      S("#gameDetail .tags .content_in_block").innerHTML = contentRender(data.tags, "#gameTagTemplate");
    }

    GB.pup.bodyHandler = GB.pup.setupMultiSelectHandler(selectedHandler, "gameTagAdd.php",
                        "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                        "&userId="+localStorage["bgsId"]+"&gameId="+GB.gameDetail.id);
  }

  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
              "&userId="+localStorage["bgsId"]+"&gameId="+GB.gameDetail.id;
  serverRequestBtn(this, "tagGet.php?type=game", body, getTagSuccess);
});


//сохранение текстовых полей
S("#gameDetailEditBtn").addEventListener("click", function() {
  var body = getPostVars({"gameId":GB.gameDetail.id,
                          "price":S("#gameDetailPrice").value,
                          "rrc_price":S("#gameDetailRrc").value,
                          "comment":S("#gameDetailComment").value,
                          "opinion":S("#gameDetailOpinion").value});

  serverRequestBtn(this, "gameTextSave.php", body, function() {});
});

//Удаление
S("#gameDetailDeleteBtn").addEventListener("click", function() {
  var body = getPostVars({"itemId":GB.gameDetail.id, "hide":1});
  serverRequestBtn(this, "gameHideShow.php", body, function() {
    S("#newGameSearchBlock").classList.remove("hide");
    S("#gameContent").classList.remove("hide");
    S("#gameDetail").classList.add("hide");
    S("#gameDetail .rating_widget").innerHTML = "";
    S("#gameContent").removeChild(S("#gameContent .block_with_img div[data-id='"+GB.gameDetail.id+"']").parentNode.parentNode);

  });
});

//личная статистика
S("#gamePersonalStatBtn").addEventListener("click", function() {
  //var statsTable = S("#gameGlobalStatsTemplate").cloneNode(true);
  //statsTable.removeAttribute("id");
  //statsTable.classList.remove("template");

  var body = getPostVars({"gameId":GB.gameDetail.id});
  serverRequestBtn(this, "gamePersonalStat.php", body, function(data) {
    data.gameName = GB.gameDetail.name;
    data.gameImg = GB.gameDetail.img;
    GB.pup.setContent(contentRender(data, "#gamePersonalStatsTemplate"));
    GB.pup.show();
  });
});

//глобальная статистика
S("#gameGlobalStatBtn").addEventListener("click", function() {
  var text = {};
  text.title = "В разработке.";
  text.text = "Глобальная статистика среди всех игроков в системе будет доступна позже.";
  GB.pup.setContent(contentRender(text, "#pupTextTemplate"));
  GB.pup.show();
});


//партии по игре
S("#gameDetailMatchesBtn").addEventListener("click", function() {
  var text = {};
  text.title = "В разработке.";
  text.text = "Будет доступно позже.";
  GB.pup.setContent(contentRender(text, "#pupTextTemplate"));
  GB.pup.show();
});
