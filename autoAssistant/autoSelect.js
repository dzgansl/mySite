/**
 * Created by НСЛ on 24.02.2018.
 */
// определение объектов и внешних переменных
var maindocument, idSession, dataObject;
var cuts = document.getElementById('cuts');
var sMod = document.getElementById('sMod');
var sModSectionBrand = document.getElementById('sModSectionBrand');
var sModSectionModel = document.getElementById('sModSectionModel');
var sModSectionCar = document.getElementById('sModSectionCar');
var sModBrand = document.getElementById('sModBrand');
var sModBrandButton = document.getElementById('sModBrandButton');
var sModModel = document.getElementById('sModModel');
var sModModelButton = document.getElementById('sModModelButton');
var sModCar = document.getElementById('sModCar');
var sModCarButton = document.getElementById('sModCarButton');
var sModOverBrand = document.getElementById('sModOverBrand');
var sModOverModel = document.getElementById('sModOverModel');
var sModOverCar = document.getElementById('sModOverCar');

var sEng = document.getElementById('sEng');
var sEngCode = document.getElementById('sEngCode');
var sEngButton = document.getElementById('sEngButton');
var sEngCar = document.getElementById('sEngCar');
var sEngCarButton = document.getElementById('sEngCarButton');
var sEngSectionEng  = document.getElementById('sEngSectionEng');
var sEngSectionCar  = document.getElementById('sEngSectionCar');
var sEngOverEng = document.getElementById('sEngOverEng');
var sEngOverCar = document.getElementById('sEngOverCar');

var sVin = document.getElementById('sVin');
var sVinCode = document.getElementById('sVinCode');
var sVinButton = document.getElementById('sVinButton');
var sVinCar = document.getElementById('sVinCar');
var sVinCarButton = document.getElementById('sVinCarButton');
var sVinSectionCar  = document.getElementById('sVinSectionCar');
var sVinOverCar = document.getElementById('sVinOverCar');

function onclickcut(e) {
    var cutNew=e.target.closest('label');
    if (!cutNew) return false;
    var cutOld=cutNew.parentElement.getElementsByClassName('cutsCurrent')[0];
    if (cutOld == cutNew) return false;

    if (cutOld) {
        /* восстанавливаем состояник - вкладка отключена */
        cutOld.classList.remove("cutsCurrent");
        cutOld.style.borderStyle="outset";
        cutOld.style.backgroundColor="#ddd";
        cutOld.style.color="#888";
        if (cutOld.id) {
            document.getElementById("s" + cutOld.id.substr(3)).style.display = "none";
        }
    }
    cutNew.classList.add("cutsCurrent");
    cutNew.style.borderStyle="inset";
    cutNew.style.backgroundColor="#fed";
    cutNew.style.color="#008";
    if (cutNew.id) {
        document.getElementById("s"+cutNew.id.substr(3)).style.display="block";
    }
    return false;
}

// Изменение размера формы
function resizeform() {
    var main = document.querySelector('main');
    var scrollSectionHeight = (main.scrollHeight - 260) + 'px';
    var tr;
    sModOverBrand.style.height = scrollSectionHeight;
    sModOverModel.style.height = scrollSectionHeight;
    sModOverCar.style.height = scrollSectionHeight;
    sEngOverEng.style.height = scrollSectionHeight;
    sEngOverCar.style.height = scrollSectionHeight;
    sVinOverCar.style.height = scrollSectionHeight;
    /*if (sModSectionBrand.style.display != 'none') {
        tr = document.getElementById('sModTabBrand').querySelector('tr');
        if (tr) setColumnWidth(sModSectionBrand.querySelectorAll('th'), tr.querySelectorAll('td'));
    } else if (sModSectionModel.style.display != 'none') {
        tr = document.getElementById('sModTabModel').querySelector('tr');
        if (tr) setColumnWidth(sModSectionModel.querySelectorAll('th'), tr.querySelectorAll('td'));
    } else*/
    /*if (sModSectionCar.style.display != 'none') {
        tr = document.getElementById('sModTabCar').querySelector('tr');
        if (tr) setColumnWidth(sModSectionCar.querySelectorAll('th'), tr.querySelectorAll('td'));
    } else if (sEngSectionEng.style.display != 'none') {
        tr = document.getElementById('sEngTabEng').querySelector('tr');
        if (tr) setColumnWidth(sEngSectionEng.querySelectorAll('th'), tr.querySelectorAll('td'));
    } else if (sEngSectionCar.style.display != 'none') {
        tr = document.getElementById('sEngTabCar').querySelector('tr');
        if (tr) setColumnWidth(sEngSectionCar.querySelectorAll('th'), tr.querySelectorAll('td'));
    } else if (sVinSectionCar.style.display != 'none') {
        tr = document.getElementById('sVinTabCar').querySelector('tr');
        if (tr) setColumnWidth(sVinSectionCar.querySelectorAll('th'), tr.querySelectorAll('td'));
    }*/
}

