const searchInfo ={
      location: document.querySelector("#location")
  }
const busBtn ={
    city: document.querySelector("#cityBus"),
    highway: document.querySelector("#highWayBus")
  };
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
  let cityStr = `<option value="" disabled selected hidden>請選擇縣/市</option>`;
  cityNameCH.forEach((item)=>{
    cityStr += `<option value=${cityName[item]}>${item}</option>`;
  });
  searchInfo.location.innerHTML = cityStr;
   //location select預設選項為灰色，點選後改回內文顏色
   searchInfo.location.addEventListener("click",(e)=>{
    e.target.classList.remove("text-gray800");
  });  