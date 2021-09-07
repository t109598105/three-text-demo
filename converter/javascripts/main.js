var convertButton = document.getElementById("convert");
var fileInput = document.getElementById("fileInput");
var reverseTypeface = document.getElementById("reverseTypeface");
var filetypeJson = document.getElementById("filetypeJson");
var restrictCharactersCheck = document.getElementById("restrictCharacters");
var restrictCharacterSetInput = document.getElementById("restrictCharacterSet");

window.onload = function (){
    
}

convertButton.onclick = function(){

    var restrictCharacterSet = document.getElementById("restrictCharacterSet").value;

    [].forEach.call(fileInput.files,function(file){
        var reader = new FileReader();
        reader.addEventListener( 'load', function ( event ) {
            var font = opentype.parse(event.target.result);
            var result = convert(font, restrictCharacterSet);
            
            exportString(result, file.name + "_" + restrictCharacterSet +  '.json' );
        }, false );
        reader.readAsArrayBuffer( file );
    });
};


var exportString = function ( output, filename ) {



		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		var link = document.createElement( 'a' );
		link.href = objectURL;
		link.download = filename || 'data.json';
		link.target = '_blank';
		//link.click();
		
		var event = document.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, window, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			link.dispatchEvent(event);

	};

var convert = function(font, restrictCharacterSet){

    console.log(font);


    var scale = (1000 * 100) / ( (font.unitsPerEm || 2048) *72);
    var result = {};
    result.glyphs = {};
	
	var glyphsSet = [];
	
	for(let i = 0 ; i<font.glyphs.length; i++){
		var glyph = font.glyphs.glyphs[i];
		
		if (glyph.unicode !== undefined) {

			var glyphCharacter = String.fromCharCode (glyph.unicode);
			
			if(glyphsSet.indexOf(glyphCharacter) == -1){
				glyphsSet.push(glyphCharacter);
			}
			else {
				continue;
			}
			
			var needToExport = restrictCharacterSet.indexOf(glyphCharacter) != -1;

            if (needToExport) {
				var token = {};
				token.ha = Math.round(glyph.advanceWidth * scale);
				
				var bbox = glyph.getBoundingBox();
				
				
				token.x_min = Math.round(bbox.x1 * scale);
				token.x_max = Math.round(bbox.x2 * scale);
				token.o = "";
				var path = glyph.getPath(0,0,1000);
				
				
			

				path.commands.forEach(function(command,i){
					
					if (command.type.toLowerCase() === "c") {command.type = "b";}
					token.o += command.type.toLowerCase();
					token.o += " "
					if (command.x !== undefined && command.y !== undefined){
						token.o += Math.round(command.x * scale);
						token.o += " "
						token.o += Math.round(command.y * scale);
						token.o += " "
					}
					if (command.x1 !== undefined && command.y1 !== undefined){
						token.o += Math.round(command.x1 * scale);
						token.o += " "
						token.o += Math.round(command.y1 * scale);
						token.o += " "
					}
					if (command.x2 !== undefined && command.y2 !== undefined){
						token.o += Math.round(command.x2 * scale);
						token.o += " "
						token.o += Math.round(command.y2 * scale);
						token.o += " "
					}
				});
				result.glyphs[String.fromCharCode(glyph.unicode)] = token;
			}
        };	
	}
    
    result.familyName = font.familyName;
    result.ascender = Math.round(font.ascender * scale);
    result.descender = Math.round(font.descender * scale);
    result.underlinePosition = Math.round(font.tables.post.underlinePosition * scale);
    result.underlineThickness = Math.round(font.tables.post.underlineThickness * scale);
    result.boundingBox = {
        "yMin": Math.round(font.tables.head.yMin * scale),
        "xMin": Math.round(font.tables.head.xMin * scale),
        "yMax": Math.round(font.tables.head.yMax * scale),
        "xMax": Math.round(font.tables.head.xMax * scale)
    };
    result.resolution = 1000;
    result.original_font_information = font.tables.name;
    

    return JSON.stringify(result);
};