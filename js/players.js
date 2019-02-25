"use strict";

//загрузка и вывод игроков
function getPlayers(){
  //подчищаем глобальную переменную (временно)
  GB.userGroups = undefined;

  //грузим только если контента нет
  if (S("#playerContent").innerHTML != "") {
    //return true;
    S("#playerContent").innerHTML = "";
  }

  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
  getContent("playerGet.php", body, "#playerBlockTemplate", "#playerContent");
}

//добавление
S("#addNewPlayerBtn").addEventListener("click", function(){
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
              "&userId="+localStorage["bgsId"]+"&name="+S("#newPlayer").value;
  serverRequestBtn(this, "playerAdd.php", body, addPlayerSuccess);

  function addPlayerSuccess(data){
    var newPlayer = htmlStringToElement(contentRender(data, "#playerBlockTemplate"));
    var pinnedBtn = newPlayer.querySelector(".pinned_btn");
    insertItemInListBySort("#playerContent", "name", pinnedBtn, 0);
    S("#newPlayer").value = "";
  }
});

//назачение обработчика для игроков
S("#playerContent").addEventListener("click", playerBtnHandler);
//обработчик кнопок игроков
function playerBtnHandler(e) {
  var btn;

  //удаление
  btn = checkBtn(e.target, "playerContent", "delete_btn");
  if(btn){
    delItemInList(btn, "playerHideShow.php");
  }

  //закпреление/открепление
  btn = checkBtn(e.target, "playerContent", "pinned_btn");
  if(btn){
    pinnedBlock(btn, "#playerContent", "name", "playerPinned.php");
  }

  //редактирование
  btn = checkBtn(e.target, "playerContent", "edit_btn");
  if(btn){
    editPlayer(btn);
  }
}

//функция редактирования
function editPlayer(btn){
  var playerNameField = btn.parentNode.querySelector(".name");
  var delBtn = playerNameField.parentNode.querySelector(".delete_btn");
  var pinnedBtn = playerNameField.parentNode.querySelector(".pinned_btn");

  if( playerNameField.hasAttribute("disabled") ) {
    playerNameField.disabled = false;
    playerNameField.classList.add("input_text_editable");
    btn.classList.add("margin_right_0");
    delBtn.classList.add("btn_collapsed");
    pinnedBtn.classList.add("btn_collapsed");
    btn.children[0].textContent = GB.saveBtnIcon;
  } else {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                "&userId="+localStorage["bgsId"]+"&name="+playerNameField.value+
                "&playerId="+playerNameField.getAttribute("data-id");
    serverRequestBtn(btn, "playerEdit.php", body, function(){
      playerNameField.disabled = true;
      playerNameField.classList.remove("input_text_editable");
      btn.classList.remove("margin_right_0");
      delBtn.classList.remove("btn_collapsed");
      pinnedBtn.classList.remove("btn_collapsed");
      btn.children[0].textContent = GB.editBtnIcon;
    });
  }
}
