
window.onload = () => {

    const param = new URL(location).search;
    const splitParam = param.split('&');
    const name = decodeURIComponent(splitParam[0].slice(6));
    const id = splitParam[1].slice(3);
    const password = splitParam[2].slice(9);
    const lineId = splitParam[3].slice(8);
    const myLiffId = splitParam[4].slice(7);

    liff
    .init({
        liffId:myLiffId
    })
    .then(()=>{

        // 大元のdiv要素
    const divUpdate = document.getElementById('update_area');

    // フォーム要素生成。ここに各label要素とinput要素を格納していく。
    const formElement = document.createElement('form');
    formElement.setAttribute('id','registration');
    formElement.setAttribute('name','user_info');
    formElement.setAttribute('method','post');
    formElement.setAttribute('onsubmit','return cancelsubmit()');
    formElement.setAttribute('action','/api/users/confirm');　//POST先のアドレス

    // div_form0はID入力に関するlabel,input要素から構成
    const div_form0 = document.createElement('div');
    const label_form0 = document.createElement('label');
    label_form0.setAttribute('class','label_id');
    label_form0.textContent = 'ログインID';
    div_form0.appendChild(label_form0);

    const input_form0 = document.createElement('input');
    input_form0.setAttribute('type','text');
    input_form0.setAttribute('id','id-input');
    input_form0.setAttribute('class','id-input');
    input_form0.setAttribute('name','id');
    div_form0.appendChild(input_form0);


    // div_form1は名前入力に関するlabel,input要素から構成
    const div_form1 = document.createElement('div');
    const label_form1 = document.createElement('label');
    label_form1.setAttribute('class','label_name');
    label_form1.textContent = '　　　名前';
    div_form1.appendChild(label_form1);

    const input_form1 = document.createElement('input');
    input_form1.setAttribute('type','text');
    input_form1.setAttribute('id','name-input');
    input_form1.setAttribute('class','name-input');
    input_form1.setAttribute('name','name');
    div_form1.appendChild(input_form1);

    // div_form2はパスワード入力に関するlabel,input要素から構成
    const div_form2 = document.createElement('div');
    const label_form2 = document.createElement('label');
    label_form2.setAttribute('class','label_password');
    label_form2.textContent = 'パスワード';
    div_form2.appendChild(label_form2);

    const input_form2 = document.createElement('input');
    input_form2.setAttribute('type','text');
    input_form2.setAttribute('id','password-input');
    input_form2.setAttribute('class','password-input');
    input_form2.setAttribute('type','number');
    input_form2.setAttribute('pattern','[0-9]*');
    input_form2.setAttribute('name','password');
    div_form2.appendChild(input_form2);

    // エラーコード表示エリア
    const div_error = document.createElement('div')
    const label_error = document.createElement('label');
    label_error.setAttribute('class','label_error');
    label_error.textContent = '　';


    // 変更確認ボタン
    const updateButton = document.createElement('input');
    updateButton.value = '変更確認';
    updateButton.type = 'submit';
    updateButton.addEventListener('click',(e)=>{

        if((document.getElementById("name-input").value == name) && (document.getElementById("password-input").value == password)){
            label_error.textContent = '何も変更されていません。';
            e.preventDefault();
        }else if(document.getElementById("name-input").value == ''){
            label_error.textContent = '名前を入力してください。';
            e.preventDefault();
        }else if(document.getElementById("password-input").value.length < 4){
            label_error.textContent = 'パスワードは４桁以上にしてください。';
            e.preventDefault();
        }else{
            var result = window.confirm( '変更内容は間違いありませんか？');
            if( result ) {
                formElement.submit();
            }else{
                e.preventDefault();
            }
        }

    })
    div_error.appendChild(label_error);

    // 解除ボタン
    const releaseButton = document.createElement('input');
    releaseButton.value = '連携解除する';
    releaseButton.type = 'button';
    releaseButton.addEventListener('click',()=>{
        if(window.confirm( '本当に解除してよろしいですが。')) {
                liff.sendMessages([{
                    'type': 'text',
                    'text': '連携解除'
                }])            

            // fetch(`/api/link/release?line_uid=${lineId}`)
            // .then(response => response.text())
            // .then(text => {
            //     alert(text);
            // });
        }
    });

    // フォーム要素へform0〜form1と変更確認ボタンを格納
    formElement.appendChild(div_form0);
    formElement.appendChild(div_form1);
    formElement.appendChild(div_form2);
    formElement.appendChild(div_error);            
    formElement.appendChild(updateButton);
    formElement.appendChild(releaseButton);

    // フォーム要素を大元のdiv要素へ格納
    divUpdate.appendChild(formElement);

    document.getElementById('id-input').value = id;
    document.getElementById('name-input').value = name;
    document.getElementById('password-input').value = password;

})
    

}