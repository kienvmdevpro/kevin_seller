var ApiStorage  = 'http://cloud.shipchung.vn/';

// var ApiPath     = '/api/public/api/v1/';

// var ApiSeller   = '/api/public/api/seller/';

// var ApiCron     = '/api/public/cronjob/';

// var ApiRest     = '/api/public/api/rest/';

// var ApiJourney  = '/api/public/trigger/journey/';

var ApiUrl      = '/shipchung/sellercenter/api/public/';
var ApiPath     = '/shipchung/sellercenter/api/public/api/v1/';
var ApiSeller   = '/shipchung/sellercenter/api/public/api/seller/';
var ApiCron     = '/shipchung/sellercenter/api/public/cronjob/';
var ApiRest     = '/shipchung/sellercenter/api/public/api/rest/';
var ApiJourney  = '/shipchung/sellercenter/api/public/trigger/journey/';
var ApiUrl      = '/shipchung/sellercenter/api/public/';



//var BOXME_API = 'http://shipchung.local/api/';

//var BOXME_API = 'http://dev.boxme.vn/api/';


var BOXME_DOMAIN = 'seller.boxme.vn';
var BOXME_API   = '/bxapi/';
var BOXMEASIA_DOMAIN = ['seller.boxme.asia','sellercenter.boxme.asia'];
var ApiStorage  = 'http://cloud.shipchung.vn/';

var fbdk        = {

    'appId'         : "451866784967740", //451866784967740 //377802115738753

    "permisstions"  : "email"

}

if(location.host == BOXME_DOMAIN) {
    fbdk.appId = "1114825121890949";
}

var intercomConfig = {	'appId'	: 'ymitl3zf'}
