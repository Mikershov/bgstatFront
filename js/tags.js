"use strict";

//загрузка и вывод тегов
function getTags(){
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"];

  //грузим только если контента нет
  if (S("#tagContentMatch").innerHTML != "") {
    //return true;
    S("#tagContentMatch").innerHTML = "";
  } else {
    //getContent("tagGet.php?type=match", body, "#tagBlockTemplate", "#tagContentMatch");
  }

  if (S("#tagContentGame").innerHTML != "") {
    //return true;
    S("#tagContentGame").innerHTML = "";
  } else {
    //getContent("tagGet.php?type=game", body, "#tagBlockTemplate", "#tagContentGame");
  }

  //временно до регулятора перезагрузки
  getContent("tagGet.php?type=match", body, "#tagBlockTemplate", "#tagContentMatch");
  getContent("tagGet.php?type=game", body, "#tagBlockTemplate", "#tagContentGame");
}

//открывашка типов тега при добавлении
S("#newTag").addEventListener("click", function(){
  S("#newTagType").classList.add("sub_block_opened");
});

//навешивание обработчика переключателя
SA("#newTagType .toggle_btn").forEach(function(el) {
  el.addEventListener("click", toggleWidgetHandler);
});


//добавление
S("#addNewTagBtn").addEventListener("click", function(){
  var tagType = S("#newTagType").getAttribute("data-value");

  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
              "&userId="+localStorage["bgsId"]+"&name="+S("#newTag").value+
              "&type="+tagType;
  serverRequestBtn(this, "tagAdd.php", body, addTagSuccess);

  function addTagSuccess(data){
    var newTag = contentRender(data, "#tagBlockTemplate");
    tagType = tagType.charAt(0).toUpperCase() + tagType.substr(1);

    var tagInList = htmlStringToElement(newTag);
    insertItemInListBySort("#tagContent"+tagType, "name", tagInList.querySelector(".pinned_btn"), 0);

    S("#newTag").value = "";
    S("#newTagType").classList.remove("sub_block_opened");
  }
});


//назачение обработчиков на кнопки тегов
S("#tagContent").addEventListener("click", tagBtnHandler);
//обработчик кнопок игроков
function tagBtnHandler(e){
  var btn;

  //удаление
  btn = checkBtn(e.target, "tagContent", "delete_btn");
  if(btn){
    delItemInList(btn, "tagHideShow.php");
  }

  //закпреление/открепление
  btn = checkBtn(e.target, "tagContent", "pinned_btn");
  if(btn){
    var tagsListId = btn.parentNode.parentNode.id;
    pinnedBlock(btn, "#"+tagsListId, "name", "tagPinned.php");
  }

  //редактирование
  btn = checkBtn(e.target, "tagContent", "edit_btn");
  if(btn){
    editTag(btn);
  }

  //переключение в toggleWidget
  btn = checkBtn(e.target, "tagContent", "toggle_btn");
  if(btn){
    toggleWidgetHandler.call(btn);
  }
}

//функция удаления
function delTag(btn){
  var tag = btn.parentNode;
  var tagsListId = btn.parentNode.parentNode.id;
  var tagId = tag.querySelector(".name").getAttribute("data-id");
  var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+"&userId="+localStorage["bgsId"]+"&hide=1&tagId="+tagId;
  serverRequestBtn(btn, "tagHideShow.php", body, function(){
    tag.classList.add("folded_height");
    animateEnd(tag, "maxHeight", "0px", function() {
      S("#"+tagsListId).removeChild(tag);
    });
  });
}

function editTag(btn) {
  var tagNameField = btn.parentNode.querySelector(".name");
  var tagInList = tagNameField.parentNode;
  var delBtn = tagInList.querySelector(".delete_btn");
  var pinnedBtn = tagInList.querySelector(".pinned_btn");
  var toggleWidget = tagInList.querySelector(".toggle_widget");
  var activeTypeTag = toggleWidget.getAttribute("data-value");

  if( tagNameField.hasAttribute("disabled") ) {
    btn.setAttribute("data-prev-value", activeTypeTag);
    toggleWidget.classList.add("sub_block_opened");
    tagNameField.disabled = false;
    tagNameField.classList.add("input_text_editable");
    btn.classList.add("margin_right_0");
    delBtn.classList.add("btn_collapsed");
    pinnedBtn.classList.add("btn_collapsed");
    btn.children[0].textContent = "done";
    toggleWidget.querySelector("div[data-value="+activeTypeTag+"]").classList.add("toggle_btn_active");

  } else {
    var tagType = toggleWidget.getAttribute("data-value");
    var tagInListId = tagNameField.getAttribute("data-id");
    var body = "email="+localStorage["email"]+"&pas="+localStorage["pas"]+
                "&userId="+localStorage["bgsId"]+"&name="+tagNameField.value+
                "&tagId="+tagInListId+
                "&type="+tagType;
    serverRequestBtn(btn, "tagEdit.php", body, function(){
      toggleWidget.classList.remove("sub_block_opened");
      tagNameField.disabled = true;
      tagNameField.classList.remove("input_text_editable");
      btn.classList.remove("margin_right_0");
      delBtn.classList.remove("btn_collapsed");
      pinnedBtn.classList.remove("btn_collapsed");
      btn.children[0].textContent = "edit";

      if (btn.getAttribute("data-prev-value") != tagType) {
        tagType = tagType.charAt(0).toUpperCase() + tagType.substr(1);
        insertItemInListBySort("#tagContent"+tagType, "name", pinnedBtn, getPinnedStatus(pinnedBtn));
      }
    });
  }
}
