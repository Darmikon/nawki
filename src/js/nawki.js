//https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
function testStyles(rule, callback, nodes, testnames) {
	var mod = 'modernizr'
		,style
		,ret
		,node
		,docOverflow
		,div = document.createElement('div')
		,body = document.body;

	if (parseInt(nodes, 10)) {
		// In order not to give false positives we create a node for each test
		// This also allows the method to scale for unspecified uses
		while (nodes--) {
			node = createElement('div');
			node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
			div.appendChild(node);
		}
	}

	style = document.createElement('style');
	style.type = 'text/css';
	style.id = 's' + mod;

	// IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
	// Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
	(!body.fake ? div : body).appendChild(style);
	body.appendChild(div);

	if (style.styleSheet) {
		style.styleSheet.cssText = rule;
	} else {
		style.appendChild(document.createTextNode(rule));
	}
	div.id = mod;

	if (body.fake) {
		//avoid crashing IE8, if background image is used
		body.style.background = '';
		//Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
		body.style.overflow = 'hidden';
		docOverflow = docElement.style.overflow;
		docElement.style.overflow = 'hidden';
		docElement.appendChild(body);
	}

	ret = callback(div, rule);

	// If this is done after page load we don't want to remove the body so check if body exists
	if (body.fake) {
		body.parentNode.removeChild(body);
		docElement.style.overflow = docOverflow;
		// Trigger layout so kinetic scrolling isn't disabled in iOS6+
		docElement.offsetHeight;
	} else {
		div.parentNode.removeChild(div);
	}

	return !!ret;

}

function hasTouchEvents(){
	var bool
		,prefixes = '-webkit- -moz- -o- -ms- '.split(' ')
		,query;

	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		bool = true;
	} else {
		query = ['@media (', prefixes.join('touch-enabled),('), 'heartz', ')', '{#modernizr{top:9px;position:absolute}}'].join('');
		testStyles(query, function(node) {
			bool = node.offsetTop === 9;
		});
	}

	return bool;
}

window.touchDevice = hasTouchEvents();

 console.log('touch',window.touchDevice);

//алиасы для десктопных или тач девайсовых событий
window.eventName = {
	mousedown: window.touchDevice ? 'touchstart' : 'mousedown'
	,mousemove: window.touchDevice ? 'touchmove' : 'mousemove'
	,mouseup: window.touchDevice ? 'touchend' : 'mouseup'
	,dragstart: window.touchDevice ? 'touchmove' : 'dragstart'
};

 console.log(window.eventName);

function fixEvent(e) {
    // получить объект событие для IE
    e = e || window.event;

    // добавить pageX/pageY для IE
    if ( e.pageX == null && e.clientX != null ) {
        var html = document.documentElement;
        var body = document.body;
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
        e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
    }

    // добавить which для IE
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
    }

	if(e.touches){
		e.pageX = e.touches[0].pageX;
		e.pageY = e.touches[0].pageY;
	}

    return e;
}

function addListener(el,event,callback,bubbling){
	el.addEventListener(event,callback,bubbling);

	return function(){
		el.removeEventListener(event,callback,bubbling);
	}
}

function getStyle(oElm, css3Prop){
    var strValue = "";

    if(window.getComputedStyle){
        strValue = getComputedStyle(oElm).getPropertyValue(css3Prop);
    }
    //IE
    else if (oElm.currentStyle){
        try {
            strValue = oElm.currentStyle[css3Prop];
        } catch (e) {}
    }

    return strValue;
}

/*получить ближайший относительный родитель или ноль*/
function getClosestRelative(elem){
    while(elem) {
        if(getStyle(elem,"position") =='relative'){
            return elem;
        }
        elem = elem.offsetParent
    }
    return null;
};

//глючной вариант - не учитывает borders - суммирование offset
function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)
        elem = elem.offsetParent
    }

    return {top: Math.round(top), left: Math.round(left)}
}


//this.getBoundingClientRect() //координаты и размеры - но не относительно документа, а относительно viewport

function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect();

    // (2)
    var body = document.body;
    var docElem = document.documentElement;

    // (3)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    // (4)
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    // (5)
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

