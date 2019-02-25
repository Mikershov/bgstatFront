"use strict";

//загрузка и вывод матчей
function getMatches() {
  //грузим только если контента нет
  if (S("#matchContent").innerHTML != "") {
    S("#matchContent").innerHTML = "";
    //return true;
  }
  GB.contentLoader.stop();

  function getDayName(date) {
    var days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[date.getDay()];
  }

  function getMonthName(date) {
    var months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    return months[date.getMonth()];
  }

  function getWinStatus(winStatus) {
    if (winStatus == "no") {
      winStatus = "Проигрыш";
    } else if (winStatus == "yes") {
      winStatus = "Победа";
    } else {
      winStatus = "Ничья";
    }
    return winStatus;
  }

  function getMatchTime(matchTime) {
    var hours = matchTimer.timeToClock(Math.floor(matchTime/60));
    var minutes = matchTimer.timeToClock(matchTime%60);
    return hours+":"+minutes;
  }

  var lastDate = new Date();
  var docEl = document.documentElement;
  var dataLoad = false;
  var from = 0;
  var quantity = 20;
  var endMatches = false;

  function getMatches(from, quantity) {
    var body = getPostVars({"from":from, "quantity":quantity});
    serverRequestBtn(S("#matchesFilterBtn"), "matchGet.php", body, function(data) {
      data.forEach(function(match) {
        match.winStatus = getWinStatus(match.winStatus);
        match.matchTime = getMatchTime(match.matchTime);
        var d = new Date(match.date);
        if (lastDate.getTime() != d.getTime()) {
          var setDate = {"dayName":getDayName(d), "dayNumber":d.getDate(), "monthName":getMonthName(d), "year":d.getFullYear()}
          S("#matchContent").insertAdjacentHTML("beforeEnd", contentRender(setDate, "#matchBlockDateTemplate"));
          S("#matchContent").insertAdjacentHTML("beforeEnd", contentRender(match, "#matchBlockTemplate"));
          lastDate = d;
        } else {
          S("#matchContent").insertAdjacentHTML("beforeEnd", contentRender(match, "#matchBlockTemplate"));
        }
      });

      dataLoad = false;
      if (data.length < quantity) {
        endMatches = true;
      }
    });
  }

  getMatches(from, quantity);

  window.addEventListener("scroll", function() {
    if (hasCssClass(S("#matchesBlock"), "active_content_block")) { //временное решение, потому нужно удалять слушатель при выходе из раздела и ставить заново при входе
      if ((docEl.scrollHeight - docEl.scrollTop <= docEl.clientHeight+200) && !dataLoad && !endMatches) {
        dataLoad = true;
        from += quantity;
        console.log(from);
        getMatches(from, quantity);
      }
    }
  });
}

//переход к форме добавления партии
S("#openAddMatchFormBtn").addEventListener("click", function() {
  location.hash = "addMatch";
});

//фильтр для партий
S("#matchesFilterBtn").addEventListener("click", function() {
  var text = {};
  text.title = "В разработке.";
  text.text = "Работа над фильтрами ведется.";
  text.text += "В будущем планируется добавление широкого спектра критериев фильтрации партий.";
  GB.pup.setContent(contentRender(text, "#pupTextTemplate"));
  GB.pup.show();
});

//обработчик кнопок в партиях
S("#matchContent").addEventListener("click", function(e) {
  //детальная информация по партии
  var btn = checkBtn(e.target, "matchContent", "block_with_img");
  if (btn) {
    var matchAddInfo = btn.parentNode.querySelector(".match_add_info");

    if (matchAddInfo.getAttribute("data-load") == "0") {
      var body = getPostVars({"matchId":btn.querySelector("div[data-id]").getAttribute("data-id")});
      serverRequestBtn(btn, "matchGetDetail.php", body, function(data) {
        data.playersList.forEach(function(player) {
          if (player.score === null) {
            player.score = "-";
          }
        });
        data.playersList = contentRender(data.playersList, "#matchAddInfoPlayerListTemplate");
        data.tags = contentRender(data.tags, "#inlineBorderTemplate");
        data.ratings = contentRender(data.ratings, "#inlineBorderKeyValueTemplate");

        var html = contentRender(data, "#matchAddInfoTemplate");

        matchAddInfo.innerHTML = html;
        matchAddInfo.setAttribute("data-load", "1");
        matchAddInfo.querySelector(".mai_playersList").innerHTML = data.playersList;
        matchAddInfo.classList.add("sub_block_opened");
      });
    } else {
      matchAddInfo.classList.toggle("sub_block_opened");
    }
  }

  //свернуть информацию по партии
  var btn = checkBtn(e.target, "matchContent", "collapse_btn");
  if (btn) {
    btn.parentNode.parentNode.classList.remove("sub_block_opened");
  }

  //редактирование партии
  var btn = checkBtn(e.target, "matchContent", "edit_btn");
  if (btn) {
    var text = {};
    text.title = "В разработке.";
    text.text = "Редактирование партии на данный момент недоступно.<br>";
    text.text += "Вы можете удалить и добавить партию заново с измененными значениями.";
    GB.pup.setContent(contentRender(text, "#pupTextTemplate"));
    GB.pup.show();
  }

  //удаление партии
  var btn = checkBtn(e.target, "matchContent", "delete_btn");
  if (btn) {
    var body = getPostVars({"matchId":btn.getAttribute("data-match-id")});
    serverRequestBtn(btn, "matchDelete.php", body, function(data) {
      var matchBlock = btn.parentNode.parentNode.parentNode;
      if (matchBlock.previousElementSibling.classList.contains("match_date_title")) {
        S("#matchContent").removeChild(matchBlock.previousElementSibling);
      }
      S("#matchContent").removeChild(matchBlock);
    });
  }
});