// Закрыть форму
document.getElementById('identExit').onclick = function () {
    el=maindocument.getElementById('iframe-modal')
    el.parentNode.removeChild(el);
}

// Деактивация нажатия клавиш и отображения таблиц
function deactivateAll() {
    sModSectionBrand.style.display = 'none';
    sModSectionModel.style.display = 'none';
    sModSectionCar.style.display = 'none';
    sEngSectionEng.style.display = 'none';
    sEngSectionCar.style.display = 'none';
    sVinSectionCar.style.display = 'none';
    sModBrandButton.style.borderStyle = 'outset';
    sModModelButton.style.borderStyle = sModBrand.ID ? 'outset' : 'none';
    sModCarButton.style.borderStyle = sModModel.ID ? 'outset' : 'none';
    sEngButton.style.borderStyle = sModBrand.ID ? 'outset' : 'none';
    sEngCarButton.style.borderStyle = document.getElementById('sEngTabBodyCar') ? 'outset' : 'none';
    sVinCarButton.style.borderStyle = document.getElementById('sVinTabBodyCar') ? 'outset' : 'none';
}
// Запрос марки:
// Вывод таблицы марок
function sModTableBrandWrite(res) {
    var sTabBodyBrand = document.getElementById('sModTabBodyBrand');
    // очищаем таблицу
    if (sTabBodyBrand) sTabBodyBrand.parentNode.removeChild(sTabBodyBrand);
    sTabBodyBrand = document.createElement('tbody');
    sTabBodyBrand.id = 'sModTabBodyBrand';
    var text = '';
    var abcindex = '';
    var tsim = ' ';
    var sim, col1;
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        sim=row['Description'].substr(0,1);
        if (sim != tsim) {
            tsim = sim;
            abcindex += '&nbsp<a href="#b1_'+sim+'">'+sim+"</a>"
            col1='<a id="b1_'+sim+'">'+sim+'</a>'
        } else {
            col1 = '';
        }
        text += '<tr id="brand'+row['ID']+'"><td class="b1">'+col1+'</td><td class="b2">' + row['Description'] + '</td></tr>';
    }
    var sTabBrand = document.getElementById('sModTabBrand');

    sTabBodyBrand.innerHTML = text;
    document.getElementById('sModHeadBrand').innerHTML = 'Марка: ' + abcindex;
    sTabBrand.appendChild(sTabBodyBrand);
    if (sModBrand.ID) {
        if (document.getElementById('brand'+sModBrand.ID)) {
            document.getElementById('brand' + sModBrand.ID).style.backgroundColor='#ccffff';
            document.getElementById('brand' + sModBrand.ID).scrollIntoView(true);
        }
    }
    deactivateAll();
    sModSectionBrand.style.display='block';
    sModBrandButton.style.borderStyle = 'inset';
    //sModBrandAlign();
}
function sModTableModelWrite(res) {
    var sModTabBodyModel = document.getElementById('sModTabBodyModel');
    // очищаем таблицу
    if (sModTabBodyModel) sModTabBodyModel.parentNode.removeChild(sModTabBodyModel);
    sModTabBodyModel = document.createElement('tbody');
    sModTabBodyModel.id = 'sModTabBodyModel';
    var text = '';
    var abcindex = '';
    var tsim = ' ';
    var sim, col1;
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        sim=row['Description'].substr(0,1);
        if (sim != tsim) {
            tsim = sim;
            abcindex += '&nbsp<a href="#m1_'+sim+'">'+sim+"</a>"
            col1='<a id="m1_'+sim+'">'+sim+'</a>'
        } else {
            col1 = '';
        }
        var period=row['ConstructionIntervalFrom'].substr(4,2)+'.'+row['ConstructionIntervalFrom'].substr(0,4);
        if (row['ConstructionIntervalTo'] != '0') {
            period += ' - ' + row['ConstructionIntervalTo'].substr(4, 2)+'.'+row['ConstructionIntervalTo'].substr(0, 4);
        }
        text += '<tr id="model'+row['ID']+'"><td class="m1">' + col1 +
            '</td><td class="m2">' + row['Description'] +
            '</td><td class="m3">' + period + '</td></tr>';
    }
    var sTabModel = document.getElementById('sModTabModel');

    sModTabBodyModel.innerHTML = text;
    document.getElementById('sModHeadModel').innerHTML = 'Модели ' + sModBrand.value +': ' + abcindex;
    sTabModel.appendChild(sModTabBodyModel);
    if (sModModel.ID) {
        if (document.getElementById('model'+sModModel.ID)) {
            document.getElementById('model'+sModModel.ID).style.backgroundColor='#ccffff';
            document.getElementById('model'+sModModel.ID).scrollIntoView(true);
        }
    }
    deactivateAll();
    sModSectionModel.style.display='block';
    sModModelButton.style.borderStyle = 'inset';
    //sModModelAlign();
}
function sModTableCarWrite(res) {
    var sModTabBodyCar = document.getElementById('sModTabBodyCar');
    // очищаем таблицу
    if (sModTabBodyCar) sModTabBodyCar.parentNode.removeChild(sModTabBodyCar);
    sModTabBodyCar = document.createElement('tbody');
    sModTabBodyCar.id = 'sModTabBodyCar';
    var text = '';
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        var period=row['ConstructionIntervalFrom'].substr(4,2)+'.'+row['ConstructionIntervalFrom'].substr(0,4);
        if (row['ConstructionIntervalTo'] != '0') {
            period += ' - ' + row['ConstructionIntervalTo'].substr(4, 2)+'.'+row['ConstructionIntervalTo'].substr(0, 4);
        }
        text += '<tr id="car'+row['ID']+'"><td class="c1">' + row['FullDescription'] +
            '</td><td class="c2">' + row['KvBody'] +' '+ row['Ccm'] + ' ' + row['KvFuel'] +
            '</td><td class="c3">' + period + '</td></tr>';
            //'</td><td class="c2">' + row['KvBody'] +'</td><td class="c3">' + row['Ccm'] +
            //'</td><td class="c4">' + row['KvFuel'] +'</td><td class="c5">' + period + '</td></tr>';
    }
    var sTabCar = document.getElementById('sModTabCar');

    sModTabBodyCar.innerHTML = text;
    document.getElementById('sModHeadCar').innerHTML = 'Комплектации модели ' + sModBrand.value +' ' + sModModel.value;
    sTabCar.appendChild(sModTabBodyCar);
    if (sModCar.ID) {
        if (document.getElementById('car'+sModCar.ID)) {
            document.getElementById('car' + sModCar.ID).style.backgroundColor='#ccffff';
            document.getElementById('car' + sModCar.ID).scrollIntoView(true);
        }
    }
    deactivateAll();
    sModCarButton.style.borderStyle='inset';
    sModSectionCar.style.display='block';
    //sModCarAlign();
    /*var tr = document.getElementById('sModTabCar').querySelector('tr');
    if (tr) setColumnWidth(sModSectionCar.querySelectorAll('th'), tr.querySelectorAll('td'));*/

}
function sEngTableEngWrite(res) {
    var sEngTabBodyEng = document.getElementById('sEngTabBodyEng');
    // очищаем таблицу
    if (sEngTabBodyEng) sEngTabBodyEng.parentNode.removeChild(sEngTabBodyEng);
    sEngTabBodyEng = document.createElement('tbody');
    sEngTabBodyEng.id = 'sEngTabBodyEng';
    var text = '';
    var abcindex = '';
    var tsim = ' ';
    var sim, col1;
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        sim=row['Code'].substr(0,1);
        if (sim != tsim) {
            tsim = sim;
            abcindex += '&nbsp<a href="#m1_'+sim+'">'+sim+"</a>"
            col1='<a id="m1_'+sim+'">'+sim+'</a>'
        } else {
            col1 = '';
        }
        var period=''
        if (row['ConstructionIntervalFrom'] != '0') {
            period = row['ConstructionIntervalFrom'].substr(4,2) + '.' + row['ConstructionIntervalFrom'].substr(0,4);
            if (row['ConstructionIntervalTo'] != '0')
            period += ' - ' + row['ConstructionIntervalTo'].substr(4, 2)+'.'+row['ConstructionIntervalTo'].substr(0, 4);
        }
        text += '<tr id="eng'+row['ID']+'"><td class="e1">' + col1 + '</td><td class="e2">' + row['Code'] +
            '</td><td class="e3">' + row['CcmFrom'] + '</td><td class="e4">' + row['KvEngine'].substr(0,6) +'</td><td class="e5">' + period + '</td></tr>';
    }
    var sTabEng = document.getElementById('sEngTabEng');

    sEngTabBodyEng.innerHTML = text;
    document.getElementById('sEngHeadEng').innerHTML = 'Двигатели марки ' + sModBrand.value + ': ' + abcindex;
    sTabEng.appendChild(sEngTabBodyEng);
    if (sEngCode.ID) {
        if (document.getElementById('eng'+sEngCode.ID)) {
            document.getElementById('eng' + sEngCode.ID).style.backgroundColor='#ccffff';
            document.getElementById('eng' + sEngCode.ID).scrollIntoView(true);
        }
    }
    deactivateAll();
    sEngButton.style.borderStyle='inset';
    sEngSectionEng.style.display='block';
    //sEngEngAlign();
    /*var tr = document.getElementById('sEngTabEng').querySelector('tr');
    if (tr) setColumnWidth(sEngSectionEng.querySelectorAll('th'), tr.querySelectorAll('td'));*/
}
function sEngTableCarWrite(res) {
    var sEngTabBodyCar = document.getElementById('sEngTabBodyCar');
    // очищаем таблицу
    if (sEngTabBodyCar) sEngTabBodyCar.parentNode.removeChild(sEngTabBodyCar);
    sEngTabBodyCar = document.createElement('tbody');
    sEngTabBodyCar.id = 'sEngTabBodyCar';
    var text = '';
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        var period=row['ConstructionIntervalFrom'].substr(4,2)+'.'+row['ConstructionIntervalFrom'].substr(0,4);
        if (row['ConstructionIntervalTo'] != '0') {
            period += ' - ' + row['ConstructionIntervalTo'].substr(4, 2)+'.'+row['ConstructionIntervalTo'].substr(0, 4);
        }
        text += '<tr id="engcar'+row['ID']+'" data-brand="' + row['ManufacturerDescription'] +
            '" data-brandid="' + row['ManufacturerID'] + '" data-model="' + row['ModelDescription'] +
            '" data-modelid="' + row['ModelID'] + '"><td class="c1">' + row['FullDescription'] +
            '</td><td class="c2">' + row['KvBody'] +' '+ row['Ccm'] + ' ' + row['KvFuel'] +
            '</td><td class="c3">' + period + '</td></tr>';

            //'</td><td class="c2">' + row['KvBody'] +'</td><td class="c3">' + row['Ccm'] +
            //'</td><td class="c4">' + row['KvFuel'] +'</td><td class="c5">' + period + '</td></tr>';
    }
    var sTabCar = document.getElementById('sEngTabCar');

    sEngTabBodyCar.innerHTML = text;
    document.getElementById('sEngHeadCar').innerHTML = 'Комплектации c кодом двигателя ' + sModBrand.value +' ' + sEngCode.value;
    sTabCar.appendChild(sEngTabBodyCar);
    if (sEngCar.ID) {
        if (document.getElementById('car'+sEngCar.ID)) {
            document.getElementById('car' + sEngCar.ID).style.backgroundColor='#ccffff';
            document.getElementById('car' + sEngCar.ID).scrollIntoView(true);
        }
    }
    deactivateAll();
    sEngCarButton.style.borderStyle='inset';
    sEngSectionCar.style.display='block';
    //sEngCarAlign();
    /*var tr = document.getElementById('sEngTabCar').querySelector('tr');
    if (tr) setColumnWidth(sEngSectionCar.querySelectorAll('th'), tr.querySelectorAll('td'));*/
}
function sVinTableCarWrite(res) {
    if (res.data.length == 0) {
        showMessage('Извините, по VIN-номеру: '+sVinCode.value+' данные отсутствуют');
        return;
    }
    var sVinTabBodyCar = document.getElementById('sVinTabBodyCar');
    // очищаем таблицу
    if (sVinTabBodyCar) sVinTabBodyCar.parentNode.removeChild(sVinTabBodyCar);
    sVinTabBodyCar = document.createElement('tbody');
    sVinTabBodyCar.id = 'sVinTabBodyCar';
    var text = '';
    for (var i=0; i<res.data.length; i++) {
        row=res.data[i];
        if (sModBrand.ID && sModBrand.ID != row['ManufacturerID']) continue;
        var period=row['ConstructionIntervalFrom'].substr(4,2)+'.'+row['ConstructionIntervalFrom'].substr(0,4);
        if (row['ConstructionIntervalTo'] != '0') {
            period += ' - ' + row['ConstructionIntervalTo'].substr(4, 2)+'.'+row['ConstructionIntervalTo'].substr(0, 4);
        }
        text += '<tr id="Vincar'+row['ID']+'" data-brand="' + row['ManufacturerDescription'] +
            '" data-brandid="' + row['ManufacturerID'] + '" data-model="' + row['ModelDescription'] +
            '" data-modelid="' + row['ModelID'] + '"><td class="c1">' + row['FullDescription'] +
            '</td><td class="c2">' + row['KvBody'] +' '+ row['Ccm'] + ' ' + row['KvFuel'] +
            '</td><td class="c3">' + period + '</td></tr>';

            //'</td><td class="c2">' + row['KvBody'] +'</td><td class="c3">' + row['Ccm'] +
            //'</td><td class="c4">' + row['KvFuel'] +'</td><td class="c5">' + period + '</td></tr>';
    }
    var sTabCar = document.getElementById('sVinTabCar');

    sVinTabBodyCar.innerHTML = text;
    document.getElementById('sVinHeadCar').innerHTML = 'Комплектации c кодом двигателя ' + sModBrand.value +' ' + sVinCode.value;
    sTabCar.appendChild(sVinTabBodyCar);
    if (sVinCar.ID) {
        if (document.getElementById('car'+sVinCar.ID)) {
            document.getElementById('car' + sVinCar.ID).style.backgroundColor='#ccffff';
            document.getElementById('car' + sVinCar.ID).scrollIntoView(true);
        }
    }
    deactivateAll();
    sVinCarButton.style.borderStyle='inset';
    sVinSectionCar.style.display='block';
    //sVinCarAlign();
    /*var tr = document.getElementById('sVinTabCar').querySelector('tr');
    if (tr) setColumnWidth(sVinSectionCar.querySelectorAll('th'), tr.querySelectorAll('td'));*/
    
}

