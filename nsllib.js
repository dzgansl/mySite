/**
 * Created by НСЛ on 28.02.2018.
 */
/* Полифиллы */
/* matches */
(function() {

    // проверяем поддержку
    if (!Element.prototype.matches) {

        // определяем свойство
        Element.prototype.matches = Element.prototype.matchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector;

    }

})();

/* closest */
(function() {

    // проверяем поддержку
    if (!Element.prototype.closest) {

        // реализуем
        Element.prototype.closest = function(css) {
            var node = this;

            while (node) {
                if (node.matches(css)) return node;
                else node = node.parentElement;
            }
            return null;
        };
    }

})();
/* ------ */

/* --- Перемещение  окна ---
 Включает перенос блока, заданного через object, умолчание $('main')
 Перенос осуществляется при нажатии на заголовок, заданного через header
 по умолчанию $('header'). Узлы можно задавать через css.
 */
function dragAnObject(object, header) {
    if (!object) object='main';
    var elem = typeof object == 'string' ? document.querySelector(object) : object;
    if (!elem) return;
    if (!header) header='header';
    var moveHeader = typeof header == 'string' ? document.querySelector(header) : header;
    if (!moveHeader) return;
    var dragObject = {};
    var delta = 3;
    // Изменение порядка окон при нажатии
    if (!document.zindexCard) document.zindexCard = 9999;
    elem.style.zIndex = ++document.zindexCard;

    elem.onmousedown = function (e) {
        if (e.which != 1) return;
        var zindex = getComputedStyle(elem).zIndex - 0;
        if (document.zindexCard > zindex) elem.style.zIndex = ++document.zindexCard;
    }

    moveHeader.onmousedown = function (e) {
        // если нажата не левая клавиша или статическое позиционирование - то выходим
        if (e.which != 1 || getComputedStyle(elem).position == 'static') return;
        dragObject.elem = elem;
        dragObject.downX = e.pageX;
        dragObject.downY = e.pageY;
        var box=elem.getBoundingClientRect();
        dragObject.shiftX = e.pageX-box.left - pageXOffset;
        dragObject.shiftY = e.pageY-box.top - pageYOffset;
        dragObject.left = parseFloat(getComputedStyle(dragObject.elem)['left']);
        if (dragObject.left) dragObject.left -= dragObject.elem.offsetLeft;
        dragObject.top = parseFloat(getComputedStyle(dragObject.elem)['top']);
        if (dragObject.top) dragObject.top -= dragObject.elem.offsetTop;
        document.onmousemove = document.ontochmove = function (e) {
            if (!dragObject.elem) return;
            // Если перенос не начат и сдвиг менее  delta - перенос не начинаем
            if ( !dragObject.start ) {
                if (Math.abs(e.pageX - dragObject.downX) < delta &&
                    Math.abs(e.pageY - dragObject.downY) < delta ) return;
                dragObject.start = true;
                elem.ondragstart = function () {
                    return false;
                }

                if (dragObject.elem.parentElement != document.body) document.body.appendChild(dragObject.elem);
                dragObject.elem.style.zIndex = 9999;
                dragObject.elem.style.position = 'absolute';
                dragObject.elem.style.zIndex = ++document.zindexCard;
            }
            var leftPos=e.pageX-dragObject.shiftX;
            if (leftPos<0) leftPos=0;
            else if (leftPos > (innerWidth-dragObject.elem.offsetWidth))
                leftPos = innerWidth-dragObject.elem.offsetWidth;
            var topPos=e.pageY-dragObject.shiftY;
            if (topPos<0) topPos=0;
            else if (topPos > (innerHeight-dragObject.elem.offsetHeight))
                topPos = innerHeight-dragObject.elem.offsetHeight;
            dragObject.elem.style.left=(leftPos+dragObject.left)+'px';
            dragObject.elem.style.top=(topPos+dragObject.top)+'px';
        }
        document.onmouseup = function (e) {
            document.onmousemove = null;
            dragObject = {};
        }
    }
    moveHeader.addEventListener('touchmove',function(e) {
        if (e.changedTouches.length>1) return;
        e.preventDefault();
        e.stopPropagation();
        if (dragObject === {} || !dragObject.elem) {
            dragObject.elem = elem;
            dragObject.downX = e.targetTouches[0].pageX;
            dragObject.downY = e.targetTouches[0].pageY;
            var box=elem.getBoundingClientRect();
            dragObject.shiftX = dragObject.downX-box.left - pageXOffset;
            dragObject.shiftY = dragObject.downY-box.top - pageYOffset;
            dragObject.left = parseFloat(getComputedStyle(dragObject.elem)['left']);
            if (dragObject.left) dragObject.left -= dragObject.elem.offsetLeft;
            dragObject.top = parseFloat(getComputedStyle(dragObject.elem)['top']);
            if (dragObject.top) dragObject.top -= dragObject.elem.offsetTop;
            dragObject.time = new Date().getTime();
        } else {
            //if (!dragObject.elem) return;
            // Если перенос не начат и сдвиг менее  delta - перенос не начинаем
            if ( !dragObject.start ) {
                if (Math.abs(e.changedTouches[0].pageX - dragObject.downX) < delta &&
                    Math.abs(e.changedTouches[0].pageY - dragObject.downY) < delta ) return;
                dragObject.start = true;
                elem.ondragstart = function () {
                    return false;
                }

                if (dragObject.elem.parentElement != document.body) document.body.appendChild(dragObject.elem);
                dragObject.elem.style.zIndex = 9999;
                dragObject.elem.style.position = 'absolute';
                dragObject.elem.style.zIndex = ++document.zindexCard;
            }
            var leftPos=e.changedTouches[0].pageX-dragObject.shiftX;
            if (leftPos<0) leftPos=0;
            else if (leftPos > (innerWidth-dragObject.elem.offsetWidth))
                leftPos = innerWidth-dragObject.elem.offsetWidth;
            var topPos=e.changedTouches[0].pageY-dragObject.shiftY;
            if (topPos<0) topPos=0;
            else if (topPos > (innerHeight-dragObject.elem.offsetHeight))
                topPos = innerHeight-dragObject.elem.offsetHeight;
            dragObject.elem.style.left=(leftPos+dragObject.left)+'px';
            dragObject.elem.style.top=(topPos+dragObject.top)+'px';
        }
        document.ontouchend = function (e) {
            document.onmousemove = null;
            dragObject = {};
        }
    }, false);
}

