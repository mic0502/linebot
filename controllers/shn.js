const User = require('../models/User');
const line = require('@line/bot-sdk');
const client = new line.Client({channelAccessToken: process.env.ENV_CHANNEL_ACCESS_TOKEN});
const fs = require('fs');
const sharp = require("sharp");

const metalData = [];
const stoneData = [];
const typeData = [];

module.exports = {

    downloadData : () => {
      return new Promise((resolve, reject) => {
        //素材と石質と形状データダウンロード
        if(metalData.length == 0){
          downloadItemData();
        }else{
          return resolve('完了！');
        }

        function downloadItemData() {
          User.dbQuery(`SELECT wp_terms.term_id AS ID,wp_terms.name AS NAME FROM wp_terms,wp_term_taxonomy WHERE wp_terms.term_id = wp_term_taxonomy.term_id AND wp_term_taxonomy.taxonomy = 'pa_metal' ORDER BY wp_terms.term_id;`,'素材データダウンロード')
            .then(res=>{
              res.forEach(resData=>{metalData.push({id:resData['ID'],text:resData['NAME']});})
              return resolve('完了！')
            }).catch(() => {
              return reject('失敗！')
            })
            
          User.dbQuery(`SELECT wp_terms.term_id AS ID,wp_terms.name AS NAME FROM wp_terms,wp_term_taxonomy WHERE wp_terms.term_id = wp_term_taxonomy.term_id AND wp_term_taxonomy.taxonomy = 'product_tag' ORDER BY wp_term_taxonomy.count,wp_terms.term_id;`,'石質データダウンロード')
            .then(res=>{
              res.forEach(resData=>{stoneData.push({id:resData['ID'],text:resData['NAME']});})
            })
          User.dbQuery(`SELECT wp_terms.term_id AS ID,wp_terms.name AS NAME FROM wp_terms,wp_term_taxonomy WHERE wp_terms.term_id = wp_term_taxonomy.term_id AND wp_term_taxonomy.taxonomy = 'product_cat' ORDER BY wp_terms.term_id;`,'形状データダウンロード')
            .then(res=>{
              res.forEach(resData=>{typeData.push({id:resData['ID'],text:resData['NAME']});})
            })
        }
      })

    },

    savePhoto : async (messageId) => {
      
      try {
        const downloadPath = `./public/img/shn_${messageId}.jpg`;

        //画像の仮保存
        await downloadContent(messageId, downloadPath);      

        function downloadContent(messageId, downloadPath) {
            return client.getMessageContent(messageId)
              .then((stream) => new Promise((resolve, reject) => {
                const writable = fs.createWriteStream(downloadPath);

                stream.pipe(writable);
                stream.on('end', () => resolve(downloadPath));
                stream.on('error', reject);
            }));
        }
      } catch(e) {
        return reject('失敗！')
      }  
    },

    selectMetal: async (lineId) => {

      // 権限があるかチェック
      switch( await checkKok(lineId)){
        case 9:
          return metalJson = makeMetalJson();
        default:
          return {"type":"text","text":"画像送信ありがとうございます。\n\n申し訳ございません。こちらから個別のご返信はできません。"}
      }

      function checkKok(lineId) {
        return new Promise((resolve, reject) => {
          const selectQuery = `SELECT * FROM TM_KOK WHERE line_id = '${lineId}'`;
          User.dbQuery(selectQuery,'権限チェック')
            .then(kokRes=>{
              if(kokRes){
                if(kokRes[0].sbt === '9'){
                  resolve(9); //権限があり
                }else{
                  resolve(1); //権限がない
                }
              }else{
                resolve(0);   //ログインされていない
              }
            })
            .catch(e=>console.log(e))
        })

      }

      function makeMetalJson(){
        // 素材データJSONを組み立てる
        let metalJson = '{"type": "box","layout": "vertical","spacing": "md","contents": ['
        for (var i = 0; i < metalData.length; i++) {
          if(i%3===0){metalJson = metalJson + '{"type": "box","layout": "horizontal","margin": "md","contents":[';}
          metalJson = metalJson + `{"type": "button","action": {"type": "postback","label": "${metalData[i].text}","data": "${new Date().getTime()}&shn&metal&${metalData[i].text}"},"flex": 1,"adjustMode": "shrink-to-fit","style": "primary","color": "#00AA00","margin": "md"},`
          if(i%3===2){metalJson = metalJson.slice( 0, -1 );metalJson = metalJson + "]},";}
        }
        if((i-1)%3!==2){metalJson = metalJson + `{"type": "filler","flex": ${3-(i%3)}}]}]}`;}else{metalJson = metalJson.slice( 0, -1 ) + ']}';}
        
        // JSON形式でメッセージを返す
        return {
          "type":"flex",
          "altText":"素材選択",
          "contents":
            {
              "type": "bubble",
              "header": {"type": "box","layout": "vertical","contents": [{"type": "text","text": "【素材選択】","wrap": true,"size": "lg","align": "center"}]},
              "body": JSON.parse(metalJson)
            }
        };
      }

    },  

    selectStone: (selectedMetal) => {

      // 石質データJSONを組み立てる
      let stoneJson = '{"type": "box","layout": "vertical","spacing": "md","contents": ['
      for (var i = 0; i < stoneData.length; i++) {
        if(i%3===0){stoneJson = stoneJson + '{"type": "box","layout": "horizontal","margin": "md","contents":[';}
        if(stoneData[i].text !=='石なし'){
          stoneJson = stoneJson + `{"type": "button","action": {"type": "postback","label": "${stoneData[i].text}","data": "${new Date().getTime()}&shn&stone&${selectedMetal}&${stoneData[i].text}"},"flex": 1,"adjustMode": "shrink-to-fit","style": "primary","color": "#00AA00","margin": "md"},`
        }
        if(i%3===2){stoneJson = stoneJson.slice( 0, -1 );stoneJson = stoneJson + "]},";}
      }
      if((i-2)%3!==2){stoneJson = stoneJson + `{"type": "filler","flex": ${3-((i-1)%3)}}]}]}`;}else{stoneJson = stoneJson.slice( 0, -1 ) + ']}';}
      
      // JSON形式でメッセージを返す
      return {
        "type":"flex",
        "altText":"石種選択",
        "contents":
          {
            "type": "bubble",
            "header": {"type": "box","layout": "vertical","contents": [{"type": "text","text": "【石種選択】","wrap": true,"size": "lg","align": "center"}]},
            "body": JSON.parse(stoneJson),
            "footer": {"type": "box","layout": "vertical","contents": [{"type": "box","layout": "horizontal","contents": 
                  [
                    {"type": "button","action": {"type": "postback","label": "石なし","data": `${new Date().getTime()}&shn&stone&${selectedMetal}&石なし`},"flex": 1,"adjustMode": "shrink-to-fit","style": "primary","color": "#00AA00","margin": "md"},
                    {"type": "button","action": {"type": "postback","label": "その他","data": `${new Date().getTime()}&shn&stone&${selectedMetal}&その他`},"flex": 1,"adjustMode": "shrink-to-fit","style": "primary","color": "#00AA00","margin": "md"}
                  ]
                },
                {"type": "text","text": "※一覧にない場合は「その他」を選択。","margin": "md"}
              ]
            }
          }
      };

    },

    selectType: (selectedMetal,selectedStone,messageId) => {

      let encodeUrl;
      // 形状データJSONを組み立てる
      let typeJson = '{"type": "box","layout": "vertical","spacing": "md","contents": ['
      for (var i = 0; i < typeData.length; i++) {
        if(i%3===0){typeJson = typeJson + '{"type": "box","layout": "horizontal","margin": "md","contents":[';}
        encodeUrl = JSON.stringify(encodeURI(`https://liff.line.me/1655847665-1vXlxN7N?${new Date().getTime()}&${selectedMetal}&${selectedStone}&${typeData[i].text}&${messageId}`));
        typeJson = typeJson + `{"type": "button","action": {"type": "uri","label": "${typeData[i].text}","uri": ${encodeUrl}},"flex": 1,"adjustMode": "shrink-to-fit","style": "primary","color": "#00AA00","margin": "md"},`
        if(i%3===2){typeJson = typeJson.slice( 0, -1 );typeJson = typeJson + "]},";}
      }
      if((i-1)%3!==2){typeJson = typeJson + `{"type": "filler","flex": ${3-(i%3)}}]}]}`;}else{typeJson = typeJson.slice( 0, -1 ) + ']}';}
      
      // JSON形式でメッセージを返す
      return {
        "type":"flex",
        "altText":"形状選択",
        "contents":
          {
            "type": "bubble",
            "header": {"type": "box","layout": "vertical","contents": [{"type": "text","text": "【形状選択】","wrap": true,"size": "lg","align": "center"}]},
            "body": JSON.parse(typeJson)
          }
      };

    },

    insertShn: async (req,res) => {
      try{
        const {bikou,sellPrice,metal,type,messageId} = req.body;
        const stone = zenkakuToHankaku(hankaku2Zenkaku(req.body.stone));

        // 素材、石質、形状を検索してそれぞれのIDを取得する
        const metalObj = metalData.filter(object => {return object.text === metal;})
        let stoneObj = stoneData.filter(object => {return object.text === stone;})
        const typeObj = typeData.filter(object => {return object.text === type;})

        if(stoneObj.length >0){
          if(stoneObj[0].text !== 'その他'){await updateStone(stoneObj[0].id)};      //石種がその他以外の場合カウントアップ
        }else{
          await insertStone(stone);               //石質が未登録の場合、新たに登録する
        };

        //①ポスト追加
        const [barcode,postId] = await insertPost(`${metal}${stone}${type}`,bikou);

        //サムネイルポスト追加
        const imgPostId = await insertImgPost(barcode);

        //③ポストメタ追加
        await insertMeta(postId,barcode,imgPostId,sellPrice);

        //④ターム追加
        await insertTerm(postId,metalObj[0].id,stoneObj[0].id,typeObj[0].id);

        //⑤wp_wc_product_meta_lookup追加
        await inserWcProductMeta(postId,sellPrice);

        //⑥画像処理
        gazoShori(messageId,barcode);

        //成功を返す
        res.status(200).send(`'${barcode}'`);


      }catch(error){
        res.status(400).send('入庫失敗');
      }

      

      function insertStone(stone){
        return new Promise((resolve, reject) => {
          const insertQuery = `INSERT INTO wp_terms (name,slug) VALUES ('${stone}','${stone}');`
          User.dbQuery(insertQuery,'石質追加')
              .then(insertRes=>{
                User.dbQuery('SELECT MAX(term_id)) as id,name FROM wp_terms','termId取得')
                .then(selId=>{
                  stoneObj.push({id:selId[0].id,text:selId[0].name});
                  stoneData.push({id:selId[0].id,text:selId[0].name});
                  return resolve('成功');
                })
              })
        })
      }

      function updateStone(stoneId){
        return new Promise((resolve, reject) => {
          const select_query = `SELECT count(*) as stoneCount FROM wp_term_taxonomy,wp_term_relationships WHERE wp_term_taxonomy.term_taxonomy_id = wp_term_relationships.term_taxonomy_id AND wp_term_taxonomy.term_id=${stoneId};`
          User.dbQuery(select_query,'石質のカウント')
              .then(checkRes=>{
                const stoneCount = checkRes[0].stoneCount + 1;
                update_query = `UPDATE wp_term_taxonomy SET count = ${stoneCount} WHERE term_id=${stoneId};`
                User.dbQuery(update_query,'石質カウント更新')
                  .then(updateRes=>{
                    return resolve('完了！');
                  })
              })
        })
      }

      function zenkakuToHankaku(mae){
        let zen = new Array(
            'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ'
          ,'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト'
          ,'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ'
          ,'マ','ミ','ム','メ','モ','ヤ','ヰ','ユ','ヱ','ヨ'
          ,'ラ','リ','ル','レ','ロ','ワ','ヲ','ン'
          ,'ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ'
          ,'ダ','ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ'
          ,'パ','ピ','プ','ペ','ポ'
          ,'ァ','ィ','ゥ','ェ','ォ','ャ','ュ','ョ','ッ'
          ,'゛','°','、','。','「','」','ー','・'
        );
        
        let han = new Array(
            'ｱ','ｲ','ｳ','ｴ','ｵ','ｶ','ｷ','ｸ','ｹ','ｺ'
          ,'ｻ','ｼ','ｽ','ｾ','ｿ','ﾀ','ﾁ','ﾂ','ﾃ','ﾄ'
          ,'ﾅ','ﾆ','ﾇ','ﾈ','ﾉ','ﾊ','ﾋ','ﾌ','ﾍ','ﾎ'
          ,'ﾏ','ﾐ','ﾑ','ﾒ','ﾓ','ﾔ','ｲ','ﾕ','ｴ','ﾖ'
          ,'ﾗ','ﾘ','ﾙ','ﾚ','ﾛ','ﾜ','ｦ','ﾝ'
          ,'ｶﾞ','ｷﾞ','ｸﾞ','ｹﾞ','ｺﾞ','ｻﾞ','ｼﾞ','ｽﾞ','ｾﾞ','ｿﾞ'
          ,'ﾀﾞ','ﾁﾞ','ﾂﾞ','ﾃﾞ','ﾄﾞ','ﾊﾞ','ﾋﾞ','ﾌﾞ','ﾍﾞ','ﾎﾞ'
          ,'ﾊﾟ','ﾋﾟ','ﾌﾟ','ﾍﾟ','ﾎﾟ'
          ,'ｧ','ｨ','ｩ','ｪ','ｫ','ｬ','ｭ','ｮ','ｯ'
          ,'ﾞ','ﾟ','､','｡','｢','｣','ｰ','･'
        );
        
        let ato = "";
        
        for (let i=0;i<mae.length;i++){
          let maechar = mae.charAt(i);
          let zenindex = zen.indexOf(maechar);
          if(zenindex >= 0){
            maechar = han[zenindex];
          }
          ato += maechar;
        }
        
        return ato;
      }

      function hankaku2Zenkaku(str) {
        return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
      }

      function insertPost(itemName,bikou){
        return new Promise((resolve, reject) => {
          // 商品番号を取得する
          User.dbQuery(`SELECT count(*) as shnNo FROM wp_posts WHERE POST_TYPE = 'product'`,'商品番号取得')
          .then(reShn=>{
            const barcode = reShn[0].shnNo + 1;
            const now = new Date();
            const insertQuery = `INSERT INTO wp_posts (post_date,post_date_gmt,post_content,post_title,post_excerpt,comment_status,ping_status,post_name,to_ping,pinged,post_modified,post_modified_gmt,post_content_filtered,menu_order,post_type) VALUES ` +
                                `('${now.toLocaleString("ja")}','${new Date(now - (9000 * 60 * 60)).toLocaleString("ja")}','','${itemName}','${bikou}','closed','closed','${barcode}','','','${now.toLocaleString("ja")}','${new Date(now - (9000 * 60 * 60)).toLocaleString("ja")}','',0,'product')`;
            User.dbQuery(insertQuery,'wp_posts更新')
              .then(insRes=>{
                User.dbQuery('SELECT MAX(ID) as newId FROM wp_posts','postId取得')
                  .then(selId=>{
                    return resolve([barcode,selId[0].newId]);
                  })
              })
  
            })
        })      
      }

      function insertImgPost(barcode){
        return new Promise((resolve, reject) => {
          const imagePath = `${process.env.ENV_PATH}/item_image/${barcode}.img`;
          const now = new Date();
          const insertQuery = `INSERT INTO wp_posts (post_date,post_date_gmt,post_content,post_title,post_excerpt,post_status,comment_status,ping_status,post_name,to_ping,pinged,post_modified,post_modified_gmt,post_content_filtered,guid,menu_order,post_type,post_mime_type) VALUES ` +
                              `('${now.toLocaleString("ja")}','${new Date(now - (9000 * 60 * 60)).toLocaleString("ja")}','','${barcode}','','inherit','closed','closed','${barcode}','','','${now.toLocaleString("ja")}','${new Date(now - (9000 * 60 * 60)).toLocaleString("ja")}','','${imagePath}',0,'attachment','image/jpeg')`;
          User.dbQuery(insertQuery,'wp_posts更新')
            .then(insRes=>{
              User.dbQuery('SELECT MAX(ID) as newId FROM wp_posts','postId取得')
                .then(selId=>{
                  return resolve(selId[0].newId);
                })
            })
        })      
      }

      function insertMeta(postId,barcode,imgId,price){
        return new Promise((resolve, reject) => {
          const insertQuery = `INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES ` + 
                              `(${postId},'_edit_last','1'),` + 
                              `(${postId},'_edit_lock','1623576916:1'),` + 
                              `(${postId},'_thumbnail_id',${imgId}),` + 
                              `(${postId},'_regular_price',${price}),` + 
                              `(${postId},'total_sales','0'),` + 
                              `(${postId},'_tax_status','taxable'),` + 
                              `(${postId},'_tax_class',''),` + 
                              `(${postId},'_manage_stock','yes'),` + 
                              `(${postId},'_backorders','no'),` + 
                              `(${postId},'_sold_individually','yes'),` + 
                              `(${postId},'_virtual','no'),` + 
                              `(${postId},'_downloadable','no'),` + 
                              `(${postId},'_download_limit','-1'),` + 
                              `(${postId},'_download_expiry','-1'),` + 
                              `(${postId},'_stock','1'),` + 
                              `(${postId},'_stock_status','instock'),` + 
                              `(${postId},'_wc_average_rating','0'),` + 
                              `(${postId},'_wc_review_count','0'),` + 
                              `(${postId},'_product_version','5.4.1'),` + 
                              `(${postId},'_price','${price}'),` + 
                              `(${imgId},'_wp_attached_file','item_image/${barcode}.jpg'),` + 
                              `(${imgId},'_wp_attachment_metadata','a:5:{s:5:"width";i:500;s:6:"height";i:500;s:4:"file";s:20:”item_image/${barcode}.jpg";s:5:"sizes";a:6:{s:6:"medium";a:4:{s:4:"file";s:20:"${barcode}-300x300.jpg";s:5:"width";i:300;s:6:"height";i:300;s:9:"mime-type";s:10:"image/jpeg";}s:9:"thumbnail";a:4:{s:4:"file";s:20:"${barcode}-150x150.jpg";s:5:"width";i:150;s:6:"height";i:150;s:9:"mime-type";s:10:"image/jpeg";}s:21:"woocommerce_thumbnail";a:5:{s:4:"file";s:20:"${barcode}-300x300.jpg";s:5:"width";i:300;s:6:"height";i:300;s:9:"mime-type";s:10:"image/jpeg";s:9:"uncropped";b:0;}s:29:"woocommerce_gallery_thumbnail";a:4:{s:4:"file";s:20:"${barcode}-100x100.jpg";s:5:"width";i:100;s:6:"height";i:100;s:9:"mime-type";s:10:"image/jpeg";}s:12:"shop_catalog";a:4:{s:4:"file";s:20:"${barcode}-300x300.jpg";s:5:"width";i:300;s:6:"height";i:300;s:9:"mime-type";s:10:"image/jpeg";}s:14:"shop_thumbnail";a:4:{s:4:"file";s:20:"${barcode}-100x100.jpg";s:5:"width";i:100;s:6:"height";i:100;s:9:"mime-type";s:10:"image/jpeg";}}s:10:"image_meta";a:12:{s:8:"aperture";s:1:"0";s:6:"credit";s:0:"";s:6:"camera";s:0:"";s:7:"caption";s:0:"";s:17:"created_timestamp";s:1:"0";s:9:"copyright";s:0:"";s:12:"focal_length";s:1:"0";s:3:"iso";s:1:"0";s:13:"shutter_speed";s:1:"0";s:5:"title";s:0:"";s:11:"orientation";s:1:"0";s:8:"keywords";a:0:{}}}`
          User.dbQuery(insertQuery,'wp_postmeta追加')
          .then(insRes=>{
            return resolve('成功');
          })

        })      
      }

      function insertTerm(postId,metalId,stoneId,typeId){
        return new Promise((resolve, reject) => {
          const insertQuery = `INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES ` + 
                              `(${postId},${metalId}),` + 
                              `(${postId},${stoneId}),` + 
                              `(${postId},${typeId}),` + 
                              `(${postId},12)`
          User.dbQuery(insertQuery,'wp_term_relationships追加')
          .then(insRes=>{
            return resolve('成功');
          })

        })   
      }

      function inserWcProductMeta(postId,price){
        return new Promise((resolve, reject) => {
          const insertQuery = `INSERT INTO wp_wc_product_meta_lookup (product_id, min_price, max_price, stock_quantity) VALUES ` + 
          `(${postId},${price},${price},1)`;
          User.dbQuery(insertQuery,'wp_wc_product_meta_lookup追加')
          .then(insRes=>{
            return resolve('成功');
          })

        })   
      }

      async function gazoShori(messageId,barcode){

        const downloadPath_moto = `./public/img/shn_${messageId}.jpg`;
        const downloadPath =  `./public/item_image/${barcode}.jpg`;

        // http://kyoko-akimoto.com/wp-content/uploads/2021/06/15.jpg
        
        //画像の仮保存
        // await downloadContent(messageId, downloadPath_moto);      

        //保存画像をリサイズして移動する
        await sharp(downloadPath_moto).resize( 500 , 500 , { fit : "cover",withoutEnlargement:true } ).toFile(downloadPath);

        fs.unlinkSync(downloadPath_moto);

        // function downloadContent(messageId, downloadPath) {
        //   return client.getMessageContent(messageId)
        //     .then((stream) => new Promise((resolve, reject) => {
        //       const writable = fs.createWriteStream(downloadPath);
  
        //       stream.pipe(writable);
        //       stream.on('end', () => resolve());
        //       stream.on('error', reject);
        //   }));
        // }
      }

    },

    searchShn: (req,res) => {
      try{            
        const {barcode} = req.body;
        const selectQuery = `SELECT * FROM ((( TM_SHN LEFT OUTER JOIN TM_METAL ON TM_SHN.metal = TM_METAL.METAL_ID) LEFT OUTER JOIN TM_STONE ON TM_SHN.stone = TM_STONE.STONE_ID ) LEFT OUTER JOIN TM_TYPE ON TM_SHN.type = TM_TYPE.TYPE_ID ) WHERE barcode = ${barcode}`;
        
        User.dbQuery(selectQuery,'商品検索１')
          .then(itemList=>{
            res.status(200).json(itemList);
          })
          .catch(e=>console.log(e))          
      }catch(error){
        res.status(400).send('入庫失敗');
      }
    },

    updateShn: (req,res) => {
      try{
        const {bikou,sellPrice,barcode} = req.body;
        updateQuery = `UPDATE TM_SHN SET bikou = '${bikou}' ,sellPrice = ${sellPrice} WHERE barcode=${barcode};`
        
        User.dbQuery(updateQuery,'商品更新１')
          .then(itemList=>{
            res.status(200).json('更新成功');
          })
          .catch(e=>console.log(e))          
      }catch(error){
        res.status(400).send('更新失敗');
      }
    },


}