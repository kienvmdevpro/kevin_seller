<?php namespace mobile_order;

use Mockery\CountValidator\Exception;
use Response;
use Input;
use DB;
use ordermodel\OrdersModel;
use ordermodel\AddressModel;
use ordermodel\DetailModel;
use metadatamodel\OrderStatusModel;
use metadatamodel\GroupStatusModel;
use metadatamodel\GroupOrderStatusModel;
use sellermodel\UserInventoryModel;
use sellermodel\UserInfoModel;
use Cache;
use CourierModel;
use CityModel;
use DistrictModel;
use WardModel;
use LMongo;
use Excel;
use Validator;
use ApiDispatcherCtrl;
use anlutro\cURL\Request;
use omsmodel\StatisticModel;
use omsmodel\SellerModel;
use omsmodel\PipeJourneyModel;
use omsmodel\PipeStatusModel;

class OrderController extends \BaseController
{
    private $time_create_start = '';
    private $time_create_end = '';
    private $time_accept_start = '';
    private $time_accept_end = '';
    private $list_status = [];
    private $user_id;
    private $stock_id;
    private $list_province = [];
    private $address = [];

    // Danh sách nhóm trạng thái
    private $PICKING_STATUS         = [14, 15];
    private $DELIVERING_STATUS      = [16, 17, 18, 20, 32];
    private $WAITING_ACCEPT_STATUS  = [12, 13];
    private $DELIVERED_STATUS       = [19, 36];



    private function GetModel()
    {
        $Search             = Input::has('search')              ? trim(Input::get('search')) : '';
        $TimeStart          = Input::has('time_start')          ? (int)Input::get('time_start') : 0; //  7 day  - 14 day  -  30day  - 90 day
        $TimeCreateStart    = Input::has('time_create_start')   ? (int)Input::get('time_create_start') : 0; // time_create start   time_stamp
        $TimeCreateEnd      = Input::has('time_create_end')     ? (int)Input::get('time_create_end') : 0; // time_create end
        $ListStatus         = Input::has('list_status')         ? trim(Input::get('list_status')) : '';
        $Cmd                = Input::has('cmd')                 ? trim(Input::get('cmd')) : '';


        $UserInfo   = $this->UserInfo();
        $id         = (int)$UserInfo['id'];
        $Model      = new OrdersModel;

        if (!empty($id)) {
            $Model = $Model::where('from_user_id', $id);
        }

        if (!empty($Search)) {
            if (filter_var($Search, FILTER_VALIDATE_EMAIL)) {
                $Model = $Model->where('to_email', $Search);
            } elseif (filter_var((int)$Search, FILTER_VALIDATE_INT, array('option' => array('min_range' => 8, 'max_range' => 20)))) {  // search phone
                $Model = $Model->where('to_phone', $Search);
            } else { // Tim kiem theo ma
                $validation = Validator::make(['TrackingCode' => $Search],
                    array(
                        'TrackingCode' => array('required', 'regex:/SC[0-9]+$/'),
                    ));
                if ($validation->fails()) {
                    $Model = $Model->where('order_code', $Search);
                } else {
                    $Model = $Model->where('tracking_code', $Search);
                }
            }
        }

        if ($TimeStart > 0) {
            $TimeCreateStart = time() - $TimeStart * 86400;
        }

        if ($TimeCreateStart > 0) {
            $Model = $Model->where('time_create', '>=', $TimeCreateStart);
        } else {
            $Model = $Model->where('time_create', '>=', strtotime(date('Y-m-1 00:00:00')));
        }

        if ($TimeCreateEnd > 0) {
            $Model = $Model->where('time_create', '<=', $TimeCreateEnd);
        }


        if ($Cmd == 'export') {
            if (!empty($TimeCreateStart)) $this->time_create_start = date('m/d/Y', $TimeCreateStart);
            if (!empty($TimeCreateEnd)) $this->time_create_end = date('m/d/Y', $TimeCreateEnd);
            if (!empty($TimeAcceptStart)) $this->time_accept_start = date('m/d/Y', $TimeAcceptStart);
            if (!empty($TimeAcceptEnd)) $this->time_accept_end = date('m/d/Y', $TimeAcceptEnd);
        }

        return $Model;
    }

