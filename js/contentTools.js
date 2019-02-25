"use strict";

//объекст с глобальными переменными
var GB = {
  "gamesTeseraId": new Array(),
  "gameDetail": {}, //раздел игры, выбранная игра

  //значечки
  "addBtnIcon": "add",
  "editBtnIcon": "edit",
  "saveBtnIcon": "check",
  "doneBtnIcon": "done",
  "closeBtnIcon": "close",
  "favoriteBtnIcon": "favorite",
  "haveItemBtnIcon": "check_circle",
  "playBtnIcon": "play_arrow",
  "stopBtnIcon": "stop",
  "pauseBtnIcon": "pause",

  "noWinnerText":"Нет (Игра)",

  "pup": {}, //всплывающее окно
  "serverMsg": new ServerMsg(), //сообщения от сервера
  "contentLoader": "", //анимация загрузки контента
  "request": new Ajax(), //кешированный объект для запросов к серверу
  "userGroups": undefined, //составы юзера для добавления партий
  "userPlayers": undefined, //игроки для добавления партий
  "userMatchTags": undefined, //метки для добавления партий
  "match": {} //вспомогательный объект для добавления партии, хранитт функции, объекты и переменные
}

GB.contentLoader = {
  "go": function() {
    S("#contentLoader").style.display = "block";
  },

  "stop": function() {
    S("#contentLoader").style.display = "none";
  }
}

//обработчик кнопок для связи с сервером
function serverRequestBtn(btn, urlEndpoint, body, success, debug){
  //блокировка кнопоки на повторные нажатия
  if ( !hasCssClass(btn, "data_transfering") ) {
    btn.classList.add("data_transfering");
    GB.serverMsg.hide();

    var server = "http://5.101.114.192/bgstat/back/";
    var req = new Ajax(server+urlEndpoint, body, debug);

    req.commonFun = function(){
      btn.classList.remove("data_transfering");
    }

    req.commonErrorFun = function(){
      GB.serverMsg.show();
    }

    req.success = function(data) {
      success(data);
    };

    req.dataError = function(data) {
      GB.serverMsg.showAndSetMsg(data.errorMsg);
    };
    req.netError = function() {
      GB.serverMsg.setMsg("Неизвестная ошибка.");
    };
    req.serverError = function() {
      GB.serverMsg.setMsg("Сервер доступен, но возвращает неизвествую ошибку.");
    };

    req.start();

  } else {
    GB.serverMsg.showAndSetMsg("Запрос в обработке.");
  }
}


//загрузка и вывод контента
function getContent(urlEndpoint, body, templateName, contentArea, addAction) {
  GB.serverMsg.hide();
  GB.contentLoader.go();

  var server = "http://5.101.114.192/bgstat/back/";
  var req = new Ajax(server+urlEndpoint, body);

  req.commonFun = function(){
    GB.contentLoader.stop();
  }

  req.success = function(data) {
    S(contentArea).insertAdjacentHTML("afterBegin", contentRender(data, templateName));
    if (addAction) {
      addAction(data);
    }
  };

  req.dataError = function(data) {
    GB.serverMsg.showAndSetMsg(data.errorMsg);
  };

  req.netError = function() {
    GB.serverMsg.showAndSetMsg("Неизвестная ошибка.");
  };

  req.serverError = function() {
    GB.serverMsg.showAndSetMsg("Сервер доступен, но возвращает неизвествую ошибку.");
  };

  req.start();
}



//функция закрепления/открепления - отправляет запрос на сервер и вызывает обработчик успеха
function pinnedBlock(btn, contentArea, itemClassName, urlEndpoint, itemPropName) {
  var propName = (itemPropName) ? itemPropName : "value";
  var elemBlock = btn.parentNode;
  var elemId = elemBlock.querySelector("."+itemClassName).getAttribute("data-id");
  var pinned;

  if (hasCssClass(btn, "pinned_status_0")) {
    pinned = 1;
  } else {
    pinned = 0;
  }

  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"]+"&pinned="+pinned+"&itemId="+elemId;
  serverRequestBtn(btn, urlEndpoint, body, function() {
    insertItemInListBySortPinned(contentArea, itemClassName, btn, pinned, propName);
  });
}


