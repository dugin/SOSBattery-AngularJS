

angular.module('search.controllers', [])


.controller('searchCtrl', function ($scope, $firebaseArray, $log) {

    // URL para firebase e geofire
    const estURL = "https://flickering-heat-3899.firebaseio.com/estabelecimentosTemp/";
    const coordURL = "https://flickering-heat-3899.firebaseio.com/coordenadasTemp/";

    const FirebaseRef = new Firebase(estURL);
   
    let coordenadas;



    $scope.onSearch = () => {

        waitingDialog.show('Buscando dados...',{ progressType: 'success'});
        
     
        // parametros de busca
        let searchParam = new searchParameters($scope.caboAndroid, $scope.caboIphone, $scope.wifi, $scope.restaurante, $scope.loja, $scope.bar, radioType($scope));

        let fbArray = $firebaseArray(FirebaseRef);

        fbArray.$loaded()
        .then(function (x) {
            waitingDialog.hide();
            $("#tabela").css('visibility', 'visible');
        })
        .catch(function (error) {
      console.log("Error:", error);
        });

        $scope.estabelecimentos = fbArray;

      
    }


    $scope.onEdit = (est) => {

        //move a tabela para dar espaço ao item a ser modificado
        $("#tabela").css('width', '40%');

        $("#editavel").css('visibility', 'visible');

        // pega a coordenada inicial
        coordenadas = est.coordenadas;

        $scope.nome = est.nome;
        $scope.tipo = est.tipo;
        $scope.end = est.end;
        $scope.bairro = est.bairro;
        $scope.cidade = est.cidade;
        $scope.estado = est.estado;
        $scope.imgURL = est.imgURL;
        $scope.id = est.id;
        $scope.coordX = est.coordenadas[0];
        $scope.coordY = est.coordenadas[1];
        $scope.criado = est.createdAt;
        $scope.modificado = est.modifiedAt;
        $scope.cbAndroidAlt = est.cabo;
        $scope.cbIphoneAlt = est.cabo;
        $scope.wifiAlt = est.wifi;
        $scope.wifiSSID = est.wifi_ssid;
        $scope.wifiSenha = est.wifi_senha;

        $scope.segsex = est.hr_open[0] + " - " + est.hr_close[0];
        $scope.sab = est.hr_open[1] + " - " + est.hr_close[1];
        $scope.dom = est.hr_open[2] + " - " + est.hr_close[2];

        // verifica se a hora de abertura e fechamento é undefined e depois se é vazio 
        // para então concatenar e mostrar na pag de edição
        if (!testUndefined(est.hr_open[3]))
        if ((est.hr_open[3]).length != 0)
            $scope.segsex2 = est.hr_open[3] + " - " + est.hr_close[3];

        if (!testUndefined(est.hr_open[4]))
        if ((est.hr_open[4]).length != 0)
            $scope.sab2 = est.hr_open[4] + " - " + est.hr_close[4];

        if (!testUndefined(est.hr_open[5]))
        if ((est.hr_open[5]).length != 0)
        $scope.dom2 = est.hr_open[5] + " - " + est.hr_close[5];


    }

    $scope.onAlter = () => {

        //inicializa os campos que podem ter undefined
        if (testUndefined(  $scope.cbIphoneAlt))
            $scope.cbIphoneAlt = false;
        if (testUndefined($scope.cbAndroidAlt))
            $scope.cbAndroidAlt = false;
        if (testUndefined($scope.wifiAlt))
            $scope.wifiAlt = false;
        if (testUndefined($scope.wifiSSID))
            $scope.wifiSSID = "";
        if (testUndefined($scope.wifiSenha))
        $scope.wifiSenha = "";


       

        let FirebaseRefMod = new Firebase(estURL + $scope.id);

       
        let GeofireRef = new GeoFire(new Firebase(coordURL + $scope.id));

        $log.info(coordURL + $scope.id);

        let coord = new Array($scope.coordX, $scope.coordY);

        let cabo = {
            android: $scope.cbAndroidAlt,
            iphone: $scope.cbIphoneAlt
        };

        // hora de abertura padrão ( 00 - 00)
        // tem 6 campos pois alguns estabelecimentos abrem e fecham duas vezes ao dia
        let hr_open = new Array(hrAbre($scope.segsex), hrAbre($scope.sab), hrAbre($scope.dom),
            hrAbre($scope.segsex2), hrAbre($scope.sab2), hrAbre($scope.dom2));

        // hora que fecha padrão ( 00 - 00)
        let hr_close = new Array(hrFecha($scope.segsex), hrFecha($scope.sab),
            hrFecha($scope.dom), hrFecha($scope.segsex2), hrFecha($scope.sab2), hrFecha($scope.dom2));

        // cria uma data com a hora para saber a última vez q foi modificada
         let d = new Date();
        let dataModificada = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' - ' + d.getHours() + ':' + d.getMinutes();
        
        // construtor da classe com todos os elementos do banco de dados
        let dbInfo = new estFirebase($scope.nome, $scope.tipo, $scope.end, $scope.bairro, $scope.cidade,
            $scope.estado, $scope.imgURL, coord,
            $scope.criado, dataModificada, cabo,
            $scope.wifiAlt, $scope.wifiSSID, $scope.wifiSenha, $scope.id, hr_open, hr_close);
        

        let onCompleteUpdate = (error)  => {
            if (error) {
                $log.error('Synchronization failed');
            } else {
            
                // compara a coordenada inicial e se foi modificada para então mudar no geofire também
                if (coordenadas[0] != coord[0] || coordenadas[1] != coord[1]) {
                    GeofireRef.set($scope.id, [coord[0], coord[1]]).then(function () {

                    }, function (error) {
                        window.alert("Error: " + error);
                    });
                }
            
            }
        };


        FirebaseRefMod.set(dbInfo, onCompleteUpdate);
   
       
    }




});





        //classe dos elementos do BD
