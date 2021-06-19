const divLogin = document.getElementById('login_area');
const param = decodeURI(new URL(location).search);

const nameElement = document.getElementById('line_name');
nameElement.innerHTML = `商品検索`;

const formElement = document.createElement('form');
formElement.setAttribute('id','login');
formElement.setAttribute('name','login_info');
formElement.setAttribute('method','post');
// formElement.setAttribute('action','/item');　//POST先のアドレス

// div_form2は上代に関するlabel要素とinput要素で構成
const div_form2 = document.createElement('div');
const label_form2 = document.createElement('label');
label_form2.setAttribute('class','label_name');
label_form2.textContent = '商品No';
div_form2.appendChild(label_form2);

const input_form2 = document.createElement('input');
input_form2.setAttribute('type','text');
input_form2.setAttribute('class','text_input');
input_form2.setAttribute('type','number');
input_form2.setAttribute('pattern','[0-9]*');
input_form2.setAttribute('id','barcode');
div_form2.appendChild(input_form2);

// エラーコード表示エリア
const div_error = document.createElement('span')
const label_error = document.createElement('label');
label_error.setAttribute('class','label_error');
label_error.textContent = '　';


// 登録ボタン
const loginButton = document.createElement('input');
loginButton.value = '検索';
loginButton.type = 'button';
loginButton.addEventListener('click',()=>{
    document.location.href = `/list-item?${document.getElementById("barcode").value}`;
});

div_error.appendChild(label_error);

// フォーム要素に項目を格納
formElement.appendChild(div_form2);
formElement.appendChild(div_error);
formElement.appendChild(loginButton);

// フォーム要素を大元のdiv要素へ格納
divLogin.appendChild(formElement);





