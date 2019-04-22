/**
 * Created by НСЛ on 14.02.2018.
 *
 document.idSession - код сеанса
 document.apiurl - URL API
 document.zindexCard - z - текущий максимальный я - индекс для перемещаемых объектов. Начингаем от 100;
 document.currentTreeID - id текущего элемента дерева
 document.eventSession - обработчик - сеанс открыт (sessionOpen)
 document.eventCarSelected - обработчик - авто выфбран (carSelected)
 document.eventCardView - событие во фрейме autoCard - cardView - показать карточку авто
 document.getElementById('sAutoCar').dataObject - данные о выбранном автомобиле
 //document.getElementById('sAutoProd').dataObject - данные о выбранном автомобиле
 */
var sNumbSec = document.getElementById(['sNumbSec']);
var sNumbForm = document.getElementById(['sNumbForm']);
var sNumb = document.getElementById(['sNumb']);
var sNumbDivHead = document.getElementById(['sNumbDivHead']);
var sNumbTabHead = document.getElementById(['sNumbTabHead']);
var sNumbOver = document.getElementById(['sNumbOver']);
var sNumbTab = document.getElementById(['sNumbTab']);

var sAutoSec = document.getElementById(['sAutoSec']);
var sAutoAuto = document.getElementById(['sAutoAuto']);
var sAutoCar = document.getElementById(['sAutoCar']);
var sAutoData = document.getElementById(['sAutoData']);
var sAutoTree = document.getElementById(['sAutoTree']);
/*sAutoTree.onclick = function () {
    
}*/
var sAutoResize = document.getElementById(['sAutoResize']);
var sAutoProd = document.getElementById(['sAutoProd']);

//var sSuppSec = document.getElementById(['sSuppSec']);

//var pListSec = document.getElementById(['pListSec']);

/* --- Управление вкладками --- */
function onclickShortcut(e) {
    var cutNew=e.target.closest('label');
    if (!cutNew) return false;
    var cutOld=cutNew.parentElement.getElementsByClassName('cutCurrent')[0];
    if (cutOld == cutNew) return false;

    if (cutOld) {
        /* восстанавливаем состояник - вкладка отключена */
        cutOld.classList.remove("cutCurrent");
        cutOld.style.borderStyle="outset";
        cutOld.style.backgroundColor="#eee";
        //cutOld.style.fontWeight="normal"
        cutOld.style.color="#888";
        if (cutOld.id) {
            document.querySelector("." + cutOld.id.substr(0,5)+'Sec').style.display = "none";
        }
    }
    cutNew.classList.add("cutCurrent");
    cutNew.style.borderStyle="inset";
    cutNew.style.backgroundColor="#fed";
    //cutNew.style.fontWeight="bold"
    cutNew.style.color="#008";
    if (cutNew.id) {
        document.querySelector("."+cutNew.id.substr(0,5)+'Sec').style.display="block";
    }
    return;
}

/* --- Вывод таблицы запчастей при поиске по номеру --- */
function writesNumbTable(res) {
    var sNumbBody = document.getElementById('sNumbBody');
    // очищаем таблицу
    if (sNumbBody) sNumbBody.parentNode.removeChild(sNumbBody);
    sNumbBody = document.createElement('tbody');
    sNumbBody.id = 'sNumbBody';
    var text = '';
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        text+='<tr class="'+(row['TypeCode'] == 3 ? 'orig' : 'cros')+'" id="an'+row.ID+'">' +
            '<td class="c1">' + row['ManufacturerDescription'] +
            '</td><td class="c2">' + row['DataSupplierArticleNumber'] +
            '</td><td class="c3">' + row['NormalizedDescription'] +
            '</td><td class="c4">' + (row['FileImage'] ?
            '<img src="' + row['FileIconFull'] + '">':'') +
            /*'<td class="c5"><div align="center">' +  (row['TypeCode'] == 3 ? '&#10004' : '') +
            '</div></td>*/
            '</tr>';
    }
        //text+='<tr><td></td><td></td><td></td><td></td></tr>';
    sNumbBody.innerHTML = text;
    document.getElementById('sNumbTab').appendChild(sNumbBody);
    sNumbTabAlign();
    /*var tr = document.getElementById('sNumbOver').querySelector('tr');
    if (tr) {
        setColumnWidth(document.querySelector('.sNumbSec').querySelectorAll('th'), tr.querySelectorAll('td'));
    }*/
}

