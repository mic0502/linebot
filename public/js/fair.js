(()=>{

    const HEADERS = ['フェアID','フェア名','店舗','フェア開始','フェア終了','メニュー変更日','ノベルティ'];
    const CLASSES = ['row-id','row-fairname','row-shop','row-datefrom','row-dateto','row-menuchange','row-menu'];

    window.addEventListener('load',()=>{
        fetchData();
    });
    
    const fetchData = async () => {
        try{
            const response = await fetch('/api/admin/selectFair');

            if(response.ok){
                const data = await response.json();
                if(data.length){
                    createTable(data);
                }else{
                    alert('フェアデータがありません。');
                }
            }
         }catch(error){
            alert('データ読み込み失敗です');
        }
    }

    // div要素の取得
    const divElement = document.getElementById('usersPage');
        
    const createTable = (data) => {

        // data.usersを２次元配列の形にする
        const usersData = [];

        data.forEach(customersObj=>{
        
            // revData.starttimeを日時文字列へ変換する
            const Date_from = (customersObj.date_from != null && customersObj.date_from.length > 0)?`${customersObj.date_from.slice(0,4)}/${customersObj.date_from.slice(4,6)}/${customersObj.date_from.slice(-2)}`:'';
            const Date_to = (customersObj.date_to != null && customersObj.date_to.length > 0)?`${customersObj.date_to.slice(0,4)}/${customersObj.date_to.slice(4,6)}/${customersObj.date_to.slice(-2)}`:'';
            const Date_menu_change = (customersObj.menu_change_date != null && customersObj.menu_change_date.length > 0)?`${customersObj.menu_change_date.slice(0,4)}/${customersObj.menu_change_date.slice(4,6)}/${customersObj.menu_change_date.slice(-2)}`:'';
            let shop_name = '';
            if(customersObj.shop === 2){shop_name = 'ポート'};

            // usersData配列へ配列を格納
            usersData.push([
                customersObj.id,
                customersObj.fair_name,
                shop_name,
                Date_from,
                Date_to,
                Date_menu_change,
                customersObj.menu
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
                    // 過去の予約の列は色をグレーにする
                    if((i % 2 ) != 0){
                        tr.setAttribute('class','uRow');
                    }else{
                        tr.setAttribute('class','uRow uRow2');
                    }
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


    //送信ボタンの生成
    const menuElement = document.createElement('form');
    const input_menu0 = document.createElement('input');
    input_menu0.setAttribute('type','radio');
    input_menu0.setAttribute('name','menuflg');
    input_menu0.setAttribute('checked','checked');
    const label_menu0 = document.createElement('span');
    label_menu0.innerHTML = '通常メニュー';
    menuElement.appendChild(input_menu0);
    menuElement.appendChild(label_menu0);

    const input_menu1 = document.createElement('input');
    input_menu1.setAttribute('type','radio');
    input_menu1.setAttribute('name','menuflg');
    const label_menu1 = document.createElement('span');
    label_menu1.innerHTML = 'フェアメニュー';
    menuElement.appendChild(input_menu1);
    menuElement.appendChild(label_menu1);

    const menuButton = document.createElement('input');
    menuButton.value = '送信';
    menuButton.type = 'button';
    menuButton.setAttribute('class','btn-warning card-button');
    menuButton.addEventListener('click',(e)=>{
        let menu_flg = 0;
        if(input_menu1.checked){menu_flg = 1;}

        fetch(`/api/admin/menuChange/${menu_flg}`,{method:'POST'})
        .then(response=>{
            if(response.ok){
                alert("メニュー変更完了")
            }
        })
    });
    menuElement.appendChild(menuButton);        
    divElement.appendChild(menuElement);

})();