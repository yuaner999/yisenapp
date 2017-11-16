//$(function  () {
//	//导航变色
//	$(".header li").click(function  () {
//		for(i=0;i<$(".head li").length;i++){
//			if($(".head li").eq(i).text()==$(this).text()){
//				var now=i;
//			}
//		}
//		$(".header li:last-child").stop(true).animate({left:now*4.9375-0.075+"rem"},200);
//		$(this).siblings().removeClass("ani");
//		$(this).siblings().addClass("end");
//		$(this).removeClass("end");
//		$(this).addClass("ani");
//	})
//	//导航变色2
//	$(".header2 li").click(function  () {
//		for(i=0;i<$(".header2 li").length;i++){
//			if($(".header2 li").eq(i).text()==$(this).text()){
//				var now=i;
//			}
//		}
//		$(".header2 li:last-child").stop(true).animate({left:now*4.9375-0.075+"rem"},200);
//		$(this).siblings().removeClass("ani");
//		$(this).siblings().addClass("end");
//		$(this).removeClass("end");
//		$(this).addClass("ani");
//	})
//	//初始化头部的日期
//	var mon;
//	var day;
//	var d=new Date();
//		if((d.getMonth()+1)<10){
//			mon="0"+(d.getMonth()+1);
//		}else{
//			mon=(d.getMonth()+1);
//		}
//		if(d.getDate()<10){
//			day="0"+(d.getDate());
//		}else{
//			day=d.getDate();
//		}
//		
//	$(".on p").text(d.getFullYear()+"-"+mon+"-"+day);
//	
//          	//选框
//          setTimeout(function  () {
//				$(".check li").click(function  () {
//					$(this).siblings().find("img").fadeOut(0);
//					$(this).siblings().css("border-color","#b0b0b0");
//					$(this).find("img").fadeIn(0);
//					$(this).css("border-color","#017d7b");
//				})
//          },100)
//})
function chooseDate (options,callback,time) {//
	var nowtime=null;
    if(options.now=="auto"){
    	var show_month=new Date().getMonth()+1;
            if(show_month<10){
            	show_month="0"+show_month;
            }
            var show_day=new Date().getDate();
            if(show_day<10){
            	show_day="0"+show_day;
            }
    	options.now=new Date().getFullYear()+
        "-"+show_month+
        "-"+show_day
    	if(time){
    		var show_hour=new Date().getHours();
            if(show_hour<10){
            	show_hour="0"+show_hour;
            }
    		var show_minute=new Date().getMinutes();
            if(show_minute<10){
            	show_minute="0"+show_minute;
            }
            var show_second=new Date().getSeconds();
            if(show_second<10){
            	show_second="0"+show_second;
            }
    		options.now+=("  "+show_hour+":"+show_minute+":"+show_second);
    	}
    }
    document.querySelector(options.ele+" span").textContent=options.now;
    document.querySelector(options.ele).addEventListener('tap', function() { 
    	
    	var _this=$(this).find("span").get(0);
    	if(_this.textContent.length>4){
    		options.now=_this.textContent.split(" ")[0];
    		if(time) nowtime=_this.textContent.split(" ")[_this.textContent.split(" ").length-1];
    	}
        var dDate = new Date();
    	var y=options.now.split("-")[0],m=options.now.split("-")[1]-1,d=options.now.split("-")[2];
        dDate.setFullYear(y,m ,d ); 
        
        var minDate = new Date(); 
        minDate.setFullYear(options.minDate.split("-")[0],options.minDate.split("-")[1]-1,options.minDate.split("-")[2]); 
        
        var maxDate = new Date(); 
        maxDate.setFullYear(options.maxDate.split("-")[0],options.minDate.split("-")[1]-1,options.minDate.split("-")[2]); 
        
        plus.nativeUI.pickDate(function(e) { 
            var d = e.date; 
            if(time){
            	chooseTime(d);
            }
            else {
            	callback(d);
            }
            var show_month=d.getMonth()+1;
            if(show_month<10){
            	show_month="0"+show_month;
            }
            var show_day=d.getDate();
            if(show_day<10){
            	show_day="0"+show_day;
            }
            if(time){
            }else{            
            	document.querySelector(options.ele+" span").textContent=d.getFullYear()+"-"+show_month+"-"+show_day;
            }
        }, function(e) { 
        }, { 
            title: "请选择日期", 
            date: dDate, 
            minDate: minDate, 
            maxDate: maxDate 
        }); 
    });
    function chooseTime (d) {
    	var dTime =d; 
    	if(nowtime!=null){
        	dTime.setHours(parseInt(nowtime.split(":")[0]),parseInt(nowtime.split(":")[1]),0); 
        }
        plus.nativeUI.pickTime(function(e) { 
            var d = e.date;
            d.setFullYear(dTime.getFullYear(),dTime.getMonth(),dTime.getDate());
            callback(d);
            var show_month=d.getMonth()+1;
            if(show_month<10){
            	show_month="0"+show_month;
            }
            var show_day=d.getDate();
            if(show_day<10){
            	show_day="0"+show_day;
            }
			document.querySelector(options.ele+" span").textContent=d.getFullYear()+"-"+show_month+"-"+show_day;
            
            var show_hour=d.getHours();
            if(show_hour<10){
            	show_hour="0"+show_hour;
            }
    		var show_minute=d.getMinutes();
            if(show_minute<10){
            	show_minute="0"+show_minute;
            }
//          var show_second=d.getSeconds();
//          if(show_second<10){
//          	show_second="0"+show_second;
//          }
        	document.querySelector(options.ele +" span").textContent
        	+=" "+show_hour+":"+show_minute
        	+":00";
        }, function(e) {
        }, { 
            title: "请选择时间", 
            is24Hour: true, 
            time: dTime 
        }); 
    }
    function dateformat(time, formateStr) { //author: meizz
		var date;
		if(!formateStr) formateStr = "yyyy-MM-dd";
		if(time) {
			date = new Date(time);
		}
		else date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var h = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		formateStr = formateStr.replace("yyyy", "" + year);
		formateStr = formateStr.replace("MM", "" + month > 9 ? month : "0" + month);
		formateStr = formateStr.replace("dd", "" + day > 9 ? day : "0" + day);
		formateStr = formateStr.replace("HH", "" + h > 9 ? h : "0" + h);
		formateStr = formateStr.replace("mm", "" + min > 9 ? min : "0" + min);
		formateStr = formateStr.replace("ss", "" + sec > 9 ? sec : "0" + sec);
		return formateStr;
	}

	function dateConvert(d) {
		return dateformat(d, "yyyy-MM-dd HH:mm:ss")
	}
}