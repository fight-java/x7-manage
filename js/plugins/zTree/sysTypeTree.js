var SysTypeTree = function($this, options) {
	/**
	 * 加载树
	 */
	this.loadTree = function() {
		var opts = this.options, url = opts.url, params = {
			typeKey : opts.typeKey
		}, depth = opts.depth, setting = {
			data : {
				key : {
					name : opts.nameKey
				},
				simpleData : {
					enable : true,
					idKey : 'id',
					pIdKey : 'parentId',
					typeKey : opts.typeKey,
					rootPId : 1
				}
			},
			view : {
				showIconFont : true
			},
			callback : {
				onClick : opts.onClick,
				onRightClick : opts.onRightClick
			}
		};
		if (opts.setting)
			setting = $.extend(true, {}, setting, opts.setting);
		if (!opts.treeList) {
			$.post(url, params, function(result) {
				if (opts.rootField)
					result = result[opts.rootField];
				for (var i = 0; i < result.length; i++) {
					var node = result[i];
					if (node.parentId == '-1') {
						node.icon = "fa fa-home";
						node.isRoot = 1;
					}
				}
				initTree(result);
			});
		} else {
			initTree(opts.treeList);
		}
		function initTree(result) {
			// 初始化数据
			tree = $.fn.zTree.init($this, setting, result);

			// 展开层级
			if (depth != null && depth >= 0) {
				var nodes = tree.getNodesByFilter(function(node) {
					return (node.level == depth);
				});
				if (nodes.length > 0) {
					for (var idx = 0; idx < nodes.length; idx++) {
						tree.expandNode(nodes[idx], false, false);
					}
				}
			} else {
				tree.expandAll(true);
			}
			if (typeof opts.onLoaded == 'function') {
				opts.onLoaded.call($this, tree);
			}
		}
	};
	/**
	 * 展开收起 type: true 是展开，false是默认
	 */
	this.expandAll = function(type) {
		tree.expandAll(type);
	};
	this.defaults = {
		url : "http://localhost:8080/bo/def/v1/getTree",
		depth : null, // 展开深度
		onClick : null,
		onRightClick : null,
		nameKey : 'name',
		typeKey : 'type'
	};
	this.getTree = function() {
		return tree;
	}
	// 初始化加载数据
	{
		this.tree = null;
		this.options = $.extend({}, this.defaults, options);
		this.loadTree();
	}
};

/**
 * 常用的流程分类树的构建，主要是填写了默认的配置项
 * 目前用于：流程定义，代办事宜，已办事宜，抄送转发事宜，新建流程，我的请求，我的办结，我的草稿，转办代理事宜，我的抄送转发
 */
var CommonFlowTree = function($this) {
	var opt = {
		typeKey : __CAT_FLOW,
		onClick : function(event, treeId, treeNode) {
			var param = {};
			if (treeNode.isRoot != 1) {
				param = {
					'Q^type_id_^L' : treeNode.id
				};
				$("input[name='Q^type_id_^L']").val(treeNode.id);
			} else {
				$("input[name='Q^type_id_^L']").val("");
			}
			$('#grid').bootstrapTable('refresh', param);
		}
	};
	return new SysTypeTree($this,opt);
}
