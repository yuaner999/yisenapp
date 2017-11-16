var db = openDatabase('YSenApp', '1.0', 'YSenApp Database', 1024 * 1024 * 20); //如果数据库存在 则打开,不存在的则创建 然后在打开
var load = null; //声明加载层
var loadO = null; //声明加载层
var loginName = null;
var newTokenId = null;
getLoginName();
var json; //从数据库获取的所有数据
var cityNow = ""; //获取数据库城市的前三个字
var city = ""; //声明点击的城市
var index = 0; //控制数据显示的索引
var num = 0; //控制数据显示的索引
var n = 0; //显示当前的现场数
var onlyxiao = false; //是否仅查硝魔方
var str = new Array(); //存数据库传过来的数组
var strCity = new Array(); //存数据库传过来的数组
var sid = new Array();
var sidNow = new Array();
var strNow = new Array(); //存筛选过的数组
var myGeo = new BMap.Geocoder(); //创建对象
var myGeoO = new BMap.Geocoder(); //创建对象
var xShow = new Array(); //存取经度
var yShow = new Array(); //存取纬度
var xNow = new Array(); //存取筛选过的经度
var yNow = new Array(); //存取筛选过的纬度
var makerArray = new Array(); //存标注点
var xiaoType = GetQueryString("type");//接收全部应用硝魔方按钮参数
//清楚选择现场
db.transaction(function(tx) {
	tx.executeSql("drop table if exists scene", [], function(tx, data) {});
})
$(function() {
	//判断从全部应用今天此页面
	if(xiaoType == 'xiao') {
		onlyxiao = true;
		$('#btnOnly').html('查看全部现场');
	}
	//加载层
	//	load = layer.load(1, {
	//		shade: [0.3,'#000'] //0.1透明度的白色背景
	//	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newTokenId = tokenId;
				getPersonCallback(tokenId); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			newTokenId = tokenId;
			getPersonCallback(tokenId); //回调函数，获取用户信息
		}
	});
	//	获取当前市
	var geoc = new BMap.Geocoder();
	//定义点击次数
	var clickNum = 0;
	map.addEventListener("click", function(e) {
		clickNum++;
		//0.3秒内的点击次数有效
		setTimeout(run, 300);

		function run() {
			//当点击一次时执行
			if(clickNum == 1) {
				index = 0;
				n = 0;
				var pt = e.point;
				geoc.getLocation(pt, function(rs) {
					addComp = rs.addressComponents;
					city = addComp.city;
					var index1 = city.length - 1;
					city = city.substr(0, index1);
					//清空下面的列表
					$("#ulscene").empty();
					$("#ulscene").html("");
					document.getElementById("showNum").innerHTML = "<mark>0</mark>家";
					//清空标注点，！！
					for(var i = 0; i < makerArray.length; i++) {
						map.removeOverlay(makerArray[i]);
					}
					strNow = [];
					xNow = [];
					yNow = [];

					for(var i = 0; i < json.length; i++) {
						strCity[i] = json[i].scene_city_name;
						var x = json[i].position_x;
						var y = json[i].position_y;
						if(strCity[i].indexOf(city) != -1 && x != "" && y != "") {
							sidNow[n] = json[i].scene_id;
							strNow[n] = json[i].scene_name2;
							xNow[n] = json[i].position_x;
							yNow[n] = json[i].position_y;
							n++;
						}
					}
					n = 0;
					bdGEO();
				});
			}
			clickNum = 0;
		}
	});
	//		document.addEventListener("touchmove", _touch, false);
	//		 
	//		function _touch(event){
	//		alert(1);
	//		}
})

