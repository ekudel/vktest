function msg(key) {
  return messages[key];
}

function getCommission() {
  return commission;
}

function getUrlParameters() {
  var parametersStr = window.location.search.substr(1);
  return parametersStr != null && parametersStr != "" ? paramsStrToObject(parametersStr) : {};
}

function paramsStrToObject(parametersStr) {
  var result = {};
  var params = parametersStr.split("&");

  for (var i = 0; i < params.length; i++) {
    var t = params[i].split("=");
    result[t[0]] = t[1];
  }
  return result;
}

function buildParamsStr(paramsMap) {
  var builder = [];
  for (var key in paramsMap) {
    if (paramsMap.hasOwnProperty(key)) {
      var value = paramsMap[key];

      if (value) {
        builder.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
      }
    }
  }
  var s = builder.join("&");
  return s.length == 0 ? s : '?' + s;
}