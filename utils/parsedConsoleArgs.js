/*
 * console.log(parsedConsoleArgs());
 * webpack --string=dev -bool -bool2=false -null=null -num=5 -float=5.5
 */
function parsedConsoleArgs(){
	var args = process.argv.slice(2)
		,obj = {};

	args.forEach(
		function(arg){
			var fragments = arg.split('=')
				,key = fragments[0].replace(/(\s|-)*/,'')
				,value = partParse(fragments[1]);

			obj[key] = value;
		}
	);

	return obj;
}

function partParse(input){
	var output
		,lowerCase;

	if(input === undefined){
		output = true;
		return output;
	}

	lowerCase = input.toLowerCase();

	if(lowerCase === 'true' || lowerCase === 'false'){
		output = lowerCase === 'true';
	}else if(isNumber(input)){
		output = input.indexOf('.') === -1
			? parseInt(input)
			: parseFloat(input);
	}else if(lowerCase === 'null'){
		output = null;
	}else{
		output = input;
	}

	return output;
}

function isNumber(n){
	return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = parsedConsoleArgs;