//2 в одном, но лучше забить на глючные браузеры и пользоваться ф-ией getOffsetRect()
function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        // "правильный" вариант
        return getOffsetRect(elem);
    } else {
        // пусть работает хоть как-то
        return getOffsetSum(elem);
    }
}


var addClass = function (o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
    if (re.test(o.className)) return;
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
};


var removeClass = function (o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
};






var dragMaster = (function() {

    var dragObject,
        mouseOffset,
        settings={};



	function updateOnWindowResize(){
		var cells = document.querySelectorAll('.nawki div');

		//ставим ячейку в зону 16
//        emptyZone = localMatrix.slice(matrix.length-1,1)[0];
//        emptyZone.right = emptyZone.left + cells[0].offsetWidth;
//        emptyZone.bottom = emptyZone.top + cells[0].offsetHeight;
//        emptyZone.index = 16; //пустая ячейка будет с индексом 16 по умолчанию
//        resultMatrix[emptyZone.index] = emptyZone.index;

		//ставим ячейку в зону 16
		//emptyZone = localMatrix.slice(matrix.length-1,1)[0];


		//emptyZone.right = emptyZone.left + cells[0].offsetWidth;
		//emptyZone.bottom = emptyZone.top + cells[0].offsetHeight;
		//emptyZone.index = parseInt(basic[16]); //пустая ячейка будет с индексом 16 по умолчанию
		console.log(settings);

		//по топорному пока что пересчитаем позицию на экране положение поля с пятнашками после изменения
		//пропорций экрана
		if(window.closestRelative){
			settings.parentOffset = getOffset(window.closestRelative);
		}

	}

	window.addEventListener('resize',updateOnWindowResize,false);


	var isDraggable = function (){
        var result = false;

        if(
        //возможно ли движение по горизонтали в соседнюю ячейку?
            settings.y === settings.emptyZone.top &&
                Math.abs(settings.x - settings.emptyZone.left) === settings.width
            ){
            settings.direction = (settings.x - settings.emptyZone.left)>0?'left':'right';
            result = true;

        }else if(
        //возможно ли движение по вертикали в соседнюю ячейку?
            settings.x === settings.emptyZone.left &&
                Math.abs(settings.y - settings.emptyZone.top) === settings.height
            ){
            settings.direction = (settings.y - settings.emptyZone.top)>0?'top':'bottom';
            result = true;
        }


        return result;
    };

    // получить сдвиг target относительно курсора мыши
    function getMouseOffset(target, e) {
		 console.log(e);
        var docPos	= getPosition(target);
		 console.log(docPos);
        return {x:e.pageX - docPos.x, y:e.pageY - docPos.y}
    }


    var ensureDestination = function (){
        var dropPosition={
                left : parseInt(getStyle(dragObject,'left')),
                top  : parseInt(getStyle(dragObject,'top'))
            },
            t,l;

        if(settings.x>settings.emptyZone.left){
            //значит двигаем влево
            l = (settings.x - dropPosition.left > settings.width/2) ? settings.emptyZone.left : settings.x;
        }else{
            //значит двигаем вправо
            l = (settings.emptyZone.left - dropPosition.left > settings.width/2) ? settings.x : settings.emptyZone.left;
        }


        if(settings.y>settings.emptyZone.top){
            //значит двигаем вниз
            t = (settings.y - dropPosition.top > settings.height/2) ? settings.emptyZone.top : settings.y;
        }else{
            //значит двигаем вверх
            t = (settings.emptyZone.top - dropPosition.top > settings.height/2) ? settings.y : settings.emptyZone.top;
        }

        dragObject.style.left = l + 'px';
        dragObject.style.top = t + 'px';


        dropPosition={
            left : l,
            top  : t
        };

        return dropPosition;
    };

    var updateEmptyZone = function (dropPosition){
        //если положение пустой зоны совпало с координатами передвигаемой ячейки
        //пересчет порядка пятнашек
        if(
            settings.emptyZone.left == dropPosition.left &&
                settings.emptyZone.top == dropPosition.top
            ){
            //даю пустой ячейке координаты зоны, откуда пришла текущая пятнашка
            settings.emptyZone.left = settings.x;
            settings.emptyZone.top = settings.y;
            settings.emptyZone.right = settings.x + settings.width;
            settings.emptyZone.bottom = settings.y + settings.height;

            var cellIndex;
            for(var key in Matrix){
                if(Matrix[key]===settings.index){
                    cellIndex = parseInt(key);
                }
            }
            Matrix[cellIndex]=16;
            Matrix[settings.emptyZone.index]=settings.index;

            //здесь фиктивный индекс - тоесть где сейчас ячейка с реальным индексом 16
            settings.emptyZone.index = cellIndex;

            var victory = true;
            for(var key in Matrix){
                if(parseInt(key)!==Matrix[key]){
                    victory = false;
                }
            }
            if(victory){
                setTimeout(function (){
                    alert('(victory)');
                },500);
            }


        }
    };


    function mouseUp(){
        //довести элемент до конца, для освобождения зоны пустоты
        var dropPosition;

		console.log('up');

        if(settings.dragstart){
            //только для передвинутого элемента запускать вычисления
            dropPosition = ensureDestination();
            //апдейтить зону пустоты будем только после отпускания мыши
            addClass(dragObject,'animated');
            updateEmptyZone(dropPosition);
            // checkMatrix();
        }

        //сбросить перетаскиваемый объект
        dragObject = null;

        //установить указатель того, что элмент уже перетаскивался в false
        settings.dragstart = false;

        // очистить обработчики, т.к перенос закончен
        //document.onmousemove = null;
        //document.onmouseup = null;
        //document.ondragstart = null;
        //document.body.onselectstart = null;

		if(isFunction(window.mouseMoveOff)){
			window.mouseMoveOff();
		}

		if(isFunction(window.mouseUpOff)){
			window.mouseUpOff();
		}

		if(isFunction(window.dragstartOff)){
			window.dragstartOff();
		}

		if(isFunction(window.selectStartOff)){
			window.selectStartOff();
		}
    }

	function isFunction(func){
		return func && Object.prototype.toString.call(func).slice(8,-1).toLowerCase() === 'function';
	}


    function mouseMove(e){
        e = fixEvent(e)
        var l,t;

		 console.log('move');

        if(!settings.dragstart){
            settings.dragstart = true;
        }

        with(dragObject.style) {
            position = 'absolute';
            l = e.pageX - mouseOffset.x;
            t = e.pageY - mouseOffset.y;
            /*
             * settings.delta = это смещение клика в самом элементе
             * settings.x | y = это позиция, с которой начал движение элемент
             *
             * */

            //если вылазим за родителя
            //если позиционирование идет не от body а от какого-то position:relative
            //нужно отнять от вычисленного положения смещение родителя
            if(settings.parentOffset){
                l = l - settings.parentOffset.left;
                t = t - settings.parentOffset.top;
            }



            if(settings.direction == 'right'){
                //движение вправо доступно
                //нельзя двигать левее начала подвижной ячейки
                if(e.pageX - settings.delta.left - settings.parentOffset.left < settings.x){
                    l = settings.x;
                }
                //нельзя двигать правее зоны пустоты
                if(e.pageX+settings.delta.right - settings.parentOffset.left > settings.emptyZone.right){
                    l = settings.emptyZone.left;
                }
                left = l  + 'px';
            }else if(settings.direction == 'left'){
                //движение влево доступно
                //нельзя двигать левее левого края зоны пустоты
                if(e.pageX - settings.delta.left - settings.parentOffset.left < settings.emptyZone.left){
                    l = settings.emptyZone.left;
                }
                //нельзя двигать правее чем начало подвижной ячейки
                if(e.pageX - settings.delta.left - settings.parentOffset.left > settings.x){
                    l = settings.x;
                }
                left = l  + 'px';
            }


            if(settings.direction == 'bottom'){
                //движение вниз доступно
                //нельзя сдвигать выше самой ячейки
                if(e.pageY - settings.delta.top - settings.parentOffset.top < settings.y){
                    t = settings.y;
                }
                //нельзя сдвигать ниже пустой зоны
                if(e.pageY - settings.delta.top - settings.parentOffset.top > settings.emptyZone.top){
                    t = settings.emptyZone.top;
                }
                top = t + 'px';
            }else if(settings.direction == 'top'){
                //движение вверх доступно
                //не выходить при движении вверх за пустую зону
                if(e.pageY - settings.delta.top - settings.parentOffset.top < settings.emptyZone.top){
                    t = settings.emptyZone.top;
                }
                //не выходить при движении вниз ниже позиции самой ячейки
                if(e.pageY - settings.delta.top - settings.parentOffset.top > settings.y){
                    t = settings.y;
                }
                top = t + 'px';
            }


            //если установлено движение вдоль горизонтальной оси
//            if(settings.axisX){
//
//                l = e.pageX - mouseOffset.x;
//
//                //если вылазим за родителя
//                if(settings.container){
//                    if(l<settings.coords.left){
//                        l = settings.coords.left;
//                    }
//                    //если мышой клацнули  - у нас есть сколько осталось справа
//                    //от общей ширины элемента
//
//                    //при движении позиция мыши с вычитанием пространства по бокам элемента
//                    //не должно зайти за пределы, установленные в настройке
//                    if(e.pageX+settings.delta.xRight>settings.coords.right){
//                        //если
//                        l = settings.coords.right - settings.width;
//                    }
//                }
//                //если позиционирование идет не от body а от какого-то position:relative
//                //нужно отнять от вычисленного положения смещение родителя
//                if(settings.parentOffset){
//                    l = l - settings.parentOffset.left
//                }
//
//                left = l  + 'px';
//            }
//            if(settings.axisY){
//                if(settings.container){
//
//                    element.offsetHeight;
//                }
//                top = e.pageY - mouseOffset.y + 'px'
//            }
        }
        return false;
    }

    function mouseDown(e) {
        e = fixEvent(e);
		//если нажали не левой кнопкой мыши или не ткнули пальцем по тачдевайсу выходим
        if (e.which!=1 && !e.touches) return;
		console.log('down');
		//debugger;
        dragObject  = this;

        removeClass(dragObject,'animated');

        // получить сдвиг элемента относительно курсора мыши
        mouseOffset = getMouseOffset(this, e);

        //посчитать сдвиги от клика мыши к границам элемента
        settings.delta = {
            left:mouseOffset.x,
            right:settings.width - mouseOffset.x,
            top:mouseOffset.y,
            bottom:settings.height - mouseOffset.y
        };

        //получить индекс элемента
        settings.index = parseInt(dragObject.getAttribute('data-index'));

        //получить позицию элемента
        settings.x = parseInt(getStyle(dragObject,'left'));
        settings.y = parseInt(getStyle(dragObject,'top'));

        //проверить можно ли конкретно этот элемент тащить
        if(isDraggable()){
            // эти обработчики отслеживают процесс и окончание переноса
            //document.onmousemove = mouseMove;

			 console.log('draggable');
			window.mouseMoveOff = addListener(document,window.eventName.mousemove,mouseMove,false);
        }
        //document.onmouseup = mouseUp;
		window.mouseUpOff = addListener(document,window.eventName.mouseup,mouseUp,false);

        // отменить перенос и выделение текста при клике на тексте
        //document.ondragstart = function() { return false; }
		//отменить скролл body при драге на тачдевайсах вешаемся на touchmove
		window.dragstartOff = addListener(document,window.eventName.dragstart,function(event){
			event.preventDefault();

			//return false;
		},false);

		window.selectStartOff = addListener(document,'selectstart',function(event){
			event.preventDefault();

			//return false;
		});

        return false;
    }

    return {
        makeDraggable: function(element, options){
            //получить с относительным позиционированнием родителя если есть
            var closestRelative = getClosestRelative(element);
            settings = options;
            if(settings.container){
                var coords = getOffset(settings.container);
                coords.bottom = coords.top+settings.container.offsetHeight;
                coords.right = coords.left+settings.container.offsetWidth;
                settings.coords = coords;
            }
            settings.width = element.offsetWidth;
            settings.height = element.offsetHeight;
            //console.dir(settings);
			window.closestRelative = closestRelative;

            if(closestRelative){
                settings.parentOffset = getOffset(closestRelative);
            }

			window.mouseDownOff = addListener(element,window.eventName.mousedown,mouseDown,false);
            //element.onmousedown = mouseDown;
        }
    }

}());