function sModTableBrandRead() {
    if (!document.getElementById('sModTabBodyBrand')) {
        //if (document.getElementById('sModTabBodyBrand').children.length === 0) {
        //querySelector('#sModTabBodyBrand>tr')) {
        var query = 'action=getManufacturers&idSession=' + idSession +
            '&TreeType=1&order=Description';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', maindocument.apiurl+'index.php?' + query, true);
        xhr.dataProcessingFunction = sModTableBrandWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 1000;
        xhr.send();
    } else {
        deactivateAll();
        sModSectionBrand.style.display='block';
        sModBrandButton.style.borderStyle = 'inset';
    }
}
function sModTableModelRead() {
    if (!document.getElementById('sModTabBodyModel')) {
        //querySelector('#sModTabBodyModel>tr')) {
        var query = 'action=getModelsManufacturer&idSession=' + idSession +
            '&ManufacturerID=' + sModBrand.ID +'&order=Description';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
        xhr.dataProcessingFunction = sModTableModelWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 1000;
        xhr.send();
    } else {
        deactivateAll();
        sModSectionModel.style.display='block';
        sModModelButton.style.borderStyle = 'inset';
    }
}
function sModTableCarRead() {
    //if (document.getElementById('sModTabBodyCar').children.length === 0 && sModModel.ID) {
    if (!document.getElementById('sModTabBodyCar') && sModModel.ID) { //querySelector('#sModTabBodyCar>tr') &&
        var query = 'action=getCarsModel&idSession=' + idSession +
        '&ModelID=' + sModModel.ID +'&order=FullDescription';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
        xhr.dataProcessingFunction = sModTableCarWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 1000;
        xhr.send();
    } else {
        deactivateAll();
        sModSectionCar.style.display='block';
        sModCarButton.style.borderStyle='inset';
    }
}
function sEngTableEngRead() {
    //if (document.getElementById('sEngTabBodyEng').children.length === 0) {
    if (!document.getElementById('sEngTabBodyEng')) {
        var query = 'action=getEnginesManufacturer&idSession=' + idSession +
            '&ManufacturerID=' + sModBrand.ID +'&order=Code';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
        xhr.dataProcessingFunction = sEngTableEngWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 1000;
        xhr.send();
    } else {
        deactivateAll();
        sEngSectionEng.style.display='block';
        sEngButton.style.borderStyle='inset';
    }
}
function sEngTableCarRead() {
    //if (document.getElementById('sEngTabBodyCar').children.length === 0) {
    if (!document.getElementById('sEngTabBodyCar')) {
        var query = 'action=getCarsEngine&idSession=' + idSession +
            '&ManufacturerID=' + sModBrand.ID +'&Code='+sEngCode.value;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
        xhr.dataProcessingFunction = sEngTableCarWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 1000;
        xhr.send();
    } else {
        deactivateAll();
        sEngSectionCar.style.display='block';
        sEngCarButton.style.borderStyle='inset';
    }
}
function sVinTableCarRead() {
    //if (document.getElementById('sVinTabBodyCar').children.length === 0) {
    if (!document.getElementById('sVinTabBodyCar')) {
        var query = 'action=vinDecode&idSession=' + idSession +
            '&vin=' + sVinCode.value + '&type=2';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
        xhr.dataProcessingFunction = sVinTableCarWrite;
        xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
        xhr.timeout = 0;
        xhr.send();
    } else {
        deactivateAll();
        sEngSectionCar.style.display='block';
        sEngCarButton.style.borderStyle='inset';
    }
}

