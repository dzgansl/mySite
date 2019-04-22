/*

 */

'use strict';

/** приведение имен объектов, зависящих от браузера к одним и тем же стандартным именам **/
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition
    || window.msSpeechRecognition || window.oSpeechRecognition;
const modal         = document.getElementById('modal');

const userPanels    = document.getElementById('userPanels');
const dialogsSettings = document.getElementById('dialogsSettings');
//const exchangeKey  = document.getElementById('exchangeKey');
const dialogsClose  = document.getElementById('dialogsClose');
const screenDemo    = document.getElementById('screenDemo');
const dialogsFone   = document.getElementById('dialogsFone');
const dialogsVideo  = document.getElementById('dialogsVideo');
const dialogsFoneSwitch   = document.getElementById('dialogsFoneSwitch');
const dialogsVideoSwitch  = document.getElementById('dialogsVideoSwitch');
const columnShift  = document.getElementById('columnShift');
const dialogHideShow  = document.getElementById('dialogHideShow');
const contactsTbody = document.getElementById('contacts-tbody');
const headDialogsTxt = document.getElementById('headDialogsTxt');
const bell          = document.getElementById('bell');
const videoBlock    = document.getElementById('videoBlock');
const screenBlock        = videoBlock.children[1];
const screen        = screenBlock.children[0];
const localVideoBlock = videoBlock.children[2];
const localVideo    = localVideoBlock.children[2];
const localFoto     = localVideoBlock.children[1];
/*   Константы авторизации */
const hello         = document.getElementById('hello');
const registration  = document.getElementById('registration');
const restore       = document.getElementById('restore');
const helloForm     = document.getElementById('helloForm');
const savepass      = document.getElementById('savepass');
const emailBlock    = document.getElementById('emailBlock');
const identCome     = document.getElementById('identCome');
const identExit     = document.getElementById('identExit');
/*     Константы настроек  */
const settingsBlock = document.getElementById('settingsBlock');
const trashClear    = document.getElementById('trashClear');
const settingsClearSwith = document.getElementById('settingsClearSwith');
const setVideoDevice= document.getElementById('setVideoDevice');// checked:

const videoinput  = document.getElementById('videoinput');
const audioinput  = document.getElementById('audioinput');
const audiooutput  = document.getElementById('audiooutput');

var debug       = {i: 0};        // счетчик для отладки
var socketOpen  = false; // Признак открытия webSocket
var months      = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
var idUser      = null;         // Код пользователя
var idMainUser  = 2;            // Код администратора
var user        = {};           // данные полоьзователя
var error       = '';           // Текст сообщения об ошибке
var wsUrl       = 'wss://neshataev.ru:5822';    // url - webSocket
var chatActive  = false;        // Отображена форма чата
var chatEmpty   = true;         // Нет данных в чате (переписка отсутствовала)
var countNewMessage = 0;        // Пришло новое сообщение
var users       = [];           // Массив данных контактов
var curUserIdx  = null;         // Номер текущего собеседника в массиве
var curUser     = null;         // Ссылка на текущего собеседника = users[curUserIdx]
var curDialogIdx = null;        // Номер текущего диалога
var curDialog   = null;         // Ссылка на текущий диалог
var idLastMessage = 0;          // id последнего прочитанного сообщения
var idLast      = 0;            // id последнего сообщения в базе
var timeOffset  = new Date().getTimezoneOffset();
var wLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--wLeft')); // ширина колонки котнактных лиц
var wRignt = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--wRight')); // ширина отступа справа
var leftBlockVisible = true;
var scrollTop   = null;         // скроллинг при раскрытии, закрытии диалога
var panelVisible = true;        // Отображается панель текстовых диалогов
var hPanelMin =  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hPanelMin')); // Минимальный размер опанели текстовых диалогов
var peerConn    = null;         //
var peerConnCfg = {'iceServers':
        [{'urls': 'stun:stun.services.mozilla.com'},{'urls': 'stun:stun.l.google.com:19302'}]
    };
var localVideoStream = null;    // Видео-поток с камеры пользователя
var screenVideoStream = null;   // Видеопоток с экрана пользователя
var screenSender = null;
var mediaDevice = {audio: false, video: false};
var isMediaDevice = {audio: false, video: false};
var videoConstraints = {value: false};
var audioConstraints = {value: false};
var heightVideo = 0;

var data = {};
var writes, writesTimer, writesMessage, writesUser, writesDelay;
var talkState = 'none';         // Состояние диалога: none, bell, connect, active
var talkIdUser= null;           // id позвонившего
var talkUsers = [];             // Участники диалога
var talkMediaDevice = {audio: false, video: false};

var pcIn = null;
var pcOut = null;

var settings = {
    save: false,                 //  Сохранять настройки
    queryVideoDevice: true,     //  Запрашивать все медиаустройства при начале голосового общения
    freeDevices: false,         //  освобождать медиа-устройства после голосового общения
    trash: false,               //  Наличие куков авторизации пользователя
    videoFormat: '320x240',     //  видео-разрешение
    autoGainControl: false,     //  автоматическая регулировка усиления
    echoCancellation: false,    //  подавление эха
    noiseSuppression: true      //  подавление шума
};
/*
var lengthMessage = 0;
var textareaHidht = 25;         // Высота области ввода в пикселях
var textareaMaxHidht = 300;     // Максимальная высота области ввода
*/
var webSocket = wsConnect();    //  Подключение к webSocket серверу
var settingsChange = false;
var settingsJson = getPropertyFromCookie('settings'); // Восстановление сохраненных настроек
if (settingsJson) {
    var settingsSave = JSON.parse(settingsJson);
    for (var i in settingsSave) {
        settings[i] = settingsSave[i];
    }
} else settingsSave = {};
var pos = settings.videoFormat.indexOf('x');
settings.videoWidth = settings.videoFormat.substr(0,pos) - 0; //Разрешение - ширина
settings.videoHeight = settings.videoFormat.substr(pos+1) - 0;  //Разрешение - высота
var elem=document.getElementById('resolution').querySelector('input[value="'+settings.videoFormat+'"]');
if (elem) elem.checked=true;
document.getElementById('autoGainControl').checked = settings.autoGainControl;
document.getElementById('echoCancellation').checked = settings.echoCancellation;
document.getElementById('noiseSuppression').checked = settings.noiseSuppression;
document.getElementById('saveSettingsSwith').checked = settings.save;
document.getElementById('setVideoDevice').checked = settings.queryVideoDevice;
document.getElementById('freeDevices').checked = settings.freeDevices;

idUser = getPropertyFromCookie('idUser');   // Чтение в куках кода пользователя
// Сохранение настройки
function changeSettings(name, value) {
    settingsSave[name] = value;
    settings[name] = value;
    settingsChange = true;
}

var waitSend =[];               //массив отложенных запросов
if (idUser !== undefined) {
    // Получить информацию о посетителе
    user.login = getPropertyFromCookie('login');
    if (!user.login) user.login = getPropertyFromCookie('name');
    if (socketOpen) wsSend({action: 'hello', idUser: idUser, login: user.login});
    // если webSocket еще не открыт - записываем запрос в массив отложенных запросов
    else waitSend.push({action: 'hello', idUser: idUser, login: user.login});
    modal.style.display = 'none';
    hello.style.display = 'none';
    settings.trash = true;
} else {
    modal.style.display = 'block';
    hello.style.display = 'block';
}

// Проверяем возможность общения через медио-устройства
mediaDeviceDefine(true);
// подключение к ws-серверу, обработка событий ws-серыера
function wsConnect() {
    try {
        var webSocket = new WebSocket(wsUrl);
    } catch (ex) {
        return null;
    }
    var socketOpen = false;
    webSocket.onerror = function (err) {
        console.log('Ошибка соединения: '+err.message);
        showMessage('Ошибка соединения: ' + err.message + '<br>Обмен данными невозможен','Ошибка соединения');
        socketOpen = false;
    };

    webSocket.onopen = function () {
        socketOpen = true;
        console.log('ws-соединение установлено');
        // Выполнение отложенных запросов
        if (waitSend.length > 0) {
            waitSend.forEach(function(obj){wsSend(obj);});
            waitSend=[];
        }
    };

    webSocket.onclose = function(event) {
        socketOpen = false;
        console.log("Соединение WebSocket закрыто " + (event.wasClean ? 'успешно' : 'с ошибкой')
            + ' с кодом ' + event.code + ', причина: ' + event.reason)
    };

    webSocket.onmessage = function (message) {
        var q = JSON.parse(message.data);
        if ('reply' in q) processReply(q);
        else if ('result' in q && !q.result) {
            error = q.comment;
            console.log('Error: '+ q.comment);

        } else if ('send' in q && q.send === 'read') sendRead(q);
        else if ('load' in q) {
            if (q.load === 'dialogUsers') loadDialogUsers(q);   // Загрузить контакты
            else if (q.load == 'newUser') loadNewUser(q);       // Загрузить новый контакт (добавить контакт)
            else if (q.load == 'userDialogs') loadUserDialogs(q);  // Показать диалоги с пользователем
            else if (q.load == 'dialog') loadDialog(q);         // Показать содержимое диалога с пользователем
            else if (q.load == 'foto') loadFoto(q);             // Показать загруженные фотографии пользователя
            else {
                var err='не найден обработчик для запроса load: ' + q.load;
                console.log(err);
                error = err;
            }

        } else if ('add' in q) {
            if (q.add==='newDialog') addNewDialog(q);
            else if (q.add==='newMessage') addNewMessage(q);
            else {
                var err='не найден обработчик для запроса add: ' + q.add;
                console.log(err);
                error = err;
            }
        } else if ('switch' in q) {
            if (q.switch === 'online') {
                userOnline(q);
            } else if (q.switch === 'writes') {
                var f_user = (curUser !== null && q.idUser === curUser.idUser) ? curUser :
                    findUser(q.idUser, users);
                if (f_user) f_user.writes = q.value;
            } else {
                var err = 'не найден обработчик для запроса switch: ' + q.switch;
                console.log(err);
                error = err;
            }
        } else if ('command' in q) {
            if (q.command === 'Звонок') commandBell(q);
            else if (q.command === "Подключение") commandConnection(q);
            else if (q.command === "Предложение") commandOffer(q);
            else if (q.command === "Предложение2") command2Offer(q);
            else if (q.command === "ПредложениеSend") sendCommandOffer(q);
            else if (q.command === "Ответ") commandAnswer(q);
            else if (q.command === "Ответ2") command2Answer(q);
            else if (q.command === "ОтветSend") sendCommandAnswer(q);
            else if (q.command === "Занято") {
                bell.src='busy.mp3';
                bell.play(0);
                bell.volume=1;
                dialogsClose.style.display='none';
                screenDemo.style.display ='none';
                setTimeout(endCall(),1500);
            }
            else if (q.command === "Сброс") endCall();
            else if (q.command === "Сброс2") screenDemoEnd();
            else if (q.command === "СбросОбмен") exchangeClose();
            else if (q.command === "Устройство") medioDeviceEx(q);

        } else if ('candidate' in q) {
            console.log("Получил ICECandidate от удаленного партнера.");
            peerConn.addIceCandidate(new RTCIceCandidate(q.candidate));
        } else if ('candidate2' in q) {
            console.log("Получил ICECandidate-2 от удаленного партнера.");
            pcIn.addIceCandidate(new RTCIceCandidate(q.candidate2));
        } else if ('candidateSend' in q) {
            console.log("Получил ICECandidate-Send от удаленного партнера.");
            sendPC.addIceCandidate(new RTCIceCandidate(q.candidateSend));
        /*} else if ('sdp' in q) {
            console.log("Получил SDP от удаленного партнера.");
            peerConn.setRemoteDescription(new RTCSessionDescription(q.sdp));
        } else if ('closeConnection' in q) {
            console.log("Получен сигнал «закрыть вызов» от удаленного партнера.");
            endCall(q);*/
        } else {
            var err='не найден обработчик для запроса: ';
            console.log(err, q);
            error = err + JSON.stringify(q);
        }
    };

    return webSocket;
}
// отправка запросов на ws-сервер
function wsSend(obj) {
    var str= JSON.stringify(obj);
    //console.log(str);
    webSocket.send(str);
}

/************************* Авторизация ***********************************/

// не используется
registration.oninput = function (e) {
    if (registration.checked) {
        restore.disabled = true;
        emailBlock.style.display='block';
    } else {
        restore.disabled = false;
        emailBlock.style.display='none';
    }
    return false;
};
// не используется
restore.oninput = function (e) {
    if (restore.checked) {
        registration.disabled = true;
        emailBlock.style.display='block';
        identCome.textContent = "Восстановить";
    } else {
        registration.disabled = false;
        emailBlock.style.display='none';
        identCome.textContent = "ВОЙТИ";
    }
    return false;
};
// обработка нажатия кнопкп "ввод" на форме авторизации
function helloFormsubmit(e) {
    e.preventDefault();
    if(registration.checked) {
        wsSend({action: 'registration', login: document.getElementById('login').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value});
    } else if (restore.checked) {
        wsSend({action: 'restore', login:  document.getElementById('login').value,
            email: document.getElementById('email').value});
    } else {
        wsSend({action: 'hello', login:  document.getElementById('login').value,
            password: document.getElementById('password').value});
    }
    return false;
}
// обработка ответа сервера на введеные данные формы авторизации
function processReply (q) {
    if (q.reply==='registration') processHello(q);
    else if (q.reply==='hello')   processHello(q);
    else if (q.reply==='restore') processRestore(q);
    else if (q.reply==='updateUser') processUpdateUser(q);
    else if (q.reply==='updateIdent') processUpdateIdent(q);
    else if (q.reply==='updateFoto') processUpdateFoto(q);
    else if (q.reply==='file') processFile(q); // Передача файла
    else if (q.reply==='deleteFile') processDeleteFile(q);
    else if (q.reply==='findUsers') processFindUsers(q);
}
// обработка данных ответа сервера авторизации
function processHello(q) {
    if (q.result !== true) {
        console.log('Ошибка при выполнении запроса ' + q.reply + ': ' + q.comment);
        if (hello.style.display === 'none') {
            modal.style.display = 'block';
            hello.style.display = 'block';
        }
        showMessage(q.comment, 'Ошибка в данных приветствия');
        return false;
    }
    if (hello.style.display === 'block') {// скрытие формы авторизации
        modal.style.display = 'none';
        hello.style.display = 'none';
    }
    if (!savepass.checked && q.user.idUser && q.user.login) {        // сохраниение данных пользователя в куках
        setPropertyToCookie('login', q.user.login, {expires: 10000000});
        setPropertyToCookie('idUser', q.user.idUser, {expires: 10000000});
        settings.trash = true;
    }
    idUser = q.user.idUser;
    user = q.user;
    localVideoBlock.querySelector('.videoHeadTxt').textContent = user.fullName;
    localFoto.src=user.foto;

    // Отправим запрос на получение списка пользователей для общения
    wsSend({get: 'dialogUsers'});
    /*if (idUser === idMainUser) wsSend({get: 'dialogUsers', select: 'all'});
    else wsSend({get: 'dialogUsers', idUsers: idMainUser});*/
}
// обработка данных ответа сервера на восстановление пароля
function processRestore() {
    if (q.result === true) showMessage(q.comment, 'Ошибка в данных приветствия');
    else showMessage(q.comment, 'Информация передана');
}

