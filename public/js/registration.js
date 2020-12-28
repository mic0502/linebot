
window.onload = () => {
    const param = new URL(location).search;
    const splitParam = param.split('&');
    const errorId = splitParam[0].slice(1);    
    
    // 大元のdiv要素
    const divRegistration = document.getElementById('registration_area');

    // フォーム要素生成。ここに各label要素とinput要素を格納していく。
    const formElement = document.createElement('form');
    formElement.setAttribute('id','registration');
    formElement.setAttribute('name','user_info');
    formElement.setAttribute('method','post');
    formElement.setAttribute('action','/api/users');　//POST先のアドレス

    // div_form0は名前入力に関するlabel,input要素から構成
    const div_form0 = document.createElement('div');

    const label_form0 = document.createElement('label');
    label_form0.setAttribute('class','label_name');
    label_form0.textContent = '　　　名前';
    div_form0.appendChild(label_form0);

    const input_form0 = document.createElement('input');
    input_form0.setAttribute('type','text');
    input_form0.setAttribute('id','name-input');
    input_form0.setAttribute('class','name-input');
    input_form0.setAttribute('name','name');
    div_form0.appendChild(input_form0);

    // div_form1はログインID入力に関するlabel,input要素から構成
    const div_form1 = document.createElement('div');

    const label_form1 = document.createElement('label');
    label_form1.setAttribute('class','label_id');
    label_form1.textContent = 'ログインID';
    div_form1.appendChild(label_form1);

    const input_form1 = document.createElement('input');
    input_form1.setAttribute('type','text');
    input_form1.setAttribute('id','id-input');
    input_form1.setAttribute('class','id-input');
    input_form1.setAttribute('name','id');
    div_form1.appendChild(input_form1);

    // div_form2はログインID入力に関するlabel,input要素から構成
    const div_form2 = document.createElement('div');

    const label_form2 = document.createElement('label');
    label_form2.setAttribute('class','label_password');
    label_form2.textContent = 'パスワード';
    div_form2.appendChild(label_form2);

    const input_form2 = document.createElement('input');
    input_form2.setAttribute('type','text');
    input_form2.setAttribute('id','password-input');
    input_form2.setAttribute('class','password-input');
    input_form2.setAttribute('name','password');
    div_form2.appendChild(input_form2);

    // エラーコード表示エリア
    const div_error = document.createElement('span')
    const label_error = document.createElement('label');
    label_error.setAttribute('class','label_error');
    switch(errorId){
        case 'error01':
            label_error.textContent = '他の端末で連携済みのIDです。';
            break;
        default:
            label_error.textContent = '　';
    }
    div_error.appendChild(label_error);


    // 新規登録ボタン
    const registrationButton = document.createElement('input');
    registrationButton.value = '新規登録';
    registrationButton.type = 'submit';
    registrationButton.addEventListener('click',(e)=>{

        if(document.getElementById("name-input").value == ''){
            label_error.textContent = '名前を入力してください。';
            e.preventDefault();
        }else if(document.getElementById("id-input").value.length != 9){
            label_error.textContent = 'ログインIDは9桁です。';
            e.preventDefault();
        }else if(document.getElementById("password-input").value.length < 4){
            label_error.textContent = 'パスワードは４桁以上にしてください。';
            e.preventDefault();
        }else{
            var result = window.confirm( '登録内容は間違いありませんか？');
            if( result ) {
                formElement.submit();
            }else{
                e.preventDefault();
            }
        }
    })

    // フォーム要素へform0〜form2と新規登録ボタンを格納
    formElement.appendChild(div_form0);
    formElement.appendChild(div_form1);
    formElement.appendChild(div_form2);
    formElement.appendChild(div_error);
    formElement.appendChild(registrationButton);

    // フォーム要素を大元のdiv要素へ格納
    divRegistration.appendChild(formElement);

}