window.onload = () => {

    // const myLiffId = '1654951421-nwJ0jYeb';  //本番
    const myLiffId = '1654951421-JM6vmP1n';  //テスト
    const divLogin = document.getElementById('login_area');
    const param = new URL(location).search;
    var barcode_form = document.createElement('svg');
    barcode_form.setAttribute('class','barcode');
    barcode_form.setAttribute('jsbarcode-value','123456789012');
    document.getElementById('body').appendChild(barcode_form)

    JsBarcode(".barcode").init();

    liff
        .init({
            liffId:myLiffId
        })
        .then(()=>{
            liff.getProfile()
                .then(profile=>{
                    const line_uid = profile.userId;
                    const nameElement = document.getElementById('line_name');
                    
                    fetch(`api/link/?line_uid=${line_uid}`,{method:'GET'})
                        .then(response=>{response.text()
                            .then(text=>{
                                const parsedBody = JSON.parse(text);
                                if(!parsedBody.linkToken){
                                    // リンクトークン未発行。連携済みの場合顧客データを取得する
                                    nameElement.innerHTML = parsedBody.name + 'さま';

                                    var setting_icn = document.createElement("a");
                                    setting_icn.href = `/update?name=${parsedBody.name}&id=${parsedBody.login_id}&password=${parsedBody.login_password}&lineuid=${line_uid}`;
                                    var setting_img = document.createElement('img');
                                    setting_img.src = '../img/setting.png';
                                    setting_icn.appendChild(setting_img)
                                    document.getElementById('setting').appendChild(setting_icn);

                                    const pointElement = document.getElementById('customer_point');
                                    pointElement.innerHTML = '現在の保有ポイント：' + parsedBody.point.toLocaleString() + 'pt';
                                    // クラス追加
                                    var medal_img = document.createElement('img');
                                    var rankup_img = document.createElement('img');
                                    switch (parsedBody.rank){
                                        case 'A':
                                            medal_img.src = '../img/medal-gold.jpg';
                                            rankup_img.src = '../img/rankup-gold.jpg';
                                            break;
                                        case 'B':
                                            medal_img.src = '../img/medal-silver.jpg';
                                            rankup_img.src = '../img/rankup-silver.jpg';
                                            break;
                                        case 'C':
                                            medal_img.src = '../img/medal-bronze.jpg';
                                            rankup_img.src = '../img/rankup-bronze.jpg';
                                            break;
                                        default:
                                            medal_img.src = '../img/medal-regular.jpg';
                                            rankup_img.src = '../img/rankup-regular.jpg';
                                      }
                                    document.getElementById('customer_medal').appendChild(medal_img);
                                    document.getElementById('customer_rankup').appendChild(rankup_img);

                                                                                                            
                                }else{
                                    if(param.indexOf('&')>0){
                                        // 新規作成画面から遷移してきた場合
                                        const splitParam = param.split('&');
                                        const param_id = splitParam[0].slice(4);
                                        const param_password = splitParam[1].slice(9);

                                        const data = {
                                            'id': param_id,
                                            'password': param_password,
                                            'line_uid': line_uid,
                                            'linkToken': parsedBody.linkToken
                                        };
                                        fetch('/api/users/login',{
                                            method:'POST',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify(data),
                                            credentials: 'same-origin'
                                        })
                                        .then(response=>{
                                            if(response.ok){
                                                response.text()
                                                    .then(text=>{
                                                        const url = `https://access.line.me/dialog/bot/${text}`;
                                                        document.location.href = url;
                                                    })
                                            }else if(response.status == 402){
                                                label_error.textContent = 'すでに他の端末でログインされています。';
                                            }else{
                                                label_error.textContent = '正しいIDとパスワードを入力してください。';
                                            }
                                        })
                                        .catch(e=>console.log(e));
                                    }else{
                                        // リンクトークン発行。未連携の場合    
                                        nameElement.innerHTML = profile.displayName + 'さま';

                                        const formElement = document.createElement('form');
                                        formElement.setAttribute('id','login');
                                        formElement.setAttribute('name','login_info');
                                        formElement.setAttribute('method','post');
                                        formElement.setAttribute('action','/api/users/login');　//POST先のアドレス
            
                                        // div_form1はログインIDに関するlabel要素とinput要素で構成
                                        const div_form1 = document.createElement('div');
                                        const label_form1 = document.createElement('label');
                                        label_form1.setAttribute('class','label_id');
                                        label_form1.textContent = 'ログインID';
                                        div_form1.appendChild(label_form1);
            
                                        const input_form1 = document.createElement('input');
                                        input_form1.setAttribute('type','text');
                                        input_form1.setAttribute('id','id-input');
                                        input_form1.setAttribute('class','id-input');
                                        input_form1.setAttribute('type','number');
                                        input_form1.setAttribute('pattern','[0-9]*');
                                        input_form1.setAttribute('name','id');
                                        div_form1.appendChild(input_form1);
            
                                        // div_form2はパスワードに関するlabel要素とinput要素で構成
                                        const div_form2 = document.createElement('div');
                                        const label_form2 = document.createElement('label');
                                        label_form2.setAttribute('class','label_password');
                                        label_form2.textContent = 'パスワード';
                                        div_form2.appendChild(label_form2);
            
                                        const input_form2 = document.createElement('input');
                                        input_form2.setAttribute('type','password');
                                        input_form2.setAttribute('class','password-input');
                                        input_form2.setAttribute('type','number');
                                        input_form2.setAttribute('pattern','[0-9]*');
                                        input_form2.setAttribute('name','password');
                                        div_form2.appendChild(input_form2);
            
                                        // エラーコード表示エリア
                                        const div_error = document.createElement('span')
                                        const label_error = document.createElement('label');
                                        label_error.setAttribute('class','label_error');
                                        label_error.textContent = 'IDとパスワードはスタッフにお尋ねください。';


                                        // ログインボタン
                                        const loginButton = document.createElement('input');
                                        loginButton.value = 'ログイン';
                                        loginButton.type = 'button';
                                        loginButton.addEventListener('click',()=>{
                                            const data = new FormData(formElement);
                                            data.append('line_uid',line_uid);
                                            data.append('linkToken',parsedBody.linkToken);
                                            console.log(...data.entries());

                                            fetch('/api/users/login',{
                                                method:'POST',
                                                body: data,
                                                credentials: 'same-origin'
                                            })
                                            .then(response=>{
                                                if(response.ok){response.text()
                                                    .then(text=>{
                                                        const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
                                                        (async () => {
                                                            await sleep(1000);
                                                            const url = `https://access.line.me/dialog/bot/${text}`;
                                                            document.location.href = url;
                                                            // liff.closeWindow()
                                                        //   liff.openWindow({
                                                        //       url: url,
                                                        //       external: false
                                                        //   });
                                                        })();
                                        
                                                    })
                                                }else if(response.status == 402){
                                                    label_error.textContent = 'すでに他の端末でログインされています。';
                                                }else{
                                                    label_error.textContent = '正しいIDとパスワードを入力してください。';
                                                }
                                            })
                                            .catch(e=>console.log(e));
                                        });

                                        div_error.appendChild(label_error);

                                        // フォーム要素にform1,form2,loginButtonを格納
                                        formElement.appendChild(div_form1);
                                        formElement.appendChild(div_form2);
                                        formElement.appendChild(div_error);
                                        formElement.appendChild(loginButton);
            
                                        // フォーム要素を大元のdiv要素へ格納
                                        divLogin.appendChild(formElement);

                                        const divRegistration = document.createElement('div');
                                        const label_registration = document.createElement('a');
                                        label_registration.href = '/registration'
                                        label_registration.textContent = '新規会員登録';
                                        divRegistration.appendChild(label_registration);
            
                                        divLogin.appendChild(divRegistration);
                                    }            
                                }
                            });

                        });
                               
                })
                .catch(err=>console.log(err));
        })
        .catch(err=>alert(JSON.stringify(err)));
        
}





