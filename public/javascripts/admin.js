$(function() {
	$('.delete_project, .delete_blogpost').click(function(e) {
		e.preventDefault();

		var url = $(this).attr('data-target');
		$.ajax({
		    url: url,
		    type: 'DELETE',
		    success: function(result) {
		        // Do something with the result
		        console.log('Successfully delete...');
		    }
		});
	});

});