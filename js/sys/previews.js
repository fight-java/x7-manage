function pictureCtrl($scope,$state,$stateParams){
    //操作按钮
    var test=$stateParams.data;
    $scope.data= JSON.parse($.base64.decode(test,"utf-8"));
    var li="";
    for (var i = 0; i <$scope.data.imgUrls.length ; i++) {
        li+="<li> <a href='javascript:void(0)'> <img id='"+$scope.data.imgUrls[i]+"'   src='"+$scope.data.imgUrls[i]+"' ></a> </li>";
    }
    document.getElementById("dowebok").innerHTML=li;
    var viewer = new Viewer(document.getElementById('dowebok'), {
        url: 'src',
        navbar:false,
        loop : true
    });
    $scope.back=function () {
        $state.go("system.file",{});
    }
    // 修改下一页按钮的样式和位置
    $(function () {
        var outHandler = function(){
            $(this).css('background-color','rgba(0, 0, 0, 0)');
        };
        var overHandler = function(){
            $(this).css('background-color','rgba(0, 0, 0, .5)');
        };
        var next = $("li[data-action=next]");
        var prev = $("li[data-action=prev]");
        var viewerToolBar = $(".viewer-footer");
        // 覆盖按钮父类原始样式
        viewerToolBar.css("overflow", "visible");
        // 获取文档高度、宽度
        var clientHeight = window.innerHeight;
        var clientWidth = window.innerWidth;
        // 调整样式
        var styleCss = {},nextCss={},prevCss={};
        styleCss.position = "absolute";
        styleCss.top = -clientHeight;
        styleCss.width = clientWidth*0.1;
        styleCss.height = clientHeight + 52;
        // 覆盖原始样式
        styleCss.backgroundColor='rgba(0, 0, 0, 0)';
        styleCss.borderRadius='inherit';
        nextCss.right = "0";
        prevCss.left = "0";
        next.css($.extend(nextCss, styleCss));
        prev.css($.extend(prevCss, styleCss));
        next.on('mouseout',outHandler);
        next.on('mouseover',overHandler);
        prev.on('mouseout',outHandler);
        prev.on('mouseover',overHandler);
    });
}
function pdfCtrl($scope,$stateParams,$state){
    //操作按钮
    var test=$stateParams.data;
    $scope.data= JSON.parse($.base64.decode(test,"utf-8"));
    $scope.src="js/x5/pdfjs/web/viewer.html?file="+$scope.data.pdfUrl;
    debugger;
    $scope.back=function () {
        $state.go("system.file",{});
    }
}
function htmlCtrl($scope,$stateParams,$state,$sce){
    //操作按钮
    var test=$stateParams.data;
    $scope.data= JSON.parse($.base64.decode(test,"utf-8"));
    var pdfUrl=$scope.data.pdfUrl;
    $.ajax({
        url:pdfUrl,
        type:'GET',
        dataType:'html',
        success:function(data){
            setTimeout(function(){
                $("#iframe").contents().find("body").append(data);
            },1000);

        }
    });

    $scope.back=function () {
        $state.go("system.file",{});
    }
}
/*function html2Ctrl($scope,$stateParams,$state,$location){
    var pdfUrl=$location.search().pdfUrl;
    $.ajax({
        url:pdfUrl,
        type:'GET',
        dataType:'text',
        async:false,
        success:function(data){
            document.getElementById("iframe").innerHTML= data;
        }
    });
}*/
function mediaCtrl($scope,$stateParams,$state){
    //操作按钮
    var test=$stateParams.data;
    $scope.data= JSON.parse($.base64.decode(test,"utf-8"));
    document.getElementById("mediaUrl").src=$scope.data.mediaUrl
    $scope.back=function () {
        $state.go("system.file",{});
    }
}

function txtCtrl($scope,$stateParams,$state){
    //操作按钮
    var test=$stateParams.data;
    $scope.data= JSON.parse($.base64.decode(test,"utf-8"));
    $scope.txtUrl=$scope.data.TxtUrl;
    $("#content3").load($scope.txtUrl);
    $scope.back=function () {
        $state.go("system.file",{});
    }
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('previews', [])
    .controller('pictureCtrl', pictureCtrl)
    .controller('pdfCtrl', pdfCtrl)
    .controller('htmlCtrl', htmlCtrl)
    .controller('mediaCtrl', mediaCtrl)
    .controller('txtCtrl', txtCtrl)