function toEpub( specifData, opts ) {
	"use strict";
	// Accepts data-sets according to SpecIF v0.10.4 or v0.11.2 and later.

/*	// Check for missing options:
	if ( !opts
//		|| !opts.xxx
		) return;
//	if( !opts.index || opts.index>specifData.resources.length-1 ) opts.index = 0;
*/		
	// All required parameters are available, so we can begin.
	let i=null, I=null,
		ePub = toXhtml( specifData );
	
	// A tutorial: http://www.jedisaber.com/eBooks/formatsource.shtml
	ePub.fileName = specifData.title;
	ePub.mimetype = 'application/epub+zip';
//	ePub.cover = undefined;
	ePub.styles = 	
				'body { margin-top:2%; margin-right:2%; margin-bottom:2%; margin-left:2%; } \n'
		+		'div, p { text-align: justify; font-family:Arial,sans-serif; font-size:100%; font-weight: normal; } \n'
		+		'div.title { text-align: center; font-size:210%; } \n'
//		+		'h5 { font-family:Arial,sans-serif; font-size:110%; font-weight: normal; } \n'
		+		'h4 { font-family:Arial,sans-serif; font-size:120%; font-weight: normal; } \n'
		+		'h3 { font-family:Arial,sans-serif; font-size:140%; font-weight: normal; } \n'
		+		'h2 { font-family:Arial,sans-serif; font-size:160%; font-weight: normal; } \n'
		+		'h1 { font-family:Arial,sans-serif; font-size:180%; font-weight: normal; } \n';
	ePub.container = 
				'<?xml version="1.0" encoding="utf-8"?>'
		+		'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
		+			'<rootfiles>'
		+				'<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>'
		+			'</rootfiles>'
		+		'</container>';
	ePub.content = 
				'<?xml version="1.0" encoding="utf-8"?>'
		+		'<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0" >'
		+		'<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">'
		+			'<dc:identifier id="BookID" opf:scheme="UUID">06282007214712</dc:identifier>'	// ToDo
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
	for( i=0,I=ePub.chapters.length; i<I; i++ ) {
		ePub.content += '<item id="ch'+i+'" href="Text/ch'+i+'.xhtml" media-type="application/xhtml+xml" />'
	};
/*	for( i=0,I=ePub.images.length; i<I; i++ ) {
		ePub.content += '<item id="..." href="Images/filename.svg" media-type="image/svg+xml"/>'
	};
*/
	ePub.content += '</manifest>'
		+		'<spine toc="ncx">'
//		+			'<itemref idref="titlepage" />'
	for( i=0,I=ePub.chapters.length; i<I; i++ ) {
		ePub.content += '<itemref idref="ch'+i+'" />'
	};
	ePub.content += '</spine>'
		+		'</package>';
	ePub.toc = 	
				'<?xml version="1.0" encoding="utf-8"?>'
		+		'<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">'
		+		'<head>'
		+			'<meta name="dtb:uid" content="06282007214712"/>'	// ToDo
		+			'<meta name="dtb:depth" content="1"/>'
		+			'<meta name="dtb:totalPageCount" content="0"/>'
		+			'<meta name="dtb:maxPageNumber" content="0"/>'
		+		'</head>'
		+		'<docTitle>'
		+			'<text>'+specifData.title+'</text>'
		+		'</docTitle>'
		+		'<navMap>'
/*		+			'<navPoint id="tocTitlepage" playOrder="1">'
		+				'<navLabel><text>Title Page</text></navLabel>'
		+				'<content src="Text/title.xhtml"/>'
		+			'</navPoint>'
*/
	for( i=0,I=ePub.chapters.length; i<I; i++ ) {
		ePub.toc += 	'<navPoint id="tocCh'+i+'" playOrder="'+(i+1)+'">'
			+				'<navLabel><text>Chapter '+i+'</text></navLabel>'	// ToDo: add real chapter title
			+				'<content src="Text/ch'+i+'.xhtml"/>'
			+			'</navPoint>'
	};
	ePub.toc +=	'</navMap>'
		+		'</ncx>';
		
	console.debug('ePub',ePub);
	createEpub(ePub);
	return
	
	function createEpub( ePub ) {
		let zip = new JSZip(),
			i=null, I=null;
		zip.file( "mimetype", ePub.mimetype );
		zip.file( "META-INF/container.xml", ePub.container );
		zip.file( "OEBPS/content.opf", ePub.content );
//		zip.file( "OEBPS/Text/title.xhtml", ePub.title );
		for( i=0,I=ePub.chapters.length; i<I; i++ ) {
			zip.file( "OEBPS/Text/ch"+i+".xhtml", ePub.chapters[i] )
		};
/*		for( i=0,I=ePub.images.length; i<I; i++ ) {
			zip.file( "OEBPS/Images/img"+i+".svg", ePub.images[i] )
		};
*/		zip.file( "OEBPS/toc.ncx", ePub.toc );
		if( ePub.styles ) 
			zip.file( "OEBPS/Styles/styles.css", ePub.styles );
		zip.generateAsync({
				type: "blob"
			})
			.then(function(blob) {
				saveAs(blob, ePub.fileName + ".epub")
			})
	}
}
