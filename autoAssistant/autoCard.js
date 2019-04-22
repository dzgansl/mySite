/**
 * Created by НСЛ on 01.04.2018.
 */
// определение объектов и внешних переменных
var maindocument, idSession, id;

// Управление вкладками
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
            document.getElementById(cutOld.id.substr(3)).style.display = "none";
        }
    }
    cutNew.classList.add("cutsCurrent");
    cutNew.style.borderStyle="inset";
    cutNew.style.backgroundColor="#fed";
    cutNew.style.color="#008";
    if (cutNew.id) {
        document.getElementById(cutNew.id.substr(3)).style.display="block";
    }
    return false;
}

function articleWrite(res) {
    var data = document.dataArticle;
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
    document.querySelector('#info tbody').innerHTML = text;
    if (data.FileImageFull) {
        var img = document.querySelector('#foto img');
        img.src = data.FileImageFull;
        document.querySelector('#foto span').textContent = data.CountImage;
        if (data.CountImage == 1) {
            var buts =document.querySelectorAll('#foto button');
            buts[0].style.display=buts[1].style.display='none';
        } else
            buts[0].onclick=buts[1].onclick=function () {

            }
    } else {
        document.getElementById('cutfoto').style.display='none';
    }
}

function articleRead(res) {
    // получение данных о запчасти и запрос данных о ее атрибутах
    document.dataArticle=res;
    // Чтение данных об атрибутах детали
    var query = 'action=getArticleAttributes&idSession=' + idSession + '&ID='+id;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
    xhr.dataProcessingFunction = articleWrite;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}

function resizeForm() {
    var sectionHeight = window.innerHeight - document.getElementById('cuts').offsetTop- document.getElementById('cuts').offsetHeight-15;
    document.getElementById('info').style.height = document.getElementById('foto').style.height =
        document.getElementById('anal').style.height = document.getElementById('auto').style.height =sectionHeight + 'px';
    document.querySelector('#foto img').height = sectionHeight - 40;
}

// Определение начальных значений
function initialValues() {
    if (idSession) return;
    var param = '&' + window.location.search.substr(1) + '&';
    var pos1 = param.indexOf('&id=')+4;
    id = (pos1 >= 4) ? param.substr(pos1,param.indexOf('&',pos1)-pos1) : '3007894';

    if (window.top == window) {
        maindocument = undefined;
        pos1 = param.indexOf('&session=')+9;
        idSession = (pos1 >= 9) ? param.substr(pos1,param.indexOf('&',pos1)-pos1) : 127;
    } else {
        maindocument = window.parent.document;
        idSession = maindocument.idSession;
    }
    // начальное положение вкладок
    cuts.onclick = onclickcut;
    cuts.onmousedown = function () {
        return false;
    }
    var cutNew = cuts.getElementsByClassName('cutsCurrent')[0];
    cutNew.style.borderStyle = "inset";
    cutNew.style.backgroundColor = "#fed";
    cutNew.style.color = "#008";
    document.getElementById(cutNew.id.substr(3)).style.display = "block";

    resizeForm();
    // Чтение данных о детали
    var query = 'action=getArticle&idSession=' + idSession + '&ID=' +id;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', maindocument.apiurl + 'index.php?' + query, true);
    xhr.dataProcessingFunction = articleRead;
    xhr.onerror = xhr.ontimeout = xhr.onload = onloadDataXHR;
    xhr.timeout = 0;
    xhr.send();
}
initialValues();