/* --- Отправка запроса поиска по номеру на сервер ---*/
function onsubmitsNumbForm(e) {
    var sNumb =  document.getElementById('sNumb').value;
    if (!sNumb) return false;
    var sNumbForm = document.getElementById('sNumbForm');
    var foundBy = sNumbForm.querySelector('.cutCurrent input').value;
    if (foundBy == 5 && sNumb.length != 13) {
        showMessage('Штрих-код должен содержать 13 символов');
        return false;
    }
    var query = 'action=getArticlesSearch&idSession=' + document.idSession +
        '&order=ProductID,%20ManufacturerDescription&FoundString=' +
        encodeURIComponent(sNumb) + '&FoundBy=' + foundBy;
    var xhr = new XMLHttpRequest();
    xhr.open('GET',document.apiurl + 'index.php?'+query,true);
    xhr.dataProcessingFunction = writesNumbTable;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout=0;
    xhr.send();
    return false;
}

function treeProductWrite(res) {
    var data=res.data;
    text='';
    for (var i=0; i<data.length; i++) {
        row=data[i];
        text += '<tr class="' + (row.TypeCode == 3 ? 'orig' : 'cros')+'" id = "at' + row.ID +
            '"><td class="tp1">' + row.ManufacturerDescription +
            '</td><td class="tp2">' + row.DataSupplierArticleNumber +
            '</td><td class="tp3">' + (row.FileImage  ? '<img src="' + row.FileIconFull + '">':'') +
            '</td></tr>\n';
    }
    document.getElementById('sAutoProdData').innerHTML = text;
    document.getElementById('sAutoProdData').onclick = onclickArticle;
}

function treeProductReadData() {
    var ds = sAutoProd.dataset;
    if (ds.count == 0) return;
    if (ds.limit != ds.limitnew) {
        ds.curlist = Math.floor(ds.limit*(ds.curlist-1)/ds.limitnew)+1;
        ds.limit = ds.limitnew;
        ds.countlist = Math.ceil(ds.count/ds.limit);
    }
    if (ds.curlist < 1) ds.curlist = 1;
    if (ds.curlist > (ds.countlist-0) ) ds.curlist = ds.countlist;
    offset=(ds.curlist-1)*ds.limit;
    document.getElementById('tpCountList').value=ds.countlist;
    document.getElementById('tpCurList').value=ds.curlist;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + ds.query +
        '&offset=' + offset + '&limit=' + ds.limit, true);
    xhr.dataProcessingFunction = treeProductWrite;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

function treeProductRead(e) {
    if (e.target.tagName != 'SPAN') return;
    var idProduct = e.target;;
    if (sAutoProd.treeNode) sAutoProd.treeNode.style.backgroundColor = '#dddddd';

    sAutoProd.treeNode = idProduct;
    idProduct.style.backgroundColor = '#00cccc';
    var tpDescription = document.getElementById('tpDescription');
    sAutoProd.dataset.id = idProduct.id.substr(2);
    sAutoProd.dataset.curlist = 1;
    var sAutoProdData = document.getElementById('sAutoProdData');
    if (sAutoProdData) sAutoProdData.parentNode.removeChild(sAutoProdData);
    sAutoProdData = document.createElement('tbody');
    sAutoProdData.id = 'sAutoProdData';
    document.getElementById('sAutoProdTab').appendChild(sAutoProdData);
    tpDescription.innerText = idProduct.innerText;
    document.getElementById('tpAssembly').innerText = idProduct.dataset.assembly;
    document.getElementById('tpUsage').innerText = idProduct.dataset.usage;
    var query = 'action=getArticlesProduct&idSession=' + document.idSession +
        '&ProductID=' + sAutoProd.dataset.id;
    if (sAutoCar.dataObject.carID) query += '&CarID=' + sAutoCar.dataObject.carID;
    sAutoProd.dataset.query = query+'&order=ManufacturerDescription,DataSupplierArticleNumber';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + query + '&count=1', true);
    xhr.dataProcessingFunction = treeProductReadCount;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

