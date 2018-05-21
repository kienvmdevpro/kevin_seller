(function (app) {
    app
        .constant('Api_Path', {
            Seller          :   ApiSeller,
            Base            :   ApiPath,
            User            :   ApiPath+'user/',
            UserInfo        :   ApiPath+'user-info/',
            ApiKey          :   ApiPath+'api-key/',
            Bussiness       :   ApiPath+'bussiness-info/',
            FeeConfig       :   ApiPath+'fee-config/',
            Inventory       :   ApiPath+'inventory-config/',
            CashIn          :   ApiPath+'user-cash-in/',
            Order           :   ApiPath+'order',
            PublicOrder     :   ApiPath+'public-order',
            OrderStatus     :   ApiPath+'order-status',
            ChangeOrder     :   ApiPath+'order-change',
            OrderProcess    :   ApiPath+'order-process/',
            OrderLading     :   ApiRest+'lading/',
            OrderVerify     :   ApiPath+'order-verify',
            OrderInvoice    :   ApiPath+'order-invoice',
            Transaction     :   ApiPath+'transaction',
            Search          :   'http://s.shipchung.vn/address/_search?q=name:',
            SearchProduct   :   'http://s.shipchung.vn/jdbc/_search?type=myitem&q=name:',
            SearchBuyer     :   'http://s.shipchung.vn/jdbc/_search?type=mybuyer&q=fullname:',
            Barcode         :   ApiPath+'order/barcode/',
            Upload          :   ApiPath+'upload/'
        })
        .constant('Config_Status', {
            Priority             :  [1, 2, 3, 4, 5],
            Ticket               :  [
                                        { code : 'ALL'                      , content : 'Tất cả'},
                                        { code : 'NEW_ISSUE'                , content : 'Mới tạo (chờ tiếp nhận)'},
                                        { code : 'ASSIGNED'                 , content : 'Đã tiếp nhận (Chờ xử lý)'},
                                        { code : 'PENDING_FOR_CUSTOMER'     , content : 'Đã trả lời (Chờ phản hồi)'},
                                        { code : 'CUSTOMER_REPLY'           , content : 'Đã phản hồi(Chờ trả lời)'},
                                        { code : 'PROCESSED'                , content : 'Đã xử lý (Chờ đóng)'},
                                        { code : 'CLOSED'                   , content : 'Đã đóng'}
                                    ],
            ticket_btn          :    {
                                        'NEW_ISSUE'     : {
                                            'name'      : 'Yêu cầu mới',
                                            'bg'        : 'bg-info'
                                        },
                                        'ASSIGNED'      : {
                                            'name'      : 'Đã tiếp nhận',
                                            'bg'        : 'bg-primary'    
                                        },
                                        'PENDING_FOR_CUSTOMER'  : {
                                            'name'      : 'Chờ phản hồi',
                                            'bg'        : 'bg-warning'    
                                        },

                                        'CUSTOMER_REPLY'  : {
                                            'name'      : 'Chờ trả lời',
                                            'bg'        : 'bg-primary'    
                                        },
                                        'PROCESSED'     : {
                                            'name'      : 'Đã xử lý',
                                            'bg'        : 'bg-success'
                                        },
                                        'CLOSED'        : {
                                            'name'      : 'Đã đóng',
                                            'bg'        : 'bg-light dker'
                                        }
                                    },
            order_color          :    {
                                            12   : 'bg-info',
                                            13   : 'bg-info dker',
                                            14   :'bg-warning',
                                            15   :'bg-light dker',
                                            16   :'bg-orange',
                                            17   :'bg-orange',
                                            18   :'bg-danger lt',
                                            19   :'bg-success bg',
                                            20   :'bg-primary lter',
                                            21  :'bg-primary',
                                            22  :'bg-danger'
                                    },
            ExcelOrder           : {
                                        'ALL'               : 'Tất cả',
                                        'SUCCESS'           : 'Tạo thành công',
                                        'FAIL'              : 'Tạo thất bại',
                                        'CANCEL'            : 'Đã hủy',
                                        'USER_NOT_EXISTS'   : 'Email không tồn tại',
                                        'INVENTORY_NOT_EXISTS' : 'Bạn chưa cấu hình kho hàng'
                                    },
            CourierPrefix               : {
                                        1: 'vtp',
                                        2: 'vnp',
                                        3: 'ghn',
                                        4: 'gao',
                                        5: 'net',
                                        6: 'gtk',
                                        7: 'sc',
                                        8: 'ems',
                                        9: 'gts',
                                        10: 'ctp'
                                    }
        })
        .constant('Config_Accounting', {
            list_bank       :  [{code:'VCB'  ,name:'Ngân hàng TMCP Ngoại Thương Việt Nam(VIETCOMBANK)'},
                                {code:'DAB' ,name:'Ngân hàng Đông Á (DAB)'},
                                {code:'TCB' ,name:'Ngân hàng Kỹ Thương (TECHCOMBANK)'},
                                {code:'VIB' ,name:'Ngân hàng Quốc tế(VIB)'},
                                {code:'MBB'  ,name:'Ngân Hàng Quân Đội (MB BANK)'},
                                {code:'ICB' ,name:'Ngân hàng Công Thương Việt Nam(VIETINBANK)'},
                                {code:'HDB' ,name:'Ngân hàng Phát triển Nhà TPHCM (HD BANK)'},
                                {code:'EXB' ,name:'Ngân hàng Xuất Nhập Khẩu(EXIMBANK)'},
                                {code:'ACB' ,name:'Ngân hàng Á Châu (ACB)'},
                                {code:'SHB' ,name:'Ngân hàng Sài Gòn-Hà Nội (SHB)'},
                                {code:'PGB' ,name:'Ngân hàng Xăng dầu Petrolimex (PGB)'},
                                {code:'TPB' ,name:'Ngân hàng Tiền Phong (TPB)'},
                                {code:'SCB' ,name:'Ngân hàng Sài Gòn Thương tín (SCB)'},
                                {code:'MSB' ,name:'Ngân hàng Hàng Hải (MSB)'},
                                {code:'AGB' ,name:'Ngân hàng Nông nghiệp & Phát triển nông thôn (AGB)'},
                                {code:'BIDV',name:'Ngân hàng Đầu tư & Phát triển Việt Nam (BIDV)'}
                                ],
            bank            : {
                                'VCB'   : 'Ngân hàng TMCP Ngoại Thương Việt Nam(VIETCOMBANK)',
                                'DAB'   : 'Ngân hàng Đông Á',
                                'TCB'   : 'Ngân hàng Kỹ Thương (TECHCOMBANK)',
                                'VIB'   : 'Ngân hàng Quốc tế(VIB)',
                                'MBB'    : 'Ngân Hàng Quân Đội (MB BANK)',
                                'ICB'   : 'Ngân hàng Công Thương Việt Nam(VIETINBANK)',
                                'HDB'   : 'Ngân hàng Phát triển Nhà TPHCM (HD BANK)',
                                'EXB'   : 'Ngân hàng Xuất Nhập Khẩu(EXIMBANK)',
                                'ACB'   : 'Ngân hàng Á Châu (ACB)',
                                'SHB'   : 'Ngân hàng Sài Gòn-Hà Nội',
                                'PGB'   : 'Ngân hàng Xăng dầu Petrolimex',
                                'TPB'   : 'Ngân hàng Tiền Phong',
                                'SCB'   : 'Ngân hàng Sài Gòn Thương tín',
                                'MSB'   : 'Ngân hàng Hàng Hải',
                                'AGB'   : 'Ngân hàng Nông nghiệp & Phát triển nông thôn (AGB)',
                                'BIDV'  : 'Ngân hàng Đầu tư & Phát triển Việt Nam (BIDV)'
                            },
            vimo_bank   :   [
                                {code :'ABB',    name        : 'ABBank - Ngân hàng TMCP An Bình'}, // ok
                                {code :'ACB',    name        : 'ACB - Ngân hàng TMCP Á Châu'}, // ok
                                //{code :'AGB',  name        : 'Ngân hàng Nông nghiệp & Phát triển nông thôn (AGB)'}, // added
                                //{code :'ANZ',  name        : 'Ngân hàng ANZ'}, // added
                                {code :'BAB',    name        : 'BacA Bank - Ngân hàng TMCP Bắc Á'},// ok
                                //{code :'BIDV', name        :'Ngân hàng Đầu tư & Phát triển Việt Nam (BIDV)'}, //add 
                                {code : 'BVB',   name       : 'Baoviet Bank - Ngân hàng TMCP Bảo Việt'}, // ok
                                {code : 'GAB',   name       : 'DaiA Bank - Ngân hàng TMCP Đại Á'}, // ok  : old DAB
                                {code : 'EXB',   name       : 'Eximbank - Ngân hàng TMCP XNK Việt Nam'}, //ok 
                                {code : 'GPB',   name       : 'GPBank - Ngân hàng TMCP Dầu khí Toàn Cầu'}, //ok 
                                {code : 'HDB',   name       : 'HD Bank - Ngân hàng Phát triển Nhà TPHCM'}, //ok
                                {code : 'LVB',   name        : 'Lien Viet Post Bank - Ngân hàng Bưu Điện Liên Việt'}, // ok : old VLPB
                                {code : 'MBB',   name       : 'MB Bank - Ngân hàng TMCP Quân Đội'}, //ok 
                                {code : 'MHB',   name       : 'MHB - Ngân hàng TMCP PT Nhà Đồng bằng sông Cửu Long'}, //ok
                                {code : 'NVB',   name       : 'Navibank - Ngân hàng TMCP Nam Việt'}, //ok
                                {code : 'OJB',   name        : 'OceanBank - Ngân hàng TMCP Đại Dương'}, // ok old : OCEB
                                {code : 'SCB',   name       : 'Sacombank - Ngân hàng TMCP Sài Gòn thương tín'}, //ok 
                                {code : 'SHB',   name       : 'SHB - Ngân hàng TMCP Sài Gòn - Hà Nội'}, //ok
                                {code : 'TCB',   name       : 'Techcombank - Ngân hàng TMCP Kỹ Thương Việt Nam'}, //ok
                                {code : 'TPB',   name       : 'TienPhong Bank - Ngân hàng TMCP Tiên Phong'}, //ok
                                {code : 'VIB',   name       : 'VIB - Ngân hàng TMCP Quốc tế'}, //ok
                                {code : 'VAB',   name       : 'Viet A Bank - Ngân hàng TMCP Việt Á'}, //ok
                                {code : 'VCB',   name       : 'Vietcombank - Ngân hàng TMCP Ngoại Thương Việt Nam'}, //ok
                                {code : 'ICB',   name       : 'VietinBank - Ngân hàng TMCP Công Thương Việt Nam'}, //ok
                                {code : 'VPB',   name       : 'VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng'}, //ok,
                                {code : 'HLBVN', name     : 'Ngân hàng Hong Leong Việt Nam'},//add 
                                {code : 'OCB',   name       : 'Ngân hàng TMCP Phương Đông'}, 
                                {code : 'NONE',  name     : 'Ngân hàng khác (áp dụng với thẻ visa)'}//add 
                            ] ,
            vimo   :   [
                {'ABB'        : 'ABBank - Ngân hàng TMCP An Bình'}, // ok
                {'ACB'        : 'ACB - Ngân hàng TMCP Á Châu'}, // ok
                //{'AGB'        : 'Ngân hàng Nông nghiệp & Phát triển nông thôn (AGB)'}, // added
                //{'ANZ'        : 'Ngân hàng ANZ'}, // added
                {'BAB'        : 'BacA Bank - Ngân hàng TMCP Bắc Á'},// ok
                //{'BIDV'        :'Ngân hàng Đầu tư & Phát triển Việt Nam (BIDV)'}, //add 
                {'BVB'       : 'Baoviet Bank - Ngân hàng TMCP Bảo Việt'}, // ok
                {'GAB'       : 'DaiA Bank - Ngân hàng TMCP Đại Á'}, // ok  : old DAB
                {'EXB'       : 'Eximbank - Ngân hàng TMCP XNK Việt Nam'}, //ok 
                {'GPB'       : 'GPBank - Ngân hàng TMCP Dầu khí Toàn Cầu'}, //ok 
                {'HDB'       : 'HD Bank - Ngân hàng Phát triển Nhà TPHCM'}, //ok
                {'LVB'       : 'Lien Viet Post Bank - Ngân hàng Bưu Điện Liên Việt'}, // ok : old VLPB
                {'MBB'       : 'MB Bank - Ngân hàng TMCP Quân Đội'}, //ok 
                {'MHB'       : 'MHB - Ngân hàng TMCP PT Nhà Đồng bằng sông Cửu Long'}, //ok
                {'NVB'       : 'Navibank - Ngân hàng TMCP Nam Việt'}, //ok
                {'OJB'       : 'OceanBank - Ngân hàng TMCP Đại Dương'}, // ok old : OCEB
                {'SCB'       : 'Sacombank - Ngân hàng TMCP Sài Gòn thương tín'}, //ok 
                {'SHB'       : 'SHB - Ngân hàng TMCP Sài Gòn - Hà Nội'}, //ok
                {'TCB'       : 'Techcombank - Ngân hàng TMCP Kỹ Thương Việt Nam'}, //ok
                {'TPB'       : 'TienPhong Bank - Ngân hàng TMCP Tiên Phong'}, //ok
                {'VIB'       : 'VIB - Ngân hàng TMCP Quốc tế'}, //ok
                {'VAB'       : 'Viet A Bank - Ngân hàng TMCP Việt Á'}, //ok
                {'VCB'       : 'Vietcombank - Ngân hàng TMCP Ngoại Thương Việt Nam'}, //ok
                {'ICB'       : 'VietinBank - Ngân hàng TMCP Công Thương Việt Nam'}, //ok
                {'VPB'       : 'VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng'}, //ok,
                {'HLBVN'     : 'Ngân hàng Hong Leong Việt Nam'},//add 
                {'OCB'       : 'Ngân hàng TMCP Phương Đông'}, //add 
                {'NONE'      : 'Ngân hàng khác (áp dụng với thẻ visa)'}//add 
            ]
        })
        .constant('Config_Child', {
            Roles            :  [{id: 1,name:'Quản lý'}]
        })
        .constant('OrderStatus', {
            pay_pvc            :    {
                                        1 : 'Thu tiền hàng và phí vận chuyển',
                                        2 : 'Chỉ thu tiền hàng, miễn phí vận chuyển',
                                        3 : 'Chỉ thu tiền phí vận chuyển',
                                        4 : 'Không thu tiền'
                                    },
            list_pay_pvc            :    [
                                            {
                                                'id'    : 1,
                                                'name'  : 'Thu tiền hàng và phí vận chuyển'
                                            },
                                            {
                                                'id'    : 2,
                                                'name'  : 'Chỉ thu tiền hàng, miễn phí vận chuyển'
                                            },
                                            {
                                                'id'    : 3,
                                                'name'  : 'Chỉ thu tiền phí vận chuyển'
                                            },
                                            {
                                                'id'    : 4,
                                                'name'  : 'Không thu tiền'
                                            }
                                    ],
            service            :    {
                                        1 : 'Chuyển phát tiết kiệm',
                                        2 : 'Chuyển phát nhanh'
                                    },
            list_service            :    [
                                            {
                                                'id'    : 1,
                                                'name'  : 'Chuyển phát tiết kiệm'
                                            },
                                            {
                                                'id'    : 2,
                                                'name'  : 'Chuyển phát nhanh'
                                            }
                                        ]
        })
    ;
})(app);