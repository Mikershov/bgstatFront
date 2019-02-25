"use strict";

//полифилим forEach для NodeList
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

/*--------ИНСТРУМЕНТЫ*/
//выборка
function S(elem){
  return document.querySelector(elem);
}

function SA(elem){
  return document.querySelectorAll(elem);
}

//запуск и остановка топ лодера
function startLoader(){
  if (S(".main_block").clientWidth < 600) {
    S("#topLoader").classList.add("top_loader_go");
  } else {
    S("#leftLoader").classList.add("top_loader_go");
  }
}

function stopLoader(){
  if (S(".main_block").clientWidth < 600) {
    S("#topLoader").classList.remove("top_loader_go");
  } else {
    S("#leftLoader").classList.remove("top_loader_go");
  }
}

//окно для серверных сообщений
function ServerMsg() {
  this.block = S("#serverError");
  this.msg = S(".server_error_text");
  this.closeBtn = S(".server_error_close_btn");
  var self = this;

  this.setMsg = function(msg) {
    this.msg.textContent = msg;
  }

  this.show = function() {
    this.block.classList.add("server_error_show");
  }

  this.hide = function() {
    this.block.classList.remove("server_error_show");
  }

  this.clearMsg = function() {
    this.msg.textContent = "";
  }

  this.showAndSetMsg = function(msg) {
    this.setMsg(msg);
    this.show();
  }

  this.closeBtn.addEventListener("click", function() {
    self.hide();
  });
}

//ajax
function Ajax(urlEndpoint, body, debug) {
  this.success = function(data) {};
  this.dataError = function(data) {};
  this.serverError = function() {};
  this.netError = function() {};
  this.commonFun = function() {};
  this.commonErrorFun = function() {};
  this.method = "POST";
  this.endpoint = urlEndpoint;
  this.body = body;

  var obj = this;

  var request = new XMLHttpRequest();

  this.setupOpen = function(method, endpoint) {

  }

  this.reopen = function() {
    request.open(this.method, this.endpoint, true);
  }

  request.open(this.method, this.endpoint, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.onload = function() {
    stopLoader();
    obj.commonFun();
    if (this.status >= 200 && this.status < 400) {
      if (debug != undefined){
        console.log(this.response);
      }

      try {
        var data = JSON.parse(this.response);
      } catch(e) {
        console.log(e.name);
        console.log(e.message);
        console.log("-------------");
        console.log("SERVER - "+this.response);
        console.log("-------------");
        var data = {"error":1,"errorMsg":"Сервер вернул некорректные данные. Попробуйте обновить страницу."};
      }

      if (data.error == 1){
        obj.commonErrorFun();
        obj.dataError(data);
      } else {
        obj.success(data);
      }

    } else {
      obj.commonErrorFun();
      obj.serverError();
    }
  };

  request.onerror = function() {
    obj.commonErrorFun();
    obj.commonFun();
    obj.netError();
    stopLoader();
  };

  this.start = function(){
    startLoader();
    request.send(this.body);
  }
}


//кешируем шаблоны
var tem = new Array();
SA(".template").forEach(function(el) {
  tem["#"+el.id] = el.innerHTML;
});

//шаблонизатор
function contentRender(data, templateName) {
  if (tem[templateName]) {
    var temp = tem[templateName];
  } else {
    console.log("шаблон не из кеша");
    var temp = S(templateName).innerHTML;
  }

  var html = "";
  var outerTemplate = temp;

  for(var key in data) {
    var innerTemplate = temp;
    if(typeof(data[key]) == "object") {
      for(var field in data[key]){
        innerTemplate = innerTemplate.replace("[%"+field+"%]", data[key][field]);
      }

      if(innerTemplate != temp) {
        html += innerTemplate;
      }
    } else {
      outerTemplate = outerTemplate.replace("[%"+key+"%]", data[key]);
    }
  };

  if(outerTemplate != temp) {
    html += outerTemplate;
  }

  return html;
}


//возвращает нужный объект из коллекции по классу
//можно было бы брать сразу по индексу в коллекции, но так универсально и не
//зависит от верстки шаблона
function getItemFromCollectionByClass(wantedClass, collection){
  for(var i = 0; i < collection.length; i++){
    if(collection[i].classList.contains(wantedClass)){
      return collection[i];
    }
  }
  return false
}

//проверка и возврат реально нажатой кнопки в контентной области любой вложенности
//через делигирование событий
function checkBtn(clickedBtn, btnListId, targetBtn){
  while(clickedBtn.id != btnListId){
    if(clickedBtn.classList.contains(targetBtn)){
      return clickedBtn;
    }
    clickedBtn = clickedBtn.parentNode;
  }
  return false;
}

//смена класса у элемента (один отключаем, другой включаем)
function swapCssClass(item, removeClass, addClass){
  item.classList.remove(removeClass);
  item.classList.add(addClass);
}

//проверка наличия класса
function hasCssClass(obj, cssClass){
  if ( obj.classList.contains(cssClass) ){
    return true;
  } else {
    return false;
  }
}

//вызывает колбек при достижении CSS свойства переданного значения.
//Используется для вызова коллбека при завершении анимации
function animateEnd(obj, cssProperty, propertyValue, callback) {
  var timer = setInterval(function() {
    if (getComputedStyle(obj)[cssProperty] == propertyValue) {
      clearInterval(timer);
      callback(obj);
    }
  }, 0);
}


//конвертирует html строку в dom элемент
function htmlStringToElement(htmlString) {
  //var tempBlock = document.createElement("div");
  //tempBlock.innerHTML = htmlString;
  S("#serviceBlock").innerHTML = htmlString;
  return S("#serviceBlock").firstElementChild;
}

//рекурсивно ищет в массиве и его подмассивах пару ключ-значение в объекте
//название... ну, зато понятно
function getObjectFromArrayByFieldValue(array, index, field, value) {
  var finded = false;

  function recSearch(array, index, field, value) {
    if (array.length > index && finded != true) {
      if (Array.isArray(array[index])) {
        return recSearch(array[index], 0, field, value);
      }

      if (array[index][field] == value) {
        finded = true;
        return array[index];
      } else {
        return recSearch(array, index+1, field, value);
      }
    }
  }

  return recSearch(array, index, field, value);
}

//сборщик переменных в post запрос
function getPostVars(obj) {
  var postVars = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
  for (var name in obj) {
    postVars += "&"+name+"="+obj[name];
  }
  return postVars;
}