function treeProductReadCount(res) {
    sAutoProd.dataset.count = res.count;
    sAutoProd.dataset.limit = sAutoProd.dataset.limitnew;
    if (res.count) {
        sAutoProd.dataset.countlist = Math.ceil(res.count/sAutoProd.dataset.limit);
        treeProductReadData();
        return;
    }
    sAutoProd.dataset.count = 0;
    sAutoProd.dataset.countlist = 0;
    document.getElementById('tpCountList').value=0;
    document.getElementById('tpCurList').value=0;
}

function addTreeProductWrite(res) {
    var idTree = document.getElementById(document.currentTreeID);
    var data = res.data;
    var text = '';
    for (var i=0; i<data.length; i++) {
        var row = data[i];
        text += '<li><span id="tp'+row.ID +'" data-assembly="'+ row.AssemblyGroupDescription +'" data-usage="' +
            row.UsageDescription+'">' + row.ProductDescription + '</span></li>\n';
        //row.UsageDescription+'" onclick="treeProductRead('+ row.ID +')">' + row.ProductDescription + '</span></li>\n';
    }
    var ul = document.createElement('ul');
    ul.innerHTML = text;
    idTree.parentNode.appendChild(ul);
}

function addTreeProduct(id) {
    var idTree = document.getElementById(id);

    // Если выборан и не имеет подчинения - делаем запрос на продукцию
    if (idTree.checked && !idTree.parentNode.querySelector('ul')) {
        document.currentTreeID = id;
        var query = 'action=getProductsNode&idSession=' + document.idSession + '&variant=1&NodeID=' + id;
        if (sAutoCar.dataObject.carID) query += '&CarID='+sAutoCar.dataObject.carID;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', document.apiurl + 'index.php?' + query, true);
        xhr.dataProcessingFunction = addTreeProductWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 0;
        xhr.send();
    }
}

function carTreeWrite(res) {
    var carID = sAutoCar.dataObject.carID;
    var data=res.data;
    var mas = [];
    var uk = [];
    for (var i=0; i<data.length; i++) {
        var row = data[i];
        var level = row.Level;
        if (carID != 0 && level == 1) continue;
        if (carID != 0 && level == 2) row.ParentID = 0;
        var id = row.ID;
        var parent = row.ParentID;
        mas[id] = row;
        mas[id].sub = [];
        if (parent != 0) mas[parent].sub.push(id);
        else uk.push(id)
    }
    var tekid = uk[0];
    var tekur = 1;
    var ind = [0, 0];
    var zakr = false;
    var text = '';
    i = 0;
    while (i < uk.length) {
        var tek = mas[tekid];
        var kolsub = tek.sub.length;
        if (ind[tekur] == 0) {
            if (kolsub > 0) {
                text += '<li><input type="checkbox" id="' + tek.ID +
                '">\n<label for="' + tek.ID + '">' + tek.Description + '</label>\n<ul>';
            } else {
                text += '<li><input type="checkbox" onclick="addTreeProduct(' + tek.ID + ')" id="' + tek.ID +
                    '">\n<label for="' + tek.ID + '">' + tek.Description + '</label></li>\n';
                //text += '<li><a href="#?id=' + tek['ID'] + '" target="_blank">' + tek['Description'] + '</a></li>\n';
            }
            zakr = false;
        }
        if (ind[tekur] < kolsub) {
            tekid=tek.sub[ind[tekur]];
            ind[tekur]++;
            tekur++;
            ind[tekur]=0;
        } else {
            tekur--;
            tekid = tek.ParentID;
            if (zakr) {
                text += "</ul></li>\n";
            } else {
                zakr=true;
            }
            if (tekur < 1) {
                i++;
                tekid=uk[i];
                tekur=1;
                ind[1]=0;
            }
        }
    }
    var tree = document.getElementById('tree');
    // очищаем таблицу
    if (tree) tree.parentNode.removeChild(tree);
    tree = document.createElement('div');
    tree.id = 'tree';
    tree.cssText = 'height: 100%; width: 100%; overflow: auto;';
    tree.innerHTML = text;
    document.getElementById('sAutoTree').appendChild(tree);
}

