"use strict";

var layout = {
  body: document.querySelector("body"),
  navbar: document.querySelector("#navbar"),
  news: document.querySelector("#news"),
  heading: document.querySelector("#heading"),
  contentArea: document.querySelector("#contentArea"),
  form: document.querySelector("#form"),
  locationMenu: document.querySelector("#locationMenu"),
  invisible: document.querySelector("#invisibleElement"),
  searchResult: document.querySelector("#searchResult"),
  located: document.querySelector("#located"),
  routeList: document.querySelector("#routeList")
};
var search = {
  cityBtn: document.querySelector("#cityBus"),
  highwayBtn: document.querySelector("#highWayBus"),
  location: document.querySelector("#location"),
  arriveCity: document.querySelector("#arriveCity"),
  keyWord: document.querySelector("#keyWord"),
  btn: document.querySelector("#searchBtn"),
  relocateBtn: document.querySelector("#relocateBtn"),
  direction: document.querySelector("#direction")
};
var cityName = {
  "臺北市": "Taipei",
  "新北市": "NewTaipei",
  "桃園市": "Taoyuan",
  "臺中市": "Taichung",
  "臺南市": "Tainan",
  "高雄市": "Kaohsiung",
  "基隆市": "Keelung",
  "新竹市": "Hsinchu",
  "新竹縣": "HsinchuCounty",
  "苗栗縣": "MiaoliCounty",
  "彰化縣": "ChanghuaCounty",
  "南投縣": "NantouCounty",
  "雲林縣": "YunlinCounty",
  "嘉義縣": "ChiayiCounty",
  "嘉義市": "Chiayi",
  "屏東縣": "PingtungCounty",
  "宜蘭縣": "YilanCounty",
  "花蓮縣": "HualienCounty",
  "臺東縣": "TaitungCounty",
  "金門縣": "KinmenCounty",
  "澎湖縣": "PenghuCounty",
  "連江縣": "LienchiangCounty"
};
var cityNameCH = Object.keys(cityName);
var cityStr = "";
cityNameCH.forEach(function (item) {
  cityStr += "<option value=".concat(cityName[item], ">").concat(item, "</option>");
});
search["location"].innerHTML = "<option value=\"\" disabled selected hidden>\u8ACB\u9078\u64C7\u7E23/\u5E02</option>".concat(cityStr);
var searchValue = {
  isCityBus: true,
  city: "",
  keywords: "",
  cityName_zh: "",
  highwayOperatorName: ""
}; //dom操作

function domControl(data) {
  //縣市選項監聽
  search["location"].addEventListener("change", function (e) {
    //location select預設選項為灰色，點選後改回內文顏色
    e.target.classList.remove("text-gray800");

    if (searchValue["isCityBus"]) {
      getLatestNews(e.target.value);
    }
  }); //監聽市區公車的按鈕

  search["cityBtn"].addEventListener("click", function (e) {
    search["cityBtn"].classList.add("bus-btn-active");

    if (search["highwayBtn"].getAttribute("class").includes("bus-btn-active")) {
      search["highwayBtn"].classList.remove("bus-btn-active");
    }

    searchValue["isCityBus"] = true; //更改市區公車的縣市選項為一個縣市範圍

    search["location"].options[search["location"].selectedIndex].textContent = "請選擇縣/市";
    layout["locationMenu"].classList.remove("location-menu-arrow");
  }); //監聽公路客運的按鈕

  search["highwayBtn"].addEventListener("click", function (e) {
    search["highwayBtn"].classList.add("bus-btn-active");

    if (search["cityBtn"].getAttribute("class").includes("bus-btn-active")) {
      search["cityBtn"].classList.remove("bus-btn-active");
    }

    searchValue["isCityBus"] = false;
    getHighwayOperatorData();
  }); //點選查詢按鈕

  search.btn.addEventListener("click", function (e) {
    searchAction();
  }); //enter監聽

  layout["body"].addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      searchAction();
    }
  }); //重新選擇地點

  search["relocateBtn"].addEventListener("click", function (e) {
    layoutChange(false);
    search["location"].value = "";
    search["location"].classList.add("text-gray800");
    search["direction"].value = "";
    getLatestNews("Taipei");
  });
} //送出資料查詢，將資料填入變數中，執行查詢的動作


