'use strict';
/************          Блок настройки        ************/
const settingsBlock = document.getElementById('settingsBlock');

var settingsMedia = null;
var settingsOther = null;
var personBlock = null;
var identBlock = null;
var fotoBlock = null;
var findContact = null;

// Сохранение настройки
function changeSettings(name, value) {
    settingsSave[name] = value;
    settings[name] = value;
    settingsChange = true;
}

/************          Блок настройки        ************/
// обработка нажатия кнопки "настройки" на основной форме
dialogsSettings.onclick = function (e) {
    modal.hidden = false;
    settingsBlock.hidden = false;
    if (settingsBlock.offsetTop < 0) settingsBlock.style.top = 0;
    // Открываем текущею вкладку, если закрыта
    var els = settingsBlock.children; //[1].children;
    for (var i=2; i<els.length; i++) {
        if (!els[i].hidden) {
            if (!('data_open' in els[i])) {
                settingsOpen(els[i]);
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
        settingsMedia.stopVideo();
    }
    var elem = document.getElementById('settingsMedia');
    if ('data_open' in elem) delete elem.data_open;

    modal.hidden = true;
    settingsBlock.hidden = true;
    // Сохранение настроек

    if (document.getElementById('saveSettingsSwith').checked && settingsChange) {
        setPropertyToCookie('settings',JSON.stringify(settingsSave), {expires: 32000000});
        settingsChange = false;
    }
}
// Управление вкладками: id вкладок = id блоков + "Cut"; возвращает текущий блок
function controlCut(e) {
    var openElement = null;
    var oldCut = null;
    var notNewCut = true;
    for (var i = 0; i < e.currentTarget.children.length; i++){
        var elem = e.currentTarget.children[i];
        var id=elem.id;
        var idBlock = id.substr(0,id.length-3);
        var elemBlock = document.getElementById(idBlock);
        if (elem != e.target) {
            if (elemBlock && !elemBlock.hidden) {
                elemBlock.hidden = true;
                elem.style.borderStyle = 'outset';
                oldCut=[elem,elemBlock];
            }
        } else if(elemBlock.hidden) {
            elemBlock.hidden = false;
            elem.style.borderStyle='inset';
            openElement = elemBlock;
            notNewCut = false;
        }
    }
    if (notNewCut && oldCut) {
        oldCut[1].hidden = false;
        oldCut[0].style.borderStyle='inset';
        openElement = oldCut[1];
    }
    return openElement;
}
// Обработка нажатия на вкладку главной панели настроек
document.getElementById('settingsCut').onclick = function (e) {
    var openBlock = controlCut(e);
    if (openBlock && !('data_open' in openBlock)) settingsOpen(openBlock);
    return false;
}
// при входе в настройки медиа-устройств
function settingsOpen(elem) {
    if (elem.id == 'settingsMedia') {
        settingsMedia = new SettingsMedia();
    } else if (elem.id == 'settingsOther') {
        settingsOther = new SettingsOther();
    } else if (elem.id == 'settingsPersonal') {
        // Открываем текущею под-вкладку, если закрыта
        var els = elem.children[1].children;
        for (var i = 0; i < els.length; i++) {
            if (!els[i].hidden) {
                if (!('data_open' in els[i])) {
                    privateBlockOpen(els[i]);
                }
                break;
            }
        }
    }
    elem.data_open=true;
}

/*****************        Настройка медиа-устройств        ******************/
function SettingsMedia() {
    //const videoinput = document.getElementById('videoinput');
    //const audioinput = document.getElementById('audioinput');
    const settingsVideo = document.getElementById('settingsVideo');
    const speakVolume = document.getElementById('speakVolume');
    const takePhotos = document.getElementById('takePhotos');
    const resolutions = document.getElementById('resolution');
    const autoGainControl = document.getElementById('autoGainControl');
    const echoCancellation = document.getElementById('echoCancellation');
    const noiseSuppression = document.getElementById('noiseSuppression');
    const setVideoDevice = document.getElementById('setVideoDevice');
    const freeDevices = document.getElementById('freeDevices');
    const resolutionVisual = document.getElementById('resolutionVisual');

    // Переменные анализатора звука
    var audioContext = null;
    var soundMeter = null;
    var analiser = null;

    // Установка значений элементов формы настройки медиа-устройств
    autoGainControl.checked = settings.autoGainControl;
    echoCancellation.checked = settings.echoCancellation;
    noiseSuppression.checked = settings.noiseSuppression;
    setVideoDevice.checked = settings.queryVideoDevice;
    freeDevices.checked = settings.freeDevices;
    var elem = resolutions.querySelector('input[value="'+settings.videoFormat+'"]');
    if (elem) elem.checked=true;

    // Если медиа-поток уже существует и активен - переносим его в окно настроек
    if (localVideoStream && localVideoStream.active) {
        var mTrack = localVideoStream.getTracks();
        mTrack.forEach(function (track) {
            if (!track.enabled) track.enabled = true;
        });
        settingsVideo.srcObject = localVideoStream;
        settingsVideo.volume = speakVolume.value;
        meterVolumeVisible(localVideoStream);
        takePhotos.disabled=false;
    }

    // Подключение медиа-устройств
    resolutions.firstElementChild.onclick = function () {
        var resolution = resolutions.querySelector('input:checked').value;
        var pos = resolution.indexOf('x');
        var curVideoId=videoinput.value;
        var curAudioId=audioinput.value;
        var constraints = {
            audio: {
                deviceId: audioinput.value,
                autoGainControl: autoGainControl.checked,
                echoCancellation: echoCancellation.checked,
                noiseSuppression: noiseSuppression.checked
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
                settingsVideo.srcObject = localVideoStream;
                settingsVideo.volume = speakVolume.value;
                setTimeout(function() {
                    resolutionVisual.textContent = settingsVideo.videoWidth + 'x' + settingsVideo.videoHeight;
                    getsetAudio(localVideoStream.getAudioTracks()[0]);

                    mediaDeviceDefine();
                    meterVolumeVisible(localVideoStream);
                    takePhotos.disabled=false;
                },1500);

            })
            .catch(function (err) {
                showMessage('Ошибка подключения медиа-устройства: '+ err.message,'Ошибка подключения медиа-устройства');
            });
    }
    //Отключение медиаустройств
    resolutions.children[1].onclick = function () {
        if (localVideoStream) {
            var tracks=localVideoStream.getTracks();
            tracks.forEach(function (track) {track.stop();});
            settingsVideo.srcObject = null;
            localVideoStream = null;
            localVideo.srcObject = null;
            takePhotos.disabled=true;
        }
    }
    // Устанавливает переключатели в положение, соответствующее реальным занчениям
    function getsetAudio(track) {
        var getset = track.getSettings();
        autoGainControl.checked = 'autoGainControl' in getset ? getset.autoGainControl : false;
        echoCancellation.checked = 'echoCancellation' in getset ? getset.echoCancellation : false;
        noiseSuppression.checked = 'noiseSuppression' in getset ? getset.noiseSuppression : false;
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
    resolutions.addEventListener('change',function (e) {
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
        var pos = resolution.indexOf('x');
        var constraints = {
            width: {ideal: settings.videoWidth},
            height: {ideal: settings.videoHeight}
        }

        tracks[0].applyConstraints(constraints)
            .then(function () {
                setTimeout(function() {
                    resolutionVisual.textContent = settingsVideo.videoWidth + 'x' + settingsVideo.videoHeight;
                    localVideoBlock.querySelector('.imgVideo').title = localVideo.videoWidth + 'x' + localVideo.videoHeight;
                },1500);

            })
            .catch(function (err) {
                console.log('applyConstraints: ', err.name)
            });
        return false;
    });
    // Обработка изаенения переключателей настройки Аудио
    autoGainControl.onchange = echoCancellation.onchange = noiseSuppression.onchange = function (e) {
            if (!localVideoStream || !localVideoStream.active) {
                return false;
            }
            var tracks = localVideoStream.getAudioTracks();
            if (tracks.length === 0 || !tracks[0].enabled) {
                return false;
            }
            changeSettings(this.id,this.checked);
            tracks[0].applyConstraints({
                autoGainControl: autoGainControl.checked,
                echoCancellation: echoCancellation.checked,
                noiseSuppression: noiseSuppression.checked})
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

    speakVolume.oninput = function () {
        document.getElementById('valueVolume').innerText = settingsVideo.volume = this.value;
    }
    // отключить активность медиапотока
    this.stopVideo = function () {
        if (soundMeter) {
            soundMeter.stop();
            soundMeter = null;
        }
        if (localVideoStream && localVideoStream.active && (talkState=='none'||talkState=='bell')) {
            var tracks = localVideoStream.getTracks();
            tracks.forEach(function (track) {track.enabled=false});
        }
    }
    // Включить / выключить реальный размер видео
    document.getElementById('videoOverflow').onchange = function (e) {
        var settingsVideoBlockStyle = document.getElementById('settingsVideoBlock').style;
        if (e.target.checked) {
            settingsVideoBlockStyle.overflow='auto';
            settingsVideo.style.width='';
        } else {
            settingsVideoBlockStyle.overflow='none';
            settingsVideo.style.width='100%';
        }
    }
    // Отображение громкости микрофона
    function meterVolumeVisible(stream0) {
        var stream=new MediaStream(stream0.getAudioTracks());
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analiser = audioContext.createAnalyser();
        soundMeter = new SoundMeter(audioContext);
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
    takePhotos.onclick = function (e) {

        var canvas = document.getElementById('settingsMedia').querySelector('canvas');
        canvas.width = settingsVideo.videoWidth;
        canvas.height = settingsVideo.videoHeight;
        canvas.getContext('2d').drawImage(settingsVideo, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (file) {
            waitSend.push({send: 'file', file: file, action: 'loadFoto'});
            var isoDate=new Date().toISOString().substr(0,19).replace(/(-)|(:)|(T)/g,'');
            var fileName='photo'+isoDate+'.png';
            wsSend({send: 'file', file: fileName});
            messageVisible('Ваше фото находится в личном кабинете - фотографии с именем: ' + fileName, 4000)
        },'image/png');
    }

}

/**************** Общие настройки **********************/
function SettingsOther() {
    const trashClear    = document.getElementById('trashClear');
    const settingsClearSwith = document.getElementById('settingsClearSwith');
    const saveSettingsSwith = document.getElementById('saveSettingsSwith');

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
    saveSettingsSwith.checked = settings.save;

    // Обработка переключателя Сохранять настройки
    saveSettingsSwith.onchange = function () {
        changeSettings('save',this.checked);
        if (!this.checked) {
            setPropertyToCookie('settings',JSON.stringify(settingsSave), {expires: 32000000});
            settingsChange=false;
        }
    }
    // Обработка переключателя Запрашивать видеоустройства
    setVideoDevice.onchange = function () {
        changeSettings('queryVideoDevice', this.checked);
    }
    // Обработка переключателя Освобождать медиа-устройства
    freeDevices.onchange = function () {
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
    };
    // Настройки - очистка настроек
    settingsClearSwith.onclick = function (ev) {
        deletePropertyFromCookie('settings');
        settingsSave = {};
        settingsClearSwith.src = 'image/trashNo.png';
        settingsClearSwith.style.cursor = 'default';
    };

}

/************************* Личный кабинет **************************/
// Управление вкладками
document.getElementById('privateCut').onclick = function (e) {
    var openBlock = controlCut(e);
    if (!('data_open' in openBlock)) privateBlockOpen(openBlock);
    return false;
}
// Открытие вкладок личного кабинета
function privateBlockOpen(elem) {
    if (elem.id === 'person') {
        personBlock = new PersonBlock();
    } else if(elem.id === 'ident') {
        identBlock = new IdentBlock();        
    } else if(elem.id === 'foto') {
        if (!fotoBlock) fotoBlock = new FotoBlock();
    } else if(elem.id === 'find') {
        findContact = new FindContact()
    }
    elem.data_open=true;
}
/************************* изменение персональных данных *******************/
function PersonBlock() {
    const person = document.getElementById('person');
    var buttons = person.querySelectorAll('button');
    const buttonWrite  = buttons[0];
    const buttonReturn = buttons[1];
    var mac=['name','surname','middleName','email','phone'];
    mac.forEach(function (value) {
        person.querySelector('input[name="'+value+'"]').value=user[value]
    });
    // При изменении личных данных активация кнопки записать
    person.onchange = function (e) {
        if (buttonWrite.disabled) {
            buttonReturn.disabled = buttonWrite.disabled = false;
        }
        return false;
    }
    // Нажатие на кнопку отменить
    buttonReturn.onclick=function () {
        mac.forEach(function (value) {
            person.querySelector('input[name="'+value+'"]').value=user[value]
        });
        buttonWrite.disabled = buttonReturn.disabled = true;
    }
    // Нажатие на кнопку записать
    buttonWrite.onclick=function () {
        wsSend({action: 'updateUser',
            name: person.querySelector('input[name="name"').value,
            surname: person.querySelector('input[name="surname"').value,
            middleName: person.querySelector('input[name="middleName"').value,
            email: person.querySelector('input[name="email"').value,
            phone: person.querySelector('input[name="phone"').value
        });
        buttonWrite.disabled = buttonReturn.disabled = true;
    }
    // Ответ от сервера об изменении личных данных
    this.processUpdateUser = function (q) {
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
}
/************************* изменение идентификационных данных **************/
function IdentBlock() {
    const ident = document.getElementById('ident');
    const login = ident.querySelector('input[name="login"]');
    const login1 = ident.querySelector('input[name="login1"]');
    const pas = ident.querySelector('input[name="password"]');
    const pas1 = ident.querySelector('input[name="password1"]');
    const pas2 = ident.querySelector('input[name="password2"]');
    var button = ident.querySelector('button');
    ident.onchange = function (e) {
        button.disabled = true;
        if (login.value) {
            if (login1.value) {
                if (login.value !== user.login) {
                    showMessage('Не верен логин или пароль', 'Ощибочные данные идентификации');
                    return;
                } else button.disabled = false;
            }
            if (pas1.value && pas2.value) {
                if (login.value !== user.login) {
                    showMessage('Не верен логин или пароль', 'Ошибочные данные идентификации');
                    button.disabled = true;
                    return false;
                } else if (pas1.value !== pas2.value) {
                    showMessage('Введеные новые пароли не совпадают', 'Ошибочные новые данные');
                    button.disabled = true;
                    return false;
                } else button.disabled = false;
            }
        }
        return false;
    }
    
    button.onclick = function (ev) {
        if (login.value !== user.login) {
            showMessage('Не верен логин или пароль', 'Ошибочные данные идентификации');
            return false;
        }
        var query={action: 'updateIdent', login: login.value, password: pas.value};
        if (pas1.value) query.newPassword = pas1.value;
        if (login1.value) query.newLogin = login1.value;
        this.disabled=true;
        wsSend(query);
    }
    // Ответ сервера на изменение идентификационных данных
    this.processUpdateIdent = function (q) {
        if(q.result) {
            messageVisible('Данные идентификации пользователя успешно изменены.');
            if (user.login !== q.login) {
                user.login = q.login;
                trashClear.onclick(null);
            };
            login.value=pas.value=login1.value=pas1.value=pas2.value='';
        } else {
            showMessage(q.comment,'Ошибки при обновлении личных данных');
        }
    }

}
/************************* ФОТО в Личном кабинете **************************/
function FotoBlock() {
    var curfoto = null;     // Элемент текущей фото в списке
    var mainfoto = null;    // Элемент основной фото в списке
    var fotoList = document.getElementById('fotoList');
    var ul = fotoList.firstElementChild;
    var fotoMakeMain = document.getElementById('fotoMakeMain');
    var img = document.getElementById('myFoto');
    var fotoDelete = document.getElementById('fotoDelete');
    var fotoTrim = document.getElementById('fotoTrim');
    wsSend({get: 'foto'});
    img.src = user.foto;
    // Получение списка фотографий от сервера
    this.loadFoto = function (q) {
        if (!q.result)
            showMessage('Ошибки при получении списка фотографий: '+q.comment,'Ошибка получения списка фотографий');
        else {
            var ul= fotoList.firstElementChild;
            //var currentFoto = nameFile(user.foto);
            removeChildren(ul,0);
            if (q.files.length===0) {
                ul.insertAdjacentHTML('beforeend','<li>Список фотографий пуст</li>');
            } else {
                q.files.forEach(function (file) {
                    ul.insertAdjacentHTML('beforeend','<li title="'+file+'">'+nameFile(file)+'</li>');
                    if (file == user.foto) {
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
    fotoList.ondragover = function (e) {
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
            wsSend({send: 'file', file: file.name, size: file.size});
            waitSend.push({send: 'file', file: file, action: 'loadFoto'});
            nofile = false;
            break;
        }
        if (nofile) messageVisible('ошибочные данные для передачи, требуется тип jpg или png.',3000,true);
    }
    // Передача файла на сервер
    this.processFile = function (q) {
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
            if (!query.exist) {
                if (curfoto) curfoto.style.backgroundColor = '';
                ul.insertAdjacentHTML('beforeend', '<li title="' + q.url + '" style="background-color: #bbddff;">' + nameFile(q.url) + '</li>');
                curfoto = ul.lastElementChild;
                img.src = q.url;
                fotoMakeMain.disabled = fotoDelete.disabled = false;
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
                fotoMakeMain.disabled = fotoDelete.disabled = (curfoto == mainfoto);
                img.src = q.url + '?'+curfoto.dataV
            }
        }
    }
    // Перемещение по списку
    ul.onclick = function (e) {
        if (curfoto == e.target) return false;
        if (e.target.nodeName !== 'LI') return;
        if (curfoto) curfoto.style.backgroundColor = '';
        curfoto = e.target;
        curfoto.style.backgroundColor = '#bbddff';
        img.src=curfoto.title + ('dataV' in curfoto ? '?'+curfoto.dataV : '');
        fotoMakeMain.disabled = fotoDelete.disabled = (curfoto==mainfoto);
    }
    // Запрос серверу на изменение основного фото
    fotoMakeMain.onclick = function () {
        if (curfoto == mainfoto) return false;
        wsSend({action:'updateFoto', foto: curfoto.textContent})
    }
    // обработка ответа сервера на изменение основного фото
    this.processUpdateFoto = function (q) {
        if (curfoto.textContent == q.foto) {
            if (mainfoto) mainfoto.style.fontWeight = '';
            mainfoto=curfoto;
            mainfoto.style.fontWeight = '600';
            fotoMakeMain.disabled = fotoDelete.disabled = true;
            user.foto = mainfoto.title;
            localFoto.src=user.foto;
        }
    }
    // Запрос серверу на удаление фото
    fotoDelete.onclick = function () {
        if (curfoto == mainfoto) return false;
        wsSend({action:'deleteFile', file: curfoto.textContent})
    }
    // обработка ответа сервера на удаление файла
    this.processDeleteFile = function (q) {
        if (curfoto.textContent == q.file) {
            curfoto.remove();
            curfoto = mainfoto;
            if (mainfoto) {
                curfoto.backgroundColor='#bbddff';
                fotoMakeMain.disabled = fotoDelete.disabled = true;
                img.src = curfoto.title + ('dataV' in curfoto ? '?'+curfoto.dataV : '');
            } else {
                img.src = user.foto;
            }
        }
    }
    // После загрузки фото определяем видимость кнопки "Обрезать"
    img.onload = function () {
        fotoTrim.style.display = (this.parentElement.scrollHeight === this.parentElement.clientHeight) ? 'none' : 'inline-block';
    }
    // Обрезка фотографии
    fotoTrim.onclick = function () {
        // Определим смещение сверху и зафиксируем текущую ширину
        var top = img.parentElement.scrollTop;
        var width0 = img.width;
        //var height0 = img.height;
        var width1 = img.naturalWidth;
        //var height1 = img.naturalHeight;
        var div = width1/width0;
        /*var canvas = document.getElementById('settingsMedia').querySelector('canvas');
        canvas.width = width1;
        canvas.height = width1*0.75;
        try {
            var canvas2d = canvas.getContext('2d');
            canvas2d.drawImage(img, 0, top*div, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(function (file) {
                waitSend.push({send: 'file', file: file, action: 'loadFoto'});
                wsSend({send: 'file', file: curfoto.textContent});
            },'image/png');
        } catch (err) {
            console.log('Error: ', err);
        }*/
        wsSend({action:'trimFoto', file: curfoto.textContent, width: width1, top: Math.round(top*div)});
    }
    this.processTrimFoto = function(q) {
        if (!q.result) {
            messageVisible(q.comment,3000, true);
        } else {
            if ('dataV' in curfoto) curfoto.dataV++; else curfoto.dataV=1;
            fotoMakeMain.disabled = fotoDelete.disabled = (curfoto == mainfoto);
            img.src = curfoto.title + '?'+curfoto.dataV
        }
    }
}
/************************* Контакты, поиск  ********************************/
function FindContact() {
    var section = document.getElementById('find');
    var searchDetails   = section.children[1];
    var els = searchDetails.children;
    var commandFind     = section.children[2].children[0];
    var clearFindFields =  section.children[2].children[1];
    var foundContacts   = section.children[3];
    var commandAddContact   = section.children[4].children[0];
    var clearFindContacts   = section.children[4].children[1];

    // Обработка изменения значений и пометок поисковых реквизитов
    searchDetails.onchange = function(e) {
        var elem = e.target;
        if (elem.type!=="checkbox") {
            if (elem.value.trim()) {
                elem.parentElement.firstElementChild.disabled = false;
                elem.parentElement.firstElementChild.checked  = true;
                commandFind.disabled     = false;
                clearFindFields.disabled = false;
                return false;
            } else {
                elem.parentElement.firstElementChild.checked  = false;
                elem.parentElement.firstElementChild.disabled = true;
            }
        } else if (elem.checked) {
            commandFind.disabled     = false;
            clearFindFields.disabled = false;
            return false;
        }
        var cleardisabled = true;
        for (var i=0; i < this.children.length; i++) {
            if (this.children[i].firstElementChild.checked) {
                commandFind.disabled     = false;
                clearFindFields.disabled = false;
                return false;
            } else if(this.children[i].lastElementChild.value.trim()) cleardisabled = false;
        }
        commandFind.disabled = true;
        clearFindFields.disabled = cleardisabled;
        return false;
    }
    // Обработка нажатия кнопки найти
    commandFind.onclick = function (e) {
        var query={action: 'findUsers'};
        for (var i=0; i < els.length; i++) {
            if (els[i].firstElementChild.checked) {
                query[els[i].lastElementChild.name]=els[i].lastElementChild.value;
            }
        }
        wsSend(query);
        return false;
    }
    // Обработка ответа поиск контактов
    this.processFindUsers = function (q) {
        if (q.data.length===0) {
            messageVisible("Контакты не найдены",2000, true);
        } else {
            document.getElementById('clearFindContacts').disabled = false;
            q.data.forEach(function (value) {
                foundContacts.insertAdjacentHTML('beforeend','<li data-id="'+value.idUser+'">'+value.fullName+'</li>');
            })
        }
    }
    // Обработка нажатия на найденный контакт
    foundContacts.onclick = function (e) {
        if (e.target.tagName==='LI') {
            if ('curLi' in this) this.curLi.style.backgroundColor='';
            this.curLi=e.target;
            e.target.style.backgroundColor = '#bbddff'
            commandAddContact.disabled=false;
            return false;
        }
    }
    // Обработка нажатия на Очистить поисковые поля
    clearFindFields.onclick = function (e) {
        if (els.length>0) {
            for (var i=0; i<els.length; i++) {
                elem=els[i];
                elem.firstElementChild.checked=false;
                elem.firstElementChild.disabled=true;
                elem.lastElementChild.value='';
            };
            commandFind.disabled = true;
            clearFindFields.disabled = true;
        }
    }
    // Обработка нажатия на Очистить найденные контакты
    clearFindContacts.onclick = function (e) {
        if ('curLi' in foundContacts) delete foundContacts.curLi;
        removeChildren(foundContacts,0);
        commandAddContact.disabled = true;
        clearFindContacts.disabled = true;
    }
    // Обработка нажатия клавиши Добавить контакт
    commandAddContact.onclick = function (e) {
        var idUserNew = foundContacts.curLi.dataset.id;
        for (var i=0; i < users.length; i++) {
            if (users[i].idUser == idUserNew) {
                messageVisible("Контакт: "+users[i].fullName+' уже существует.', 3000, true)
                foundContacts.curLi.remove();
                delete foundContacts.curLi;
                return false;
            }
        }
        wsSend({action: 'addUser', idUser: idUserNew});
    }
    return this;
}

