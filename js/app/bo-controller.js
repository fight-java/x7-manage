function boDetailCtrl($scope, dialogService){
	$scope.name = $scope.pageParam.name;
	
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

angular
    .module('bo', [])
    .controller('boDetailCtrl', boDetailCtrl);