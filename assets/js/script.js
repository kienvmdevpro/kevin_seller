$(function() {

	box = {
		'model':"nhỏ",
		"l":"7.5",
		"w":"7.5",
		"h":"7.5",
		"qty":"25",
		"logo":"nhãn dán",
		"delivery":"14",
		"file":""
	};
	
	$('#file_name_succcess').hide();

	$('.box').on('click', function(e) {
		var type = $(this).data('type');
		e.preventDefault();
		
		if(type == "size")
		{
			box.l = $(this).data('length');
			box.w = $(this).data('width');
			box.h = $(this).data('height');

			box.model = $(this).data('model');
		}

		if(type == "logo")
		{
			box.logo = $(this).data('logo');
		}

		$('.quote').fadeOut('fast', function(){
			$('.quoteformholder').fadeIn('fast');
		});

		updateBox();
	});

	$('.editorder').on('click', function(e) {
		e.preventDefault();
		$('.quote').fadeOut('fast', function(){
			$('.quoteformholder').fadeIn('fast');
		});
	});

	$('.qtyinput').on('change', function(e) {
		var qty = $(this).val();
		box.qty = qty;

		updateBox();
	})

	$('.sizeinput').on('change', function(e) {
		if($(this).val() > 50)
			$(this).val(50);

		box.l = $('.linput').val();
		box.w = $('.winput').val();
		box.h = $('.hinput').val();

		updateBox();
	});

	$('.question').on('click', function(e) {
		e.preventDefault();
		var answer = $(this).next('.answer');
		$('.answer').not(answer).slideUp('fast');
		answer.slideToggle('fast');
	})

	$("select[name='city']").change(function (){
		var val  = $(this).val();
		var district = $("select[name='district']");
		district.attr('disabled', true);
		$.get('http://services.shipchung.vn/api/merchant/rest/lading/province/' + val).success(function (resp){
			district.attr('disabled', false);
			if(resp.error){
				district.html("");
				return false;
			}
			district.html("<option value=''>Chọn quận/huyện</option>");
			for (var i = resp.data.length - 1; i >= 0; i--) {
				district.append("<option value='" + resp.data[i].ProvinceId + "'>" + resp.data[i].ProvinceName + "</option>");
			};
		})
	})

	function updateBox()
	{
		if(box.model == "tùy chọn")
			box.delivery = 21;
		else
			box.delivery = 14;

		if(box.logo == "printed" && box.qty < 100)
			box.qty = 100;

		if(box.logo == "sticker" && box.qty < 25)
			box.qty = 25;

		if(box.l == "7.5" && box.w == "7.5" && box.h == "7.5")
			box.model = "nhỏ";
		else if(box.l == "18" && box.w == "15" && box.h == "7.5")
			box.model = "vừa";
		else if(box.l == "30" && box.w == "15" && box.h == "10")
			box.model = "lớn";
		else 
			box.model = "tùy chọn";

		$('.linput').val(box.l);
		$('.winput').val(box.w);
		$('.hinput').val(box.h);

		$('span.l').html(box.l);
		$('span.w').html(box.w);
		$('span.h').html(box.h);

		$('span.type').html(box.model);
		if(box.logo == "printed")
			$('span.logotype').html("in trên hộp");

		if(box.logo == "sticker")
			$('span.logotype').html("nhãn dán");

		$('span.qty').html(box.qty);
		$('span.delivery').html(box.delivery);

		$('.qtyinput').val(box.qty);
		$('.logoinput').val(box.logo);
		$('.modelinput').val(box.model);

		$('.box').removeClass('active');
		$('.box[data-model="'+box.model+'"]').addClass('active');
		$('.box[data-logo="'+box.logo+'"]').addClass('active');

	}

	updateBox();

	$('.quoteform').on('submit', function(e) {

	    e.preventDefault(); // prevent native submit

	    var buyer = {
	    	email 	: $("input[name='email']").val(),
	    	name 	: $("input[name='name']").val(),
	    	address : $("input[name='address']").val(),
	    	phone 	: $("input[name='phone']").val(),
	    	city 	: $("select[name='city']").val(),
	    	district: $("select[name='district']").val()
	    }
	   	
	   	if(box.file == ""){
	   		alert("Vui lòng tải lên logo");
	   		return;
	   	}
	   	var boxData = box ;

	   	switch (boxData.model){
	   		case 'nhỏ': 
	   			boxData.model = 'small';
	   		break;
	   		case 'vừa': 
				boxData.model = 'standard';
	   		break;	   		
	   		case 'lớn': 
				boxData.model = 'large';
	   		break;
	   		default:
	   			boxData.model = 'custom';
	   	}



	    $.post('/api/public/api/merchant/rest/box-order', {box: boxData, buyer: buyer}).success(function (data){
	    	formResponse(data);
	    }).error(function (){

	    })

	    button = $('.generatequote');
	    button.html('<img src="assets/images/loader.gif">');
		button.attr('disabled','disabled');
	});


	

	$('#upload-btn').click(function (){
		$('.progress .progress-bar').css(
                'width',
                0 + '%'
        );
		$('#file-logo').trigger('click'); 
	})

	$('#file-logo').fileupload({
	    url: '/api/public/api/merchant/rest/upload_logo',
	    dataType: 'json',
	    done: function (e, data) {
	    	if(data.result.error){
	    		alert(data.result.error_message);
	    	}else {
	    		box.file = data.result.data;
	    		$('#file_name_succcess').find('a').attr('href', 'http://cloud.shipchung.vn' + data.result.data).html(data.files[0].name);
	        	$('#file_name_succcess').show();
	    	}
	    },
	    progressall: function (e, data) {
	        var progress = parseInt(data.loaded / data.total * 100, 10);
	        $('.progress .progress-bar').css(
                'width',
                progress + '%'
            );
	    }
	}, {
	    xhrFields: {
	        withCredentials: true
	    }
    });
	
	
	function formResponse(data, statusText, xhr, $form)  { 
		container = $('.orderdetails');
		resdiv = $('.quoteresponse');

		button = $('.generatequote');
		button.html("Đặt mua").removeAttr('disabled');
		
		
		
		$('.formerror').slideUp();
		//$('.formresponse').html(data.message);

		$('.quoteformholder').fadeOut('fast', function(){
			$('.quote').fadeIn('fast');
		});

		$('.q_email').html(data.data.buyer_email);
		$('.q_address').html(data.data.buyer_address);
		$('.q_city').html($("select[name='city']").find('option:selected').html());
		$('.q_district').html($("select[name='district']").find('option:selected').html());
		//$('.q_country').html(data.buyer.country);
		$('.q_perbox').html(data.data.amount);
		$('.q_total').html("");
		$('.q_estimate').html(box.delivery + ' ngày');

		$('.paybutton').attr("href", data.data.transaction_url);
	} 

});