sModBrandButton.onclick = function (e) {
    // Если нажатая кнопка - текущая - выход
    if (sModSectionBrand.style.display != 'none') {
        sModSectionBrand.style.display = 'none';
        sModBrandButton.style.borderStyle = 'outset';
    } else {
        sModTableBrandRead();
    }
    e.preventDefault();
    return false;
}
sModModelButton.onclick = function (e) {
    if (sModSectionModel.style.display != 'none') {
        sModSectionModel.style.display = 'none';
        sModSectionModel.style.borderStyle = 'outset';
        return;
    }
    sModTableModelRead();
    e.preventDefault();
    return false;
}
sModCarButton.onclick = function (e) {
    if (sModSectionCar.style.display != 'none') {
        sModSectionCar.style.display = 'none';
        sModSectionCar.style.borderStyle = 'outset';
        return;
    }
    sModTableCarRead();
    e.preventDefault();
    return false;
}
sEngButton.onclick = function (e) {
    if (sEngSectionEng.style.display != 'none') {
        sEngSectionEng.style.display = 'none';
        sEngSectionEng.style.borderStyle = 'outset';
    } else {
        sEngTableEngRead();
    }
    e.preventDefault();
    return false;
}
sEngCarButton.onclick = function (e) {
    if (sEngSectionCar.style.display != 'none') {
        sEngSectionCar.style.display = 'none';
        sEngSectionCar.style.borderStyle = 'outset';
    } else {
        sEngTableCarRead();
    }
    e.preventDefault();
    return false;
}
sVinCode.onchange = sVinButton.onclick = function (e) {
    if (sVinCode.value.length == 17) {
        sVinTabBodyCar=document.getElementById('sVinTabBodyCar');
        if (sVinTabBodyCar) sVinTabBodyCar.parentNode.removeChild(sVinTabBodyCar);
        sVinTableCarRead();
    } else if (sVinCode.value.length != 0) {
        showMessage('VIN номер должен содержать 17 символов');
    }
    e.preventDefault();
    return false;
}

