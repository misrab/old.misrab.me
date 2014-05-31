// Blog page

$(function() {
	var slot = $('.white_box');
	var content = slot.html();
	
	// parse for [[[ link ]]]
	// array of urls
	var urls = content.match(/\[\[\[(.+?)\]\]\]/g);
	for (var i=0; i<urls.length; i++) {
		// remove [[[ ... ]]]
		var stripped = urls[i].replace(/[\[\]]/g, '').trim();
		// new html
		var replacer = '<div class="text-center"><img class="blog_image" src="' + stripped + '" /></div>';
		// replace in text
		content = content.replace(urls[i], replacer);
	}

	slot.html(content);
});