//сортированная вставка элемента в список
//если элемент первый в своей области, то в зависимости от его типа действия разные
//в остальном же одинаковые
function insertItemInListBySort(contentArea, itemClassName, btn, pinned, propName, insertWrap) {
  var propName = (propName) ? propName : "value";
  var elemBlock = btn.parentNode;
  var elemValue = elemBlock.querySelector("."+itemClassName)[propName];
  var listItems = SA(contentArea+" .pinned_status_"+pinned);

  if (insertWrap) {
    elemBlock.removeEventListener("transitionend", insertWrap, true);
  } else {
    elemBlock.classList.add("swipe_left");
    elemBlock.classList.add("insert_shadow");
  }

  if (listItems.length == 0) {
    if (pinned == 1) {
      if (elemBlock != S(contentArea).firstElementChild) {
        S(contentArea).insertBefore(elemBlock, S(contentArea).firstElementChild);
      }
    } else {
      S(contentArea).appendChild(elemBlock);
    }
  } else {
    for (var i = 0; i < listItems.length; i++) {
      var listItemValue = listItems[i].parentNode.querySelector("."+itemClassName)[propName];
      if (elemValue.toUpperCase() <= listItemValue.toUpperCase()) {
        S(contentArea).insertBefore(elemBlock, listItems[i].parentNode);
        break;
      }
    }

    if (i == listItems.length) {
      var lastItemInList = listItems[listItems.length-1].parentNode;
      var lastItemInListNextSibling = lastItemInList.nextElementSibling;
      if (elemBlock != lastItemInListNextSibling) {
        S(contentArea).insertBefore(elemBlock, lastItemInListNextSibling);
      }
    }
  }

  if (pinned == 1) {
    swapCssClass(btn, "pinned_status_0", "pinned_status_1");
  } else {
    swapCssClass(btn, "pinned_status_1", "pinned_status_0");
  }

  setTimeout(function() {elemBlock.classList.remove("swipe_left")}, 50);
  setTimeout(function() {elemBlock.classList.remove("insert_shadow")}, 500);
}

function insertItemInListBySortPinned(contentArea, itemClassName, btn, pinned, propName) {
  var elemBlock = btn.parentNode;
  elemBlock.classList.add("swipe_left");
  elemBlock.classList.add("insert_shadow");

  function insertWrap() {
    insertItemInListBySort(contentArea, itemClassName, btn, pinned, propName, insertWrap);
  }
  elemBlock.addEventListener("transitionend", insertWrap, true);
}



//отметка и установка атрибута для элемента списка
function toCheckBtn(btn) {
  if(btn.getAttribute("data-selected") == 0){
    btn.setAttribute("data-selected", "1");
    btn.children[0].textContent = "check";
  } else {
    btn.setAttribute("data-selected", "0");
    btn.children[0].textContent = "";
  }
}

//сбор выделенных атрибутов в списке (например ID игроков)
function getSelectedInList(objList, wantedAttrName) {
  var selectedPlayers = new Array();
  objList.querySelectorAll("div[data-selected='1']").forEach(function(el){
    selectedPlayers.push(el.getAttribute(wantedAttrName));
  });
  return selectedPlayers;
}


//переключалка в toggleWidget
function toggleWidgetHandler(btn) {
  if (this) {
    btn = this;
  }

  var value = btn.getAttribute("data-value");
  btn.parentNode.setAttribute("data-value", value);

  if (btn.parentNode.querySelector(".toggle_btn_active")) {
    btn.parentNode.querySelector(".toggle_btn_active").classList.remove("toggle_btn_active");
  }

  btn.classList.add("toggle_btn_active");
}


//функция удаления
function delItemInList(btn, urlEndpoint){
  var item = btn.parentNode;
  var itemParentId = btn.parentNode.parentNode.id;
  var itemId = item.querySelector(".name").getAttribute("data-id");
  var payload = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"]+"&hide=1&itemId="+itemId;
  serverRequestBtn(btn, urlEndpoint, payload, function(){
    item.classList.add("folded_height");
    animateEnd(item, "maxHeight", "0px", function() {
      S("#"+itemParentId).removeChild(item);
    });
  });
}


//возвращает статус закрепленности элемента в списке. 1 - закреплен, 0 - нет
function getPinnedStatus(pinnedBtn) {
  if (hasCssClass(pinnedBtn, "pinned_status_0")) {
    return 0;
  } else {
    return 1;
  }
}


//универсальное всплывающее окно
//можно создавать несколько, но структура у них должна быть одинаковой
//а так же они должны быть заложенны в html
function Popup(popupId) {
  this.body = S(popupId);
  this.content = S(popupId+" .content_in_block");
  this.activeBtn = S(popupId+" .close_popup");
  this.shadow = S(".popup_shadow");

  var self = this;

  this.hide = function() {
    self.shadow.classList.remove("popup_shadow_show");
    self.body.classList.remove("popup_expand");
    this.bodyHandler = function() { } //обнуление если обработчик был
  }

  this.show = function() {
    self.body.classList.add("popup_expand");
    self.shadow.classList.add("popup_shadow_show");
  }

  this.setContent = function(html) {
    self.content.innerHTML = html;
  }

  this.setActiveBtnIcon = function(iconName) {
    self.activeBtn.firstElementChild.textContent = iconName;
  }

  this.activeBtnHandler = function() {
    self.hide();
  }

  this.bodyHandler = function() { }

  this.body.addEventListener("click", function(e) {
    self.bodyHandler.call(this, e);
  });

  this.activeBtn.addEventListener("click", function() {
    self.activeBtnHandler();
  });
}
GB.pup = new Popup("#popup");