function carTreeRead() {
    var query = 'action=getTree&idSession=' + document.idSession + '&order=Level, treetype, ParentID';
    if (sAutoCar.dataObject.carID) query += '&CarID='+sAutoCar.dataObject.carID;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + query, true);
    xhr.dataProcessingFunction = carTreeWrite;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

/* --- выбор запчасти для просмотра */
function onclickArticle(e) {
    var tr = e.target.closest('tr');
    if (!tr) return;
    var id = tr.id.substr(2);
    var aCard = document.getElementById('aCard'+id);
    if (aCard) {
        return;
    }
    aCard = document.getElementById('aCard').cloneNode(true);
    aCard.id = 'aCard' + id;
    var width = (window.innerWidth<=619 || window.innerHeight<=619) ? 360 : (window.innerWidth<=949 ? 420 : 480); //   360;
    var height = 480;
    var heightHead = 24;
    var heightMain = height - heightHead;
    var table = tr.closest('table');
    var aCardHead = aCard.querySelector('header');
    /*aCard.style.cssText = 'display: block; position: fixed; width: ' + width + 'px;' +
        'top: ' + ((window.innerHeight - e.clientY) >= height ? e.clientY :
            (e.clientY >= height) ? e.clientY - height : (window.innerHeight - height)) +
        'px; left: ' + ((window.innerWidth - e.clientX < width) ? window.innerWidth - width : e.clientX) + 'px;';*/
    aCard.style.cssText = 'display: block; top: ' + ((window.innerHeight - e.clientY) >= height ? e.clientY :
         (e.clientY >= height) ? e.clientY - height : (window.innerHeight - height)) +
        'px; left: ' + ((window.innerWidth - e.clientX < width) ? window.innerWidth - width : e.clientX) + 'px;';
    var main = aCard.querySelector('main');
    main.style.height=heightMain + 'px';
    document.body.appendChild(aCard);
    aCard.querySelector('.headExit').onclick = function () {
        aCard.parentNode.removeChild(aCard);
    }
    aCard.querySelector('.headHide').onclick = function () {

        if (window.getComputedStyle(main).display == 'none') {
            main.style.display = 'block';
            aCard.querySelector('.headHide').textContent = '_'
        } else {
            main.style.display = 'none';
            aCard.querySelector('.headHide').textContent = '▢'
        }

    }
    // определение обработки событий карточки запчасти
    var aCuts = aCard.querySelector('.cuts');
    aCuts.onclick = onclickcut;
    var cutNew = aCuts.querySelector('.cutsCurrent');
    cutNew.style.borderStyle = "inset";
    cutNew.style.backgroundColor = "#fed";
    cutNew.style.color = "#008";
    aCard.querySelector('.'+cutNew.classList[0].substr(3)).style.display = "block";
    var sectionHeight = heightMain - aCuts.offsetHeight - 2;
        //aCard.clientHeight - aCuts.offsetTop- aCuts.offsetHeight-15;
    aCard.querySelector('.info').style.height = aCard.querySelector('.foto').style.height =
        aCard.querySelector('.anal').style.height = aCard.querySelector('.auto').style.height =sectionHeight + 'px';
    var query = 'action=getArticle&idSession=' + document.idSession + '&ID=' +id;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + query, true);
    xhr.dataProcessingFunction = articleRead;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();

    dragAnObject(aCard, aCardHead);


}

function articleRead(res) {
    // получение данных о запчасти и запрос данных о ее атрибутах
    // Чтение данных об атрибутах детали
    var query = 'action=getArticleAttributes&idSession=' + document.idSession + '&ID='+res.ID;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + query, true);
    xhr.dataObject = res;
    xhr.dataProcessingFunction = articleWrite;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

