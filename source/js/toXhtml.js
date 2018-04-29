function toXhtml( specifData, opts ) {
	"use strict";
	// Accepts data-sets according to SpecIF v0.10.4 or v0.11.2 and later.
	// Limitations:
	// - HTML ids are made from resource ids, so multiple reference of a resource results in mutiple occurrences of the same id.
	// - Title links are only correct if they reference objects in the same SpecIF hierarchy (hence, the same xhtml file)

	// Check for missing options:
//	if( !opts ) return;
	if( !opts ) opts = {};
	if( !opts.headingProperties ) opts.headingProperties = ['SpecIF:Heading','ReqIF.ChapterName','Heading','Überschrift'];
	if( !opts.titleProperties ) opts.titleProperties = ['dcterms:title','DC.title','ReqIF.Name','Title','Titel'];
	if( !opts.descriptionProperties ) opts.descriptionProperties = ['dcterms:description','DC.description','SpecIF:Diagram','ReqIF.Text','Description','Beschreibung'];
	if( !opts.hiddenProperties ) opts.hiddenProperties = [];
	if( !opts.stereotypes ) opts.stereotypes = ['SpecIF:Stereotype'];	
	if( !opts.propertiesLabel ) opts.propertiesLabel = ['Properties'];	
	if( !opts.statementsLabel ) opts.statementsLabel = ['Statements'];	
	if( !opts.titleLinkBegin ) opts.titleLinkBegin = '\\[\\[';		// must escape javascript AND RegExp
	if( !opts.titleLinkEnd ) opts.titleLinkEnd = '\\]\\]';			// must escape javascript AND RegExp
	if( opts.titleLinkMinLength==undefined ) opts.titleLinkMinLength = 4;	
	opts.addTitleLinks = opts.titleLinkBegin && opts.titleLinkEnd && opts.titleLinkMinLength>0;
	if( opts.titleLinkBegin && opts.titleLinkEnd )
		opts.RETitleLink = new RegExp( opts.titleLinkBegin+'(.+?)'+opts.titleLinkEnd, 'g' );
	
	// All required parameters are available, so we can begin.
	var xhtml = {
			headings: [],
			sections: []
		};
	
	if( specifData.files && specifData.files.length>0 )
		xhtml.images = specifData.files
	else
		xhtml.images = [];
	opts.collectReferencedFiles = xhtml.images.length<1;
		
//	pushHeading( specifData.title, specifData.id, 1 );
	xhtml.sections.push(
		xhtmlOf( 
			specifData.title,
			null,
			null,
			'<div class="title">'+specifData.title+'</div>'
		)
	);
	for( var h=0,H=specifData.hierarchies.length; h<H; h++ ) {
		pushHeading( specifData.hierarchies[h].title, specifData.hierarchies[h].id, {level: 1} );
		xhtml.sections.push(
			xhtmlOf( 
				specifData.title,
				specifData.hierarchies[h].id,
				specifData.hierarchies[h].title,
				chapter( specifData.hierarchies[h], 1 )
			)
		)
	};
		
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
	function indexBy( L, p, s ) {
		if(!L||!p||!s) return -1;
		// Return the index of an element in list 'L' whose property 'p' equals searchterm 's':
		// hand in property and searchTerm as string !
		for( var i=L.length-1;i>-1;i-- )
			if (L[i][p] === s) return i;
		return -1
	}
/*	function utf8ToXmlChar(str) {
		let i = str.length,
			aRet = [];
		while (i--) {
			let iC = str[i].charCodeAt(0);
			if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) aRet[i] = '&#' + iC + ';';
			else aRet[i] = str[i];
		}
		return aRet.join('');
	}
*/
	function dataTypeOf( dTs, sT, pCid ) {
//		console.debug( dTs, sT, pCid );
		// given an attributeType ID, return it's dataType:
		return itemById( dTs, itemById( sT.propertyClasses, pCid ).dataType )
		//                    get propertyType
		//	   get dataType
	}
	function pushHeading( t, id, pars ) {
		xhtml.headings.push({
				title: t,
				id: id,
				section: xhtml.sections.length,  // the index of the section in preparation (before it is pushed)
				level: pars.level
		})
	}
	function titleValOf( r, rC, opts ) {
		if( r.properties ) {
			let pr=null;
			for( var a=0,A=r.properties.length; a<A; a++ ) {
				pr = r.properties[a];
				rC.isHeading = rC.isHeading || opts.headingProperties.indexOf(pr.title)>-1;
				if( opts.headingProperties.indexOf(pr.title)>-1
					|| opts.titleProperties.indexOf(pr.title)>-1 ) {
//						ti = utf8ToXmlChar( pr.value );
						return pr.value
				}
			}
		};
//		return utf8ToXmlChar( r.title )
		return r.title
	}
	function titleOf( r, rC, pars, opts ) {
		let ic = rC.icon;
		if( ic==undefined ) ic = '';
//		if( ic ) ic = utf8ToXmlChar( ic )+'&#160;'; // non-breakable space
		if( ic ) ic += '&#160;'; // non-breakable space
		let ti = titleValOf( r, rC, opts );
		if( !pars || pars.level<1 ) return (ti?ic+ti:'');
		if( rC.isHeading ) pushHeading( ti, r.id, pars );
		let h = rC.isHeading?2:3;
		return '<h'+h+' id="'+r.id+'">'+(ti?ic+ti:'')+'</h'+h+'>'
	}
	function statementsOf( r, opts ) {
		if( !opts.statementsLabel ) return '';
		let i, I, sts={}, st, cl, cid, oid, sid, ct='', r2, noSts=true;
		// Collect statements by type:
		for( i=0, I=specifData.statements.length; i<I; i++ ) {
			st = specifData.statements[i];
			cid = st['class'];
			// SpecIF v0.10.x: subject/object without revision, v0.11.y: with revision
			oid = st.object.id || st.object;
			sid = st.subject.id || st.subject;
//			console.debug(st,cid);
			if( sid==r.id || oid==r.id ) {
				noSts = false;
				if( !sts[cid] ) sts[cid] = {subjects:[],objects:[]};
				if( sid==r.id ) sts[cid].objects.push( itemById(specifData.resources,oid) )
				else sts[cid].subjects.push( itemById(specifData.resources,sid) )
			}
		};
//		console.debug( 'statements', r.title, sts );
//		if( Object.keys(sts).length<1 ) return '';
		if( noSts ) return '';
		ct = '<p class="metaTitle">'+opts.statementsLabel+'</p>';
		ct += '<table class="statementTable"><tbody>';
		for( cid in sts ) {
			// we don't have (and don't need) the individual statement, just the class:
			cl = itemById(specifData.statementClasses,cid);
/*			// 5 columns:
			ct += '<tr><td>';
			for( i=0, I=sts[cid].subjects.length; i<I; i++ ) {
				r2 = sts[cid].subjects[i];
//				console.debug('r2',r2,itemById( specifData.resourceClasses, r2['class']))
				ct += '<a href="#'+r2.id+'">'+titleOf( r2, itemById( specifData.resourceClasses, r2['class']), null, opts )+'</a><br/>'
			};
			ct += '</td><td class="statementTitle">'+(sts[cid].subjects.length>0?cl.title:'');
			ct += '</td><td>'+titleOf( r, itemById(specifData.resourceClasses,r['class']), null, opts );
			ct += '</td><td class="statementTitle">'+(sts[cid].objects.length>0?cl.title:'')+'</td><td>';
			for( i=0, I=sts[cid].objects.length; i<I; i++ ) {
				r2 = sts[cid].objects[i];
				ct += '<a href="#'+r2.id+'">'+titleOf( r2, itemById( specifData.resourceClasses, r2['class']), null, opts )+'</a><br/>'
			};
			ct += '</td></tr>'
*/
			// 3 columns:
			if( sts[cid].subjects.length>0 ) {
				ct += '<tr><td>';
				for( i=0, I=sts[cid].subjects.length; i<I; i++ ) {
					r2 = sts[cid].subjects[i];
	//				console.debug('r2',r2,itemById( specifData.resourceClasses, r2['class']))
					ct += '<a href="#'+r2.id+'">'+titleOf( r2, itemById( specifData.resourceClasses, r2['class']), null, opts )+'</a><br/>'
				};
				ct += '</td><td class="statementTitle">'+cl.title;
				ct += '</td><td>'+titleOf( r, itemById(specifData.resourceClasses,r['class']), null, opts );
				ct += '</td></tr>'
			};
			if( sts[cid].objects.length>0 ) {
				ct += '<tr><td>'+titleOf( r, itemById(specifData.resourceClasses,r['class']), null, opts );
				ct += '</td><td class="statementTitle">'+cl.title+'</td><td>';
				for( i=0, I=sts[cid].objects.length; i<I; i++ ) {
					r2 = sts[cid].objects[i];
					ct += '<a href="#'+r2.id+'">'+titleOf( r2, itemById( specifData.resourceClasses, r2['class']), null, opts )+'</a><br/>'
				};
				ct += '</td></tr>'
			}
		};
		return ct + '</tbody></table>'
	}
	function propertiesOf( r, rC, opts ) {
		if( !r.properties || r.properties.length<1 ) return '';
		// return the content of all properties, sorted by description and other properties:
		let a=null, A=null, c1='', c2='', hPi=null;
		// The content of the title property is already used as chapter title; no need to repeat, here.
		// First the properties used for description in full width:
		for( a=0,A=r.properties.length; a<A; a++ ) {
			if( opts.headingProperties.indexOf(r.properties[a].title)>-1
				|| opts.titleProperties.indexOf(r.properties[a].title)>-1 ) continue;
			if( r.properties[a].value
				&& opts.descriptionProperties.indexOf(r.properties[a].title)>-1 ) {
				c1 += valOf( r.properties[a] )
			}
		};
		if( !opts.propertiesLabel ) return '';
		// Finally, the remaining properties with property title (name) and value:
		for( a=0,A=r.properties.length; a<A; a++ ) {
			hPi = indexBy(opts.hiddenProperties,'title',r.properties[a].title);
			if( opts.hideEmptyProperties && !r.properties[a].value
				|| hPi>-1 && ( opts.hiddenProperties[hPi].value==undefined || opts.hiddenProperties[hPi].value==r.properties[a].value )
				|| opts.headingProperties.indexOf(r.properties[a].title)>-1
				|| opts.titleProperties.indexOf(r.properties[a].title)>-1 
				|| opts.descriptionProperties.indexOf(r.properties[a].title)>-1 ) continue;
			c2 += '<tr><td class="propertyTitle">'+r.properties[a].title+'</td><td>'+valOf( r.properties[a] )+'</td></tr>'
		};
		if( !c2 ) return c1;
		return c1+'<p class="metaTitle">'+opts.propertiesLabel+'</p><table class="propertyTable"><tbody>'+c2+'</tbody></table>'
		
		function fileRef( txt, opts ) {
			if( !opts || !opts.filePath ) return txt;
	//		if( opts.rev==undefined ) opts.rev = 0;
			if( opts.imgExtensions==undefined ) opts.imgExtensions = [ 'png', 'jpg', 'svg', 'gif', 'jpeg' ];
	//		if( opts.clickableElements==undefined ) opts.clickableElements = false;
			
				function addFilePath( u ) {
					if( /^https?:\/\/|^mailto:/i.test( u ) ) {
						// don't change an external link starting with 'http://', 'https://' or 'mailto:'
	//					console.debug('addFilePath no change',u);
						return u  		
					};
					// else, add path:
	//				return opts.serverURL+'/projects/'+opts.projId+'/rev/'+opts.rev+'/files/'+u.replace( /\\/g, '/' )
					return opts.filePath+u.replace( /\\/g, '/' )
				}
				function addEpubPath( u ) {
					return opts.epubImgPath+withoutPath( u )
				}
				function getType( str ) {
					var t = /type="([^"]+)"/.exec( str );
					if( t==null ) return '';
					return (' '+t[1])
				}
				function getStyle( str ) {
					var s = /(style="[^"]+")/.exec( str );
					if( s==null ) return '';  
					return (' '+s[1])
				}
				function getUrl( str ) {
					// get the URL:
					var l = /(href|data)="([^"]+)"/.exec( str );  // url in l[2]
					// return null, because an URL is expected in any case:
					if( l == null ) { return null };    
					// ToDo: Replace any backslashes by slashes ??
					return l[2]
				}
				function withoutPath( str ) {
					let x = str.replace('\\','/').lastIndexOf('/');
					return str.substring(x+1)
				}
				function fileExt( str ) {
					let x = str.lastIndexOf('.');
					return str.substring(x+1)
				}
				function fileName( str ) {
					let x = str.lastIndexOf('.');
					return str.substring(0,x)
				}
				function pushReferencedFiles( u, t ) {
					if( opts.collectReferencedFiles && indexBy( xhtml.images, 'fileName', withoutPath( u ) )<0 ) {
						// avoid duplicate entries:
						xhtml.images.push({
							fileName: withoutPath( u ),
							mimeType: t,
							url: addFilePath(u)
						})
					}
				}

			// Prepare a file reference for viewing and editing:
	//		console.debug('fromServer 0: ', txt);
				
			// 1. transform two nested objects to link+object resp. link+image:
			//    Especially OLE-Objects from DOORS are coming in this format; the outer object is the OLE, the inner is the preview image.
			//    The inner object can be a tag pair <object .. >....</object> or comprehensive tag <object .. />.
			//		Sample data from french branch of a japanese car OEM:
			//			<object data=\"OLE_AB_4b448d054fad33a1_23_2100028c0d_28000001c9__2bb521e3-8a8c-484d-988a-62f532b73612_OBJECTTEXT_0.ole\" type=\"text/rtf\">
			//				<object data=\"OLE_AB_4b448d054fad33a1_23_2100028c0d_28000001c9__2bb521e3-8a8c-484d-988a-62f532b73612_OBJECTTEXT_0.png\" type=\"image/png\">OLE Object</object>
			//			</object>
			//		Sample data from ReX:
			//			<object data=\"Tabelle mit WordPics_Partner1/4_Object_Text_0.ole\" type=\"application/oleobject\">\n   
			//				<object data=\"Tabelle mit WordPics_Partner1/4_Object_Text_0.png\" type=\"image/png\">OLE Object</object>\n 
			//			</object>
			//		Sample from ProSTEP ReqIF Implementation Guide:
			//			<xhtml:object data="files/powerpoint.rtf" height="96" type="application/rtf" width="96">
			//				<xhtml:object data="files/powerpoint.png" height="96" type="image/png" 	width="96">
			//					This text is shown if alternative image can't be shown
			//				</xhtml:object>
			//			</xhtml:object>
			txt = txt.replace( /<object([^>]+)>[\s\S]*?<object([^>]+)(\/>|>([\s\S]*?)<\/object>)[^>]*<\/object>/gi,   
				function( $0, $1, $2, $3, $4 ) {        // description is $4
					var u1 = getUrl( $1 ),  			// the primary information
//						t1 = getType( $1 ), 
						u2 = getUrl( $2 ), 				// the preview image
						t2 = getType( $2 ), 
						s2 = getStyle( $2 ); 

					// If there is no description, use the name of the link target:
					if( !$4 ) {
						$4 = u1;   // $4 is now the description between object tags
					};
					pushReferencedFiles( u2, t2 );
	//				console.debug( $0, $4, u1, t1, u2, t2 );
					return'<img src="'+addEpubPath(u2)+'" style="max-width:100%" alt="'+$4+'" />'
//					return'<div class="forImage"><object data="'+addEpubPath(u2)+'"'+t2+s2+' >'+$4+'</object></div>'
				}
			);
	//		console.debug('fromServer 1: ', txt);
				
			// 2. transform a single object to link+object resp. link+image:
			//      For example, the ARCWAY Cockpit export uses this pattern:
			//			<object data=\"files_and_images\\27420ffc0000c3a8013ab527ca1b71f5.svg\" name=\"27420ffc0000c3a8013ab527ca1b71f5.svg\" type=\"image/svg+xml\"/>
			txt = txt.replace( /<object([^>]+)(\/>|>[^<]*<\/object>)/gi,   //  comprehensive tag or tag pair
				function( $0, $1, $2 ){ 
					let u1 = getUrl( $1 ), 
						t1 = getType( $1 ), 
						s1 = getStyle( $1 ); 

					// get the file extension:
					let e = fileExt(u1);
					if( !e ) return $0

					// Get the description between the tags <object></object>:
					let d = />([^<]*)<\/object>$/i.exec($2);    	// the description is in d[1]
					if( d && d[1].length ) d = withoutPath( d[1] )	// if there is a description, use it
					else d = withoutPath( u1 );						// use the target name, otherwise
						
//					let hasImg = true;
					e = e.toLowerCase();
	//				console.debug( $0, $1, 'url: ', u1, 'ext: ', e );
						
					if( opts.imgExtensions.indexOf( e )>-1 ) {  
						// it is an image, show it:
						d = '<img src="'+addEpubPath(u1)+'" alt="'+d+'" style="max-width:100%" />';
//						d = '<object data="'+addEpubPath(u1)+'"'+t1+s1+' />';
						pushReferencedFiles( u1, t1 )
					} else {
						if( e=='ole' ) {  
							// It is an ole-file, so add a preview image;
							// in case there is no preview image, the browser will display d holding the description
							// ToDo: Check if there *is* a preview image and which type it has, use an <img> tag.
							pushReferencedFiles( fileName(u1)+'.png', 'image/png' );
//							d = '<object data="'+addEpubPath( fileName(u1) )+'.png" type="image/png" >'+d+'</object>'
							d = '<img src="'+addEpubPath( fileName(u1) )+'.png" alt="'+d+'" style="max-width:100%" />'
						} else {
							// last resort is to take the filename:
//							hasImg = false;
							d = '<span>'+d+'</span>'  
						}
					};
						
//					if( hasImg )
//						return '<span class="forImage">'+d+'</span>'
//					else
						return d
				}
			);	
	//		console.debug('fileRef result: ', txt);
			return txt
		}
		function titleLinks( str, opts ) {
			// Transform sub-strings with dynamic linking pattern to internal links.
			// Syntax:
			// - A resource (object) title between CONFIG.dynLinkBegin and CONFIG.dynLinkEnd will be transformed to a link to that resource.
			// - Icons in front of titles are ignored
			// - Titles shorter than 4 characters are ignored
			// - see: https://www.mediawiki.org/wiki/Help:Links

//			console.log('*',opts.RETitleLink,str);
			
			// in certain situations, remove the dynamic linking pattern from the text:
			if( !opts.addTitleLinks )
				return str.replace( opts.RETitleLink, function( $0, $1 ) { return $1 } )
				
			// else, find all dynamic link patterns in the current property and replace them by a link, if possible:
			let replaced = null;
			do {
				replaced = false;
				str = str.replace( opts.RETitleLink, 
					function( $0, $1 ) { 
						replaced = true;
//						if( $1.length<opts.titleLinkMinLength ) return $1;
						let m=$1.toLowerCase(), cO=null, ti=null;
						// is ti a title of any resource?
						for( var x=specifData.resources.length-1;x>-1;x-- ) {
							cO = specifData.resources[x];
										
							// avoid self-reflection:
//							if(ob.id==cO.id) continue;

							// disregard resources which are not referenced in the current tree (selected spec):
//	??						if( myProject.selectedSpec.objectRefs.indexOf(cO.id)<0 ) continue;

							// get the pure title text:
							ti = titleValOf( cO, itemById( specifData.resourceClasses, cO['class'] ), opts );

							// disregard objects whose title is too short:
							if( !ti || ti.length<opts.titleLinkMinLength ) continue;

							// if the titleLink content equals a resource's title, replace it with a link:
							if(m==ti.toLowerCase()) return '<a href="#'+cO.id+'">'+$1+'</a>'
						};
						// The dynamic link has NOT been matched/replaced, so mark it:
						return '<span style="color:#D82020">'+$1+'</span>'
					}
				)
			} while( replaced );
			return str
		}
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
				case 'xhtml':
					return titleLinks( fileRef( pr.value, opts ), opts )
