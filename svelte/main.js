import App from "./App.svelte";
const { convertHtmlToDelta, convertDeltaToHtml } = require('node-quill-converter')
const path = require('path')

const pathdb = path.resolve(require("electron").remote.app.getPath("userData"), `dts`)
const fs = require('fs-extra')
import {
	decryptDelta,
	cryptDelta
} from './functions/delta'


fs.ensureDirSync(pathdb)
window.__ = {}
__._pt = function(){
	return pathdb
}
__.decryptDelta = decryptDelta
__.cryptDelta = cryptDelta
window.O2A = (obj) => {
	let tdatas = []
	for (let key in obj) {
		tdatas.push(obj[key])
	}
	return tdatas
}
let infohist = []
__.info = (txt, save = true) => {
	if (document.querySelector(".bottom .info")) document.querySelector(".bottom .info").innerHTML = txt
	if (save) {
		infohist.push(txt)
		if (infohist.length > 50) infohist.shift()
	}
}
__.b64 = {

	// private property
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

	// public method for encoding
	, encode: function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = __.b64._utf8_encode(input);

		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			}
			else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		} // Whend 

		return output;
	} // End Function encode 


	// public method for decoding
	, decode: function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}

			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		} // Whend 

		output = __.b64._utf8_decode(output);

		return output;
	} // End Function decode 


	// private method for UTF-8 encoding
	, _utf8_encode: function (string) {
		var utftext = "";
		string = string.replace(/\r\n/g, "\n");

		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		} // Next n 

		return utftext;
	} // End Function _utf8_encode 

	// private method for UTF-8 decoding
	, _utf8_decode: function (utftext) {
		var string = "";
		var i = 0;
		var c, c1, c2, c3;
		c = c1 = c2 = 0;

		while (i < utftext.length) {
			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		} // Whend 

		return string;
	} // End Function _utf8_decode 

}

/**
 * Gestion de numéro unique (guid)
 */

__.uuid4 = () => {
	const ho = (n, p) => n.toString(16).padStart(p, 0); /// Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
	const view = new DataView(new ArrayBuffer(16)); /// Create a view backed by a 16-byte buffer
	crypto.getRandomValues(new Uint8Array(view.buffer)); /// Fill the buffer with random data
	view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40); /// Patch the 6th byte to reflect a version 4 UUID
	view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80); /// Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
	return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`; /// Compile the canonical textual form from the array data
}

__.newId = () => {
	return 'id_' + __.uuid4()
}
const getvalues = o => {
	let str = ``
	for(let k in o){
		let val = o[k]
		if (typeof (val) === "object") {
			str += getvalues(val)
		}else{
			str += val
		}
	}
	return str
}
__.valuestr = o => {
	return getvalues(o).toLowerCase()
}

if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]'
	};
}

// https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
// to use 
//sort the object by a property (ascending)
//sorting takes into account uppercase and lowercase
// __.sortBy(data, { prop: "date" });
__.sortBy = (function () {
	var toString = Object.prototype.toString,
		// default parser function
		parse = function (x) { return x; },
		// gets the item to be sorted
		getItem = function (x) {
			var isObject = x != null && typeof x === "object";
			var isProp = isObject && this.prop in x;
			return this.parser(isProp ? x[this.prop] : x);
		};

	/**
	 * Sorts an array of elements.
	 *
	 * @param {Array} array: the collection to sort
	 * @param {Object} cfg: the configuration options
	 * @property {String}   cfg.prop: property name (if it is an Array of objects)
	 * @property {Boolean}  cfg.desc: determines whether the sort is descending
	 * @property {Function} cfg.parser: function to parse the items to expected type
	 * @return {Array}
	 */
	return function sortby(array, cfg) {
		if (!(array instanceof Array && array.length)) return [];
		if (toString.call(cfg) !== "[object Object]") cfg = {};
		if (typeof cfg.parser !== "function") cfg.parser = parse;
		cfg.desc = !!cfg.desc ? -1 : 1;
		return array.sort(function (a, b) {
			a = getItem.call(cfg, a);
			b = getItem.call(cfg, b);
			return cfg.desc * (a < b ? -1 : +(a > b));
		});
	};

}())
/**
 * 
 * DATES FUNCTIONS
 */

/**
 * Get Milliseconds from  date
 * @param {*} d 
 */
Date.prototype.addMillisecs = function (d) {
	this.setTime(this.getTime() + (d))
	return this
}
Date.prototype.toDateInputValue = (function () {
	var local = new Date(this);
	local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
	return local.toJSON().slice(0, 10);
})
window.__.formatDate = (date) => {
	let date_return = {
		date: ``,
		time: ``
	}
	try {
		let date_return = {
			date: `${date.getFullYear()}-${(date.getMonth() + 1).zeroPad(2)}-${date.getDate().zeroPad(2)}`,
			time: `${date.getHours().zeroPad(2)}:${date.getMinutes().zeroPad(2)}`
		}
		return date_return
	} catch (e) {
		console.warn(e)
		return date_return
	}
}
window.__.isValidDate = (d) => {
	return d instanceof Date && !isNaN(d)
}

/**
 * Add Prototype to Number
 * zeroPad allows to add x zero in front of the desired number
 * for example: 00126
 * 
 * @param {*} digits 	x représente le nombre de chiffre encadrant le nombre
 * 						par exemple pour avoir 0100, x=4
 * @return {string} 
 */
Number.prototype.zeroPad = function (digits) {
	var loop = digits;
	var zeros = "";
	while (loop) {
		zeros += "0";
		loop--;
	}
	return (this.toString().length > digits) ? this.toString() : (zeros + this).slice(-digits);
}

/**
 * Permet de Générer un numéro du stype 20200112_025
 * Ceci correspond à un numéro alliant la date et le numéro (no) ajouté
 * @param {*} date 	Date de la facture
 * @param {*} no 	Numéro de la facture
 * 					par exemple 025
 */
window.__.noinvoice = (date, no) => {
	let dayselected = new Date(date)
	return `${dateselected.getFullYear()}${(dateselected.getMonth() + 1).zeroPad(2)}${dateselected.getDate().zeroPad(2)}_${no}`
}
var app = new App({
	target: document.body
});

export default app;