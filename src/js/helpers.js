var helpers = {
	getStyle(oElm,css3Prop){
		return getComputedStyle(oElm).getPropertyValue(css3Prop);
	}
	,addClass(o,c){
		o.classList.add(c);
	}
	,removeClass(o,c){
		o.classList.remove(c);
	}
	,clone(obj){
		var temp;

		if(obj === null || typeof obj !== 'object'){
			return obj;
		}
		temp = obj.constructor(); // changed
		for(const key in obj){
			if(obj.hasOwnProperty(key)){
				temp[key] = this.clone(obj[key]);
			}
		}
		return temp;
	}
	,isFunction(func){
		return func && Object.prototype.toString.call(func).slice(8,-1).toLowerCase() === 'function';
	}
	,getCoords(elem){
		var box = elem.getBoundingClientRect();

		return {
			top: box.top + window.pageYOffset
			,y: box.top + window.pageYOffset
			,left: box.left + window.pageXOffset
			,x: box.left + window.pageXOffset
		};
	}
};

module.exports = helpers;