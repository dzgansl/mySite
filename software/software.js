var curSoft = null;
var curNameSoft = null;
const description = document.getElementById('description');
const headSoftTxt = document.getElementById('headSoftTxt');
const headSoftHide = document.getElementById('headSoftHide');
const headSoftClose = document.getElementById('headSoftClose');
const nameEprica = document.getElementById('nameEprica');
const Eprica = document.getElementById('Eprica');
const nameKKM = document.getElementById('nameKKM');
const KKM = document.getElementById('KKM');
const nameLicense = document.getElementById('nameLicense');
const License = document.getElementById('License');
const nameAutoрarts = document.getElementById('nameAutoрarts');
const autoрarts = document.getElementById('autoрarts');
const nameScada= document.getElementById('nameScada');
const scada = document.getElementById('scada');
const nameAmoCRM= document.getElementById('nameAmoCRM');
const amoCRM = document.getElementById('amoCRM');
const nameCarService = document.getElementById('nameCarService');
const carService = document.getElementById('carService');
const nameOnlineHelper = document.getElementById('nameOnlineHelper');
const onlineHelper = document.getElementById('onlineHelper');
const nameNotes = document.getElementById('nameNotes');
const notes = document.getElementById('notes');

function newCurSoft(nameSoft,soft) {
    if(curSoft !== null) {
        if (curSoft === soft) {
            headSoftClose.onclick(null)
            return true;
        }
        curSoft.style.display='none';
        curNameSoft.style.color='#000000';
    }
    curSoft=soft;
    curNameSoft=nameSoft;
    headSoftTxt.textContent = nameSoft.querySelector('code').textContent;
    description.style.display = 'block';
    curSoft.style.display='block';
    curNameSoft.style.color='#ff0000';
}

headSoftClose.onclick = function (e) {
    curSoft.style.display='none';
    curNameSoft.style.color='#000000';
    curSoft=null;
    curNameSoft=null;
    headSoftTxt.textContent = '';
    description.style.display = 'none';
    if (headSoftHide.textContent.charCodeAt(0)!== 9664) {
        description.style.left="var(--marginleft2)";
        description.style.width="calc(var(--widthBlock) - var(--widthButton) - 13px)";
        headSoftHide.textContent = '\u25C0';
    }
}

headSoftHide.onclick = function (e) {
    if (headSoftHide.textContent.charCodeAt(0)=== 9664) {
        //description.style.top="0";
        description.style.left="0";
        description.style.width="100vw";
        //description.style.height="100vh";
        headSoftHide.textContent = '\u25B6';
    } else {
        //description.style.top="40px";
        description.style.left="var(--marginleft2)";
        description.style.width="calc(var(--widthBlock) - var(--widthButton) - 13px)";
        //description.style.height="100vh";
        headSoftHide.textContent = '\u25C0';
    }
}

nameEprica.onclick = function(e) {newCurSoft(nameEprica, Eprica);}
nameKKM.onclick = function(e) {newCurSoft(nameKKM, KKM);}
nameLicense.onclick = function(e) {newCurSoft(nameLicense, License);}
nameAutoрarts.onclick = function(e) {newCurSoft(nameAutoрarts, autoрarts);}
nameScada.onclick = function(e) {newCurSoft(nameScada, scada);}
nameAmoCRM.onclick = function(e) {newCurSoft(nameAmoCRM, amoCRM);}
nameCarService.onclick = function(e) {newCurSoft(nameCarService, carService);}
nameOnlineHelper.onclick = function(e) {newCurSoft(nameOnlineHelper, onlineHelper);}
nameNotes.onclick = function(e) {newCurSoft(nameNotes, notes);}