/************************ Текстовые диалоги **********************************/
// Загрузка списка контактов
function loadDialogUsers(q) {
    //  q.data: [idUser, name, fullName, foto - путь к фото, online - true: в системе,
    //          countNewMessage - количество новых сообщений]}:
    if (q.length === 0) {
        error = 'В результатах запроса ' + q.send + ' данные не найдены';
        return;
    }
    // Загрузка основных данных по каждому контакту
    var text = '';
    for (var i = 0; i < q.data.length; i++) {
        users[i] = {
            idUser: q.data[i].idUser - 0,   // код контактного лица
            name: q.data[i].name,           // короткое имя
            fullName: q.data[i].fullName,   // полное имя
            foto: q.data[i].foto,           // фото
            countNewMessage: q.data[i].countNewMessage - 0, // количество новых сообщений
            countUnread: 0,         // количество непрочитанных сообщений
            online: q.data[i].online,       // пользователь в системе
            writes: false,          //
            loaded: false,          // Определяет загружены ли диалоги
            message: '',            // текущий вводимый текст сообщения
            dialogs: [],            // диалоги с пользователем
            curIdDialog: 0,          // код текущего диалога
            series: q.data[i].series // Порядковый номер контакта
        };
        countNewMessage += users[i].countNewMessage; // всего новых сообщений
        // Формирование содержимого таблицы контактов
        text = text + '<tr onclick="pressUserDialog(' + i + ')" class="trUser" style="background-color: '+
            (users[i].countNewMessage === 0 ? '#eeeeee' : '#ffe0e0')+ '">\n' +
            '<td class="tdUser">\n' +
            '<span style="color: ' + (users[i].online ? '#087b52' : '#ff0000') + '">' +
            (users[i].countNewMessage ? users[i].countNewMessage + ': ' : '&#9679; ') +
            '</span>' + users[i].fullName + '</td>\n' +
            '</tr>\n';
    }
    // Отображение списка контактов
    contactsTbody.innerHTML = text;

    //включение кнопок
    buttonVideoFone(true);
    dialogsSettings.style.cursor = 'pointer';
    // Для первого контакта запрос списка диалогов
    pressUserDialog(0);
}
// Загрузить новый контакт (добавить контакт)
function loadNewUser(q) {
    i=users.length;
    users[i]={
        idUser: q.user.idUser - 0,  // код контактного лица
        name: q.user.name,          // короткое имя
        fullName: q.user.fullName,  // полное имя
        foto: q.user.foto,          // фото
        countNewMessage: 0,         // количество новых сообщений
        countUnread: 0,             // количество непрочитанных сообщений
        online: q.user.online,             // пользователь в системе
        writes: false,              //
        loaded: false,              // Определяет загружены ли диалоги
        message: '',                // текущий вводимый текст сообщения
        dialogs: [],                // диалоги с пользователем
        curIdDialog: 0,             // код текущего диалога
        series: q.user.series       // Порядковый номер контакта
    };
    // Формирование содержимого таблицы контактов
    var text = '<tr onclick="pressUserDialog(' + i + ')" class="trUser" style="background-color: '+
        (users[i].countNewMessage === 0 ? '#eeeeee' : '#ffe0e0')+ '">\n' +
        '<td class="tdUser">\n' +
        '<span style="color: ' + (users[i].online ? '#087b52' : '#ff0000') + '">' +
        (users[i].countNewMessage ? users[i].countNewMessage + ': ' : '&#9679; ') +
        '</span>' + users[i].fullName + '</td>\n' +
        '</tr>\n';
    contactsTbody.insertAdjacentHTML('beforeend',text);
    messageVisible('Добавлен новый контакт: '+users[i].fullName);
}

// Загрузить список диалогов
function loadUserDialogs(q) {
    // Ищем пользователя в списке диалогов
    var f_user = null;
    //console.log('q=%j',q);
    q.idUser = q.idUser - 0;
    if (curUser.idUser === q.idUser) {
        f_user = curUser;
    } else {
        for (var i = 0; i < users.length; i++) {
            if (users[i] && users[i].idUser === q.idUser) {
                f_user = users[i];
                break;
            }
        }
        if ( f_user === null) {
            console.log('error userDialogs: idUser: ' + q.idUser + ' not found');
            return;
        }
    }
    // Пользователь найден:
    // Загрузим его диалоги
    var text='';
    for (var i = 0; i < q.data.length; i++) {
        f_user.dialogs[i]={
            idDialog: q.data[i].idDialog,
            date: q.data[i].date.substr(0,10),
            visible: false,
            dialog: []
        };
        text += '<li id=d'+q.data[i].idDialog + '>\n'+
            '<div onclick = "pressDialog('+i+')">\n' +
                '<span class="buttonPlus"> </span>\n' +
                    q.data[i].date.substr(8, 2) + ' ' + months[q.data[i].date.substr(5, 2) - 1] + ' ' + q.data[i].date.substr(0, 4) + ' года'+
                '\n</div>\n'+
            '<ul style="padding-left: 20px; display: none">\n'+
            '</ul>\n' +
        '</li>\n';
    }
    var newPanel = userPanels.querySelector('.panel').cloneNode(true);
    newPanel.id = 'panel_'+curUserIdx;
    var panelUl = newPanel.querySelector('ul');
    panelUl.innerHTML = text;
    userPanels.appendChild(newPanel);
    newPanel.style.display=panelVisible ? 'block' : 'none';
    f_user.loaded = true;
    f_user.panel = newPanel;
    f_user.message = newPanel.querySelector('textarea');
    f_user.message.value = '';
    f_user.heightTextArea = 21;

    for (var i = 0; i < q.data.length; i++) {
        f_user.dialogs[i].node = panelUl.children[i];
    }

    // Проверим дату последнего диалога - если равна текущей - фиксируем curIdDialog
    if (f_user.dialogs.length === 0) {
        curDialog = null;
    } else {
        var idxDialog = f_user.dialogs.length-1;
        curDialog = f_user.dialogs[idxDialog];
        if (curDialog.date.substr(0,10) === new Date().toISOString().substr(0,10) ) {
            curUser.curIdDialog = curDialog.idDialog;
        }
        // показать содержимое последнего диалога
        pressDialog(idxDialog)
    }

    /*
    wsSend({
        get: 'dialog',
        idDialog: curDialog.idDialog});*/
}
// загрузка диалога
function loadDialog(q) {
    // Показать содержимое диалога с пользователем
    if(q.data.length === 0) {
        error = 'В результатах запроса ' + q.send + ' данные не найдены';
        return;
    }
    // Сначала проверяем, что это тот диалог
    if (q.data[0].idDialog - 0 === curDialog.idDialog) {
        var countUnread = 0;    // количесвто моих сообщений не прочитанных собеседником
        var idMessages ='';     // список id сообщений, которые я не прочитал
        var oldDialog = true;   // используется для определения id нового диалога, true - будет использоваться текущий1
        var itLastDialog = curUser.dialogs[curUser.dialogs.length-1].idDialog === curDialog.idDialog;
        var text = '';
        for (var j=0; j < q.data.length; j++) {
            var row = q.data[j];
            curDialog.dialog[j] = {
                idMessage: row.idMessage - 0,
                idDialog: row.idDialog - 0,
                dateTime: myDateTime(row.dateTime),
                idFrom: row.idFrom - 0,
                idTo: row.idTo - 0,
                isRead: row.isRead > 0,
                message: row.message
            };
            if (itLastDialog) {
                if (row.isRead == 0) {
                    if (row.idFrom == curUser.idUser)  idMessages +=', '+row.idMessage;
                    else {
                        countUnread ++;
                        oldDialog = false;
                    }
                } else oldDialog = false;
            }
            text += '<li class="mess">\n';
            if (idUser === curDialog.dialog[j].idFrom ) {
                text += '<div class="messMy">\n' +
                    '<div class="messMyTime">\n' +
                        curDialog.dialog[j].dateTime.substr(11, 5) +
                    '</div>\n' +
                    '<div class="messMyPad">\n' +
                        '<span class="messMyName">'+ user.name + ': </span>\n' +
                        '<span class="messMyText">' + curDialog.dialog[j].message + '</span>\n' +
                    '</div>\n' +

                    '</div>\n</li>\n';
            } else {
                text +='<div class="messHe">\n'+
                    '<div class="messHeTime">\n'+
                        curDialog.dialog[j].dateTime.substr(11, 5) +
                    '</div>\n' +
                     '<div class="messHePad">\n' +
                        '<span class="messHeName">'+curUser.name + ': </span>\n' +
                        '<span class="messHeText">' + curDialog.dialog[j].message + '</span>\n'+
                    '</div>\n' +
                     '</div>\n</li>\n';
            }
        }
        curDialog.node.querySelector('ul').innerHTML = text;

        curDialog.visible = true;
        if (itLastDialog) {
            scrollTop = null; // включение скроллинга сообщений
            if  (curUser.curIdDialog === 0 && oldDialog){
                curUser.curIdDialog = curDialog.idDialog;
            }
            curUser.countUnread = countUnread;
            if (idMessages) {
                setTimeout(function() {
                    wsSend({send: 'read', idUser: curUser.idUser, idMessages: idMessages.substr(2)});
            },2000)
            }
        }
    }
}
// Отключение таймера, если включен
function writesClose() {
    if (writesTimer) {
        if (writes) {
            wsSend({switch: 'writes', value: false, idUser: curUser.idUser});
            writes = false;
        }
        clearInterval(writesTimer);
        writesTimer = null;
        writesMessage = '';
        writesUser = null;
    }
}
// Включение таймера - если требуется
function writesOpen() {
    if (curUser && curUser.online) {
        writesUser = curUser;
        writesMessage = curUser.message.value;
        writes = false;
        var server = this;
        writesTimer = setInterval(function(){writesTest()}, writesDelay);
    }
}
function writesTest() {
    var writes = ! (curUser.message.value == '' ||
        writesMessage === curUser.message.value);
    if (writes !== writes) {
        writes = writes;
        wsSend({switch: 'writes', idUser: curUser.idUser, value: writes});
    }
    writesMessage = curUser.message.value;
}
// Скрыть текущий контакт и показать контакт номер idx
function goContact(idxUser) {
    if (curUser) {
        // Восстановить фон контакта
        contactsTbody.children[curUserIdx].style.backgroundColor = (curUser.countNewMessage === 0 ? '#eeeeee' : '#ffe0e0');
        // Спрятать панель диалогов
        if ('panel' in curUser && panelVisible) curUser.panel.style.display = 'none';
    }
    curUserIdx = idxUser;
    curUser = users[idxUser];
    contactsTbody.children[curUserIdx].style.backgroundColor = 'paleturquoise';
    if ('panel' in curUser && panelVisible) curUser.panel.style.display = 'block';
    //if (talkState === 'none') {
        buttonVideoFone(curUser.online);
    //}
}
/* Открыть диалоги  */
function pressDialogs() {
    if (chatActive) {     // Выход из режима диалога
        chatActive = false;
        // Отключение таймера и сообщить, что не пишет - если писал
        writesClose();
    } else if (!socketOpen) {
        wsConnect();
        var server = this;
        setTimeout(function() {
            if(socketOpen) server.pressDialogs();
    else error = 'Нет связи с webSocket - сервером';
    },1000);
    } else {
        // Вход в режим диалога
        chatActive = true;
        if (curUserIdx === null) {
            pressUserDialog(0)
        } else {
            writesOpen();
            if (curUser.countNewMessage) {
                readNewMessage();
            }
        }
    }
}
/* показать диалоги с пользователем */
function pressUserDialog(idxUser) {
    if (curUserIdx === idxUser) return; // Если это текущий пользователь - ничего не делаем
    if (curUser) {
        writesClose();
    }
    scrollTop = null; // включение скроллинга сообщений
    goContact(idxUser);
    writesOpen();
    if (curUser.loaded) {
        if (curUser.countNewMessage) {
            readNewMessage();
        }
    } else {
        wsSend({
            get: 'userDialogs',
            idUser: curUser.idUser
        });
    }

}
/* показать сообщения диалога */
function pressDialog(idxDialog) {
    var dialog =curUser.dialogs[idxDialog];
    if (dialog.visible) {
        dialog.visible = false;
        dialog.node.querySelector('ul').style.display='none';
        dialog.node.querySelector('span').classList.remove('buttonMinus');
        dialog.node.querySelector('span').classList.add('buttonPlus');
    }  else {
        curUser.dialogs[idxDialog].visible = true;
        curUser.dialogs[idxDialog].node.querySelector('ul').style.display='block';
        dialog.node.querySelector('span').classList.remove('buttonPlus');
        dialog.node.querySelector('span').classList.add('buttonMinus');
    }

    if (curUser.dialogs[idxDialog].dialog.length === 0) {
        curDialog = curUser.dialogs[idxDialog];
        wsSend({
            get: 'dialog',
            idDialog: curDialog.idDialog
        });
    }
}
/* поиск пользователя по id */
function findUser(idUser,users) {
    for (var i=0; i < users.length; i++) {
        if (idUser==users[i].idUser) return users[i];
    }
    return null;
}
/* строковое отображение местного времени */
function myDateTime(dateTime) {
    var dateStr =  new Date(new Date(dateTime).getTime() -  new Date().getTimezoneOffset()*60000).toISOString().substr(0,19);
    return dateStr.substr(0, 10) + ' ' + dateStr.substr(11, 8);
}
// Отправка сообщения
function sendMessage() {
    wsSend({
        send: 'newMessage',
        idDialog: curUser.curIdDialog,
        idUser: curUser.idUser,
        message: curUser.message.value
    })
}
// обработка данных ответа сервера: Добавление диалога
function addNewDialog(q /*:{add: string, result: boolean, idDialog: number, idUser: number, date: string}*/) {
    var f_curUser = curUser.idUser == q.idUser ? curUser : findUser(q.idUser, users);
    if (!f_curUser || !f_curUser.loaded) return;
    f_curUser.dialogs.push({
        idDialog: q.idDialog,
        date: q.date.substr(0,10),
        visible: true,
        dialog: []
    });
    f_curUser.curIdDialog = q.idDialog;
    var dialogs = f_curUser.panel.querySelector('ul');
    var text = '<li id=d'+q.idDialog + '>\n'+
        '<div onclick = "pressDialog('+i+')">\n' +
        '<span class="buttonPlus"> </span>\n' +
        q.date.substr(8, 2) + ' ' + months[q.date.substr(5, 2) - 1] + ' ' + q.date.substr(0, 4) + ' года'+
        '\n</div>\n'+
        '<ul style="padding-left: 20px; display: none">\n'+
        '</ul>\n' +
        '</li>\n';
    dialogs.insertAdjacentHTML('beforeend',text);
}
// обработка данных ответа сервера: Добавление сообщения
function addNewMessage(q/*:{add:string, result: boolean, idDialog: number, idMessage: number, idFrom: number, idTo: number, dateTime: string, isRead: boolean, message: string}*/) {
    // Определить собеседника
    var t_idUser = idUser == q.idFrom ? q.idTo : q.idFrom;
    var f_curUser = (curUser && curUser.idUser == t_idUser) ? curUser : findUser(t_idUser, users);
    if (idUser == q.idTo) {
        f_curUser.countNewMessage++;
        countNewMessage++;
    }
    // Если диалоги с собеседником не загружены - пока ничего не делаем
    if (! f_curUser.loaded) return;

    // Определить объект - диалог
    var f_curDialog = f_curUser.dialogs[f_curUser.dialogs.length-1];
    if (f_curDialog.idDialog != q.idDialog) { // возможно в будущем убрать
        console.log('Не найден диалог с кодом '+q.idDialog);
        error = 'Не найден диалог с кодом '+q.idDialog;
        return;
    }
    scrollTop = null; // включение скроллинга сообщений
    // Добавление сообщения в диалог
    var mydatetime = myDateTime(q.dateTime);
    f_curDialog.dialog.push({
        idMessage: q.idMessage - 0,
        idDialog: q.idDialog -0,
        dateTime: mydatetime,
        idFrom: q.idFrom,
        idTo: q.idTo,
        isRead: false,
        message: q.message
    });
    // Включить отображение диалога с добавленным сообщением  и увеличить счетчики !!!
    f_curDialog.visible = true;
    if (idUser == q.idFrom && f_curUser.message.value === q.message) { // я отправиель
        // очистить область сообщений и увеличить счетчик
        f_curUser.message.value = '';
        f_curUser.countUnread++;
        var text = '<div class="messMy">\n'+
            '<div class="messMyTime" style="">\n'+
            mydatetime.substr(11, 5) +
            '</div>\n' +
            '<div class="messMyPad">\n' +
            '<span class="messMyName">'+ f_curUser.name + ': </span>\n' +
            '<span class="messMyText">' + q.message + '</span>\n'+
            '</div>\n' +
            '</div>\n</li>\n';
    } else if (idUser == q.idTo) {
        // я получатель

        if (curUser === f_curUser && chatActive) {
            // я получатель и вижу текст сообщения - через 2 секунды сказать, что прочитано
            setTimeout(function() {
                wsSend({send: 'read', idUser: curUser.idUser, idMessages: q.idMessage});
        }, 2000);
        }
        var text = '<div class="messHe">\n'+
            '<div class="messHeTime" style="">\n'+
            mydatetime.substr(11, 5) +
            '</div>\n' +
            '<div class="messHePad">\n' +
            '<span class="messHeName">'+ f_curUser.name + ': </span>\n' +
            '<span class="messHeText">' + q.message + '</span>\n'+
            '</div>\n' +
            '</div>\n</li>\n';
    }
    var lastdialog = f_curUser.panel.querySelector('ul').lastElementChild;

    lastdialog.querySelector('ul').insertAdjacentHTML ( "beforeend", text );
}
// сообщает о прочтении входящих сообщений
function readNewMessage() {
    var idxDialog = curUser.dialogs.length-1;
    if (idxDialog < 0) return;
    var f_curDialog = curUser.dialogs[idxDialog].dialog;
    if (f_curDialog.length == 0) return;
    var t_idUser = idUser;
    var idMessages = '';
    for (var i=0; i < f_curDialog.length; i++) {
        if (!f_curDialog[i].isRead && f_curDialog[i].idTo === t_idUser)
            idMessages += ', '+f_curDialog[i].idMessage;
    }
    if (idMessages) {
        setTimeout(function() {
            wsSend({send: 'read', idUser: curUser.idUser, idMessages: idMessages.substr(2)});
    },2000);
    }
}

