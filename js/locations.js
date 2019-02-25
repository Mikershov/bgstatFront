"use strict";

//загрузка и вывод мест
function getLocations(){
  //грузим только если контента нет
  if (S("#locationContent").innerHTML != "") {
    //return true;
    S("#locationContent").innerHTML = "";
  }

  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];
  getContent("locationGet.php", body, "#locationBlockTemplate", "#locationContent");
}

//добавление
S("#addNewLocationBtn").addEventListener("click", function(){
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
              "&userId="+localStorage["bgsId"]+"&name="+S("#newLocation").value;
  serverRequestBtn(this, "locationAdd.php", body, addLocSuccess);

  function addLocSuccess(data){
    var newLoc = htmlStringToElement(contentRender(data, "#locationBlockTemplate"));
    var pinnedBtn = newLoc.querySelector(".pinned_btn");
    insertItemInListBySort("#locationContent", "name", pinnedBtn, 0);
    S("#newLocation").value = "";
  }
});

//назачение обработчика для локаций
S("#locationContent").addEventListener("click", locationBtnHandler);
//обработчик кнопок локации
function locationBtnHandler(e){
  var btn;

  //удаление
  btn = checkBtn(e.target, "locationContent", "delete_btn");
  if(btn){
    delItemInList(btn, "locationHideShow.php");
  }

  //закпреление/открепление
  btn = checkBtn(e.target, "locationContent", "pinned_btn");
  if(btn){
    pinnedBlock(btn, "#locationContent", "name", "locationPinned.php");
  }

  //редактирование
  btn = checkBtn(e.target, "locationContent", "edit_btn");
  if(btn){
    editLocation(btn);
  }
}

//функция редактирования
function editLocation(btn){
  var locNameField = btn.parentNode.querySelector(".name");
  var delBtn = locNameField.parentNode.querySelector(".delete_btn");
  var pinnedBtn = locNameField.parentNode.querySelector(".pinned_btn");

  if( locNameField.hasAttribute("disabled") ) {
    locNameField.disabled = false;
    locNameField.classList.add("input_text_editable");
    btn.classList.add("margin_right_0");
    delBtn.classList.add("btn_collapsed");
    pinnedBtn.classList.add("btn_collapsed");
    btn.children[0].textContent = "done";
  } else {
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                "&userId="+localStorage["bgsId"]+"&name="+locNameField.value+
                "&locationId="+locNameField.getAttribute("data-id");
    serverRequestBtn(btn, "locationEdit.php", body, function(){
      locNameField.disabled = true;
      locNameField.classList.remove("input_text_editable");
      btn.classList.remove("margin_right_0");
      delBtn.classList.remove("btn_collapsed");
      pinnedBtn.classList.remove("btn_collapsed");
      btn.children[0].textContent = "edit";
    });
  }
}