//обработчик клика для мультивыборочных элементов во всплывающем окне
//берет на себя ограничение и уточнение клика по нужной кнопке
//регулирует положение основной кнопки всплывающего окна и вызывает переданный колбек при ее клике
GB.pup.setupMultiSelectHandler = function(callback, endpoint, body) {
  return function(e){
    var btn = checkBtn(e.target, "popup", "check_btn");
    if (btn) {
      toCheckBtn(btn);
      var selectedItems = getSelectedInList(GB.pup.body, "data-id");

      if (selectedItems.length > 0) {
        GB.pup.setActiveBtnIcon(GB.addBtnIcon);
        GB.pup.activeBtnHandler = function(e) {
          if (endpoint) {
            body = body+"&itemsList="+selectedItems;
            serverRequestBtn(btn, endpoint, body, callback);
          } else {
            callback(selectedItems);
          }

          GB.pup.setActiveBtnIcon(GB.closeBtnIcon);
          GB.pup.activeBtnHandler = GB.pup.hide;
          GB.pup.setContent("");
          GB.pup.hide();
        }
      } else {
        GB.pup.setActiveBtnIcon(GB.closeBtnIcon);
        GB.pup.activeBtnHandler = GB.pup.hide;
      }
    }
  }
}


//удалить связь тега с игрой или партией
function delTagLink(btn, tagArea, endpoint, callback) {
  if (!callback) {
    callback = function(data) {
      S(tagArea+" .content_in_block").removeChild(btn.parentNode);
    }
  }

  if (endpoint) {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                "&userId="+localStorage["bgsId"]+"&tagId="+btn.getAttribute("data-id")+
                "&gameId="+GB.gameDetail.id;
    serverRequestBtn(btn, endpoint, body, callback);
  } else {
    callback();
  }
}



//виджет рейтинга
//создает объект с вертской, обработчиками и дефолтным значением
function RatingWidget(initValue, title) {
  var self = this;
  this.body = S("#ratingWidgetTemplate").cloneNode(true);
  this.body.removeAttribute("id");
  this.body.removeAttribute("class");
  this.additionalSetupHandler = function() {}

  this.body.querySelector(".rating_widget_title").textContent = title;
  if (initValue) {
    this.body.querySelector(".btn[data-value='"+initValue+"']").classList.add("selected");
  }

  function setupRating() {
    var activeRating = self.body.querySelector(".selected");
    if (activeRating) {
      activeRating.classList.remove("selected");
    }
    this.classList.add("selected");

    self.additionalSetupHandler();
  }

  this.getValue = function() {
    var value = this.body.querySelector(".selected");
    if (value) {
      return value.textContent;
    } else {
      return null;
    }
  }

  this.getHtml = function() {
    return this.body.innerHTML;
  }

  this.getElement = function() {
    return this.body;
  }

  this.body.querySelectorAll(".btn").forEach(function(btn){
    btn.addEventListener("click", setupRating);
  });
}

//нормализация данных живого поиска от апи тесеры
//шаблонизация и вставка в страницу
//используется замыкание. Функция возвращает функцию с уже
//установленными данными (шаблон и список), а возвращаемая функция может
//принимать data - результат поиска и вызывается в аякс объекте
function liveSearchDataToTemplete(template, searchList) {
  return function(data) {
    var trustData = new Array();
    data.forEach(function(el) {
      if (el.photoUrl) {
        if ( GB.gamesTeseraId.indexOf(el.teseraId) >= 0 ) {
          el.iconName = GB.haveItemBtnIcon;
        } else {
          el.iconName = GB.addBtnIcon;
        }
        trustData.push(el);
      }
    });

    var html = contentRender(trustData, template);
    S(searchList).innerHTML = html;
    stopLoader();
  }
}

//возвращает массив объектов котором нет элементов возвращаемых по селектору
//селектор должен возвращать нодлист элементов с ид
//data должен быть массивом объектов, где у каждого объекта есть поле id
function getNotSelectedItems(data, selector, idAttr) {
  if (!idAttr) {
    var idAttr = "data-id";
  }

  var itemsInList = new Array();
  SA(selector).forEach(function(item){
    itemsInList.push(item.getAttribute(idAttr));
  });

  var leftItems = data.filter(function(item) {
    return itemsInList.indexOf(item.id) < 0;
  });

  return leftItems;
}