function searchAction() {
  //確認縣市欄位有填
  if (search["location"].value) {
    //將值填入searchValue中
    searchValue["keywords"] = search["keyWord"].value;

    if (searchValue["isCityBus"]) {
      searchValue["city"] = search["location"].value;
      searchValue["cityName_zh"] = search["location"].options[search["location"].selectedIndex].textContent; //結果頁面有個定位按鈕，要把字填上

      layout["located"].textContent = searchValue["cityName_zh"];
    } else {
      searchValue["highwayOperatorName"] = search["location"].value; //結果頁面有個定位按鈕，要把字填上

      layout["located"].textContent = searchValue["highwayOperatorName"];
    } //修改版面


    layoutChange(true); //抓資料

    getBusRouteData();
  } else if (!searchValue["isCityBus"]) {
    searchValue["arriveCityName_zh"] = search["arriveCity"].options[search["arriveCity"].selectedIndex].textContent;
  } else {
    alert("請選擇縣市");
  }
} //切換首頁或結果版面


function layoutChange(isResult) {
  layout["routeList"].innerHTML = " <div class=\"text-center\">\n  <div class=\"spinner-border text-primary\" role=\"status\">\n<span class=\"visually-hidden\">Loading...</span>\n</div>\n</div>";

  if (isResult) {
    //remove
    layout["navbar"].classList.remove("d-block");
    layout["contentArea"].classList.remove("pt-4", "bg-secondary");
    layout["form"].classList.remove("justify-content-between", "h-100");
    layout["searchResult"].classList.remove("d-none"); //add

    layout["contentArea"].classList.add("bg-primary");
    layout["heading"].classList.add("d-none");
    layout["form"].classList.add("justify-content-end", "position-fixed", "bottom-0", "start-0", "px-4", "w-100");
    layout["invisible"].classList.add("d-none");
  } else {
    //add
    layout["navbar"].classList.add("d-block");
    layout["contentArea"].classList.add("pt-4", "bg-secondary");
    layout["form"].classList.add("justify-content-between", "h-100");
    layout["searchResult"].classList.add("d-none"); //remove

    layout["contentArea"].classList.remove("bg-primary");
    layout["heading"].classList.remove("d-none");
    layout["form"].classList.remove("justify-content-end", "position-fixed", "bottom-0", "start-0", "px-4", "w-100");
    layout["invisible"].classList.remove("d-none");
  }
} //重複的filter條件字串


function filterRules(keyword) {
  return "contains(DepartureStopNameZh, '".concat(keyword, "')  or contains(DestinationStopNameZh,'").concat(keyword, "')");
} //取得公車路線資料


function getBusRouteData() {
  //設定$filter 條件
  var filterRule = "";

  if (searchValue["keywords"]) {
    //如果有填寫關鍵字，加入篩選起迄站、路線名稱、headsign
    filterRule += filterRules(searchValue["keywords"]) + "contains(RouteName/Zh_tw, '".concat(searchValue["keywords"], "') or SubRoutes/any(d: contains(d/Headsign, '").concat(searchValue["keywords"], "'))");
  } //先確定是否為市區公車


  if (searchValue["isCityBus"] && searchValue["city"]) {
    //抓資料
    axios.get("https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/".concat(searchValue.city, "?$filter=").concat(filterRule, "&&$format=JSON"), {
      headers: getAuthorizationHeader()
    }).then(function (res) {
      var cityData = res.data;
      drawBusRouteList(cityData); //選擇方向

      search["direction"].addEventListener("change", function (e) {
        drawBusRouteList(cityData, e.target.value);
      });
    })["catch"](function (error) {
      console.log(error);
    });
  } else if (!searchValue["isCityBus"] && searchValue["highwayOperatorName"]) {
    //設定$filter 條件
    filterRule += " and Operators/any(d: d/OperatorName/Zh_tw eq '".concat(searchValue["highwayOperatorName"], "')"); // 抓資料

    axios.get("https://ptx.transportdata.tw/MOTC/v2/Bus/Route/InterCity?$filter=".concat(filterRule, "&$format=JSON"), {
      headers: getAuthorizationHeader()
    }).then(function (res) {
      var highwayData = res.data;
      console.log(highwayData); // drawBusRouteList(highwayData);
      //   //選擇方向
      // search["direction"].addEventListener("change",(e)=>{
      //   drawBusRouteList(highwayData, e.target.value);
      // });
    })["catch"](function (error) {
      console.log(error);
    });
  }
}

