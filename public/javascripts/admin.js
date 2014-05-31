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


	$('.edit_blogpost').click(function(e) {
		e.preventDefault();

		var url = $(this).attr('data-target');
		$.get(url, function(blog) {
			if (!blog) return;

			var form = $('#blogpost_form');
			$('input[name="id"]', form).val(blog.id);
			$('input[name="title"]', form).val(blog.title);
			$('textarea[name="description"]', form).val(blog.description);
			$('textarea[name="content"]', form).val(blog.content);
		});
	});


	// override the blogpost_form to deal with editing (id)
	$('#blogpost_form').submit(function(e) {
		e.preventDefault();
		var form = $(this);
		var url = $(this).attr('action');
		var id = $('input[name="id"]', form).val();

		var blog = {
			title: 			$('input[name="title"]', form).val()
			, description: 	$('textarea[name="description"]', form).val()
			, content: 		$('textarea[name="content"]', form).val()
		};

		// PUT case
		if (id != '') {
			$.ajax({
			  url: 		url + '/' + id,
			  type: 	"PUT",
			  data: 	blog,
			  success: function(data) {
			  	// !! clear id
			  	$('input[name="id"]', form).val('');
			  	$('textarea[name="description"]', form).val('');
			  	$('textarea[name="content"]', form).val('');
			  }
			});
		// POST case
		} else {
			$.post(url, blog, function(data) {

			});
		}

	});
});