function showMessage(text,header,style) {
    if (!header) header = 'Внимание !!!';
    if (!style)  style = {};
    if (!style.width)  style.width = 360;
    if (!style.height) style.height = 480;
    if (!style.color)  style.color = '#000088';
    if (!style.backgroundColor) style.backgroundColor = '#eedddd';
    if (!style.backgroundHeader) style.backgroundHeader = '#bbddff';
    var marginLeft = Math.round(style.width / 2);
    var marginTop = Math.round(style.height / 2);
    var maxHeight = style.height - 70;
    var marginLeftButton = marginLeft - 35;
    var styleShow = "width: " + style.width +'px; margin: -' + marginTop + 'px 0 0 -' + marginLeft +
        'px; padding: 10px;position: fixed;top: 50%;left: 50%; color: ' + style.color +
        '; background-color: ' + style.backgroundColor +'; border-radius: 10px;border: 3px outset '+ style.backgroundHeader + '; font-size: 16px;';
    var styleHeader = 'margin: -10px -10px 0px -10px; height: 25px; background-color: ' +
        style.backgroundHeader +'; border-top-left-radius: 10px; border-top-right-radius: 10px; border-bottom: 1px solid #888888;cursor: move;';
    var styleHeaderImage = 'padding: 0 0 5px 3px; color: #ff0000;';
    var styleHeaderButton = 'float: right;color: #ff0000;font-weight: bold; font-size: 20px;border:none;border-left: 1px solid #888888;' +
        ' border-bottom: 1px solid #888888; border-radius: 3px; cursor: pointer; background-color: #bbddff;';
    var styleDiv = 'margin: 20px; max-height: ' + maxHeight +'px; overflow: auto;';
    var styleButton = 'padding: 8px 25px; margin-left: '+ (marginLeft - 35) + 'px; background-color: ' + style.backgroundHeader +
        '; border-radius: 5px; cursor: pointer;';
    var showMessage = document.createElement('div');
    showMessage.style.cssText = styleShow;
    showMessage.innerHTML = '<header><span>&#10022</span><span style="padding-bottom: 5px">' + header +
        '</span><button type="button">&times</button></header><div>' + text + '</div><button>OK</button>';
    var elheader = showMessage.querySelector('header');
    elheader.style.cssText = styleHeader;
    elheader.querySelector('span').style.cssText = styleHeaderImage;
    var elheaderbut = elheader.querySelector('button');
    elheaderbut.style.cssText = styleHeaderButton;
    elheaderbut.onclick = function () {showMessage.parentNode.removeChild(showMessage)};
    showMessage.querySelector('div').style.cssText = styleDiv;
    showMessage.querySelector('div').onselectstart = function (e) {
        document.selectstarton=true;
    }
    var elbut = showMessage.lastElementChild;
    elbut.style.cssText = styleButton;
    elbut.onclick = function () {showMessage.parentNode.removeChild(showMessage)};
    document.body.appendChild(showMessage);
    dragAnObject(showMessage, elheader);
}
/* Загружает модально html файл: src в iframe c id (по умолчанию iframe-modal).
   возвращает ссылку на элемент iframe
*/
function showIframe(src, id) {
    identIframe = document.createElement('iframe');
    identIframe.src = src;
    identIframe.id = id ? id : 'iframe-modal';
    identIframe.style.cssText = 'display: inline-block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(153,153,153,0.3); z-index: 9000;';
    document.body.appendChild(identIframe);
    return identIframe;
}
// Прочитать значение параметра из cookie
function getPropertyFromCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