    private function GetModelProcess()
    {
        $Search          = Input::has('search') ? trim(Input::get('search')) : '';
        $TimeStart       = Input::has('time_start') ? (int)Input::get('time_start') : 0; //  7 day  - 14 day  -  30day  - 90 day
        $TimeCreateStart = Input::has('time_create_start') ? (int)Input::get('time_create_start') : 0; // time_create start   time_stamp
        $TimeCreateEnd   = Input::has('time_create_end') ? (int)Input::get('time_create_end') : 0; // time_create end
        $TimeAcceptStart = Input::has('time_accept_start') ? (int)Input::get('time_accept_start') : 0; // time_accept start
        $TimeAcceptEnd   = Input::has('time_accept_end') ? (int)Input::get('time_accept_end') : 0; // time_accept end
        $ListStatus      = Input::has('list_status') ? trim(Input::get('list_status')) : '';
        $Cmd             = Input::has('cmd') ? trim(Input::get('cmd')) : '';


        $OverWeight      = Input::has('over_weight') ? trim(Input::get('over_weight')) : '';
        $ByVip           = Input::has('by_vip') ? trim(Input::get('by_vip')) : '';


        $UserInfo   = $this->UserInfo();
        $id         = (int)$UserInfo['id'];


        $Model = new OrdersModel;

        if (!empty($id)) {
            $Model = $Model::where('from_user_id', $id);
        }

        // Lấy đơn vượt cân
        if (!empty($ListStatus) && $ListStatus == 'OVERWEIGHT') {
            $Model = $Model->join('order_detail', 'order_detail.order_id', '=', 'orders.id');
            $Model = $Model->where('order_detail.sc_pvk', '!=', 0)->where('orders.accept_overweight', '=', 0)->where('orders.verify_id', '=', 0);
        }


        if (!empty($Search)) {
            if (filter_var($Search, FILTER_VALIDATE_EMAIL)) {  // search email
                $Model = $Model->where('to_email', $Search);
            } elseif (filter_var((int)$Search, FILTER_VALIDATE_INT, array('option' => array('min_range' => 8, 'max_range' => 20)))) {  // search phone
                $Model = $Model->where('to_phone', $Search);
            } else { // search code

                $validation = Validator::make(['TrackingCode' => $Search],
                    array(
                        'TrackingCode' => array('required', 'regex:/SC[0-9]+$/'),
                    ));
                if ($validation->fails()) {
                    $Model = $Model->where('order_code', $Search);
                } else {
                    $Model = $Model->where('tracking_code', $Search);
                }
            }
        }

        if ($TimeStart > 0) {
            $TimeCreateStart = time() - $TimeStart * 86400;
        }

        if ($TimeCreateStart > 0) {
            $Model = $Model->where('time_create', '>=', $TimeCreateStart);
        } else {
            $Model = $Model->where('time_create', '>=', strtotime(date('Y-m-1 00:00:00')));
        }

        if ($TimeCreateEnd > 0) {
            $Model = $Model->where('time_create', '<=', $TimeCreateEnd);
        }
        if ($TimeAcceptStart > 0) {
            $Model = $Model->where('time_accept', '>=', $TimeAcceptStart);
        }
        if ($TimeAcceptEnd > 0) {
            $Model = $Model->where('time_accept', '<=', $TimeAcceptEnd);
        }


        if (!empty($ListStatus) && $ListStatus !== 'OVERWEIGHT') {
            $ListStatus = explode(',', $ListStatus);
            $GroupOrderStatusModel = new GroupOrderStatusModel;
            $ListStatusOrder = $GroupOrderStatusModel::whereIn('group_status', $ListStatus)->get(array('group_status', 'order_status_code'))->toArray();
            $ListStatus = [];
            if (!empty($ListStatusOrder)) {
                foreach ($ListStatusOrder as $val) {
                    $ListStatus[] = (int)$val['order_status_code'];
                }
            }
            if(!empty($ListStatus)){
                $Model = $Model->whereIn('status', $ListStatus);
            }

        }

        if (!empty($ListId)) {
            $Model = $Model->whereIn('to_address_id', $ListId);
        }

        if ($Cmd == 'export') {
            if (!empty($TimeCreateStart)) $this->time_create_start = date('m/d/Y', $TimeCreateStart);
            if (!empty($TimeCreateEnd)) $this->time_create_end = date('m/d/Y', $TimeCreateEnd);
            if (!empty($TimeAcceptStart)) $this->time_accept_start = date('m/d/Y', $TimeAcceptStart);
            if (!empty($TimeAcceptEnd)) $this->time_accept_end = date('m/d/Y', $TimeAcceptEnd);
        }

        return $Model;
    }

    // Lay danh sach cac trang thai can loc
    public function getStatusFilter()
    {
        $RootStatus = Input::has('root') ? Input::get('root') : "";
        if (empty($RootStatus)) {
            return Response::json([
                'error' => false,
                'error_message' => "Dữ liệu gửi lên không chính xác !",
                'data' => []
            ]);
        }
        $ListStatus = [];
        switch ($RootStatus) {
            case 'PICKING':
                $ListStatus = $this->PICKING_STATUS;
                break;
            case 'DELIVERING':
                $ListStatus = $this->DELIVERING_STATUS;
                break;
            case 'WAITING_ACCEPT':
                $ListStatus = $this->WAITING_ACCEPT_STATUS;
                break;
            case 'DELIVERED':
                $ListStatus = $this->DELIVERED_STATUS;
                break;
        }
        if (empty($ListStatus)) {
            return Response::json([
                'error' => false,
                'error_message' => "Dữ liệu gửi lên không chính xác !",
                'data' => []
            ]);
        }

        $Result = GroupStatusModel::whereIn('id', $ListStatus)->select(['id as StatusId', 'name as StatusName'])->get()->toArray();
        return Response::json([
            'error' => false,
            'error_message' => "",
            'data' => $Result
        ]);
    }

