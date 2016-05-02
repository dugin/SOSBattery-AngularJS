

angular.module('search.controllers', [])


.controller('searchCtrl', function ($scope, $firebaseArray) {

    const FirebaseRef = new Firebase("https://flickering-heat-3899.firebaseio.com/estabelecimentos");

    $scope.onSearch = () => {

        let searchParam = new searchParameters($scope.caboAndroid, $scope.caboIphone, $scope.wifi, $scope.restaurante, $scope.loja, $scope.bar, radioType($scope));

        let fbArray = $firebaseArray(FirebaseRef);

        $scope.estabelecimentos = fbArray;

        $("#tabela").css('visibility', 'visible');
    }


    $scope.onEdit = (est) => {

   
        $("#editavel").css('visibility', 'visible');

        $scope.nome = est.nome;
        $scope.tipo = est.tipo;
        $scope.end = est.end;
        $scope.bairro = est.bairro;
        $scope.cidade = est.cidade;
        $scope.estado = est.estado;
        $scope.criado = est.createdAt;
        $scope.modificado = est.modifiedAt;
        $scope.imgURL = est.imgURL;
        $scope.id = est.id;
        $scope.coordX = est.coordenadas[0];
        $scope.coordY = est.coordenadas[1];
        $scope.cbIphoneAlt = est.cabo;
        $scope.cbAndroidAlt = est.cabo;
        $scope.wifiAlt = est.wifi;
        $scope.wifiSSID = est.wifi_ssid;
        $scope.wifiSenha = est.wifi_senha;


    }




});





class searchParameters {

    constructor(cbAndroid, cbIphone, wifi, restaurante, loja, bar, radioBtn) {
        this.cbAndroid = cbAndroid;
        this.cbIphone = cbIphone;
        this.wifi = wifi;
        this.restaurante = restaurante;
        this.loja = loja;
        this.bar = bar;
        this.radioBtn = radioBtn;
    }
   
}


function radioType($scope) {
    if ($scope.all)
        return 0;
    else if ($scope.lastCreated)
        return 1;

    else
        return 2;


}

$(document).ready(function(e){
    $('.search-panel .dropdown-menu').find('a').click(function(e) {
		e.preventDefault();
		var param = $(this).attr("href").replace("#","");
		var concept = $(this).text();
		$('.search-panel span#search_concept').text(concept);
		$('.input-group #search_param').val(param);
	});
});