/* Записать значение параметра в cookie
 name - имя параметра, value - значение (строка),
 options - объект с дополнительными свойствами для установки cookie:
 - expires - время истечения cookie. Интерпретируется по-разному, в зависимости от типа:
 Число – количество секунд до истечения. Например, expires: 3600 – кука на час.
 Объект типа Date – дата истечения. Если expires в прошлом, то cookie будет удалено.
 Если expires отсутствует или 0, то cookie будет установлено как сессионное и исчезнет при закрытии браузера.
 - path - Путь для cookie. Если не указать, то текущий путь и все пути ниже него.
 Если path=/, то есть cookie доступно со всех страниц сайта.
 - domain - Домен для cookie. Если не указать, то текущий домен.
 - secure - если true, то пересылать cookie только по защищенному соединению.
 */
function setPropertyToCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

// удалить параметр из cookie
function deletePropertyFromCookie(name) {
    setPropertyToCookie(name, "", {
        expires: -1
    })
}

/* --- Получение результата запроса от сервера --- */
function onloadDataXHR(e) {
    var xhr=e.currentTarget;
    if (!xhr.status) {
        showMessage('Ошибка сервера, тип: ' + e.type);
    } else if (xhr.status != 200) {
        showMessage('Статус ответа сервера: ' + xhr.status +": "+xhr.statusText);
    } else {
        try {
            var res = JSON.parse(xhr.responseText);
            if (!res.result) {
                showMessage(res.comment);
            } else {
                if (xhr.dataObject) res.dataObject=xhr.dataObject;
                xhr.dataProcessingFunction(res)
            }
        } catch (err) {
            showMessage(err);
        }
    }
}

function openSession(src) {
    if (!src) src='autorisation.html';
    var login = getPropertyFromCookie('login');
    var password = getPropertyFromCookie('password');
    if (login && password) {
        var query = 'action=sessionOpen&login=' + encodeURIComponent(login) +
            '&password=' + encodeURIComponent(password) + '&keySoftware=cross';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', document.apiurl + 'index.php?' + query, true);
        xhr.onerror = xhr.ontimeout = xhr.onload = function(e) {
            var xhr=e.currentTarget;
            if (xhr.status != 200) {
                showIframe(src);
            } else {
                try {
                    var res = JSON.parse(xhr.responseText);
                    if (!res.result) {
                        showIframe(src);
                    } else {
                        document.idSession=res.idSession;
                        if (document.eventSession) document.dispatchEvent(document.eventSession);
                    }
                } catch (err) {
                    showIframe(src);
                }
            }
        }
        xhr.timeout = 1000;
        xhr.send();
        return false;
    } else {
        showIframe(src)
    }
}
/*
Функция устанавливает ширину колонок заголовка = ширине колонок данных
Параметры: trheader - коллекция колонок строки заголовка
          trdata - коллекция колонок строки данных
*/
/*function setColumnWidth(trheader,trdata) {
    if (trheader.length!=trdata.length || trheader.length<=1) return;
    for (i=0;i<trheader.length;i++) {
        trheader[i].style.width=(trdata[i].clientWidth-10)+'px';
        trheader[i].style.minWidth=(trdata[i].clientWidth-10)+'px';
    }
}*/