sModOverBrand.onclick = function (e) {
    var tr = e.target.closest('tr');
    if (!tr) return;
    // Сравнить тот же выбран, если да - переключаем изображение блока
    var newid=+tr.id.substr(5);
    if (newid != sModBrand.ID) {
        // убираем фон выбранной модели с предыдущего выбора
        if (sModBrand.ID && document.getElementById('brand'+sModBrand.ID)) {
            document.getElementById('brand' + sModBrand.ID).style.backgroundColor='#dddddd';
        }
        // Устанавливаем новые значения
        sModBrand.ID = newid;
        sModBrand.value = tr.querySelector('.b2').textContent;
        document.getElementById('brand' + newid).style.backgroundColor='#ccffffff';
        // Деактивируем секцию отображения марок
        sModSectionBrand.style.display = 'none';
        // Очищаем таблицу моделей
        var sModTabBodyModel = document.getElementById('sModTabBodyModel');
        if (sModTabBodyModel) {
            sModTabBodyModel.parentNode.removeChild(sModTabBodyModel);
        }
        if (sModModel.ID) {
            sModModel.ID = 0;
            sModModel.value = 'любая';
        }
        //sModTabBodyModel = document.createElement('tbody');
        //sModTabBodyModel.id = 'sModTabBodyModel';
        // Очищаем таблицу двигателей
        var sEngTabBodyEng = document.getElementById('sEngTabBodyEng');
        if (sEngTabBodyEng) {
            sEngTabBodyEng.parentNode.removeChild(sEngTabBodyEng);
        }
        if (sEngCode.ID) {
            sEngCode.ID = 0;
            sEngCode.value = 'любая';
        }
        // Очищаем таблицы комплектаций.
        var sModTabBodyCar = document.getElementById('sModTabBodyCar');
        if (sModTabBodyCar) {
            sModTabBodyCar.parentNode.removeChild(sModTabBodyCar);
        }
        if (sModCar.ID) {
            /*if (document.getElementById('car'+sModCar.ID))
            document.getElementById('car' + sModCar.ID).style.backgroundColor='#ccffff';*/
            sModCar.ID = 0;
            sModCar.value = 'любая';
        }
        var sModTabBodyCar = document.getElementById('sModTabBodyCar');
        if (sModTabBodyCar) {
            sModTabBodyCar.parentNode.removeChild(sModTabBodyCar);
        }
        if (sModCar.ID) {
            sModCar.ID = 0;
            sModCar.value = 'любая';
        }
        var sEngTabBodyCar = document.getElementById('sEngTabBodyCar');
        if (sEngTabBodyCar) {
            sEngTabBodyCar.parentNode.removeChild(sEngTabBodyCar);
        }
        if (sEngCar.ID) {
            sEngCar.ID = 0;
            sEngCar.value = 'любая';
        }
        var sVinTabBodyCar = document.getElementById('sVinTabBodyCar');
        if (sVinTabBodyCar) {
            sVinTabBodyCar.parentNode.removeChild(sVinTabBodyCar);
        }
        if (sVinCar.ID) {
            sVinCar.ID = 0;
            sVinCar.value = 'любая';
        }

        // Деактивируем кнопки выбора комплектаций
        sModCarButton.disabled = true;
        sEngCarButton.disabled = true;
        sVinCarButton.disabled = true;
        // Активируем кнопку выбора моделей
        sModModelButton.disabled = false;
        // Активируем кнопку выбора двигателей
        sEngButton.disabled = false;
    }
    if (sMod.style.display != 'none') {
     // Читаем и отображаем модели данной марки
        sModTableModelRead();
    } else if (sEng.style.display != 'none') {
        // Читаем и отображаем модели данной марки
        sEngTableEngRead();
    }
}
sModOverModel.onclick = function (e) {
    var tr = e.target.closest('tr');
    if (!tr) return;
    // Сравнить тот же выбран, если да - переключаем изображение блока
    var newid=+tr.id.substr(5);
    if (newid != sModModel.ID) {
        // убираем фон выбранной модели с предыдущего выбора
        if (sModModel.ID && document.getElementById('model'+sModModel.ID)) {
            document.getElementById('model' + sModModel.ID).style.backgroundColor='#dddddd';
        }
        // Устанавливаем новые значения
        sModModel.ID = newid;
        sModModel.value = tr.querySelector('.m2').textContent;
        document.getElementById('model' + newid).style.backgroundColor='#ccffff';
        // Деактивируем секцию отображения моделей
        sModSectionModel.style.display='none';
        // Очищаем таблицу комплектаций
        var sModTabBodyCar = document.getElementById('sModTabBodyCar');
        if (sModTabBodyCar) sModTabBodyCar.parentNode.removeChild(sModTabBodyCar);
        sModCar.ID = 0;
        sModCar.value = 'любая';
        sModTabBodyCar = document.createElement('tbody');
        sModTabBodyCar.id = 'sModTabBodyCar';
        // Активируем кнопку выбора моделей
        sModCarButton.disabled = false;
    }
    // Читаем и отображаем модели данной марки
    sModTableCarRead();
}
sModOverCar.onclick = function (e) {
      var tr = e.target.closest('tr');
    if (!tr) return;
    // Сравнить тот же выбран, если да - переключаем изображение блока
    tr.firstElementChild.textContent;
    if (maindocument) {

        maindocument.getElementById('sAutoCar').value=tr.firstElementChild.innerText +' '+
        tr.children[1].innerText+', '+tr.children[2].innerText;
    }
    dataObject.carValue=tr.firstElementChild.innerText;
    dataObject.carID=+tr.id.substr(3);
    dataObject.modelID=sModModel.ID;
    dataObject.modelValue=sModModel.value;
    dataObject.brandID=sModBrand.ID;
    dataObject.brandValue=sModBrand.value;
    var el= maindocument.getElementById('iframe-modal');
    el.parentNode.removeChild(el);
    maindocument.dispatchEvent(maindocument.eventCarSelected);
}
sEngOverEng.onclick = function (e) {
    var tr = e.target.closest('tr');
    if (!tr) return;
    // Сравнить тот же выбран, если да - переключаем изображение блока
    var newid=+tr.id.substr(3);
    if (newid != sEngCode.ID) {
        // убираем фон выбранной модели с предыдущего выбора
        if (sEngCode.ID && document.getElementById('eng'+sEngCode.ID)) {
            document.getElementById('eng' + sEngCode.ID).style.backgroundColor='#dddddd';
        }
        // Устанавливаем новые значения
        sEngCode.ID = newid;
        sEngCode.value = tr.querySelector('.e2').textContent;
        document.getElementById('eng' + newid).style.backgroundColor='#ccffff';
        // Деактивируем секцию отображения двигателей
        sEngSectionEng.style.display='none';
        // Очищаем таблицу комплектаций
        var sEngTabBodyCar = document.getElementById('sEngTabBodyCar');
        if (sEngTabBodyCar) sEngTabBodyCar.parentNode.removeChild(sEngTabBodyCar);
        sEngCar.ID = 0;
        sEngCar.value = 'любая';
        sEngTabBodyCar = document.createElement('tbody');
        sEngTabBodyCar.id = 'sEngTabBodyCar';
        // Активируем кнопку выбора моделей
        sEngCarButton.disabled = false;
    }
    // Читаем и отображаем комплектации
    sEngTableCarRead();
}
sEngOverCar.onclick = sVinOverCar.onclick = function (e) {
    var tr = e.target.closest('tr');
    if (!tr) return;
    // Сравнить тот же выбран, если да - переключаем изображение блока
    tr.firstElementChild.textContent;
    if (maindocument) {
        maindocument.getElementById('sAutoCar').value=tr.firstElementChild.innerText +' '+
            tr.children[1].innerText+', '+tr.children[2].innerText;
    }
    dataObject.carValue=tr.firstElementChild.innerText;
    dataObject.carID=+tr.id.substr(6);
    dataObject.modelID=+tr.dataset.modelid;
    dataObject.modelValue=tr.dataset.model;
    dataObject.brandID=tr.dataset.brandid;
    dataObject.brandValue=tr.dataset.brand;
    var el = maindocument.getElementById('iframe-modal');
    el.parentNode.removeChild(el);
    maindocument.dispatchEvent(maindocument.eventCarSelected);
}

