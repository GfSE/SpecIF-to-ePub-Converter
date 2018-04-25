function toEpub( specifData, opts ) {
	"use strict";
	// Accepts data-sets according to SpecIF v0.10.4 or v0.11.2 and later.

	// Check for missing options:
	if ( !opts || !opts.filePath ) return null;
	opts.epubImgPath = '../Images/';
		
	// All required parameters are available, so we can begin.
	let i=null, I=null,
		ePub = toXhtml( specifData, opts );
	
	// Tutorials: 
	// - https://www.ibm.com/developerworks/xml/tutorials/x-epubtut/index.html
	// - http://www.jedisaber.com/eBooks/formatsource.shtml
	ePub.fileName = specifData.title;
	ePub.mimetype = 'application/epub+zip';

//	ePub.cover = undefined;
	ePub.styles = 	
				'body { margin-top:2%; margin-right:2%; margin-bottom:2%; margin-left:2%; font-family:Arial,sans-serif; font-size:100%; font-weight: normal; } \n'
		+		'div, p { text-align: justify; margin: 0.6em 0em 0em 0em; } \n'
		+		'div.title { text-align: center; font-size:210%; margin-top:3.6em } \n'
		+		'table.propertyTable { width:100%; border: 0px; border-collapse:collapse; margin: 0.6em 0em 0em 0em; padding: 0;} \n'
		+		'td.propertyTitle { width:25%; border: 0px; vertical-align:top; font-size: 90%; font-style: italic; margin 0; padding: 0em 0.2em 0em 0em; } \n'
		+		'table.stdInlineWithBorder, table.doors-table { width:100%; border: 1px solid #DDDDDD; border-collapse:collapse; vertical-align:top; margin: 0; padding: 0; } \n'
		+		'table.stdInlineWithBorder th, table.stdInlineWithBorder td, table.doors-table th, table.doors-table td { border: 1px solid  #DDDDDD; margin: 0; padding: 0 0.1em 0 0.1em; font-size: 90% } \n'
//		+		'h5 { font-family:Arial,sans-serif; font-size:110%; font-weight: normal; margin: 0.6em 0em 0em 0em; } \n'
		+		'h4 { font-family:Arial,sans-serif; font-size:120%; font-weight: normal; margin: 0.6em 0em 0em 0em; } \n'
		+		'h3 { font-family:Arial,sans-serif; font-size:140%; font-weight: normal; margin: 0.9em 0em 0em 0em; } \n'
		+		'h2 { font-family:Arial,sans-serif; font-size:160%; font-weight: normal; margin: 1.2em 0em 0em 0em; } \n'
		+		'h1 { font-family:Arial,sans-serif; font-size:180%; font-weight: normal; margin: 1.8em 0em 0em 0em; } \n';
	ePub.container = 
				'<?xml version="1.0" encoding="UTF-8"?>'
		+		'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
		+			'<rootfiles>'
		+				'<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>'
		+			'</rootfiles>'
		+		'</container>';
	ePub.content = 
				'<?xml version="1.0" encoding="UTF-8"?>'
		+		'<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0" >'
		+		'<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">'
		+			'<dc:identifier id="BookID" opf:scheme="UUID">SpecIF-'+specifData.id+'</dc:identifier>'	
		+			'<dc:title>'+specifData.title+'</dc:title>'
		+			'<dc:creator opf:role="aut">'+specifData.createdBy.familyName+', '+specifData.createdBy.givenName+'</dc:creator>'
		+			'<dc:publisher>'+specifData.createdBy.org.organizationName+'</dc:publisher>'
		+			'<dc:language>en-US</dc:language>'
		+			'<dc:rights>'+specifData.rights.title+'</dc:rights>'
		+		'</metadata>'
		+		'<manifest>'
		+			'<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />'
		+			'<item id="styles" href="Styles/styles.css" media-type="text/css" />'
//		+			'<item id="pagetemplate" href="page-template.xpgt" media-type="application/vnd.adobe-page-template+xml" />'
//		+			'<item id="titlepage" href="Text/title.xhtml" media-type="application/xhtml+xml" />';
	for( i=0,I=ePub.sections.length; i<I; i++ ) {
		ePub.content += '<item id="sect'+i+'" href="Text/sect'+i+'.xhtml" media-type="application/xhtml+xml" />'
	};
	for( i=0,I=ePub.images.length; i<I; i++ ) {
		ePub.content += '<item id="img'+i+'" href="Images/'+ePub.images[i].fileName+'" media-type="'+ePub.images[i].mimeType+'"/>'
	};

	ePub.content += '</manifest>'
		+		'<spine toc="ncx">'
//		+			'<itemref idref="titlepage" />'
	for( i=0,I=ePub.sections.length; i<I; i++ ) {
		ePub.content += '<itemref idref="sect'+i+'" />'
	};
	ePub.content += '</spine>'
		+		'</package>';

	ePub.toc = 	
				'<?xml version="1.0" encoding="UTF-8"?>'
		+		'<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">'
		+		'<head>'
		+			'<meta name="dtb:uid" content="SpecIF-'+specifData.id+'"/>'	
		+			'<meta name="dtb:depth" content="1"/>'				// Verschachtelungstiefe
		+			'<meta name="dtb:totalPageCount" content="0"/>'
		+			'<meta name="dtb:maxPageNumber" content="0"/>'
		+		'</head>'
		+		'<docTitle>'
		+			'<text>'+specifData.title+'</text>'
		+		'</docTitle>'
	// http://epubsecrets.com/nesting-your-toc-in-the-ncx-file-and-the-nookkindle-workaround.php
		+		'<navMap>'
/*		+			'<navPoint id="tocTitlepage" playOrder="1">'
		+				'<navLabel><text>Title Page</text></navLabel>'
		+				'<content src="Text/title.xhtml"/>'
		+			'</navPoint>'
*/
	for( i=0,I=ePub.headings.length; i<I; i++ ) {
		// not all reader support nested ncx, so we indent the title instead:
		ePub.toc += 	'<navPoint id="tocHd'+i+'" playOrder="'+(i+1)+'">'
			+				'<navLabel><text>'+ePub.headings[i].title+'</text></navLabel>'
			+				'<content src="Text/sect'+ePub.headings[i].section+'.xhtml#hd'+i+'"/>'
			+			'</navPoint>'
	};
	ePub.toc +=	'</navMap>'
		+		'</ncx>';
		
//	console.debug('ePub',ePub);
	storeEpub(ePub);
	return
	
	function storeEpub( ePub ) {
		let zip = new JSZip(),
			i=null, I=null,
			img=null;
		zip.file( "mimetype", ePub.mimetype );
		zip.file( "META-INF/container.xml", ePub.container );
		zip.file( "OEBPS/content.opf", ePub.content );

		// Add the table of contents:
		zip.file( "OEBPS/toc.ncx", ePub.toc );
		
		// Add the styles:
		if( ePub.styles ) 
			zip.file( "OEBPS/Styles/styles.css", ePub.styles );
		
//		zip.file( "OEBPS/Text/title.xhtml", ePub.title );
		// Add the hierarchies:
		for( i=0,I=ePub.sections.length; i<I; i++ ) {
			zip.file( "OEBPS/Text/sect"+i+".xhtml", ePub.sections[i] )
		};
		// Add the images:
		i=ePub.images.length;
		get( ePub.images[--i].url, saveAndNext );
		return

		function get(url,cFn) {
			// https://blog.garstasio.com/you-dont-need-jquery/
			// https://www.sitepoint.com/guide-vanilla-ajax-without-jquery/
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			// https://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
			// addressed server must support CORS for this site.
			xhr.withCredentials = "true";
			// https://stackoverflow.com/a/42916772/2214
			xhr.responseType = 'blob';
			xhr.onreadystatechange = function () {
//				console.debug('xhr',this.readyState,this.status)
				if (this.readyState==4 && this.status==200) {
//					console.debug(this);
					if( typeof cFn=="function" ) cFn(this)
				}
			};
			xhr.send(null)
		}
		function saveAndNext(rspO) {
			let name = rspO.responseURL.replace('\\','/').split("/");  // or: ...replace(/\\/g, '/')...
//			console.debug(name[name.length-1],rspO);
			zip.file( 'OEBPS/Images/'+name[name.length-1], rspO.response );
			
			if( i>0 )
				// download next image:
				get( ePub.images[--i].url, saveAndNext )
			else
				// done, store the book as ePub:
				zip.generateAsync({
						type: "blob"
					})
					.then(function(blob) {
						saveAs(blob, ePub.fileName + ".epub")
					})
		}
	}
}
