require('../../dotenv').config();

canvasElem.onmousemove = function(e) {
    let ctx = canvasElem.getContext('2d');
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  async function submit() {
    fetchData();
  }

  const AUTH = `Bearer ${process.env.ENV_CHANNEL_ACCESS_TOKEN}`;
  const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
  const fetchData = async () => {
      try{
          await sleep(3000);
          const response = await fetch('https://api.line.me/v2/bot/richmenu',{
              method:'POST',headers: {'Authorization': AUTH,'Content-Type': 'application/json'},
              body: {
                  "size":{
                      "width":1200,
                      "height":810
                  },
                  "selected":true,
                  "name":"操作メニュー Open/Close",
                  "chatBarText":"メニュー",
                  "areas":[
                      {
                          "bounds":{
                              "x":0,
                              "y":0,
                              "width":800,
                              "height":800
                          },
                          "action":{
                              "type":"uri",
                              "uri":"https://liff.line.me/1654951679-Ny54gwr6"
                          }
                      },
                      {
                          "bounds":{
                              "x":800,
                              "y":0,
                              "width":400,
                              "height":405
                          },
                          "action":{
                              "type":"uri",
                              "uri":"https://jewelry-kajita.com"
                          }
                      },
                      {
                          "bounds":{
                              "x":800,
                              "y":405,
                              "width":400,
                              "height":405
                          },
                          "action":{
                              "type":"uri",
                              "uri": "https://liff.line.me/1654951421-JM6vmP1n"
                          }
                      }
                  ]
                  }
          })
          alert('通過1')
          await sleep(3000);
          if(response.ok){response.text()
              .then(text=>{
                  const response2 = fetch(`https://api-data.line.me/v2/bot/richmenu/${text}/content`,{
                      method:'POST',headers: {'Authorization': AUTH,'Content-Type': 'image/png'},
                      body: ''
                  })
                  alert('通過2')
                  if(response2.ok){
                      const response3 = fetch(`https://api.line.me/v2/bot/user/all/richmenu/${text}`,{
                          method:'POST',headers: {'Authorization': AUTH}
                      })    
                      alert('通過3')
                      if(response3.ok){
                          alert('完了！')
                      }        
                  }
              })
      
          }
          
      }catch(error){
          alert('失敗です');
      }
  }





