var event = require('./event')
	,helpers = require('./helpers')
	,dragController = (function() {

	var dragObject,
		mouseOffset,
		settings={};

	function updateOnWindowResize(){
		var cells = document.querySelectorAll('.nawki div');

		//по топорному пока что пересчитаем позицию на экране положение поля с пятнашками после изменения
		//пропорций экрана
		if(settings.offsetParent){
			settings.offsetParentCoords = helpers.getCoords(settings.offsetParent);
		}

	}

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
		var docPos	= helpers.getCoords(target);
		return {x:e.pageX - docPos.left, y:e.pageY - docPos.top};
	}


	var ensureDestination = function (){
		var dropPosition={
				left : parseInt(helpers.getStyle(dragObject,'left')),
				top  : parseInt(helpers.getStyle(dragObject,'top'))
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

			//TODO remove this logic from here
			settings.triggerUpdate(settings.index);


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
			helpers.addClass(dragObject,'animated');
			updateEmptyZone(dropPosition);
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

		if(helpers.isFunction(window.mouseMoveOff)){
			window.mouseMoveOff();
		}

		if(helpers.isFunction(window.mouseUpOff)){
			window.mouseUpOff();
		}

		if(helpers.isFunction(window.dragstartOff)){
			window.dragstartOff();
		}

		if(helpers.isFunction(window.selectStartOff)){
			window.selectStartOff();
		}
	}


	function mouseMove(e){
		var l,t,style = dragObject.style;

		e = event.fix(e);

		if(!settings.dragstart){
			settings.dragstart = true;
		}

		style.position = 'absolute';
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
		if(settings.offsetParentCoords){
			l = l - settings.offsetParentCoords.left;
			t = t - settings.offsetParentCoords.top;
		}



		if(settings.direction == 'right'){
			//движение вправо доступно
			//нельзя двигать левее начала подвижной ячейки
			if(e.pageX - settings.delta.left - settings.offsetParentCoords.left < settings.x){
				l = settings.x;
			}
			//нельзя двигать правее зоны пустоты
			if(e.pageX+settings.delta.right - settings.offsetParentCoords.left > settings.emptyZone.right){
				l = settings.emptyZone.left;
			}
			style.left = l  + 'px';
		}else if(settings.direction == 'left'){
			//движение влево доступно
			//нельзя двигать левее левого края зоны пустоты
			if(e.pageX - settings.delta.left - settings.offsetParentCoords.left < settings.emptyZone.left){
				l = settings.emptyZone.left;
			}
			//нельзя двигать правее чем начало подвижной ячейки
			if(e.pageX - settings.delta.left - settings.offsetParentCoords.left > settings.x){
				l = settings.x;
			}
			style.left = l  + 'px';
		}


		if(settings.direction == 'bottom'){
			//движение вниз доступно
			//нельзя сдвигать выше самой ячейки
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top < settings.y){
				t = settings.y;
			}
			//нельзя сдвигать ниже пустой зоны
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top > settings.emptyZone.top){
				t = settings.emptyZone.top;
			}
			style.top = t + 'px';
		}else if(settings.direction == 'top'){
			//движение вверх доступно
			//не выходить при движении вверх за пустую зону
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top < settings.emptyZone.top){
				t = settings.emptyZone.top;
			}
			//не выходить при движении вниз ниже позиции самой ячейки
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top > settings.y){
				t = settings.y;
			}
			style.top = t + 'px';
		}

		return false;
	}

	function mouseDown(e) {
		e = event.fix(e);
		//если нажали не левой кнопкой мыши или не ткнули пальцем по тачдевайсу выходим
		if (e.which!=1 && !e.touches) return;
		console.log('down');
		//debugger;
		dragObject  = this;

		helpers.removeClass(dragObject,'animated');

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
		settings.x = parseInt(helpers.getStyle(dragObject,'left'));
		settings.y = parseInt(helpers.getStyle(dragObject,'top'));

		//проверить можно ли конкретно этот элемент тащить
		if(isDraggable()){
			// эти обработчики отслеживают процесс и окончание переноса
			//document.onmousemove = mouseMove;

			console.log('draggable');
			window.mouseMoveOff = event.add(document,event.alias.mousemove,mouseMove,false);
		}
		//document.onmouseup = mouseUp;
		window.mouseUpOff = event.add(document,event.alias.mouseup,mouseUp,false);

		// отменить перенос и выделение текста при клике на тексте
		//document.ondragstart = function() { return false; }
		//отменить скролл body при драге на тачдевайсах вешаемся на touchmove
		window.dragstartOff = event.add(document,event.alias.dragstart,function(event){
			event.preventDefault();

			//return false;
		},false);

		window.selectStartOff = event.add(document,'selectstart',function(event){
			event.preventDefault();

			//return false;
		});

		return false;
	}

	//todo
	event.add(window,'resize',updateOnWindowResize,false);
	//window.addEventListener('resize',updateOnWindowResize);

	return {
		makeDraggable: function(element){
			//element.onmousedown = mouseDown;
			window.mouseDownOff = event.add(element,event.alias.mousedown,mouseDown,false);
		}
		,setOptions: function(options){
			settings = options;
			//получить с относительным позиционированнием родителя если есть
			if(settings.container){
				var coords = helpers.getCoords(settings.container);
				coords.bottom = coords.top+settings.container.offsetHeight;
				coords.right = coords.left+settings.container.offsetWidth;
				settings.coords = coords;
			}
			settings.offsetParentCoords = helpers.getCoords(settings.offsetParent);
			console.dir(settings);
		}
	}

}());

module.exports = dragController;