function articleWrite(res) {
    var data = res.dataObject;
    var aCard=document.getElementById('aCard'+data.ID);
    var aCardHead = aCard.querySelector('header');
    aCardHead.querySelector('span').textContent = data.DataSupplierArticleNumber+ ' ' + data.NormalizedDescription;
    aCardHead.querySelector('img').src = data.FileIconFull ? data.FileIconFull : 'about:blank';
    var text ='<tr><td>Артикул</td><td>' + data.DataSupplierArticleNumber + '</td></tr>' +
        '<tr><td>Производитель</td><td>' + data.ManufacturerDescription + '</td></tr>' +
        '<tr><td>Наименование</td><td>' + data.NormalizedDescription + '</td></tr>' +
        (data.Description ? '<tr><td>Модель</td><td>' + data.Description +'</td></tr>' : '') +
        '<tr><td>Код</td><td>' + data.ID + '</td></tr>' +
        (data.AssemblyGroupDescription ? '<tr><td>Монтаж</td><td>' + data.AssemblyGroupDescription +'</td></tr>' : '') +
        (data.UsageDescription ? '<tr><td>Назначение</td><td>' + data.UsageDescription +'</td></tr>' : '');
    atr=res.data;
    for (var i=0; i<atr.length; i++) {
        var row = atr[i];
        if (row.DisplayValue) text += '<tr><td>' + row.DisplayTitle + '</td><td>' + row.DisplayValue + '</td></tr>';
    }
    aCard.querySelector('.info tbody').innerHTML = text;
    if (data.FileImageFull) {
        var foto = aCard.querySelector('.foto')
        var img = foto.children[foto.children.length-1];
        img.src = data.FileImageFull;
        var div=foto.children[0];
        div.querySelector('img').src = data.FileIconFull;
        div.querySelector('button').FileImage = data.FileImageFull;
        //var sectionHeight = aCard.querySelector('.foto').clientHeight;
        if (data.CountImage == 1) {
            div.style.display='none';
            aCard.querySelector('.foto img').style.maxHeight = '100%';
        } else {
            var query = 'action=getArticleImages&idSession=' + document.idSession + '&ID='+data.ID;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', document.apiurl + 'index.php?' + query, true);
            xhr.dataObject = aCard;
            xhr.dataProcessingFunction = articleImgsRead;
            xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
            xhr.timeout = 0;
            xhr.send();
            aCard.querySelector('.foto img').style.maxHeight = (parseInt(foto.style.height) - 36) + 'px';
        }
    } else {
        aCard.querySelector('.cutfoto').style.display='none';
    }
}

function articleImgsRead(res) {
    var aCard=res.dataObject;
    var data = res.data;
    var foto = aCard.querySelector('.foto');
    var div = foto.children[0];

    for (i=1; i<data.length; i++) {
        var row = data[i];
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'ico';
        button.FileImage = row.FileImage;
        button.innerHTML = '<img src="' + row.FileIcon +'">';
        div.appendChild(button);
        div.onclick = onClickImage;
    }
}

function onClickImage(e) {
    var button = e.target.closest('button');
    var div = button.parentNode;
    var buttonold = div.querySelector('.cutCurrent');
    if (button == buttonold) return;
    buttonold.style.borderStyle='outset';
    buttonold.classList.remove("cutCurrent");
    button.style.borderStyle='inset';
    button.classList.add("cutCurrent");
    var foto = div.parentNode;
    foto.children[foto.children.length-1].src = button.FileImage;
}

// Управление вкладками карточки запчасти
function onclickcut(e) {
    var cutNew=e.target.closest('label');
    if (!cutNew) return false;
    var cutOld=cutNew.parentElement.getElementsByClassName('cutsCurrent')[0];
    if (cutOld == cutNew) return false;
    var main =  cutNew.closest('main');
    if (cutOld) {
        /* восстанавливаем состояник - вкладка отключена */
        cutOld.classList.remove("cutsCurrent");
        cutOld.style.borderStyle="outset";
        cutOld.style.backgroundColor="#ddd";
        cutOld.style.color="#888";
        main.querySelector('.'+cutOld.classList[0].substr(3)).style.display = "none";
    }
    cutNew.classList.add("cutsCurrent");
    cutNew.style.borderStyle="inset";
    cutNew.style.backgroundColor="#fed";
    cutNew.style.color="#008";
    var secClass=cutNew.classList[0].substr(3);
    var sec = main.querySelector('.' + secClass);
    sec.style.display="block";
    var aCard = main.parentNode;
    var id = aCard.id.substr(5)-0;
    if (secClass=='anal' && sec.dataset.curlist == 0) {
        var query = 'action=getArticlesAnalog&idSession=' + document.idSession + '&ID='+ id;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', document.apiurl + 'index.php?' + query + '&count=1', true);
        xhr.dataObject = id;
        xhr.dataProcessingFunction = analogCount;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 0;
        xhr.send();
    } else if (secClass=='auto' && sec.dataset.curlist == 0) {
        var query = 'action=getCarsArticle&idSession=' + document.idSession + '&ArticleID='+ id;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', document.apiurl + 'index.php?' + query + '&count=1', true);
        xhr.dataObject = id;
        xhr.dataProcessingFunction = autoCount;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 0;
        xhr.send();
    }
    //}
    return false;
}

