;(function() {
	'use strict';
	var scrollBarWidth;
	// 固定列头的位置，并计算表格的高度适配当前页面的高度
	function calcTableBodyHeight(p){
		if(!scrollBarWidth){
			// 获取当前浏览器的滚动条的宽度
			scrollBarWidth = $.scrollbarWidth()
		}
		var ibox = p,
			iboxHeight = $(window).height() -151,
			iboxTarget = ibox.attr("target");
		if(iboxTarget){
			var targetParent = ibox.parents("." + iboxTarget);
			if(targetParent && targetParent.length > 0 && targetParent.height() > 0){
				targetParent.css('overflow','hidden');
				iboxHeight = targetParent.height();
			}
		}
		var adjust = ibox.attr("adjust");
		if(adjust){
			adjust = Number(adjust);
			if(!Number.isNaN(adjust)){
				iboxHeight += adjust;
			}
		}
		var titleHeight = ibox.find(".ibox-title").outerHeight() | 0,
			contentHeight = ibox.find(".ibox-content").is(":visible") ? (ibox.find(".ibox-content").outerHeight() | 0) : 0,
			footerHeight = iboxHeight - titleHeight - contentHeight,
			paginationHeight = ibox.find("div[ht-pagination]").outerHeight() | 0,
			tableHeadHeight = ibox.find(".table-head").outerHeight() | 0,
			tabHeight = ibox.find(".nav-tabs").outerHeight() | 0,
			tableBodyHeight = footerHeight - tableHeadHeight - paginationHeight - tabHeight - 10;
		// 设置表格的高度
		ibox.find(".table-body").height(tableBodyHeight);
		if(ibox.find(".table-body").hasScrollBar()){
			// 当有滚动条时，列头右内边距为一个滚动条的宽度
			ibox.find(".table-head").css("padding-right", (scrollBarWidth + 0.5) + "px");
		}
		else{
			// 没有滚动条时，列头右内边距为0
			ibox.find(".table-head").css("padding-right", "0");
		}
	}
	
	function dataTablePerformance(p, force) {
		p.find("[ht-data-table]").each(function(){
			var me = $(this),
				calcTag = me.data("calcTableBody");
			
			if(!calcTag){
				var scope = me.scope();
				if(scope){
					scope.$on("dataTable:query:complete", function(){
						setTimeout(function(){
							calcTableBodyHeight(me);
						}, 100);
					});
				}
				
				me.bind("resize", function(){
					calcTableBodyHeight(me);
				});
				me.data("calcTableBody", true);
			}
			force && (calcTableBodyHeight(me));
		});
	}

	$(function(){
		$("body").ready(function(t){
			var that = $(this),
				$root = that.scope().$root;
			$root.$on("dataTable:ready", function(){
				dataTablePerformance(that);
			});
			
			$root.$on("layer:resizing", function(t, l){
				dataTablePerformance(l, true);
			});
		});
		
		$(window).bind("resize", function(){
			dataTablePerformance($("body"), true);
		});
	});
})();