    public function getIndex() // seller center 7day - 3 month
    {
        $page           = Input::has('page')    ? (int)Input::get('page') : 1;
        $Cmd            = Input::has('cmd')    ? (int)Input::get('cmd') : "";
        $GroupStatus    = Input::has('group_status')  ? strtoupper(trim(Input::get('group_status'))) : 'ALL';
        $Status         = Input::has('status')  ? strtoupper(trim(Input::get('status'))) : '';
        $itemPage       = Input::has('limit')   ? Input::get('limit') : 20;


        $Model = $this->GetModel();
        $Total = 0;
        $ListStatusGroup = [];

        if(empty($Status)){
            switch ($GroupStatus){
                case 'PICKING':
                    $ListStatusGroup = $this->PICKING_STATUS;
                    break;
                case 'DELIVERING':
                    $ListStatusGroup = $this->DELIVERING_STATUS;
                    break;
                case 'WAITING_ACCEPT':
                    $ListStatusGroup = $this->WAITING_ACCEPT_STATUS;
                    break;
                case 'DELIVERED':
                    $ListStatusGroup = $this->DELIVERED_STATUS;
                    break;
            }
        }else {
            $ListStatusGroup = explode(',', $Status);
        }



        if($GroupStatus == 'PICKING' && $Cmd == 'demo'){
            $Data = [];
            $Data[] = [
                'courier' => [
                    'id'         => 8,
                    'name'       => "EMS-VNPT",
                    'prefix'     => "ems",

                ],
                'courier_id' => 8,
                'domain'        => "shipchung.vn",
                'id'            => 513946,
                "order_code"    => "P0000001",
                "order_detail"  => [
                    "id"              => 671608,
                    "order_id"        => 673485,
                    "sc_pvc"          => 32000,
                    "sc_cod"          => 10000,
                    "sc_pbh"          => 10000,
                    "sc_pvk"          => 0,
                    "sc_pch"          => 0,
                    "sc_discount_pvc" => 0,
                    "sc_discount_cod" => 0,
                    "seller_discount" => 0,
                    "seller_pvc"      => 0,
                    "seller_cod"      => 0,
                    "hvc_pvc"         => 0,
                    "hvc_cod"         => 0,
                    "hvc_pbh"         => 0,
                    "hvc_pvk"         => 0,
                    "hvc_pch"         => 0,
                    "money_collect"   => 250000
                ],
                "order_status" => [
                    [
                        "id" => 5367263,
                        "order_id" => 828570,
                        "status" => 35,
                        "city_name" => " Bưu cục: ",
                        "note" => "100 / Tiếp nhận đơn hàng từ đối tác - Bưu cục tiếp nhận đi lấy hàng Bưu cục:   Nhân viên phát: ",
                        "time_create" => 1442325031,
                        "status_name" => "Đang lấy hàng"
                    ],
                    [
                        "id" => 5363197,
                        "order_id" => 828570,
                        "status" => 35,
                        "city_name" => "HNI Bưu cục: Nguyễn Thị Định",
                        "note" => "103 / Giao cho bưu cục - Bưu cục đi lấy hàng Bưu cục: Nguyễn Thị Định  Nhân viên phát: Bùi Thị  Duyên",
                        "time_create" => 1442318058,
                        "status_name" => "Đang lấy hàng"
                    ]
                ],
                'product_name'  => "SP VƯỜN SINH THÁI",
                'service_id'    => 2,
                'status'        => 50,
                'time_accept'   => 1433230765,
                'time_create'   => 1433227864,
                'time_update'   => 1433404102,
                'to_address_id' => 371361,
                'to_email'      => null,
                'to_name'       => "PHAN VĂN NGHIÊM",
                'to_phone'      => "0974390120",
                'total_amount'  => 2750000,
                'total_weight'  => 3015,
                'tracking_code' => "SC51624240358",
                'verify_id'     => 0
            ];
            $contents = array(
                'error'         => false,
                'message'       => 'success',
                'total'         => $Total,
                'data'          => $Data
            );

            return Response::json($contents);
        }

        if($GroupStatus == 'DELIVERED' && $Cmd == 'demo'){
            $Data = [];
            $Data[] = [
                'courier' => [
                    'id'         => 1,
                    'name'       => "Viettelpost",
                    'prefix'     => "vtp",
                ],

                'courier_id'    => 1,
                'domain'        => "shipchung.vn",
                'id'            => 513946,
                'order_code'    => null,
                "order_detail"  => [
                    "id"              => 671608,
                    "order_id"        => 673485,
                    "sc_pvc"          => 32000,
                    "sc_cod"          => 10000,
                    "sc_pbh"          => 10000,
                    "sc_pvk"          => 0,
                    "sc_pch"          => 0,
                    "sc_discount_pvc" => 0,
                    "sc_discount_cod" => 0,
                    "seller_discount" => 0,
                    "seller_pvc"      => 0,
                    "seller_cod"      => 0,
                    "hvc_pvc"         => 0,
                    "hvc_cod"         => 0,
                    "hvc_pbh"         => 0,
                    "hvc_pvk"         => 0,
                    "hvc_pch"         => 0,
                    "money_collect"   => 250000
                ],
                "order_status" => [
                    [
                        "id" => 5367263,
                        "order_id" => 828570,
                        "status" => 35,
                        "city_name" => " Bưu cục: ",
                        "note" => "100 / Tiếp nhận đơn hàng từ đối tác - Bưu cục tiếp nhận đi lấy hàng Bưu cục:   Nhân viên phát: ",
                        "time_create" => 1442325031,
                        "status_name" => "Đang lấy hàng"
                    ],
                    [
                        "id" => 5363197,
                        "order_id" => 828570,
                        "status" => 35,
                        "city_name" => "HNI Bưu cục: Nguyễn Thị Định",
                        "note" => "103 / Giao cho bưu cục - Bưu cục đi lấy hàng Bưu cục: Nguyễn Thị Định  Nhân viên phát: Bùi Thị  Duyên",
                        "time_create" => 1442318058,
                        "status_name" => "Đang lấy hàng"
                    ]
                ],
                'product_name'  => "1 X Tủ Vải Gấp Gọn 5 Ngăn Kéo(655277394572),",
                'service_id'    => 1,
                'status'        => 52,
                'time_accept'   => 1433230765,
                'time_create'   => 1433227864,
                'time_update'   => 1433404102,
                'to_address_id' => 371361,
                'to_email'      => null,
                'to_name'       => "Lương Thị Thu Thủy",
                'to_phone'      => "0974390120",
                'total_amount'  => 2750000,
                'total_weight'  => 3015,
                'tracking_code' => "SC51624240358",
                'verify_id'     => 0
            ];
            $contents = array(
                'error'         => false,
                'message'       => 'success',
                'total'         => $Total,
                'data'          => $Data
            );

            return Response::json($contents);
        }


        $Data           = array();
        $ListStatus     = new GroupOrderStatusModel;
        if(!empty($ListStatusGroup)){
            $ListStatus = $ListStatus->whereIn('group_status', $ListStatusGroup);
        }
        try {
            $ListStatus = $ListStatus->get()->lists('order_status_code');
        }catch (Exception $error){
        }

        if (!empty($ListStatus)) {
            $Model = $Model->whereIn('status', $ListStatus);
        } else {
            return Response::json([
                'error'     => false,
                'message'   => 'success',
                'total'     => $Total,
                'data'      => []
            ]);
        }


        $Model = $Model->orderBy('time_create', 'DESC')->with(array('OrderDetail', 'Courier' => function ($query) {
            return $query->select(array('id', 'name', 'prefix'));
        }));


        $Total = clone $Model;
        $Total = $Total->count();

        if ($itemPage != 'all') {
            $itemPage = (int)$itemPage;
            $offset = ($page - 1) * $itemPage;
            $Model = $Model->skip($offset)->take($itemPage);
        }

        $Data = $Model->with(array(
            'ToOrderAddress',
            'MetaStatus',

            'Courier' => function ($q) {
                return $q->select('name', 'id');
            },
            'OrderStatus' => function ($query){
                return $query->with('MetaStatus')->orderBy('time_create','DESC');
            },
            'OrderDetail',
        ))->get(array('id', 'tracking_code', 'checking', 'fragile', 'status', 'service_id', 'courier_id', 'total_weight', 'total_amount',
            'total_quantity', 'to_name', 'to_phone', 'to_email', 'product_name',
            'to_address_id', 'time_accept', 'time_create', 'time_pickup', 'time_update', 'estimate_delivery', 'verify_id', 'from_user_id', 'from_address_id', 'from_city_id',
            'from_district_id', 'from_ward_id', 'from_address', 'order_code'))->toArray();



        if (!empty($Data)) {
            foreach ($Data as $key => $val) {
                //$Data[$key]['barcode']  = $this->getBarcode($val['tracking_code']);
                $leatime_str       = "";

                if($val['estimate_delivery'] > 24){
                    $leatime_str = ceil($val['estimate_delivery'] / 24)." ngày";
                }else {
                    $leatime_str = $val['estimate_delivery']." giờ";
                }
                $Data[$key]['leatime_str'] = $leatime_str;


                if ((int)$val['from_city_id'] > 0) {
                    $ListCityId[] = (int)$val['from_city_id'];
                }

                if ((int)$val['from_district_id'] > 0) {
                    $ListDistrictId[] = (int)$val['from_district_id'];
                }
                if ((int)$val['from_user_id'] > 0) {
                    $ListFromUserId[] = (int)$val['from_user_id'];
                }

                if ((int)$val['from_ward_id'] > 0) {
                    $ListWardId[] = (int)$val['from_ward_id'];
                }

                foreach($val['order_status'] as $k=>$v){
                    $Data[$key]['order_status'][$k]['status_name'] = $v['meta_status']['name'];
                    unset($Data[$key]['order_status'][$k]['meta_status']);
                }

                if (!empty($val['to_order_address'])) {
                    if ((int)$val['to_order_address']['city_id'] > 0) {
                        $ListCityId[] = (int)$val['to_order_address']['city_id'];
                    }

                    if ((int)$val['to_order_address']['province_id'] > 0) {
                        $ListDistrictId[] = (int)$val['to_order_address']['province_id'];
                    }

                    if ((int)$val['to_order_address']['ward_id'] > 0) {
                        $ListWardId[] = (int)$val['to_order_address']['ward_id'];
                    }
                }
            }

            if (!empty($ListCityId)) {
                $CityModel = new CityModel;
                $ListCityId = array_unique($ListCityId);
                $ListCity = $CityModel->whereIn('id', $ListCityId)->get(array('id', 'city_name'))->toArray();
                if (!empty($ListCity)) {
                    foreach ($ListCity as $val) {
                        $City[(int)$val['id']] = $val['city_name'];
                    }
                }
            }
            $UserData = [];
            if (!empty($ListFromUserId)) {
                $ListFromUserId = array_unique($ListFromUserId);
                $ListFromUser = \User::whereIn('id', $ListFromUserId)->get(array('id', 'fullname', 'email', 'phone'))->toArray();
                if (!empty($ListFromUser)) {
                    foreach ($Data AS $OneData) {
                        foreach ($ListFromUser AS $OneUser) {

                            if ((int)$OneUser['id'] == (int)$OneData['from_user_id']) {
                                $UserData[$OneUser['id']] = [
                                    'from_email' => $OneUser['email'],
                                    'from_name' => $OneUser['fullname'],
                                    'from_phone' => $OneUser['phone']
                                ];
                            }
                        }
                    }
                }
            }


            if (!empty($ListDistrictId)) {
                $DistrictModel = new DistrictModel;
                $ListDistrictId = array_unique($ListDistrictId);
                $ListDistrict = $DistrictModel->whereIn('id', $ListDistrictId)->get(array('id', 'district_name'))->toArray();
                if (!empty($ListDistrict)) {
                    foreach ($ListDistrict as $val) {
                        $District[(int)$val['id']] = $val['district_name'];
                    }
                }
            }

            if (!empty($ListWardId)) {
                $WardModel = new WardModel;
                $ListWardId = array_unique($ListWardId);
                $ListWard = $WardModel->whereIn('id', $ListWardId)->get(array('id', 'ward_name'))->toArray();
                if (!empty($ListWard)) {
                    foreach ($ListWard as $val) {
                        $Ward[(int)$val['id']] = $val['ward_name'];
                    }
                }
            }


            foreach ($Data as $key => $val) {
                //$Data[$key]['barcode']  = $this->getBarcode($val['tracking_code']);
                if ((int)$val['from_city_id'] > 0 && !empty($City[(int)$val['from_city_id']])) {
                    $Data[$key]['from_city_name'] = $City[(int)$val['from_city_id']];
                }

                if ((int)$val['from_district_id'] > 0 && !empty($District[(int)$val['from_district_id']])) {
                    $Data[$key]['from_district_name'] = $District[(int)$val['from_district_id']];
                }

                $Data[$key]['from_ward_name'] = "";
                if ((int)$val['from_ward_id'] > 0 && !empty($Ward[(int)$val['from_ward_id']])) {
                    $Data[$key]['from_ward_name'] = $Ward[(int)$val['from_ward_id']];
                }


                if ((int)$val['from_user_id'] > 0 && !empty($UserData[(int)$val['from_user_id']])) {

                    $Data[$key] = array_merge($Data[$key], $UserData[(int)$val['from_user_id']]);
                }


                if (!empty($val['to_order_address'])) {
                    if ((int)$val['to_order_address']['city_id'] > 0 && $City[(int)$val['to_order_address']['city_id']]) {
                        $Data[$key]['to_order_address']['city_name'] = $City[(int)$val['to_order_address']['city_id']];
                    }

                    if ((int)$val['to_order_address']['province_id'] > 0 && $District[(int)$val['to_order_address']['province_id']]) {
                        $Data[$key]['to_order_address']['province_name'] = $District[(int)$val['to_order_address']['province_id']];
                    }

                    if ((int)$val['to_order_address']['ward_id'] > 0 && $Ward[(int)$val['to_order_address']['ward_id']]) {
                        $Data[$key]['to_order_address']['ward_name'] = $Ward[(int)$val['to_order_address']['ward_id']];
                    }
                }
            }
        }


        $contents = array(
            'error' => false,
            'message' => 'success',
            'total' => $Total,
            'total_page' => ceil($Total / $itemPage),
            'data' => $Data
        );

        return Response::json($contents);
    }


