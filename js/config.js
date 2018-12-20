function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider
		, IdleProvider, KeepaliveProvider, $translateProvider) {
    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(120); // in seconds
    
    // 不使用默认首页的配置，通过AuthenticationService.loadDefaultPage()来加载默认页面
    //$urlRouterProvider.otherwise("/home");

    $ocLazyLoadProvider.config({
        debug: false
    });
    
    window.stateProvider = $stateProvider; 
    
    $stateProvider
	    .state('login', {
	        url: "/login",
	        templateUrl: "views/login.html",
	        data: { pageTitle: '欢迎登陆', specialClass: 'gray-bg' }
	    })
	    .state('welcome', {
            url: "/welcome",
            templateUrl: "views/welcome.html",
            data: { pageTitle: '欢迎使用超智慧IBE系统', specialClass: 'gray-bg' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/ngclipboard/clipboard.min.js']
                        },
                        {
                            name: 'ngclipboard',
                            files: ['js/plugins/ngclipboard/ngclipboard.min.js']
                        }
                    ]);
                }
            }
        })
        .state('error', {
            url: "/systemError",
            templateUrl: "views/common/error.html",
            data: { pageTitle: '系统异常', specialClass: 'gray-bg' }
        })
	    .state('standard', {
	        abstract: true,
	        url: "/standard",
	        templateUrl: "views/common/content.html"
	    })
	    .state('home', {
	    	url: "/home",
	    	templateUrl: "views/home.html",
	    	data: {pageTitle: '首页', specialClass: 'fixed-sidebar'},
	    	resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/plugins/slimscroll/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							name: 'portal',
							files: ['js/portal/portalControllers.js']
						},
						{
							name: 'flow',
							files: ['js/flow/flowControllers.js']
						}
					]);
				}
			}
	    })
	    .state('standard.table', {
	        url: "/table",
	        templateUrl: "views/table_bootstrap.html",
	        data: { pageTitle: '列表', specialClass: 'fixed-sidebar' },
	        resolve: {
	            loadPlugin: function ($ocLazyLoad) {
	                return $ocLazyLoad.load([
	                    {
	                        serie: true,
	                        files: [
	                        	  'js/plugins/daterangepicker/daterangepicker.js', 
	                        	  'css/plugins/daterangepicker/daterangepicker-bs3.css',
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
	                              
                            ]
	                    },
	                    {
                            name: 'daterangepicker',
                            files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
                        }
	                ]);
	            }
	        }
	    })
	    .state('standard.tree_table', {
            url: "/tree_table",
            templateUrl: "views/table_tree.html",
            data: { pageTitle: '左树右列表', specialClass: 'fixed-sidebar' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                    	{
	                        serie: true,
	                        files: [
	                        	  'js/plugins/daterangepicker/daterangepicker.js', 
	                        	  'css/plugins/daterangepicker/daterangepicker-bs3.css',
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js',
	                              'css/plugins/zTree/metroStyle.css',
	                              'js/plugins/zTree/jquery.ztree.min.js'
                            ]
	                    },
	                    {
                            name: 'ngZtree',
                            files: ['js/plugins/zTree/ng-ztree.js']
                        },
	                    {
                            name: 'daterangepicker',
                            files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
                        }
                    ]);
                }
            }
        })
        .state('standard.message', {
	        url: "/message",
	        templateUrl: "views/message.html",
	        data: { pageTitle: '信息提示', specialClass: 'fixed-sidebar' },
	        resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                    	{
	                        serie: true,
	                        files: [
	                              'css/plugins/zTree/metroStyle.css',
	                              'js/plugins/zTree/jquery.ztree.min.js'
                            ]
	                    },
						{
                            name: 'ui.codemirror',
                            files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
                        },
	                    {
                            name: 'ngZtree',
                            files: ['js/plugins/zTree/ng-ztree.js']
                        }
                    ]);
                }
            }
	    })
	    .state('bo-detail', {
	    	url: "/bo-detail",
			templateUrl: "views/bo/bo-detail.html",
			data: {pageTitle: '业务对象详情'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							name: 'bo',
							files: ['js/app/bo-controller.js']
						}
					]);
				}
			}
	    })
	    .state('bo-selector', {
	    	url: "/bo-selector",
			templateUrl: "views/selector/bo-selector.html",
			data: {pageTitle: '选择业务对象'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'js/plugins/daterangepicker/daterangepicker.js', 
	                        	  'css/plugins/daterangepicker/daterangepicker-bs3.css',
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	     .state('script-selector', {
	    	url: "/script-selector",
			templateUrl: "views/selector/script-selector.html",
			data: {pageTitle: '选择常用脚本'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('icons-selector', {
	    	url: "/icons-selector",
			templateUrl: "views/sys/resources/resourcesIcons.html",
			data: {pageTitle: '选择图标'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
						    serie: true,
						    files: [
						    	  'font-awesome/css/font-awesome.min.css'
						    ]
						},
						{
							name: 'system',
							files: ['js/sys/systemControllers.js']
						}
					]);
				}
			}
	    })
	    .state('systype-selector', {
	    	url: "/systype-selector",
			templateUrl: "views/selector/systype-selector.html",
			data: {pageTitle: '选择分类'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
        .state('customQueryShow', {
            url: "/customQueryShow",
            templateUrl: "views/form/customquery/customQueryShow.html",
            data: {pageTitle: '自定义SQL查询预览'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/plugins/daterangepicker/daterangepicker.js',
                                'css/plugins/daterangepicker/daterangepicker-bs3.css',
                                'css/common.table.css',
                                'js/util/util.js',
                                'js/base/tableFixedHeight.js'
                            ]
                        },
                        {
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
                    ]);
                }
            }
        })
        .state('form.querySetting', {
            url: "/querySetting",
            templateUrl: "views/form/customquery/customDialogSetting.html",
            data: {pageTitle: '自定义SQL查询设置列'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/plugins/daterangepicker/daterangepicker.js',
                                'css/plugins/daterangepicker/daterangepicker-bs3.css',
                                'css/common.table.css',
                                'js/util/util.js',
                                'js/base/tableFixedHeight.js'
                            ]
                        },
                        {
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
                    ]);
                }
            }
        })
	     .state('customDialogShow', {
	    	url: "/customDialogShow",
			templateUrl: "views/form/customDialog/customDialogShowList.html",
			data: {pageTitle: '自定义对话框列表预览功能'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'js/plugins/daterangepicker/daterangepicker.js', 
	                        	  'css/plugins/daterangepicker/daterangepicker-bs3.css',
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
	                    {
							name: 'form',
							files: ['js/form/formControllers.js']
						},
						{
						    name: 'daterangepicker',
						    files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
						  }
					]);
				}
			}
	    })
        .state('paramDialog', {
            url: "/paramDialog",
            templateUrl: "views/form/customDialog/paramDialog.html",
            data: {pageTitle: '参数对话框'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/plugins/daterangepicker/daterangepicker.js',
                                'css/plugins/daterangepicker/daterangepicker-bs3.css',
                                'css/common.table.css',
                                'js/util/util.js',
                                'js/base/tableFixedHeight.js'
                            ]
                        },
                        {
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
                    ]);
                }
            }
        })
        .state('customDialogShowTree', {
            url: "/customDialogShowTree",
            templateUrl: "views/form/customDialog/customDialogShowTree.html",
            data: {pageTitle: '自定义对话框树形预览功能'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/plugins/daterangepicker/daterangepicker.js',
                                'css/plugins/daterangepicker/daterangepicker-bs3.css',
                                'css/common.table.css',
                                'css/plugins/zTree/metroStyle.css',
                                'js/plugins/zTree/jquery.ztree.min.js',
                                'js/plugins/zTree/jquery.ztree.excheck.min.js',
                                'js/util/util.js',
                                'js/base/tableFixedHeight.js'
                            ]
                        },
                        {
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
                    ]);
                }
            }
        })
	    .state('user-selector', {
	    	url: "/user-selector",
			templateUrl: "views/selector/user-selector.html",
			data: {pageTitle: '选择用户'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('system.pdf', {
            url: "/pdf/:data",
            templateUrl: "views/sys/file/Previews/pdf.html",
            data: {pageTitle: 'PDF预览'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/portal/jquery.base64.js'
                            ]
                        },
                        {
                            name: 'previews',
                            files: ['js/sys/previews.js']
                        }
                    ]);
                }
            }
        })
        .state('system.txt', {
            url: "/txt/:data",
            templateUrl: "views/sys/file/Previews/txt.html",
            data: {pageTitle: '文本文件预览'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/portal/jquery.base64.js'
                            ]
                        },
                        {
                            name: 'previews',
                            files: ['js/sys/previews.js']
                        }
                    ]);
                }
            }
        })
        .state('system.html', {
            url: "/html/:data",
            templateUrl: "views/sys/file/Previews/html.html",
            data: {pageTitle: 'html预览'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/portal/jquery.base64.js'
                            ]
                        },
                        {
                            name: 'previews',
                            files: ['js/sys/previews.js']
                        }
                    ]);
                }
            }
        })
        .state('system.media', {
            url: "/media/:data",
            templateUrl: "views/sys/file/Previews/media.html",
            data: {pageTitle: '多媒体文件预览'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/x5/plyr/plyr.js',
                                'js/x5/plyr/plyr.css',
                                'js/portal/jquery.base64.js'
                            ]
                        }+
                        {
                            name: 'previews',
                            files: ['js/sys/previews.js']
                        }
                    ]);
                }
            }
        })
        .state('system.picture', {

            url: "/picture/:data",
            templateUrl: "views/sys/file/Previews/picture.html",
            data: {pageTitle: '图片预览'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'js/x5/pdfjs/viewer.min.js',
                                'css/viewer.min.css',
                                'js/portal/jquery.base64.js'
                            ]
                        },
                        {
                            name: 'previews',
                            files: ['js/sys/previews.js']
                        }
                    ]);
                }
            }
        })
	    
	    .state('org-selector', {
	    	url: "/org-selector",
			templateUrl: "views/selector/org-selector.html",
			data: {pageTitle: '选择组织'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('pos-selector', {
	    	url: "/pos-selector",
			templateUrl: "views/selector/pos-selector.html",
			data: {pageTitle: '选择岗位'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('job-selector', {
	    	url: "/job-selector",
			templateUrl: "views/selector/job-selector.html",
			data: {pageTitle: '选择职务'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('index-auth', {
	    	url: "/index-auth",
			templateUrl: "views/selector/index-auth.html",
			data: {pageTitle: '授权管理'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'portal',
	 							files: ['js/portal/portalControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('role-selector', {
	    	url: "/role-selector",
			templateUrl: "views/selector/role-selector.html",
			data: {pageTitle: '选择角色'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('dem-selector', {
	    	url: "/dem-selector",
			templateUrl: "views/selector/dem-selector.html",
			data: {pageTitle: '维度选择器'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
        .state('outlook', {
            url: "/outlook",
            templateUrl: "views/outlook.html",
            data: { pageTitle: 'Outlook view', specialClass: 'fixed-sidebar' }
        })
		
		//maoww begin
	    .state('customDialog', {
			url: "/customDialog",
			templateUrl: "views/portal/customDialogList.html",
			data: { pageTitle: '自定义查询' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								'css/common.table.css',
								'js/util/util.js',
								'js/base/tableFixedHeight.js'
							]
						},
						{
							name: 'portal',
							files: ['js/portal/portalControllers.js']
						}
					]);
				}
			}
		})
	    .state('getTempPC', {
	    	url: "/getTempPC",
			templateUrl: "views/portal/sysIndexColumnGetTemp.html",
			data: {pageTitle: '栏目预览'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/plugins/slimscroll/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							name: 'portal',
							files: ['js/portal/portalControllers.js']
						}
					]);
				}
			}
	    })
	    .state('preview', {
	    	url: "/preview",
			templateUrl: "views/portal/portalShow.html",
			data: {pageTitle: '栏目预览'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/plugins/slimscroll/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							name: 'portal',
							files: ['js/portal/portalControllers.js']
						}
					]);
				}
			}
	    })
		.state('addParams', {
	    	url: "/addParams",
			templateUrl: "views/portal/sysIndexColumnSetParam.html",
			data: {pageTitle: '参数设置'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							name: 'portal',
							files: ['js/portal/portalControllers.js']
						}
					]);
				}
			}
	    })
	    .state('sysIndexColumn-detail', {
	    	url: "/sysIndexColumn-detail",
			templateUrl: "views/portal/sysIndexColumnGet.html",
			data: {pageTitle: '首页栏目详情'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							name: 'portal',
							files: ['js/portal/portalControllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('meetingRoomEdit', { 
	    	url: "/meetingRoomEdit",
			templateUrl: "views/portal/meetingroom/meetingRoomEdit.html",
			data: {pageTitle: '编辑会议室'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/portal/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							 name: 'meetingRoom',
						     files: ['js/portal/meetingroom/meetingRoomcontrollers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('meetingRoomGet', {
	    	url: "/meetingRoomGet",
			templateUrl: "views/portal/meetingroom/meetingRoomGet.html",
			data: {pageTitle: '查看会议室'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/portal/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							 name: 'meetingRoom',
						     files: ['js/portal/meetingroom/meetingRoomcontrollers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('messageTypeEdit', {
	    	url: "/messageTypeEdit",
			templateUrl: "views/portal/messagetype/messageTypeEdit.html",
			data: {pageTitle: '编辑新闻分类'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/portal/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							name: 'messageType',
						    files: ['js/portal/messagetype/messageTypecontrollers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('messageTypeGet', {
	    	url: "/messageTypeGet",
			templateUrl: "views/portal/messagetype/messageTypeGet.html",
			data: {pageTitle: '查看新闻分类'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								 'js/util/util.js',
								 'js/portal/jquery.blockUI.min.js',
	                        	 'js/portal/jquery.slimscroll.min.js',
	                        	 'js/portal/jquery.base64.js'
							]
						},
						{
							name: 'messageType',
						    files: ['js/portal/messagetype/messageTypecontrollers.js']
						}
					]);
				}
			}
	    })
	    
		//maoww  end

		//leij begin
		.state('log', {
				abstract: true,
				url: "/log",
				templateUrl: "views/common/content.html",
			})
		.state('dataSource', {
				abstract: true,
				url: "/dataSource",
				templateUrl: "views/common/content.html",
			})
		
		//form start
		.state('form', {
				abstract: true,
				url: "/form",
				templateUrl: "views/common/content.html",
			})

		.state('form.boEnt', {
			url: "/boEnt",
			templateUrl: "/manage/views/bo/boEntList.html",
			data: { pageTitle: '实体管理', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								'css/common.table.css',
								'js/util/util.js',
								'js/base/tableFixedHeight.js',
								'css/plugins/zTree/metroStyle.css',
						        'js/plugins/zTree/jquery.ztree.min.js'
							]
						},{
                           name: 'ngZtree',
                           files: ['js/plugins/zTree/ng-ztree.js']
                       },
						{
							name: 'bo',
							files: ['js/form/boEntControllers.js']
						}
					]);
				}
			}
		})
		.state('form.entExtEdit', {
	    	url: "/boEntExtEdit",
			templateUrl: "views/form/model/bOEntExtEdit.html",
			data: {pageTitle: '外部表'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								'css/common.table.css',
								'js/util/util.js',
								'js/base/tableFixedHeight.js'
							]
						},
						{
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
					]);
				}
			}
	    })
		.state('form.templateEdit', {
			url: "/templateEdit",
			templateUrl: "views/form/template/formTemplateEdit.html",
			data: { pageTitle: '表单模板编辑', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							name: 'form',
							files: ['js/form/formControllers.js']
						},
						{
                            name: 'ui.codemirror',
                            files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
                        }
					]);
				}
			}
		})
		.state('dialogParamSet', {
            url: "/dialogParamSet",
            templateUrl: "views/form/customDialog/customDialogParamSet.html",
            data: { pageTitle: '参数模板设置', specialClass: 'fixed-sidebar' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
                    ]);
                }
            }
        })
	    .state('mathExpEditor', {
	    	url: "/mathExpEditor",
			templateUrl: "views/form/formDesign/dragMathExpEditor.html",
			data: {pageTitle: '统计函数设计对话框',specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'css/x5/expression.css',
									'js/base/tableFixedHeight.js',
						        	'js/util/util.js',
						        	'css/plugins/zTree/metroStyle.css',
	                                'js/plugins/zTree/jquery.ztree.min.js',
	 								'js/plugins/zTree/ztreeCreator.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js'
	 							]
	 						},
	 						{
	 							name: 'formDesign',
	 							files: ['js/form/formDesignListControllers.js']
	 						},
	 						{
	 						    name: 'ngZtree',
	 						    files: ['js/plugins/zTree/ng-ztree.js']
	 						}
	 					]);
				}
			}
	    })
	    .state('form-queryGanged', {
	    	url: "/formQueryGanged",
			templateUrl: "views/form/formDesign/queryGanged.html",
			data: {pageTitle: '关联设置',specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							name: 'formDesignApp',
	 							files: ['js/formDesign/formDesignController.js']
	 						}
	 					]);
				}
			}
	    })
        .state('opinionPage', {
            url: "/opinionPage",
            templateUrl: "views/form/formDesign/opinionPage.html",
            data: {pageTitle: '意见'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'css/common.table.css',
                                'js/util/util.js',
                                'js/base/tableFixedHeight.js'
                            ]
                        },
                        {
                            name: 'formDesignApp',
                            files: ['js/formDesign/formDesignController.js']
                        }
                    ]);
                }
            }
        })
		//form end
		//system  start
		.state('system', {
				abstract: true,
				url: "/system",
				templateUrl: "views/common/content.html",
			})
		.state('file-upload', {
	    	url: "/fileUpload",
			templateUrl: "views/sys/file/uploadDialog.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
								name: 'system',
								files: ['js/sys/systemControllers.js']
							},
	 						{
	 							name: 'angularFileUpload',
	 							files: ['js/lib/angular/angular-file-upload.js']
	 						}
	 					]);
				}
			}
	    })
		
		//flow start
	    
	    .state('flow-import', {
	    	url: "/flowImport",
			templateUrl: "views/flow/selector/flowUploadDialog.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						},
	 						{
	 							name: 'angularFileUpload',
	 							files: ['js/lib/angular/angular-file-upload.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-hrScriptSelect', {
	    	url: "/hrScriptSelect",
			templateUrl: "views/flow/selector/bpmHrScriptSelect.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 							{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'css/x5/expression.css',
									'js/base/tableFixedHeight.js',
									'js/util/util.js',
									'css/plugins/zTree/metroStyle.css',
									'js/plugins/zTree/jquery.ztree.min.js',
									'js/plugins/zTree/ztreeCreator.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })

		.state('flow-hisVersionDetail', {
	    	url: "/flow-hisVersionDetail",
			templateUrl: "views/flow/flowHisVersionDetail.html",
			data: {pageTitle: '流程历史详细'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    .state('flow-nodeBtnSetting', {
	    	url: "/flow-nodeBtnSetting",
			templateUrl: "views/flow/flowNodeBtnSetting.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-nodeJumpRule', {
	    	url: "/flow-nodeJumpRule",
			templateUrl: "views/flow/flowNodeJumpRule.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-nodeScript', {
	    	url: "/flow-nodeScript",
			templateUrl: "views/flow/flowNodeScript.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js',
	 								 'css/plugins/zTree/metroStyle.css',
	                                 'js/plugins/zTree/jquery.ztree.min.js',
	                                 'js/plugins/zTree/jquery.ztree.excheck.min.js',
	 								 'js/plugins/zTree/ztreeCreator.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-userScriptEdit', {
	    	url: "/flow-userScriptEdit",
			templateUrl: "views/flow/selector/userScriptEdit.html",
			data: {pageTitle: '脚本对话框'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js',
	 								 'css/plugins/zTree/metroStyle.css',
	                                 'js/plugins/zTree/jquery.ztree.min.js',
	                                 'js/plugins/zTree/jquery.ztree.excheck.min.js',
	 								 'js/plugins/zTree/ztreeCreator.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-branchCondition', {
	    	url: "/flow-branchCondition",
			templateUrl: "views/flow/flowBranchCondition.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js',
	 								'css/plugins/zTree/metroStyle.css',
	                                'js/plugins/zTree/jquery.ztree.min.js',
	                                'js/plugins/zTree/jquery.ztree.excheck.min.js',
	 								'js/plugins/zTree/ztreeCreator.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-signConfig', {
	    	url: "/flow-signConfig",
			templateUrl: "views/flow/flowSignConfig.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-nodeEventSetting', {
	    	url: "/flow-nodeEventSetting",
			templateUrl: "views/flow/flowNodeEventSetting.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-autoTask', {
	    	url: "/flow-autoTask",
			templateUrl: "views/flow/flowAutoTask.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js',
	 								'js/lib/ueditor/bpmdef.udeitor.config.js',
									'js/lib/ueditor/ueditor.all.min.js',
									'js/lib/ueditor/lang/zh-cn/zh-cn.js',
									'js/util/util.js',
									'js/base/tableFixedHeight.js',
									'js/lib/ueditor/plugins/flowVar.js',
									'js/lib/ueditor/plugins/flowTitle.js',
									'js/lib/ueditor/plugins/startTime.js',
									'js/lib/ueditor/plugins/startUser.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    
	    .state('flow-taskRemind', {
	    	url: "/flow-taskRemind",
			templateUrl: "views/flow/flowTaskRemind.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js',
	 								'js/lib/ueditor/bpmdef.udeitor.config.js',
									'js/lib/ueditor/ueditor.all.min.js',
									'js/lib/ueditor/lang/zh-cn/zh-cn.js',
									'js/util/util.js',
									'js/base/tableFixedHeight.js',
									'js/lib/ueditor/plugins/flowVar.js',
									'js/lib/ueditor/plugins/flowTitle.js',
									'js/lib/ueditor/plugins/startTime.js',
									'js/lib/ueditor/plugins/startUser.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-nodeUserCondition', {
	    	url: "/flow-nodeUserCondition",
			templateUrl: "views/flow/flowNodeUserCondition.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js',
	 								'js/lib/ueditor/bpmdef.udeitor.config.js',
									'js/lib/ueditor/ueditor.all.min.js',
									'js/lib/ueditor/lang/zh-cn/zh-cn.js',
									'js/util/util.js',
									'js/base/tableFixedHeight.js',
									'js/lib/ueditor/plugins/flowVar.js',
									'js/lib/ueditor/plugins/flowTitle.js',
									'js/lib/ueditor/plugins/startTime.js',
									'js/lib/ueditor/plugins/startUser.js',
									'bpm-editor/lib/jquery/jquery.linkdiv.js',
									'js/flow/bpmNodeRule.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-cusersSelector', {
	    	url: "/flow-cusersSelector",
			templateUrl: "views/flow/selector/cusersSelector.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								 'css/plugins/zTree/metroStyle.css',
	                                 'js/plugins/zTree/jquery.ztree.min.js',
	                                 'js/plugins/zTree/jquery.ztree.excheck.min.js',
	 								 'js/plugins/zTree/ztreeCreator.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-bpmFormSelector', {
	    	url: "/flow-bpmFormSelector",
			templateUrl: "views/flow/selector/bpmFormSelector.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	     .state('flow-userScriptSelector', {
	    	url: "/flow-userScriptSelector",
			templateUrl: "views/flow/selector/userScriptSelector.html",
			data: {pageTitle: '人员脚本选择器'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-commonScriptSelector', {
	    	url: "/flow-commonScriptSelector",
			templateUrl: "views/flow/selector/commonScriptSelector.html",
			data: {pageTitle: '常用脚本选择器'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						}
	 					]);
				}
			}
	    })
	    
	     .state('flow-conditionBuild', {
	    	url: "/flow-conditionBuild",
			templateUrl: "views/flow/selector/bpmConditionBuild.html",
			data: {pageTitle: '人员脚本选择器'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js',
	 								'css/flow/conditionBuild.css'
	 							]
	 						}
	 						,
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-bpmDefSelector', {
	    	url: "/flow-bpmDefSelector",
			templateUrl: "views/flow/selector/bpmDefSelector.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('form-bpmDefSelector', {
	    	url: "/form-bpmDefSelector",
			templateUrl: "views/flow/selector/formBpmDefSelector.html",
			data: {pageTitle: '流程选择'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    
	     .state('flow-filedAuthSetting', {
	    	url: "/flow-filedAuthSetting",
			templateUrl: "views/flow/selector/filedAuthSetting.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-endNotify', {
	    	url: "/flow-endNotify",
			templateUrl: "views/flow/procNotifyEdit.html",
			data: {pageTitle: '办结抄送'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('task-toAgree', {
	    	url: "/taskToAgree",
			templateUrl: "views/flow/task/taskToAgree.html",
			data: { pageTitle: '任务审批', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toEndProcess', {
	    	url: "/taskToEndProcess",
			templateUrl: "views/flow/task/taskToEndProcess.html",
			data: { pageTitle: '终止流程', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toDelegate', {
	    	url: "/taskToDelegate",
			templateUrl: "views/flow/task/taskToDelegate.html",
			data: { pageTitle: '任务转办', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toAddSign', {
	    	url: "/taskToAddSign",
			templateUrl: "views/flow/task/taskToAddSignTask.html",
			data: { pageTitle: '添加会签任务', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toTrans', {
	    	url: "/taskToTrans",
			templateUrl: "views/flow/task/taskToTrans.html",
			data: { pageTitle: '任务流转', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toReject', {
	    	url: "/taskToReject",
			templateUrl: "views/flow/task/taskToReject.html",
			data: { pageTitle: '驳回', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-backToStart', {
	    	url: "/taskBackToStart",
			templateUrl: "views/flow/task/taskToReject.html",
			data: { pageTitle: '驳回到发起人', specialClass: 'fixed-sidebar' }
	    })
        .state('flow-image', {
            url: "/flowImage",
            templateUrl: "views/flow/instanceFlowImage.html",
            data: { pageTitle: '流程图', specialClass: 'fixed-sidebar' }
        })
	    .state('task-image', {
	    	url: "/taskImage",
			templateUrl: "views/flow/task/taskImage.html",
			data: { pageTitle: '流程图', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								'css/plugins/qtip/jquery.qtip.min.css',
								'js/util/util.js',
								'js/plugins/qtip/jquery.qtip.min.js'
							]
						}
					]);
				}
			}
	    })
	    .state('task-toDueTime', {
	    	url: "/taskToDueTime",
			templateUrl: "views/flow/task/taskDueTimeEdit.html",
			data: { pageTitle: '任务延期设置', specialClass: 'fixed-sidebar' }
	    })
	    
	    .state('flow-opinions', {
	    	url: "/flowOpinions",
			templateUrl: "views/flow/instanceFlowOpinions.html",
			data: { pageTitle: '审批历史', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-toCopyTo', {
	    	url: "/flow/instance/instanceToCopyTo",
			templateUrl: "views/flow/instanceToCopyTo.html",
			data: { pageTitle: '流程抄送', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-startCommu', {
	    	url: "/taskToCommu",
			templateUrl: "views/flow/task/taskToCommu.html",
			data: { pageTitle: '发起沟通', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-feedBack', {
	    	url: "/taskToFeedBack",
			templateUrl: "views/flow/task/taskToFeedBack.html",
			data: { pageTitle: '沟通反馈', specialClass: 'fixed-sidebar' }
	    })
		.state('flow-formRigthSetting', {
	    	url: "/flow-formRigthSetting",
			templateUrl: "views/flow/flowFormRightSetting.html",
			data: {pageTitle: '设置按钮'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 							]
	 						},
	 						{
	 							name: 'flow',
	 							files: ['js/flow/flowControllers.js']
	 						}
	 					]);
				}
			}
	    })
		.state('flow-msgTemplateEdit', {
			url: "/flow-msgTemplateEdit",
			templateUrl: "views/flow/flowMsgTemplateEdit.html",
			data: { pageTitle: '分管授权', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
									'css/common.table.css',
									'js/util/util.js',
									'js/base/tableFixedHeight.js',
									'js/lib/javacode/codemirror.js',
									'js/lib/javacode/InitMirror.js',
									'js/lib/ueditor/ueditor.config.js',
									'js/lib/ueditor/ueditor.all.min.js',
									'js/lib/ueditor/lang/zh-cn/zh-cn.js',
									'js/util/util.js',
									'js/base/tableFixedHeight.js'
									/*'js/lib/ueditor/plugins/flowVar.js',
									'js/lib/ueditor/plugins/flowTitle.js',
									'js/lib/ueditor/plugins/startTime.js',
									'js/lib/ueditor/plugins/startUser.js'*/
							]
						},
						{
							name: 'flow',
							files: ['js/flow/flowControllers.js']
						}
					]);
				}
			}
		})
		
		.state('flow-msgTemplateGET', {
			url: "/flow-msgTemplateGET",
			templateUrl: "views/flow/flowMsgTemplateGet.html",
			data: { pageTitle: '分管授权', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
								'css/common.table.css',
								'js/util/util.js',
								'js/base/tableFixedHeight.js',
								'css/plugins/zTree/metroStyle.css',
						        'js/plugins/zTree/jquery.ztree.min.js'
							]
						},
						{
							name: 'flow',
							files: ['js/flow/flowControllers.js']
						}
					]);
				}
			}
		})
	    
		 .state('flow-instanceSendNodeUsers', {
	    	url: "/instanceSendNodeUsers",
			templateUrl: "views/flow/instanceSendNodeUsers.html",
			data: { pageTitle: '选择节点人员', specialClass: 'fixed-sidebar' }
	    })
	    
	    
	    .state('flow-instanceSelectDestination', {
	    	url: "/instanceSelectDestination",
			templateUrl: "views/flow/instanceSelectDestination.html",
			data: { pageTitle: '选择跳转路径', specialClass: 'fixed-sidebar' }
	    })
	    
	    
        //flow end 
	    
	    
	    //uc start
	   .state('demoUserEdit', {
	    	url: "/demoUserEdit",
			templateUrl: "views/demo/demoUser/demoUserEdit.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'js/base/tableFixedHeight.js',
						        	'js/util/util.js'
	 							]
	 						},
	 						{
	 							name: 'demoUser',
	 							files: ['js/demo/demoUser/demoUsercontrollers.js']
	 						}
	 					]);
				}
			}
	    })
	    .state('changUserPwd', {
	    	url: "/changUserPwd",
			templateUrl: "views/uc/user/changUserPwd.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							name: 'uc',
	 						    files: ['js/uc/ucControllers.js']
	 						}
	 					]);
				}
			}
	    })
	     .state('demoUserGet', {
	    	url: "/demoUserGet",
			templateUrl: "views/demo/demoUser/demoUserGet.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'js/base/tableFixedHeight.js',
						        	'js/util/util.js'
	 							]
	 						},
	 						{
	 							name: 'demoUser',
	 							files: ['js/demo/demoUser/demoUsercontrollers.js']
	 						}
	 					]);
				}
			}
	    }).state('underUserList', {
	    	url: "/underUserList",
			templateUrl: "views/uc/org/underUserList.html",
			data: {pageTitle: '下属管理'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'js/base/tableFixedHeight.js',
						        	'js/util/util.js'
	 							]
	 						},
	 						{
	 							name: 'uc',
	 							files: ['js/uc/ucControllers.js']
	 						}
	 					]);
				}
			}
	    })
	     .state('orgPostEdit', {
	    	url: "/orgPostEdit",
			templateUrl: "views/uc/org/orgPostEdit.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'js/base/tableFixedHeight.js',
						        	'js/util/util.js'
	 							]
	 						},
	 						{
	 							name: 'uc',
	 							files: ['js/uc/ucControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('customScriptDiy', {
	    	url: "/customScriptDiy",
			templateUrl: "views/form/formDesign/customScriptDiy.html",
			data: {pageTitle: '自定义脚本'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
						    serie: true,
						    files: [
						      'js/util/util.js',
						      'css/plugins/codemirror/codemirror.css',
						      'css/plugins/codemirror/ambiance.css',
						      'js/plugins/codemirror/codemirror.js',
						      'js/plugins/codemirror/mode/javascript/javascript.js'
						    ]
						  },
						  {
						    name: 'ui.codemirror',
						    files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
						  },
	 						{
	 						    name: 'formDesign',
	 						    files: ['js/form/formDesignListControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('includdingFile', {
	    	url: "/includdingFile",
			templateUrl: "views/form/formDesign/includdingFile.html",
			data: {pageTitle: '脚本\样式引入'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
						    serie: true,
						    files: [
						      'js/util/util.js',
						      'css/plugins/codemirror/codemirror.css',
						      'css/plugins/codemirror/ambiance.css',
						      'js/plugins/codemirror/codemirror.js',
						      'js/plugins/codemirror/mode/javascript/javascript.js'
						    ]
						  },
						  {
						    name: 'ui.codemirror',
						    files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
						  },
	 						{
	 						    name: 'formDesign',
	 						    files: ['js/form/formDesignListControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('bpmDataTemplateExport', {
	    	url: "/bpmDataTemplateExport",
			templateUrl: "views/form/bpmDataTemplate/bpmDataTemplateExport.html",
			data: {pageTitle: '导出设置'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
 							serie: true,
 							files: [
								'css/common.table.css',
								'js/base/tableFixedHeight.js',
					        	'js/util/util.js'
 							]
 						},
 						{
 						    name: 'formDesign',
 						    files: ['js/form/formDesignListControllers.js']
 						}
 					]);
				}
			}
	    })
	    
	    .state('templateAddToMenu', {
	    	url: "/templateAddToMenu",
			templateUrl: "views/form/bpmDataTemplate/templateAddToMenu.html",
			data: {pageTitle: '添加到菜单'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
 							serie: true,
 							files: [
								'css/common.table.css',
								'css/x5/expression.css',
								'js/base/tableFixedHeight.js',
								'js/util/util.js',
								'css/plugins/zTree/metroStyle.css',
								'js/plugins/zTree/jquery.ztree.min.js',
								'js/plugins/zTree/ztreeCreator.js'
 							]
 						},
 						{
 						    name: 'formDesign',
 						    files: ['js/form/formDesignListControllers.js']
 						}
 					]);
				}
			}
	    })
	    
	    .state('bpmDataTemplateAdd', {
	    	url: "/bpmDataTemplateAdd",
			templateUrl: "views/form/bpmDataTemplate/editDataPreview.html",
			data: {pageTitle: '添加'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
                     {
                    	    serie: true,
                    	    files: [
                    	      'css/common.table.css',
                    	      'js/base/tableFixedHeight.js',
                    	      'js/util/util.js',
                    	      'js/util/json2.js',
                    	      'css/plugins/zTree/metroStyle.css',
                    	      'js/plugins/zTree/jquery.ztree.min.js',
                    	      'js/plugins/zTree/ztreeCreator.js',
                    	      'css/design/custom.css',
                    	      'css/design/jquery.bootstrap-touchspin.min.css',
                    	      'css/plugins/switchery/switchery.css',
                    	      'css/design/formDesign.css',
                    	      'js/lib/icheck/icheck.min.js',
                    	      'js/plugins/switchery/switchery.js',
                    	      'js/formDesign/Sortable.js',
                    	      'js/plugins/My97DatePicker/WdatePicker.js',
                    	      'js/portal/jquery.base64.js',
                    	      'js/jquery/jquery.bootstrap-touchspin.min.js',
                    	      'bpm-editor/lib/jquery/jquery.qtip.min.js',
                    	      'js/lib/select2/js/select2.full.min.js',
                    	      'js/lib/select2/js/i18n/zh-CN.js',
                    	      'js/lib/select2/css/select2.min.css',
                    	      'js/formDesign/form.js',
                    	      'js/lib/ueditor/bpmdef.udeitor.config.js',
                    	      'js/lib/ueditor/ueditor.all.min.js',
                    	      'js/lib/ueditor/lang/zh-cn/zh-cn.js',
                    	      'js/x5/bpm/OfficePlugin.js',
                    	      'js/x5/bpm/custFormHelper.js',
                    	      'js/x5/bpm/OfficeControl.js',
                    	      'js/x5/bpm/webSignPlugin.js'
                    	    ]
                    	  },
                    	  {
                    	    name: 'ngZtree',
                    	    files: ['js/plugins/zTree/ng-ztree.js']
                    	  },
                    	  {
                    	    name: 'formDesign',
                    	    files: ['js/form/formDesignListControllers.js']
                    	  }
                    	]);
				}
			}
	    })
	    
	    .state('templateFilter', {
	    	url: "/templateFilter",
			templateUrl: "views/form/bpmDataTemplate/bpmDataTemplateFilter.html",
			data: {pageTitle: '添加条件过滤'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
						    serie: true,
						    files: [
						      'js/util/util.js',
						      'css/plugins/codemirror/codemirror.css',
						      'css/plugins/codemirror/ambiance.css',
						      'js/plugins/codemirror/codemirror.js',
						      'js/plugins/codemirror/mode/javascript/javascript.js',
						      'bpm-editor/lib/jquery/jquery.linkdiv.js',
						      'js/form/bpmNodeRule.js'
						    ]
						  },
						  {
						    name: 'ui.codemirror',
						    files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
						  },
	 						{
	 						    name: 'formDesign',
	 						    files: ['js/form/formDesignListControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('templateCtrlfield', {
	    	url: "/templateCtrlfield",
			templateUrl: "views/form/bpmDataTemplate/templateCtrlfieldDialog.html",
			data: {pageTitle: '控件设置'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
						    serie: true,
						    files: [
								'css/common.table.css',
								'js/base/tableFixedHeight.js',
								'css/plugins/zTree/metroStyle.css',
	                    	    'js/plugins/zTree/jquery.ztree.min.js',
	                    	    'js/plugins/zTree/ztreeCreator.js',
								'js/util/util.js'
						    ]
						  },
                    	  {
	                    	    name: 'ngZtree',
	                    	    files: ['js/plugins/zTree/ng-ztree.js']
	                    	  },
	 						{
	 						    name: 'formDesign',
	 						    files: ['js/form/formDesignListControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('form.bpmDataTemplateSubList', {
	    	url: "/bpmDataTemplateSubList/:alias/:refId",
			templateUrl: "views/form/bpmDataTemplate/bpmDataTemplateSubList.html",
			data: {pageTitle: '子表数据'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
 							serie: true,
 							files: [
								'css/common.table.css',
								'js/base/tableFixedHeight.js',
					        	'js/util/util.js'
 							]
 						},
 						{
 						    name: 'formDesign',
 						    files: ['js/form/formDesignListControllers.js']
 						}
 					]);
				}
			}
	    })
	    
	    // 国际化资源
	    var lang = "i18n-zh-CN";
	    if (window.localStorage.getItem("lang")) {
	    	lang = window.localStorage.getItem("lang");
	    }
	    // 设置默认语言
	    $translateProvider.fallbackLanguage(lang);
	    //$translateProvider.preferredLanguage(lang);
	    $translateProvider.useStaticFilesLoader({
	        prefix: 'js/i18n/',
	        suffix: '.json'
	    });
	    
	    
}
function run($rootScope, $http, baseService, context, $location, $sessionStorage, $state, AuthenticationService, dialogService, commonService, $window) {
	$rootScope.$state = $state;
	var loginCycleFlag = false, ctx = getContext();
	
	//动态添加菜单  登录 和run时都调用初始化动态菜单
    window.evalState = function(menus,$state){
    	if(!menus || menus.length==0) return;
    	for( var i=0;i<menus.length;i++ ){
    		var item = menus[i];
    		var param = {
    		        url: item.menuUrl,
    		        templateUrl: item.templateUrl,
    		        data: { pageTitle: item.name, specialClass: 'fixed-sidebar' }
    		    };
    		
    		if(!item.load){
    			param.abstract=true
    		}
    		if(item.load){
    			var lazyLoadStr = "function ($ocLazyLoad) {return $ocLazyLoad.load("+item.load+");}";
    			param.resolve = {};
    			try{
    				param.resolve.loadPlugin = eval("("+lazyLoadStr+")");
    			}
    			catch(exx){
    				dialogService.warn("路由注册失败.");
    			}
    		}
    		// 已经注册过不用再注册
    		if($state.is(item.alias)===undefined ){
    			stateProvider.state(item.alias,param);
    		}
    		
    		if(item.children && item.children.length > 0){
    			evalState(item.children,$state);
    		}
    	}
    }
    // keep user logged in after page refresh
    if ($sessionStorage.currentUser) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + $sessionStorage.currentUser.token;
        $rootScope.currentUserName = $sessionStorage.currentUser.username;
        AuthenticationService.loadDefaultPage();
    }
    // redirect to login page if not logged in and trying to access a restricted page
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var publicPages = ['/login', '/welcome'];
        var restrictedPage = publicPages.indexOf($location.path()) === -1;
        if (restrictedPage && !$sessionStorage.currentUser ) {
        	if(loginCycleFlag) {
        		event.preventDefault();
        		return;
        	}
        	regularLogin();
        }
        //关闭原来的右侧弹出页面
        dialogService.closeSidebar();
    });
    var service = ctx['web'] + "/index.html";
    // 健全登录信息
    function regularLogin(){
    	var ticket = $.getParameter("ticket"),
    		code = $.getParameter("code");
    	// 单点登录重定向回来时，url地址后面会携带参数
    	if(ticket || code){
    		// 通过url地址后面的参数完成认证过程
    		AuthenticationService.ssoLogin({code:code, ticket:ticket}, loginCallback);
    	}
    	else{
    		loginCycleFlag = true;
    		// 重定向到登录页面(会根据当前系统登录方式决定重定向到常规登录或者单点登录界面)
    		AuthenticationService.ssoRedirect();
    	}
    }
    
    function loginCallback(rep){
    	loginCycleFlag = false;
        if (rep && rep.result) {
        	// 加载默认界面
        	AuthenticationService.loadDefaultPage();
        }
        else{
        	$state.go("error");
        }
    }
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    	commonService.spinner($("div.fh-breadcrumb[ui-view]"));
    });
    
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams){
    	commonService.closeSpinner($("div.fh-breadcrumb[ui-view]"));
    });
    
    $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
    	commonService.closeSpinner($("div.fh-breadcrumb[ui-view]"));
    	$rootScope.previousState_name = fromState.name;
        $rootScope.previousState_params = fromParams;
        if(toState && toState.name=='home' && $window.location.search){
        	// 清除url参数
        	$window.location.search = '';
        }
    });
    $rootScope.back = function(path) {
    	if(path){
    		$state.go(path);
    	}else if(!$rootScope.previousState_name){
    		$state.go('home');
    	}
    	else{
    		$state.go($rootScope.previousState_name, $rootScope.previousState_params);
    	}
    };
    
    // 默認支持語言
    if(window.localStorage.getItem("lang")){
    	$http.defaults.headers.common["Accept-Language"] = window.localStorage.getItem("lang").replace("i18n-","");
    }
}
angular
.module('eip')
.config(config)
.run(run);
