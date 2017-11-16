function sendBtn (idx,callback) {
	var t=61;var timer;
	$(".formRow .abs").eq(idx-1).click(function  () {
		$(this).attr("disabled","disabled");
		clearInterval(timer);
		timer=setInterval(loop,1000);
		if(callback) callback();
	});
	function loop () {
		ele=$(".formRow .abs").eq(idx-1);
		t--;
		$(ele).text("重新发送("+t+"s)");
		if(t<=0){
			t=61;
			$(ele).removeAttr("disabled");
			$(ele).text("发送验证码");
		}
	}
}