function getPosition(e){
    var left = 0,
        top  = 0;

    while (e.offsetParent){
        left += e.offsetLeft;
        top  += e.offsetTop;
        e	 = e.offsetParent;
    }

    left += e.offsetLeft;
    top  += e.offsetTop;

    return {x:left, y:top};
}

var Matrix = (function (){
    var matrix, //матрица глобальная
        resultMatrix = {}, //матрица соответствий
        localMatrix; //матрица для нарезки


    var clone = function (obj){
        if(obj == null || typeof(obj) != 'object')
            return obj;

        var temp = obj.constructor(); // changed

        for(var key in obj)
            temp[key] = clone(obj[key]);
        return temp;
    };

    var graphs = {
        1 : [2,5],
        2 : [1,3,6],
        3 : [2,4,7],
        4 : [3,8],
        5 : [1,6,9],
        6 : [2,5,7,10],
        7 : [3,6,8,11],
        8 : [4,7,12],
        9 : [5,10,13],
        10 : [6,9,11,14],
        11 : [7,10,12,15],
        12 : [8,11,16],
        13 : [9,14],
        14 : [10,13,15],
        15 : [11,14,16],
        16 : [12,15]
    };

    //номер клетки | место физическое в пятнашках
    var basic = {
        1:1,
        2:2,
        3:3,
        4:4,
        5:5,
        6:6,
        7:7,
        8:8,
        9:9,
        10:10,
        11:11,
        12:12,
        13:13,
        14:14,
        15:15,
        16:16
    };

    var mashIndex = 0;

    var indexOf = function (arr,val){
        var index = -1;
        for(var i=0,length=arr.length;i<length;i++){
            if(arr[i]==val){
                index = i;
                break;
            }
        }
        return index;
    };

    var mixMatrix = function (index){

        //Клетка Битая пустой
        var idx,
            siblingIdx;

        idx = Math.floor(Math.random()*graphs[16].length);
        siblingIdx = graphs[16][idx];

        //не становиться на клетку, откуда пришел

        while(siblingIdx == index ){
            idx = Math.floor(Math.random()*graphs[16].length);
            siblingIdx = graphs[16][idx];
        }


        //взять ветки графов
        var соседиБитого = clone(graphs[siblingIdx]),
            соседиПустого = clone(graphs[16]);


        //у реальных соседей вместо битого прописуем пустого
        соседиБитого.forEach(function (соседБитого){
            //нашли индекс битого у соседа - нужно поменять
            var idx;
            if(соседБитого!=16){
                idx = indexOf(graphs[соседБитого],siblingIdx);
                if(idx!=-1){
                    graphs[соседБитого][idx] = 16;
                }
            }
        });

        //среди соседей бывшего битого больше нет пустого - теперь там сам битый
        соседиБитого[indexOf(соседиБитого, 16)] = siblingIdx;


        //у реальных соседей пустого теперь битый по соседству
        соседиПустого.forEach(function (соседПустого){
            var idx;
            if(соседПустого!=siblingIdx){
                idx = indexOf(graphs[соседПустого],16);
                if(idx!=-1){
                    graphs[соседПустого][idx] = siblingIdx;
                }
            }
        });

        //среди соседей пустого больше нет битого - теперь там сам пустой
        соседиПустого[indexOf(соседиПустого, siblingIdx)] = 16;


        var temp = basic[16]; //на какой клетке стояла 16

        //меняем клетки
        basic[16] = basic[siblingIdx]; //16 дырку ставим на клетку где стояла пятнашка
        basic[siblingIdx] = temp; //пятнашку ставим на клетку, где стояла дырка

        //меняем графы
        graphs[16] = соседиБитого;
        graphs[siblingIdx] = соседиПустого;


        //console.log(clone(graphs));
        //console.log(basic);

        mashIndex++;
        if(mashIndex<30){
            mixMatrix(siblingIdx);
        }
    };


    mixMatrix(16);




    var createNawkiMatrix = function (parent){
        var width = parent.offsetWidth,
            height = parent.offsetHeight,
            cells = 4,
            stepX = width/cells,
            stepY = height/cells,
            obj = {},
            matrix = [],
            index = 1;

        for(var row=0,length=4;row<length;row++){
            for(var col=0,length2=4;col<length2;col++){
                obj = {
                    top   : row*stepY,
                    left  : col*stepX,
                    index : index++ //итерация координатной ячейки
                };
                matrix.push(obj);
            }
        }
        return matrix;
    };
    var getRandomPosition = function (){
        var index = Math.floor(Math.random()*localMatrix.length);
        return localMatrix.splice(index,1)[0];
    };

    var initialize = function (){
        var cells = document.querySelectorAll('.nawki div'),
            emptyZone;
        matrix = createNawkiMatrix(document.querySelector('.nawki'));

        localMatrix = [];
        for(var i=0,length=matrix.length;i<length;i++){
            localMatrix.push(matrix[i]);
        }

        //ставим ячейку в зону 16
//        emptyZone = localMatrix.slice(matrix.length-1,1)[0];
//        emptyZone.right = emptyZone.left + cells[0].offsetWidth;
//        emptyZone.bottom = emptyZone.top + cells[0].offsetHeight;
//        emptyZone.index = 16; //пустая ячейка будет с индексом 16 по умолчанию
//        resultMatrix[emptyZone.index] = emptyZone.index;

        //ставим ячейку в зону 16
        //emptyZone = localMatrix.slice(matrix.length-1,1)[0];

        emptyZone = localMatrix[basic[16]-1];
        emptyZone.right = emptyZone.left + cells[0].offsetWidth;
        emptyZone.bottom = emptyZone.top + cells[0].offsetHeight;
        emptyZone.index = parseInt(basic[16]); //пустая ячейка будет с индексом 16 по умолчанию


        resultMatrix[emptyZone.index] = 16;


        //вешаем слушатель клика на каждую ячейку
        //TODO переделать на event delegation!!!

        [].slice.call(cells).forEach(function (cell,index){
            var idx = index + 1,//хочу чтоб индексы с 1 начинались, а не с 0
            // position = getRandomPosition();
                position = localMatrix[basic[idx]-1];
            addClass(cell,'animated-initial');
            cell.style.top = position.top + 'px';
            cell.style.left = position.left + 'px';
            cell.setAttribute('data-index',idx);
            cell.setAttribute('data-calculated',position.index);
            // resultMatrix[position.index] = idx;
            //в какой клетке что стоит
            resultMatrix[position.index] = idx;

            setTimeout(function(){
                removeClass(cell,'animated-initial');
            },1000);

            dragMaster.makeDraggable(cell,{
                axisX:true,
                container:document.querySelector('.nawki'),
                emptyZone:emptyZone
            });
        });


    };

    window.isEqual = function(a, b) {
        var p, t;
        for (p in a) {
            if (typeof b[p] === 'undefined') {
                return false;
            }
            if (b[p] && !a[p]) {
                return false;
            }
            t = typeof a[p];
            if (t === 'object' && !isEqual(a[p], b[p])) {
                return false;
            }
            if (t === 'function' && (typeof b[p] === 'undefined' || a[p].toString() !== b[p].toString())) {
                return false;
            }
            if (a[p] !== b[p]) {
                return false;
            }
        }
        for (p in b) {
            if (typeof a[p] === 'undefined') {
                return false;
            }
        }
        return true;
    };



    initialize();
    console.log(resultMatrix);
    console.log(basic);
    console.log(isEqual(resultMatrix, basic));
    return resultMatrix;
})();