function sendRead(q/*:{send:string, idUser: number, idMessages: string|number, type: string}*/) {
    var f_curUser = curUser.idUser == q.idUser ? curUser : findUser(q.idUser, users);
    if (!f_curUser) return;
    var lastDialog = f_curUser.dialogs[f_curUser.dialogs.length-1].dialog;
    var count=0;
    if (q.type === 'in') {
        for(var i = 0; i < lastDialog.length; i++) {
            if (!lastDialog[i].isRead && lastDialog[i].idTo == idUser) {
                lastDialog[i].isRead = true;
                count++;
            }
        }
        f_curUser.countNewMessage -= count;
        countNewMessage -= count;
    } else {
        for(var i = 0; i < lastDialog.length; i++) {
            if (!lastDialog[i].isRead && lastDialog[i].idFrom == idUser) {

                lastDialog[i].isRead = true;
                count++;
            }
        }
        f_curUser.countUnread -= count;
    }
}
// изменение индикации контактного лица при подключении или отключении
function userOnline(q)/* idUser, value: true||false */  {
    // в списке контактов - поменять цвет
    for (var i = 0; i < users.length; i++) {
        if (users[i].idUser == q.idUser ) {
            users[i].online = q.value;
            if (q.value){
                contactsTbody.children[i].querySelector('span').style.color = '#087b52';
                //if (talkState === 'none') {
                buttonVideoFone(true);
                //}
            } else {
                contactsTbody.children[i].querySelector('span').style.color = '#ff0000';
                //if (talkState === 'none') {
                buttonVideoFone(false);
                //}
            }

            // если это текущий собеседник - в заголовке поменять цвет
            /*if (i===curUserIdx) {
                headDialogsTxt.querySelector('span').style.color = q.value ?  '#087b52' : '#ff0000' ;
            }*/
            break;
        }
    }
    /*  if (user == curUser) {
        if (q.value) writesOpen();
        else writesClose();
    }*/
}
// обработка события ввода текста для изменения размера области ввода и области диалога
function textarea(e) {
    if (e.target.nodeName==='TEXTAREA') {
        var h = 'data_h' in e.target ? e.target.data_h : e.target.clientHeight;
        e.target.style.height = ""; /* Reset the height*/
        var height = e.target.scrollHeight;
        if (height > 100) height = 100;
        if (h == height) {
            e.target.style.height = h+'px';
        } else {
            var parent = e.target.parentElement.parentElement;
            var hP = parent.offsetHeight;
            var dialogs = parent.querySelector('.dialogs');
            dialogs.style.height = (hP - height - 32) + 'px';
            e.target.style.height = height + 'px';
            e.target.data_h = e.target.clientHeight;
        }
    }
    return false;
}
// Обработка изменения размера окна браузера
window.onresize = resize;
function resize() {
    // Определим отношения
    var h = userPanels.clientHeight;
    //document.body.clientHeight - headDialogs.offsetHeight - 4;parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hFooter'));
    if (videoBlock.style.display=='block') {
        // Если отображение экрана - убрать панель и левый блок
        if (screenBlock.style.display == 'block') {
            var sc = true;
            if (panelVisible) dialogVisible(false);
            if (leftBlockVisible) leftBlockSwith(false);
        } else sc = false;
        // Расчитываем размеры
        var hwYa = (localVideo.style.display == 'none') ? localFoto.scrollHeight / localFoto.scrollWidth :
            (localVideo.scrollHeight / localVideo.scrollWidth);
        var hwHe = (talkUsers[0].video.style.display == 'none') ?
            talkUsers[0].fotoBlock.scrollHeight / talkUsers[0].fotoBlock.scrollWidth :
            (talkUsers[0].video.scrollHeight / talkUsers[0].video.scrollWidth);
        var w = document.body.clientWidth;
        var w0 = leftBlockVisible ? w - wLeft : w;
        // Если убран низ и не отображен экран - возможно в две строки
        // Определяем количество видео строк
        var countStr = 1;
        if (!sc && !panelVisible) {
            // Расчитаем максимальную ширину при отображении в две строки:
            var w1 = (h - 50) / (hwYa + hwHe)
            if (w1 > w0 / 2) countStr = 2;
        }
        if (countStr == 2) {
            localVideoBlock.style.width = w1 + 'px';
            talkUsers[0].videoBlock.style.width = w1 + 'px';
        }
        else {
            localVideoBlock.style.width = '';
            talkUsers[0].videoBlock.style.width = '';
        }

        // расчитываем реальный размер видеоблока
        if (panelVisible && ( h - hPanelMin < w0 / 4)) dialogVisible(false);
        if (panelVisible) {
            w1 = w0 / 2 - 1;
            var hV = Math.max(hwHe, hwYa) * w1 + 24;
            if (hV + hPanelMin > h) {
                hV = h - hPanelMin;
                var hP = hPanelMin;
            } else {
                hP = h-hV;
            }
        } else {
            hV = h;
            hP = 0;
        }
    } else {
        hV = 0;
        hP = h;
    }
    document.documentElement.style.setProperty('--hPanel', hP + 'px');
    curUser.panel.querySelector('.dialogs').style.height = (hP -
        curUser.panel.querySelector('.textareaBlock').offsetHeight - 24) + 'px';
}

