var event = require('./event')
	,helpers = require('./helpers')
	,dragController = require('./drag-controller')
	,Nawki;

Nawki = (function (){
	var matrix				//матрица глобальная
		,resultMatrix = {}  //матрица соответствий
		,localMatrix 		//матрица для нарезки
		,emptyZone 			//зона с пустой клеткой
		,graphs				//в ключе индекс клетки в значении массив индексов соседей

	graphs = {
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

	var mashIndex = 0; //сколько раз перемешали матрицу при запуске смешивания

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
		var соседиБитого = helpers.clone(graphs[siblingIdx]),
			соседиПустого = helpers.clone(graphs[16]);


		//у реальных соседей вместо битого прописуем пустого
		соседиБитого.forEach(function (соседБитого){
			//нашли индекс битого у соседа - нужно поменять
			var idx;
			if(соседБитого!=16){
				idx = graphs[соседБитого].indexOf(siblingIdx);
				if(idx!=-1){
					graphs[соседБитого][idx] = 16;
				}
			}
		});

		//среди соседей бывшего битого больше нет пустого - теперь там сам битый
		соседиБитого[соседиБитого.indexOf(16)] = siblingIdx;


		//у реальных соседей пустого теперь битый по соседству
		соседиПустого.forEach(function (соседПустого){
			var idx;
			if(соседПустого!=siblingIdx){
				idx = graphs[соседПустого].indexOf(16);
				if(idx!=-1){
					graphs[соседПустого][idx] = siblingIdx;
				}
			}
		});

		//среди соседей пустого больше нет битого - теперь там сам пустой
		соседиПустого[соседиПустого.indexOf(siblingIdx)] = 16;


		var temp = basic[16]; //на какой клетке стояла 16

		//меняем клетки
		basic[16] = basic[siblingIdx]; //16 дырку ставим на клетку где стояла пятнашка
		basic[siblingIdx] = temp; //пятнашку ставим на клетку, где стояла дырка

		//меняем графы
		graphs[16] = соседиБитого;
		graphs[siblingIdx] = соседиПустого;

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
	
	function updatePosition(index){
		var cellIndex;

		for(const key in resultMatrix){
			if(resultMatrix[key] === index){
				cellIndex = parseInt(key);
			}
		}
		resultMatrix[cellIndex] = 16;
		resultMatrix[emptyZone.index] = index;

		//здесь фиктивный индекс - тоесть где сейчас ячейка с реальным индексом 16
		emptyZone.index = cellIndex;

		var victory = true;
		for(var key in resultMatrix){
			if(parseInt(key)!==resultMatrix[key]){
				victory = false;
			}
		}
		if(victory){
			setTimeout(function (){
				alert('(victory)');
			},500);
		}
	}

	var initialize = function (){
		var cells = document.querySelectorAll('.nawki div');

		matrix = createNawkiMatrix(document.querySelector('.nawki'));

		localMatrix = [];
		for(var i=0,length=matrix.length;i<length;i++){
			localMatrix.push(matrix[i]);
		}

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
			helpers.addClass(cell,'animated-initial');
			cell.style.top = position.top + 'px';
			cell.style.left = position.left + 'px';
			cell.setAttribute('data-index',idx);
			cell.setAttribute('data-calculated',position.index);
			// resultMatrix[position.index] = idx;
			//в какой клетке что стоит
			resultMatrix[position.index] = idx;

			//todo
			if(index === 0){
				dragController.setOptions({
					triggerUpdate: updatePosition,
					axisX: true,
					container: document.querySelector('.nawki'),
					emptyZone: emptyZone, //shared object
					offsetParent: cell.offsetParent,
					width: cell.offsetWidth,
					height: cell.offsetHeight
				});
			}

			setTimeout(function(){
				helpers.removeClass(cell,'animated-initial');
			},1000);

			dragController.makeDraggable(cell);
		});


	};

	return {
		initialize: initialize
	};
})();

Nawki.initialize();