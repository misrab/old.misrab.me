$(function() {
	$('.carousel').carousel({ interval: false });
	
	// when linking to slide from other button, need to select radio
	$('.carousel').on('slid.bs.carousel', function () {
		var num = $('.item.active').attr('data-id');
		$('label[data-slide-to='+num+']').click();
	});
});