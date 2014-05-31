$(function() {

	// set heights
	function resizeDivs() {
		$('.full_height')
		$('#welcome').height(Math.max($(window).height(), $(this).height()));
	};
	resizeDivs();
	$(window).on('resize', function() {
		resizeDivs();
	});


	// automatic scrolling
	// id e..g '#div'
	function scrollToDiv(id) {
		$('html, body').animate({
        	scrollTop: $(id).offset().top
    	}, 1000);
	};
	$('.nav_projects').click(function() {
		scrollToDiv('#projects');
	});
	$('.nav_blog').click(function() {
		scrollToDiv('#blog');
	});
	/*
	$('.nav_fun').click(function() {
		scrollToDiv('#fun');
	});*/

});