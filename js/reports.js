"use strict";

function getReports() {
  if (S("#reportsContent").innerHTML != "") {
    S("#reportsContent").innerHTML = "";
  }

  var body = getPostVars();
  getContent("reportsMainUserData.php", body, "#reportsMainStat", "#reportsContent");
}
