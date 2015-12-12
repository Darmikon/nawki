var event = ((window,document)=>{
	var isTouchable
		,alias;

	function add(el,eventName,callback,bubbling){
		el.addEventListener(eventName,callback,bubbling);

		return ()=>el.removeEventListener(eventName,callback,bubbling);
	}

	function fix(e){
		var touch;

		if(e.touches){
			touch = e.touches[0];
			e.pageX = touch.pageX;
			e.pageY = touch.pageY;
		}

		return e;
	}

	//https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
	function hasTouchEvents(){
		var bool
			,prefixes = '-webkit- -moz- -o- -ms- '.split(' ')
			,query;

		if('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch){
			bool = true;
		}else{
			query = [
				'@media ('
				,prefixes.join('touch-enabled),(')
				,'heartz'
				,')'
				,'{#modernizr{top:9px;position:absolute}}'
			].join('');
			testStyles(query,node=>{
				bool = node.offsetTop === 9;
			});
		}

		return bool;
	}

	function testStyles(rule,callback){
		var mod = 'modernizr'
			,style
			,ret
			,docOverflow
			,div = document.createElement('div')
			,body = document.body
			,docElement = window.docElement;

		style = document.createElement('style');
		style.type = 'text/css';
		style.id = `s${mod}`;

		// IE6 will false positive on some tests due to the style element inside the test div somehow interfering
		// offsetHeight, so insert it into body or fakebody.
		// Opera will act all quirky when injecting elements in documentElement when page is served as xml,
		// needs fakebody too. #270
		(!body.fake ? div : body).appendChild(style);
		body.appendChild(div);

		if(style.styleSheet){
			style.styleSheet.cssText = rule;
		}else{
			style.appendChild(document.createTextNode(rule));
		}
		div.id = mod;

		if(body.fake){
			//avoid crashing IE8, if background image is used
			body.style.background = '';
			//Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
			body.style.overflow = 'hidden';
			docOverflow = docElement.style.overflow;
			docElement.style.overflow = 'hidden';
			docElement.appendChild(body);
		}

		ret = callback(div,rule);

		// If this is done after page load we don't want to remove the body so check if body exists
		if(body.fake){
			body.parentNode.removeChild(body);
			docElement.style.overflow = docOverflow;
			// Trigger layout so kinetic scrolling isn't disabled in iOS6+
			docElement.offsetHeight;
		}else{
			div.parentNode.removeChild(div);
		}

		return !!ret;
	}

	function init(){
		isTouchable = hasTouchEvents();

		alias = {
			mousedown: isTouchable ? 'touchstart' : 'mousedown'
			,mousemove: isTouchable ? 'touchmove' : 'mousemove'
			,mouseup: isTouchable ? 'touchend' : 'mouseup'
			,dragstart: isTouchable ? 'touchmove' : 'dragstart'
		};
	}

	init();

	return {
		add
		,fix
		,alias
	};
})(window,window.document);

module.exports = event;