//*************     Видео-блок     *****************
navigator.mediaDevices.ondevicechange = mediaDeviceDefine;
// определение наличия медиа-устройств
function mediaDeviceDefine(e) {
    var setup = (typeof e === 'boolean') ? e : false;
    var videoIn = 0, audioIn = 0, audioOut = 0;
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        isMediaDevice = {audio: false, video: false};
        dialogsFone.style.display = 'none';
        dialogsVideo.style.display = 'none';
        if (setup) mediaDevice={audio:false, video: false};
    } else {
        removeChildren(videoinput);
        removeChildren(audioinput);
        removeChildren(audiooutput);
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                devices.forEach(function (device) {
                    var elem = document.createElement('option');
                    elem.value = device.deviceId;
                    if (device.kind == 'videoinput') {
                        videoIn++;
                        elem.textContent = !device.label ? 'камера '+ videoIn : device.label;
                        if (settings.videoId==device.deviceId) elem.selected=true;
                        videoinput.appendChild(elem);
                    }
                    else if (device.kind == 'audioinput') {
                        audioIn++;
                        elem.textContent = !device.label ? 'микрофон '+ audioIn : device.label;
                        if (settings.audioId==device.deviceId) elem.selected=true;
                        audioinput.appendChild(elem);
                    }
                    else if (device.kind == 'audiooutput') {
                        audioOut++;
                        elem.textContent = !device.label ? 'динамик '+ audioOut : device.label;
                        audiooutput.appendChild(elem);
                    }
                });
                if (audioIn >0) settings.audioId = audioinput.value;
                if (videoIn >0) settings.videoId = videoinput.value;
                if (audioIn === 0) {
                    //Общение не возможно
                    dialogsFone.style.display = 'none';
                    dialogsVideo.style.display = 'none';
                    isMediaDevice = {audio: false, video: false};
                    if (setup) mediaDevice={audio:false, video: false};
                } else if (videoIn === 0) {
                    dialogsVideo.style.display = 'none';
                    isMediaDevice = {audio: true, video: false};
                    if (setup) mediaDevice={audio:true, video: false};
                } else {
                    isMediaDevice = {audio: true, video: true};
                    if (setup) mediaDevice={audio:true, video: true};
                }
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
                isMediaDevice = {audio: false, video: false};
                dialogsFone.style.display = 'none';
                dialogsVideo.style.display = 'none';
                if (setup) mediaDevice={audio:false, video: false};
            });
    }
}
// нажата кнопка видео или микрофон
dialogsVideo.onclick = dialogsFone.onclick = function(e) {
    // определяем используемые медиа-устройства и потребность их подключения
    var isVideo = false;
    if (e.target == dialogsVideo || e.target.parentElement == dialogsVideo) isVideo = true;

    /*mediaDeviceDefine();*/
    if (!isMediaDevice.audio) return;
    else {
        isMediaDevice.audio= {
            autoGainControl: document.getElementById('autoGainControl').checked,
            echoCancellation: document.getElementById('echoCancellation').checked,
            noiseSuppression: document.getElementById('noiseSuppression').checked
        }
        if ('audioId' in settings && settings.audioId) isMediaDevice.audio.deviceId = settings.audioId;
    }
    if (isMediaDevice.video) {
        isMediaDevice.video = {width: {ideal: settings.videoWidth}, height: {ideal: settings.videoHeight}};
        if ('videoId' in settings && settings.videoId) isMediaDevice.video.deviceId = settings.videoId;
        mediaDevice = isVideo ? {audio: true, video: true} : {audio: true, video: false};
    } else {
        if (isVideo) return;
        mediaDevice = {audio: true, video: false};
    }

    if (localVideoStream && localVideoStream.active) {
        var mTrack = localVideoStream.getTracks();
        mTrack.forEach(function (track) {
            if (track.kind === 'audio' || mediaDevice.video) {
                track.enabled = true;
            }
        });
        if (talkState == 'none') toCall(isVideo);      // Беседы нет - звоним
        else answerCall();                      // Идет звонок - отвечаем на звонок

    } else {
        // Запрашиваем устройства для использования, если они не предаставлены - звонить не будем
        if (!isVideo && !settings.queryVideoDevice) {
            var videoValue=isMediaDevice.video;
            isMediaDevice.video = false;
        }

        navigator.mediaDevices.getUserMedia(isMediaDevice)
            .then(function (stream) {
                localVideoStream = stream;
                // Если получен видеосигнал, а он не требуется - деактивируем его
                if (!isVideo) {
                    if (settings.queryVideoDevice) {
                        localVideoStream.getVideoTracks().forEach(function (track) {
                            track.enabled = false;
                        });
                    } else {
                        isMediaDevice.video = videoValue;
                    }
                }

                localVideo.srcObject = localVideoStream;
                localVideo.volume = 0;
                localVideo.muted = true;
                if (talkState == 'none') toCall(isVideo);
                else answerCall(isVideo);
            })
            .catch(function (err) {
                var errtxt = 'Ошибка при подключении медиа-устройств: ' +
                    ('code' in err ? 'код: ' + err.code+', ' : '') + err.message +
                    ('fileName' in err ? "\n file: "+ err.fileName : '') +
                    ('lineNumber' in err ? ", line:" + err.lineNumber : '')+
                    ('name' in err ? ', name: '+ err.name: '');
                console.log(errtxt);
                localVideoStream = null;
                showMessage(errtxt,'Ошибка подключения медиа-устройства');
            });
    }

};
// Звоним для беседы
function toCall(isVideo) {
    // отправляется запрос на звонок с регистрацией звонка в сообщениях,
    wsSend({idUser: curUser.idUser, command: 'Звонок',isVideo: isVideo, users:
        [{idUser: idUser, name: user.name, fullName: user.fullName, foto: user.foto}]});
    console.log("Отправлена команда Звонок");
    talkUsers.push(curUser);
    talkIdUser = curUser.idUser;
    // формируем список абонентов для беседы
    prepareTalk('image/bellEcho.mp3',0.33);   // подготовляваемся у беседе
    talkState = 'connect';                              // переходим в режим соединения
    dialogsVideo.style.display = 'none';
    dialogsFone.style.display = 'none';
    dialogsVideoSwitch.style.display = 'inline-block';
    dialogsFoneSwitch.style.display = 'inline-block';
}
// Обработка запроса - поступил звонок
function commandBell(q) {
    console.log("Поступила команда Звонок");
    // проверяем сейчас уже есть звонок или уже идет беседа - пока запрещаем
    if (talkState != 'none') {
        wsSend({idUser: q.idUser, command: 'Занято'});
        return;
    } else if (!isMediaDevice.audio) {
        wsSend({idUser: q.idUser, command: 'Сброс'});
        return;
    }
    talkUsers = q.users;
    talkIdUser = q.idUser;
    talkState = 'bell';
    talkMediaDevice = {audio: true, video: q.isVideo};
    prepareTalk('image/bell.mp3')
}
// Отображение видеоблока, звучание музыки
function prepareTalk(ringtone, volume) {
    if (!ringtone) ringtone = 'image/bell.mp3';

    // появляютс окна: его окно (или их) с фото
    for (var i=0; i < talkUsers.length; i++) {
        talkUsers[i].videoBlock = localVideoBlock.cloneNode(true);
        talkUsers[i].videoBlock.querySelector('.videoHeadTxt').textContent = talkUsers[i].fullName;
        talkUsers[i].fotoBlock = talkUsers[i].videoBlock.children[1];
        talkUsers[i].fotoBlock.src = talkUsers[i].foto;
        talkUsers[i].fotoBlock.style.display = 'block';
        talkUsers[i].video = talkUsers[i].videoBlock.children[2];
        talkUsers[i].video.style.display = 'none';
        //talkUsers[i].video.src = '';
        //videoBlock.appendChild(talkUsers[i].videoBlock);
        videoBlock.insertBefore(talkUsers[i].videoBlock,localVideoBlock);
    }
    // и мое окно видео или фото
    if (mediaDevice.video == false) {
        localVideo.style.display = 'none';
        localFoto.style.display = 'block';
        localVideoBlock.children[0].querySelector('.imgVideo').src='image/eyeClose.png';
        dialogsVideoSwitch.children[0].src='image/cameraOff.png';
    } else {
        if (localVideo.srcObject){
            if (localVideo.srcObject.active) {
                localVideo.style.display = 'block';
                localFoto.style.display = 'none';
            } else {
                localVideo.style.display = 'none';
                localFoto.style.display = 'block';
            }
        } else if (localVideoStream) {
            localVideo.style.display = 'block';
            localFoto.style.display = 'none';
            localVideo.srcObject = localVideoStream;
        } else {
            localVideo.style.display = 'none';
            localFoto.style.display = 'block';
        }
    }
    videoBlock.style.display='block';
    dialogHideShow.style.display='inline-block';
    resize();
    //сверху колеблется звонок
    localVideoBlock.insertAdjacentHTML('beforeend',
        '<img src="image/bell.gif" class="bellImage">');
    // звучит рингтон
    bell.src=ringtone;
    bell.play();
    if (volume) bell.volume = volume;
    else bell.volume = 1;
    // актиаируются кнопки видео и микрофон
    buttonVideoFone(true);
    // появляется кнопка "Положить трубку"
    dialogsClose.style.display ='inline-block';
    dialogsClose.style.cursor = 'pointer';
    if ('getDisplayMedia' in navigator.mediaDevices) {
        screenDemo.style.display ='inline-block';
        screenDemo.children[0].src='image/screenYes.png';
    }
}
// подняли трубку при звонке
function answerCall(isVideo) {
    // отправляется запрос на соединение
    wsSend({idUser: talkIdUser, command: 'Подключение', isVideo: isVideo});
    console.log("Отправлена команда Подключение");
    // Ищем данного пользователя в списке и если находим - делаем его текущим
    if (talkIdUser != curUser.idUser) {
        for (var i=0; i<users.length; i++) {
            if (talkIdUser == users[i].idUser) {
                pressUserDialog(i);
                break;
            }
        }
    }
    // Если нажата видео: отключаем фото, включаем видео:
    if (mediaDevice.video != false && localVideoStream) {
        localFoto.style.display = 'none';
        localVideo.style.display = 'block';
        localVideo.srcObject = localVideoStream;
    } else {
        dialogsVideoSwitch.querySelector('img').src='image/cameraOff.png';
        localVideoBlock.children[0].querySelector('.imgVideo').src='image/eyeClose.png';
    }
    // подготовка соединения
    peerConnection();
    // Отключить звонок и убираем колокольчики
    bell.pause();  // Отключаем
    localVideoBlock.querySelector('.bellImage').remove();
    //dialogsVideo.style.backgroundColor='rgba(20,255,155,0.3)';
    //dialogsFone.style.backgroundColor='rgba(125,255,200,0.5)';
}
// Обработка команды  Подключение
function commandConnection(q) {
    console.log("Поступила команда подключение");
    // включается тайм-аут ожидания соединения
    // подготовка соединения
    talkMediaDevice.video = q.isVideo;    // false - нет видио,  может быть свойства видео
    peerConnection();
    // Отключить звонок и убираем колокольчики
    bell.pause();
    localVideoBlock.querySelector('.bellImage').remove();
    // Создаем предложение Offer и отправляем собеседнику
    createAndSendOffer();
}
// Отключение / включение видео
dialogsVideoSwitch.onclick = function() {
    // отключается канал передачи видео, изображение Видео перечеркивается, отображается фото
    // при повторном нажатии - все возобнавляется
    var mtrack = localVideoStream.getVideoTracks();
    if (mtrack.length > 0) {
        if (mtrack[0].enabled) {
            dialogsVideoSwitch.querySelector('img').src = 'image/cameraOff.png';
            localVideoBlock.children[0].querySelector('.imgVideo').src = 'image/eyeClose.png';
            localVideo.style.display='none';
            localFoto.style.display='block';
            wsSend({idUser: talkIdUser, command: 'Устройство', video: false});
        } else {
            dialogsVideoSwitch.querySelector('img').src = 'image/cameraOn.png';
            localFoto.style.display='none';
            localVideo.style.display='block';
            wsSend({idUser: talkIdUser, command: 'Устройство', video: true});
            localVideoBlock.children[0].querySelector('.imgVideo').src = 'image/eyeOpen.png';
        }
        for (var i=0; i < mtrack.length; i++) {
            mtrack[i].enabled = !mtrack[i].enabled;
        }
    }
}
// Отключение, включение микрофона
dialogsFoneSwitch.onclick = function () {
    var mtrack = localVideoStream.getAudioTracks();
    if (mtrack[0].enabled) {
        dialogsFoneSwitch.querySelector('img').src = 'image/phoneOff.png';
        wsSend({idUser: talkIdUser, command: 'Устройство', audio: false});
        localVideoBlock.children[0].querySelector('.imgAudio').src = 'image/soundOff.png';
    }
    else {
        dialogsFoneSwitch.querySelector('img').src = 'image/phoneOn.png';
        wsSend({idUser: talkIdUser, command:  'Устройство', audio: true});
        localVideoBlock.children[0].querySelector('.imgAudio').src = 'image/soundOn.png';
    }
    if (mtrack.length > 0) {
        for (var i=0; i < mtrack.length; i++) {
            mtrack[i].enabled = !mtrack[i].enabled;
        }
    }
}

function peerConnection() {
    peerConn = new RTCPeerConnection(peerConnCfg);
    // отправлять любые ice Кандидаты другому партнеру
    peerConn.onicecandidate = onIceCandidateHandler;
    // как только удаленный поток прибывает, покажите это в удаленном элементе видео
    peerConn.ontrack = onAddStreamHandler;
        // полученыый локальный поток отправить
    //peerConn.addStream(localVideoStream);
    var tracks = localVideoStream.getTracks();
    tracks.forEach(function (track) {
        peerConn.addTrack(track, localVideoStream);
    });
}
// отправляем ice candidate собеседнику
function onIceCandidateHandler(evt) {
    console.log('onIceCandidateHandler: отправляем ice candidate собеседнику');
    if (!evt || !evt.candidate) return;
    wsSend({idUser: talkIdUser, candidate: evt.candidate });
}
// Добавить обработчик потока
function onAddStreamHandler(evt) {
    // как только удаленный поток прибывает, покажите это в удаленном элементе видео
    console.log('onAddStreamHandler: пришел поток от собеседника - отображаем в окне');
    // Если есть видео: Убираем фото
    if (talkMediaDevice.video) {
        talkUsers[0].fotoBlock.style.display = 'none';
        // установить удаленный видеопоток в качестве источника для удаленного элемента HTML5 видео
        talkUsers[0].video.style.display = "block";
    } else {
        // видео нет - закрываем глазки
        talkUsers[0].videoBlock.querySelector('.imgVideo').src='image/eyeClose.png';
    }
    talkUsers[0].streams = evt.streams;
    talkUsers[0].video.srcObject = evt.streams[0];
    talkUsers[0].video.volume = 1;
    talkState = 'active';
    dialogsVideo.style.display = 'none';
    dialogsFone.style.display = 'none';
    dialogsVideoSwitch.style.display = 'inline-block';
    dialogsFoneSwitch.style.display = 'inline-block';
    if ('getDisplayMedia' in navigator.mediaDevices) {
        screenDemo.style.display ='inline-block';
        screenDemo.children[0].src='image/screenYes.png';
    }
}
// Обработка команды Предложение3
function commandOffer(q) {
    console.log("Получил SDP Offer от демонстратора.");
    peerConn.setRemoteDescription(q.sdp)
        .then(function() {
            console.log('setRemoteDescription complete');
            console.log('pc2 createAnswer start');
            return peerConn.createAnswer()
        })
        .then(function (desc) {
            console.log('pc2 setLocalDescription start');
            wsSend({idUser: talkIdUser, command: 'Ответ', sdp: desc});
            peerConn.setLocalDescription(desc);
        })
        .catch(function (error) {console/log('Ошибка настройки обмена на стороне зрителя: ' + error.toString())
        });
}
// создать и отправить предложение
function createAndSendOffer() {
    peerConn.createOffer().then(function(offer) {
        return peerConn.setLocalDescription(offer);
    })
        .then(function() {
            wsSend({idUser: talkIdUser, sdp: peerConn.localDescription, command: 'Предложение'});
            console.log("Отправлена команда Предложение");
        })
        .catch(function (err) {
            var errtxt = 'Ошибка при создании и отправке предложения: ' +
                ('code' in err ? 'код: ' + err.code+', ' : '') + err.message +
                ('fileName' in err ? "\n file: "+ err.fileName : '') +
                ('lineNumber' in err ? ", line:" + err.lineNumber : '')+
                ('name' in err ? ', name: '+ err.name: '');
            console.log(errtxt);
        });
}
// Обработка команды Ответ
function commandAnswer(q) {
    console.log("Получил sdp Answer от удаленного партнера.");
    peerConn.setRemoteDescription(q.sdp); //(new RTCSessionDescription(q.sdp));
}
//Нажата кнопка положить трубку
dialogsClose.onclick = function (ev) {
    //отправляется запрос на отказ от соединения
    wsSend({idUser: talkIdUser, command: 'Сброс'});
    endCall();
};
// Обработка команды положить трубку
function endCall() {
    // Если была связь - завершается
    if (peerConn) {
        peerConn.close();
        peerConn = null;
    }
    bell.pause();
    bell.src='';
    // Если был звонок или шло соединение - убирается звонок
    if (talkState === 'bell' || talkState === 'connect') {
        // Отключить звонок и убираем колокольчики
        var bellImage =localVideoBlock.querySelector('.bellImage');
        if (bellImage) bellImage.remove();
    }
    // убираются окна, регистрируется отказ
    videoBlock.style.display = 'none';
    for (var i=0; i < talkUsers.length; i++) talkUsers[i].videoBlock.remove();
    localVideo.style.display = 'none';
    localFoto.style.display = 'none';
    // спрятать кнопку положить трубку
    dialogsClose.style.display = 'none';

    // определить состояние - нет беседы
    talkState = 'none';
    dialogsVideo.style.display = 'inline-block';
    dialogsFone.style.display = 'inline-block';;
    dialogsVideoSwitch.style.display = 'none';
    dialogsVideoSwitch.querySelector('img').src = 'image/cameraOn.png';
    localVideoBlock.children[0].querySelector('.imgVideo').src='image/eyeOpen.png';
    dialogsFoneSwitch.style.display = 'none';
    dialogsFoneSwitch.querySelector('img').src = 'image/phoneOn.png';
    localVideoBlock.children[0].querySelector('.imgAudio').src = 'image/soundOn.png';
    screenDemo.style.display = 'none';
    if (screenDemo.children[0].src.substr(-6,2) === 'No') screenDemoRemove();
    talkUsers = [];
    talkIdUser = null;

    if (localVideoStream) {
        if (settings.freeDevices) {
            localVideoStream.getTracks().forEach(function (track) {
                track.stop();
            });
            localVideoStream = null;
            localVideo.srcObject = null;
        } else {
            localVideoStream.getTracks().forEach(function (track) {
                track.enabled = false;
            });
        }
    }
    buttonVideoFone(curUser.online);
    dialogVisible(true);
    dialogHideShow.style.display='none';
    //resize();
}
// Активация / деактивация кнопок Видео и микрофон
function buttonVideoFone(online) {
    if (online) {
        dialogsVideo.disabled = false;
        dialogsFone.disabled = false;
        exchangeKey.disabled = false;
        dialogsVideo.style.cursor = 'pointer';
        dialogsFone.style.cursor = 'pointer';
        exchangeKey.style.cursor = 'pointer';
    } else {
        dialogsVideo.disabled = true;
        dialogsFone.disabled = true;
        exchangeKey.disabled = true;
        dialogsVideo.style.cursor = 'default';
        dialogsFone.style.cursor = 'default';
        exchangeKey.style.cursor = 'default';
    }
}
// Обработка команды Устройство: - активация / деактивация видео и микрофона собеседника
function medioDeviceEx(q) {
    for (var i=0; i<talkUsers.length; i++) {
        if (q.idUser === talkUsers[i].idUser) {
            var cur = talkUsers[i];
            if ('video' in q) {
                if (q.video) {
                    cur.fotoBlock.style.display='none';
                    cur.video.style.display='block';
                    cur.videoBlock.children[0].querySelector('.imgVideo').src='image/eyeOpen.png';

                } else {
                    cur.video.style.display='none';
                    cur.fotoBlock.style.display='block';
                    cur.videoBlock.children[0].querySelector('.imgVideo').src='image/eyeClose.png';
                }
            }
            else if ('audio' in q) {
                if (q.audio) {
                    cur.videoBlock.children[0].querySelector('.imgAudio').src='image/soundOn.png';
                } else {
                    cur.videoBlock.children[0].querySelector('.imgAudio').src='image/soundOff.png';
                }
            }
            return;
        }
    }
}

