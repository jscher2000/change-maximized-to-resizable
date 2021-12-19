/* 
  Change New Maximized Window to Resizable
  Copyright 2021. Jefferson "jscher2000" Scher. License: MPL-2.0.
  Version 0.5 - Size and Position Options
*/

let oPrefs = {};

// Update oPrefs from background
browser.runtime.sendMessage({
	getprefs: true
}).then((oBGprefs) => {
	oPrefs = oBGprefs.pref;
	// initialize form items
	var frm = document.getElementById('winpossize')
	if (oPrefs.setposition){
		frm.setposition.value = 'true';
	} else {
		frm.setposition.value = 'false';
	}
	if (oPrefs.setsize){
		frm.setsize.value = 'true';
	} else {
		frm.setsize.value = 'false';
	}
}).catch((err) => {
	document.getElementById('oops').textContent = 'Problem retrieving current settings: ' + err.message;
	document.getElementById('oops').style.display = 'block';
});

// Compute current window position and size and update parentheticals
function updateWH(evt){
	document.getElementById('currleft').textContent = window.screenX;
	document.getElementById('currtop').textContent = window.screenY;
	document.getElementById('currwidth').textContent = window.outerWidth;
	document.getElementById('currheight').textContent = window.outerHeight;
}
updateWH();
var poscheck;
function updateLT(evt){
	document.getElementById('currleft').textContent = window.screenX;
	document.getElementById('currtop').textContent = window.screenY;
}
window.addEventListener('resize', updateWH, false);
poscheck = window.setInterval(updateLT, 200);

document.getElementById('btnSave').addEventListener('click', function(evt){
	// Remove the resize event handler and interval
	window.removeEventListener('resize', updateWH, false);
	window.clearInterval(poscheck);
	// Build message
	var frm = document.getElementById('winpossize'), sizeupdate = {};
	if (frm.setposition.value == true || frm.setposition.value == 'true'){
		oPrefs.setposition = true;
		oPrefs.winleft = parseInt(document.getElementById('currleft').textContent);
		oPrefs.wintop = parseInt(document.getElementById('currtop').textContent);
		sizeupdate.setposition = oPrefs.setposition;
		sizeupdate.winleft = oPrefs.winleft;
		sizeupdate.wintop = oPrefs.wintop;
	} else {
		oPrefs.setposition = false;
		sizeupdate.setposition = oPrefs.setposition;
	}
	if (frm.setsize.value == true || frm.setsize.value == 'true'){
		oPrefs.setsize = true;
		oPrefs.winwidth = parseInt(document.getElementById('currwidth').textContent);
		oPrefs.winheight = parseInt(document.getElementById('currheight').textContent);
		sizeupdate.setsize = oPrefs.setsize;
		sizeupdate.winwidth = oPrefs.winwidth;
		sizeupdate.winheight = oPrefs.winheight;
	} else {
		oPrefs.setsize = false;
		sizeupdate.setsize = oPrefs.setsize;
	}
	// Send message to background to update storage
	browser.runtime.sendMessage({
		setwinprefs: sizeupdate
	}).then((resp) => {
		if (resp.saveresults == 'Success!'){
			// Clean up highlighting
			var lbls = document.querySelectorAll('label');
			for (var i=0; i<lbls.length; i++){
				lbls[i].className = '';
			}
			// Add success icon to Save button
			document.getElementById('btnSave').textContent = 'Changes Saved Successfully ☑';
			document.getElementById('btnSave').setAttribute('disabled', 'disabled');
		} else {
			document.querySelector('#oops span').textContent = resp.saveresults;
			document.getElementById('oops').style.display = 'block';
		}
	}).catch((err) => {
		document.querySelector('#oops span').textContent = 'Error updating storage: ' + err.message;
		document.getElementById('oops').style.display = 'block';
	});
}, false);

document.getElementById('btnCancel').addEventListener('click', function(evt){
	// Remove the resize event handler
	window.removeEventListener('resize', updateWH, false);
	// Close the popup
	self.close();
}, false);

document.getElementById('btnclose').addEventListener('click', function(evt){
	evt.target.parentNode.style.display = '';
}, false);

function highlightChange(evt){
	if (!['INPUT'].includes(evt.target.nodeName)) return;
	var chgd = false;
	var frm = evt.target.closest('form');
	switch (evt.target.type){
		case 'radio':
			switch (evt.target.name){
				case 'setposition':
					if ((evt.target.value == 'true' && oPrefs.setposition == false) ||
						(evt.target.value == 'false' && oPrefs.setposition == true)) chgd = true;
					else chgd = false;
					break;
				case 'setsize':
					if ((evt.target.value == 'true' && oPrefs.setsize == false) ||
						(evt.target.value == 'false' && oPrefs.setsize == true)) chgd = true;
					else chgd = false;
					break;
			}
			if (chgd){
				var rads = frm.querySelectorAll('input[name="' + evt.target.name + '"]');
				for (var i=0; i<rads.length; i++){
					if (rads[i].getAttribute('value') == evt.target.getAttribute('value')) rads[i].labels[0].className = 'changed';
					else {
						rads[i].labels[0].className = '';
					}
				}
			} else {
				var rads = frm.querySelectorAll('input[name="' + evt.target.name + '"]');
				for (var i=0; i<rads.length; i++){
					rads[i].labels[0].className = '';
				}
			}
			// Restore the Save Button text in case user saved changes and started a new onerror
			document.getElementById('btnSave').textContent = 'Save Changes';
			document.getElementById('btnSave').removeAttribute('disabled');
			break;
		default:
			// none of these 
	}
}

document.getElementById('winpossize').addEventListener('change', highlightChange, false);