window.onload = () => {
    const myLiffId = '1654951421-nwJ0jYeb';
    const divLogin = document.getElementById('login_area');
    const divRegistration = document.getElementById('registration_area');

    liff
        .init({
            liffId:myLiffId
        })
        .then(()=>{
            liff.getProfile()
                .then(profile=>{
                    const lineId = profile.userId;
                    const nameElement = document.getElementById('line-name');
                    nameElement.innerHTML = profile.displayName + 'さま';

                    fetch(`api/link?line_uid=${lineId}`,{method:'GET'})
                        .then(response=>{response.text()
                            .then(text=>{
                                if(text ===''){
                                //     // リンクトークン未発行。連携済みの場合顧客データを取得する
                                //     const rankElement = document.getElementById('customer_rank');
                                //     const pointElement = document.getElementById('customer_point');
                                //     rankElement.innerHTML = '現在のランクは：' + JSON.parse(linkToken).rank + 'です。';
                                //     pointElement.innerHTML = '現在の保有ポイント：' + JSON.parse(linkToken).point + 'pt';
                                // }else{
                                    // リンクトークン発行。未連携の場合    
                                    const linkToken = text;
                                    const idElement = document.getElementById('lineid');
                                    idElement.innerHTML = linkToken;

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
        
                                }
                            });



                        });
                               
                })
                .catch(err=>console.log(err));
        })
        .catch(err=>alert(JSON.stringify(err)));

        
    }