/********************** Демонстрация экрана **********************/
screenDemo.onclick = function(ev) {
    if (screenDemo.children[0].src.substr(-6,2) === 'No') screenDemoRemove();
    else screenDemoAdd();
};

function screenDemoRemove(){
    console.log('Нажата клавиша Завершить демонстрация экрана');
    wsSend({idUser: talkIdUser, command: 'Сброс2'});
    console.log('Отправлена команда Сброс 2');
    pcIn.close();
    pcIn=null;
    screenDemo.children[0].src='image/screenYes.png';
    screenVideoStream = null;
}
function screenDemoEnd() {
    console.log('Порлучена команда Сброс 2');

    screen.srcObject = null;
    screenBlock.style.display='none';
    resize();
    try {
        pcIn=close();
    } catch (err) {
        console.log(err)
    }
    pcIn=null;
}

function screenDemoAdd() {
    console.log('Нажата клавиша Начать демонстрацию экрана');
    navigator.mediaDevices.getDisplayMedia({video: {cursor: 'motion', displaySurface: 'application'}})
        .then(function (stream) {
            screenVideoStream = stream;
            var track = screenVideoStream.getVideoTracks()[0];
            pcIn = new RTCPeerConnection(peerConnCfg);
            pcIn.onicecandidate = onIceCandidate;
            pcIn.addTrack(track, screenVideoStream);
            screenDemo.children[0].src = 'image/screenNo.png';
            console.log('Определен peer демонстратора');
            pcIn.createOffer({offerToReceiveAudio: 0, offerToReceiveVideo: 1})
                .then(function (offer) {
                    return pcIn.setLocalDescription(offer);
                })
                .then(function () {
                    wsSend({idUser: talkIdUser, sdp: pcIn.localDescription, command: 'Предложение2'});
                    console.log("Отправлена команда Предложение2");
                })
                .catch(function (err) {
                    console("Ошибка createOffer: ", err);
                });
        })

        .catch(function (err) {
            var errtxt = 'Ошибка при подключении медиа-устройств: ' +
                ('code' in err ? 'код: ' + err.code + ', ' : '') + err.message +
                ('fileName' in err ? "\n file: " + err.fileName : '') +
                ('lineNumber' in err ? ", line:" + err.lineNumber : '') +
                ('name' in err ? ', name: ' + err.name : '');
            console.log(errtxt);
            screenVideoStream = null;
            showMessage(errtxt, 'Ошибка подключения видео экрана');
        });
}
// отправляем ice candidate собеседнику
function onIceCandidate(evt) {
    //console.log('onIceCandidate: отправляем ice candidate2 собеседнику')
    if (!evt || !evt.candidate) return;
    wsSend({idUser: talkIdUser, candidate2: evt.candidate });
}
// Обработка команды Предложение2
function command2Offer(q) {
    console.log("Получил SDP 2 Offer от демонстратора.");
    pcIn = new RTCPeerConnection(peerConnCfg);
    pcIn.onicecandidate = onIceCandidate;
    pcIn.ontrack = function (evt) {
        screen.srcObject = evt.streams[0];
        screenBlock.style.display = 'block';
        dialogHideShow.style.display = 'inline-block';
        resize();
        screen.play();
    };
    //console.log('Определен peer зрителя')
    pcIn.setRemoteDescription(q.sdp)
        .then(function() {
            console.log('setRemoteDescription complete');
            console.log('pc2 createAnswer start');
            return pcIn.createAnswer()
        })
        .then(function (desc) {
            console.log('pc2 setLocalDescription start');
            wsSend({idUser: talkIdUser, command: 'Ответ2', sdp: desc});
            pcIn.setLocalDescription(desc);
        })
        .catch(function (error) {console/log('Ошибка настройки обмена на стороне зрителя: ' + error.toString())
        });
}
// Обработка команды Ответ2
function command2Answer(q) {
    console.log("Получил sdp Answer от удаленного партнера.");
    pcIn.setRemoteDescription(new RTCSessionDescription(q.sdp));
}
// Спрятать - показать контакты
columnShift.onclick = leftBlockSwith;
function leftBlockSwith(ev) {
    if (typeof ev == 'boolean') var online = true;
    else if (ev) online = !leftBlockVisible;
    else online = leftBlockVisible;

    var leftBlock = document.querySelector('.winSoftLeft').style;
    if (online) {
        document.documentElement.style.setProperty('--wLeft', wLeft+'px');
        leftBlock.display = 'inline-block';
        columnShift.children[0].src='image/columnLeft.png';
    } else {
        document.documentElement.style.setProperty('--wLeft', '0px');
        leftBlock.display = 'none';
        columnShift.children[0].src='image/columnRight.png';
    }
    leftBlockVisible = online;
    /*
    if (leftBlock.display === "none") {
        document.documentElement.style.setProperty('--wLeft', wLeft);
        leftBlock.display = 'inline-block';
        columnShift.children[0].src='image/columnLeft.png';
    } else {
        wLeft = getComputedStyle(document.documentElement).getPropertyValue('--wLeft');
        document.documentElement.style.setProperty('--wLeft', '0px');
        leftBlock.display = 'none';
        columnShift.children[0].src='image/columnRight.png';
    }*/
};
// Спратать - показать диалоги
dialogHideShow.onclick = dialogVisible;
// Прячет (false) / показывает (true), восстанавливает состояние (null || undefained)
// меняет на противоположное (остальное) отображение панели диалога с контактным лицом:
function dialogVisible(e) {
    var img = dialogHideShow.querySelector('img');
    if (typeof e == 'boolean') var set = e;
    else if (e) set =  !panelVisible;
    else set = panelVisible;
    if (set) {
        curUser.panel.style.display='block';
        img.src="image/dialogHide.png"
        panelVisible=true;
    } else {
        curUser.panel.style.display='none';
        img.src="image/dialogShow.png"
        panelVisible=false;
    }
    resize();
}
// изменение разрешения видео
function setResolution(value) {
    var pos = value.indexOf('x');
    if (value == settings.videoFormat) return;
    settings.videoWidth = value.substr(0,pos) - 0; //Разрешение - ширина
    settings.videoHeight = value.substr(pos+1) - 0;  //Разрешение - высота
    document.getElementById(settings.videoFormat).style.backgroundColor = '';
    settings.videoFormat = value;
    document.getElementById(settings.videoFormat).style.backgroundColor ='#11eeff';
    if (!localVideoStream) {
        settingFinish('videoFormat');
        return false;
    }
    var tracks = localVideoStream.getVideoTracks();
    if (tracks.length === 0) {
        settingFinish('videoFormat');
        return false;
    }

    tracks[0].applyConstraints({
        width: {ideal: settings.videoWidth},
        height: {ideal: settings.videoHeight}
    })
        .then(function () {
            settingFinish('videoFormat');
            setTimeout(function() {
                localVideoBlock.querySelector('.imgVideo').title = localVideo.videoWidth + 'x' + localVideo.videoHeight;
            },1000);

        })
        .catch(function (err) {
            console.log('applyConstraints: ', err.name)
        });
 }
// установка подсказки видеорежима на картинке "глаз"
function onResolution(ev) {
    var video = ev.target.parentElement.parentElement.querySelector('video');
    ev.target.title = video.videoWidth + 'x' + video.videoHeight;
    return false;
}

/*******************               Переслать файлы            **********************/
const exchangeKey = document.getElementById('exchangeKey');
const exchangeBlock = document.getElementById('exchangeBlock');
const countUpload = document.getElementById('countUpload');
const countDownload = document.getElementById('countDownload');
const countMessage = document.getElementById('countMessage');
const sendListFile = document.getElementById('sendListFile');
const labelFile = document.getElementById('labelFile');
const sendFileInput = document.getElementById('sendFileInput');
const countSendFiles = document.getElementById('countSendFiles');
const appendElement = document.getElementById('appendElement');
const receiveCut = document.getElementById('receiveCut');
const receiveListFile = document.getElementById('receiveListFile');
const countReceiveFiles = document.getElementById('countReceiveFiles');
const messengerList     = document.getElementById('messengerList');
const myMessage     = document.getElementById('myMessage');

var sendIdUser = null;      // Пользователь по обмену данными
var sendUser = null;        //
var sendPC = null;          // Peer для передачи данных
var sendChannel = null;     // Канал передачи данных
var sendFile = null;        // Передаваемый файл {name, size, offset}
var sendFilesAll = null;     // При передаче всех файлов - текущий номер в списке
var receiveFile = null;     // Принимаемый файл {name, size, offset}
var sizeSendBlock = 16384;  //131072; // Размер блока передаваемых данных
var receiveElement = null;

// Отобразить форму пересылки файлов
exchangeKey.onclick = function () {

    if (sendIdUser && sendPC) {
        modalShow(exchangeBlock);
        return;
    }else if (sendUser && talkIdUser && sendUser.idUser == talkIdUser) {
        sendIdUser = talkIdUser;
    }else if (sendUser && sendUser.idUser == curUser.idUser) {
        sendIdUser = curUser.idUser;
    } else {
        if (talkIdUser) {
            sendIdUser = talkIdUser;
            sendUser = talkUsers[0];
        } else {
            sendIdUser = curUser.idUser;
            sendUser = curUser;
        }
        exchangeBlock.firstElementChild.querySelector('div').textContent = sendUser.fullName +' - обмен данными';
        var l=sendListFile.children.length-1;
        for (var i=l; l>0; l--) {
            sendListFile.children[i].remove();
        }

        var l=receiveListFile.children.length-1;
        for (var i=l; l>0; l--) {
            receiveListFile.children[i].remove();
        }

    }
    createSendPC();
};
document.getElementById('exchangeHide').onclick = function() {
    modalClean(exchangeBlock);
}
document.getElementById('exchangeExit').onclick = function (ev) {
    wsSend({idUser: sendIdUser, command: 'СбросОбмен'}) ;
    exchangeClose();
}

// Управление вкладками
document.getElementById('sendFileCut').onclick = function (ev) {
    if (document.getElementById('sendFileCut').style.borderStyle !== 'inset') {
        document.getElementById('sendFileCut').style.borderStyle = 'inset';
        document.getElementById('receiveFileCut').style.borderStyle = 'outset';
        document.getElementById('receiveCut').style.display = 'none';
        document.getElementById('messengerCut').style.borderStyle = 'outset';
        document.getElementById('messengerSec').style.display = 'none';
        document.getElementById('sendCut').style.display = 'block';
    }
}

document.getElementById('receiveFileCut').onclick = receiveCutOnline;
function receiveCutOnline() {
    if (document.getElementById('receiveFileCut').style.borderStyle !== 'inset') {
        document.getElementById('receiveFileCut').style.borderStyle = 'inset';
        document.getElementById('sendFileCut').style.borderStyle = 'outset';
        document.getElementById('sendCut').style.display = 'none';
        document.getElementById('messengerCut').style.borderStyle = 'outset';
        document.getElementById('messengerSec').style.display = 'none';
        document.getElementById('receiveCut').style.display = 'block';
    }
}

document.getElementById('messengerCut').onclick = function () {
    if (document.getElementById('messengerCut').style.borderStyle !== 'inset') {
        document.getElementById('sendFileCut').style.borderStyle = 'outset';
        document.getElementById('sendCut').style.display = 'none';
        document.getElementById('receiveFileCut').style.borderStyle = 'outset';
        document.getElementById('receiveCut').style.display = 'none';
        document.getElementById('messengerCut').style.borderStyle = 'inset';
        document.getElementById('messengerSec').style.display = 'block';
        if (document.getElementById('messengerCut').children[0].textContent != '0')
        setTimeout(clearCountMessage,5000);
    }
}

function clearCountMessage() {
    document.getElementById('messengerCut').children[0].textContent='0';
}

