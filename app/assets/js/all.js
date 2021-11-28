
const layout ={
  body: document.querySelector("body"),
  navbar: document.querySelector("#navbar"),
  news: document.querySelector("#news"),
  heading: document.querySelector("#heading"),
  contentArea: document.querySelector("#contentArea"),
  form:document.querySelector("#form"),
  locationMenu: document.querySelector("#locationMenu"),
  invisible:document.querySelector("#invisibleElement"),
  searchResult: document.querySelector("#searchResult"),
  located: document.querySelector("#located"),
  routeList: document.querySelector("#routeList")
} 
const search ={
    cityBtn: document.querySelector("#cityBus"),
    highwayBtn: document.querySelector("#highWayBus"),
    location: document.querySelector("#location"),
    arriveCity: document.querySelector("#arriveCity"),
    keyWord: document.querySelector("#keyWord"),
    btn: document.querySelector("#searchBtn"),
    relocateBtn: document.querySelector("#relocateBtn"),
    direction: document.querySelector("#direction")
}
let cityName ={
  "臺北市":"Taipei",
  "新北市":"NewTaipei",
  "桃園市":"Taoyuan",
  "臺中市":"Taichung",
  "臺南市":"Tainan",
  "高雄市":"Kaohsiung",
  "基隆市":"Keelung",
  "新竹市":"Hsinchu",
  "新竹縣":"HsinchuCounty",
  "苗栗縣":"MiaoliCounty",
  "彰化縣":"ChanghuaCounty",
  "南投縣":"NantouCounty",
  "雲林縣":"YunlinCounty",
  "嘉義縣":"ChiayiCounty",
  "嘉義市":"Chiayi",
  "屏東縣":"PingtungCounty",
  "宜蘭縣":"YilanCounty",
  "花蓮縣":"HualienCounty",
  "臺東縣":"TaitungCounty",
  "金門縣":"KinmenCounty",
  "澎湖縣":"PenghuCounty",
  "連江縣":"LienchiangCounty"
};
let cityNameCH = Object.keys(cityName);
let cityStr = "";
cityNameCH.forEach((item)=>{
  cityStr += `<option value=${cityName[item]}>${item}</option>`;
});
search["location"].innerHTML = `<option value="" disabled selected hidden>請選擇縣/市</option>${cityStr}`;


let searchValue = {
  isCityBus: true,
  city:"",
  keywords:"",
  cityName_zh: "",
  highwayOperatorName:""
}

//dom操作
function domControl(data){
  //縣市選項監聽
  search["location"].addEventListener("change",(e)=>{
    //location select預設選項為灰色，點選後改回內文顏色
    e.target.classList.remove("text-gray800");
    if(searchValue["isCityBus"]){
      getLatestNews(e.target.value);
    }

  });
  //監聽市區公車的按鈕
  search["cityBtn"].addEventListener("click",(e)=>{
    search["cityBtn"].classList.add("bus-btn-active");
    if(search["highwayBtn"].getAttribute("class").includes("bus-btn-active")){
      search["highwayBtn"].classList.remove("bus-btn-active");
    }
    searchValue["isCityBus"] = true;
    //更改市區公車的縣市選項為一個縣市範圍
    search["location"].options[search["location"].selectedIndex].textContent = "請選擇縣/市";
    layout["locationMenu"].classList.remove("location-menu-arrow");
  });
  //監聽公路客運的按鈕
  search["highwayBtn"].addEventListener("click",(e)=>{
    search["highwayBtn"].classList.add("bus-btn-active");
    if(search["cityBtn"].getAttribute("class").includes("bus-btn-active")){
      search["cityBtn"].classList.remove("bus-btn-active");
    }
    searchValue["isCityBus"] = false;
    getHighwayOperatorData();
  });

//點選查詢按鈕
  search.btn.addEventListener("click",(e)=>{
    searchAction();
  });
  //enter監聽
  layout["body"].addEventListener("keydown",(e)=>{
    if(e.keyCode === 13){
      searchAction();
    }
  });
  //重新選擇地點
  search["relocateBtn"].addEventListener("click",(e)=>{
    layoutChange(false);
    search["location"].value = "";
    search["location"].classList.add("text-gray800");
    search["direction"].value = "";
    getLatestNews("Taipei");
  });

}
//送出資料查詢，將資料填入變數中，執行查詢的動作
function searchAction(){
   //確認縣市欄位有填
   if(search["location"].value){
    //將值填入searchValue中
    searchValue["keywords"] = search["keyWord"].value;
    if(searchValue["isCityBus"]){
      searchValue["city"] = search["location"].value;
      searchValue["cityName_zh"] = search["location"].options[search["location"].selectedIndex].textContent;
      //結果頁面有個定位按鈕，要把字填上
    layout["located"].textContent = searchValue["cityName_zh"];
    }else{
      searchValue["highwayOperatorName"] = search["location"].value;
      //結果頁面有個定位按鈕，要把字填上
      layout["located"].textContent = searchValue["highwayOperatorName"];
    }


    //修改版面
    layoutChange(true);
    //抓資料
    getBusRouteData();
  }else if(!searchValue["isCityBus"]){
    searchValue["arriveCityName_zh"] = search["arriveCity"].options[search["arriveCity"].selectedIndex].textContent;
  }else{
    alert("請選擇縣市");
  }
}

