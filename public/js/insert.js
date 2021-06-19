const myLiffId = '1655847665-1vXlxN7N';
const divLogin = document.getElementById('login_area');

const param = decodeURI(new URL(location).search);
const splitParam = param.split('&');
const selectedTime = splitParam[0].slice(1);
const selectedMetal = splitParam[1];
let selectedStone = splitParam[2];
const selectedType = splitParam[3];
const messageId = splitParam[4];

liff
    .init({liffId:myLiffId})
    .then(()=>{
        if((new Date().getTime() - selectedTime)>60000){
            liff.closeWindow();
        }
        const photoElement = document.getElementById('shnPhoto');
        const photo_img = document.createElement('img');
        photo_img.src = `../img/shn_${messageId}.jpg`;
        photo_img.setAttribute('class','shnPhoto');
        photo_img.onerror = function() {liff.closeWindow();}
        photoElement.appendChild(photo_img);
    


        const formElement = document.getElementById('insertForm');

        document.getElementById('input_name').innerHTML = `${selectedMetal} ${(selectedStone =='その他' || selectedStone =='石なし')?'':selectedStone} ${selectedType}`;
        if(selectedStone !=='その他'){
            document.getElementById('sec_stone').style.display="none";
        }
        document.getElementById('input_sellPrice').setAttribute('type','number');
        document.getElementById('input_sellPrice').setAttribute('pattern','[0-9]*');
    
        // エラーコード表示エリア
        const label_error = document.getElementById('label_error')
    
        // 登録ボタン
        const insertButton = document.getElementById('btInsert');
        insertButton.addEventListener('click',()=>{
    
            var str = document.getElementById('input_stone').value;
            if( str.trim() === '' && selectedStone ==='その他'){
                label_error.textContent = '石種が入力されていません。';
            }else if(document.getElementById('input_sellPrice').value === ''){
                label_error.innerHTML = '売価を入力して下さい。';
                e.preventDefault();
            }else{

                let selectedStone2;
                if(selectedStone =='その他'){
                    selectedStone2 = document.getElementById("input_stone").value;
                }else{
                    selectedStone2 = selectedStone;
                };

                const data = new FormData(formElement);
                data.append('stone',selectedStone2);
                data.append('metal',selectedMetal);
                data.append('type',selectedType);
                data.append('messageId',messageId);

                fetch('/api/shn/insert',{
                    method:'POST',
                    body: data,
                    credentials: 'same-origin'
                })
                .then(response=>{
                    if(response.ok){response.text()
                        .then(text=>{
                            liff.sendMessages([{'type': 'text','text': `商品No：${text}`}]);
                        })
                        liff.closeWindow();
                    }else{
                        label_error.textContent = '入庫失敗';
                    }
                })
                .catch(e=>console.log(e));
    
            }
        });



    })
    .catch(err=>alert(`エラー：${JSON.stringify(err)}`));