class estFirebase {

    constructor(nome, tipo, end, bairro, cidade, estado, imgURL, coord, criadoEm, modEm, cabo, wifi, wifiSSID, wifiSenha, id, hr_open, hr_close) {

        this.nome = nome;
        this.tipo = tipo;
        this.end = end;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.imgURL = imgURL;
        this.coordenadas = coord;
        this.createdAt = criadoEm;
        this.modifiedAt = modEm;
        this.cabo = cabo;
        this.wifi = wifi;
        this.wifi_SSID = wifiSSID;
        this.wifi_senha = wifiSenha;
        this.id = id;
        this.hr_open = hr_open;
        this.hr_close = hr_close;

       
    }
}
       //classe dos parâmetros de busca
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

            //função retorna 0 se for tudo, 1 se for ultimos criados, 2 se for ultimos modificados
function radioType($scope) {
    if ($scope.all)
        return 0;
    else if ($scope.lastCreated)
        return 1;

    else
        return 2;

}
        //função que concatena o horario de abertura
function hrAbre(horario) {
    
    
  
    if (!testUndefined(horario))
        return horario.substr(0, 5);
    
    return "";

}

//função que concatena o horario de fechamento
function hrFecha(horario) {

    

    if (!testUndefined(horario))
    return horario.substr(horario.length-5, horario.length);

    return "";
}

//função que testa se a variavel é undefined
function testUndefined(variavel) {

    return typeof variavel === 'undefined';
}


// faz com que o tipo de filtro seja modificado
$(document).ready(function(e){
    $('.search-panel .dropdown-menu').find('a').click(function(e) {
		e.preventDefault();
		var param = $(this).attr("href").replace("#","");
		var concept = $(this).text();
		$('.search-panel span#search_concept').text(concept);
		$('.input-group #search_param').val(param);
	});
});
