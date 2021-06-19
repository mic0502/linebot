window.onload = () => {

// const myLiffId = '1654951421-mWwgz01J';
const myLiffId = '1654951421-mWwgz01J';

const param = new URL(location).search;
const splitParam = param.split('&');
const loginId = splitParam[0].slice(1);
    
    
liff
    .init({liffId:myLiffId})
    .then(()=>{
        liff.getProfile()
            .then( async profile=>{ 
                const line_uid = profile.userId;

                //権限チェック
                switch(await kengenCheck(line_uid)){
                    case '9':
                        searchKok(loginId);
                        break;
                    default:
                        alert('権限がありません。');
                        document.location.href = `https://jewelry-kajita.com`;
                }

            })
            .catch(err=>console.log(err));
    })
    .catch(err=>alert(JSON.stringify(err)));

    
};


function kengenCheck(line_uid){

    return new Promise((resolve,reject)=>{

    fetch(`/api/users/accountCheck?lineId=${line_uid}`,{method:'GET'})
    .then(response=>{
        if(response.ok){response.text()
            .then(text=>{
                resolve(text);
            })
        }else{
            alert('ログインされていません。');
            document.location.href = `https://jewelry-kajita.com`;
            reject;
        }
    })
    })

};


const searchKok = async (loginId) =>{
    //顧客データ検索
    const response = await fetch(`/api/users/select?loginId=${loginId}`,{method:'GET'})
    if(response.ok){
        const data = await response.json();
        dispKokInfo(data);
    }else{
        alert('権限読み込み失敗');
        document.location.href = `https://jewelry-kajita.com`;
    }
};


const dispKokInfo = (data) => {

    const formElement = document.getElementById('pointAddForm');
    const nameElement = document.getElementById('line_name');
    nameElement.innerHTML = data[0].name + 'さま';

    const kokTable = document.getElementById('kokTable');

    var tableTr1 = document.createElement('tr');
    var tableTh1 = document.createElement('th');
    tableTh1.innerHTML = '保有ポイント';
    var tableTd1 = document.createElement('td');
    tableTd1.innerHTML = data[0].point + ' pt';
    tableTr1.appendChild(tableTh1);
    tableTr1.appendChild(tableTd1);

    var tableTr2 = document.createElement('tr');
    var tableTh2 = document.createElement('th');
    tableTh2.innerHTML = '使用ポイント';
    var tableTd2 = document.createElement('td');
    const input_form2 = document.createElement('input');
    input_form2.setAttribute('type','text');
    input_form2.setAttribute('id','use-input');
    input_form2.setAttribute('class','text_input');
    input_form2.setAttribute('type','number');
    input_form2.setAttribute('pattern','[0-9]*');
    input_form2.setAttribute('name','use-point');
    input_form2.setAttribute('oninput','pointChange()');
    input_form2.value = 0;
    tableTd2.appendChild(input_form2);
    tableTr2.appendChild(tableTh2);
    tableTr2.appendChild(tableTd2);

    var tableTr3 = document.createElement('tr');
    var tableTh3 = document.createElement('th');
    tableTh3.innerHTML = 'お買上金額';
    var tableTd3 = document.createElement('td');
    const input_form3 = document.createElement('input');
    input_form3.setAttribute('type','text');
    input_form3.setAttribute('id','purchase');
    input_form3.setAttribute('class','text_input');
    input_form3.setAttribute('type','number');
    input_form3.setAttribute('pattern','[0-9]*');
    input_form3.setAttribute('name','purchase');
    input_form3.setAttribute('oninput','pointChange()');
    tableTd3.appendChild(input_form3);
    tableTr3.appendChild(tableTh3);
    tableTr3.appendChild(tableTd3);

    var tableTr4 = document.createElement('tr');
    var tableTh4 = document.createElement('th');
    tableTh4.innerHTML = '累計ポイント';
    var tableTd4 = document.createElement('td');
    tableTd4.setAttribute('name','totalPoint');
    tableTd4.innerHTML = data[0].point;
    tableTr4.appendChild(tableTh4);
    tableTr4.appendChild(tableTd4);


    // エラーコード表示エリア
    const label_error = document.getElementById('label_error')
    
    // 登録ボタン

    const divRegistration = document.createElement('div');
    const inputAddPoint = document.createElement('input');
    inputAddPoint.value = '登録';
    inputAddPoint.type = 'button';
    inputAddPoint.addEventListener('click',()=>{
        if(window.confirm( 'ポイント登録して良いですか？')) {
            const inputData = new FormData();
            inputData.append('loginId', data[0].login_id);
            inputData.append('totalPoint', tableTd4.textContent.replace(' pt',''));
            fetch( '/api/users/pointAdd', {
                method: 'POST',
                body: inputData
            })
            .then(response=>{
                if(response.ok){
                    alert('正常にポイント付与できました。');
                    liff.closeWindow();
                }else{
                    label_error.textContent = 'ポイント付与失敗！';
                }
            })
        }else{
            e.preventDefault();
        }
    });
    divRegistration.appendChild(inputAddPoint);

    kokTable.appendChild(tableTr1);
    kokTable.appendChild(tableTr2);
    kokTable.appendChild(tableTr3);
    kokTable.appendChild(tableTr4);
    formElement.appendChild(label_error);
    formElement.appendChild(divRegistration);

    function pointChange(){
        if(data[0].point -  input_form2.value >= 0){
            input_form2.value = Number(input_form2.value);
            //購入金額に応じて累計ポイント計算  保有ポイントー使用ポイント＋付与ポイント＝累計ポイント
            let addPoint = (((input_form3.value - input_form2.value) / 1.1 )* 0.05);
            tableTd4.innerHTML = Math.round(data[0].point -  input_form2.value + ((addPoint>0)?addPoint:0)) + ' pt';
            label_error.textContent = '　';
        }else{
            label_error.textContent = '保有ポイント以上は指定できません。';
            input_form2.value = 0;
        }
    }
    
    input_form2.oninput = pointChange;
    input_form3.oninput = pointChange;
    

};


