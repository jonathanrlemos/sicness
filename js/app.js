function lm(id){
	return document.getElementById(id);
}

function onKeyDown(e){
	// if tab was pressed
	if (e.keyCode === 9){
		// do not tab out of the editor
		e.preventDefault();

		// instead, insert a tab into our editor.


	}
}

function htmlToArray(html){
	var re1  = new RegExp("<div>", "g");
	var re2  = new RegExp("</div>", "g");
	var re3  = new RegExp("<br>", "g");

	var parsed = html.replace(re1, "").replace(re2, "\n").replace(re3, "").split("\n");
	if (re2.test(html)){
		parsed.pop();
	}
	return parsed;
}

/*
function arrayToHtml(array){
	var s = "";
	for (var i = 0; i < array.length - 1; ++i){
		s += "<div>";
		s += array[i];
		s += "</div>"
	}
	if (s === ""){
		return "<div>" + array[0] + "</div><br>";
	}
	return s + "<div>" + array[array.length - 1] + "<br></div><br>";
}
*/

lm("button_run").onclick = function (){
	var html = lm("editor").innerHTML;
	var arr = htmlToArray(html);
}