    /**
     * Sellercentral Order Process
     * @desc : Lấy tổng số vận đơn cần xử lý theo group
     *
     */
    public function getGroupOrderProcess()
    {
        $TimeStart          = Input::has('time_start') ? (int)Input::get('time_start') : 0; //  7 day  - 14 day  -  30day  - 90 day
        $TimeCreateStart    = Input::has('time_create_start') ? (int)Input::get('time_create_start') : 0; // time_create start   time_stamp
        $TimeCreateEnd      = Input::has('time_create_end') ? (int)Input::get('time_create_end') : 0; // time_create end
        $TimeAcceptStart    = Input::has('time_accept_start') ? (int)Input::get('time_accept_start') : 0; // time_accept start
        $TimeAcceptEnd      = Input::has('time_accept_end') ? (int)Input::get('time_accept_end') : 0; // time_accept end
        $cmd                = Input::has('cmd') ? (string)Input::get('cmd') : "";
        $ByVip              = Input::has('by_vip') ? trim(Input::get('by_vip')) : '';

        $UserInfo = $this->UserInfo();
        $id       = (int)$UserInfo['id'];

        $totalOverWeight = 0;
        $Model           = new OrdersModel;

        if (!empty($ByVip)) {
            $_userInfo   = new UserInfoModel;
            $listUserVip = $_userInfo->where('is_vip', 1)->select('user_id')->get()->toArray();
            if ($listUserVip) {
                $listUserVip = array_map(function ($value) {
                    return $value['user_id'];
                }, $listUserVip);

                $Model = $Model::whereIn('from_user_id', $listUserVip);
            }
        } else {
            if (!empty($id)) {
                $Model = $Model::where('from_user_id', $id);
            }
        }

        if ($TimeStart > 0) {
            $TimeCreateStart = time() - $TimeStart * 86400;
        }

        if ($TimeCreateStart > 0) {
            $Model = $Model->where('time_create', '>=', $TimeCreateStart);
        } else {
            $Model = $Model->where('time_create', '>=', strtotime(date('Y-m-1 00:00:00')));
        }

        if ($TimeCreateEnd > 0) {
            $Model = $Model->where('time_create', '<', $TimeCreateEnd);
        }
        if ($TimeAcceptStart > 0) {
            $Model = $Model->where('time_accept', '>=', $TimeAcceptStart);
        }
        if ($TimeAcceptEnd > 0) {
            $Model = $Model->where('time_accept', '<', $TimeAcceptEnd);
        }

        $ModelOverWeight = clone $Model;


        $totalOverWeight = $ModelOverWeight->join('order_detail', 'order_detail.order_id', '=', 'orders.id');
        $totalOverWeight = $totalOverWeight->where('order_detail.sc_pvk', '!=', 0)->where('orders.accept_overweight', '=', 0)->where('orders.verify_id', '=', 0)->count();


        $ListStatus = array(41, 20, 15);  // Phát KTC | Chuyển hoàn | Lấy KTC
        $GroupOrderStatusModel = new GroupOrderStatusModel;
        $ListStatusOrder = $GroupOrderStatusModel::whereIn('group_status', $ListStatus)->get(array('group_status', 'order_status_code'))->toArray();

        $ListStatus = [0];
        if (!empty($ListStatusOrder)) {
            foreach ($ListStatusOrder as $val) {
                $ListStatus[] = (int)$val['order_status_code'];
            }
        }


        $Model = $Model->whereIn('status', $ListStatus);
        $DataGroup = $Model->with(['pipe_journey'])->get(array('id', 'status'));
        $ListGroupStatus = [];


        $GROUPING = [];
        $Total = 0;
        foreach ($ListStatusOrder as $value) {

            foreach ($DataGroup as $val) {
                if ($value['order_status_code'] == $val['status']) {

                    if (!isset($GROUPING[(int)$value['group_status']])) {
                        $GROUPING[(int)$value['group_status']] = 0;
                    }

                    $GROUPING[(int)$value['group_status']]++;
                    $Total++;

                    if ($this->hasPipe($val['pipe_journey'], 707) && $value['group_status'] == 41) {
                        $GROUPING[(int)$value['group_status']]--;
                        $Total--;
                    } else if ($this->hasPipe($val['pipe_journey'], 903) && $value['group_status'] == 15) {
                        $GROUPING[(int)$value['group_status']]--;
                        $Total--;
                    }
                }
            }
        }

        if ($cmd && $cmd == 'json') {
            return Response::json(array(
                "error" => false,
                "total" => $Total + $totalOverWeight,
                "data" => ['total_group' => $GROUPING, 'total_over_weight' => $totalOverWeight],
                "message" => ""
            ));
        }
        return ['total_group' => $GROUPING, 'total_over_weight' => $totalOverWeight];
    }

