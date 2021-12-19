/* 
  Change New Maximized Window to Resizable
  Copyright 2021. Jefferson "jscher2000" Scher. License: MPL-2.0.
  Version 0.1 - Proof of concept
  Version 0.5 - Option to save window position and size (new toolbar button popup)
*/

function resizeWin(win) {
	// If this window is maximized, make it resizable
	if (win.state === 'maximized'){
		browser.windows.update(
			win.id, {
				state: "normal"
			}
		).then(() => {
			if (oPrefs.setposition && oPrefs.setsize){ // [v0.5]
				browser.windows.update(
					win.id, {
						top: oPrefs.wintop,
						left: oPrefs.winleft,
						width: oPrefs.winwidth,
						height: oPrefs.winheight
					}
				);
			} else if (oPrefs.setposition){ // [v0.5]
				browser.windows.update(
					win.id, {
						top: oPrefs.wintop,
						left: oPrefs.winleft
					}
				);
			} else if (oPrefs.setsize){ // [v0.5]
				browser.windows.update(
					win.id, {
						width: oPrefs.winwidth,
						height: oPrefs.winheight
					}
				);
			}
		}).catch( (err) => { console.log(err); } );
	} else if (win.state === 'normal') {
		if (oPrefs.setposition && oPrefs.setsize){ // [v0.5]
			browser.windows.update(
				win.id, {
					top: oPrefs.wintop,
					left: oPrefs.winleft,
					width: oPrefs.winwidth,
					height: oPrefs.winheight
				}
			);
		} else if (oPrefs.setposition){ // [v0.5]
			browser.windows.update(
				win.id, {
					top: oPrefs.wintop,
					left: oPrefs.winleft
				}
			);
		} else if (oPrefs.setsize){ // [v0.5]
			browser.windows.update(
				win.id, {
					width: oPrefs.winwidth,
					height: oPrefs.winheight
				}
			);
		}
	} else {
		// Either it's fullscreen, minimized, or docked -- do nothing
	}
}

// Hook new windows
browser.windows.onCreated.addListener(resizeWin);

// Default starting values [v0.5]
var oPrefs = {
	setposition: false,		// by default, do not move the window
	wintop: 8,				// top position for resized window
	winleft: 8,				// left position for resized window
	setsize: false,			// by default, do not resize the window
	winwidth: 1024,			// width for resized window
	winheight: 700			// height for resized window
}

// Update oPrefs from storage [v0.5]
browser.storage.local.get("prefs").then( (results) => {
	if (results.prefs != undefined){
		if (JSON.stringify(results.prefs) != '{}'){
			var arrSavedPrefs = Object.keys(results.prefs);
			for (var j=0; j<arrSavedPrefs.length; j++){
				oPrefs[arrSavedPrefs[j]] = results.prefs[arrSavedPrefs[j]];
			}
		}
	}
}).then(() => {
	// Nothing to do here currrently
}).catch((err) => {console.log('Error retrieving "prefs" from storage: '+err.message);});

// Messaging with the Options page [v0.5]
function handleMessage(request, sender, sendResponse){
	// Window resizing stuff
	if ("setwinprefs" in request) {
		var sizeupdt = request.setwinprefs;
		if (sizeupdt.setposition == false || sizeupdt.setposition == 'false'){
			oPrefs.setposition = false;
		} else {
			oPrefs.setposition = true;
			oPrefs.wintop = sizeupdt.wintop;
			oPrefs.winleft = sizeupdt.winleft;
		}
		if (sizeupdt.setsize == false || sizeupdt.setsize == 'false'){
			oPrefs.setsize = false;
		} else {
			oPrefs.setsize = true;
			oPrefs.winwidth = sizeupdt.winwidth;
			oPrefs.winheight = sizeupdt.winheight;
		}
		// Write to storage
		browser.storage.local.set(
			{prefs: oPrefs}
		).then(() => {
			sendResponse({
				saveresults: 'Success!'
			});
			// not changing open windows in this version
		}).catch((err) => {
			sendResponse({
				saveresults: 'Error on browser.storage.local.set(): ' + err.message
			});
		});
		return true;
	} else if ("getprefs" in request) {
		// Options page needs info...
		sendResponse({
			pref: oPrefs
		});
		return true;
	}
}
browser.runtime.onMessage.addListener(handleMessage);