function getPersonCallback(tokenId) {
	if(tokenId == "close") { //回调过程中出错
		layer.close(load); //关闭加载层
		return;
	}
	var selAjax = $.ajax({
		type: "post",
		url: url + "/handler/SelectScene.asmx/getScenes?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"loginName": loginName,
			"tokenid": tokenId
		},
		timeout: 30000,
		success: function(data) {
			layer.close(load); //关闭加载层
			if(data.status == 1) { //查询成功
				json = eval("(" + data.result + ")");
				show(json);
			} else {
				layer.msg(data.result);
			}
		},
		error: function() {
			layer.close(load); //关闭加载层
			layer.msg("查询失败");
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
			layer.close(load); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				selAjax.abort(); //取消请求
				layer.msg("请求超时1");
			}
		}
	});
}
//列出全部现场
function show(json) {
	console.log(json)
	cityO = "";
	var j = 0;
	sid = [];
	xShow = [];
	yShow = [];
	str = [];
	num = 0;
	var falg = false;
	$("#ulscene").html('');
	for(var i = 0; i < makerArray.length; i++) {
		map.removeOverlay(makerArray[i]);
	}
	if(onlyxiao) {
		for(var i = 0; i < json.length; i++) {
			if(json[i].xiaoNum != '0') {
				var x = json[i].position_x;
				var y = json[i].position_y;
				if(x != "" && y != "") {
					sid[j] = json[i].scene_id;
					xShow[j] = json[i].position_x;
					yShow[j] = json[i].position_y;
					str[j] = json[i].scene_name2;
					j++;
				}
				falg = true;
			}
		}
	} else {
		for(var i = 0; i < json.length; i++) {
			if(json[i].xiaoNum != '0') {
				falg = true;
			}
			var x = json[i].position_x;
			var y = json[i].position_y;
			if(x != "" && y != "") {
				sid[j] = json[i].scene_id;
				xShow[j] = json[i].position_x;
				yShow[j] = json[i].position_y;
				str[j] = json[i].scene_name2;
				j++;
			}
		}
	}

	//如果没有硝魔方数据则隐藏按钮
	if(!falg) $('#btnOnly').hide();

	n = str.length;
	document.getElementById("showNum").innerHTML = "<mark>" + n + "</mark>家";
	bdGEOO();
}
//列出全部现场
function btnOnlyClick() {
	if(onlyxiao) {
		onlyxiao = false;
		$('#btnOnly').html('仅查看硝魔方');
	} else {
		onlyxiao = true;
		$('#btnOnly').html('查看全部现场');
	}
	setmap();
	getPersonCallback(newTokenId);
}
//加载时运行的现场函数
function bdGEOO() {
	sidO = sid[num];
	addO = str[num];
	var x = xShow[num];
	var y = yShow[num];
	if(x != undefined && y != undefined) {
		//自定义标注
		var icon = new BMap.Icon('images/marker.png', new BMap.Size(20, 20), {
			anchor: new BMap.Size(10, 20)
		});
		//		
		//	var mkr = new BMap.Marker(new BMap.Point(x,y), {
		//	    icon: icon
		//	});
		//	
		//	map.addOverlay(mkr);
		var mkr = new BMap.Marker(new BMap.Point(x, y), {
			icon: icon
		});
		map.addOverlay(mkr);
		makerArray[num] = mkr;
	}
	geocodeSearchO(sidO);
	num++;
}

function geocodeSearchO(sidO) {
	if(num < str.length - 1) {
		setTimeout(window.bdGEOO, 50);
		if(loadO == null) {
			//加载层
			loadO = layer.load(1, {
				shade: [0.3, '#000'] //0.1透明度的白色背景
			});
		}
	} else {
		layer.msg("查询成功");
		layer.close(loadO);
		loadO = null;
	}
	if(str.length != 0) {
		n = str.length;
		document.getElementById("showNum").innerHTML = "<mark>" + n + "</mark>家";
		//$(".box").append('<a style="margin:1rem;height:20px;" href="homepage.html?sid='+sidO+'"><li style="padding:0.2rem; border-bottom:solid 1px #017d7b;">'+(num+1)+ "、" + addO+"</li></a>");
		$("#ulscene").append('<li><a href="homepage.html?sid=' + sidO + '"><div><span class="mui-badge">' + (num + 1) + '</span><span>' + addO + '<span></div></a></li>');
	}
}
//列出筛选过的城市
function bdGEO() {
	sidN = sidNow[index];
	var add = strNow[index];
	var x = xNow[index];
	var y = yNow[index];
	//自定义标注
	var icon = new BMap.Icon('images/marker.png', new BMap.Size(20, 20), {
		anchor: new BMap.Size(10, 20)
	});
	//		
	//		var mkr = new BMap.Marker(new BMap.Point(x,y), {
	//		    icon: icon
	//		});
	if(x != undefined && y != undefined) {
		var mkr = new BMap.Marker(new BMap.Point(x, y), {
			icon: icon
		});

		map.addOverlay(mkr);
		makerArray[index] = mkr;
	}
	//		map.addOverlay(mkr);
	geocodeSearch(add, sidN);
	index++;
}

function geocodeSearch(add, sidN) {
	if(index < strNow.length - 1) {
		setTimeout(window.bdGEO, 50);
		if(load == null) {
			//加载层
			load = layer.load(1, {
				shade: [0.3, '#000'] //0.1透明度的白色背景
			});
		}
	} else {
		layer.msg("查询成功");
		layer.close(load);
		load = null;
	}
	if(strNow.length != 0) {
		document.getElementById("showNum").innerHTML = "<mark>" + strNow.length + "</mark>家";
		//$(".box").append('<li><a style="margin:1rem;" href="homepage.html?sid='+sidN+'">'+(index+1)+ "、" +add+"</a></li>");
		$("#ulscene").append('<li><a href="homepage.html?sid=' + sidN + '"><div><span class="mui-badge">' + (index + 1) + '</span><span>' + add + '<span></div></a></li>');
	}
}