    private function hasPipe($pipe_journey, $status)
    {
        foreach ($pipe_journey as $key => $item) {
            if ($item['pipe_status'] == $status) {
                return true;
            }
        }
        return false;
    }

    /**
     *  Sellercentral Order Process
     * @desc   : Lấy các vân đơn cần xử lý (giao không thành công / chờ xn chuyển hoàn / vượt cân )
     * @author : ThinhNV
     */


    public function getOrderProcess($tracking_code = "")
    {
        $page       = Input::has('page')  ? (int)Input::get('page') : 1;
        $itemPage   = Input::has('limit') ? (int)Input::get('limit') : 20;
        $Cmd        = Input::has('cmd')   ? trim(Input::get('cmd')) : '';


        $Model = $this->GetModelProcess();

        if(!empty($tracking_code)){
            $Model = $Model->where('tracking_code', $tracking_code);
        }


        $Total = 0;
        $Data = [];
        $District = [];

        $ModelTotal = clone $Model;
        $Total = $ModelTotal->count();

        if ($Total > 0) {
            $itemPage = (int)$itemPage;
            $offset = ($page - 1) * $itemPage;
            $Data = $Model->orderBy('time_create', 'DESC')
                ->with(['OrderDetail', 'MetaStatus', 'ToOrderAddress', 'pipe_journey', 'OrderStatus', 'Postman'=> function ($q){
                    return $q->select(['id', 'name', 'phone']);
                }]);
            if ($Cmd == 'export') {
                return $this->ExportExcel($Data->get(
                    array(
                        'orders.id',
                        'tracking_code',
                        'status',
                        'to_name',
                        'to_phone',
                        'to_email',
                        'total_amount',
                        'total_weight',
                        'over_weight',
                        'to_address_id',
                        'product_name',
                        'courier_id',
                        'time_create',
                        'time_update',

                        'verify_id',
                        'from_address',
                        'from_district_id',
                        'from_ward_id',
                        'from_user_id',
                        'time_accept',
                        'time_pickup',
                        'time_success',
                        'courier_tracking_code',
                        'service_id',
                        'from_city_id',
                        'order_code',
                        'num_delivery'

                    ))->ToArray());
            }
            // 'id','tracking_code', 'status','to_name','to_phone','to_email','total_amount','total_weight','to_address_id', 'product_name','courier_id','time_create', 'verify_id'
            $Data = $Data->skip($offset)
                ->take($itemPage);

            $field_get = array('orders.id', 'orders.postman_id', 'tracking_code', 'status', 'to_name', 'to_phone', 'to_email', 'total_amount', 'total_weight', 'over_weight',
                    'to_address_id', 'product_name', 'courier_id', 'time_create', 'time_update','time_accept', 'time_pickup',  'verify_id', 'from_address', 'num_delivery');

            
            $Data = $Data->get($field_get);
            

            if (!empty($Data)) {


                $ListDistrictId = [];
                $ListWardId = [];
                $District = [];
                $ListCity = [];
                $Ward = [];

                $PipeStatusModel = new PipeStatusModel;
                $PipeStatusModel = $PipeStatusModel->where('type', 1)->where('active', 1)->get()->toArray();
                $PipeStatus = [];
                foreach ($PipeStatusModel as $key => $value) {
                    $PipeStatus[$value['status']] = $value['name'];
                }
                $OrderStatus = $this->getStatus();

                foreach ($Data as $k => $val) {
                    $ListDistrictId[] = (int)$val['to_order_address']['province_id'];
                    $ListWardId[] = (int)$val['to_order_address']['ward_id'];

                    foreach ($val['order_status'] as $key => $value) {
                        if (!empty($OrderStatus[$value['status']])) {
                            $Data[$k]['order_status'][$key]['status_name'] = $OrderStatus[$value['status']];
                        }
                    }

                    foreach ($val['pipe_journey'] as $key => $value) {
                        if (!empty($PipeStatus[$value['pipe_status']])) {
                            $Data[$k]['pipe_journey'][$key]['pipe_status_name'] = $PipeStatus[$value['pipe_status']];
                        }
                    }
                }

                $ListDistrictId = array_unique($ListDistrictId);
                $ListWardId     = array_unique($ListWardId);
                $ListCity       = $this->getCity();


                if (!empty($ListDistrictId)) {
                    $District = $this->getProvince($ListDistrictId);
                }
                if (!empty($ListWardId)) {
                    $Ward = $this->getWard($ListWardId);
                }

                foreach ($Data as $key => $val) {
                    if (!empty($District[$val['to_order_address']['province_id']])) {
                        $Data[$key]['to_order_address']['province_name'] = $District[$val['to_order_address']['province_id']];
                    }

                    if (!empty($ListCity[$val['to_order_address']['city_id']])) {
                        $Data[$key]['to_order_address']['city_name'] = $ListCity[$val['to_order_address']['city_id']];
                    }

                    if (!empty($Ward[$val['to_order_address']['ward_id']])) {
                        $Data[$key]['to_order_address']['ward_name'] = $Ward[$val['to_order_address']['ward_id']];
                    }
                }


            }
        }


        if ($Cmd == 'demo') {
            $Data = [];

            foreach (array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) as $key => $value) {

                $Data[] = [
                    "id" => 703854,
                    "tracking_code" => "SC51319230867",
                    "status" => 52,
                    "to_name" => "Vũ Đức Hải",
                    "to_phone" => "0983379992",
                    "to_email" => "",
                    "total_amount" => 420000,
                    "total_weight" => 520,
                    "over_weight" => 270,
                    "to_address_id" => 562701,
                    "product_name" => "Bật lửa điện zippo black dragon,",
                    "courier_id" => 1,
                    "time_create" => 1439198120,
                    "time_update" => 1439389619,
                    "time_accept" => 1439389619,
                    "verify_id" => 0,
                    "from_address" => "KCN Quang Minh",
                    "num_delivery" => 1,
                    "order_detail" => [
                        "id" => 701976,
                        "order_id" => 703854,
                        "sc_pvc" => 18000,
                        "sc_cod" => 10000,
                        "sc_pbh" => 0,
                        "sc_pvk" => 12000,
                        "sc_pch" => 0,
                        "sc_discount_pvc" => 0,
                        "sc_discount_cod" => 0,
                        "seller_discount" => 0,
                        "seller_pvc" => 0,
                        "seller_cod" => 0,
                        "money_collect" => 420000
                    ],
                    "meta_status" => [
                        "id" => 18,
                        "code" => 52,
                        "name" => "Đã phát thành công"
                    ],
                    "to_order_address" => [
                        "id" => 562701,
                        "seller_id" => 30788,
                        "city_id" => 22,
                        "city_name" => "Hà Nọi",
                        "province_id" => 216,
                        "ward_id" => 0,
                        "address" => "Ngõ 2 Nguyễn Văn Tố, Phường Quang Trung",
                        "time_update" => 1439198120,
                        "province_name" => "Thành Phố Hải Dương"
                    ],
                    "pipe_journey" => [
                        [
                            'id' => 1,
                            'note' => 'Shop đã liên lạc với khách hàng: Khách hàng báo chưa nhận được cuộc gọi nào của bưu tá! Vậy phiền bưu tá liên lạc với khách hàng để giao hàng (nếu địa chỉ chưa rõ thì hỏi khách hàng luôn). Cám ơn!',
                            'time_create' => 1439198120,
                            'pipe_status' => 707,
                            'pipe_status_name' => 'Đã báo HVC, chờ phản hồi',
                        ],
                        [
                            'id' => 2,
                            'note' => 'Shop đã liên lạc với khách hàng: Khách hàng báo chưa nhận được cuộc gọi nào của bưu tá! Vậy phiền bưu tá liên lạc với khách hàng để giao hàng (nếu địa chỉ chưa rõ thì hỏi khách hàng luôn). Cám ơn!',
                            'time_create' => 1439198120,
                            'pipe_status' => 980,
                            'pipe_status_name' => 'Đã phát thành công',
                        ]
                    ],
                    "order_status" => [
                        [
                            "id" => 4242087,
                            "order_id" => 715763,
                            "status" => 35,
                            "status_name" => "Đang phát hàng",
                            "city_name" => "HNI Bưu cục: Công ty Hà Nội",
                            "note" => "103 / Giao cho bưu cục - Bưu cục đi lấy hàng Bưu cục: Công ty Hà Nội  Nhân viên phát: Đồng Thị  Thêu",
                            "time_create" => 1439466034
                        ],
                        [
                            "id" => 4259022,
                            "order_id" => 715763,
                            "status" => 35,
                            "status_name" => "Đang phát hàng",
                            "city_name" => " Bưu cục: ",
                            "note" => "100 / Tiếp nhận đơn hàng từ đối tác - Bưu cục tiếp nhận đi lấy hàng Bưu cục:   Nhân viên phát: ",
                            "time_create" => 1439479872
                        ]
                    ],
                    "postman" => [
                        "id"    => 6177,
                        "name"  => "Cao Bá Vĩ",
                        "phone" => "94979976942"
                    ]
                ];
            }
        }

