"use strict";

/*------ИНИЦИАЛИЗАЦИЯ*/
//определение экрана и загрузка базового контента для него
function viewManager() {
  //сетап при переходе по ссылке
  if (location.hash){
    var hash = location.hash;
  } else {
    var hash = "#main";
  }

  //ставим заголовок приложения
  S(".title_text").textContent = S(hash).textContent;

  //снимаем активные классы с пункта меню и контентного блока если они есть
  if (S(".active_menu_item")){
    S("#"+S(".active_menu_item").id+"Block").classList.remove("active_content_block");
    S(".active_menu_item").classList.remove("active_menu_item");
  }

  //ставим активные классы на новые пункт меню и контентный блок
  S(hash).classList.add("active_menu_item");
  S(hash+"Block").classList.add("active_content_block");

  //загружаем контент
  switch (hash) {
    case "#main": getMain(); break;
    case "#matches": getMatches(); break;
    case "#addMatch": getAddMatchForm(); break;
    case "#games": getGames(); break;
    case "#players": getPlayers(); break;
    case "#groups": getGroups(); break;
    case "#locations": getLocations(); break;
    case "#tags": getTags(); break;
    case "#reports": getReports(); break;
    default: console.log("default load");
  }
}

//проверка авторизации
if (localStorage['bgsId']){
  S('.main_block').classList.add('show');
  viewManager();
  window.addEventListener("hashchange", viewManager);
} else {
  S('.logRegForm').classList.add('show');
}
/*ИНИЦИАЛИЗАЦИЯ------*/


/*---------------РЕГА, ВХОД И ВЫХОД */
//обработчик успешной реги или входа
function logRegSuccess(data) {
  localStorage['bgsId'] = data.userId;
  localStorage['email'] = data.email;
  localStorage['pas'] = data.pas;
  S('.logRegForm').classList.remove('show');
  S('.main_block').classList.add('show');
  viewManager();
  window.addEventListener("hashchange", viewManager);
}

//обработчик кнопок реги и входа
//рега
S('#regBtn').addEventListener("click", function() {
  var body = "email="+S('#email').value+"&pas="+S('#pas').value+"&time="+Math.floor(Date.now()/1000);
  serverRequestBtn(this, "userReg.php", body, logRegSuccess);
});

//вход
S('#logBtn').addEventListener("click", function() {
  var body = "email="+S('#email').value+"&pas="+S('#pas').value+"&time="+Math.floor(Date.now()/1000);
  serverRequestBtn(this, "userLogin.php", body, logRegSuccess);
});

//выход
S('.menu_item_logout').addEventListener("click", function() {
  localStorage.clear();
  window.location = "/bgstat";
});
/*РЕГА И ВХОД---------------*/


/*МЕНЮ-------------*/
//укатывание меню
function hideMenu() {
  S(".menu").classList.remove("menu_show");
  S(".menu_button").classList.remove("active_menu_button");
  S('.menu_shadow').classList.remove("menu_shadow_show");
}

//кнопка меню
S(".menu_button").addEventListener("click", function() {
  if (hasCssClass(S(".menu"), "menu_show")) {
    hideMenu();
  } else {
    S(".menu").classList.add("menu_show");
    S(".menu_button").classList.add("active_menu_button");
    S('.menu_shadow').classList.add("menu_shadow_show");
  }
});

//кнопки самого меню
//добавляем обработчик к кнопкам меню
function menuItemHandler() {
  location.hash = this.id;
  hideMenu();
}

SA(".menu_item").forEach(function(el) {
  el.addEventListener("click", menuItemHandler);
});

//укатывание меню по клику на тень
S('.menu_shadow').addEventListener("click", hideMenu);

/*--------МЕНЮ*/
