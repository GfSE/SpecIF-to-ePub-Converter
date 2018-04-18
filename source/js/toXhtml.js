function toXhtml( specifData, opts ) {
	"use strict";
	// Accepts data-sets according to SpecIF v0.10.4 or v0.11.2 and later.

	// Check for missing options:
//	if( !opts ) return;
	if( !opts ) opts = {};
	if( !opts.headingProperties ) opts.headingProperties = ['SpecIF:Heading','ReqIF.ChapterName','Heading','Überschrift'];
	if( !opts.titleProperties ) opts.titleProperties = ['dcterms:title','DC.title','ReqIF.Name','Title','Titel'];
	if( !opts.descriptionProperties ) opts.descriptionProperties = ['dcterms:description','DC.description','SpecIF:Diagram','ReqIF.Text','Description','Beschreibung'];
	if( !opts.hiddenProperties ) opts.hiddenProperties = [];
	if( !opts.stereotypes ) opts.stereotypes = ['SpecIF:Stereotype'];	
		
	// All required parameters are available, so we can begin.
	var xhtml = {
			chapters: []
	};
	
	xhtml.chapters.push(
		xhtmlOf( 
			specifData.title,
			'<div class="title">'+specifData.title+'</div>'
		)
	);
	for( var h=0,H=specifData.hierarchies.length; h<H; h++ )
		xhtml.chapters.push(
			xhtmlOf( 
				'',
				chapter( specifData.hierarchies[h], 1 )
			)
		);
		
//	console.debug('xhtml',xhtml);
	return xhtml
	
	function itemById(L,id) {
		if(!L||!id) return undefined;
		// given the ID of an element in a list, return the element itself:
//		id = id.trim();
		for( var i=L.length-1;i>-1;i-- )
			if( L[i].id === id ) return L[i];   // return list item
		return undefined
	}
	function dataTypeOf( dTs, sT, pCid ) {
//		console.debug( dTs, sT, pCid );
		// given an attributeType ID, return it's dataType:
		return itemById( dTs, itemById( sT.propertyClasses, pCid ).dataType )
		//                    get propertyType
		//	   get dataType
	}
	function titleOf( r, rC, opts ) {
		let ic = rC.icon;
		if( ic==undefined ) ic = '';
		if( ic ) ic += '&#160;'; // non-breakable space
		if( r.properties ) 
			for( var a=0,A=r.properties.length; a<A; a++ ) {
				if( opts.headingProperties.indexOf(r.properties[a].title)>-1
					|| opts.titleProperties.indexOf(r.properties[a].title)>-1 ) {
						return ic+r.properties[a].value
				}
			};
		return (r.title?ic+r.title:'')
	}
	function contentOf( r, rC, opts ) {
		// return the content of all properties, sorted by description and other properties:
		if( !r.properties || r.properties.length<1 ) return '';
		let a=null, A=null,
			ct = '<table class="propertyTable">';
		// The content of the title property is already used as chapter title; no need to repeat, here.
		// First the properties used for description in full width:
		for( a=0,A=r.properties.length; a<A; a++ ) {
			if( opts.headingProperties.indexOf(r.properties[a].title)>-1
				|| opts.titleProperties.indexOf(r.properties[a].title)>-1 ) continue;
			if( opts.descriptionProperties.indexOf(r.properties[a].title)>-1 ) {
				ct += '<tr><td colspan="2">'+valOf( r.properties[a] )+'</td></tr>'
			}
		};
		// Finally, the remaining properties with property title (name) and value:
		for( a=0,A=r.properties.length; a<A; a++ ) {
			if( opts.headingProperties.indexOf(r.properties[a].title)>-1
				|| opts.titleProperties.indexOf(r.properties[a].title)>-1 
				|| opts.descriptionProperties.indexOf(r.properties[a].title)>-1 ) continue;
			ct += '<tr><td class="propertyTitle">'+r.properties[a].title+'</td><td>'+valOf( r.properties[a] )+'</td></tr>'
		};
		return ct + '</table>'
		
		function valOf( pr ) {
			// return the value of a single property:
			let dT = dataTypeOf(specifData.dataTypes, rC, pr['class'] );
			switch( dT.type ) {
				case 'xs:enumeration':
					let ct = '',
						val = null,
						st = opts.stereotypes.indexOf(pr.title)>-1,
						vL = pr.value.split(',');  // in case of ENUMERATION, content carries comma-separated value-IDs
					for( var v=0,V=vL.length;v<V;v++ ) {
						val = itemById(dT.values,vL[v].trim());
						// If 'val' is an id, replace it by title, otherwise don't change:
						// Add 'double-angle quotation' in case of stereotype values.
						if( val ) ct += (v==0?'':', ')+(st?('&#x00ab;'+val.title+'&#x00bb;'):val.title)
						else ct += (v==0?'':', ')+vL[v]
					};
					return ct;
				default:
					return pr.value
			}
		}
	}
	function chapter( nd, lvl ) {
		if( !nd.nodes || nd.nodes.length<1 ) return '';
		let i=null, I=null, r=null, rC= null;
		var ch = '';
		for( i=0,I=nd.nodes.length; i<I; i++ ) {
			r = itemById( specifData.resources,nd.nodes[i].resource );
			rC = itemById( specifData.resourceClasses, r['class'] );
			ch += 	'<h'+lvl+'>'+titleOf( r, rC, opts )+'</h'+lvl+'>'
				+	contentOf( r, rC, opts )
				+	chapter( nd.nodes[i], lvl+1 )
		};
		return ch
	}
	function xhtmlOf( title, body ) {
		return	'<?xml version="1.0" encoding="utf-8"?>'
		+		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
		+		'<html xmlns="http://www.w3.org/1999/xhtml">'
		+			'<head>'
		+				'<link rel="stylesheet" type="text/css" href="../Styles/styles.css" />'
		+				'<title>'+title+'</title>'
		+			'</head>'
		+			'<body>'+body+'</body>'
		+		'</html>'
	}
}