        if(!empty($tracking_code) && sizeof($Data) > 0){
            $Data = $Data[0];
        }
        $contents = array(
            'error'         => false,
            'message'       => 'success',
            'total'         => $Total,
            'total_page'    => ceil($Total/$itemPage),
            'data'          => $Data,

        );

        return Response::json($contents);
    }


    public function getCountGroup()
    {
        $StatusOrderCtrl = new \order\StatusOrderCtrl;
        $Group = [];
        $ListGroupStatus = [];

        $ListGroup = $StatusOrderCtrl->getStatusgroup(false);

        if (!empty($ListGroup)) {
            foreach ($ListGroup as $val) {
                foreach ($val['group_order_status'] as $v) {
                    $this->list_status[$val['id']][] = (int)$v['order_status_code'];
                    $ListStatus[] = (int)$v['order_status_code'];
                    $ListGroupStatus[(int)$v['order_status_code']] = $v['group_status'];
                }
            }
        }

        if (!empty($ListStatus)) {
            $OrderModel = $this->GetModel();
            $DataGroup = $OrderModel->groupBy('status')->get(array('status', DB::raw('count(*) as count')));

            if (!empty($DataGroup)) {
                foreach ($DataGroup as $val) {
                    if (!isset($Group[(int)$ListGroupStatus[(int)$val['status']]])) {
                        $Group[(int)$ListGroupStatus[(int)$val['status']]] = 0;
                    }
                    $Group[(int)$ListGroupStatus[(int)$val['status']]] += $val['count'];
                }
            }
        }

        return $Group;

    }

  

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return Response
     */
    public function getShow($code)
    {
        $Model = $this->getModel();

        $Model = $Model->where('tracking_code', $code);

        $Data = $Model->with(array(
            'ToOrderAddress',
            'MetaStatus',

            'Courier' => function ($q) {
                return $q->select('name', 'id');
            },
            'OrderStatus' => function ($query){
                return $query->with('MetaStatus')->orderBy('time_create','DESC');
            },
            'OrderDetail',
        ))->get(array('id', 'tracking_code', 'checking', 'fragile', 'status', 'service_id', 'courier_id', 'total_weight', 'total_amount',
            'total_quantity', 'to_name', 'to_phone', 'to_email', 'product_name',
            'to_address_id', 'time_accept', 'time_create', 'time_pickup', 'time_update', 'estimate_delivery', 'verify_id', 'from_user_id', 'from_address_id', 'from_city_id',
            'from_district_id', 'from_ward_id', 'from_address', 'order_code'))->toArray();



        if (!empty($Data)) {
            foreach ($Data as $key => $val) {
                //$Data[$key]['barcode']  = $this->getBarcode($val['tracking_code']);

                $leatime_str       = "";

                if($val['estimate_delivery'] > 24){
                    $leatime_str = ceil($val['estimate_delivery'] / 24)." ngày";
                }else {
                    $leatime_str = $val['estimate_delivery']." giờ";
                }
                $Data[$key]['leatime_str'] = $leatime_str;

                
                if ((int)$val['from_city_id'] > 0) {
                    $ListCityId[] = (int)$val['from_city_id'];
                }

                if ((int)$val['from_district_id'] > 0) {
                    $ListDistrictId[] = (int)$val['from_district_id'];
                }
                if ((int)$val['from_user_id'] > 0) {
                    $ListFromUserId[] = (int)$val['from_user_id'];
                }

                if ((int)$val['from_ward_id'] > 0) {
                    $ListWardId[] = (int)$val['from_ward_id'];
                }

                foreach($val['order_status'] as $k=>$v){
                    $Data[$key]['order_status'][$k]['status_name'] = $v['meta_status']['name'];
                    unset($Data[$key]['order_status'][$k]['meta_status']);
                }

                if (!empty($val['to_order_address'])) {
                    if ((int)$val['to_order_address']['city_id'] > 0) {
                        $ListCityId[] = (int)$val['to_order_address']['city_id'];
                    }

                    if ((int)$val['to_order_address']['province_id'] > 0) {
                        $ListDistrictId[] = (int)$val['to_order_address']['province_id'];
                    }

                    if ((int)$val['to_order_address']['ward_id'] > 0) {
                        $ListWardId[] = (int)$val['to_order_address']['ward_id'];
                    }
                }
            }

            if (!empty($ListCityId)) {
                $CityModel = new CityModel;
                $ListCityId = array_unique($ListCityId);
                $ListCity = $CityModel->whereIn('id', $ListCityId)->get(array('id', 'city_name'))->toArray();
                if (!empty($ListCity)) {
                    foreach ($ListCity as $val) {
                        $City[(int)$val['id']] = $val['city_name'];
                    }
                }
            }
            $UserData = [];
            if (!empty($ListFromUserId)) {
                $ListFromUserId = array_unique($ListFromUserId);
                $ListFromUser = \User::whereIn('id', $ListFromUserId)->get(array('id', 'fullname', 'email', 'phone'))->toArray();
                if (!empty($ListFromUser)) {
                    foreach ($Data AS $OneData) {
                        foreach ($ListFromUser AS $OneUser) {

                            if ((int)$OneUser['id'] == (int)$OneData['from_user_id']) {
                                $UserData[$OneUser['id']] = [
                                    'from_email' => $OneUser['email'],
                                    'from_name' => $OneUser['fullname'],
                                    'from_phone' => $OneUser['phone']
                                ];
                            }
                        }
                    }
                }
            }


            if (!empty($ListDistrictId)) {
                $DistrictModel = new DistrictModel;
                $ListDistrictId = array_unique($ListDistrictId);
                $ListDistrict = $DistrictModel->whereIn('id', $ListDistrictId)->get(array('id', 'district_name'))->toArray();
                if (!empty($ListDistrict)) {
                    foreach ($ListDistrict as $val) {
                        $District[(int)$val['id']] = $val['district_name'];
                    }
                }
            }

            if (!empty($ListWardId)) {
                $WardModel = new WardModel;
                $ListWardId = array_unique($ListWardId);
                $ListWard = $WardModel->whereIn('id', $ListWardId)->get(array('id', 'ward_name'))->toArray();
                if (!empty($ListWard)) {
                    foreach ($ListWard as $val) {
                        $Ward[(int)$val['id']] = $val['ward_name'];
                    }
                }
            }


            foreach ($Data as $key => $val) {
                //$Data[$key]['barcode']  = $this->getBarcode($val['tracking_code']);
                if ((int)$val['from_city_id'] > 0 && !empty($City[(int)$val['from_city_id']])) {
                    $Data[$key]['from_city_name'] = $City[(int)$val['from_city_id']];
                }

                if ((int)$val['from_district_id'] > 0 && !empty($District[(int)$val['from_district_id']])) {
                    $Data[$key]['from_district_name'] = $District[(int)$val['from_district_id']];
                }

                $Data[$key]['from_ward_name'] = "";
                if ((int)$val['from_ward_id'] > 0 && !empty($Ward[(int)$val['from_ward_id']])) {
                    $Data[$key]['from_ward_name'] = $Ward[(int)$val['from_ward_id']];
                }


                if ((int)$val['from_user_id'] > 0 && !empty($UserData[(int)$val['from_user_id']])) {

                    $Data[$key] = array_merge($Data[$key], $UserData[(int)$val['from_user_id']]);
                }


                if (!empty($val['to_order_address'])) {
                    if ((int)$val['to_order_address']['city_id'] > 0 && $City[(int)$val['to_order_address']['city_id']]) {
                        $Data[$key]['to_order_address']['city_name'] = $City[(int)$val['to_order_address']['city_id']];
                    }

                    if ((int)$val['to_order_address']['province_id'] > 0 && $District[(int)$val['to_order_address']['province_id']]) {
                        $Data[$key]['to_order_address']['province_name'] = $District[(int)$val['to_order_address']['province_id']];
                    }

                    if ((int)$val['to_order_address']['ward_id'] > 0 && $Ward[(int)$val['to_order_address']['ward_id']]) {
                        $Data[$key]['to_order_address']['ward_name'] = $Ward[(int)$val['to_order_address']['ward_id']];
                    }
                }
            }
        }

        if(empty($Data)){
            return [
                'error'   => false,
                'message' => 'Không tìm thấy vận đơn với mã trên, vui lòng thử lại !',
                'data'    => []
            ];
        }

        $contents = array(
            'error' => false,
            'message' => 'success',
            'data' => $Data[0]
        );

        return Response::json($contents);
    }


}

?>