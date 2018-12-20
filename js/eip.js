$(document).ready(function () {
	// jQuery的ajax请求的全局配置
	$.ajaxSetup({
	　　　//发送请求前触发
	　　　beforeSend: function (xhr) {
			var handleUrl = function(url){
				var reg = /^(\$\{(\w+)\})\/.*$/,
					ctx = getContext(),
					match = reg.exec(url);
				if (match != null) {
					var name = match[2],
						mc = match[1],
						val = ctx[name];
					if(!val){
						throw new Error("The '"+name+"' in url:" + url + " does not defined in context provider." );
					}
					return url.replace(mc, val);
				}
				else {
					return url;
				}
			}
		
			try {
				this.url = handleUrl(this.url);
				//可以设置自定义标头
				var currentUserInfo = $.parseJSON(window.sessionStorage['ngStorage-currentUser']);
				var uname = currentUserInfo.username;
				var token = currentUserInfo.token;
			　　　　xhr.setRequestHeader('Authorization', 'Bearer ' + token);
			} catch (e) {}
	　　　　},
	});
});

// Minimalize menu when screen is less than 768px
$(window).bind("load resize", function () {
    if ($(document).width() < 769) {
        $('body').addClass('body-small')
    } else {
        $('body').removeClass('body-small')
    }
});

