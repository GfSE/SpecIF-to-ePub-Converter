/*	SpecIF import 
	Dependencies: jQuery 3.1+
	(C)copyright enso managers gmbh (http://www.enso-managers.de)
	Author: se@enso-managers.de, Berlin
	License: Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
	We appreciate any correction, comment or contribution via e-mail to support@reqif.de            
*/

// constructor for SpecIF import:
// (A module constructor is needed, because there is an access to parent's data via 'self')
modules.construct({
	name: 'ioSpecif'
}, function(self) {
	"use strict";
	let zipped = null,
//		template = null,	// a new Id is given and user is asked to input a project-name
		opts = null,
		errNoOptions = { status: 899, statusText: 'No options or no mediaTypes defined.' },
		errNoSpecif = { status: 901, statusText: 'No SpecIF file in the specifz container.' },
		errInvalidJson = { status: 900, statusText: 'SpecIF data is not valid JSON.' };
		
	self.init = function(options) {
		opts = options;
//		console.debug('iospecif.init',options);
		return true
	};

	self.verify = function( f ) {
		// return f if file-type is eligible, null otherwise.
		// 'specifz' is a specif file with optional images/attachments in a zipped file.
		// 'specif' is a plain text file with specif data.
//		console.debug('iospecif.verify',f);

		if( f.name.endsWith('.specif')) {
			zipped = false;
//			template = false;
			return f
		};
		if( f.name.endsWith('.specifz')) {
			zipped = true;
//			template = false;
			return f
		};
/*		if( f.name.endsWith('.specift')) {
			zipped = false;
			template = true;
			return f
		};
		if( f.name.endsWith('.speciftz')) {
			zipped = true;
			template = true;
			return f
		}; */
		// else:
		try {
			message.show( i18n.phrase('ErrInvalidFileSpecif', f.name), {severity:'warning'} );
		} catch (e) {
			alert(f.name+' has invalid file type.')
		};
		return null
	};
	self.toSpecif = function( buf ) {
		// import a read file buffer containing specif data:
		// a button to upload the file appears at <object id="file-object"></object>
//		console.debug('iospecif.toSpecif');
		self.abortFlag = false;
		var zDO = $.Deferred();
		if( zipped ) {
			let zip = new JSZip();
			zip.loadAsync(buf).then( function(zip) {
				let fileL = zip.filter(function (relPath, file) {return file.name.endsWith('.specif')}),
					data = {};

				if( fileL.length<1 ) {
					zDO.reject( errNoSpecif );
					return zDO
				};
//				console.debug('iospecif.toSpecif 1',fileL[0].name);
				// take the first specif file found, ignore any other so far:
				zip.file( fileL[0].name ).async("string")
				.then( function(dta) {
					// Check if data is valid JSON:
					try {
						// Please note:
						// - the file may have a UTF-8 BOM
						// - all property values are encoded as string, even if boolean, integer or double.
						data = JSON.parse( dta.trimJSON() );
						data.files = [];
						// SpecIF data is valid.
						
						if( opts && typeof(opts.mediaTypeOf)=='function' ) {
							// First load the files, so that they get a lower revision number as the referencing objects.
//							console.debug('iospecif.toSpecif 2',fileL);
							// Create a list of all attachments:
							fileL = zip.filter(function (relPath, file) {return !file.name.endsWith('.specif')});
							console.debug('iospecif.toSpecif 2',fileL);
						/*	// Create a list of all eligible files:
							fileL = zip.filter(function (relPath, file) {
												let x = extOf(file.name);
												// file must have an extension:
												if( !x ) return false;
												x = x.toLowerCase();
												// only certain file types are permissible:
												// extension must be contained in either one of the lists:
												return ( CONFIG.imgExtensions.indexOf( x )>-1 
														|| CONFIG.officeExtensions.indexOf( x )>-1
														|| CONFIG.modelExtensions.indexOf( x )>-1 )
											}); */
							if( fileL.length>0 ) {
								let pend = 0;
								fileL.forEach( function(e) { 
												//	let t = e.type || opts.mediaTypeOf(e.name);
													if( e.dir ) return false;
													let t = opts.mediaTypeOf(e.name);
													if( !t ) return false;
													// only extract files with known mediaTypes:
//													console.debug('iospecif.toSpecif 3',t,e.date,e.date.toISOString());
													pend++;
													zip.file(e.name).async("blob")
													.then( function(f) {
														data.files.push({ blob:f, id: 'F-'+e.name.simpleHash(), title: e.name, type: t, changedAt: e.date.toISOString() });
//														console.debug('file',pend-1,e,data.files);
														if(--pend<1)
															// now all files are extracted from the ZIP, so we can return the data:
															zDO.resolve( data )		// data is in SpecIF format
													}) 
												})
							} else {
								// no files with permissible types are supplied:
								zDO.resolve( data )		// data is in SpecIF format
							}
						} else {
							// no function for filtering and mapping the mediaTypes supplied:
							console.error(errNoOptions.statusText);
							zDO.resolve( data )		// data is in SpecIF format
						}
					} catch (e) {
						zDO.reject( errInvalidJson )
					}
				})
			})
		} else {
			// Selected file is not zipped - it is expected to be SpecIF data in JSON format.
			// Check if data is valid JSON:
			try {
				// Cut-off UTF-8 byte-order-mask ( 3 bytes xEF xBB xBF ) at the beginning of the file, if present.
				// The resulting data before parsing must be a JSON string enclosed in curly brackets "{" and "}".
				var data = JSON.parse( buf2str(buf).trimJSON() );
				zDO.resolve( data )
			} catch (e) {
				zDO.reject( errInvalidJson )
			};
		};
		return zDO
	};
	self.abort = function() {
		myProject.abort();
		self.abortFlag = true
	};
	return self

	function extOf(str) {
		// return the file extension without the dot:
		return str.substring( str.lastIndexOf('.')+1 )
	}
});