function analogCount(res) {
    var id = res.dataObject;
    var aCard = document.getElementById('aCard' + id);
    var anal = aCard.querySelector('.anal');
    var limit = Math.floor((anal.clientHeight - 70) / 33);
    var dataset = anal.dataset;
    dataset.id = id;
    dataset.limit = limit;
    dataset.limitnew = limit;
    dataset.count = res.count;
    dataset.countlist = Math.ceil(res.count / limit);
    dataset.curlist = 1;
    var buttons = anal.querySelectorAll('button');
    buttons[0].onclick = function (e) {
        if (dataset.curlist > 1) {
            anal.dataset.curlist--;
            anal.querySelector('input').value = dataset.curlist;
            analogRead(dataset);
        }
    };

    buttons[1].onclick = function (e) {
        if (dataset.curlist < (dataset.countlist - 0)) {
            dataset.curlist++;
            anal.querySelector('input').value = dataset.curlist;
            analogRead(dataset);
        }
    };

    anal.querySelector('form').onsubmit = function (e) {
        var value = anal.querySelector('input').value - 0;
        if ((value >= 1) && (value <= dataset.countlist)) {
            dataset.curlist = value;
        } else {
            anal.querySelector('input').value = dataset.curlist;
            return false;
        }
        analogRead(dataset);
        return false;
    };

    anal.querySelector('table').onmousewheel = function (e) {
        var buttons = anal.querySelectorAll('button');
        if (e.wheelDelta > 0) buttons[0].onclick(e);
        else  buttons[1].onclick(e);
    }
    analogRead(dataset);

}

function analogRead(dataset) {
    if (dataset.limit != dataset.limitnew) {
        dataset.curlist = Math.floor(dataset.limit*(dataset.curlist-1)/dataset.limitnew)+1;
        dataset.limit = dataset.limitnew;
        dataset.countlist = Math.ceil(dataset.count/dataset.limit);
    }
    var query = 'action=getArticlesAnalog&idSession=' + document.idSession + '&ID='+ dataset.id +
        '&limit='+dataset.limit + '&offset=' + dataset.limit*(dataset.curlist-1) +
        '&order=ManufacturerDescription,SearchCode';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + query, true);
    xhr.dataObject = dataset.id;
    xhr.dataProcessingFunction = analogWrite;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

function analogWrite(res) {
    aCard = document.getElementById('aCard' + res.dataObject);
    analog = aCard.querySelector('.anal');
    dataset = analog.dataset;
    analog.firstElementChild.querySelector('input').value = dataset.curlist;
    analog.firstElementChild.querySelector('span').textContent = dataset.countlist;
    data = res.data;

    text='';
    for (var i=0; i<data.length; i++) {
        row=data[i];
        text += '<tr class="' + (row.TypeCode == 3 ? 'orig' : 'cros')+'" id ="at' + row.ID +
            '"><td class="tp1">' + row.ManufacturerDescription +
            '</td><td class="tp2">' + row.DataSupplierArticleNumber +
            '</td><td class="tp3">' + (row.FileImage  ? '<img src="' + row.FileIconFull + '">':'') +
            '</td></tr>\n';
    }
    var table = analog.querySelector('table');
    table.removeChild(table.lastElementChild);
    tbody = document.createElement('tbody');
    tbody.innerHTML = text;
    table.appendChild(tbody);
    tbody.onclick = onclickArticle;
}

