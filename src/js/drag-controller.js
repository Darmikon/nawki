var event = require('./event')
	,helpers = require('./helpers')
	,dragController = (function() {

	var dragObject,
		mouseOffset,
		settings={};

	function updateOnWindowResize(){
		var cells = document.querySelectorAll('.nawki div');

		//�� ��������� ���� ��� ����������� ������� �� ������ ��������� ���� � ���������� ����� ���������
		//��������� ������
		if(settings.offsetParent){
			settings.offsetParentCoords = helpers.getCoords(settings.offsetParent);
		}

	}

	var isDraggable = function (){
		var result = false;

		if(
			//�������� �� �������� �� ����������� � �������� ������?
		settings.y === settings.emptyZone.top &&
		Math.abs(settings.x - settings.emptyZone.left) === settings.width
		){
			settings.direction = (settings.x - settings.emptyZone.left)>0?'left':'right';
			result = true;

		}else if(
			//�������� �� �������� �� ��������� � �������� ������?
		settings.x === settings.emptyZone.left &&
		Math.abs(settings.y - settings.emptyZone.top) === settings.height
		){
			settings.direction = (settings.y - settings.emptyZone.top)>0?'top':'bottom';
			result = true;
		}


		return result;
	};

	// �������� ����� target ������������ ������� ����
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
			//������ ������� �����
			l = (settings.x - dropPosition.left > settings.width/2) ? settings.emptyZone.left : settings.x;
		}else{
			//������ ������� ������
			l = (settings.emptyZone.left - dropPosition.left > settings.width/2) ? settings.x : settings.emptyZone.left;
		}


		if(settings.y>settings.emptyZone.top){
			//������ ������� ����
			t = (settings.y - dropPosition.top > settings.height/2) ? settings.emptyZone.top : settings.y;
		}else{
			//������ ������� �����
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
		//���� ��������� ������ ���� ������� � ������������ ������������� ������
		//�������� ������� ��������
		if(
			settings.emptyZone.left == dropPosition.left &&
			settings.emptyZone.top == dropPosition.top
		){
			//��� ������ ������ ���������� ����, ������ ������ ������� ��������
			settings.emptyZone.left = settings.x;
			settings.emptyZone.top = settings.y;
			settings.emptyZone.right = settings.x + settings.width;
			settings.emptyZone.bottom = settings.y + settings.height;

			//TODO remove this logic from here
			settings.triggerUpdate(settings.index);


		}
	};


	function mouseUp(){
		//������� ������� �� �����, ��� ������������ ���� �������
		var dropPosition;

		console.log('up');

		if(settings.dragstart){
			//������ ��� ������������� �������� ��������� ����������
			dropPosition = ensureDestination();
			//��������� ���� ������� ����� ������ ����� ���������� ����
			helpers.addClass(dragObject,'animated');
			updateEmptyZone(dropPosition);
		}

		//�������� ��������������� ������
		dragObject = null;

		//���������� ��������� ����, ��� ������ ��� �������������� � false
		settings.dragstart = false;

		// �������� �����������, �.� ������� ��������
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
		 * settings.delta = ��� �������� ����� � ����� ��������
		 * settings.x | y = ��� �������, � ������� ����� �������� �������
		 *
		 * */

		//���� ������� �� ��������
		//���� ���������������� ���� �� �� body � �� ������-�� position:relative
		//����� ������ �� ������������ ��������� �������� ��������
		if(settings.offsetParentCoords){
			l = l - settings.offsetParentCoords.left;
			t = t - settings.offsetParentCoords.top;
		}



		if(settings.direction == 'right'){
			//�������� ������ ��������
			//������ ������� ����� ������ ��������� ������
			if(e.pageX - settings.delta.left - settings.offsetParentCoords.left < settings.x){
				l = settings.x;
			}
			//������ ������� ������ ���� �������
			if(e.pageX+settings.delta.right - settings.offsetParentCoords.left > settings.emptyZone.right){
				l = settings.emptyZone.left;
			}
			style.left = l  + 'px';
		}else if(settings.direction == 'left'){
			//�������� ����� ��������
			//������ ������� ����� ������ ���� ���� �������
			if(e.pageX - settings.delta.left - settings.offsetParentCoords.left < settings.emptyZone.left){
				l = settings.emptyZone.left;
			}
			//������ ������� ������ ��� ������ ��������� ������
			if(e.pageX - settings.delta.left - settings.offsetParentCoords.left > settings.x){
				l = settings.x;
			}
			style.left = l  + 'px';
		}


		if(settings.direction == 'bottom'){
			//�������� ���� ��������
			//������ �������� ���� ����� ������
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top < settings.y){
				t = settings.y;
			}
			//������ �������� ���� ������ ����
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top > settings.emptyZone.top){
				t = settings.emptyZone.top;
			}
			style.top = t + 'px';
		}else if(settings.direction == 'top'){
			//�������� ����� ��������
			//�� �������� ��� �������� ����� �� ������ ����
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top < settings.emptyZone.top){
				t = settings.emptyZone.top;
			}
			//�� �������� ��� �������� ���� ���� ������� ����� ������
			if(e.pageY - settings.delta.top - settings.offsetParentCoords.top > settings.y){
				t = settings.y;
			}
			style.top = t + 'px';
		}

		return false;
	}

	function mouseDown(e) {
		e = event.fix(e);
		//���� ������ �� ����� ������� ���� ��� �� ������ ������� �� ���������� �������
		if (e.which!=1 && !e.touches) return;
		console.log('down');
		//debugger;
		dragObject  = this;

		helpers.removeClass(dragObject,'animated');

		// �������� ����� �������� ������������ ������� ����
		mouseOffset = getMouseOffset(this, e);

		//��������� ������ �� ����� ���� � �������� ��������
		settings.delta = {
			left:mouseOffset.x,
			right:settings.width - mouseOffset.x,
			top:mouseOffset.y,
			bottom:settings.height - mouseOffset.y
		};

		//�������� ������ ��������
		settings.index = parseInt(dragObject.getAttribute('data-index'));

		//�������� ������� ��������
		settings.x = parseInt(helpers.getStyle(dragObject,'left'));
		settings.y = parseInt(helpers.getStyle(dragObject,'top'));

		//��������� ����� �� ��������� ���� ������� ������
		if(isDraggable()){
			// ��� ����������� ����������� ������� � ��������� ��������
			//document.onmousemove = mouseMove;

			console.log('draggable');
			window.mouseMoveOff = event.add(document,event.alias.mousemove,mouseMove,false);
		}
		//document.onmouseup = mouseUp;
		window.mouseUpOff = event.add(document,event.alias.mouseup,mouseUp,false);

		// �������� ������� � ��������� ������ ��� ����� �� ������
		//document.ondragstart = function() { return false; }
		//�������� ������ body ��� ����� �� ����������� �������� �� touchmove
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
			//�������� � ������������� ������������������ �������� ���� ����
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