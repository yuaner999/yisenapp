$(function  () {
	//初始化所有带切换的元素
	activeInit();
	listenerKeyDown();
});
function activeInit () {
	var parents=$(".active").parent();
	var eles=parents.children();
	eles.each(function  () {
		$(this).on("tap",function  () {
			$(this).addClass("active");
			$(this).siblings().removeClass("active");
		});
	});
}
function tab (ele,acEle) {
	$(ele).children().on("click",function  () {
		$(this).addClass("active");
		$(this).siblings().removeClass("active");
	})
	if(!acEle) return;
	$(ele).children().click(function  () {
		$(acEle).removeClass("active");
		$(acEle).eq($(this).index()).addClass("active");
	});
}
//文字监听
function listenerKeyDown () {
	if(!$(".txtBox").length) return;
	$(".txtBox").find("textarea").keyup(fn);
}
function fn (e,thi) {
	if(!thi) thi=$(this);
	var length=$(thi).val().length;
	$(thi).next().children().eq(0).text(length);
}