//切換首頁或結果版面
function layoutChange(isResult){
  layout["routeList"].innerHTML = ` <div class="text-center">
  <div class="spinner-border text-primary" role="status">
<span class="visually-hidden">Loading...</span>
</div>
</div>`;
  if(isResult){
    //remove
    layout["navbar"].classList.remove("d-block");
    layout["contentArea"].classList.remove("pt-4","bg-secondary");
    layout["form"].classList.remove("justify-content-between","h-100");
    layout["searchResult"].classList.remove("d-none");
    //add
    layout["contentArea"].classList.add("bg-primary");
    layout["heading"].classList.add("d-none");
    layout["form"].classList.add("justify-content-end","position-fixed","bottom-0","start-0","px-4","w-100");
    layout["invisible"].classList.add("d-none");
  }else{
        //add
        layout["navbar"].classList.add("d-block");
        layout["contentArea"].classList.add("pt-4","bg-secondary");
        layout["form"].classList.add("justify-content-between","h-100");
        layout["searchResult"].classList.add("d-none");
        //remove
        layout["contentArea"].classList.remove("bg-primary");
        layout["heading"].classList.remove("d-none");
        layout["form"].classList.remove("justify-content-end","position-fixed","bottom-0","start-0","px-4","w-100");
        layout["invisible"].classList.remove("d-none");
  }
}


//重複的filter條件字串
function filterRules(keyword){
  return `contains(DepartureStopNameZh, '${keyword}')  or contains(DestinationStopNameZh,'${keyword}')`;
}

//取得公車路線資料
function getBusRouteData(){
  //設定$filter 條件
  let filterRule = "";
  if(searchValue["keywords"]){
    //如果有填寫關鍵字，加入篩選起迄站、路線名稱、headsign
    filterRule += filterRules(searchValue["keywords"]) + `contains(RouteName/Zh_tw, '${searchValue["keywords"]}') or SubRoutes/any(d: contains(d/Headsign, '${searchValue["keywords"]}'))`;
  }
  //先確定是否為市區公車
  if(searchValue["isCityBus"] && searchValue["city"]){
    //抓資料
      axios.get( `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${searchValue.city}?$filter=${filterRule}&&$format=JSON` ,
         {
            headers: getAuthorizationHeader()
         })
      .then((res)=>{
        let cityData = res.data;
        drawBusRouteList(cityData);
          //選擇方向
        search["direction"].addEventListener("change",(e)=>{
          drawBusRouteList(cityData, e.target.value);
        });
      })
      .catch((error)=>{
        console.log(error);
      }); 
    }else if(!searchValue["isCityBus"] && searchValue["highwayOperatorName"]){
      //設定$filter 條件
      filterRule += ` and Operators/any(d: d/OperatorName/Zh_tw eq '${searchValue["highwayOperatorName"]}')`;
      // 抓資料
      axios.get( `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/InterCity?$filter=${filterRule}&$format=JSON` ,
      {
         headers: getAuthorizationHeader()
      })
      .then((res)=>{
        let highwayData = res.data;
       console.log(highwayData);
        // drawBusRouteList(highwayData);
        //   //選擇方向
        // search["direction"].addEventListener("change",(e)=>{
        //   drawBusRouteList(highwayData, e.target.value);
        // });
      })
      .catch((error)=>{
        console.log(error);
      }); 
    }
   
}

function getHighwayOperatorData(){
     //公路客運業者的API抓取
     if(!searchValue["isCityBus"]){
      axios.get( `https://ptx.transportdata.tw/MOTC/v2/Bus/Operator/InterCity?$format=JSON` ,
      {
         headers: getAuthorizationHeader()
      })
      .then((res)=>{
        let highwayData = res.data;
        let ary = [];
        highwayData.forEach((item)=>{
          let isMatch = ary.every((addItem)=>{
            return item.OperatorName.Zh_tw !== addItem;
          });
          if(isMatch){
            ary.push(item.OperatorName.Zh_tw);
          }
        });
        //更改公路客運的縣市選項為客運單位名稱
        let operatorStr = "";
        ary.forEach((item)=>{
          operatorStr += `<option value="${item}">${item}</option>`;
        });
        search["location"].innerHTML = `<option value="" disabled selected hidden>請選擇客運公司</option>${operatorStr}`;
        console.log(ary);
        // drawBusRouteList(highwayData);
        //   //選擇方向
        // search["direction"].addEventListener("change",(e)=>{
        //   drawBusRouteList(highwayData, e.target.value);
        // });
      })
      .catch((error)=>{
        console.log(error);
      }); 
    }
}


