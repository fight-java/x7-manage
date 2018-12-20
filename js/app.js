(function () {
	// 返回后台的context path
	window.getContext = function(){
		return {
			web : 'http://172.16.0.55:8080/manage',
			portal: 'http://172.16.0.55:8084',
			bpmRunTime: 'http://172.16.0.55:8086',
			bpmModel: 'http://172.16.0.55:8087',
			uc:'http://172.16.0.55:8088',
			form:'http://172.16.0.55:8082'
		};
	}
	
    angular.module('eip', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'pascalprecht.translate',       // Angular Translate
        'ngIdle',                       // Idle timer
        'ngSanitize',                   // ngSanitize
        'toaster',						// toaster
        'ngStorage',					// localStorage
        'ncy-angular-breadcrumb'		// breadcrumb
    ])
})();