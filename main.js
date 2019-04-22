const info = document.getElementById('info');
const headClose = document.getElementById('headClose');
const private = document.getElementById('private');
const private1 = document.getElementById('private1');
const private2 = document.getElementById('private2');
const dialog = document.getElementById('dialog');
const dialog1 = document.getElementById('dialog1');
const dialog2 = document.getElementById('dialog2');

private1.onclick = private2.onclick = function (e) {
    info.style.display = 'block';
    private.style.display = 'block';
}
dialog1.onclick = dialog2.onclick = function (e) {
    info.style.display = 'block';
    dialog.style.display = 'block';
}
headClose.onclick = function (e) {
    info.style.display = 'none';
    private.style.display = 'none';
    dialog.style.display = 'none';
}