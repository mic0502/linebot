
window.onload = () => {
    const myLiffId = '1654951421-nwJ0jYeb';
    const divLogin = document.getElementById('login_area');

    const connection = new Client({
        user:process.env.PG_USER,
        host:process.env.PG_HOST,
        database:process.env.PG_DATABASE,
        password:process.env.PG_PASSWORD,
        port:5432
      });
    connection.connect();
     
    liff
        .init({
            liffId:myLiffId
        })
        .then(()=>{

            liff.getProfile()
                .then(profile=>{
                    const lineId = profile.userId;                  
                    
                    // // 登録済のユーザーかどうがチェック
                    // const select_user_query = {
                    //     text:`SELECT * FROM users WHERE line_id='${lineId}';`
                    // }
                    // connection.query(select_user_query)
                    // .then(res=>{
                    //     if (res.rowCount > 0 ){
                    //     // すでに登録済の場合
                    //     console.log('登録済みアカウント');
                    //     return client.replyMessage(ev.replyToken,{
                    //         "type":"text",
                    //         "text":`${profile.displayName}さん、すでに連携済みです。`
                    //     });
                    //     }else{
                    //     // 未登録の場合
              
                        fetch(`api/link?line_uid=${lineId}`,{method:'GET'})
                            .then(response=>{
                                const idElement = document.getElementById('lineid');
                                // const queryParam = window.location.href;

                                let linkToken ='';
                                response.text()
                                    .then(text=>{
                                        linkToken = text;
                                        idElement.innerHTML = linkToken;
                                    });

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
                                input_form1.setAttribute('class','id-input');
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
                                input_form2.setAttribute('name','password');
                                div_form2.appendChild(input_form2);

                                // ログインボタン
                                const loginButton = document.createElement('input');
                                loginButton.value = 'ログイン';
                                loginButton.type = 'button';
                                loginButton.addEventListener('click',()=>{
                                    const data = new FormData(formElement);
                                    data.append('linkToken',linkToken);
                                    console.log(...data.entries());

                                    fetch('/api/users/login',{
                                        method:'POST',
                                        body: data,
                                        credentials: 'same-origin'
                                    })
                                    .then(response=>{
                                        if(response.ok){
                                            response.text()
                                                .then(text=>{
                                                    const url = `https://access.line.me/dialog/bot/${text}`;
                                                    console.log('url:',url);
                                                    document.location.href = url;
                                                })
                                        }else{
                                            alert('HTTPレスポンスエラーです');
                                        }
                                    })
                                    .catch(e=>console.log(e));
                                });

                                // フォーム要素にform1,form2,loginButtonを格納
                                formElement.appendChild(div_form1);
                                formElement.appendChild(div_form2);
                                formElement.appendChild(loginButton);

                                // フォーム要素を大元のdiv要素へ格納
                                divLogin.appendChild(formElement);
                            });
                        //     }
                        // });           
                    
                })
                .catch(err=>console.log(err));
        })
        .catch(err=>alert(JSON.stringify(err)));

        
    }

