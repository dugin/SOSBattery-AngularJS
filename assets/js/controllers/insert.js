
angular.module('insert.controllers', ['ngMap', 'google.places', 'angularGeoFire', 'firebase'])


.controller('insertCtrl', function ($scope, $geofire, $log, $filter, NgMap) {

    $scope.coordenadas = [-22.983600, -43.208040];
    $scope.zoom = 13;

    $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBKV00aef6G4QnNPeKtypAE6w8b-rta7VQ&libraries=places&signed_in=true";
    
    // URL para firebase e geofire principais
    const mainURL = "https://sosbatterytest.firebaseio.com/estabelecimentos/";
    const mainCoordURL = "https://sosbatterytest.firebaseio.com/coordenadas/";

    
    $scope.onInsert = () => {

      let  FirebaseRef = new Firebase(mainURL);

      let $GeofireRef = $geofire(new Firebase(mainCoordURL));




        //inicializa os campos que podem ter undefined
      if (testUndefined($scope.cbIphone))
          $scope.cbIphone = false;
      if (testUndefined($scope.cbAndroid))
          $scope.cbAndroid = false;
      if (testUndefined($scope.wifi) || !$scope.wifi) {
          $scope.wifi = false;
          $scope.wifiSSID = "";
          $scope.wifiSenha = "";
      }
      else {
          $scope.wifiSSID = $('#inputWifiSSID').val();
          $scope.wifiSenha = $('#inputWifiSenha').val();
      }
      
        




      let coord = [Number($scope.coordX), Number($scope.coordY)];

      let cabo = {
          android: $scope.cbAndroid,
          iphone: $scope.cbIphone
      };



        // hora de abertura padrão ( 00 - 00)
        // tem 6 campos pois alguns estabelecimentos abrem e fecham duas vezes ao dia
      let hr_open = new Array(hrAbre($scope.segsex), hrAbre($scope.sab), hrAbre($scope.dom),
          hrAbre($scope.segsex2), hrAbre($scope.sab2), hrAbre($scope.dom2));

        // hora que fecha padrão ( 00 - 00)
      let hr_close = new Array(hrFecha($scope.segsex), hrFecha($scope.sab),
          hrFecha($scope.dom), hrFecha($scope.segsex2), hrFecha($scope.sab2), hrFecha($scope.dom2));


      let dbRef = FirebaseRef.push();

        // construtor da classe com todos os elementos do banco de dados
      let dbInfo = new estFirebase($scope.nome, $scope.tipo, $scope.end, $scope.bairro, $scope.cidade,
          $scope.estado, $scope.imgURL, coord,
          $scope.criado, "", cabo,
          $scope.wifi, $scope.wifiSSID, $scope.wifiSenha, dbRef.key(), hr_open, hr_close);

      console.log(dbInfo);

      let onCompleteUpdate = (error) => {
          if (error) {
              console.log('Synchronization failed');
          } else {

              $GeofireRef.$set(dbRef.key(), coord)
                      .catch(function (err) {
                          $log.error(err);
                      });

              $('#myModal').modal('show');

          }
      };


         dbRef.set(dbInfo, onCompleteUpdate);


    }


    $scope.onPlaceTyped = () => {

        let placeInfoJSON = "";

        placeInfoJSON = $filter('json')($scope.autocomplete);

       

        if (placeInfoJSON.length > 0) {

           


           let placeInfoOBJ =  JSON.parse(placeInfoJSON);

            // coordenadas
           $scope.coordX = placeInfoOBJ.geometry.location.lat;
           $scope.coordY = placeInfoOBJ.geometry.location.lng;

           $scope.coordenadasLoja = [$scope.coordX, $scope.coordY];

           $scope.coordenadas = $scope.coordenadasLoja;

           $scope.zoom = 16;

            // cidade, estado e bairro
           for (i = 0; i < placeInfoOBJ.address_components.length; ++i) {

               let component = placeInfoOBJ.address_components[i];

               

               if (component.types.indexOf("administrative_area_level_1") > -1) {
                   
                   $scope.estado = component.short_name;

                   
               }

               else if (component.types.indexOf("sublocality") > -1) {
                   $scope.bairro = component.long_name;
               }

               else if (component.types.indexOf("locality") > -1) {
                   $scope.cidade = component.long_name;

               }
               

                
           }
            
           $scope.nome = placeInfoOBJ.name;

           $scope.tipo = placeInfoOBJ.types[0];

           

           let d = new Date();
           let data = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' - ' + d.getHours() + ':' + d.getMinutes();

           let hr_open = [];
           let hr_close = [];

           $scope.criado = data;


            // horário de funcionamento
           if (placeInfoOBJ.opening_hours != null) {


               let j;

               for (let i = 0; i < 3; i++) {
                   if (i == 0)
                       j = 0;
                   else if (i == 1)
                       j = 5;
                   else if (i == 2)
                       j = 6;

                

                   let diaSemana = placeInfoOBJ.opening_hours.weekday_text[j];

                   if (diaSemana.search(/fechado/i) != -1) {
                       hr_open[i] = "00:00";
                       hr_close[i] = "00:00";

                   }
                   else {

                      
                           if (diaSemana.indexOf(',') > -1) {
                               hr_open[i] = diaSemana
                               .substr(diaSemana.indexOf(':') + 2, 5);
                               hr_open[i + 3] = diaSemana
                               .substr(diaSemana.indexOf(',') + 2, 5);


                               hr_close[i] = diaSemana
                               .substr(diaSemana.indexOf(',') - 5, 5);
                               hr_close[i + 3] = diaSemana
                               .substr(diaSemana.length - 5, 5);

                           }
                           else {

                               hr_open[i] = diaSemana.substr(diaSemana.indexOf(':') + 2, 5);

                               hr_close[i] = diaSemana.substr(diaSemana.length - 5, 5);
                           }
                       

                   }
               }
               
                   $scope.segsex = hr_open[0] + ' - ' + hr_close[0];
                   $scope.sab = hr_open[1] + ' - ' + hr_close[1];
                   $scope.dom = hr_open[2] + ' - ' + hr_close[2];

                   if (!testUndefined(hr_open[3]))
                       $scope.segsex2 = hr_open[3] + ' - ' + hr_close[3];

                   if (!testUndefined(hr_open[4]))
                       $scope.sab2 = hr_open[4] + ' - ' + hr_close[4];

                   if (!testUndefined(hr_open[5]))
                       $scope.dom2 = hr_open[5] + ' - ' + hr_close[5];


                   $scope.end = placeInfoOBJ.vicinity.substring(0, placeInfoOBJ.vicinity.indexOf('-') - 1);

               
           }
       
        }

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

//função que testa se a variavel é undefined
function testUndefined(variavel) {

    return typeof variavel === 'undefined';
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
        return horario.substr(horario.length - 5, horario.length);

    return "";
}



function salvaDB() {


    var firebaseRef = new Firebase("https://flickering-heat-3899.firebaseio.com/estabelecimentos");

    var geofireRef = new Firebase("https://flickering-heat-3899.firebaseio.com/coordenadas");



    var geoFire = new GeoFire(geofireRef);
    var wifi;
    var cabo;
    var horario = [];
    horario[0] = document.getElementById("segsex").value;
    horario[1] = document.getElementById("sab").value;
    horario[2] = document.getElementById("dom").value;

    if (document.getElementById("segsex2").value.length > 0)
        horario[3] = document.getElementById("segsex2").value;
    if (document.getElementById("sab2").value.length > 0)
        horario[4] = document.getElementById("sab2").value;
    if (document.getElementById("dom2").value.length > 0)
        horario[5] = document.getElementById("dom2").value;

    var hrAbertura = [];
    var hrEncerramento = [];


    for (var i = 0; i < horario.length; i++) {
        hrAbertura[i] = horario[i].substr(0, 5);
        hrEncerramento[i] = horario[i].substr(horario[i].length - 5, 5);
    };



    if (document.getElementById('wifi_sim').checked)
        wifi = true;

    else
        wifi = false;


    if (document.getElementById('cabo_sim').checked)
        cabo = true;

    else
        cabo = false;



    var dbRef = firebaseRef.push();




    dbRef.set({
        nome: document.getElementById("nome").value,
        end: document.getElementById("end").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value,
        hr_open: hrAbertura,
        hr_close: hrEncerramento,
        createdAt: document.getElementById("createdAt").value,

        imgURL: document.getElementById("textboxid").value,
        wifi: wifi,
        wifi_senha: document.getElementById("wifi_senha").value,
        cabo: cabo,
        id: dbRef.key(),
        tipo: document.getElementById("tipo").value


    });

    var chave = dbRef.key();


    geoFire.set(chave, [latitude, longitude]).then(function () {
        window.alert("Informacoes salvas no Banco de Dados com sucesso!");



    }, function (error) {
        window.alert("Error: " + error);
    });
}

