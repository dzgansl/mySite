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
const setVideoDevice= document.getElementById('setVideoDevice');// checked:


const videoinput  = document.getElementById('videoinput');
const audioinput  = document.getElementById('audioinput');
const audiooutput = document.getElementById('audiooutput');

const wLocalFree   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--wLocalFree')); // ширина видеоокна в свободном формате;
const wLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--wLeft')); // ширина колонки котнактных лиц
const wRignt = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--wRight')); // ширина отступа справа
const hPanelMin =  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hPanelMin')); // Минимальный размер опанели текстовых диалогов
const months      = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const wsUrl       = 'wss://neshataev.ru:5822';    // url - webSocket

var debug       = {i: 0};        // счетчик для отладки
var socketOpen  = false; // Признак открытия webSocket
var idUser      = null;         // Код пользователя
var idMainUser  = 2;            // Код администратора
var user        = {};           // данные полоьзователя
var error       = '';           // Текст сообщения об ошибке
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
var leftBlockVisible = true;
var scrollTop   = null;         // скроллинг при раскрытии, закрытии диалога
var panelVisible = true;        // Отображается панель текстовых диалогов
var panelVisibleAuto = true;    // При медиадиалоге автоматически устанавливать наличие панели текстовых диалогов
var peerConn    = null;         //
var peerConnCfg = {'iceServers':
        [{'urls': 'stun:stun.services.mozilla.com'},{'urls': 'stun:stun.l.google.com:19302'}]
    };
var localVideoStream = null;    // Видео-поток с камеры пользователя
var screenVideoStream = null;   // Видеопоток с экрана пользователя
var screenSender = null;
var mediaDevice = {audio: false, video: false};
var isMediaDevice = {audio: false, video: false};
//var videoConstraints = {value: false};
//var audioConstraints = {value: false};
//var heightVideo = 0;

var data = {};
var writes, writesTimer, writesMessage, writesUser, writesDelay;
var talkState = 'none';         // Состояние диалога: none, bell, connect, active
var talkIdUser= null;           // id позвонившего
var talkUsers = [];             // Участники диалога
var talkMediaDevice = {audio: false, video: false};
var videoFull = false;

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
    noiseSuppression: true,     //  подавление шума
    videoFull: false            //  изображение пользователя на весь экран
};
/*
var lengthMessage = 0;
var textareaHidht = 25;         // Высота области ввода в пикселях
*/
var textareaMaxHidht = 100;     // Максимальная высота области ввода
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
//прермещение окна настройки
dragAnObject(settingsBlock, settingsBlock.firstElementChild);
dragAnObject(hello, hello.firstElementChild);

idUser = getPropertyFromCookie('idUser');   // Чтение в куках кода пользователя


