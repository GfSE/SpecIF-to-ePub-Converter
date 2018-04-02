function toEpub( specifData, opts ) {
	"use strict";
	// Accepts data-sets according to v0.10.4 or v0.11.2 and later.

/*	// Check for missing options:
	if ( !opts
//		|| !opts.canvas
		) return;
//	if( !opts.index || opts.index>specifData.resources.length-1 ) opts.index = 0;
*/		
	// All required parameters are available, so we can begin:
	var ePub = {
		title: specifData.title,
		cover: undefined,
		OEBPS: [],
		css: undefined,
		mimetype: 'application/epub+zip'
	};
	
	ePub.OEBPS.push('<h1>Hello World</h1><p>Lorem ipsum ...</p>');
		
	return ePub
}
