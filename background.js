/* 
  Copyright 2019. Jefferson "jscher2000" Scher. License: MPL-2.0.
  Version 0.1 - Proof of concept
*/
function resizeWin(win) {
	// If this window is maximized, make it resizable
	if (win.state === 'maximized'){
		browser.windows.update(
			win.id, {
				state: "normal"
			}
		).catch( (err) => { console.log(err); } );
	} else {
		// Either it's already normal, or it's fullscreen, minimized, or docked
	}
}

// Hook new windows
browser.windows.onCreated.addListener(resizeWin);

// TODO: options page or other UI to specify width/height/top/left defaults
 