// Определение начальных значений
function initialValues() {
    if (window.top == window) {
        maindocument = undefined;
        idSession = 0;
        dataObject = {
            carID: 0, carValue: "любая", modelID: 0, modelValue: "любая", brandID: 0, brandValue: "любая"
        }
    } else {
        maindocument = window.parent.document;
        idSession = maindocument.idSession;
        dataObject = maindocument.getElementById('sAutoCar').dataObject;
    }
    // начальное положение вкладок
    cuts.onclick = onclickcut;
    cuts.onmousedown = function () {return false;}
    var cutNew=cuts.getElementsByClassName('cutsCurrent')[0];
    cutNew.style.borderStyle="inset";
    cutNew.style.backgroundColor="#fed";
    cutNew.style.color="#008";
    document.getElementById("s"+cutNew.id.substr(3)).style.display="block";

    // начальные значения полей марка, модель, комплектация
    sModBrand.value = dataObject.brandValue;
    sModBrand.ID = dataObject.brandID;
    sModModelButton.disabled = sModBrand.ID == 0;
    sModModel.value = dataObject.modelValue;
    sModModel.ID = dataObject.modelID;
    sModCarButton.disabled = sModModel.ID == 0;
    sModCar.value = dataObject.carValue;
    sModCar.ID = dataObject.carID;
    sModSectionModel.style.display = 'none';
    sModSectionCar.style.display = 'none';

    sEng.style.display = 'none';
    sEngCode.value = 'любой';
    sEngCode.ID = 0;
    sEngButton.disabled = sModBrand.ID == 0;
    sEngCar.ID = dataObject.carID;
    sEngCar.value = dataObject.carValue;
    sEngCarButton.disabled = true;
    sEngSectionEng.style.display = 'none';
    sEngSectionCar.style.display = 'none'

    sVin.style.display = 'none';
    sVinCode.value = '';
    sVinCar.ID = dataObject.carID;
    sVinCar.value = dataObject.carValue;
    sVinCarButton.disabled = true;
    sVinSectionCar.style.display = 'none'
    window.onresize = function (e) {resizeform();}
    resizeform();
    sModTableBrandRead();
    /* --- Перемещение  окна --- */
    dragAnObject();
    document.onselectstart = function (e) {
        if (!document.selectstarton) return false;
        document.selectstarton=false;
    }
}

initialValues();
//var sModBrandAlign = headerTab(sModSectionBrand.querySelector('table'), document.getElementById('sModTabBrand'));
//var sModModelAlign = headerTab(sModSectionModel.querySelector('table'), document.getElementById('sModTabModel'));
//var sModCarAlign = headerTab(sModSectionCar.querySelector('table'), document.getElementById('sModTabCar'));
//var sEngEngAlign = headerTab(sEngSectionEng.querySelector('table'), document.getElementById('sEngTabEng'));
//var sEngCarAlign = headerTab(sEngSectionCar.querySelector('table'), document.getElementById('sEngTabCar'));
//var sVinCarAlign = headerTab(sVinSectionCar.querySelector('table'), document.getElementById('sVinTabCar'));