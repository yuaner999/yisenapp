//这个js用来判断首页四个子页按返回两次退出app
appExit();

function appExit() {
	var first = null;
	if(!mui) return;
	mui.back = function() {
		//首次按键，提示‘再按一次退出应用’
		if(!first) {
			first = new Date().getTime();
			mui.toast('再按一次退出应用');
			setTimeout(function() {
				first = null;
			}, 1000);
		} else {
			if(new Date().getTime() - first < 1000) {
				plus.runtime.quit();
				db.transaction(function(tx) {
					tx.executeSql("delete from controlManage where id='localUserId'", [], function(tx, data) {

					});
				});
			}
		}
	}
}