function headerTab(tabhead, tabdata) {
    var thead = tabhead;
    var tdata = tabdata;
    if (thead.align) return;
    var ths = thead.querySelectorAll('th');
    // Добавить разделители в заголовок
    var delimiter = document.createElement('th');
    var thStyle = window.getComputedStyle(ths[0]);
    thborderWidth = parseInt(thStyle.borderWidth);
    if (thborderWidth == 0 || thborderWidth == NaN ) thborderWidth = 1;
    delimiter.style.cssText = 'cursor: col-resize; border: none; width: ' +
        thborderWidth +'px; min-width: ' + thborderWidth + 'px; background-color: ' + thStyle.borderColor;
    //'; border-right: solid 1px ' + thStyle.backgroundColor +
    delimiter.style.paddingLeft=delimiter.style.paddingRight=0;
    var thparent=ths[0].parentNode;
    var thsLength = ths.length - 1
    for (i = 0; i <= thsLength; i++) {
        var th = ths[i];
        th.style.boxSizing = 'border-box';
        //if (i<thsLength)
            th.style.borderRightStyle = 'none';
            th.style.borderLeftStyle = 'none';
        th.style.width = th.scrollWidth - thborderWidth;
        if (i) thparent.insertBefore(delimiter.cloneNode(false), th);
    }
    // запомнить ширину таблицы = 0
    thead.datawidth = tdata.offsetWidth;
    /*
     определить обработку при нажатии мыши на разделителе

     запомнить заголовок таблицы
     */
    //установить обработку при изменении размера таблицы данных

    align = function () {
        if (!tdata.rows.length) return;
        var marginRightDiv = tdata.parentNode.offsetWidth-tdata.parentNode.clientWidth-2*tdata.parentNode.clientLeft;
        thead.parentNode.style.marginRight = marginRightDiv + 'px';
        var tds = tdata.rows[0].cells;
        for (i = 0; i < ths.length; i++) {
            ths[i].style.width = (tds[i].scrollWidth - thborderWidth) + 'px';
            ths[i].style.maxWidth = (tds[i].scrollWidth - thborderWidth) + 'px';
        }
    }
    window.addEventListener('resize', align);
    return align;
}

/* создание вкладок
 * параметры конструктора:
 * tabs - массив данных о вкладках, settings - настройки
 *
 * элемент вкладки - объект:
 * {title: "заголовок вкладки", img: "рисунок вкладки",
 * state: 0 - видима и доступна, 1 - не доступная, 2 - не видимая
 * onActive: f(target) - функция активации вкладки
 * onDeactive: f(target) - функция деактивации вкладки
 *
 * настройки - объект
 * id: "IdЭлемента", currentRow: номер актианой вкладки (по умолчанию 0, чтобы все были не активны = -1
 * currentTab: номер активной вкладки;
 * isFocus: - использовать фокус, по умолчанию - ложь;
 *
 * Классы
 * TabBar - корневой элемет (тег ol), чтобы небыло нумерации: list-style-type: none;
 * selectNone - корневой элемет - отменяет выделение
 */

function TabsBar(ol, tabs, settings) {
    // <ol className="TabBar selectNone" id="id" onClick={this.onClickTab}>{li}</ol>
    if (!ol) ol = document.createElement('ol');
    /*ol.style.cssText = '-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;';
    ol.className = "TabBar"; // selectNone";*/
    ol.classList.add("TabBar");
    ol.classList.add("selectNone");
    if (!settings) settings={};
    if (settings.id) ol.id=settings.id;
    if (!settings.currenRow) settings.currenRow = 0;
    //<li className={className} tabindex="0"><img src={row.img} alt=""/>{row.title}</li>);
    for (var i=0; i<tabs.length; i++) {
        var row=tabs[i];
        var li = document.createElement('li');
        if (row.state == 1) li.className = 'tab-disable';
        else if (row.state == 2) li.className = 'tab-invisible';
        else {
            li.className = (settings.currenRow == i) ? 'tab-active' : 'tab-inactive';
            if (settings.isFocus) li.tabIndex = 0;
        }
        if (row.onActivate) li.onActivate=row.onActivate;
        if (row.onDeactivate) li.onDeactivate=row.onDeactivate;

        if (row.img) {
            var img=document.createElement('img');
            img.src = row.img;
            li.appendChild(img);
        }
        li.insertAdjacentText('beforeEnd', row.title);
        ol.appendChild(li);
    }

    ol.onclick = function(e) {
        var tabNew = e.target.closest('li');
        if (!tabNew) return false;
        // Проверяем принадлежность классу 'tab-inactive'
        if (!tabNew.classList.contains('tab-inactive')) return false;
        // Ищем текущий активный элемент
        var tabOld = tabNew.parentElement.querySelector('.tab-active');
        if (tabOld) {
            tabOld.classList.remove('tab-active');
            tabOld.classList.add('tab-inactive');
            // + выполнить функцию по деактивации связанных элементов
        }
        tabNew.classList.remove('tab-inactive');
        tabNew.classList.add('tab-active');
        // + выполнить функцию по деактивации связанных элементов) {
    }

    ol.currentTab = function () {
        for (var i=0; i<this.childElementCount; i++) {
            if (this.children[i].classList.contains("tab-active")) return {number: i, tab: this.children[i]};
        }
        return null;
        //return this.querySelector('.tab-active');
    }

    return ol;
}