function getHighwayOperatorData() {
  //公路客運業者的API抓取
  if (!searchValue["isCityBus"]) {
    axios.get("https://ptx.transportdata.tw/MOTC/v2/Bus/Operator/InterCity?$format=JSON", {
      headers: getAuthorizationHeader()
    }).then(function (res) {
      var highwayData = res.data;
      var ary = [];
      highwayData.forEach(function (item) {
        var isMatch = ary.every(function (addItem) {
          return item.OperatorName.Zh_tw !== addItem;
        });

        if (isMatch) {
          ary.push(item.OperatorName.Zh_tw);
        }
      }); //更改公路客運的縣市選項為客運單位名稱

      var operatorStr = "";
      ary.forEach(function (item) {
        operatorStr += "<option value=\"".concat(item, "\">").concat(item, "</option>");
      });
      search["location"].innerHTML = "<option value=\"\" disabled selected hidden>\u8ACB\u9078\u64C7\u5BA2\u904B\u516C\u53F8</option>".concat(operatorStr);
      console.log(ary); // drawBusRouteList(highwayData);
      //   //選擇方向
      // search["direction"].addEventListener("change",(e)=>{
      //   drawBusRouteList(highwayData, e.target.value);
      // });
    })["catch"](function (error) {
      console.log(error);
    });
  }
} //畫出公車路線列表


function drawBusRouteList(data, curDirectionValue, isHighWay) {
  var cardStr = ""; // console.log(data);
  //有資料，才跑迴圈

  if (data.length) {
    data.forEach(function (item) {
      //整理變數
      var info = {
        name: item.RouteName.Zh_tw,
        depart: item.DepartureStopNameZh,
        terminal: item.DestinationStopNameZh,
        id: ""
      };
      var str = ""; //抓到路線資訊

      item.SubRoutes.forEach(function (route) {
        var headsign = route.Headsign;
        info.id = route.SubRouteUID; //篩選符合關鍵字的subRoute，再顯示
        //先篩選路線名字、起迄站有包含關鍵字的

        var isContainKeyword = info.name.indexOf(search["keyWord"].value) >= 0 || info.depart.indexOf(search["keyWord"].value) >= 0 || info.terminal.indexOf(search["keyWord"].value) >= 0; //headsign 中包含關鍵字的，但不是每個縣市都會有

        if (headsign) {
          isContainKeyword = isContainKeyword || headsign.indexOf(search["keyWord"].value) >= 0;
        } //公車因應路線篩選的選項，呈現不同路線


        if (route.Direction === parseInt(curDirectionValue)) {
          if (isContainKeyword) {
            str += routeCardStr(info, route.Direction, headsign);
          } else if (!search["keyWord"].value) {
            str += routeCardStr(info, route.Direction, headsign);
          } //如果篩選選項為全部

        } else if (!curDirectionValue) {
          if (isContainKeyword) {
            str += routeCardStr(info, route.Direction, headsign);
          } else if (!search["keyWord"].value) {
            str += routeCardStr(info, route.Direction, headsign);
          }
        }
      });
      cardStr += str;
    });
  }

  if (!cardStr) {
    cardStr += "<li class=\"text-gray800 text-center\">\u627E\u4E0D\u5230\u76F8\u7B26\u7684\u516C\u8ECA\u8DEF\u7DDA</li>";
  }

  layout["routeList"].innerHTML = cardStr;
} //路線卡片組字串


function routeCardStr(info, direction, headsign) {
  var str = "<li class=\"card py-6 px-3 mb-3 hover\" id=".concat(info.id, ">\n  <h2 class=\"text-primary mb-1\">").concat(info.name, "</h2>");

  if (headsign) {
    var ary = headsign.split(/[→—─\-－]/);
    str += "<p>";
    ary.forEach(function (item, index) {
      if (index < ary.length - 1) {
        str += "".concat(item, "<span class=\"material-icons-outlined fs-2 text-info mx-2 align-text-bottom\">\n      trending_flat\n      </span>");
      } else {
        str += "".concat(item);
      }
    });
    str += "</p>";
  } else {
    if (direction === 0) {
      str += "<p>".concat(info.depart, "<span class=\"material-icons-outlined fs-2 text-info mx-2 align-text-bottom\">\n        trending_flat\n        </span>").concat(info.terminal, "</p>");
    } else if (direction === 1) {
      str += "<p>".concat(info.terminal, "<span class=\"material-icons-outlined fs-2 text-info mx-2 align-text-bottom\">\n        trending_flat\n        </span>").concat(info.depart, "</p>");
    } else if (direction === 2) {
      str += "<p>".concat(info.depart, "<span class=\"material-icons-outlined fs-2 text-info mx-2 align-text-bottom\">\n        trending_flat\n        </span>").concat(info.terminal, "<span class=\"material-icons-outlined fs-2 text-info mx-2 align-text-bottom\">\n        trending_flat\n        </span>").concat(info.depart, "</p>");
    }
  }

  str += '</li>';
  return str;
} //header 金鑰加密


