function toXhtml( specifData, opts ) {
	"use strict";
	// Accepts data-sets according to SpecIF v0.10.4 or v0.11.2 and later.

/*	// Check for missing options:
	if ( !opts
//		|| !opts.yyy
		) return;
//	if( !opts.index || opts.index>specifData.resources.length-1 ) opts.index = 0;
*/		
	// All required parameters are available, so we can begin.
	var xhtml = {
			chapters: []
	};
	
	xhtml.chapters.push(
					'<?xml version="1.0" encoding="utf-8"?>'
			+		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
			+		'<html xmlns="http://www.w3.org/1999/xhtml">'
			+		'<head>'
			+			'<link rel="stylesheet" type="text/css" href="../Styles/styles.css" />'
			+			'<title>'+specifData.title+'</title>'
			+		'</head>'
			+		'<body>'
			+			'<div class="title">'+specifData.title+'</div>'
			+		'</body>'
			+		'</html>'
	);
	xhtml.chapters.push(
					'<?xml version="1.0" encoding="utf-8"?>'
			+		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
			+		'<html xmlns="http://www.w3.org/1999/xhtml">'
			+		'<head>'
			+			'<link rel="stylesheet" type="text/css" href="../Styles/styles.css" />'
			+			'<title></title>'
			+		'</head>'
			+		'<body>'
			+			'<h1>Hello World</h1>'
			+			'<p>Lorem ipsum ...</p>'
			+		'</body>'
			+		'</html>'
	);
		
	console.debug('xhtml',xhtml);
	return xhtml
}