//畫出公車路線列表
function drawBusRouteList(data, curDirectionValue, isHighWay){
let cardStr = "";
// console.log(data);
//有資料，才跑迴圈
  if(data.length){
    data.forEach((item)=>{
      //整理變數
      let info = {
      name: item.RouteName.Zh_tw,
      depart: item.DepartureStopNameZh,
      terminal: item.DestinationStopNameZh,
      id:""
      };
      let str = "";
      //抓到路線資訊
      item.SubRoutes.forEach((route)=>{
        let headsign = route.Headsign;
        info.id = route.SubRouteUID;
        //篩選符合關鍵字的subRoute，再顯示
        //先篩選路線名字、起迄站有包含關鍵字的
        let isContainKeyword = info.name.indexOf(search["keyWord"].value) >= 0 || 
          info.depart.indexOf(search["keyWord"].value) >= 0 || 
          info.terminal.indexOf(search["keyWord"].value) >= 0;
          //headsign 中包含關鍵字的，但不是每個縣市都會有
          if(headsign){
            isContainKeyword = isContainKeyword || headsign.indexOf(search["keyWord"].value) >= 0;
          }
          //公車因應路線篩選的選項，呈現不同路線
          if(route.Direction === parseInt(curDirectionValue)){
            if(isContainKeyword){
              str += routeCardStr(info, route.Direction, headsign);
            }else if(!search["keyWord"].value){
              str += routeCardStr(info, route.Direction, headsign);
            }
            //如果篩選選項為全部
          }else if(!curDirectionValue){
            if(isContainKeyword){
              str += routeCardStr(info, route.Direction, headsign);
            }else if(!search["keyWord"].value){
              str += routeCardStr(info, route.Direction, headsign);
            }
          }
        
        
        
          
        
      });
      cardStr += str;
    });
  }
  if(!cardStr){

    cardStr +=`<li class="text-gray800 text-center">找不到相符的公車路線</li>`;
  }
layout["routeList"].innerHTML = cardStr;
}
//路線卡片組字串
function routeCardStr(info, direction, headsign){
  let str = `<li class="card py-6 px-3 mb-3 hover" id=${info.id}>
  <h2 class="text-primary mb-1">${info.name}</h2>`;
  if(headsign){
    let ary = headsign.split(/[→—─\-－]/);
    str += "<p>";
    ary.forEach((item,index)=>{
      if(index < ary.length - 1){
        str += `${item}<span class="material-icons-outlined fs-2 text-info mx-2 align-text-bottom">
      trending_flat
      </span>`;
      }else{
        str += `${item}`;
      }
    });
    str += "</p>";
  }else{
    if(direction === 0){
    str += `<p>${info.depart}<span class="material-icons-outlined fs-2 text-info mx-2 align-text-bottom">
        trending_flat
        </span>${info.terminal}</p>`;
  }else if(direction === 1){
    str += `<p>${info.terminal}<span class="material-icons-outlined fs-2 text-info mx-2 align-text-bottom">
        trending_flat
        </span>${info.depart}</p>`;
  }else if(direction === 2){
    str += `<p>${info.depart}<span class="material-icons-outlined fs-2 text-info mx-2 align-text-bottom">
        trending_flat
        </span>${info.terminal}<span class="material-icons-outlined fs-2 text-info mx-2 align-text-bottom">
        trending_flat
        </span>${info.depart}</p>`;
  }
}
str += '</li>';
return str;
}

//header 金鑰加密
function getAuthorizationHeader() {
  //  填入自己 ID、KEY 開始
      let AppID = '621db84a74fb48eeae9358661115b2d9';
      let AppKey = 'JO9-itpiGC6DmZ-bmVWptlx5OO0';
  //  填入自己 ID、KEY 結束
      let GMTString = new Date().toGMTString();
      let ShaObj = new jsSHA('SHA-1', 'TEXT');
      ShaObj.setHMACKey(AppKey, 'TEXT');
      ShaObj.update('x-date: ' + GMTString);
      let HMAC = ShaObj.getHMAC('B64');
      let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
      return { 'Authorization': Authorization, 'X-Date': GMTString }; 
  }


//隨機整數
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//取得最新消息
function getLatestNews(city){
  axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/News/City/${city}?$top=30&$format=JSON`,{
    headers: getAuthorizationHeader()
  })
  .then((res)=>{
    let data = res.data;
    let str = ``;
    //如果最新資料超過3筆，則從中隨機顯示4筆在畫面上
    if(data.length > 3){
      for(let i = 0; i <= 3; i++){
        let item = data[getRandomInt(data.length - 1)];
        if(item.NewsURL){
          str += `${i + 1}. <a href=${item.NewsURL} class="text-info-light">${item.Title}</a>&emsp;`;
        }else{
          str += `${i + 1}. ${item.Title}&emsp;`;
        }
      }
    }else{
      //資料不超過3筆則全部顯示
      data.forEach((item, index)=>{
        if(item.NewsURL){
          str += `${index + 1}. <a href=${item.NewsURL} class="text-info-light">${item.Title}</a>&emsp;`;
        }else{
          str += `${index + 1}. ${item.Title}&emsp;`;
        }
        
      });
    }
    
    layout["news"].innerHTML = str;
  })
  .catch((error)=>{
    console.log(error);
  });
}

getLatestNews("Taipei");
domControl();