function getAuthorizationHeader() {
  //  填入自己 ID、KEY 開始
  var AppID = '621db84a74fb48eeae9358661115b2d9';
  var AppKey = 'JO9-itpiGC6DmZ-bmVWptlx5OO0'; //  填入自己 ID、KEY 結束

  var GMTString = new Date().toGMTString();
  var ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  var HMAC = ShaObj.getHMAC('B64');
  var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
  return {
    'Authorization': Authorization,
    'X-Date': GMTString
  };
} //隨機整數


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
} //取得最新消息


function getLatestNews(city) {
  axios.get("https://ptx.transportdata.tw/MOTC/v2/Bus/News/City/".concat(city, "?$top=30&$format=JSON"), {
    headers: getAuthorizationHeader()
  }).then(function (res) {
    var data = res.data;
    var str = ""; //如果最新資料超過3筆，則從中隨機顯示4筆在畫面上

    if (data.length > 3) {
      for (var i = 0; i <= 3; i++) {
        var item = data[getRandomInt(data.length - 1)];

        if (item.NewsURL) {
          str += "".concat(i + 1, ". <a href=").concat(item.NewsURL, " class=\"text-info-light\">").concat(item.Title, "</a>&emsp;");
        } else {
          str += "".concat(i + 1, ". ").concat(item.Title, "&emsp;");
        }
      }
    } else {
      //資料不超過3筆則全部顯示
      data.forEach(function (item, index) {
        if (item.NewsURL) {
          str += "".concat(index + 1, ". <a href=").concat(item.NewsURL, " class=\"text-info-light\">").concat(item.Title, "</a>&emsp;");
        } else {
          str += "".concat(index + 1, ". ").concat(item.Title, "&emsp;");
        }
      });
    }

    layout["news"].innerHTML = str;
  })["catch"](function (error) {
    console.log(error);
  });
}

getLatestNews("Taipei");
domControl();
"use strict";

var searchInfo = {
  location: document.querySelector("#location")
};
var busBtn = {
  city: document.querySelector("#cityBus"),
  highway: document.querySelector("#highWayBus")
};
var cityName = {
  "臺北市": "Taipei",
  "新北市": "NewTaipei",
  "桃園市": "Taoyuan",
  "臺中市": "Taichung",
  "臺南市": "Tainan",
  "高雄市": "Kaohsiung",
  "基隆市": "Keelung",
  "新竹市": "Hsinchu",
  "新竹縣": "HsinchuCounty",
  "苗栗縣": "MiaoliCounty",
  "彰化縣": "ChanghuaCounty",
  "南投縣": "NantouCounty",
  "雲林縣": "YunlinCounty",
  "嘉義縣": "ChiayiCounty",
  "嘉義市": "Chiayi",
  "屏東縣": "PingtungCounty",
  "宜蘭縣": "YilanCounty",
  "花蓮縣": "HualienCounty",
  "臺東縣": "TaitungCounty",
  "金門縣": "KinmenCounty",
  "澎湖縣": "PenghuCounty",
  "連江縣": "LienchiangCounty"
};
var cityNameCH = Object.keys(cityName);
var cityStr = "<option value=\"\" disabled selected hidden>\u8ACB\u9078\u64C7\u7E23/\u5E02</option>";
cityNameCH.forEach(function (item) {
  cityStr += "<option value=".concat(cityName[item], ">").concat(item, "</option>");
});
searchInfo.location.innerHTML = cityStr; //location select預設選項為灰色，點選後改回內文顏色

searchInfo.location.addEventListener("click", function (e) {
  e.target.classList.remove("text-gray800");
});
//# sourceMappingURL=all.js.map
