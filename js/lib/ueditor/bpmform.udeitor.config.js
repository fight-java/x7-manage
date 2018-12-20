(function() {

	var URL = window.UEDITOR_HOME_URL || getUEBasePath();
	/**
	 * 配置项主体。注意，此处所有涉及到路径的配置别遗漏URL变量。
	 */
	window.UEDITOR_CONFIG = {

		// 为编辑器实例添加一个路径，这个不能被注释
		UEDITOR_HOME_URL : URL

		// 服务器统一请求接口路径
		,
		toolbars : [
		[ 'source', '|', 'undo', 'redo', '|', 'bold', 'italic', 'underline',
				'strikethrough', 'superscript', 'subscript', 'removeformat',
				'formatmatch', 'blockquote', 'pasteplain', '|', 'forecolor',
				'backcolor', 'insertorderedlist', 'insertunorderedlist',
				'selectall', 'cleardoc', '|', 'rowspacingtop',
				'rowspacingbottom', 'lineheight', '|', 'customstyle',
				'paragraph', 'fontfamily', 'fontsize', '|',
				'directionalityltr', 'directionalityrtl', 'indent', '|',
				'justifyleft', 'justifycenter', 'justifyright',
				'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
				'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft',
				'imageright', 'imagecenter', '|', 'insertframe', 'pagebreak',
				'|', 'horizontal', 'spechars', '|', 'inserttable',
				'deletetable', 'insertparagraphbeforetable', 'insertrow',
				'insertrownext', 'deleterow', 'insertcol', 'insertcolnext',
				'deletecol', 'mergecells', 'mergeright', 'mergedown',
				'splittocells', 'splittorows', 'splittocols', '|',
				'searchreplace', '|', 'pasteinput', 'tableformat','applytableformat',
				'choosetemplate', 'opinion', 'input', '|', 'taskopinion',
				'flowchart', 'insertfunction', 'cutsubtable', 'pastesubtable',
				'customquery', 'uncustomquery', 'numbervalidate', 'help' ]

		],
		elementPathEnabled : false,
		iframeCssUrl : URL +(formType != 'mobile'? '/themes/formIframe.css':'/themes/mobileFormIframe.css') // 给编辑器内部引入一个css文件
		,
		autoClearEmptyNode : false,
		enableAutoSave : false,
		allowDivTransToP : false,
		autoHeightEnabled : false
	};

	function getUEBasePath(docUrl, confUrl) {

		return getBasePath(docUrl || self.document.URL || self.location.href,
				confUrl || getConfigFilePath());

	}

	function getConfigFilePath() {

		var configPath = document.getElementsByTagName('script');

		return configPath[configPath.length - 1].src;

	}

	function getBasePath(docUrl, confUrl) {

		var basePath = confUrl;

		if (/^(\/|\\\\)/.test(confUrl)) {

			basePath = /^.+?\w(\/|\\\\)/.exec(docUrl)[0]
					+ confUrl.replace(/^(\/|\\\\)/, '');

		} else if (!/^[a-z]+:/i.test(confUrl)) {

			docUrl = docUrl.split("#")[0].split("?")[0]
					.replace(/[^\\\/]+$/, '');

			basePath = docUrl + "" + confUrl;

		}

		return optimizationPath(basePath);

	}

	function optimizationPath(path) {

		var protocol = /^[a-z]+:\/\//.exec(path)[0], tmp = null, res = [];

		path = path.replace(protocol, "").split("?")[0].split("#")[0];

		path = path.replace(/\\/g, '/').split(/\//);

		path[path.length - 1] = "";

		while (path.length) {

			if ((tmp = path.shift()) === "..") {
				res.pop();
			} else if (tmp !== ".") {
				res.push(tmp);
			}

		}

		return protocol + res.join("/");

	}

	window.UE = {
		getUEBasePath : getUEBasePath
	};

})();