//					return fileRef( pr.value, opts )
				case 'xs:string':
					return titleLinks( pr.value, opts )
				default:
					return pr.value
			}
		}
	}
	function chapter( nd, lvl ) {
//		console.debug( nd, lvl )
		if( !nd.nodes || nd.nodes.length<1 ) return '';
		let i=null, I=null, r=null, rC=null,
			params={
				level: lvl,
				nodeId: nd.id
			};
		var ch = '';
		for( i=0,I=nd.nodes.length; i<I; i++ ) {
			r = itemById( specifData.resources,nd.nodes[i].resource );
			rC = itemById( specifData.resourceClasses, r['class'] );
			ch += 	titleOf( r, rC, params, opts )
				+	propertiesOf( r, rC, opts )
				+	statementsOf( r, opts )
				+	chapter( nd.nodes[i], lvl+1 )
		};
		return ch
	}
	function xhtmlOf( headTitle, sectId, sectTitle, body ) {
		return	'<?xml version="1.0" encoding="UTF-8"?>'
		+		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
		+		'<html xmlns="http://www.w3.org/1999/xhtml">'
		+			'<head>'
		+				'<link rel="stylesheet" type="text/css" href="../Styles/styles.css" />'
		+				'<title>'+headTitle+'</title>'
		+			'</head>'
		+			'<body>'
		+	(sectTitle?	'<h1'+(sectId?' id="'+sectId+'"':'')+'>'+sectTitle+'</h1>' : '')
		+				body
		+			'</body>'
		+		'</html>'
	}
}
