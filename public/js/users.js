(()=>{

    const API_URL = 'https://linebot-linkapp.herokuapp.com/api/';
    const HEADERS = ['ID','　　名前　　','ランク','ポイント','　　誕生日　　','最近の購入日','　　　次回予約　　　','　景品　'];
    const CLASSES = ['row-id','row-name','row-resist','row-cut','row-shampoo','row-color','row-spa','row-nextrev'];

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
        
            // 現在時刻のタイムスタンプ取得
            const now = new Date().getTime();
            
            // data.reservationsからdata.usersのline_uidが一致するもの、かつ現在時刻より先の予約データのみを抽出
            const revData = data.reservations.filter(revObj1=>{
                return usersObj.line_id === revObj1.line_uid;
            }).filter(revObj2=>{
                return parseInt(revObj2.starttime) > now;
            });
            
            // revData.starttimeを日時文字列へ変換する
            const nextReservationDate = (revData.length) ? timeConversion(parseInt(revData[0].starttime),1) : '予約なし';
                        
            // usersData配列へ配列を格納
            usersData.push([
                usersObj.login_id,
                usersObj.name,
                usersObj.rank,
                usersObj.point,
                `${usersObj.birthday.slice(-4)}/${usersObj.birthday.slice(4,5)}/${usersObj.birthday.slice(6,7)}`,
                usersObj.recent_buy,
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
                    tr.appendChild(td);
                }
            });
        }
        divElement.appendChild(table);
    }

    const timeConversion = (timestamp,mode) => {

        const date = new Date(timestamp);
        const y = date.getFullYear();
        const m = ("0" + (date.getMonth()+1)).slice(-2);
        const d = ("0" + date.getDate()).slice(-2);
        const h = ("0" + date.getHours()).slice(-2);
        const i = ("0" + date.getMinutes()).slice(-2);
        
        if(mode === 0){
            return `${y}/${m}/${d}`
        }else{
            return `${y}/${m}/${d} ${h}:${i}`
        }
    }

})();