(()=>{

    const API_URL = '/api/admin';
    const HEADERS = ['予約番号','顧客ID','　名前　','ランク','ポイント','　誕生日　','直近購入日','　　次回予約　　','　景品　'];
    const CLASSES = ['row-id','row-kokid','row-name','row-rank','row-point','row-birthday','row-recentbuy','row-reserve','row-menu'];

    window.addEventListener('load',()=>{
        fetchData();
    });
    
    const fetchData = async () => {
        try{
            const response = await fetch('/api/admin/selectReserve');

            if(response.ok){
                const data = await response.json();
                if(data.length){
                    createTable(data);
                }else{
                    alert('予約データがありません。');
                }
            }
         }catch(error){
            alert('データ読み込み失敗です');
        }
    }

    const createTable = (data) => {

        // div要素の取得
        const divElement = document.getElementById('usersPage');
        
        // data.usersを２次元配列の形にする
        const usersData = [];

        data.forEach(reservationsObj=>{
        
            // revData.starttimeを日時文字列へ変換する
            const birthdayDate = (reservationsObj.birthday != null && reservationsObj.birthday.length > 0)?`${reservationsObj.birthday.slice(0,4)}/${reservationsObj.birthday.slice(4,6)}/${reservationsObj.birthday.slice(-2)}`:'';
            const recentbuyDate = (reservationsObj.recent_buy != null && reservationsObj.recent_buy.length > 0)?`${reservationsObj.recent_buy.slice(0,4)}/${reservationsObj.recent_buy.slice(4,6)}/${reservationsObj.recent_buy.slice(-2)}`:'';
            const nextReservationDate = reservationsObj.selecteddate + ' ' + reservationsObj.selectedtime;
            
            // usersData配列へ配列を格納
            usersData.push([
                reservationsObj.id,
                reservationsObj.login_id,
                reservationsObj.name,
                reservationsObj.rank,
                reservationsObj.point,
                birthdayDate,
                recentbuyDate,
                nextReservationDate,
                reservationsObj.menu
            ]);

        });
        
        // 次回予約日を計算し、usersDataへpushする
        const l = usersData.length+1;  //表題の分＋１している        
        const aaa = `00${(new Date().getMonth() + 1)}`;
        const bbb = `00${new Date().getDate()}`;
        const now = `${new Date().getFullYear()}${aaa.slice(-2)}${bbb.slice(-2)}`;

        // テーブル要素の生成
        const table = document.createElement('table');
        table.setAttribute('id','usersTable');
        for(let i=0;i<l;i++){
            //tr要素の挿入
            const tr = table.insertRow(-1);
            HEADERS.forEach((value,index)=>{
                if(i===0){
                    // 最初の行は表題（th）とする
                    const th = document.createElement('th');
                    th.setAttribute('class',`uTitles`);
                    th.innerHTML = value;
                    tr.appendChild(th);
                }else{
                    // 過去の予約の列は色をグレーにする
                    if(index===0){if(parseInt(usersData[i-1][7].slice(0,10).replace('/','').replace('/','')) < parseInt(now)){
                        tr.setAttribute('class','uRowOld');
                    }else{
                        tr.setAttribute('class','uRow');
                    }}
                    // ２行目以降はユーザーデータを格納する要素とする
                    const td = document.createElement('td');
                    td.setAttribute('name',`${CLASSES[index]}`);
                    td.innerHTML = usersData[i-1][index];

                    // 施術時間をクリックした時の処理
                    if(index >= 0 && index <= 8){
                        td.addEventListener('click',(e)=>{
                            const x = e.pageX;
                            const y = e.pageY;
                            createCard(usersData[i-1],i-1,x,y);
                        });
                    }
                    tr.appendChild(td);
                }
            });
        }
        divElement.appendChild(table);
    }

    const createCard = (userDataArray,selectrow,x,y) => {

        if(document.getElementById("card-user") != null){
            document.getElementById('card-user').remove();
        }

        // カード本体の定義
        const divCard = document.createElement('div');
        
        divCard.setAttribute('class','text-white bg-primary card-user');
        divCard.setAttribute('id','card-user');
        divCard.style.top = `${y}px`;
        divCard.style.left = `${x/2}px`;

        // カードヘッダーの定義
        const divHeader = document.createElement('div');
        divHeader.setAttribute('class','card-header');
        divHeader.innerHTML = `[${userDataArray[0]}] ${userDataArray[2]}`;
        divCard.appendChild(divHeader);
        
        // カードボディの定義
        const divBody = document.createElement('div');
        divBody.setAttribute('class','card-body');
        
        // form要素の生成
        const formElement = document.createElement('form');
        formElement.setAttribute('id','userForm');
        formElement.setAttribute('name','userInfo');
        formElement.setAttribute('method','post');
                
        // 日付入力フォームの生成
        const div_form_cut = document.createElement('div');
        div_form_cut.setAttribute('class','form-group inline-block menu-time');
        const label_cut = document.createElement('label');
        label_cut.setAttribute('class','label_user');
        label_cut.innerHTML = '予約日付';
        div_form_cut.appendChild(label_cut);
        const input_cut = document.createElement('input');
        input_cut.setAttribute('type','text');
        input_cut.setAttribute('class','form-control time-input');
        input_cut.setAttribute('name','selecteddate');
        input_cut.value = userDataArray[7].slice(0,10);
        input_cut.disabled = true;
        div_form_cut.appendChild(input_cut);
        formElement.appendChild(div_form_cut);
        
        // 時間入力フォームの生成
        const div_form_time = document.createElement('div');
        div_form_time.setAttribute('class','form-group inline-block menu-time');
        const label_time = document.createElement('label');
        label_time.setAttribute('class','label_user');
        label_time.innerHTML = '予約時間';
        div_form_time.appendChild(label_time);
        const input_time = document.createElement('input');
        input_time.setAttribute('type','text');
        input_time.setAttribute('class','form-control time-input');
        input_time.setAttribute('name','selectedtime');
        input_time.value = userDataArray[7].slice(-5);
        input_time.disabled = true;
        div_form_time.appendChild(input_time);
        formElement.appendChild(div_form_time);
        
        // メニューの入力フォーム生成
        const div_form_shampoo = document.createElement('div');
        div_form_shampoo.setAttribute('class','form-group inline-block');
        const label_shampoo = document.createElement('label');
        label_shampoo.setAttribute('class','label_user');
        label_shampoo.innerHTML = '予約景品';
        div_form_shampoo.appendChild(label_shampoo);
        const input_shampoo = document.createElement('input');
        input_shampoo.setAttribute('type','text');
        input_shampoo.setAttribute('class','form-control time-input');
        input_shampoo.setAttribute('name','menu');
        input_shampoo.value = userDataArray[8];
        input_shampoo.disabled = true;
        div_form_shampoo.appendChild(input_shampoo);
        formElement.appendChild(div_form_shampoo);
        
        // 子要素の親要素へのappendChild
        divBody.appendChild(formElement);
        divCard.appendChild(divBody);
        
        // ボタン要素の作成
        const divButton = document.createElement('div');
        divButton.setAttribute('id','usercard-button-area');
        
        //編集ボタンの作成
        const editButton = document.createElement('input');
        editButton.setAttribute('class','btn btn-warning card-button');
        editButton.value = '編集';
        editButton.type = 'button';
        
        //編集ボタンクリック時の動作
        editButton.addEventListener('click',()=>{
            //formのactionを設定　paramとしてidをつける
            formElement.setAttribute('action',`api/admin/updateReserve/${userDataArray[0]}`);
            
            //各インプットの入力をできるようにする
            input_cut.disabled = false;
            input_time.disabled = false;
            input_shampoo.disabled = false;
            
            //送信ボタンの生成
            const sendButton = document.createElement('input');
            sendButton.value = '送信';
            sendButton.type = 'button';
            sendButton.setAttribute('class','btn-warning card-button');
            
            //sendButtonクリック時の処理
            sendButton.addEventListener('click',(e)=>{
                e.preventDefault();
                const data = new FormData(formElement);
                fetch(`/api/admin/updateReserve/${userDataArray[0]}`,{
                    method:'POST',
                    body:data,
                    creadentials:'same-origin'
                })
                .then(response=>{
                    response.json()
                    .then(data=>{
                        // テーブルを更新する
                        document.getElementsByName("row-reserve")[selectrow].textContent = data.selecteddate + ' ' + data.selectedtime;
                        document.getElementsByName("row-menu")[selectrow].textContent = data.menu;
                        userDataArray[7] = data.selecteddate + ' ' + data.selectedtime;
                        userDataArray[8] = data.menu;
                        document.getElementById('card-user').remove();
                        alert('更新完了！');
                    })        
                })
            });
            divButton.appendChild(sendButton);
            
            //編集ボタンと削除ボタンを消す
            deleteButton.style.display = 'none';
            editButton.style.display = 'none';
        });
        divButton.appendChild(editButton);
        
        //削除ボタンの作成
        const deleteButton = document.createElement('input');
        deleteButton.setAttribute('class','btn btn-danger card-button');
        deleteButton.value = '削除';
        deleteButton.type = 'button';
        deleteButton.addEventListener('click',()=>{
            fetch(`/api/admin/delReserve/${userDataArray[0]}`,{method:'POST'})
            .then(response=>{response.text()
                .then(text=>{
                    document.getElementById('card-user').remove();
                    alert(text);
                })
            })
        });
        divButton.appendChild(deleteButton);
        divCard.appendChild(divButton);
        
        //フッターの作成（フッター領域をクリックするとカードが消える）
        const divFooter = document.createElement('div');
        divFooter.setAttribute('class','card-footer text-center');
        divFooter.setAttribute('id','close-form');
        const closeButton = document.createElement('a');
        closeButton.setAttribute('class','closeButton');
        closeButton.textContent = '閉じる';
        divFooter.addEventListener('click',()=>{
            document.getElementById('card-user').remove();
        });
        divFooter.appendChild(closeButton);
        divCard.appendChild(divFooter);
        
        document.body.appendChild(divCard);

        // マウスイベント
        divHeader.onmousedown = (e) =>{
            let shiftX = e.clientX - divCard.getBoundingClientRect().left;
            let shiftY = e.clientY - divCard.getBoundingClientRect().top;
            const moveAt = (pageX,pageY) => {
                if(pageX-shiftX>=0){
                    divCard.style.left = pageX - shiftX + 'px';
                }else{
                    divCard.style.left = 0 + 'px';
                }
                if(pageY-shiftY>=0){
                    divCard.style.top = pageY - shiftY + 'px';
                }else{
                    divCard.style.top = 0;
                }
            }
            
            moveAt(e.pageX,e.pageY);
            
            const onMouseMove = (e) => {
                moveAt(e.pageX,e.pageY);
            }
            
            document.addEventListener('mousemove',onMouseMove);
            
            divHeader.onmouseup = () => {
                document.removeEventListener('mousemove',onMouseMove);
                divHeader.onmouseup = null;
            }
            
            divHeader.onmouseleave = () => {
                document.removeEventListener('mousemove',onMouseMove);
                divHeader.onmouseleave = null;
            }
        }
        
        // タッチイベント
        divHeader.ontouchstart = (event) =>{
            const e = event.changedTouches[0];
            let shiftX = e.clientX - divCard.getBoundingClientRect().left;
            let shiftY = e.clientY - divCard.getBoundingClientRect().top;
            
            const moveAt = (pageX,pageY) => {
                if(pageX-shiftX>=0){
                    divCard.style.left = pageX - shiftX + 'px';
                }else{
                    divCard.style.left = 0 + 'px';
                }
                if(pageY-shiftY>=0){
                    divCard.style.top = pageY - shiftY + 'px';
                }else{
                    divCard.style.top = 0;
                }
            }
            
            moveAt(e.pageX,e.pageY);
            
            const onMouseMove = (event) => {
                const e = event.changedTouches[0];
                moveAt(e.pageX,e.pageY);
            }
            
            document.addEventListener('touchmove',onMouseMove);
            
            divHeader.ontouchend = () => {
                document.removeEventListener('touchmove',onMouseMove);
                divHeader.ontouchend = null;
            }
        }
        
        divHeader.ondragstart = () => {
            return false;
        }

    }

})();