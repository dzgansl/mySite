'use strict';
/*******************               Переслать файлы            **********************/
var exchange = null;
// Отобразить форму пересылки файлов
document.getElementById('exchangeKey').onclick = function () {
    if (!exchange) exchange = new Exchange();
    exchange.visible();
}

function Exchange() {
    const exchangeBlock = document.getElementById('exchangeBlock');
    const exchengeCut =  document.getElementById('exchangeCut');
    const countUpload = document.getElementById('countUpload');
    const countDownload = document.getElementById('countDownload');
    const countMessage = document.getElementById('countMessage');
    const sendListFile = document.getElementById('sendListFile');
    const labelFile = document.getElementById('labelFile');
    const sendFileInput = document.getElementById('sendFileInput');
    const countSendFiles = document.getElementById('countSendFiles');
    const appendElement = document.getElementById('appendElement');
    const receiveBlock = document.getElementById('receiveBlock');
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
    //прермещение окна
    dragAnObject(exchangeBlock, exchangeBlock.firstElementChild);
    // Чтение данных по обмену, пока  только idUser
    this.getData = function () {
        return {
            idUser: sendIdUser
        }
    }

    this.visible = function () {
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
    }
    // Обработка нажатия на кнопку скрыть
    document.getElementById('exchangeHide').onclick = function() {
        modal.hidden = true;
        exchangeBlock.hidden = true;
    }
    // Обработка нажатия на кнопку закрыть
    document.getElementById('exchangeExit').onclick = function (ev) {
        wsSend({idUser: sendIdUser, command: 'СбросОбмен'});
        exchangeClose();
    }

    // Управление вкладками
    exchengeCut.onclick = function (e) {
        var openBlock = controlCut(e);
        return false;
    }

    function receiveCutOnline() {
        controlCut({currentTarget: exchengeCut, target: document.getElementById('receiveBlockCut')})
    }

    function clearCountMessage() {
        document.getElementById('messengerBlockCut').children[0].textContent='0';
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
    this.commandOffer = function (q) {
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
    var exchangeClose = this.close = function () {
        sendIdUser = null;
        if (sendChannel) sendChannel.close();
        sendChannel = null;
        if (sendPC) sendPC.close();
        sendPC = null;
        console.log('Каналы и соединения закрыты');
        sendFile=null;
        receiveFile = null;
        modal.hidden = true;
        exchangeBlock.hidden = true;
    }
    // обмен Ice Candidate
    function onSendIceCandidate(evt) {
        if (!evt || !evt.candidate) return;
        wsSend({idUser: sendIdUser, candidateSend: evt.candidate });
    }

    this.candidateSend = function (q) {
        console.log("Получил ICECandidate-Send от удаленного партнера.");
        sendPC.addIceCandidate(new RTCIceCandidate(q.candidateSend));
    }
    // Обработка на стороне отправителя команды Ответ
    this.commandAnswer = function (q) {
        console.log("Получил sdp Answer от получателя.");
        try {
            sendPC.setRemoteDescription(new RTCSessionDescription(q.sdp));
            modal.hidden = false;
            exchangeBlock.hidden = false;
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
            if (exchangeBlock.hidden) {
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
                receiveElement.style.display = 'block';
                receiveElement.children[0].textContent = receiveFile.name;
                receiveElement.children[1].onclick = fileReceiveClear;
                receiveFile.buffer=[];
                receiveListFile.appendChild(receiveElement);
            } else if (data.type == 'message') {
                var element = messengerList.children[0].cloneNode(true);
                element.style.display = 'block';
                element.children[1].textContent = data.text;
                messengerList.appendChild(element);
                document.getElementById('messengerBlockCut').children[0].textContent ++;
                if (document.getElementById('messengerBlockCut').style.borderStyle !== 'outset') {
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
        element.style.display = 'block';
        element.children[1].textContent = myMessage.value;
        messengerList.appendChild(element);
        myMessage.value = '';
    }

}

