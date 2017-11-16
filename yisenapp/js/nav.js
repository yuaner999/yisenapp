$(function  () {
	//导航变色
	$(".head li:not(.last)").click(function  () {
		for(i=0;i<$(".head li").length;i++){
			if($(".head li").eq(i).text()==$(this).text()){
				var now=i;
			}
		}
		$(".head li:last-child").stop(true).animate({left:now*4.95-0.075+"rem"},300);
		$(this).siblings().removeClass("ani");
		$(this).siblings().addClass("end");
		$(this).removeClass("end");
		$(this).addClass("ani");
	})
	//清除警报弹窗
	$(".delete").click(function  () {
		if($(".list li").length!=0){
			$(".black,.window").fadeIn(0);
		}
	})
	$(".window button").click(function  () {
		if($(this).text()=="确认"){
			$(".list li").remove();
		}
		$(".black,.window").fadeOut(0);
	})
	//
	$(".list li ol li:first-child").click(function  () {
		$(this).text("已检修");
		$(this).css({"background":"#fff","color":"#45c2bc","letter-spacing":"0.025rem","padding-right":"0.55rem"});
	}
	)
	$(".list>li>div>ol>li:last-child").click(function  () {
			$(this).parents("li").remove();
	})
})
