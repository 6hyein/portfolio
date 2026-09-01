/**
 *  ÆË¾÷
 */
const popupShow = (index) => {
    $("body").addClass("thouch-none");
    $("body").css("overflow-y","hidden");
    $(".modalArea").fadeIn();
    $("#pop"+index).fadeIn();
}
const popupClose = () => {
    $("body").removeClass("thouch-none");
    $("body").css("overflow-y","initial");
    $(".modalArea").fadeOut();
    $(".modalArea article").fadeOut();
}
// ½ÇÇà
$(document).ready(function(){
    // ÆË¾÷ 
    $(".modalArea").click(function(){
        popupClose();
    });
    $("article.modal").click(function(e){
        e.stopPropagation();
    });
});