// Запретим сбрасывать файлы на документ
document.body.ondragover = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
    e.dataTransfer.effectAllowed = 'none';
    return false;
};
document.body.ondrop = function (e) {
    e.stopPropagation();
    e.preventDefault();
    return false
};
// Разрешим перетаскивать и сбрасывать файлы во внутрь элемента labelFile
labelFile.ondragover = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('Files', e.dataTransfer.files);
    return false;
};
// укладка перетаскиваемых файлов для отправки
labelFile.ondrop = function (e) {
    e.stopPropagation();
    e.preventDefault();
    loadListFiles(e.dataTransfer.files);
    return false;
};
// выбор файлов для отправки
sendFileInput.onchange = function (e) {
    loadListFiles(sendFileInput.files);
    sendFileInput.files = null;
};
// загрузка файлов в список для отправки
function loadListFiles(files){
    var liClone = sendListFile.children[0];
    for (var i=0; i<files.length; i++){
        var file = files[i];
        var li = liClone.cloneNode(true);
        li.style.display = 'block';
        li.file=file;
        li.children[0].title = 'отправить: ' + file.name;
        li.children[0].textContent = file.name;
        li.children[0].onclick = fileSendStart;
        li.children[1].onclick = fileSendClear;
        sendListFile.appendChild(li);
        countSendFiles.textContent ++;
        countUpload.textContent ++;
    }
}
// удаление строки в списке выбранных для отправки файлов
function fileSendClear(e) {
    if (e.target.textContent == '×') countUpload.textContent --;
    e.target.parentElement.remove();
    countSendFiles.textContent --;
    sendFile = null;
    return false;
}
// Удаление всех строк выбранных для отправки файлов
document.getElementById('clearFilesButton').onclick = function() {
    removeChildren(sendListFile,1);
    sendFile = null;
    countUpload.textContent = '0';
    countSendFiles.textContent = '0';
};
// Единичный запуск передачи файла
function fileSendStart(e) {
    sendFile = e.target.parentElement;
    fileSend();
    /*if (sendPC) {
        if (sendChannel.readyState == 'open') fileSend();
        else sendChannel = sendPC.createDataChannel('dataChannel');
    }*/
}
sendFilesButton.onclick = sendAllFiles;
function sendAllFiles() {
    var l = sendListFile.children.length;
    sendFilesAll = 1;
    sendFile = newLoadFile();
    if (sendFile){
        fileSend();
    }
}
// Создание канала связи на стороне отправителя
function createSendPC() {
    try {
        sendPC = new RTCPeerConnection();
        sendChannel = sendPC.createDataChannel('dataChannel');
        sendChannel.binaryType = 'arraybuffer';
        sendChannel.onopen = onOpenDataChanel;
        sendChannel.onclose = onCloseDataChanel;
        sendChannel.onerror = function(error) {console.error('Error in sendChannel:', error)};
        sendPC.onicecandidate = onSendIceCandidate;
        sendChannel.onmessage = onReceiveMessage;
    } catch (err) {
        console.log("Ошибка соединения: ", err);
        showMessage('Ошибка соединения: '+ err.message,'Ошибка соединения')
        exchangeClose();
    }
    sendPC.createOffer()
        .then(function (offer) {
            return sendPC.setLocalDescription(offer);
        })
        .then(function () {
            wsSend({idUser: sendIdUser, sdp: sendPC.localDescription, command: 'ПредложениеSend'});
            console.log("Отправлена команда ПредложениеSend");
        })
        .catch(function (err) {
            console.log("Ошибка createOffer: ", err);
            showMessage('Ошибка соединения: '+ err.message,'Ошибка соединения')
            exchangeClose();
        });
}
// Обработка получателем команды Предложение
function sendCommandOffer(q) {
    console.log("Получил SDP Offer от отправителя");
    try {
        sendIdUser = q.idUser;
        if(sendIdUser == talkIdUser) sendUser = talkUsers[0];
        else if(sendIdUser == curUser.idUser) sendUser = curUser;
        else {
            sendUser = {idUser: sendIdUser, fullName: 'anonim', name: 'anonim'};
            for (var i=0;i < users.length; i++) {
                if(sendIdUser == users[i].idUser) {
                    sendUser=users[i];
                    break;
                }
            }
        }
        exchangeBlock.firstElementChild.querySelector('div').textContent = sendUser.fullName + ' - обмен данными';
        sendPC = new RTCPeerConnection();
        sendPC.onicecandidate = onSendIceCandidate;
        sendPC.addEventListener('datachannel', onDataChannel);
        console.log('Определен peer получателя')
    } catch (err){
        wsSend({idUser: sendIdUser, command: 'СбросОбмен', comment: err.message}) ;
        console.log("Ошибка соединения: ", err);
        exchangeClose();
    }
    sendPC.setRemoteDescription(q.sdp)
        .then(function() {
            console.log('setRemoteDescription получателя complete');
            return sendPC.createAnswer();
        })
        .then(function (desc) {
            console.log('setLocalDescription получателя start');
            wsSend({idUser: sendIdUser, command: 'ОтветSend', sdp: desc});
            sendPC.setLocalDescription(desc);
        })
        .catch(function (err) {
            wsSend({idUser: sendIdUser, command: 'СбросОбмен', comment: err.message}) ;
            console.log('Ошибка настройки обмена: ', error);
            exchangeClose();
        });
}
// Обработка события ondatachannel на стороне получателя
function onDataChannel(e) {
    sendChannel = e.channel;
    sendChannel.binaryType = 'arraybuffer';
    sendChannel.onopen = onOpenDataChanel();
    sendChannel.onclose = onCloseDataChanel();
    sendChannel.onerror = function (error) {console.error('Error in sendChannel:', error);};
    sendChannel.onmessage = onReceiveMessage;
}
// Закрытие обмена
function exchangeClose() {
    sendIdUser = null;
    //sendUser = null;
    if (sendChannel) sendChannel.close();
    sendChannel = null;
    if (sendPC) sendPC.close();
    sendPC = null;
    console.log('Каналы и соединения закрыты');
    sendFile=null;
    receiveFile = null;
    modalClean(exchangeBlock);
}
// обмен Ice Candidate
function onSendIceCandidate(evt) {
    if (!evt || !evt.candidate) return;
    wsSend({idUser: sendIdUser, candidateSend: evt.candidate });
}
// Обработка на стороне отправителя команды Ответ
function sendCommandAnswer(q) {
    console.log("Получил sdp Answer от получателя.");
    try {
        sendPC.setRemoteDescription(new RTCSessionDescription(q.sdp));
        exchangeBlock.style.display='block';
    } catch (err) {
        wsSend({idUser: sendIdUser, command: 'СбросОбмен', comment: err.message});
        console.log('Ошибка setRemoteDescription: ', err)
        showMessage('Ошибка подключения:' + err.message);
        exchangeClose();
    }
}
// При открытии канала связи и при наличии файла для обмена - начинаем обмен
function onOpenDataChanel() {
    console.log('Канал передачи данных открыт'+ (sendFile ? ' для '+sendFile.file.name : ''));
    //if (sendFile) fileSend();
}
// Обработка события закрытия канала
function onCloseDataChanel() {
    if(sendChannel) console.log('Канал передачи данных: ' + sendChannel.readyState);
}
// Передача файлов
function fileSend() {
    // Отправляем строку JSON
    var file = sendFile.file;
    if (file.size==0) return; // файлы нулевой длины не передаются
    var text = JSON.stringify({type:'file',name: file.name, size: file.size});
    try {
        sendChannel.send(text);
        console.log('Передан заголовок: '+text);
    } catch (error) {
        console.log('Ошибка передачи заголовка: ', error);
        return false;
    }
    // Читаем файл блочно и передаем
    var offset = 0;
    var fileReader = new FileReader();
    fileReader.onerror = function (error) {console.error('Ошибка чтения файла:', error)}
    fileReader.onabort = function (event) {console.log('Чтение файла прервано:', event)}
    fileReader.onload = function (e) {
        try {
            sendChannel.send(e.target.result);
            console.log('Переданы данные файла байт: ',e.target.result.byteLength);
        } catch (error){
            console.log('Ошибка передачи данных файла: ', error);
            sendChannel.send('{type: "error", comment: "Data transfer error"}')
            showMessage('Ошибка передачи данных файла: ' + error.message, 'Ошибка передачи данных');
            sendFile = null;
            sendFilesAll = null;
            return false;
        }
        offset += e.target.result.byteLength;
        if (offset < file.size) {
            blob = file.slice(offset, offset + sizeSendBlock);
            fileReader.readAsArrayBuffer(blob);
            sendFile.children[1].textContent=Math.round(offset*100/file.size)+"%";
        } else {
            sendFile.children[1].textContent='√';
            sendFile.children[1].color = '#00ff00';
            sendFile.children[0].title='отправлен: ' + file.name;
            sendFile.children[0].onclick=null;
            countUpload.textContent --;

            if (sendFilesAll) {
                sendFilesAll ++;
                sendFile = newLoadFile();
                if (sendFile) fileSend();
            } else sendFile = null;
        }
    }
    var blob = file.slice(offset, offset + sizeSendBlock);
    fileReader.readAsArrayBuffer(blob);

}
function newLoadFile() {
    sendFile = null;
    for (var i= sendFilesAll; i<sendListFile.children.length; i++) {
        if (sendListFile.children[i].children[1].textContent != '√') {
            sendFilesAll = i;
            sendFile = sendListFile.children[i];
            break;
        }
    }
    if (!sendFile) sendFilesAll = null;
    return sendFile;
}

function onReceiveMessage(evt) {
    // Обработка строковых данных
    if (typeof evt.data == 'string') {
        // Вытаскиваем объект из JSON. Должен быть указан тип
        try {
            var data = JSON.parse(evt.data);
            if (!('type' in data)) throw 'не опреден тип переданных данных';
        }
        catch (error) {
            console.log('Ошибка в данных: ', error);
            return false;
        }
        // Открываем окно обмена - если закрыто
        if (exchangeBlock.style.display !='block') {
            modalShow(exchangeBlock);
            receiveCutOnline();
        }
        // Если ошибка - сообщаем
        if (data.type == "error") {
            showMessage(('comment' in data) ? data.comment : 'Ошибка передачи данных', 'Ошибка на стороне собекседника');
            if (receiveElement) receiveElement.remove();
            receiveFile = null;
        } else if (data.type == 'file') {
            receiveFile = {name: data.name, size: data.size, offset: 0};
            receiveElement = receiveListFile.firstElementChild.cloneNode(true);
            receiveElement.children[1].textContent = 0;
            receiveElement.style.display='block';
            receiveElement.children[0].textContent = receiveFile.name;
            receiveElement.children[1].onclick = fileReceiveClear;
            receiveFile.buffer=[];
            receiveListFile.appendChild(receiveElement);
        } else if (data.type == 'message') {
            var element = messengerList.children[0].cloneNode(true);
            element.style.display='block';
            element.children[1].textContent = data.text;
            messengerList.appendChild(element);
            document.getElementById('messengerCut').children[0].textContent ++;
            if (document.getElementById('messengerCut').style.borderStyle !== 'outset') {
                setTimeout(clearCountMessage,5000);
            }
        } else {
            console.log('Тип ' + data.type +' пока еще не обрабатывается');
        }
    } else if(receiveFile) {
        receiveFile.offset += evt.data.byteLength;
        console.log('получен блок '+evt.data.byteLength+' байт файла ' + receiveFile.name + ', осталось ' + (receiveFile.size - receiveFile.offset) );
        receiveFile.buffer.push(evt.data);
        if (receiveFile.offset < receiveFile.size) {
            receiveElement.children[1].textContent = Math.round(receiveFile.offset * 100 / receiveFile.size) + "%";
        } else {
            receiveElement.data_blob = new Blob(receiveFile.buffer);
            receiveElement.children[0].href = URL.createObjectURL(receiveElement.data_blob);
            receiveElement.children[0].download = receiveFile.name;
            receiveElement.children[0].title="принять: "+receiveFile.name;
            receiveElement.children[0].addEventListener('click',onLoadFile,true);
            receiveElement.children[1].textContent = '×';
            countReceiveFiles.textContent ++;
            countDownload.textContent ++;
            receiveFile = null;
        }
    } else {
        console.log('Не определен файл для полученных данных');
    }
}
// обработка события загрузки файла
function onLoadFile(e) {
    e.target.parentElement.children[1].textContent='↓';
    countDownload.textContent --;
}
// Удаление из списка загруженных файлов информации о файле
function fileReceiveClear(e) {
    receiveFile = null;
    if (e.target.textContent == '×') countDownload.textContent --;
    else if (e.target.textContent != '↓') {
        e.target.parentElement.remove();
        return false;
    }
    e.target.parentElement.remove();
    countReceiveFiles.textContent --;
    return false;
}
// очистка списка загруженных файлов
document.getElementById('clearLoadFilesButton').onclick = function clearLoadFiles() {
    receiveFile = null;
    removeChildren(receiveListFile,1);
    countDownload.textContent = '0';
    countReceiveFiles.textContent = '0';
}
// Отправка сообщения
myMessage.value = '';
document.getElementById('myMessageSend').onclick = function (e) {
    if (!myMessage.value) return false;
    sendChannel.send(JSON.stringify({type:'message',text: myMessage.value}));
    var element = messengerList.children[1].cloneNode(true);
    element.style.display='block';
    element.children[1].textContent = myMessage.value;
    messengerList.appendChild(element);
    myMessage.value = '';
}
// Удаление дочерних узлов
function removeChildren(elem, leave) {
    if(!leave) leave=0;
    if ('children' in elem && elem.children) {
        var l = elem.children.length -1;
        for (var i=l; i>=leave; i--){
            elem.children[i].remove();
        }
    }
}