function autoCount(res) {
    var id = res.dataObject;
    var aCard = document.getElementById('aCard' + id);
    var auto = aCard.querySelector('.auto');
    var limit = Math.floor((auto.clientHeight - 60) / 23);
    var dataset = auto.dataset;
    dataset.id = id;
    dataset.limit = limit;
    dataset.limitnew = limit;
    dataset.count = res.count;
    dataset.countlist = Math.ceil(res.count / limit);
    dataset.curlist = 1;
    var buttons = auto.querySelectorAll('button');
    buttons[0].onclick = function (e) {
        if (dataset.curlist > 1) {
            auto.dataset.curlist--;
            auto.querySelector('input').value = dataset.curlist;
            autoRead(dataset);
        }
    };

    buttons[1].onclick = function (e) {
        if (dataset.curlist < (dataset.countlist - 0)) {
            dataset.curlist++;
            auto.querySelector('input').value = dataset.curlist;
            autoRead(dataset);
        }
    };

    auto.querySelector('form').onsubmit = function (e) {
        var value = auto.querySelector('input').value - 0;
        if ((value >= 1) && (value <= dataset.countlist)) {
            dataset.curlist = value;
        } else {
            auto.querySelector('input').value = dataset.curlist;
            return false;
        }
        autoRead(dataset);
        return false;
    };

    auto.querySelector('table').onmousewheel = function (e) {
        var buttons = auto.querySelectorAll('button');
        if (e.wheelDelta > 0) buttons[0].onclick(e);
        else  buttons[1].onclick(e);
    }
    autoRead(dataset);
}

