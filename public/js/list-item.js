const divLogin = document.getElementById('login_area');
const param = decodeURI(new URL(location).search);
const splitParam = param.split('&');
const inputBarcode = splitParam[0].slice(1);

if(inputBarcode){
    //バーコードが入力されている場合
    window.addEventListener('load',()=>{document.location.href = `/item?${inputBarcode}`;});
}else{
    //バーコードが入力されていない場合
    // const formElement = document.createElement('form');
    // formElement.setAttribute('id','login');
    // formElement.setAttribute('name','login_info');
    // formElement.setAttribute('method','post');
    
    // const div_photo = document.createElement('div');
    // const photo_img = document.createElement('img');
    // photo_img.src = `../shn/100.jpg`;
    // photo_img.setAttribute('class','shnPhoto');
    // photo_img.onerror = function() {liff.closeWindow();}
    // div_photo.appendChild(photo_img);
    
    
    // // div_form1は備考に関するlabel要素とinput要素で構成
    // const div_form1 = document.createElement('div');
    // const label_form1 = document.createElement('label');
    // label_form1.setAttribute('class','label_name');
    // label_form1.textContent = '備考';
    // div_form1.appendChild(label_form1);
    
    // const input_form1 = document.createElement('input');
    // input_form1.setAttribute('type','text');
    // input_form1.setAttribute('id','bikou-input');
    // input_form1.setAttribute('class','text_input');
    // input_form1.setAttribute('name','bikou');
    // div_form1.appendChild(input_form1);
    
    // // div_form2は上代に関するlabel要素とinput要素で構成
    // const div_form2 = document.createElement('div');
    // const label_form2 = document.createElement('label');
    // label_form2.setAttribute('class','label_name');
    // label_form2.textContent = '上代(税抜)';
    // div_form2.appendChild(label_form2);
    
    // const input_form2 = document.createElement('input');
    // input_form2.setAttribute('type','text');
    // input_form2.setAttribute('class','text_input');
    // input_form2.setAttribute('type','number');
    // input_form2.setAttribute('pattern','[0-9]*');
    // input_form2.setAttribute('name','sellPrice');
    // div_form2.appendChild(input_form2);
    
    // // エラーコード表示エリア
    // const div_error = document.createElement('span')
    // const label_error = document.createElement('label');
    // label_error.setAttribute('class','label_error');
    // label_error.textContent = '　';
    
    
    // // 登録ボタン
    // const loginButton = document.createElement('input');
    // loginButton.value = '登録';
    // loginButton.type = 'button';
    // loginButton.addEventListener('click',()=>{
    
    
    // });
    
    // div_error.appendChild(label_error);
    
    // // フォーム要素にform1,form2,loginButtonを格納
    // formElement.appendChild(div_photo);
    // formElement.appendChild(div_form1);
    // formElement.appendChild(div_form2);
    // formElement.appendChild(div_error);
    // formElement.appendChild(loginButton);
    
    // // フォーム要素を大元のdiv要素へ格納
    // divLogin.appendChild(formElement);

}