var waitSend =[];               //массив отложенных запросов
if (idUser !== undefined) {
    // Получить информацию о посетителе
    user.login = getPropertyFromCookie('login');
    if (!user.login) user.login = getPropertyFromCookie('name');
    if (socketOpen) wsSend({action: 'hello', idUser: idUser, login: user.login});
    // если webSocket еще не открыт - записываем запрос в массив отложенных запросов
    else waitSend.push({action: 'hello', idUser: idUser, login: user.login});
    modal.hidden = true;
    hello.hidden = true;
    settings.trash = true;
} else {
    modal.hidden = false;
    hello.hidden = false;
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
            else if (q.load == 'foto') fotoBlock.loadFoto(q);             // Показать загруженные фотографии пользователя
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
            else if (q.command === "ПредложениеSend") {
                if (!exchange) exchange = new Exchange();
                exchange.commandOffer(q);
            }
            else if (q.command === "Ответ") commandAnswer(q);
            else if (q.command === "Ответ2") command2Answer(q);
            else if (q.command === "ОтветSend") exchange.commandAnswer(q);
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
            else if (q.command === "СбросОбмен") exchange.close();
            else if (q.command === "Устройство") medioDeviceEx(q);

        } else if ('candidate' in q) {
            console.log("Получил ICECandidate от удаленного партнера.");
            peerConn.addIceCandidate(new RTCIceCandidate(q.candidate));
        } else if ('candidate2' in q) {
            console.log("Получил ICECandidate-2 от удаленного партнера.");
            pcIn.addIceCandidate(new RTCIceCandidate(q.candidate2));
        } else if ('candidateSend' in q) {
            exchange.candidateSend(q)
            //console.log("Получил ICECandidate-Send от удаленного партнера.");
            //sendPC.addIceCandidate(new RTCIceCandidate(q.candidateSend));
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
        emailBlock.hidden = false;
    } else {
        restore.disabled = false;
        emailBlock.hidden = true;
    }
    return false;
};
// не используется
restore.oninput = function (e) {
    if (restore.checked) {
        registration.disabled = true;
        emailBlock.hidden = false;
        identCome.textContent = "Восстановить";
    } else {
        registration.disabled = false;
        emailBlock.hidden = true;
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
    else if (q.reply==='updateUser') personBlock.processUpdateUser(q);
    else if (q.reply==='updateIdent') identBlock.processUpdateIdent(q);
    else if (q.reply==='updateFoto') fotoBlock.processUpdateFoto(q);
    else if (q.reply==='trimFoto') fotoBlock.processTrimFoto(q);
    else if (q.reply==='file') {    // Передача файла
        if (!fotoBlock) fotoBlock = new FotoBlock();
        fotoBlock.processFile(q);
    }
    else if (q.reply==='deleteFile') fotoBlock.processDeleteFile(q);
    else if (q.reply==='renameFile') fotoBlock.processRenameFile(q);
    else if (q.reply==='findUsers') findContact.processFindUsers(q);
}
// обработка данных ответа сервера авторизации
function processHello(q) {
    if (q.result !== true) {
        console.log('Ошибка при выполнении запроса ' + q.reply + ': ' + q.comment);
        if (hello.hidden) {
            modal.hidden = false;
            hello.hidden = false;
        }
        showMessage(q.comment, 'Ошибка в данных приветствия');
        return false;
    }
    if (!hello.hidden) {// скрытие формы авторизации
        modal.hidden = true;
        hello.hidden = true;
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

    signal("image/newContact.mp3");
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
    newPanel.hidden = !panelVisible;
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
        if ('panel' in curUser && panelVisible) curUser.panel.hidden = true;
    }
    curUserIdx = idxUser;
    curUser = users[idxUser];
    contactsTbody.children[curUserIdx].style.backgroundColor = 'paleturquoise';
    if ('panel' in curUser && panelVisible) curUser.panel.hidden = false;
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
                signal();
                contactsTbody.children[i].querySelector('span').style.color = '#087b52';
                //if (talkState === 'none') {
                buttonVideoFone(true);
                //}
            } else {
                signal("image/exit.mp3");
                contactsTbody.children[i].querySelector('span').style.color = '#ff0000';
                //if (talkState === 'none') {
                buttonVideoFone(false);
                //}
            }

            break;
        }
    }
    // если это текущий медиа-собеседник - положить трубку
    if (!q.value && talkState !== 'none' && q.idUser == talkIdUser) {
        endCall();
    }
    if (exchange && exchange.getData().idUser == q.idUser) exchange.close();
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
        if (height > textareaMaxHidht) height = textareaMaxHidht;
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
    //var h = userPanels.clientHeight;
    //document.body.clientHeight - headDialogs.offsetHeight - 4;parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hFooter'));
    var h0 = 0;
    // Если медиа-общение
    if (!videoBlock.hidden) {
        var w0 = document.body.clientWidth - (leftBlockVisible ? wLeft : 0) - 25;
        var h0 = userPanels.clientHeight - (panelVisible && !panelVisibleAuto ? hPanelMin : 0);
        if (!screenBlock.hidden) {   // ********** если есть отображение экрана **************
            var hwSc = screen.scrollHeight / screen.scrollWidth;
            w1 = Math.floor(h0 / hwSc);
            if (w1 > w0) {
                w1 = w0;
                h1 = Math.ceil(w1 * hwSc);
                h0 = h1 < h0 ? h0 - h1 : 0;
            } else {
                h1 = h0;
                h0 = 0;
            }
            h0 = h1;
            screen.style.width = w1 + 'px';
            if (panelVisible && panelVisibleAuto && h0 < hPanelMin) {
                dialogVisible(false);
            }
        }

        // максимальная ширина и высота области изображений с учетом заголовков
        // Отношение высоты к ширине фото или видео собеседника (без заголовков)
        if (talkUsers[0].video.hidden) {
            var hwHe = talkUsers[0].fotoBlock.naturalHeight ? talkUsers[0].fotoBlock.naturalHeight / talkUsers[0].fotoBlock.naturalWidth : 0.75;
        } else {
            hwHe = talkUsers[0].video.videoHeight ? talkUsers[0].video.videoHeight / talkUsers[0].video.videoWidth : 0.75;
        }
        // Отношение высоты к ширине мое
        if (localVideo.hidden) {
            var hwYa = localFoto.naturalHeight ? localFoto.naturalHeight / localFoto.naturalWidth : 0.75;
        } else {
            hwYa = localVideo.videoHeight ? localVideo.videoHeight / localVideo.videoWidth : 0.75;
        }
        // Если изображения собеседника и мое равны по ширине
        var col = 1;
        if (!videoFull) {
            if (localVideoBlock.classList.contains('freeVideoBlock')) {
                localVideoBlock.classList.remove('freeVideoBlock');
            }
            var w1 = (h0-58) / (hwYa + hwHe);
            // Определяем количество Колонок фото/видео
            if (w1 > w0 / 2) {
                // в одну колонку
                col = 1;
                if (w1 > w0) w1 = w0;
                var h1 = Math.ceil(w1 * (hwYa + hwHe)) + 58;
            } else {
                // в 2 колонки
                col = 2;
                w1 = Math.floor(w0 / 2);
                h1 = Math.ceil(w1 * Math.max(hwYa, hwHe)) + 29;
            }
            if (h1 > h0) h1 = h0;
            localVideoBlock.style.width = w1 + 'px';
        } else { // ************** Отображается собеседник на весь блок *************
            w1 = Math.floor((h0 - 29) / hwHe);
            var w2 = w0 - w1;
            if (w2 <= 0) {
                w1 = w0;
                h1 = Math.ceil(w1 * hwHe) + 29;
                w2 = Math.floor((h0 - h1 - 29) / hwYa);
                if (w2 > w0) w2 = w0;
                h1 = h1 + h0;
            } else h1 = h0;

            if (w2 >= wLocalFree) {
                if (localVideoBlock.classList.contains('freeVideoBlock')) {
                    localVideoBlock.classList.remove('freeVideoBlock');
                }
                localVideoBlock.style.width = w2 + 'px';
            } else {
                if (!localVideoBlock.classList.contains('freeVideoBlock')) {
                    localVideoBlock.classList.add('freeVideoBlock');
                    localVideoBlock.style.width = wLocalFree + 'px';
                }
            }
        }
        talkUsers[0].videoBlock.style.width = w1 + 'px';
        h0 = h0 + h1;
        var hV = videoBlock.scrollHeight;
        if (col=2 && h0 > hV) hV = h0;
        if (panelVisibleAuto && panelVisible && hV > userPanels.clientHeight - hPanelMin) dialogVisible(false);
        else if (!panelVisible && panelVisibleAuto && userPanels.clientHeight - hV >= hPanelMin) dialogVisible(true);
    }
    var hP = userPanels.clientHeight - hV ;
    if (curUser && panelVisible) {
        curUser.panel.querySelector('.dialogs').style.height = (hP - curUser.panel.querySelector('.textareaBlock').offsetHeight - 24) + 'px';
    }
    document.documentElement.style.setProperty('--hPanel', hP + 'px');
    var visualBlock = null;
    if (!hello.hidden) visualBlock = hello;
    else if(!document.getElementById('exchangeBlock').hidden) visualBlock = document.getElementById('exchangeBlock');
    else if(!settingsBlock.hidden) visualBlock = settingsBlock;
    if (visualBlock && visualBlock.offsetTop < 0) visualBlock.style.top = 0;
    if (!document.getElementById('fotoRenameBlock').hidden) {
        fotoBlock.resizeFotoRenameBlock();
    }
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
        else answerCall(isVideo);                      // Идет звонок - отвечаем на звонок

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
        var buttonRoll = talkUsers[i].videoBlock.firstElementChild.firstElementChild;
        buttonRoll.style.display = 'inline-block';
        buttonRoll.onclick = roll;
        talkUsers[i].videoBlock.querySelector('.videoHeadTxt').textContent = talkUsers[i].fullName;
        talkUsers[i].fotoBlock = talkUsers[i].videoBlock.children[1];
        talkUsers[i].fotoBlock.src = talkUsers[i].foto;
        talkUsers[i].fotoBlock.hidden = false;
        talkUsers[i].video = talkUsers[i].videoBlock.children[2];
        talkUsers[i].video.hidden = true;
        //talkUsers[i].video.src = '';
        //videoBlock.appendChild(talkUsers[i].videoBlock);
        videoBlock.insertBefore(talkUsers[i].videoBlock,localVideoBlock);
    }
    // и мое окно видео или фото
    if (mediaDevice.video == false) {
        localVideo.hidden = true;
        localFoto.hidden = false;
        localVideoBlock.children[0].querySelector('.imgVideo').src='image/eyeClose.png';
        dialogsVideoSwitch.children[0].src='image/cameraOff.png';
    } else {
        if (localVideo.srcObject){
            if (localVideo.srcObject.active) {
                localVideo.hidden = false;
                localFoto.hidden = true;
            } else {
                localVideo.hidden = true;
                localFoto.hidden = false;
            }
        } else if (localVideoStream) {
            localVideo.hidden = false;
            localFoto.hidden = true;
            localVideo.srcObject = localVideoStream;
        } else {
            localVideo.hidden = true;
            localFoto.hidden = false;
        }
    }
    videoBlock.hidden = false;
    dialogHideShow.style.display='inline-block';
    resize();
    //сверху колеблется звонок
    localVideoBlock.insertAdjacentHTML('beforeend',
        '<img src="image/bell.gif" class="bellImage">');
    // звучит рингтон
    bell.src=ringtone;
    try {
        bell.play();
    } catch {
        messageVisible('Вам звонят')
    }

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
        localFoto.hidden = true;
        localVideo.hidden = false;
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
dialogsVideoSwitch.onclick = function(online) {
    // отключается канал передачи видео, изображение Видео перечеркивается, отображается фото
    // при повторном нажатии - все возобнавляется
    var mtrack = localVideoStream.getVideoTracks();
    if (mtrack.length > 0) {
        if (typeof online !== 'boolean') online = !mtrack[0].enabled;
        if (!online) {
            dialogsVideoSwitch.querySelector('img').src = 'image/cameraOff.png';
            localVideoBlock.children[0].querySelector('.imgVideo').src = 'image/eyeClose.png';
            localVideo.hidden = true;
            localFoto.hidden = false;
            wsSend({idUser: talkIdUser, command: 'Устройство', video: false});
        } else {
            dialogsVideoSwitch.querySelector('img').src = 'image/cameraOn.png';
            localFoto.hidden = true;
            localVideo.hidden = false;
            wsSend({idUser: talkIdUser, command: 'Устройство', video: true});
            localVideoBlock.children[0].querySelector('.imgVideo').src = 'image/eyeOpen.png';
        }
        for (var i=0; i < mtrack.length; i++) {
            mtrack[i].enabled = online;
        }
    }
}
// Отключение, включение микрофона
dialogsFoneSwitch.onclick = function (online) {
    var mtrack = localVideoStream.getAudioTracks();
    if (typeof online !== 'boolean') online = !mtrack[0].enabled;
    if (!online) {
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
            mtrack[i].enabled = online;
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
        talkUsers[0].fotoBlock.hidden = true;
        // установить удаленный видеопоток в качестве источника для удаленного элемента HTML5 видео
        talkUsers[0].video.hidden = false;
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
    videoBlock.hidden = true;
    for (var i=0; i < talkUsers.length; i++) talkUsers[i].videoBlock.remove();
    localVideoBlock.classList.remove("freeVideoBlock");
    localVideo.hidden = true;
    localFoto.hidden = true;
    if (!leftBlockVisible) leftBlockSwith(true);
    if (!panelVisible) dialogVisible(true);

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
    panelVisibleAuto = true;
    buttonVideoFone(curUser.online);
    dialogVisible(true);
    dialogHideShow.style.display='none';
    resize();
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
                    cur.fotoBlock.hidden = true;
                    cur.video.hidden = false;
                    cur.videoBlock.children[0].querySelector('.imgVideo').src='image/eyeOpen.png';

                } else {
                    cur.video.hidden = true;
                    cur.fotoBlock.hidden = false;
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
// Свернуть - развернуть медиа-окно собеседника
function roll(e) {
    var newVideoFull = !videoFull;
    if ( typeof e === 'boolean') {
        newVideoFull = e;
        if (newVideoFull === videoFull) return false;
    }
    if (newVideoFull) {
        if (leftBlockVisible) leftBlockSwith(false);
        if (panelVisible) dialogVisible(false);
        //document.appendChild(localVideoBlock);
        /*localVideoBlock.classList.add('freeVideoBlock');
        localVideoBlock.style.width = wLocalFree + 'px';
        talkUsers[0].videoBlock.style.width = 'calc(100% - 4px)';*/
        talkUsers[0].videoBlock.firstElementChild.firstElementChild.textContent = '□'
    } else {
        if (!leftBlockVisible) leftBlockSwith(true);
        if (!panelVisible) dialogVisible(true);
        /*talkUsers[0].videoBlock.style.width = 'calc(50% - 2px)';
        localVideoBlock.classList.remove('freeVideoBlock');
        localVideoBlock.style.width = 'calc(50% - 2px)';*/
        talkUsers[0].videoBlock.firstElementChild.firstElementChild.textContent = '⃞'
    }
    videoFull = newVideoFull;
    resize();
    return false;
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
    screenBlock.hidden = true;
    //localVideoBlock.style.display = 'inline-block';
    //talkUsers[0].videoBlock.display = 'inline-block';
    /*screen.srcObject = null;
    if (pcIn) {
        try {
            pcIn=close();
        } catch (err) {
            console.log(err)
        }
        pcIn=null;
    }*/
    pcIn=null;
    screen.srcObject = null;
    resize();
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
    pcIn.ontrack = async function (evt) {
        //localVideoBlock.style.display = 'none';
        //talkUsers[0].videoBlock.display = 'none';
        screen.srcObject = evt.streams[0];
        screenBlock.hidden = false;
        //dialogHideShow.style.display = 'inline-block';
        //if (leftBlockVisible) leftBlockSwith(false);
        //if (panelVisible) dialogVisible(false);
        try {
            await screen.play();
            resize();
        } catch(err) {
            messageVisible('Ошибка при попытке отображения экрана собеседника: ' + err.message);
            screen.srcObject = null;
            screenBlock.hidden = true;
        }
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

/********************************************************************************/
// Спрятать - показать контакты
columnShift.onclick = function(ev) {
    leftBlockSwith(ev);
    resize();
}
//
function leftBlockSwith(ev) {
    if (typeof ev == 'boolean') var online = ev;
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
};
// Спратать - показать диалоги
dialogHideShow.onclick = function(e) {
    panelVisibleAuto = false;
    dialogVisible(e);
    resize()
}
// Прячет (false) / показывает (true), восстанавливает состояние (null || undefained)
// меняет на противоположное (остальное) отображение панели диалога с контактным лицом:
function dialogVisible(e) {
    var img = dialogHideShow.querySelector('img');
    if (typeof e == 'boolean') var set = e;
    else if (e) set =  !panelVisible;
    else set = panelVisible;
    if (set) {
        curUser.panel.hidden = false;
        img.src="image/dialogHide.png"
        panelVisible=true;
    } else {
        curUser.panel.hidden = true;
        img.src="image/dialogShow.png"
        panelVisible=false;
    }
    //resize();
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

/************          Общик функции        ************/
// Подать сигнал
async function signal(file,time) {
    if (!file) file='image/signal.mp3';
    if (!time) time=750;
    bell.src=file;
    bell.volume=1;
    try {
        await bell.play();
        setTimeout(()=>{bell.pause();bell.src='';},time);
    } catch (err){
        console.log(err);
    }
}
// отобразить блок element в модальном окне
function modalShow(element) {
    modal.hidden = false;
    modal.onclick = function(){
        modalClean(element);
    };
    element.hidden = false;
    var cleanBlock = element.querySelector('.cleanBlock');
    if (cleanBlock) cleanBlock.onclick=modal.onclick;
}
// убрать модальный блок
function modalClean(element) {
    modal.hidden = true;
    modal.onclick = null;
    element.hidden = true;
}
// Отобразить сообщение text в течении tyme=3000 мсек в заданном стиле = true - информация об ошибке
function messageVisible(text, time, style) {
    if (!text) text = 'Все ОК';
    if (!time) time = 3000;
    var elem = document.getElementById('messageOk');
    elem.textContent = text;
    if (style) {
        if (style === true) elem.style.cssText = 'background-color: #cc2222; border-color: #ff8888;';
        else elem.style.cssText = style;
    }
    elem.hidden = false;
    setTimeout(() => {elem.hidden = true}, time);
}
// Имя файла из src
function nameFile(src) {
    var poz=src.lastIndexOf('/')+1;
    return (poz < 0) ? src : src.substr(poz)
}

// Изменение положения командной строки
function commandLineUpDown() {
    var commonBlock = document.body.firstElementChild;
    var commandBlock = document.getElementById('headDialogs');
    if (commonBlock.firstElementChild.id == 'headDialogs') {
        commonBlock.appendChild(commandBlock);
    } else {
        commonBlock.insertBefore(commandBlock,commonBlock.firstElementChild);
    }

}

