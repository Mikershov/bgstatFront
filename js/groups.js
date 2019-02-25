"use strict";

//загрузка и вывод составов, а так же списка игроков
function getGroups(){
  //подчищаем глобальную переменную (временно)
  GB.userGroups = undefined;

  //грузим только если контента нет
  if (S("#groupContent").innerHTML != "") {
    //return true; временное решение до контроля перезагрузки
    S("#groupContent").innerHTML = "";
  }

  //загрузка составов
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
  getContent("groupGet.php", body, "#groupBlockTemplate", "#groupContent");

  //загрузка списка игроков с блокированием кнопки добавления состава во время загрузки
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
  serverRequestBtn( S("#addNewGroupBtn"), "playerGet.php", body, playersListLoad );

  function playersListLoad(data){
    S("#playersListData").insertAdjacentHTML("afterBegin", contentRender(data, "#playersListTemplate"));
  }
}


//раскрываем список игроков для добавления
S("#newGroup").addEventListener("click", function(){
  S("#playersListForGroup").classList.add("sub_block_opened");
});

//сворачиваем список
SA(".list_collpased_btn").forEach(function(el){
  el.addEventListener("click", function(){
    el.parentNode.classList.remove("sub_block_opened");
  });
});

//навешиваем обработчик на главный список игроков
S("#playersListData").addEventListener("click", function(e){
  var btn = checkBtn(e.target, "playersListData", "check_btn");
  if(btn){
    toCheckBtn(btn);
  }
});


//добавление
S("#addNewGroupBtn").addEventListener("click", function(){
  var selectedPlayers = getSelectedInList(S("#playersListData"), "data-id");

  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
              "&userId="+localStorage["bgsId"]+"&name="+S("#newGroup").value+
              "&playersList="+selectedPlayers.toString();
  serverRequestBtn(this, "groupAdd.php", body, addGroupSuccess);

  function addGroupSuccess(data){
    var newGroup = htmlStringToElement(contentRender(data, "#groupBlockTemplate"));
    var pinnedBtn = newGroup.querySelector(".pinned_btn");
    insertItemInListBySort("#groupContent", "name", pinnedBtn, 0);

    //обнуляем форму
    S("#newGroup").value = "";
    SA("#playersListData div[data-selected='1']").forEach(function(el){
      el.setAttribute("data-selected", 0);
      el.children[0].textContent = "";
    });

    //сворачиваем список
    S("#playersListForGroup").classList.remove("sub_block_opened");
  }
});


//назачение обработчика для составов
S("#groupContent").addEventListener("click", groupBtnHandler);
//обработчик кнопок игроков
function groupBtnHandler(e){
  var btn;

  //удаление
  btn = checkBtn(e.target, "groupContent", "delete_btn");
  if(btn){
    delItemInList(btn, "groupHideShow.php");
  }

  //закпреление/открепление
  btn = checkBtn(e.target, "groupContent", "pinned_btn");
  if(btn){
    pinnedBlock(btn, "#groupContent", "name", "groupPinned.php");
  }

  //редактирование
  btn = checkBtn(e.target, "groupContent", "edit_btn");
  if(btn){
    editGroup(btn);
  }

  //обработчик отметки игроков
  btn = checkBtn(e.target, "groupContent", "check_btn");
  if (btn) {
    toCheckBtn(btn);
  }
}

//редактирование
function editGroup(btn){
  var groupNameField = btn.parentNode.querySelector(".name");
  var groupBlock = groupNameField.parentNode;
  var delBtn = groupBlock.querySelector(".delete_btn");
  var pinnedBtn = groupBlock.querySelector(".pinned_btn");
  var subPlayersList = btn.parentNode.querySelector(".sub_block");
  var limitedPlayersList = subPlayersList.querySelector(".limited_list");
  var selectedPlayers = groupNameField.getAttribute("data-players-list").split(",");

  if( groupNameField.hasAttribute("disabled") ) {
    groupNameField.disabled = false;
    groupNameField.classList.add("input_text_editable");
    btn.classList.add("margin_right_0");
    delBtn.classList.add("btn_collapsed");
    pinnedBtn.classList.add("btn_collapsed");
    btn.children[0].textContent = "done";
    subPlayersList.classList.add("sub_block_opened");

    //вставка списка и пометка игроков в составе
    if (limitedPlayersList.innerHTML == ""){
      var pld = S("#playersListData").children;
      for (var i = 0; i < pld.length; i++) {
        var node = pld[i].cloneNode(true);
        var checkBtn = node.querySelector(".check_btn");
        var playerId = checkBtn.getAttribute("data-id");

        if (selectedPlayers.indexOf(playerId) >= 0) {
          checkBtn.firstChild.textContent = "check";
          checkBtn.setAttribute("data-selected", "1");
        }
        limitedPlayersList.appendChild(node);
      }
    }
  } else {
    var selectedPlayers = getSelectedInList(limitedPlayersList, "data-id");
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                "&userId="+localStorage["bgsId"]+"&name="+groupNameField.value+
                "&groupId="+groupNameField.getAttribute("data-id")+
                "&playersList="+selectedPlayers.toString();
    serverRequestBtn(btn, "groupEdit.php", body, function(){
      groupNameField.disabled = true;
      groupNameField.classList.remove("input_text_editable");
      btn.classList.remove("margin_right_0");
      delBtn.classList.remove("btn_collapsed");
      pinnedBtn.classList.remove("btn_collapsed");
      btn.children[0].textContent = "edit";
      subPlayersList.classList.remove("sub_block_opened");
    });
  }
}
