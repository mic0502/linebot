(()=>{

    const API_URL = 'https://linebot-linkapp.herokuapp.com/api/';
    const HEADERS = ['予約番号','顧客ID','　名前　','ランク','ポイント','　誕生日　','直近購入日','　　次回予約　　','　景品　'];
    const CLASSES = ['row-id','row-name','row-resist','row-cut','row-shampoo','row-color','row-spa','row-nextrev','row-nextrev'];

    window.addEventListener('load',()=>{
        fetchData();
    });
    
    const fetchData = async () => {
        try{
            const response = await fetch(API_URL);

            if(response.ok){
                const data = await response.json();
                createTable(data);
            }else{
                alert('HTTPレスポンスエラーです');
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
        
        data.users.forEach(usersObj=>{
        
            const aaa = `00${(new Date().getMonth() + 1)}`;
            const bbb = `00${new Date().getDate()}`;
            // 現在時刻のタイムスタンプ取得
            const now = `${new Date().getFullYear()}${aaa.slice(-2)}${bbb.slice(-2)}`;

            // data.reservationsからdata.usersのline_uidが一致するもの、かつ現在時刻より先の予約データのみを抽出
            const revData = data.reservations.filter(revObj1=>{
                return usersObj.line_id === revObj1.line_uid;
            }).filter(revObj2=>{
                return parseInt(revObj2.selecteddate.replace('/','').replace('/','')) > parseInt(now);
            });
            
            // revData.starttimeを日時文字列へ変換する
            const nextReservationDate = (revData.length) ? revData[0].selecteddate + ' ' + revData[0].selectedtime : '予約なし';

            // usersData配列へ配列を格納
            usersData.push([
                revData[0].id,
                usersObj.login_id,
                usersObj.name,
                usersObj.rank,
                usersObj.point,
                `${usersObj.birthday.slice(0,4)}/${usersObj.birthday.slice(4,6)}/${usersObj.birthday.slice(-2)}`,
                `${usersObj.recent_buy.slice(0,4)}/${usersObj.recent_buy.slice(4,6)}/${usersObj.recent_buy.slice(-2)}`,
                nextReservationDate,
                revData[0].menu
            ]);

        });
        
        // 次回予約日を計算し、usersDataへpushする
        const l = usersData.length+1;  //表題の分＋１している
        
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
                    // ２行目以降はユーザーデータを格納する要素とする
                    const td = document.createElement('td');
                    td.setAttribute('class',`uElements ${CLASSES[index]}`);
                    td.innerHTML = usersData[i-1][index];

                    // 施術時間をクリックした時の処理
                    if(index >= 0 && index <= 8){
                        td.addEventListener('click',(e)=>{
                            const x = e.pageX;
                            const y = e.pageY;
                            createCard(usersData[i-1],x,y);
                        });
                    }
                    tr.appendChild(td);
                }
            });
        }
        divElement.appendChild(table);
    }

    const createCard = (userDataArray,x,y) => {

        // カード本体の定義
        const divCard = document.createElement('div');
        divCard.setAttribute('class','text-white bg-primary card-user');
        divCard.style.top = `${y}px`;
        divCard.style.left = `${x/2}px`;

        // カードヘッダーの定義
        const divHeader = document.createElement('div');
        divHeader.setAttribute('class','card-header');
        divHeader.innerHTML = `お客さまID:${userDataArray[1]}`;
        divCard.appendChild(divHeader);
        
        // カードボディの定義
        const divBody = document.createElement('div');
        divBody.setAttribute('class','card-body');
        
        // form要素の生成
        const formElement = document.createElement('form');
        formElement.setAttribute('id','userForm');
        formElement.setAttribute('name','userInfo');
        formElement.setAttribute('method','post');
        
        // 名前入力フォームの生成
        const div_form_name = document.createElement('div');
        div_form_name.setAttribute('class','form-group');
        const label_name = document.createElement('label');
        label_name.setAttribute('class','label_user');
        label_name.innerHTML = '名前';
        div_form_name.appendChild(label_name);
        const input_name = document.createElement('input');
        input_name.setAttribute('type','text');
        input_name.setAttribute('class','form-control name-input');
        input_name.setAttribute('name','name');
        input_name.value = userDataArray[2];
        input_name.disabled = true;
        div_form_name.appendChild(input_name);
        formElement.appendChild(div_form_name);
        
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
            formElement.setAttribute('action',`api/users/${userDataArray[0]}`);
            
            //各インプットの入力をできるようにする
            input_cut.disabled = false;
            input_time.disabled = false;
            input_shampoo.disabled = false;
            
            //送信ボタンの生成
            const sendButton = document.createElement('input');
            sendButton.value = '送信';
            sendButton.type = 'button';
            sendButton.setAttribute('class','btn btn-warning card-button');
            
            //sendButtonクリック時の処理
            sendButton.addEventListener('click',(e)=>{
                e.preventDefault();
                const data = new FormData(formElement);
                fetch(`/api/users/${userDataArray[0]}`,{
                    method:'POST',
                    body:data,
                    creadentials:'same-origin'
                })
                .then(response=>{
                    // 画面を更新する
                    // response.selecteddate + ' ' + response.selectedtime;
                    // response.menu;
                    divCard.style.display = 'none';
                    alert('更新完了！');
                })
                .catch(e=>{
                    throw e;
                });
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
        
            // クリック時の処理を後で実装
            
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
            divCard.style.display = 'none';
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