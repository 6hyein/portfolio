function getNowYmdHms() {
  var d = new Date();

  var yyyy = d.getFullYear();
  var MM   = ('0' + (d.getMonth() + 1)).slice(-2);
  var dd   = ('0' + d.getDate()).slice(-2);
  var hh   = ('0' + d.getHours()).slice(-2);
  var mm   = ('0' + d.getMinutes()).slice(-2);
  var ss   = ('0' + d.getSeconds()).slice(-2);

  return yyyy + MM + dd + hh + mm + ss;
}

(function($){
  var nativeSubmit = HTMLFormElement.prototype.submit;
  // 원래 submit 저장
  HTMLFormElement.prototype.submit = function() {
    var form = this;
    var mkt_chk_v = $('#agree2').is(':checked') ? 'Y' : 'N';
    var data = {
        landing_key : $("#landingkey").val(),
        phone : $('input[name="M_phone"]').val(),
        reg_date:  getNowYmdHms(),
        age : $('input[name="M_items_value_23"]').val(),
        name : $('input[name="M_name"]').val(),
        mkt_chk :mkt_chk_v
    };

    // 외부 API로 폼 데이터를 보냄
    var landingNum = $("#landingNum").val();
    $.ajax({
        url: "/intro/"+landingNum+"/js/lead_proxy.php",  
        type: "POST",
        data: data
    }).done(function(res){
      // JSON이면 객체, 문자열이면 그대로
      console.log(typeof res === "string" ? res : JSON.stringify(res));
    })
    .fail(function(xhr, s, e){
      console.log("FAIL " + xhr.status + "\n" + (xhr.responseText || ""));
    });
    return nativeSubmit.call(form);
  };
})(jQuery);