/************          Блок настройки        ************/
// отобразить блок element в модальном окне
function modalShow(element) {
    modal.style.display = 'block';
    modal.onclick = function(){
        modalClean(element);
    };
    element.style.display = 'block';
    var cleanBlock = element.querySelector('.cleanBlock');
    if (cleanBlock) cleanBlock.onclick=modal.onclick;
}
// убрать модальный блок
function modalClean(element) {
    modal.style.display = 'none';
    modal.onclick = null;
    element.style.display='none';
}
// Отобразить сообщение text в течении tyme=3000 мсек в заданном стиле
function messageVisible(text, time, style) {
    if (!text) text = 'Все ОК';
    if (!time) time = 3000;
    elem = document.getElementById('messageOk');
    elem.textContent = text;
    if (style) {
        if (style === true) elem.style.cssText = 'background-color: #cc2222; border-color: #ff8888;';
        else elem.style.cssText = style;
    }
    elem.style.display='block';
    setTimeout(function(){elem.style.display='none';}, time);
}
// обработка нажатия кнопки "настройки" на основной форме
dialogsSettings.onclick = function (e) {
    settingsBlock.style.display = 'block';
    modal.style.display = 'block';
    // Открываем текущею вкладку, если закрыта
    for (var i=2; i<5; i++) {
        if (settingsBlock.children[i].style.display == 'block') {
            if (!('data_open' in settingsBlock.children[i])) {
                settingsOpen(settingsBlock.children[i]);
            }
            break;
        }
    }
}
// Закрытие окна настройки
document.getElementById('settingsExit').onclick = function (e) {
    // Деактивация окна видео в настройках media-devices
    if (settingsVideo.srcObject) {
        settingsVideo.srcObject = null;
        stopVideo();
    }
    var elem = document.getElementById('settingsMedia');
    if ('data_open' in elem) delete elem.data_open;

    modal.style.display='none';
    settingsBlock.style.display = 'none';
    // Сохранение настроек

    if (document.getElementById('saveSettingsSwith').checked && settingsChange) {
        setPropertyToCookie('settings',JSON.stringify(settingsSave), {expires: 32000000});
        settingsChange = false;
    }
}
// Управление вкладками: id вкладок = id блоков + "Cut"; возвращает текущий блок
function controlCut(e, typeBlock) {
    var openElement = null;
    if (!typeBlock) typeBlock = 'block';
    for (var i = 0; i < e.currentTarget.children.length; i++){
        var elem = e.currentTarget.children[i];
        var id=elem.id;
        var idBlock = id.substr(0,id.length-3);
        var elemBlock = document.getElementById(idBlock);
        if (elem != e.target) {
            if (elemBlock.style.display == typeBlock) {
                elemBlock.style.display = 'none';
                elem.style.borderStyle='outset';
            }
        } else if(elemBlock.style.display != typeBlock) {
            elemBlock.style.display = typeBlock;
            elem.style.borderStyle='inset';
            openElement = elemBlock;
        }
    }
    return openElement;
}
// Обработка нажатия на вкладку главной панели настроек
document.getElementById('settingsCut').onclick = function (e) {
    var openBlock = controlCut(e);
    if (!('data_open' in openBlock)) settingsOpen(openBlock);
    return false;
}

/*****************        Настройка медиа-устройств        ******************/
// Переменные анализатора звука
const settingsVideo = document.getElementById('settingsVideo');
var audioContext = null;
var soundMeter = null;
var analiser = null;

 // при входе в настройки медиа-устройств
function settingsOpen(elem) {
    if (elem.id == 'settingsMedia') {
        if (localVideoStream && localVideoStream.active) {
            var mTrack = localVideoStream.getTracks();
            mTrack.forEach(function (track) {
                if (!track.enabled) track.enabled = true;
            });
            document.getElementById('settingsVideo').srcObject = localVideoStream;
            settingsVideo.volume = document.getElementById('speakVolume').value;
            meterVolumeVisible(localVideoStream);
            document.getElementById('takePhotos').disabled=false;
        }
    } else if (elem.id == 'settingsOther') {
        setSettingsOther();
    } else if (elem.id == 'settingsPersonal') {
        // Открываем текущею под-вкладку, если закрыта
        for (var i=1; i<4; i++) {
            if (elem.children[i].style.display == 'inline-block') {
                if (!('data_open' in elem.children[i])) {
                    privateBlockOpen(elem.children[i]);
                }
                break;
            }
        }
    }
    elem.data_open=true;
}

// Подключение медиа-устройств
function mediaDeviceOn() {
    var elem = document.getElementById('settingsVideo');
    var resolution = document.getElementById('resolution').querySelector('input:checked').value;
    var pos = resolution.indexOf('x');
    var curVideoId=videoinput.value;
    var curAudioId=audioinput.value;
    var constraints = {
        audio: {
            deviceId: audioinput.value,
            autoGainControl: document.getElementById('autoGainControl').checked,
            echoCancellation: document.getElementById('echoCancellation').checked,
            noiseSuppression: document.getElementById('noiseSuppression').checked
        },
        video: {
            deviceId: videoinput.value,
            width: {ideal: resolution.substr(0,pos)-0},
            height: {ideal: resolution.substr(pos+1)-0}
        }
    }
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            localVideoStream = stream;
            document.getElementById('settingsVideo').srcObject = localVideoStream;
            settingsVideo.volume = document.getElementById('speakVolume').value;
            setTimeout(function() {
                document.getElementById('resolutionVisual').textContent = elem.videoWidth + 'x' + elem.videoHeight;
                //localVideoBlock.querySelector('.imgVideo').title = localVideo.videoWidth + 'x' + localVideo.videoHeight;
                getsetAudio(localVideoStream.getAudioTracks()[0]);

                mediaDeviceDefine();
                meterVolumeVisible(localVideoStream);
                document.getElementById('takePhotos').disabled=false;
            },1500);

        })
        .catch(function (err) {
            showMessage('Ошибка подключения медиа-устройства: '+ err.message,'Ошибка подключения медиа-устройства');
        });
}
//Отключение медиаустройств
function mediaDeviceOff() {
    if (localVideoStream) {
        var tracks=localVideoStream.getTracks();
        tracks.forEach(function (track) {track.stop();});
        settingsVideo.srcObject = null;
        localVideoStream = null;
        localVideo.srcObject = null;
        document.getElementById('takePhotos').disabled=true;
    }
}
// Устанавливает переключатели в положение, соответствующее реальным занчениям
function getsetAudio(track) {
    var getset = track.getSettings();
    document.getElementById('autoGainControl').checked = 'autoGainControl' in getset ? getset.autoGainControl : false;
    document.getElementById('echoCancellation').checked = 'echoCancellation' in getset ? getset.echoCancellation : false;
    document.getElementById('noiseSuppression').checked = 'noiseSuppression' in getset ? getset.noiseSuppression : false;
}
// Обработка изменения видео-устройства
videoinput.onchange = function () {
    changeSettings('videoId', this.value);
}
// Обработка изменения аудио-устройства
audioinput.onchange = function () {
    changeSettings('audioId', this.value);
}
// Обработка изменения разрекшения
document.getElementById('resolution').addEventListener('change',function (e) {
    var resolution = e.target.value;
    changeSettings('videoFormat',resolution);
    var pos = resolution.indexOf('x');
    settings.videoWidth = resolution.substr(0,pos) - 0; //Разрешение - ширина
    settings.videoHeight = resolution.substr(pos+1) - 0;  //Разрешение - высота
    if (!localVideoStream) return false;
    var tracks = localVideoStream.getVideoTracks();
    if (tracks.length === 0) {
        return false;
    }
    var elem = document.getElementById('settingsVideo');

    var pos = resolution.indexOf('x');
    var constraints = {
        width: {ideal: settings.videoWidth},
        height: {ideal: settings.videoHeight}
    }

    tracks[0].applyConstraints(constraints)
        .then(function () {
            setTimeout(function() {
                document.getElementById('resolutionVisual').textContent = elem.videoWidth + 'x' + elem.videoHeight;
                localVideoBlock.querySelector('.imgVideo').title = localVideo.videoWidth + 'x' + localVideo.videoHeight;
            },1500);

        })
        .catch(function (err) {
            console.log('applyConstraints: ', err.name)
        });
    return false;
});
// Обработка изаенения переключателей настройки Аудио
document.getElementById('autoGainControl').onchange = document.getElementById('echoCancellation').onchange =
document.getElementById('noiseSuppression').onchange = function (e) {
    if (!localVideoStream || !localVideoStream.active) {
        return false;
    }
    var tracks = localVideoStream.getAudioTracks();
    if (tracks.length === 0 || !tracks[0].enabled) {
        return false;
    }
    changeSettings(this.id,this.checked);
    tracks[0].applyConstraints({
        autoGainControl: document.getElementById('autoGainControl').checked,
        echoCancellation: document.getElementById('echoCancellation').checked,
        noiseSuppression: document.getElementById('noiseSuppression').checked})
            .then(function () {
                setTimeout(function () {
                    getsetAudio(tracks[0]);
                }, 1500);
            })
            .catch(function (err) {
                console.log('applyConstraints: ', err.name)
            });
    return false;
}

document.getElementById('speakVolume').oninput = function () {
    document.getElementById('valueVolume').innerText = settingsVideo.volume = this.value;
}

function stopVideo() {
    if (soundMeter) {
        soundMeter.stop();
        soundMeter = null;
    }
    if (localVideoStream && localVideoStream.active && (talkState=='none'||talkState=='bell')) {
        var tracks = localVideoStream.getTracks();
        tracks.forEach(function (track) {track.enabled=false});
    }
}

function commandLineUpDown() {
    var commonBlock = document.body.firstElementChild;
    var commandBlock = document.getElementById('headDialogs');
    if (commonBlock.firstElementChild.id == 'headDialogs') {
        commonBlock.appendChild(commandBlock);
    } else {
        commonBlock.insertBefore(commandBlock,commonBlock.firstElementChild);
    }

}

function videoOverflow(e) {
    if (e.target.checked) {
        document.getElementById('settingsVideoBlock').style.overflow='auto';
        settingsVideo.style.width='';
    } else {
        document.getElementById('settingsVideoBlock').style.overflow='none';
        settingsVideo.style.width='100%';
    }
}

function meterVolumeVisible(stream0) {
    var stream=new MediaStream(stream0.getAudioTracks());
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analiser = audioContext.createAnalyser();
    soundMeter = new SoundMeter(window.audioContext);
    const meterVolume=document.getElementById('meterVolume');
    const meterVolumeValue=document.getElementById('meterVolumeValue');
    soundMeter.connectToSource(stream, function(e) {
        if (e) {
            alert(e);
            return;
        }
        var timerID = setInterval(function() {
            if (soundMeter) {
                meterVolume.value = meterVolumeValue.innerText =
                    soundMeter.instant.toFixed(2);
            } else {
                stream = null;
                clearInterval(timerID);
            }

        }, 200);
    });
    return soundMeter;
}
// Нажатие на кнопку Сделать фото
document.getElementById('takePhotos').onclick = function (e) {

    var canvas = document.getElementById('settingsMedia').querySelector('canvas');
    canvas.width = settingsVideo.videoWidth;
    canvas.height = settingsVideo.videoHeight;
    canvas.getContext('2d').drawImage(settingsVideo, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function (file) {
        waitSend.push({send: 'file', file: file, action: 'loadFoto'});
        var isoDate=new Date().toISOString().substr(0,19).replace(/(-)|(:)|(T)/g,'');
        var fileName='photo'+isoDate+'.png';
        wsSend({send: 'file', url: 'foto/'+idUser+'/'+fileName});
        messageVisible('Ваше фото находится в личном кабинете - фотографии с именем: ' + fileName, 4000)
    },'image/png');
}

/**************** Общие настройки **********************/
// первое открытие вкладки другие настройки
function setSettingsOther() {
    // Индикация отутствия данных пользователя в куках
    if (!settings.trash) {
        trashClear.src='image/trashNo.png';
        trashClear.style.cursor = 'default';
    }
    // Настройка отображения наличия сохраненных настроек
    settingsClearSwith.src = 'image/trashNo.png';
    settingsClearSwith.style.cursor = 'default';
    for (var i in settingsSave) {
        settingsClearSwith.src = 'image/trashYes.png';
        settingsClearSwith.style.cursor = 'pointer';
        break;
    }
};
// Обработка переключателя Сохранять настройки
document.getElementById('saveSettingsSwith').onchange = function () {
    changeSettings('save',this.checked);
    if (!this.checked) {
        setPropertyToCookie('settings',JSON.stringify(settingsSave), {expires: 32000000});
        settingsChange=false;
    }
}
// Обработка переключателя Запрашивать видеоустройства
document.getElementById('setVideoDevice').onchange = function () {
    changeSettings('queryVideoDevice', this.checked);
}
// Обработка переключателя Освобождать медиа-устройства
document.getElementById('freeDevices').onchange = function () {
    changeSettings('freeDevices', this.checked);
}
// Настройки - очистка данных авторизации
trashClear.onclick = function (ev) {
    if (!settings.trash) return;
    deletePropertyFromCookie('name');
    deletePropertyFromCookie('idUser');
    settings.trash = false;
    trashClear.src='image/trashNo.png';
    trashClear.style.cursor = 'default';
    //settingFinish('',true);
};

// Настройки - очистка настроек
settingsClearSwith.onclick = function (ev) {
    deletePropertyFromCookie('settings');
    settingsSave = {};
    settingsClearSwith.src = 'image/trashNo.png';
    settingsClearSwith.style.cursor = 'default';
    //settingFinish('',true);
};