function autoRead(dataset) {
    if (dataset.limit != dataset.limitnew) {
        dataset.curlist = Math.floor(dataset.limit*(dataset.curlist-1)/dataset.limitnew)+1;
        dataset.limit = dataset.limitnew;
        dataset.countlist = Math.ceil(dataset.count/dataset.limit);
    }
    var query = 'action=getCarsArticle&idSession=' + document.idSession + '&ArticleID='+ dataset.id +
        '&limit='+dataset.limit + '&offset=' + dataset.limit*(dataset.curlist-1);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', document.apiurl + 'index.php?' + query, true);
    xhr.dataObject = dataset.id;
    xhr.dataProcessingFunction = autoWrite;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

function autoWrite(res) {
    aCard = document.getElementById('aCard' + res.dataObject);
    auto = aCard.querySelector('.auto');
    dataset = auto.dataset;
    auto.firstElementChild.querySelector('input').value = dataset.curlist;
    auto.firstElementChild.querySelector('span').textContent = dataset.countlist;
    data = res.data;

    text='';
    for (var i=0; i<data.length; i++) {
        row=data[i];
        var period = row.ConstructionIntervalFrom.substr(4,2) + '.' +
            row.ConstructionIntervalFrom.substr(0,4);
        if (row.ConstructionIntervalTo != '0') period += '-' +
            row.ConstructionIntervalTo.substr(4,2) + '.' +
            row.ConstructionIntervalTo.substr(0,4);
        text += '<tr id ="car' + row.ID + '"><td title="' + row.FullDescription +'">' + row.FullDescription + '</td><td>' +
            period + '</td><td>' + row.Ccm + '</td><td title="'+ row.KvBody +'">' + row.KvBody + '</td></tr>\n';
    }
    var table = auto.querySelector('table');
    table.removeChild(table.lastElementChild);
    tbody = document.createElement('tbody');
    tbody.innerHTML = text;
    table.appendChild(tbody);
    /*tbody.onclick = onclickArticle;*/
}
// Изменение размера формы
function resizeForm() {

    var sectionHeight = window.innerHeight - document.querySelector('.cuts').offsetTop- document.querySelector('.cuts').offsetHeight-45;
    sNumbSec.style.height = sectionHeight + 'px';
    sAutoSec.style.height = sectionHeight + 'px';
    //sSuppSec.style.height = sectionHeight + 'px';
    //pListSec.style.height = sectionHeight + 'px';
    sNumbOver.style.height = (sectionHeight-100) + 'px';
    sAutoTree.style.height = (sectionHeight-50) + 'px';
    sAutoResize.style.height = (sectionHeight-50) + 'px';
    document.getElementById('sAutoProdDiv').style.height = sectionHeight - 120;
    sAutoProd.style.height = (sectionHeight-50) + 'px';
    sAutoProd.dataset.limitnew = Math.floor((sectionHeight - 150)/40);
    if (sAutoProd.dataset.id != 0) treeProductReadData();

    //var scrollSectionHeight = (window.innerHeight-265)+'px';
    //var tr;

    //sAutoData.style.height = (sectionHeight-70) + 'px';
}

function initialValues() {
    /*
     window.onresize = function (e) {
     resizeForm();
     }*/
    /* --- Заверщение сеанса --- */
    window.onunload = function () {
        if (document.idSession) {
            var query = 'action=sessionClose&idSession=' + document.idSession;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', document.apiurl + 'index.php?' + query, false);
            xhr.send();
        }
    }
    document.apiurl = 'https://neshataev.ru/api/';
    /* --- управление вкладками --- */
    var cuts = document.querySelector(".cuts");
    cuts.onclick = onclickShortcut;
    var cutNew = cuts.getElementsByClassName('cutCurrent')[0];
    cutNew.style.borderStyle = "inset";
    cutNew.style.backgroundColor = "#fed";
    cutNew.style.color = "#008";
    document.querySelector("." + cutNew.id.substr(0, 5) + 'Sec').style.display = "block";

    /* --- поиск по номеру */
    var sNumbForm = document.getElementById('sNumbForm');
    var sNumbs = sNumbForm.querySelectorAll('label');
    sNumbs[0].style.borderStyle = "inset";
    sNumbs[0].style.backgroundColor = "#fed";
    sNumbs[0].style.color = "#008";
    sNumbs[0].onclick = onclickShortcut;
    sNumbs[1].onclick = onclickShortcut;

    sNumbForm.onsubmit = onsubmitsNumbForm;
    sNumbTab.onclick = onclickArticle;
    /* --- поиск по авто --- */
    var searchAutoCar = document.getElementById('searchAutoCar');
    sAutoCar.dataObject = {
        carID: 0, carValue: "любая", modelID: 0, modelValue: "любая", brandID: 0, brandValue: "любая"
    };
    document.getElementById('autoSelect').onclick = function () {
        showIframe('autoSelect.html');
    }
    document.getElementById('autoClear').onclick = function () {
        sAutoCar.dataObject = {
            carID: 0, carValue: "любая", modelID: 0, modelValue: "любая", brandID: 0, brandValue: "любая"
        };
        sAutoCar.value = 'любой';
        carTreeRead();
    }
    // Создание и инициализация события автомобиль выбран: carSelected
    var event = document.createEvent('Event');
    event.initEvent('sessionOpen', false, true);
    document.eventSession = event;
    document.addEventListener('sessionOpen', carTreeRead);
    var event = document.createEvent('Event');
    event.initEvent('carSelected', false, true);
    document.eventCarSelected = event;
    document.addEventListener('carSelected', carTreeRead);
    window.onload = function () {
        //openSession();
        document.idSession='s_Cross';
        if (document.eventSession) document.dispatchEvent(document.eventSession);
    };

    document.getElementById('sAutoTree').onclick = treeProductRead;

    document.getElementById('tpUpList').onclick = function (e) {
        if (sAutoProd.dataset.curlist > 1) {
            sAutoProd.dataset.curlist--;
            document.getElementById('tpCurList').value = sAutoProd.dataset.curlist;
            treeProductReadData();
        }
    };
    document.getElementById('tpDownList').onclick = function (e) {
        if (sAutoProd.dataset.curlist < (sAutoProd.dataset.countlist - 0)) {
            sAutoProd.dataset.curlist++;
            document.getElementById('tpCurList').value = sAutoProd.dataset.curlist;
            treeProductReadData();
        }
    };
    document.getElementById('tpFormList').onsubmit = function (e) {
        var value = document.getElementById('tpCurList').value - 0;
        if ((value >= 1) && (value <= sAutoProd.dataset.countlist)) {
            sAutoProd.dataset.curlist = value;
        } else {
            document.getElementById('tpCurList').value = sAutoProd.dataset.curlist;
            return false;
        }
        treeProductReadData();
        return false;
    };
    document.getElementById('sAutoProdTab').onmousewheel = function (e) {
        if (e.wheelDelta > 0) document.getElementById('tpUpList').onclick(e);
        else  document.getElementById('tpDownList').onclick(e);
    }
    window.onresize = resizeForm;
    resizeForm();

}

initialValues();
var sNumbTabAlign = headerTab(sNumbTabHead, sNumbTab);