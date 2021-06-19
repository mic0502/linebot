const divLogin = document.getElementById('login_area');
const param = decodeURI(new URL(location).search);
const splitParam = param.split('&');
const inputBarcode = splitParam[0].slice(1);

window.addEventListener('load', async ()=>{
    try{
        var formData = new FormData() ;
        formData.append('barcode',inputBarcode);
        const response = await fetch('/api/shn/search',{
            method:'POST',
            body: formData
        })

        if(response.ok){
            const data = await response.json();
            if(data.length){
                createTable(data);
            }else{
                alert('一致する商品がありません。');
                document.location.href = `/select`;
            }
        }
     }catch(error){
        alert('データ読み込み失敗です');
    }
});

const createTable = (data) => {

    const formElement = document.getElementById('updateForm');

    const photoElement = document.getElementById('shnPhoto');
    const photo_img = document.createElement('img');
    photo_img.src = `../shn/${data[0].barcode}.jpg`;
    photo_img.setAttribute('class','shnPhoto');
    photoElement.appendChild(photo_img);


    document.getElementById('input_barcode').innerHTML = data[0].barcode;
    document.getElementById('input_purchaseDate').innerHTML = data[0].purchaseDate.substr(0,4) + '/' + data[0].purchaseDate.substr(4,2) + '/' + data[0].purchaseDate.substr(-2);
    document.getElementById('input_name').innerHTML = `${data[0].METAL_NAME} ${data[0].STONE_NAME} ${data[0].TYPE_NAME}`;
    document.getElementById('input_bikou').value = data[0].bikou;
    document.getElementById('input_sellPrice').value = data[0].sellPrice;
    document.getElementById('input_sellPrice').setAttribute('type','number');
    document.getElementById('input_sellPrice').setAttribute('pattern','[0-9]*');

    // エラーコード表示エリア
    const label_error = document.getElementById('label_error')

    // 更新ボタン
    const updateButton = document.getElementById('btUpdate');
    updateButton.addEventListener('click',()=>{

        if(document.getElementById('input_sellPrice').value === ''){
            label_error.innerHTML = '売価を入力して下さい。';
            e.preventDefault();
        }else if(document.getElementById('input_sellPrice').value == data[0].sellPrice && document.getElementById('input_bikou').value == data[0].bikou ){
            label_error.textContent = '変更された項目がありません。';
            e.preventDefault();
        }else{
            if( window.confirm( '上記の内容で変更して良いですか？') ) {
                const upData = new FormData(formElement);
                upData.append('barcode',inputBarcode);

                fetch('/api/shn/update',{
                    method:'POST',
                    body: upData,
                    credentials: 'same-origin'
                })
                .then(response=>{
                   alert('更新完了！');
                });
            }else{
                e.preventDefault();
            }
        }
    });

    // 印刷ボタン
    const printButton = document.getElementById('btPrint');
    printButton.addEventListener('click',()=>{
        window.open(`/print?${inputBarcode}&${data[0].METAL_NAME} ${data[0].STONE_NAME}&${document.getElementById('input_bikou').value}&${document.getElementById('input_sellPrice').value}`, '_blank')
    });

    // // 削除ボタン
    // const deleteButton = document.getElementById('btDelete');
    // deleteButton.addEventListener('click',()=>{
    //     if( window.confirm( '本当に削除して良いですか？') ) {
    //         formElement.submit();
    //     }else{
    //         e.preventDefault();
    //     }
    // });
    


};