/************************* Личный кабинет **************************/
// Управление вкладками
document.getElementById('privateCut').onclick = function (e) {
    var openBlock = controlCut(e, 'inline-block');
    if (!('data_open' in openBlock)) privateBlockOpen(openBlock);
    return false;
}
// Открытие вкладок личного кабинета
function privateBlockOpen(elem) {
    if (elem.id === 'person') {
        var mac=['name','surname','middleName','email','phone'];
        mac.forEach(function (value) {
            elem.querySelector('input[name="'+value+'"]').value=user[value]
        });
    } else if(elem.id === 'foto') {
        wsSend({get: 'foto'});
        document.getElementById('myFoto').src=user.foto;
    }
    elem.data_open=true;
}
// При изменении личных данных активация кнопки записать
document.getElementById('person').onchange = function (e) {
    var elem = this;
    var buttons = elem.querySelectorAll('button');
    if(buttons[0].disabled) {
        buttons.forEach(function (button) {button.disabled=false});
        buttons[1].onclick=function () {
            privateBlockOpen(elem);
            buttons[0].disabled=true;
            buttons[1].disabled=true;
        }
        buttons[0].onclick=function () {
            wsSend({action: 'updateUser',
                name: elem.querySelector('input[name="name"').value,
                surname: elem.querySelector('input[name="surname"').value,
                middleName: elem.querySelector('input[name="middleName"').value,
                email: elem.querySelector('input[name="email"').value,
                phone: elem.querySelector('input[name="phone"').value
            });
            buttons[0].disabled=true;
            buttons[1].disabled=true;
        }
    }
    return false;
}
// Ответ от сервера об изменении личных данных
function processUpdateUser(q) {
    if(q.result) {
        if (q.name) {
            user.name = q.name;
            user.noname = false;
        } else {
            user.name = user.login;
            user.noname = true;
        }
        user.surname=q.surname;
        user.middleName = q.middleName;
        user.email = q.email;
        user.phone = q.phone;
        user.fullName = user.name.concat(' ', user.middleName, ' ', user.surname).trimRight().replace('  ', ' ');
        messageVisible('Обновление личных данных выполнено успешно.');
    } else {
        showMessage(q.comment,'Ошибки при обновлении личных данных');
    }
}
document.getElementById('ident').onchange = function (e) {
    var login = this.querySelector('input[name="login"]').value;
    var button = this.querySelector('button');
    button.disabled = true;
    if (login) {
        if (this.querySelector('input[name="login1"]').value) {
            if (login !== user.login) {
                showMessage('Не верен логин или пароль', 'Ощибочные данные идентификации');
                return;
            } else button.disabled = false;
        }
        if (this.querySelector('input[name="password1"]').value &&
            this.querySelector('input[name="password2"]').value) {
            if (login !== user.login) {
                showMessage('Не верен логин или пароль', 'Ошибочные данные идентификации');
                button.disabled = true;
                return false;
            } else if (this.querySelector('input[name="password1"]').value !==
                this.querySelector('input[name="password2"]').value) {
                showMessage('Введеные новые пароли не совпадают', 'Ошибочные новые данные');
                button.disabled = true;
                return false;
            } else button.disabled = false;
        }
        if (!button.disabled) {
            elem=this;
            button.onclick = function (ev) {
                var query={action: 'updateIdent'};
                query.login = elem.querySelector('input[name="login"]').value;
                if (query.login !== user.login) {
                    showMessage('Не верен логин или пароль', 'Ошибочные данные идентификации');
                    return false;
                }
                query.password = elem.querySelector('input[name="password"]').value;
                var wk = elem.querySelector('input[name="password1"]').value;
                if (wk) {
                    query.newPassword = wk;
                }
                var wk = elem.querySelector('input[name="login1"]').value;
                if (wk) {
                    query.newLogin = wk;
                }
                this.disabled=true;
                wsSend(query);
            }
        }
    }
    return false;
}
// Ответ сервера на изменение идентификационных данных
function processUpdateIdent(q) {
    if(q.result) {
        messageVisible('Данные идентификации пользователя успешно изменены.');
        if (user.login !== q.login) {
            user.login = q.login;
            trashClear.onclick(null);
        };
        var idernt=document.getElementById('ident');
        ident.querySelectorAll('input').forEach(function (elem) {elem.value='';})

    } else {
        showMessage(q.comment,'Ошибки при обновлении личных данных');
    }
}

/********************************* ФОТО в Личном кабинете *****************************/
var curfoto = null;     // Элемент текущей фото в списке
var mainfoto = null;    // Элемент основной фото в списке
// Получение списка фотографий от сервера
function loadFoto(q) {
    if (!q.result)
        showMessage('Ошибки при получении списка фотографий: '+q.comment,'Ошибка получения списка фотографий');
    else {
        var ul= document.getElementById('fotoList').firstElementChild;
        var currentFoto = user.foto.substr(7);
        removeChildren(ul,0);
        if (q.files.length===0) {
            ul.insertAdjacentHTML('beforeend','<li>Список фотографий пуст</li>');
        } else {
            q.files.forEach(function (file) {
                ul.insertAdjacentHTML('beforeend','<li title="foto/'+idUser+'/'+file+'">'+file+'</li>');
                if (file == currentFoto) {
                    curfoto = ul.lastElementChild;
                    mainfoto = curfoto;
                    curfoto.style.backgroundColor='#bbddff';
                    mainfoto.style.fontWeight='600';
                }
            })
        }
    }
}
// Разрешим перетаскивать и сбрасывать файлы во внутрь элемента fotoList
document.getElementById('fotoList').ondragover = function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('Files', e.dataTransfer.files);
    return false;
};
// укладка перетаскиваемых файлов для добавления
fotoList.ondrop = function (e) {
    e.stopPropagation();
    e.preventDefault();
    loadFotoList(e.dataTransfer.files);
    return false;
};
// выбор файлов для добавления
inputFoto.onchange = function (e) {
    loadFotoList(inputFoto.files);
    inputFoto.files = null;
};
// загрузка файлов в список для добавления
function loadFotoList(files){
    var types=['jpg','jpeg','jp2','png'];
    var nofile = true;
    for (var i=0; i<files.length; i++){
        var file = files[i];
        // Проверка типа файла
        var poz = file.name.lastIndexOf('.');
        if (poz<=0) continue;
        var type=file.name.substr(poz+1).toLowerCase();
        if (types.indexOf(type)<0) continue;
        // Передача данных о передаваемом файле
        wsSend({send: 'file', url: 'foto/'+idUser+'/'+file.name, size: file.size});
        waitSend.push({send: 'file', file: file, action: 'loadFoto'});
        nofile = false;
        break;
    }
    if (nofile) messageVisible('ошибочные данные для передачи, требуется тип jpg или png.',3000,true);
}
// Передача файла на сервер
function processFile(q) {
    var i = waitSend.length-1;
    console.log(q);
    if (i<0) return;
    if (!q.result) {
        messageVisible(q.comment,3000, true);
        waitSend.pop();
        return;
    }
    if ('exist' in q) {
        var query=waitSend[i];
        query.exist=q.exist;
        if (query.send === 'file') {
            webSocket.send(query.file);
        }
    }
    else {
        query = waitSend.pop();
        var fotoList = document.getElementById('fotoList');
        var ul = fotoList.firstElementChild;
        var img = document.getElementById('myFoto');
        if (!query.exist) {
            var poz = q.url.lastIndexOf('/') + 1;
            if (curfoto) curfoto.style.backgroundColor = '';
            ul.insertAdjacentHTML('beforeend', '<li title="' + q.url + '" style="background-color: #bbddff;">' + q.url.substr(poz) + '</li>');
            curfoto = ul.lastElementChild;
            img.src = q.url;
            document.getElementById('fotoMakeMain').disabled = document.getElementById('fotoDelete').disabled = false;
        } else {
            if (curfoto && curfoto.title !== q.url) {
                var elem = ul.querySelector('li[title="' + q.url + '"]');
                if (elem) {
                    curfoto.backgroundColor = '';
                    curfoto = elem;
                    curfoto.backgroundColor = '#bbddff';
                } else {
                    console.log('Не найден обновляемый файл '+ q.url + ' в списке');
                    return;
                }
            }
            if ('dataV' in curfoto) curfoto.dataV++; else curfoto.dataV=1;
            document.getElementById('fotoMakeMain').disabled = document.getElementById('fotoDelete').disabled = (curfoto == mainfoto);
            /*cache.delete(q.url).then(function () {*/
            img.src = q.url + '?'+curfoto.dataV
            //});
        }
    }
}
// Перемещение по списку
document.getElementById('fotoList').firstElementChild.onclick = function (e) {
    if (curfoto == e.target) return false;
    if (e.target.nodeName !== 'LI') return;
    if (curfoto) curfoto.style.backgroundColor = '';
    curfoto = e.target;
    curfoto.style.backgroundColor = '#bbddff';
    document.getElementById('myFoto').src=curfoto.title + ('dataV' in curfoto ? '?'+curfoto.dataV : '');
    document.getElementById('fotoMakeMain').disabled = document.getElementById('fotoDelete').disabled = (curfoto==mainfoto);
}
// Запрос серверу на изменение основного фото
document.getElementById('fotoMakeMain').onclick = function () {
    if (curfoto == mainfoto) return false;
    wsSend({action:'updateFoto', foto: curfoto.textContent})
}
// обработка ответа сервера на изменение основного фото
function processUpdateFoto(q) {
    if (curfoto.textContent == q.foto) {
        if (mainfoto) mainfoto.style.fontWeight = '';
        mainfoto=curfoto;
        mainfoto.style.fontWeight = '600';
        document.getElementById('fotoMakeMain').disabled = document.getElementById('fotoDelete').disabled = true;
        user.foto = mainfoto.title;
        localFoto.src=user.foto;
    }
}
// Запрос серверу на удаление фото
document.getElementById('fotoDelete').onclick = function () {
    if (curfoto == mainfoto) return false;
    wsSend({action:'deleteFile', file: curfoto.title})
}
// обработка ответа сервера на удаление файла
function processDeleteFile(q) {
    if (curfoto.title == q.file) {
        curfoto.remove();
        curfoto = mainfoto;
        var img = document.getElementById('myFoto');
        if (mainfoto) {
            curfoto.backgroundColor='#bbddff';
            document.getElementById('fotoMakeMain').disabled = document.getElementById('fotoDelete').disabled = true;
            img.src = curfoto.title + ('dataV' in curfoto ? '?'+curfoto.dataV : '');
        } else {
           img.src = user.foto;
        }
    }
}
// После загрузки фото определяем видимость кнопки "Обрезать"
document.getElementById('myFoto').onload = function () {
    document.getElementById('fotoTrim').style.display =
    (this.parentElement.scrollHeight === this.parentElement.clientHeight) ? 'none' : 'inline-block';
}
// Обрезка фотографии
document.getElementById('fotoTrim').onclick = function () {
    // Определим смещение сверху и зафиксируем текущую ширину
    var img = document.getElementById('myFoto');
    var top = img.parentElement.scrollTop;
    var width0 = img.width;
    var height0 = img.height;
    img.style.width = '';
    var width1 = img.width;
    var height1 = img.height;
    var div = width1/width0;
    //img.style.width = '100%';
    //img.parentElement.scrollTop = top;
    //console.log(`отступ: ${top}, ширина: ; ${width0}, ${width1}; высота ${height0}, ${height1}`);
    var canvas = document.getElementById('settingsMedia').querySelector('canvas');
    canvas.width = width1;
    canvas.height = width1*0.75;

    var canvas2d = canvas.getContext('2d');
    canvas2d.drawImage(img, 0, top*div, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function (file) {
        waitSend.push({send: 'file', file: file, action: 'loadFoto'});
        wsSend({send: 'file', url: curfoto.title});
    },'image/png');
    img.style.width = '100%';
}

/************************ Контакты, поиск ********************************/

// Обработка изменения значений и пометок поисковых реквизитов
document.getElementById('searchDetails').onchange = function(e) {
    var elem = e.target;
    if (elem.type!=="checkbox") {
        if (elem.value.trim()) {
            elem.parentElement.firstElementChild.disabled = false;
            elem.parentElement.firstElementChild.checked  = true;
            document.getElementById('commandFind').disabled = false;
            document.getElementById('clearFindFields').disabled = false;
            return false;
        } else {
            elem.parentElement.firstElementChild.checked  = false;
            elem.parentElement.firstElementChild.disabled = true;
        }
    } else if (elem.checked) {
        document.getElementById('commandFind').disabled = false;
        document.getElementById('clearFindFields').disabled = false;
        return false;
    }
    var cleardisabled = true;
    for (var i=0; i < this.children.length; i++) {
        if (this.children[i].firstElementChild.checked) {
            document.getElementById('commandFind').disabled = false;
            document.getElementById('clearFindFields').disabled = false;
            return false;
        } else if(this.children[i].lastElementChild.value.trim()) cleardisabled = false;
    }
    document.getElementById('commandFind').disabled = true;
    document.getElementById('clearFindFields').disabled = cleardisabled;
    return false;
}
// Обработка нажатия кнопки найти
document.getElementById('commandFind').onclick = function (e) {
    var query={action: 'findUsers'};
    var els=document.getElementById('searchDetails').children;
    for (var i=0; i < els.length; i++) {
        if (els[i].firstElementChild.checked) {
            query[els[i].lastElementChild.name]=els[i].lastElementChild.value;
        }
    }
    wsSend(query);
    return false;
}
// Обработка ответа поиск контактов
function processFindUsers(q) {
    var ul=document.getElementById('foundContact');
    if (q.data.length===0) {
        messageVisible("Контакты не найдены",2000, true);
    } else {
        document.getElementById('clearFindContacts').disabled = false;
        q.data.forEach(function (value) {
            ul.insertAdjacentHTML('beforeend','<li data-id="'+value.idUser+'">'+value.fullName+'</li>');
        })
    }
}
// Обработка нажатия на найденный контакт
document.getElementById('foundContact').onclick = function (e) {
    if (e.target.tagName==='LI') {
        if ('curLi' in this) this.curLi.style.backgroundColor='';
        this.curLi=e.target;
        e.target.style.backgroundColor = '#bbddff'
        document.getElementById('commandAddContact').disabled=false;
        return false;
    }
}
// Обработка нажатия на Очистить поисковые поля
document.getElementById('clearFindFields').onclick = function (e) {
    var els = document.getElementById('searchDetails').children;
    if (els.length>0) {
         for (var i=0; i<els.length; i++) {
            elem=els[i];
            elem.firstElementChild.checked=false;
            elem.firstElementChild.disabled=true;
            elem.lastElementChild.value='';
        };
        document.getElementById('commandFind').disabled = true;
        document.getElementById('clearFindFields').disabled = true;
    }
}
// Обработка нажатия на Очистить найденные контакты
document.getElementById('clearFindContacts').onclick = function (e) {
    var foundContact=document.getElementById('foundContact');
    if ('curLi' in foundContact) delete foundContact.curLi;
    removeChildren(document.getElementById('foundContact'),0);
    document.getElementById('commandAddContact').disabled = true;
    document.getElementById('clearFindContacts').disabled = true;
}
// Обработка нажатия клавиши Добавить контакт
document.getElementById('commandAddContact').onclick = function (e) {
    var idUserNew = document.getElementById('foundContact').curLi.dataset.id;
    for (var i=0; i < users.length; i++) {
        if (users[i].idUser == idUserNew) {
            messageVisible("Контакт: "+users[i].fullName+' уже существует.', 3000, true)
            document.getElementById('foundContact').curLi.remove();
            delete document.getElementById('foundContact').curLi;
            return false;
        }
    }
    wsSend({action: 'addUser', idUser: idUserNew});
}