const param = new URL(location).search;
const splitParam = param.split('&');
const id = splitParam[0].slice(1);
const password = splitParam[1];
const linkToken = splitParam[2];

document.getElementById('text_id').innerHTML = id;
document.getElementById('text_password').innerHTML = password;
document.getElementById('text_linkToken').innerHTML = linkToken;
