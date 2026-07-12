(function () {
  'use strict';

  var ZHIZE_ID = '111PFK5yJzpJsqz42PEu9-6yTg0unJNulxaylXkrK_ig';
  var ZHIZE_SHEET = '職責';
  var XILIU_ID = '12CTMEcUgrVAelFydZUAtMC0_2B46c-nAXX7mhTkdO_Y';
  var XILIU_SHEET = '中文細流';
  var STORAGE_KEY = 'fsy5_my_name';
  var CACHE_KEY = 'fsy5_cache_v1';

  // 細流「說明」欄常是試算表內的超連結文字，CSV 匯出只帶文字、不帶網址，
  // 這裡用顯示文字補回實際網址。
  var XILIU_LINKS = {
    '課程&見證聚會總表': 'https://docs.google.com/spreadsheets/d/1nLQgjyNKCW_J-S9AyOZ9bualG_Nohi95qWM8_3SBUQg/edit',
    '第一場舞會--細流': 'https://docs.google.com/spreadsheets/d/121c6bsapumk5pSqDY7gXxmYnQC8EpDJdY7HnjStggdQ/edit',
    '第二場舞會--細流': 'https://docs.google.com/spreadsheets/d/1kqyAksXtwzLs8_i9aVIoCwtSJZ1VmXlEHEAM00iXjco/edit',
    '音樂節目細流': 'https://docs.google.com/spreadsheets/d/1jVM_zlY1UdiE93lWAdk9Pe5bKsvXN4q1cTHEC_Q0hqQ/edit',
    '隊呼與隊旗細流': 'https://docs.google.com/spreadsheets/d/1RNfCiwYePMPmVvD1ebRU_iAEvQvJKLCoUcJWBbDqlVg/edit',
    '遊戲之夜與家庭晚會遊戲': 'https://docs.google.com/spreadsheets/d/1WSGDsZg_KE9f9Pj-8Sx3x_XAlUWRIP1Jy4GelxzlQIg/edit',
    '2026 FSY才藝表演.xlsx」複本': 'https://docs.google.com/spreadsheets/d/1Fsvovrxh9Yn8gRP697UHrsXKpGQmk5D3/edit',
    '2026 FSY 服務活動企劃書_v3.docx': 'https://docs.google.com/document/d/1xAUB3ERfX0ZBJgnUYQzseXNtGj-dmaTM/edit',
    '時間安排與證據分組': 'https://docs.google.com/spreadsheets/d/1hiKERqbLXLUBoSfcUj6A0GCYKVDR1C6vSOkgF5RK4g8/edit?gid=0',
    '發家長的一封信時間': 'https://docs.google.com/spreadsheets/d/1k0jIGOmWtQJm-HPxPgD_gH1fkljspUuq/edit?gid=448836474',
  };
  // 膳食組細流（用餐時段自動附上連結）
  var MEAL_LINK_URL = 'https://docs.google.com/spreadsheets/d/1FoOzytm7_enx8ul0ycB5vPdIsHTIjzjPVtU46XG3kjE/edit';
  var MEAL_SHEET_ID = '1FoOzytm7_enx8ul0ycB5vPdIsHTIjzjPVtU46XG3kjE';
  var MEAL_DINING_SHEET = '\u5728\u9910\u5ef3\u7528\u9910 (\u52ff\u7de8\u8f2f)';
  var MEAL_OFFSITE_SHEET = '\u4e0d\u5728\u9910\u5ef3\u7528\u9910';
  var MEAL_SERVING_SHEET = '\u6253\u83dc\u73ed\u8868 (\u52ff\u7de8\u8f2f)';
  var MEAL_CACHE_KEY = 'fsy_meal_live_cache_v1';
  // 營本部試算表（值班表、無線電／翻譯器材／物資借用表）
  var HQ_SHEET_URL = 'https://docs.google.com/spreadsheets/d/11PdofNUdrroU9KKVWMBl1etw7F3pPE-BK6b_OayOGVs/edit';
  // 工作人員房號（來源表的「工作人員房號」分頁；權限由 Google 試算表共用設定控管）
  var STAFF_ROOMS_URL = 'https://docs.google.com/spreadsheets/d/1gf87SbL_jbF1XxgcsodxDMgUqioGSTE23YJj9t3d0CU/edit';
  var MEAL_ROUTE_MAP_IMAGE = 'meal-route-map.jpg?v=1';
  var MEAL_STAFF_NOTES = [
    { title: '場控人員', text: '在餐廳門口觀察路線 1、2、3 的人潮，主動把小隊引導到較空的路線。' },
    { title: '引導人員', text: '協助各小隊到被分配的取餐路線排隊，提醒大家坐緊密一些，不要太分散。' },
    { title: '打菜人員', text: '準時到負責路線，戴口罩與髮帽、先洗手，確實交接後再離開崗位。' },
    { title: '用餐收尾', text: '用餐完單時提醒隊輔預備離場，讓後續抵達的人有位置用餐。' },
  ];
  var STAFF_ROOM_GENDER = {
    '9125': '女', '9126': '女', '9127': '女', '9128': '女',
    '9132': '男', '9133': '男', '9134': '男', '9135': '男',
    '9117': '男', '9106': '女', '9136': '男', '9137': '男',
    '9104': '女', '9105': '女', '9129': '女', '9131': '男',
  };
  var STAFF_ROOM_NAME_OVERRIDES = {
    '9129': { name: '\u674e\u5fc3\u6f54', position: '\u5973\u5354\u8abf\u54e1' },
  };
  var STAFF_CORE_OVERRIDES = [
    { name: '\u9673\u744b\u7ae3', position: '\u7537\u5354\u8abf\u54e1', room: '9132', floor: '1F' },
  ];

  var LINKS_SECTIONS = [
    { title: '📋 全程常用', links: [
      { icon: '🗓️', label: '2026 細流（大會總行程）', url: 'https://docs.google.com/spreadsheets/d/' + XILIU_ID + '/edit' },
      { icon: '🧭', label: '2026 FSY 第五中隊（職責總表）', url: 'https://docs.google.com/spreadsheets/d/' + ZHIZE_ID + '/edit' },
      { icon: '🛏️', label: '工作人員房號（分隊總表「工作人員房號」分頁）', url: STAFF_ROOMS_URL },
      { icon: '🏕️', label: '營本部（排班表／物資借用）', url: HQ_SHEET_URL },
      { icon: '🚌', label: '7/12、7/18 搭車表', url: 'https://docs.google.com/spreadsheets/d/1GVNTilv6UE-OnukkidS7bo2jzT9qksmbTk4ogr0PXqk/edit?usp=sharing' },
      { icon: '🧩', label: 'AC 活動組別分配', url: 'https://docs.google.com/spreadsheets/d/1aEuBrMDltqcnbvCAS0v6i2exIh5eIeJLF_z_0VyF_nA/htmlview' },
      { icon: '📁', label: '指南與手冊', url: 'https://drive.google.com/drive/folders/1DGsNBEndMwoYi_qrYGPMemGyoh6glpdM' },
    ] },
    { title: '🔁 重複發生活動｜膳食、課程、見證聚會', links: [
      { icon: '🍚', label: '膳食組細流（用餐）', url: MEAL_LINK_URL },
      { icon: '🍱', label: '2026 隊輔打菜班表', url: 'https://docs.google.com/spreadsheets/d/1i5ZTiXrTF344ZS0mKV0gJwh8Ql7QZAkHrtPFkSf1WOU/edit?gid=0#gid=0' },
      { icon: '📚', label: '課程&見證聚會總表', url: 'https://docs.google.com/spreadsheets/d/1nLQgjyNKCW_J-S9AyOZ9bualG_Nohi95qWM8_3SBUQg/edit' },
      { icon: '✅', label: '2026 FSY 各教室點名表', url: 'https://docs.google.com/spreadsheets/d/12BHka4KuQQwGJWVF29PCJ8kWZ29-x-g6/edit?gid=657522279#gid=657522279' },
    ] },
    { title: '第零天｜行前通知', links: [
      { icon: '📝', label: '行前通知－工作人員', url: 'https://docs.google.com/document/d/1qZ0Ghpfbq0XmgqF2poRUZ0VI4GhtoDujL0WB4mpWpRY/edit' },
      { icon: '📝', label: '行前通知－青少年', url: 'https://docs.google.com/document/d/1QBL-xrowdXu5Quz8CQ08164MccSqXAkXcHwVqswwnu4/edit?tab=t.0' },
      { icon: '📝', label: '行前通知－青少年英文', url: 'https://docs.google.com/document/d/1Pn8INldqfvKtf0AFyJSP8NSL9R6JJo52Ptl8WOAPVXA/edit?usp=sharing' },
    ] },
    { title: '第零天｜才藝表演、音樂節目', links: [
      { icon: '🧾', label: '才藝表演報名表單（第一天截止）', url: 'https://forms.gle/iqPUXano2YLwKoGX6' },
      { icon: '🧾', label: '音樂節目報名表單', url: 'https://docs.google.com/forms/d/1n7HS0puJh5y8tGgTlNZ1WOibGlZ-czd2UDbhmYt4IE8/preview?edit_requested=true' },
    ] },
    { title: '第一天｜開場舞、家庭晚會', links: [
      { icon: '🎵', label: '開場舞 music4.wav', url: 'https://drive.google.com/file/d/1OFRHvKLRvnstyXd2ISNZJ5NAONuJbob9/view?usp=drive_link' },
      { icon: '📊', label: 'FHE 遊戲參考', url: 'https://docs.google.com/spreadsheets/d/1Zvk37wxEQ6lzC5XYDIVjJAfNiUpB9NUnJ8A3jiP7WRM/edit?usp=sharing' },
    ] },
    { title: '第二天｜七十周年', links: [
      { icon: '🧩', label: '謎題解說版', url: 'https://reurl.cc/9WGv5O' },
      { icon: '🎨', label: '純題卡（練習用）', url: 'https://canva.link/7ft8bv0ncywi7ft' },
    ] },
    { title: '第二天｜舞會', links: [
      { icon: '📋', label: '第一場舞會細流', url: 'https://docs.google.com/spreadsheets/d/121c6bsapumk5pSqDY7gXxmYnQC8EpDJdY7HnjStggdQ/edit' },
      { icon: '🎨', label: '第一場舞會 PPT', url: 'https://canva.link/gjyn474gf1dtvot' },
      { icon: '📊', label: '舞會站崗', url: 'https://docs.google.com/spreadsheets/d/1FazpecatO0SJiZKvVOFOtLMsgAcRPaTAaLkmUiCuY-M/edit?usp=sharing' },
      { icon: '🎬', label: '紋身貼紙教學影片', url: 'https://drive.google.com/file/d/1QPhxK1eseEzi6eKcMpRV04GdOECR---K/view?usp=sharing' },
      { icon: '🎬', label: '紋身貼紙卸除教學 YouTube', url: 'https://youtu.be/7dnVU7wlD38' },
    ] },
    { title: '第三天｜服務活動', links: [
      { icon: '📝', label: '服務活動企劃書 v7', url: 'https://docs.google.com/document/d/1xAUB3ERfX0ZBJgnUYQzseXNtGj-dmaTM/edit?usp=drive_link&ouid=108936702055106596018&rtpof=true&sd=true' },
    ] },
    { title: '第三天｜遊戲之夜', links: [
      { icon: '🎬', label: '搭橋影片', url: 'https://www.facebook.com/watch/?v=1056800085220087' },
      { icon: '📊', label: '跑關路線', url: 'https://docs.google.com/spreadsheets/d/1FEzgmfI9WYJqnFq94q53e4YKb_rkGCZWd35TVVlGOrI/edit?usp=sharing' },
      { icon: '🎬', label: '秩序之家影片', url: 'https://drive.google.com/file/d/19Upq7CwpsZVMU7NM72Z2GDoSLj_KQOtV/view?usp=drive_link' },
      { icon: '🎬', label: '動物的聲音影片', url: 'https://drive.google.com/file/d/1WWN-JI88wpKb-Pm7zdMMq5jH9uZK-mA1/view?usp=drive_link' },
      { icon: '🎬', label: '進出隧道影片', url: 'https://drive.google.com/file/d/10axa2Aw4-P0F4AzWp_z3TjupsHEgKSbM/view?usp=drive_link' },
    ] },
    { title: '第四天｜男女青年活動', links: [
      { icon: '📝', label: '證據', url: 'https://docs.google.com/document/d/1VF1Rsuq8nAeLhfQmUCyIta8WiA0-Tsf7ngH9HiFYkpo/edit?usp=sharing' },
      { icon: '📊', label: '時間安排與證據分組', url: 'https://docs.google.com/spreadsheets/d/1hiKERqbLXLUBoSfcUj6A0GCYKVDR1C6vSOkgF5RK4g8/edit?gid=0#gid=0' },
      { icon: '📽️', label: 'Presentation', url: 'https://docs.google.com/presentation/d/1Eghc27GQVGOLdceZzEy-PYTgryKsvXppSyBXl7Z3Dv4/edit?slide=id.g3da0c62a2ce_2_0#slide=id.g3da0c62a2ce_2_0' },
    ] },
    { title: '第五天｜舞會', links: [
      { icon: '📋', label: '第二場舞會細流', url: 'https://docs.google.com/spreadsheets/d/1kqyAksXtwzLs8_i9aVIoCwtSJZ1VmXlEHEAM00iXjco/edit' },
    ] },
    { title: '第五天｜鞏固青年', links: [
      { icon: '🎨', label: '場次用 PPT', url: 'https://canva.link/qhj9uxgwlflcy39' },
    ] },
    { title: '第五天｜奉行福音', links: [
      { icon: '📊', label: '2026 FSY 奉行福音', url: 'https://docs.google.com/spreadsheets/d/1zE8ZN4bSWG-I-LkeFxbbzowcVsporz_0e17p5lSYCoo/edit?gid=1455950552#gid=1455950552' },
      { icon: '🎨', label: '奉行福音 PPT', url: 'https://canva.link/b08pxdqmjkv9ns5' },
      { icon: '📽️', label: '碎片收集遊戲隊輔訓練.pptx', url: 'https://docs.google.com/presentation/d/1rIiHWEnG4maKRG8Y7fC18PW1dGhL6ZUp/edit?usp=sharing&ouid=117250599308326951494&rtpof=true&sd=true' },
    ] },
  ];
  // 第五中隊「男女青年活動」證據分配（隊內資料，不在共用試算表內）
  var YM_EVIDENCE = [
    '亞聖・宜昕 → 證據 1、8',
    '屸承・家均 → 證據 5、6',
    '唯哲・曜瑄 → 證據 2、5',
    '亞各・昉靚 → 證據 3、8',
    '敏恩・羽庭 → 證據 3、7',
  ];
  // 歌詞：每首歌的 sections 陣列＝段落，待提供歌詞時逐段填入即可
  var LYRICS = [
    { title: '與我同行', sections: [
      '第一節：\n當你走過烈火荊棘，\n滿身傷痕與泥濘，\n祂的活水源源不息，\n醫治你疲憊的心。\n看見救主的足跡，\n感受祂的光引領。\n祂正在呼喚著你。',
      '副歌：\n祂說：與我同行，\n我會為你平息暴風雨。\n與我同行，\n我會將高山移去。\n噢，牽我手，\n當你感到灰心失落，\n與我同行，\n我會與你同行。',
      '第二節：\n祂走過荒漠山崗，\n尋找迷失的羊。\n祂治癒每個憂傷，\n純正的愛綻放。\n若走在祂的身旁，\n祂賜我們力量。\n祂正在呼喚著你。',
      '副歌（重複）：\n祂說：與我同行，\n我會為你平息暴風雨。\n與我同行，\n我會將高山移去。\n噢，牽我手，\n當你感到灰心失落，\n與我同行，\n我會與你同行。',
      '祂說：與我同行。\n祂說：與我同行。',
      '最後副歌：\n與我同行，\n我會為你平息暴風雨。\n與我同行，\n我會將高山移去。\n噢，牽我手，\n當你感到灰心失落，\n與我同行，\n我會與你同行。',
    ] },
    { title: '前生', sections: [
      '女：\n有一個地方叫做前生\n在那裡與親朋好友同住\n召開了會議 設立計劃\n為了選擇我來世',
      '男：\n救主尋找我迷失羊群\n教導與引領回家\n我應許他會找到他們\n且教導當行的路',
      '合唱：\n我將會找到你並幫助你\n是救主祂的計劃\n請～領我當我找你\n有朝回去與祂同住\n請記住在神的眼光中\n那靈魂的價值極大（234）\n尋覓並教導羊群\n使我到那鐵桿（漸強）\n間奏……',
      '（尋覓並教導羊群）\n（使我到那鐵桿）',
      '合唱：\n是我教導福音的時候\n在那裡有極珍貴的靈魂\n他們被曉諭的事情是\n祂的福音在推進\n假如～曾因一個靈魂\n快樂教導回家\n你的心將經歷一超昇\n來使人們歸信\n我將會找到你並幫助你\n是救主祂的計劃\n請～領我當我找你\n有朝回去與祂同住\n請記住在神的眼光中\n那靈魂的價值極大（234）\n尋覓並教導羊群\n使我到那鐵桿',
      '（我將會找到你並幫助你）\n（是救主祂的計劃）\n（請～領我當我找你）',
      '我尋覓你吾友',
    ] },
  ];
  // 用餐指南（來源：「2026 FSY 膳食」試算表的「在餐廳用餐」「不在餐廳用餐」「打菜班表」三個分頁）
  // app-data.js 會以全 FSY 膳食資料覆蓋此內建備援資料。
  // squads：各小隊的進場路線／前後半／就緒時間；serve：該小隊隊輔的打菜任務（打菜路線可能與走的路線不同）
  var MEALS_GUIDE = [
    { day: '7/13', dow: '一', meals: [
      { name: '午餐', icon: '🥪', time: '11:00-13:00', place: '報到處', how: '報到時領取',
        food: '男女青年：貝果×1＋鋁箔包飲料×1（工作人員：飯糰×1＋舒跑×1）',
        note: '請小隊員把飲料鋁箔包清洗、壓扁再回收' },
      { name: '晚餐', icon: '🍛', time: '17:25-18:00', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線1・後半・就緒 17:40', serve: '亞各（後半・路線1）' },
          { s: 19, walk: '路線1・後半・就緒 17:40', serve: '敏恩（後半・路線1）' },
          { s: 20, walk: '路線2・前半・就緒 17:20', serve: '亞聖（前半・路線1）' },
          { s: 21, walk: '路線2・前半・就緒 17:20', serve: '唯哲（前半・路線1）' },
          { s: 22, walk: '路線2・後半・就緒 17:40', serve: '家均（後半・路線2）' },
        ] },
      { name: '宵夜', icon: '🌙', time: '21:00', place: '宿舍', how: '分送到小隊',
        food: '愛玉／仙草×1、品客×1、多穀×1',
        note: '發放時確認小隊人數；請小隊員清洗飲料盒，發完後隊輔繳回箱子' },
    ] },
    { day: '7/14', dow: '二', meals: [
      { name: '早餐', icon: '🍳', time: '7:45-8:15', place: '學生餐廳', how: '同場入座',
        note: '16–31 小隊同場、無路線分流；打餐由 AC／中隊輔負責（就緒 7:40）' },
      { name: '午餐', icon: '🍛', time: '12:55-13:30', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線2・後半・就緒 13:10', serve: '昉靚（後半・路線2）' },
          { s: 19, walk: '路線2・後半・就緒 13:10', serve: '羽庭（後半・路線2）' },
          { s: 20, walk: '路線3・前半・就緒 12:50', serve: '宜昕（前半・路線3）' },
          { s: 21, walk: '路線3・前半・就緒 12:50', serve: '唯哲（前半・路線3）' },
          { s: 22, walk: '路線3・後半・就緒 13:10', serve: '屸承（後半・路線3）' },
        ] },
      { name: '晚餐', icon: '🍛', time: '17:10-17:45', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線3・後半・就緒 17:25', serve: '亞各（後半・路線3）' },
          { s: 19, walk: '路線3・後半・就緒 17:25', serve: '敏恩（後半・路線3）' },
        ],
        note: '20–22 小隊本餐未列路線，依現場引導入場' },
      { name: '宵夜', icon: '🌙', time: '21:00', place: '宿舍', how: '分送到小隊',
        food: '晶晶棒×1、雞塊×1',
        note: '發放時確認小隊人數；請小隊員清洗晶晶棒包裝' },
    ] },
    { day: '7/15', dow: '三', meals: [
      { name: '早餐', icon: '🍳', time: '7:30-8:00', place: '宿舍', how: '分送到小隊',
        note: '餐廳 7:00 送達宿舍，由分送人員發放' },
      { name: '午餐', icon: '🍛', time: '12:55-13:30', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 20, walk: '路線1・前半・就緒 12:50', serve: '亞聖（前半・路線1）' },
          { s: 21, walk: '路線1・前半・就緒 12:50', serve: '唯哲（前半・路線1）' },
          { s: 22, walk: '路線1・後半・就緒 13:10', serve: '屸承（後半・路線1）' },
        ],
        note: '18・19 小隊本餐未列路線，依現場引導入場' },
      { name: '晚餐', icon: '🍛', time: '17:10-17:45', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線1・後半・就緒 17:25', serve: '亞各（後半・路線1）' },
          { s: 19, walk: '路線1・後半・就緒 17:25', serve: '羽庭（後半・路線1）' },
          { s: 20, walk: '路線2・前半・就緒 17:05', serve: '宜昕（前半・路線2）' },
          { s: 21, walk: '路線2・前半・就緒 17:05', serve: '唯哲（前半・路線2）' },
          { s: 22, walk: '路線2・後半・就緒 17:25', serve: '家均（後半・路線2）' },
        ] },
      { name: '食物之夜', icon: '🎉', time: '20:30-21:00', place: '操場', how: '現場發放',
        food: '冰棒、蛋塔、炸雞（一人一個）＋薯格格×1、果凍×1、卡辣×1、芒果乾×1、飲料×3（以小隊計）',
        note: '帶垃圾袋；盒罐回收後一起拿到垃圾場（雨天備案改在宿舍發）' },
    ] },
    { day: '7/16', dow: '四', meals: [
      { name: '早餐', icon: '🍳', time: '7:30-8:15', place: '宿舍', how: '分送到小隊',
        note: '餐廳 7:00 送達宿舍，由分送人員發放' },
      { name: '午餐', icon: '🍛', time: '12:30-13:00', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線2・後半・就緒 12:40', serve: '昉靚（後半・路線2）' },
          { s: 19, walk: '路線2・後半・就緒 12:40', serve: '敏恩（後半・路線2）' },
          { s: 20, walk: '路線3・前半・就緒 12:25', serve: '宜昕（前半・路線3）' },
          { s: 21, walk: '路線3・前半・就緒 12:25', serve: '曜瑄（前半・路線3）' },
          { s: 22, walk: '路線3・後半・就緒 12:40', serve: '屸承（後半・路線3）' },
        ] },
      { name: '晚餐', icon: '🍛', time: '16:30-17:10', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線3・後半・就緒 16:45', serve: '亞各（後半・路線3）' },
          { s: 19, walk: '路線3・後半・就緒 16:45', serve: '羽庭（後半・路線3）' },
        ],
        note: '20–22 小隊本餐未列路線，依現場引導入場' },
      { name: '宵夜', icon: '🌙', time: '21:00', place: '宿舍', how: '分送到小隊',
        food: '寒天檸檬×1、Oreo×1、洋蔥圈×2',
        note: '發放時確認小隊人數；請小隊員清洗瓶子' },
    ] },
    { day: '7/17', dow: '五', meals: [
      { name: '早餐', icon: '🍳', time: '7:15-7:45', place: '學生餐廳', how: '同場入座',
        note: '16–31 小隊同場、無路線分流；打餐由 AC／中隊輔負責（就緒 7:10）' },
      { name: '午餐', icon: '🍛', time: '12:30-13:00', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 20, walk: '路線1・前半・就緒 12:25', serve: '亞聖（前半・路線1）' },
          { s: 21, walk: '路線1・前半・就緒 12:25', serve: '曜瑄（前半・路線1）' },
          { s: 22, walk: '路線1・後半・就緒 12:40', serve: '屸承（後半・路線1）' },
        ],
        note: '18・19 小隊本餐未列路線，依現場引導入場' },
      { name: '晚餐', icon: '🍛', time: '16:45-17:20', place: '學生餐廳', how: '路線進場',
        squads: [
          { s: 18, walk: '路線1・後半・就緒 17:00', serve: '亞各（後半・路線1）' },
          { s: 19, walk: '路線1・後半・就緒 17:00', serve: '敏恩（後半・路線1）' },
          { s: 20, walk: '路線2・前半・就緒 16:40', serve: '亞聖（前半・路線2）' },
          { s: 21, walk: '路線2・前半・就緒 16:40', serve: '曜瑄（前半・路線2）' },
          { s: 22, walk: '路線2・後半・就緒 17:00', serve: '家均（後半・路線2）' },
        ],
        note: '本餐發舞會貼紙，18:00 舞會進場' },
      { name: '宵夜', icon: '🌙', time: '21:00', place: '體育館', how: '現場發放',
        food: '楊枝甘露×1、披薩／牛肉捲／海鮮捲×1（一隊 9 片披薩＋14 份捲）',
        note: '確認小隊人數；帶垃圾袋，盒罐回收後丟垃圾場' },
    ] },
    { day: '7/18', dow: '六', meals: [
      { name: '早午餐', icon: '🍞', time: '7:30 領取', place: '宿舍', how: '分送到小隊',
        food: '餐盒',
        note: '8:00-8:30 早餐／小隊時間（宣達事項）；沒發完的放回營本部' },
    ] },
  ];

  // 營本部排班表（來源：「營本部」試算表「值班表」分頁；已把上下兩班交錯的 2 小時值班換算成逐時段名單）
  // D-6 無排班（依值班說明：查點名表、退房與遺失物由當日 AC 處理）
  var HQ_SCHEDULE = [
    { day: '7/13', dow: '一', tag: 'D-1', slots: [
      { time: '11:00-12:00', names: ['劉茗文'] },
      { time: '12:00-13:00', names: ['趙建傑', '劉茗文'] },
      { time: '13:00-14:00', names: ['趙建傑', '何于彰'] },
      { time: '14:00-15:00', names: ['許若伊', '何于彰'] },
      { time: '15:00-16:00', names: ['許若伊', '周明儀'] },
      { time: '16:00-17:00', names: ['李湘儀', '周明儀'] },
      { time: '17:00-18:00', names: ['李湘儀', '江前安'] },
      { time: '18:00-19:00', names: ['江前安'] },
      { time: '19:00-20:00', names: ['江前安', '李厚璿'] },
      { time: '20:00-21:00', names: ['許百加', '李厚璿'] },
      { time: '21:00-21:30', names: ['許百加'] },
    ] },
    { day: '7/14', dow: '二', tag: 'D-2', slots: [
      { time: '8:00-9:00', names: ['周明儀'] },
      { time: '9:00-10:00', names: ['周明儀', '周語歆'] },
      { time: '10:00-11:00', names: ['李湘儀', '周語歆'] },
      { time: '11:00-12:00', names: ['李湘儀', '陳德璟'] },
      { time: '12:00-13:00', names: ['張蕙庭', '陳德璟'] },
      { time: '13:00-14:00', names: ['張蕙庭', '莊世瑄'] },
      { time: '14:00-15:00', names: ['徐俞霈', '莊世瑄'] },
      { time: '15:00-16:00', names: ['徐俞霈', '趙子琁'] },
      { time: '16:00-17:00', names: ['陳德璟', '趙子琁'] },
      { time: '17:00-18:00', names: ['陳德璟', '胡沛菁'] },
      { time: '18:00-19:00', names: ['金郁翎', '胡沛菁'] },
      { time: '19:00-20:00', names: ['金郁翎', '周成禾'] },
      { time: '20:00-21:00', names: ['張書寧', '周成禾'] },
      { time: '21:00-21:30', names: ['張書寧'] },
    ] },
    { day: '7/15', dow: '三', tag: 'D-3', slots: [
      { time: '8:00-9:00', names: ['周成禾'] },
      { time: '9:00-10:00', names: ['周成禾', '周語歆'] },
      { time: '10:00-11:00', names: ['李庭宇', '周語歆'] },
      { time: '11:00-12:00', names: ['李庭宇', '胡滿祥'] },
      { time: '12:00-13:00', names: ['張蕙庭', '胡滿祥'] },
      { time: '13:00-14:00', names: ['張蕙庭', '胡沛菁'] },
      { time: '14:00-15:00', names: ['許若伊', '胡沛菁'] },
      { time: '15:00-16:00', names: ['許若伊', '陳德璟'] },
      { time: '16:00-17:00', names: ['金郁翎', '陳德璟'] },
      { time: '17:00-18:00', names: ['金郁翎', '徐俞霈'] },
      { time: '18:00-19:00', names: ['江前安', '徐俞霈'] },
      { time: '19:00-20:00', names: ['江前安', '場次夫婦'] },
      { time: '20:00-21:00', names: ['江前安', '趙建傑'] },
      { time: '21:00-21:30', names: ['趙建傑'] },
    ] },
    { day: '7/16', dow: '四', tag: 'D-4', slots: [
      { time: '8:00-9:00', names: ['林以理'] },
      { time: '9:00-10:00', names: ['林以理', '邱凱莉'] },
      { time: '10:00-11:00', names: ['林薏瓏', '邱凱莉'] },
      { time: '11:00-12:00', names: ['林薏瓏', '許百加'] },
      { time: '12:00-13:00', names: ['李厚璿', '許百加'] },
      { time: '13:00-14:00', names: ['李厚璿', '楊喬安'] },
      { time: '14:00-15:00', names: ['趙子琁', '楊喬安'] },
      { time: '15:00-16:00', names: ['趙子琁', '徐俞霈'] },
      { time: '16:00-17:00', names: ['詹咏朋', '徐俞霈'] },
      { time: '17:00-18:00', names: ['詹咏朋', '林以理'] },
      { time: '18:00-19:00', names: ['趙子琁', '林以理'] },
      { time: '19:00-20:00', names: ['趙子琁', '胡沛菁'] },
      { time: '20:00-21:00', names: ['張書寧', '胡沛菁'] },
      { time: '21:00-21:30', names: ['張書寧'] },
    ] },
    { day: '7/17', dow: '五', tag: 'D-5', slots: [
      { time: '8:00-9:00', names: ['林以理'] },
      { time: '9:00-10:00', names: ['林以理', '林薏瓏'] },
      { time: '10:00-11:00', names: ['邱凱莉', '林薏瓏'] },
      { time: '11:00-12:00', names: ['邱凱莉', '楊喬安'] },
      { time: '12:00-13:00', names: ['趙子琁', '楊喬安'] },
      { time: '13:00-14:00', names: ['趙子琁', '胡滿祥'] },
      { time: '14:00-15:00', names: ['何于彰', '胡滿祥'] },
      { time: '15:00-16:00', names: ['何于彰', '李庭宇'] },
      { time: '16:00-17:00', names: ['周明儀', '李庭宇'] },
      { time: '17:00-18:00', names: ['周明儀', '詹咏朋'] },
      { time: '18:00-19:00', names: ['何于彰', '詹咏朋'] },
      { time: '19:00-20:00', names: ['何于彰', '莊世瑄'] },
      { time: '20:00-21:00', names: ['劉茗文', '莊世瑄'] },
      { time: '21:00-21:30', names: ['劉茗文'] },
    ] },
  ];

  // 每日清點人數時間（來源：「2026 細流」）
  var ROLLCALL_TIMES = {
    1: '18:00、21:00',
    2: '13:40、21:00',
    3: '13:40、20:30',
    4: '13:30、21:00',
    5: '13:30、23:00（熄燈時）',
    6: '退房清點依隊輔會議指示',
  };

  // 工作人員住宿房號（來源表的「工作人員房號」分頁；宿舍＝築夢學苑）
  var STAFF_ROOMS = [
    { floor: '5F', group: '女隊輔', room: '9517', names: ['林昉靚', '薛羽庭', '劉宜昕', '邢曜瑄'] },
    { floor: '5F', group: '女隊輔', room: '9506', names: ['劉家均', '許若凡', '葛俐妤', '黃英旻'] },
    { floor: '5F', group: '女隊輔', room: '9501', names: ['黃矞曦', '林佳晨', '杜孟蓉'] },
    { floor: '5F', group: '女隊輔', room: '9537', names: ['葉歆', '何祐萱', '王晴安'] },
    { floor: '4F', group: '女隊輔', room: '9417', names: ['王詩妤', '陳怡安', '游淯雲', '張瓊文'] },
    { floor: '4F', group: '女隊輔', room: '9406', names: ['吳心妤', '林䓵瓏', '鍾治勻', '鄧恩淩'] },
    { floor: '4F', group: '女隊輔', room: '9401', names: ['丁予柔', '蔡慧英', '陳安潼'] },
    { floor: '4F', group: '女隊輔', room: '9434', names: ['阮庭恩', '毛心妍', '衛詩諾'] },
    { floor: '4F', group: '女隊輔', room: '9441', names: ['姚相蓉(英)', '許少芸', '王若馨'] },
    { floor: '3F', group: '男隊輔', room: '9317', names: ['吳敬堯(英)', '黃敬倫', '王皓平', '賴亞各'] },
    { floor: '3F', group: '男隊輔', room: '9306', names: ['蘇敏恩', '陳亞聖', '徐唯哲', '徐屸承'] },
    { floor: '3F', group: '男隊輔', room: '9347', names: ['徐瑞澤', '盧承恩', '李為宇'] },
    { floor: '3F', group: '男隊輔', room: '9341', names: ['王奎棟', '張以理', '吳宥瑜', '王恩予'] },
    { floor: '2F', group: '男隊輔', room: '9217', names: ['姚歆磊', '彭林禹', '曾廷瑋', '徐聖源'] },
    { floor: '2F', group: '男隊輔', room: '9206', names: ['宋昇祐', '郭俊言', '譚道遠', '張宏敏'] },
    { floor: '2F', group: '男隊輔', room: '9201', names: ['許尚恩', '高啟恩', '彭林彥', '黃恩星'] },
    { floor: '2F', group: '男隊輔', room: '9241', names: ['廖瑋群', '顧千祥'] },
    { floor: '1F', group: '男隊輔', room: '9117', names: ['黃睿揚', '張永峯'] },
    { floor: '1F', group: '核心委員會', room: '9111', names: ['場次夫婦'] },
    { floor: '1F', group: '核心委員會', room: '9129', names: ['李心潔'] },
    { floor: '1F', group: '核心委員會', room: '9131', names: ['陳瑋竣'] },
    { floor: '1F', group: '助理協調員', room: '9125', names: ['王亭喻', '李湘儀', '周語歆', '胡沛菁'] },
    { floor: '1F', group: '助理協調員', room: '9126', names: ['林薏瓏', '邱凱莉', '楊喬安'] },
    { floor: '1F', group: '助理協調員', room: '9127', names: ['許若伊', '許百加', '金郁翎'] },
    { floor: '1F', group: '助理協調員', room: '9128', names: ['徐俞霈', '張書寧', '張蕙庭', '周成禾'] },
    { floor: '1F', group: '助理協調員', room: '9132', names: ['周明儀', '陳德璟', '劉茗文'] },
    { floor: '1F', group: '助理協調員', room: '9133', names: ['胡滿祥', '莊世瑄', '李庭宇'] },
    { floor: '1F', group: '助理協調員', room: '9134', names: ['何于彰', '李厚璿', '江前安'] },
    { floor: '1F', group: '助理協調員', room: '9135', names: ['林以理', '詹咏朋', '趙子琁', '趙建傑'] },
    { floor: '1F', group: '攝影組', room: '9106', names: ['江恩慈', '張菀眞', '蔡薰雅'] },
    { floor: '1F', group: '其他工作人員', room: '9136', names: ['張發貴', '林子鈞', '莊士慶', '楊恩在'] },
    { floor: '1F', group: '其他工作人員', room: '9137', names: ['應奇穎'] },
    { floor: '1F', group: '醫護組', room: '9104', names: ['陳俞采', '蘇靖琇', '楊紫祺'] },
    { floor: '1F', group: '醫護組', room: '9105', names: ['彭瑀恩', '林書亞', '蔡君佩', '謝岱娜'] },
  ];
  // 醫護組未列房號者（仍可搜尋到，電話解鎖後顯示）
  var STAFF_EXTRA = [
    { name: '蔡連凱', group: '醫護組', gender: '男' },
    { name: '綉娟', group: '醫護組', gender: '女' },
  ];
  // 助理協調員的活動組別（來源：「AC活動組別分配」試算表；★＝該活動組長）
  // 全體 AC 另有共同輪值：營本部排班、入場就座／抄寫員、損壞報告、失物招領
  var AC_ROLES = {
    '王亭喻': ['鞏固青年指南活動', '感謝卡', '遊戲之夜'],
    '江前安': ['音樂節目', '才藝表演', '鞏固青年指南活動'],
    '何于彰': ['膳食', '隊呼隊旗'],
    '李庭宇': ['★鞏固青年指南活動（組長）', '男女青年活動', '膳食', '音樂節目'],
    '李厚璿': ['★舞會（組長）', '技術設備', '遊戲之夜'],
    '李湘儀': ['★隊呼隊旗（組長）', '報到與離場', '遊戲之夜'],
    '周成禾': ['★音樂節目（組長）', '膳食', '遊戲之夜'],
    '周明儀': ['★課程（組長）', '「奉行福音」活動', '遊戲之夜'],
    '周語歆': ['音樂節目', '服務活動', '感謝卡', '遊戲之夜'],
    '林以理': ['舞會', '技術設備', '遊戲之夜'],
    '林薏瓏': ['「奉行福音」活動', '七十週年活動', '遊戲之夜', '舞會'],
    '邱凱莉': ['★七十週年活動（組長）', '舞會', '遊戲之夜'],
    '金郁翎': ['遊戲之夜', '報到與離場', '才藝表演'],
    '徐俞霈': ['舞會', '攝影', '技術設備'],
    '張書寧': ['★男女青年活動（組長）', '才藝表演', '服務活動'],
    '張蕙庭': ['★感謝卡（組長）', '男女青年活動', '才藝表演', '遊戲之夜'],
    '莊世瑄': ['遊戲之夜'],
    '許百加': ['★遊戲之夜（組長）', '課程', '感謝卡'],
    '許若伊': ['★膳食（組長）', '男女青年活動'],
    '陳德璟': ['★「奉行福音」活動（組長）', '七十週年活動', '遊戲之夜'],
    '楊喬安': ['★報到與離場（組長）', '遊戲之夜', '音樂節目'],
    '詹咏朋': ['★技術設備（組長）', '才藝表演', '隊呼隊旗'],
    '趙子琁': ['報到與離場', '遊戲之夜'],
    '趙建傑': ['隊呼隊旗', '七十週年活動', '報到與離場', '音樂節目'],
    '劉茗文': ['★服務活動（組長）', '膳食', '課程', '隊呼隊旗'],
    '胡沛菁': ['★才藝表演（組長）', '遊戲之夜'],
    '胡滿祥': ['★攝影（組長）', '鞏固青年指南活動', '男女青年活動'],
    '陳瑋竣': ['營本部值班手機輪值（當夜執勤協調員）'],
  };

  // 營本部聯絡資訊頁的資訊卡（只留必要的：服裝、六大紀律）
  var INFO_SECTIONS = [
    { icon: '👕', title: '每日服裝', lines: [
      'D-1～D-3、D-5、D-6：大會 T-shirt',
      'D-4（7/16）：整日安息日服裝；工作人員配戴傳道名牌、青少年配戴未來傳教士名牌',
      'D-5（7/17）晚會：安息日服裝（男：襯衫＋長褲；女：及膝裙裝），舞會禁止拖鞋和短褲',
      '服務活動（D-3）可能有躺地上的環節，提醒小隊員穿不易走光的衣服',
    ] },
    { icon: '⚠️', title: '六大紀律', lines: [
      '1. 參與或鼓吹任何不道德行為（違反貞潔律法、觀看或發布色情）',
      '2. 盜取店舖商品、偷竊或任何形式的蓄意破壞',
      '3. 違反智慧語（含抽電子煙、持有非法或有害物質）',
      '4. 持有武器或任何危險物品',
      '5. 在身體、靈性或情緒上傷害或威脅傷害自己或他人（含霸凌）',
      '6. 未經適當程序自行離開、未經許可缺席預定活動或違反宵禁',
    ] },
  ];

  // 醫護組資訊：團隊成員（標籤：組長／司機）
  var MEDICAL_TEAM = [
    { name: '俞采', room: '9104', tags: ['組長'] },
    { name: '瑪恩', room: '9105', tags: [] },
    { name: '綉娟', room: '', tags: ['司機'] },
    { name: '君佩', room: '9105', tags: ['司機'] },
    { name: '紫祺', room: '9104', tags: ['組長'] },
    { name: '書亞', room: '9105', tags: [] },
    { name: '岱娜', room: '9105', tags: [] },
    { name: '靖琇', room: '9104', tags: [] },
    { name: '連凱', room: '', tags: ['組長', '司機'] },
  ];
  // 醫護組人員電話：改由加密檔 data.enc.json 解密後提供（state.medicalPhones），不再寫在公開程式中
  // 醫護組值班表（D-1～D-6 對應 7/13～7/18）
  var MEDICAL_SCHEDULE_DAYS = ['D-1', 'D-2', 'D-3', 'D-4', 'D-5', 'D-6'];
  var MEDICAL_SCHEDULE = [
    { label: '早', time: '08:00–12:00', duty: [
      ['俞采', '瑪恩', '綉娟'],
      ['俞采', '瑪恩', '綉娟'],
      ['俞采', '瑪恩', '紫祺', '綉娟'],
      ['紫祺', '書亞', '岱娜', '靖琇'],
      ['書亞', '岱娜', '靖琇', '連凱'],
      ['書亞', '岱娜', '靖琇', '連凱'],
    ] },
    { label: '中', time: '12:00–18:00', duty: [
      ['俞采', '瑪恩', '綉娟'],
      ['俞采', '瑪恩', '綉娟', '紫祺'],
      ['俞采', '瑪恩', '紫祺', '綉娟'],
      ['書亞', '岱娜', '靖琇', '連凱'],
      ['書亞', '岱娜', '靖琇', '連凱'],
      [],
    ] },
    { label: '晚', time: '18:00–08:00', duty: [
      ['俞采', '瑪恩', '君佩'],
      ['俞采', '瑪恩', '紫祺', '君佩'],
      ['紫祺', '瑪恩', '君佩'],
      ['書亞', '岱娜', '靖琇', '連凱'],
      ['書亞', '岱娜', '靖琇', '連凱'],
      [],
    ] },
  ];
  // 醫護組回報格式
  var MEDICAL_REPORT_TEMPLATE =
    '我是第 ___ 小隊的隊輔 ___\n' +
    '我的小隊員 ___ 有甚麼症狀：___\n' +
    '目前可以怎麼做？';
  var MEDICAL_REPORT_NOTE = '記得留下聯絡方式、交接地點，並記得領回小隊員';
  // 醫護組接送車輛車牌：改由加密檔 data.enc.json 解密後提供（state.medicalVehicles），不再寫在公開程式中
  var MEAL_SERVING = {};
  if (window.FSY_APP_DATA) {
    if (Array.isArray(window.FSY_APP_DATA.staffRooms)) STAFF_ROOMS = window.FSY_APP_DATA.staffRooms;
    if (Array.isArray(window.FSY_APP_DATA.mealsGuide)) MEALS_GUIDE = window.FSY_APP_DATA.mealsGuide;
    if (window.FSY_APP_DATA.mealServing) MEAL_SERVING = window.FSY_APP_DATA.mealServing;
  }

  var dayPillsEl = document.getElementById('day-pills');
  var meContentEl = document.getElementById('me-content');
  var overviewContentEl = document.getElementById('overview-content');
  var personSelectEl = document.getElementById('person-select');
  var statusTextEl = document.getElementById('status-text');
  var refreshBtnEl = document.getElementById('refresh-btn');
  var searchFabEl = document.getElementById('search-fab');
  var searchOverlayEl = document.getElementById('search-overlay');
  var searchBackdropEl = document.querySelector('.search-backdrop');
  var searchInputEl = document.getElementById('search-input');
  var searchCloseEl = document.getElementById('search-close');
  var searchResultsEl = document.getElementById('search-results');
  var toolsMenuEl = document.getElementById('tools-menu');
  var toolViewEl = document.getElementById('tool-view');
  var toolBackEl = document.getElementById('tool-back');
  var rosterCountEl = document.getElementById('roster-count');
  var rosterInputEl = document.getElementById('roster-input');
  var rosterClearEl = document.getElementById('roster-clear');
  var rosterTeamFiltersEl = document.getElementById('roster-team-filters');
  var rosterSquadFiltersEl = document.getElementById('roster-squad-filters');
  var rosterListEl = document.getElementById('roster-list');
  var rosterNonMemberToggleEl = document.getElementById('roster-nonmember-toggle');
  var randomPickBtnEl = document.getElementById('random-pick-btn');
  var randomResultEl = document.getElementById('random-result');
  var drawTeamFiltersEl = document.getElementById('draw-team-filters');
  var drawSquadFiltersEl = document.getElementById('draw-squad-filters');
  var rollcallSquadFiltersEl = document.getElementById('rollcall-squad-filters');
  var rollcallBoardEl = document.getElementById('rollcall-board');
  var rollcallCountEl = document.getElementById('rollcall-count');
  var rollcallAllEl = document.getElementById('rollcall-all');
  var rollcallNoneEl = document.getElementById('rollcall-none');
  var rollcallExpectedEl = document.getElementById('rollcall-expected');
  var rollcallPresentCountEl = document.getElementById('rollcall-present-count');
  var rollcallAbsentCountEl = document.getElementById('rollcall-absent-count');
  var rollcallReasonEl = document.getElementById('rollcall-reason');
  var rollcallCopyEl = document.getElementById('rollcall-copy');
  var staffInputEl = document.getElementById('staff-input');
  var staffClearEl = document.getElementById('staff-clear');
  var staffGroupFiltersEl = document.getElementById('staff-group-filters');
  var staffListEl = document.getElementById('staff-list');
  var staffCountEl = document.getElementById('staff-count');
  var mealsDayFiltersEl = document.getElementById('meals-day-filters');
  var mealsBodyEl = document.getElementById('meals-body');
  var lyricsBodyEl = document.getElementById('lyrics-body');
  var lyricsSongPaneEl = document.getElementById('pane-lyrics-song');
  var lyricsSongBackEl = document.getElementById('lyrics-song-back');
  var lyricsSongTitleEl = document.getElementById('lyrics-song-title');
  var lyricsSongBodyEl = document.getElementById('lyrics-song-body');
  var medicalDayFiltersEl = document.getElementById('medical-day-filters');
  var medicalScheduleBodyEl = document.getElementById('medical-schedule-body');
  var medicalTeamBodyEl = document.getElementById('medical-team-body');
  var medicalReportTextEl = document.getElementById('medical-report-text');
  var medicalReportNoteEl = document.getElementById('medical-report-note');
  var medicalVehicleBodyEl = document.getElementById('medical-vehicle-body');
  var nowBannerEl = document.getElementById('now-banner');
  var themeBtnEl = document.getElementById('theme-btn');
  var hqNowEl = document.getElementById('hq-now');
  var hqDayFiltersEl = document.getElementById('hq-day-filters');
  var hqScheduleBodyEl = document.getElementById('hq-schedule-body');
  var hqSheetLinkEl = document.getElementById('hq-sheet-link');
  var linksBodyEl = document.getElementById('links-body');
  var infoBodyEl = document.getElementById('info-body');
  var rollcallTimesEl = document.getElementById('rollcall-times');
  var drawNoRepeatToggleEl = document.getElementById('draw-norepeat-toggle');
  var drawResetBtnEl = document.getElementById('draw-reset-btn');
  var drawnCountEl = document.getElementById('drawn-count');

  var state = {
    days: [],
    people: [],
    selectedDay: null,
    lastUpdated: null,
    collapsedDays: {},
    offline: false,
    members: [],
    membersLoaded: false,
    rosterTeams: [],      // 多選；空 = 全部
    rosterSquads: [],     // 多選；空 = 該中隊全部小隊
    rosterGender: 'all',
    rosterNonMemberOnly: false,
    rosterQuery: '',
    staffGroup: 'all',    // 尋找工作人員：組別篩選
    staffQuery: '',
    mealsDay: 0,          // 用餐指南所選日期索引
    drawTeams: [],        // 抽籤範圍（中隊；空 = 全FSY）
    drawSquads: [],       // 抽籤範圍（小隊；空 = 所選中隊全部）
    drawMale: 1,
    drawFemale: 0,
    drawNoRepeat: false, // 抽籤是否排除已抽過的人
    drawnKeys: {},       // 已抽過的人（memberKey -> 1）
    hqDay: 0,            // 營本部排班表所選日期索引
    rollcallSquad: 18,
    rollcallPresent: {},  // { squad: { memberKey: true } }
    rollcallReasons: {},  // { "中隊|小隊": textarea內容 }
    rollcallAbsentKey: {}, // { "中隊|小隊": 上次未到名單的key，用於判斷是否需重建文字框 }
    squadAdvisors: {},    // "t|s" -> { 男: name, 女: name }
    currentTool: null,
    lyricsSongIndex: null,
    medicalDay: 0,        // 醫護組值班表所選日期索引
    unlocked: false,      // 是否已用密碼解鎖個資
    medicalPhones: {},    // 解密後的醫護電話
    medicalVehicles: [],  // 解密後的醫護車牌
    pendingTool: null,    // 解鎖後要開啟的工具
    hiddenAt: 0,          // 上次切到背景的時間（判斷閒置重鎖）
  };

  var didInitialScroll = false;
  var suppressHistory = false;
  var appHistoryDepth = 0;

  // ---- 觸覺回饋（Android 支援 vibrate；iOS 會靜默忽略，仍保留 CSS 按壓回饋）----
  function buzz(pattern) {
    if (navigator.vibrate) { try { navigator.vibrate(pattern || 8); } catch (e) {} }
  }
  // 全域輕震：所有可點擊元件按下時給一個很短的震動
  document.addEventListener('click', function (e) {
    if (e.target.closest('button, .rollcall-row, .member-card, .activity-card.expandable, .search-result-item, .day-section-header, .tool-menu-card')) {
      buzz(8);
    }
  }, true);

  // ---- 外觀主題（自動／深色／淺色；深夜寧靜時間好用）----
  var THEME_KEY = 'fsy5_theme';
  var themeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function currentThemeMode() {
    try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { return 'auto'; }
  }
  function applyTheme() {
    var mode = currentThemeMode();
    var dark = mode === 'dark' || (mode === 'auto' && themeMedia && themeMedia.matches);
    document.documentElement.classList.toggle('dark', dark);
    if (themeBtnEl) {
      themeBtnEl.textContent = mode === 'auto' ? '🌗' : (mode === 'dark' ? '🌙' : '☀️');
      themeBtnEl.title = '外觀：' + (mode === 'auto' ? '自動' : mode === 'dark' ? '深色' : '淺色');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#16211c' : '#2f6f4f');
  }
  if (themeBtnEl) {
    themeBtnEl.addEventListener('click', function () {
      var order = ['auto', 'dark', 'light'];
      var next = order[(order.indexOf(currentThemeMode()) + 1) % order.length];
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme();
    });
  }
  if (themeMedia) {
    if (themeMedia.addEventListener) themeMedia.addEventListener('change', applyTheme);
    else if (themeMedia.addListener) themeMedia.addListener(applyTheme);
  }
  applyTheme();

  function buildCsvUrl(sheetId, sheetName) {
    return (
      'https://docs.google.com/spreadsheets/d/' +
      sheetId +
      '/gviz/tq?tqx=out:csv&sheet=' +
      encodeURIComponent(sheetName) +
      '&headers=0&_t=' +
      Date.now()
    );
  }

  function isDayHeader(s) {
    return /^\d{1,2}\/\d{1,2}/.test(s);
  }

  function isActivityRow(s) {
    return /^\d{1,2}:\d{2}/.test(s);
  }

  function parseDayIndex(s) {
    var m = s.match(/D-(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  function getNow() {
    var params = new URLSearchParams(location.search);
    var demo = params.get('demo_time');
    if (demo) {
      var d = new Date(demo);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }

  function parseHM(s) {
    var m = (s || '').trim().match(/^(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  function parseTimeRange(timeStr) {
    var parts = (timeStr || '').match(/\d{1,2}:\d{2}/g) || [];
    return {
      start: parseHM(parts[0]),
      end: parts.length > 1 ? parseHM(parts[1]) : null,
    };
  }

  function scheduleSortMinutes(timeStr) {
    var start = parseHM(timeStr);
    if (start === null) return 9999;
    return start < 4 * 60 ? start + 24 * 60 : start;
  }

  function isRowCurrent(dayLabel, row, now) {
    var m = (dayLabel || '').match(/^(\d{1,2})\/(\d{1,2})/);
    if (!m) return false;
    if (now.getMonth() + 1 !== parseInt(m[1], 10) || now.getDate() !== parseInt(m[2], 10)) return false;
    var range = parseTimeRange(row.time);
    if (range.start === null || range.end === null) return false;
    var nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= range.start && nowMin < range.end;
  }

  function addOccurrenceIndex(rows) {
    var counts = {};
    return rows.map(function (r) {
      counts[r.time] = (counts[r.time] || 0) + 1;
      var withIdx = {};
      for (var k in r) withIdx[k] = r[k];
      withIdx.occIdx = counts[r.time];
      return withIdx;
    });
  }

  function parseZhize(rows) {
    var header = rows[0] || [];
    var people = header
      .slice(2)
      .map(function (s) { return (s || '').trim(); })
      .filter(Boolean);
    var days = {};
    var current = null;
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var col0 = (row[0] || '').trim();
      if (isDayHeader(col0)) {
        var idx = parseDayIndex(col0);
        current = idx ? { label: col0, rows: [] } : null;
        if (idx) days[idx] = current;
        continue;
      }
      if (!current) continue;
      if (isActivityRow(col0)) {
        var activity = (row[1] || '').trim();
        var peopleData = {};
        people.forEach(function (name, j) {
          var val = (row[2 + j] || '').trim();
          if (val) peopleData[name] = val;
        });
        current.rows.push({ time: col0, activity: activity, people: peopleData });
      }
    }
    return { people: people, days: days };
  }

  // 「2026 細流」欄位順序（A起算）：0時間 1活動內容 2待修改事項 3地點
  // 4說明(細流連結) 5主要負責的工作人員 6參與的工作人員 7使用設備 8小隊輔指引 9助理協調員指引
  function parseXiliu(rows) {
    var days = {};
    var current = null;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var col0 = (row[0] || '').trim();
      if (isDayHeader(col0)) {
        var idx = parseDayIndex(col0);
        current = idx ? { label: col0, rows: [], note: '' } : null;
        if (idx) days[idx] = current;
        continue;
      }
      if (!current) continue;
      if (isActivityRow(col0)) {
        current.rows.push({
          time: col0,
          activity: (row[1] || '').trim(),
          location: (row[3] || '').trim(),
          leader: (row[5] || '').trim(),
          detailLink: (row[4] || '').trim(),
          leaderGuide: (row[8] || '').trim(),
          acGuide: (row[9] || '').trim(),
        });
      } else if (!current.note && current.rows.length === 0 && col0) {
        current.note = col0;
      }
    }
    return { days: days };
  }

  function buildJoinedDays(zhize, xiliu) {
    var result = [];
    for (var d = 1; d <= 6; d++) {
      var zRows = addOccurrenceIndex((zhize.days[d] && zhize.days[d].rows) || []);
      var xRows = addOccurrenceIndex((xiliu.days[d] && xiliu.days[d].rows) || []);
      var zMap = new Map();
      zRows.forEach(function (r) { zMap.set(r.time + '#' + r.occIdx, r); });
      var joined = xRows.map(function (xr) {
        var key = xr.time + '#' + xr.occIdx;
        var zr = zMap.get(key);
        if (zr) zMap.delete(key);
        return {
          time: xr.time,
          activity: xr.activity || (zr ? zr.activity : ''),
          location: xr.location,
          leader: xr.leader,
          detailLink: xr.detailLink,
          leaderGuide: xr.leaderGuide,
          acGuide: xr.acGuide,
          people: zr ? zr.people : {},
        };
      });
      zMap.forEach(function (zr) {
        joined.push({
          time: zr.time, activity: zr.activity, location: '',
          leader: '', detailLink: '', leaderGuide: '', acGuide: '',
          people: zr.people,
        });
      });
      joined = joined.map(function (row, order) {
        return { row: row, order: order };
      }).sort(function (a, b) {
        return scheduleSortMinutes(a.row.time) - scheduleSortMinutes(b.row.time) || a.order - b.order;
      }).map(function (item) { return item.row; });
      var label =
        (xiliu.days[d] && xiliu.days[d].label) ||
        (zhize.days[d] && zhize.days[d].label) ||
        ('D-' + d);
      var note = (xiliu.days[d] && xiliu.days[d].note) || '';
      result.push({ index: d, label: label, note: note, rows: joined });
    }
    return result;
  }

  function fetchCsvText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    });
  }

  function detectTodayDayIndex() {
    var now = getNow();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    for (var i = 0; i < state.days.length; i++) {
      var m = state.days[i].label.match(/^(\d{1,2})\/(\d{1,2})/);
      if (m && parseInt(m[1], 10) === month && parseInt(m[2], 10) === date) {
        return state.days[i].index;
      }
    }
    return null;
  }

  function applyData(zhizeRows, xiliuRows, updatedDate, offline) {
    var zhize = parseZhize(zhizeRows);
    var xiliu = parseXiliu(xiliuRows);
    state.people = zhize.people;
    state.days = buildJoinedDays(zhize, xiliu);
    if (state.selectedDay === null) {
      var todayIdx = detectTodayDayIndex();
      state.selectedDay = todayIdx || 1;
      // 大會期間自動展開「今天」，其他日子收合；會前則全部收合
      state.days.forEach(function (day) {
        state.collapsedDays[day.index] = todayIdx ? day.index !== todayIdx : true;
      });
    }
    state.lastUpdated = updatedDate;
    state.offline = !!offline;
    populatePersonSelect();
    renderDayPills();
    renderMeTab();
    renderOverviewTab();
    updateStatus();
    if (!didInitialScroll) {
      didInitialScroll = true;
      scrollToCurrent(document.querySelector('.tab-panel.active'));
    }
  }

  function loadFromCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      var obj = JSON.parse(raw);
      if (!obj || !obj.zhize || !obj.xiliu) return false;
      var zhizeRows = Papa.parse(obj.zhize, { skipEmptyLines: true }).data;
      var xiliuRows = Papa.parse(obj.xiliu, { skipEmptyLines: true }).data;
      applyData(zhizeRows, xiliuRows, obj.ts ? new Date(obj.ts) : null, true);
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadData(isManual) {
    if (isManual) refreshBtnEl.classList.add('spinning');
    if (!state.lastUpdated) statusTextEl.textContent = '資料載入中…';
    if (isManual) refreshRosterIfUnlocked();
    return Promise.all([
      fetchCsvText(buildCsvUrl(ZHIZE_ID, ZHIZE_SHEET)),
      fetchCsvText(buildCsvUrl(XILIU_ID, XILIU_SHEET)),
    ]).then(function (texts) {
      var zhizeRows = Papa.parse(texts[0], { skipEmptyLines: true }).data;
      var xiliuRows = Papa.parse(texts[1], { skipEmptyLines: true }).data;
      var now = new Date();
      applyData(zhizeRows, xiliuRows, now, false);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now.getTime(), zhize: texts[0], xiliu: texts[1] }));
      } catch (e) { /* storage unavailable or full */ }
    }).catch(function (err) {
      console.error(err);
      if (state.days.length === 0) {
        var banner = '<div class="error-banner">資料載入失敗，且沒有可用的離線資料。請連上網路後按右上角「重新整理」。</div>';
        meContentEl.innerHTML = banner;
        overviewContentEl.innerHTML = banner;
        statusTextEl.textContent = '載入失敗';
      } else {
        state.offline = true;
        updateStatus();
      }
    }).finally(function () {
      refreshBtnEl.classList.remove('spinning');
    });
  }

  function updateStatus() {
    if (!state.lastUpdated) {
      statusTextEl.textContent = '資料載入中…';
      return;
    }
    var timeStr = state.lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (state.offline) {
      statusTextEl.textContent = '⚠ 目前離線，顯示 ' + timeStr + ' 的資料';
    } else {
      statusTextEl.textContent = '資料更新時間：' + timeStr + '（切回畫面時自動更新）';
    }
    updateTopbarHeight();
  }

  function populatePersonSelect() {
    var stored = localStorage.getItem(STORAGE_KEY);
    personSelectEl.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '請選擇你的名字';
    placeholder.disabled = true;
    personSelectEl.appendChild(placeholder);
    state.people.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      personSelectEl.appendChild(opt);
    });
    personSelectEl.value = (stored && state.people.indexOf(stored) !== -1) ? stored : '';
  }

  // 從日期標題（如「7/13 (一) D-1」）取出「7/13」與星期
  function parseDayLabelParts(label) {
    var m = (label || '').match(/^(\d{1,2}\/\d{1,2})\s*[（(]([一二三四五六日])[)）]?/);
    return m ? { date: m[1], dow: m[2] } : null;
  }

  function makeDayPill(dTag, dateText, active) {
    var btn = document.createElement('button');
    btn.className = 'day-pill' + (active ? ' active' : '');
    var top = document.createElement('span');
    top.className = 'day-pill-d';
    top.textContent = dTag;
    btn.appendChild(top);
    if (dateText) {
      var sub = document.createElement('span');
      sub.className = 'day-pill-date';
      sub.textContent = dateText;
      btn.appendChild(sub);
    }
    return btn;
  }

  function renderDayPills() {
    dayPillsEl.innerHTML = '';
    var todayIdx = detectTodayDayIndex();
    state.days.forEach(function (day) {
      var parts = parseDayLabelParts(day.label);
      var btn = makeDayPill('D-' + day.index, parts ? parts.date + ' ' + parts.dow : '', day.index === state.selectedDay);
      if (day.index === todayIdx) btn.classList.add('today');
      btn.addEventListener('click', function () {
        state.selectedDay = day.index;
        renderDayPills();
        renderOverviewTab();
      });
      dayPillsEl.appendChild(btn);
    });
  }

  function extractStartMinutes(note) {
    var m = (note || '').match(/(早上|上午|中午|下午|晚上)?\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    var hour = parseInt(m[2], 10);
    var minute = parseInt(m[3], 10);
    if ((m[1] === '下午' || m[1] === '晚上') && hour < 12) hour += 12;
    return hour * 60 + minute;
  }

  function buildPersonChips(people, excludePerson, currentPerson) {
    var chipRow = document.createElement('div');
    chipRow.className = 'chip-row';
    var names = Object.keys(people).filter(function (name) { return name !== excludePerson; });
    names.sort(function (a, b) {
      var ta = extractStartMinutes(people[a]);
      var tb = extractStartMinutes(people[b]);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return ta - tb;
    });
    names.forEach(function (name) {
      var chip = document.createElement('span');
      var isMe = name === currentPerson;
      chip.className = 'chip' + (isMe ? ' chip-me' : '');
      var personNote = people[name];
      if (personNote && personNote !== '✔️') {
        chip.textContent = name + ' ';
        var noteSpan = document.createElement('span');
        noteSpan.className = 'chip-note';
        noteSpan.textContent = personNote;
        chip.appendChild(noteSpan);
      } else {
        chip.textContent = name;
      }
      chipRow.appendChild(chip);
    });
    return chipRow;
  }

  function isMealActivity(act) {
    return /餐|膳食|宵夜/.test(act || '');
  }

  function isYmActivity(act) {
    return /(男青年|女青年)/.test(act || '');
  }

  function resolveLink(text) {
    var m = (text || '').match(/https?:\/\/\S+/);
    if (m) return m[0];
    var key = (text || '').trim();
    if (XILIU_LINKS[key]) return XILIU_LINKS[key];
    for (var label in XILIU_LINKS) {
      if (key.indexOf(label) !== -1) return XILIU_LINKS[label];
    }
    return null;
  }

  function splitActivityTitle(activity) {
    var text = (activity || '').replace(/\s*[\r\n]+\s*/g, ' ').trim();
    var idx = text.search(/[(（]/);
    if (idx <= 0) return { main: text, sub: null };
    return { main: text.slice(0, idx).trim(), sub: text.slice(idx).trim() };
  }

  function buildTextValue(text) {
    var span = document.createElement('span');
    span.className = 'detail-value';
    span.textContent = text;
    return span;
  }

  function buildEvidenceList(items) {
    var box = document.createElement('div');
    box.className = 'detail-value evidence-list';
    items.forEach(function (line) {
      var d = document.createElement('div');
      d.className = 'evidence-line';
      d.textContent = line;
      box.appendChild(d);
    });
    return box;
  }

  // iOS 主畫面（standalone）模式下 target=_blank 會失效，改用程式開啟並保底導向
  function bindExternalOpen(a, url) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var opened = window.open(url, '_blank');
      if (!opened) window.location.href = url;
    });
  }

  function buildLinkValue(label, url) {
    var span = document.createElement('span');
    span.className = 'detail-value';
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'detail-link';
    a.textContent = '🔗 ' + label;
    bindExternalOpen(a, url);
    span.appendChild(a);
    return span;
  }

  function buildDetailBody(row) {
    var fields = [];
    if (row.leader) fields.push(['主要負責', buildTextValue(row.leader)]);

    if (row.detailLink) {
      var url = resolveLink(row.detailLink);
      if (url) {
        var label = /https?:\/\//.test(row.detailLink) ? '開啟細流' : row.detailLink;
        fields.push(['細流連結', buildLinkValue(label, url)]);
      } else {
        // 說明欄非連結時為一般備註，標示為「說明」而非「細流連結」
        fields.push(['說明', buildTextValue(row.detailLink)]);
      }
    } else if (isMealActivity(row.activity)) {
      fields.push(['膳食組細流', buildLinkValue('開啟膳食組細流', MEAL_LINK_URL)]);
    }

    if (row.leaderGuide) fields.push(['小隊輔指引', buildTextValue(row.leaderGuide)]);
    if (row.acGuide) fields.push(['助理協調員指引', buildTextValue(row.acGuide)]);

    if (isYmActivity(row.activity)) {
      fields.push(['小隊證據分配', buildEvidenceList(YM_EVIDENCE), true]);
    }

    if (fields.length === 0) return null;

    var body = document.createElement('div');
    body.className = 'card-detail';
    fields.forEach(function (f) {
      var rowEl = document.createElement('div');
      rowEl.className = 'detail-row' + (f[2] ? ' detail-row-block' : '');
      var lab = document.createElement('span');
      lab.className = 'detail-label';
      lab.textContent = f[0];
      rowEl.appendChild(lab);
      rowEl.appendChild(f[1]);
      body.appendChild(rowEl);
    });
    return body;
  }

  function setCardProgress(card, timeStr, now) {
    var range = parseTimeRange(timeStr);
    if (range.start === null || range.end === null) return;
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var pct = Math.round(((nowMin - range.start) / (range.end - range.start)) * 100);
    card.style.setProperty('--prog', Math.max(3, Math.min(100, pct)) + '%');
  }

  function buildActivityCard(row, highlightPerson, dayLabel, now) {
    var card = document.createElement('div');
    var hasAssignments = Object.keys(row.people).length > 0;
    var classes = ['activity-card'];
    card.dataset.time = row.time;
    card.dataset.dayLabel = dayLabel || '';
    if (now && isRowCurrent(dayLabel, row, now)) {
      classes.push('current');
      setCardProgress(card, row.time, now);
    }
    card.className = classes.join(' ');

    var header = document.createElement('div');
    header.className = 'activity-header';

    var time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = row.time;
    header.appendChild(time);

    var parsedTitle = splitActivityTitle(row.activity);

    var title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = parsedTitle.main;
    header.appendChild(title);

    card.appendChild(header);

    if (parsedTitle.sub) {
      var subtitle = document.createElement('div');
      subtitle.className = 'activity-subtitle';
      subtitle.textContent = parsedTitle.sub;
      card.appendChild(subtitle);
    }

    if (row.location) {
      var loc = document.createElement('div');
      loc.className = 'activity-location';
      loc.textContent = row.location;
      card.appendChild(loc);
    }

    if (highlightPerson) {
      var note = row.people[highlightPerson];
      if (note && note !== '✔️') {
        var noteEl = document.createElement('div');
        noteEl.className = 'self-note';
        noteEl.textContent = note;
        card.appendChild(noteEl);
      }
      var companionKeys = Object.keys(row.people).filter(function (n) { return n !== highlightPerson; });
      if (companionKeys.length > 0) {
        var label = document.createElement('div');
        label.className = 'chip-label';
        label.textContent = '同行：';
        card.appendChild(label);
        card.appendChild(buildPersonChips(row.people, highlightPerson, personSelectEl.value));
      }
    } else if (hasAssignments) {
      card.appendChild(buildPersonChips(row.people, null, personSelectEl.value));
    }

    var detailBody = buildDetailBody(row);
    if (detailBody) {
      var detailWrap = document.createElement('div');
      detailWrap.className = 'card-detail-wrap';
      detailWrap.appendChild(detailBody);
      card.appendChild(detailWrap);

      var expandBar = document.createElement('div');
      expandBar.className = 'card-expand-bar';
      var expandLabel = document.createElement('span');
      expandLabel.textContent = '詳情';
      expandBar.appendChild(expandLabel);
      var expandCaret = document.createElement('span');
      expandCaret.className = 'card-expand-caret';
      expandCaret.textContent = '▾';
      expandBar.appendChild(expandCaret);
      card.appendChild(expandBar);

      card.classList.add('expandable');
      card.addEventListener('click', function () {
        var open = card.classList.toggle('open');
        if (open) {
          detailWrap.style.maxHeight = detailBody.scrollHeight + 'px';
        } else {
          detailWrap.style.maxHeight = '0px';
        }
      });
    }

    return card;
  }

  function renderMeTab() {
    var person = personSelectEl.value;
    var now = getNow();
    meContentEl.innerHTML = '';
    if (!person) {
      var note = document.createElement('div');
      note.className = 'empty-note';
      note.textContent = '請先在上方選擇你的名字，即可查看你在 D-1~D-6 各時段的職責。';
      meContentEl.appendChild(note);
      return;
    }
    state.days.forEach(function (day) {
      var section = document.createElement('div');
      section.className = 'day-section' + (state.collapsedDays[day.index] ? ' collapsed' : '');

      var header = document.createElement('div');
      header.className = 'day-section-header';

      var title = document.createElement('div');
      title.className = 'day-section-title';
      title.textContent = day.label;
      header.appendChild(title);

      var toggle = document.createElement('span');
      toggle.className = 'day-section-toggle';
      toggle.textContent = '▾';
      header.appendChild(toggle);

      section.appendChild(header);

      var body = document.createElement('div');
      body.className = 'day-section-body';

      if (day.note) {
        var noteEl = document.createElement('div');
        noteEl.className = 'day-section-note';
        noteEl.textContent = day.note;
        body.appendChild(noteEl);
      }

      var items = day.rows.filter(function (r) { return r.people[person]; });
      if (items.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-note';
        empty.textContent = '本日沒有特別職責';
        body.appendChild(empty);
      } else {
        items.forEach(function (r) {
          body.appendChild(buildActivityCard(r, person, day.label, now));
        });
      }
      section.appendChild(body);
      meContentEl.appendChild(section);

      if (state.collapsedDays[day.index]) {
        body.style.maxHeight = '0px';
      }

      body.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'max-height' && !section.classList.contains('collapsed')) {
          body.style.maxHeight = 'none';
        }
      });

      header.addEventListener('click', function () {
        var collapsed = section.classList.toggle('collapsed');
        state.collapsedDays[day.index] = collapsed;
        if (collapsed) {
          body.style.maxHeight = body.scrollHeight + 'px';
          requestAnimationFrame(function () {
            body.style.maxHeight = '0px';
          });
        } else {
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });

    fitCardText(meContentEl);
  }

  function renderOverviewTab() {
    overviewContentEl.innerHTML = '';
    var day = state.days.filter(function (d) { return d.index === state.selectedDay; })[0];
    if (!day) return;
    var now = getNow();

    var title = document.createElement('div');
    title.className = 'day-section-title overview-day-title';
    title.textContent = day.label;
    overviewContentEl.appendChild(title);

    // 服裝／大會T-shirt 資訊（與 Tab 1 相同，來自「2026 細流」即時資料）
    // 放在最上面，但不像日期標題那樣 sticky 凍結。
    if (day.note) {
      var noteEl = document.createElement('div');
      noteEl.className = 'day-section-note';
      noteEl.textContent = day.note;
      overviewContentEl.appendChild(noteEl);
    }

    day.rows.forEach(function (row, idx) {
      var card = buildActivityCard(row, null, day.label, now);
      card.dataset.key = day.index + '-' + idx;
      overviewContentEl.appendChild(card);
    });

    renderNowBanner();
    playFadeIn(overviewContentEl);
    fitCardText(overviewContentEl);
  }

  function playFadeIn(el) {
    el.classList.remove('fade-in');
    void el.offsetWidth;
    el.classList.add('fade-in');
  }

  function currentTabName() {
    var active = document.querySelector('.tab-btn.active');
    return active ? active.dataset.tab : 'me';
  }

  function isUnlockOpen() {
    return unlockOverlayEl && unlockOverlayEl.classList.contains('open');
  }

  function isSearchOpen() {
    return searchOverlayEl && searchOverlayEl.classList.contains('open');
  }

  function isLyricsSongOpen() {
    return lyricsSongPaneEl && !lyricsSongPaneEl.hidden;
  }

  function appRouteState() {
    return {
      fsyApp: 1,
      tab: currentTabName(),
      tool: state.currentTool || '',
      unlock: isUnlockOpen() ? 1 : 0,
      search: isSearchOpen() ? 1 : 0,
      lyricsIndex: isLyricsSongOpen() ? state.lyricsSongIndex : null,
    };
  }

  function sameRoute(a, b) {
    return !!a && !!b &&
      a.fsyApp === b.fsyApp &&
      a.tab === b.tab &&
      (a.tool || '') === (b.tool || '') &&
      !!a.unlock === !!b.unlock &&
      !!a.search === !!b.search &&
      (a.lyricsIndex == null ? null : a.lyricsIndex) === (b.lyricsIndex == null ? null : b.lyricsIndex);
  }

  function rememberRoute(replace) {
    if (suppressHistory || !window.history || !history.pushState) return;
    var route = appRouteState();
    if (sameRoute(history.state, route)) return;
    try {
      if (replace) history.replaceState(route, '', location.href);
      else {
        history.pushState(route, '', location.href);
        appHistoryDepth += 1;
      }
    } catch (e) {}
  }

  function goBackOr(fallback) {
    if (appHistoryDepth > 0 && window.history && history.state && history.state.fsyApp) {
      history.back();
      return;
    }
    fallback();
  }

  function activateTab(name, options) {
    options = options || {};
    var btn = document.querySelector('.tab-btn[data-tab="' + name + '"]');
    var panel = document.getElementById('tab-' + name);
    if (!btn || !panel) return;
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    panel.classList.add('active');
    playFadeIn(panel);
    searchFabEl.hidden = name !== 'overview';
    if (name !== 'overview') closeSearch({ skipHistory: true });
    if (name === 'tools') {
      if (!options.keepTool) backToToolsMenu({ skipHistory: true });
    } else {
      if (state.currentTool) backToToolsMenu({ skipHistory: true });
      scrollToCurrent(panel);
    }
    if (!options.skipHistory) rememberRoute(false);
  }

  function applyRoute(route) {
    suppressHistory = true;
    try {
      route = route && route.fsyApp ? route : { tab: 'me' };
      activateTab(route.tab || 'me', { skipHistory: true, keepTool: !!route.tool });
      if ((route.tab || 'me') === 'tools' && route.tool) openTool(route.tool, { skipHistory: true });
      else if (state.currentTool) backToToolsMenu({ skipHistory: true });
      if (route.lyricsIndex != null && state.currentTool === 'lyrics') openLyricsSong(route.lyricsIndex, { skipHistory: true });
      else if (isLyricsSongOpen()) closeLyricsSong({ skipHistory: true });
      if (route.search) openSearch({ skipHistory: true });
      else closeSearch({ skipHistory: true });
      if (route.unlock) showUnlock({ skipHistory: true });
      else hideUnlock({ skipHistory: true });
    } finally {
      suppressHistory = false;
    }
  }

  function shrinkToFit(el, minPx) {
    var size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth + 1 && size > minPx) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  }

  function fitCardText(container) {
    container.querySelectorAll('.activity-title').forEach(function (el) { shrinkToFit(el, 13); });
    container.querySelectorAll('.self-note').forEach(function (el) { shrinkToFit(el, 11); });
  }

  function scrollToCurrent(container) {
    if (!container) return;
    var el = container.querySelector('.activity-card.current');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  // ---- 「現在／接下來」即時橫幅（行程總覽，僅在看「今天」時顯示）----
  function formatMinutesLeft(mins) {
    if (mins < 60) return mins + ' 分鐘';
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + ' 小時' + (m ? ' ' + m + ' 分' : '');
  }

  function findLiveRows(day, now) {
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var current = null, next = null, nextStart = null;
    day.rows.forEach(function (row) {
      var range = parseTimeRange(row.time);
      if (range.start === null) return;
      if (range.end !== null && nowMin >= range.start && nowMin < range.end) {
        if (!current) current = row;
      } else if (range.start > nowMin && (nextStart === null || range.start < nextStart)) {
        next = row;
        nextStart = range.start;
      }
    });
    return { current: current, next: next, nextStart: nextStart, nowMin: nowMin };
  }

  function renderNowBanner() {
    if (!nowBannerEl) return;
    var todayIdx = detectTodayDayIndex();
    if (!todayIdx || state.selectedDay !== todayIdx) { nowBannerEl.hidden = true; return; }
    var day = state.days.filter(function (d) { return d.index === todayIdx; })[0];
    if (!day) { nowBannerEl.hidden = true; return; }
    var now = getNow();
    var live = findLiveRows(day, now);
    if (!live.current && !live.next) { nowBannerEl.hidden = true; return; }

    nowBannerEl.innerHTML = '';
    if (live.current) {
      var range = parseTimeRange(live.current.time);
      var line = document.createElement('div');
      line.className = 'now-line';
      line.innerHTML =
        '<span class="now-dot"></span><span class="now-tag">進行中</span>' +
        '<span class="now-time">' + escapeHtml(live.current.time) + '</span>' +
        '<span class="now-title">' + escapeHtml(splitActivityTitle(live.current.activity).main) + '</span>';
      nowBannerEl.appendChild(line);
      if (range.start !== null && range.end !== null) {
        var prog = document.createElement('div');
        prog.className = 'now-prog';
        var pct = Math.round(((live.nowMin - range.start) / (range.end - range.start)) * 100);
        prog.innerHTML = '<i style="width:' + Math.max(3, Math.min(100, pct)) + '%"></i>';
        nowBannerEl.appendChild(prog);
      }
    }
    if (live.next) {
      var nextLine = document.createElement('div');
      nextLine.className = 'next-line';
      nextLine.textContent =
        '接下來 ' + live.next.time + '　' + splitActivityTitle(live.next.activity).main +
        '（還有 ' + formatMinutesLeft(live.nextStart - live.nowMin) + '）';
      nowBannerEl.appendChild(nextLine);
    }
    nowBannerEl.hidden = false;
  }

  // 每 30 秒更新一次「進行中」卡片標記、進度與橫幅（不重繪整頁，展開狀態不受影響）
  function updateLiveState() {
    var now = getNow();
    document.querySelectorAll('.activity-card[data-time]').forEach(function (card) {
      var isCur = isRowCurrent(card.dataset.dayLabel, { time: card.dataset.time }, now);
      card.classList.toggle('current', isCur);
      if (isCur) setCardProgress(card, card.dataset.time, now);
    });
    renderNowBanner();
  }

  setInterval(function () {
    if (!document.hidden) updateLiveState();
  }, 30000);

  function updateTopbarHeight() {
    var topBar = document.querySelector('.top-bar');
    if (!topBar) return;
    document.documentElement.style.setProperty('--topbar-h', topBar.getBoundingClientRect().height + 'px');
  }

  function syncSearchViewport() {
    var vv = window.visualViewport;
    if (!vv) return;
    var root = document.documentElement.style;
    root.setProperty('--kb-inset', Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + 'px');
    root.setProperty('--vvh', vv.height + 'px');
  }

  // ---- Search (Tab 2) ----
  function normalizeForSearch(s) {
    return (s || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function fuzzyScore(query, target) {
    var q = normalizeForSearch(query);
    var t = normalizeForSearch(target);
    if (!q || !t) return -1;
    var idx = t.indexOf(q);
    if (idx !== -1) return 1000 - idx;
    var ti = 0, gaps = 0;
    for (var qi = 0; qi < q.length; qi++) {
      var found = t.indexOf(q[qi], ti);
      if (found === -1) return -1;
      gaps += found - ti;
      ti = found + 1;
    }
    return 500 - gaps;
  }

  function buildSearchIndex() {
    var index = [];
    state.days.forEach(function (day) {
      day.rows.forEach(function (row, idx) {
        var parsed = splitActivityTitle(row.activity);
        var text = [parsed.main, parsed.sub, row.location, row.leader]
          .concat(Object.keys(row.people || {}))
          .filter(Boolean)
          .join(' ');
        index.push({
          dayIndex: day.index,
          rowIndex: idx,
          time: row.time,
          title: parsed.main,
          location: row.location,
          text: text
        });
      });
    });
    return index;
  }

  function runSearch(query) {
    searchResultsEl.innerHTML = '';
    if (!query.trim()) {
      var hint = document.createElement('div');
      hint.className = 'search-empty';
      hint.textContent = '輸入關鍵字搜尋行程或地點';
      searchResultsEl.appendChild(hint);
      return;
    }

    var scored = buildSearchIndex()
      .map(function (entry) { return { entry: entry, score: fuzzyScore(query, entry.text) }; })
      .filter(function (s) { return s.score > -1; });
    scored.sort(function (a, b) { return b.score - a.score; });
    scored = scored.slice(0, 30);

    if (scored.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = '找不到符合的行程';
      searchResultsEl.appendChild(empty);
      return;
    }

    scored.forEach(function (s) {
      var entry = s.entry;
      var item = document.createElement('div');
      item.className = 'search-result-item';

      var dayBadge = document.createElement('span');
      dayBadge.className = 'search-result-day';
      dayBadge.textContent = 'D-' + entry.dayIndex;

      var time = document.createElement('span');
      time.className = 'search-result-time';
      time.textContent = entry.time;

      var title = document.createElement('span');
      title.className = 'search-result-title';
      title.textContent = entry.title + (entry.location ? '・' + entry.location : '');

      item.appendChild(dayBadge);
      item.appendChild(time);
      item.appendChild(title);
      item.addEventListener('click', function () { jumpToResult(entry); });
      searchResultsEl.appendChild(item);
    });
  }

  function jumpToResult(entry) {
    closeSearch();
    state.selectedDay = entry.dayIndex;
    renderDayPills();
    renderOverviewTab();

    var card = overviewContentEl.querySelector('[data-key="' + entry.dayIndex + '-' + entry.rowIndex + '"]');
    if (!card) return;
    card.scrollIntoView({ block: 'center', behavior: 'smooth' });
    card.classList.remove('search-highlight');
    void card.offsetWidth;
    card.classList.add('search-highlight');
  }

  function openSearch(options) {
    options = options || {};
    searchOverlayEl.classList.add('open');
    runSearch(searchInputEl.value);
    syncSearchViewport();
    setTimeout(function () { searchInputEl.focus(); }, 250);
    if (!options.skipHistory) rememberRoute(false);
  }

  function closeSearch(options) {
    options = options || {};
    searchOverlayEl.classList.remove('open');
    searchInputEl.blur();
    if (!options.skipHistory) rememberRoute(false);
  }

  // ---- Tab 3: 小工具（含個資的工具需密碼解鎖）----
  var PROTECTED_TOOLS = { roster: 1, staff: 1, draw: 1, rollcall: 1, medical: 1 };
  var UNLOCK_KEY = 'fsy5_unlock';
  var IDLE_MS = 30 * 60 * 1000; // 離開／背景超過 30 分鐘才需重新輸入密碼
  var encBlobCache = null;

  var unlockOverlayEl = document.getElementById('unlock-overlay');
  var unlockInputEl = document.getElementById('unlock-input');
  var unlockSubmitEl = document.getElementById('unlock-submit');
  var unlockCancelEl = document.getElementById('unlock-cancel');
  var unlockErrorEl = document.getElementById('unlock-error');

  function b64ToBytes(s) {
    var bin = atob(s);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  function deriveKey(pass, salt, iter) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey'])
      .then(function (baseKey) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' },
          baseKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      });
  }

  function fetchEncBlob() {
    if (encBlobCache) return Promise.resolve(encBlobCache);
    return fetch('data.enc.json?_t=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('blob'); return r.json(); })
      .then(function (b) { encBlobCache = b; return b; });
  }

  function decryptWith(pass) {
    return fetchEncBlob().then(function (b) {
      return deriveKey(pass, b64ToBytes(b.salt), b.iter)
        .then(function (key) {
          return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(b.iv) }, key, b64ToBytes(b.ct));
        })
        .then(function (pt) { return JSON.parse(new TextDecoder().decode(pt)); });
    });
  }

  function applySecret(data) {
    state.members = data.members || [];
    state.membersMeta = data.meta || {};
    state.medicalPhones = data.medicalPhones || {};
    state.medicalVehicles = data.medicalVehicles || [];
    state.membersLoaded = true;
    state.unlocked = true;
    buildSquadAdvisors();
  }

  function saveUnlock(pass) {
    try { sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({ p: pass, t: Date.now() })); } catch (e) {}
  }
  function touchUnlock() {
    try {
      var raw = sessionStorage.getItem(UNLOCK_KEY);
      if (!raw) return;
      var o = JSON.parse(raw); o.t = Date.now();
      sessionStorage.setItem(UNLOCK_KEY, JSON.stringify(o));
    } catch (e) {}
  }
  function clearUnlock() {
    try { sessionStorage.removeItem(UNLOCK_KEY); } catch (e) {}
  }

  function lock() {
    state.unlocked = false;
    state.membersLoaded = false;
    state.members = [];
    clearUnlock();
  }

  // 背景回來／重新整理時，用 session 暫存的密碼自動解鎖（未逾時的話）
  function trySilentUnlock() {
    var raw;
    try { raw = sessionStorage.getItem(UNLOCK_KEY); } catch (e) { return; }
    if (!raw) return;
    var o;
    try { o = JSON.parse(raw); } catch (e) { return; }
    if (!o || !o.p || (Date.now() - o.t) > IDLE_MS) { clearUnlock(); return; }
    decryptWith(o.p)
      .then(function (data) { applySecret(data); saveUnlock(o.p); })
      .catch(function () { clearUnlock(); });
  }

  // 手動重新整理時，若已解鎖則一併重抓最新加密名冊（data.enc.json），
  // 讓「抽籤／點名／小隊員一覽」在名冊更新後免重載即可即時反映人員變動。
  function refreshRosterIfUnlocked() {
    if (!state.unlocked) return Promise.resolve();
    var raw;
    try { raw = sessionStorage.getItem(UNLOCK_KEY); } catch (e) { return Promise.resolve(); }
    if (!raw) return Promise.resolve();
    var o;
    try { o = JSON.parse(raw); } catch (e) { return Promise.resolve(); }
    if (!o || !o.p) return Promise.resolve();
    encBlobCache = null; // 清掉本次 session 快取，強制重抓最新檔案
    return decryptWith(o.p).then(function (data) {
      applySecret(data);
      saveUnlock(o.p);
      // 重新渲染目前開啟的小工具，使人數／名單即時更新
      var t = state.currentTool;
      if (t === 'roster') { renderRosterFilters(); renderRoster(); }
      else if (t === 'rollcall') { renderRollcallFilters(); renderRollcall(); }
      else if (t === 'draw') { renderDrawFilters(); syncDrawSteppers(); }
      else if (t === 'staff') { renderStaffFilters(); renderStaff(); }
    }).catch(function () { /* 密碼／網路問題：維持現有名冊，不中斷行程更新 */ });
  }

  function showUnlock(options) {
    options = options || {};
    unlockErrorEl.textContent = '';
    unlockInputEl.value = '';
    unlockOverlayEl.classList.add('open');
    setTimeout(function () { unlockInputEl.focus(); }, 250);
    if (!options.skipHistory) rememberRoute(false);
  }
  function hideUnlock(options) {
    options = options || {};
    unlockOverlayEl.classList.remove('open');
    unlockInputEl.blur();
    if (!options.skipHistory) rememberRoute(false);
  }
  function cancelUnlock(options) {
    state.pendingTool = null;
    hideUnlock(options);
  }
  function submitUnlock() {
    var pass = unlockInputEl.value;
    if (!pass) return;
    unlockSubmitEl.disabled = true;
    unlockErrorEl.textContent = '解鎖中…';
    decryptWith(pass).then(function (data) {
      applySecret(data);
      saveUnlock(pass);
      unlockSubmitEl.disabled = false;
      unlockErrorEl.textContent = '';
      hideUnlock({ skipHistory: true });
      var pending = state.pendingTool;
      state.pendingTool = null;
      if (pending) {
        openTool(pending, { skipHistory: true });
        rememberRoute(true);
      }
    }).catch(function () {
      unlockSubmitEl.disabled = false;
      unlockErrorEl.textContent = '密碼錯誤，請再試一次';
      unlockInputEl.select();
    });
  }

  // 點工具時的閘門：受保護的工具未解鎖則先要密碼
  function requestTool(name) {
    if (PROTECTED_TOOLS[name] && !state.unlocked) {
      state.pendingTool = name;
      showUnlock();
      return;
    }
    openTool(name);
  }

  function buildSquadAdvisors() {
    var map = {};
    state.members.forEach(function (m) {
      if (!m.a) return;
      var key = m.t + '|' + m.s;
      if (!map[key]) map[key] = {};
      map[key][m.g] = m.a;
    });
    state.squadAdvisors = map;
  }

  function advisorsForSquad(t, s) {
    var info = state.squadAdvisors[t + '|' + s] || {};
    var list = [];
    if (info['男']) list.push(info['男']);
    if (info['女']) list.push(info['女']);
    return list;
  }

  var TEAM_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function teamLabel(t) { return '第' + (TEAM_CN[t] || t) + '中隊'; }

  // ---- tool navigation ----
  function openTool(name, options) {
    options = options || {};
    state.currentTool = name;
    state.lyricsSongIndex = null;
    toolsMenuEl.hidden = true;
    toolViewEl.hidden = false;
    toolBackEl.hidden = false;
    var panes = toolViewEl.querySelectorAll('.tool-pane');
    panes.forEach(function (p) { p.hidden = ('pane-' + name) !== p.id; });
    var pane = document.getElementById('pane-' + name);
    if (pane) playFadeIn(pane);
    if (name === 'roster') { renderRosterFilters(); renderRoster(); }
    if (name === 'staff') { renderStaffFilters(); renderStaff(); }
    if (name === 'draw') { renderDrawFilters(); syncDrawSteppers(); syncDrawExtra(); }
    if (name === 'lyrics') renderLyrics();
    if (name === 'medical') renderMedical();
    if (name === 'rollcall') { renderRollcallFilters(); renderRollcall(); }
    if (name === 'meals') { state.mealsDay = detectMealsDayIndex(); renderMeals(); loadMealData(); }
    if (name === 'links') renderLinks();
    if (name === 'info') { renderInfo(); state.hqDay = detectHqDayIndex(); renderHqSchedule(); }
    window.scrollTo(0, 0);
    if (!options.skipHistory) rememberRoute(false);
  }

  function backToToolsMenu(options) {
    options = options || {};
    state.currentTool = null;
    state.lyricsSongIndex = null;
    if (lyricsSongPaneEl) lyricsSongPaneEl.hidden = true;
    toolViewEl.hidden = true;
    toolsMenuEl.hidden = false;
    playFadeIn(toolsMenuEl);
    window.scrollTo(0, 0);
    if (!options.skipHistory) rememberRoute(false);
  }

  // ---- multi-select chip helpers ----
  function toggleInArray(arr, val) {
    var i = arr.indexOf(val);
    if (i === -1) arr.push(val); else arr.splice(i, 1);
  }

  // build a "全部 + items" multi-select chip row
  function buildChipRow(container, items, getSelected, onToggle, onAll) {
    container.innerHTML = '';
    var allChip = document.createElement('button');
    allChip.className = 'roster-chip';
    allChip.textContent = '全部';
    allChip.dataset.val = 'all';
    container.appendChild(allChip);
    items.forEach(function (it) {
      var chip = document.createElement('button');
      chip.className = 'roster-chip';
      chip.textContent = it.label;
      chip.dataset.val = String(it.val);
      container.appendChild(chip);
    });
    container.onclick = function (e) {
      var chip = e.target.closest('.roster-chip');
      if (!chip) return;
      if (chip.dataset.val === 'all') onAll(); else onToggle(parseInt(chip.dataset.val, 10));
    };
  }

  function syncChipRow(container, selectedArr) {
    container.querySelectorAll('.roster-chip').forEach(function (chip) {
      if (chip.dataset.val === 'all') chip.classList.toggle('active', selectedArr.length === 0);
      else chip.classList.toggle('active', selectedArr.indexOf(parseInt(chip.dataset.val, 10)) !== -1);
    });
  }

  function distinctTeams() {
    var teams = [];
    state.members.forEach(function (m) { if (teams.indexOf(m.t) === -1) teams.push(m.t); });
    return teams.sort(function (a, b) { return a - b; });
  }

  function squadsForTeams(teamArr) {
    var squads = [];
    state.members.forEach(function (m) {
      if (teamArr.length && teamArr.indexOf(m.t) === -1) return;
      if (squads.indexOf(m.s) === -1) squads.push(m.s);
    });
    return squads.sort(function (a, b) { return a - b; });
  }

  // ---- 小隊員一覽 ----
  function renderRosterFilters() {
    buildChipRow(rosterTeamFiltersEl,
      distinctTeams().map(function (t) { return { val: t, label: teamLabel(t) }; }),
      null,
      function (t) {
        toggleInArray(state.rosterTeams, t);
        state.rosterSquads = state.rosterSquads.filter(function (s) {
          return squadsForTeams(state.rosterTeams).indexOf(s) !== -1;
        });
        renderRosterSquadChips();
        syncRosterChips();
        renderRoster();
      },
      function () { state.rosterTeams = []; state.rosterSquads = []; renderRosterSquadChips(); syncRosterChips(); renderRoster(); });
    renderRosterSquadChips();
    syncRosterChips();
  }

  function renderRosterSquadChips() {
    var squads = squadsForTeams(state.rosterTeams);
    buildChipRow(rosterSquadFiltersEl,
      squads.map(function (s) { return { val: s, label: s + '小隊' }; }),
      null,
      function (s) { toggleInArray(state.rosterSquads, s); syncRosterChips(); renderRoster(); },
      function () { state.rosterSquads = []; syncRosterChips(); renderRoster(); });
  }

  function syncRosterChips() {
    syncChipRow(rosterTeamFiltersEl, state.rosterTeams);
    syncChipRow(rosterSquadFiltersEl, state.rosterSquads);
    document.querySelectorAll('#pane-roster .roster-toggle[data-gender]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.gender === state.rosterGender);
    });
    rosterNonMemberToggleEl.classList.toggle('active', state.rosterNonMemberOnly);
  }

  function memberSearchText(m) {
    return [m.n, teamLabel(m.t), m.s + '小隊', m.a, m.w, m.m ? '成員' : '非成員', m.g,
      m.early ? '早退' : '', m.r1, m.r2].filter(Boolean).join(' ');
  }

  function memberRoomNumber(m) {
    var room = (m.dorm || '').toString();
    var match = room.match(/\d{3,4}/);
    return match ? match[0] : '';
  }

  function isRoomQuery(q) {
    return /^\d{3,4}$/.test(normalizeForSearch(q));
  }

  function memberRosterSearchScore(query, m) {
    var q = normalizeForSearch(query);
    var room = memberRoomNumber(m);
    if (isRoomQuery(q)) {
      if (room === q) return 3000;
      return -1;
    }
    return fuzzyScore(q, memberSearchText(m) + ' ' + room + ' room ' + room);
  }

  function filteredMembers() {
    var q = state.rosterQuery.trim();
    var list = state.members.filter(function (m) {
      if (state.rosterTeams.length && state.rosterTeams.indexOf(m.t) === -1) return false;
      if (state.rosterSquads.length && state.rosterSquads.indexOf(m.s) === -1) return false;
      if (state.rosterGender !== 'all' && m.g !== state.rosterGender) return false;
      if (state.rosterNonMemberOnly && m.m) return false;
      return true;
    });
    if (q) {
      list = list
        .map(function (m) { return { m: m, score: memberRosterSearchScore(q, m) }; })
        .filter(function (x) { return x.score > -1; })
        .sort(function (a, b) { return b.score - a.score; })
        .map(function (x) { return x.m; });
    } else {
      list.sort(function (a, b) {
        if (a.t !== b.t) return a.t - b.t;
        if (a.s !== b.s) return (a.s || 0) - (b.s || 0);
        if (a.g !== b.g) return a.g === '男' ? -1 : 1;
        return 0;
      });
    }
    return list;
  }

  function scopeLabel(teamArr, squadArr) {
    if (squadArr.length) return squadArr.slice().sort(function (a, b) { return a - b; }).map(function (s) { return s + '小隊'; }).join('、');
    if (teamArr.length) return teamArr.slice().sort(function (a, b) { return a - b; }).map(teamLabel).join('、');
    return '全FSY';
  }

  function renderRoster() {
    if (!state.membersLoaded) { rosterCountEl.textContent = '載入中…'; return; }
    var list = filteredMembers();
    rosterCountEl.textContent = scopeLabel(state.rosterTeams, state.rosterSquads) + ' · ' + list.length + ' 人';

    rosterListEl.innerHTML = '';
    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'roster-empty';
      empty.textContent = '找不到符合的小隊員';
      rosterListEl.appendChild(empty);
      return;
    }
    list.forEach(function (m, i) {
      var card = buildMemberCard(m);
      card.style.animationDelay = Math.min(i, 12) * 0.02 + 's';
      rosterListEl.appendChild(card);
    });
  }

  function buildMemberCard(m) {
    var card = document.createElement('div');
    card.className = 'member-card ' + (m.g === '男' ? 'male' : 'female');

    var avatar = document.createElement('div');
    avatar.className = 'member-avatar';
    avatar.textContent = m.n ? m.n.charAt(0) : '?';
    card.appendChild(avatar);

    var main = document.createElement('div');
    main.className = 'member-main';

    var nameRow = document.createElement('div');
    nameRow.className = 'member-name-row';
    var name = document.createElement('span');
    name.className = 'member-name';
    name.textContent = m.n;
    nameRow.appendChild(name);
    if (!m.m) nameRow.appendChild(makeTag('tag-nonmember', '非成員'));
    if (m.early) nameRow.appendChild(makeTag('tag-early', '早退'));
    main.appendChild(nameRow);

    var advisors = advisorsForSquad(m.t, m.s);
    var meta = document.createElement('div');
    meta.className = 'member-meta';
    var bits = [teamLabel(m.t) + ' ' + m.s + '小隊', '隊輔 ' + (advisors.join('、') || m.a), m.w];
    if (m.age) bits.push(m.age + '歲');
    meta.innerHTML = bits.map(function (b) { return escapeHtml(b); }).join('<span class="dot">·</span>');
    main.appendChild(meta);

    // expandable detail
    var wrap = document.createElement('div');
    wrap.className = 'member-detail-wrap';
    var detail = document.createElement('div');
    detail.className = 'member-detail';

    detail.appendChild(makeDetailRow('小隊輔', advisors.join('、') || m.a));
    // 選課（教室＋課程名）：時段一＝課程1（10:10–11:00）、時段二＝課程2（11:10–12:00）
    detail.appendChild(makeDetailRow('課程1', m.r1 || '未選課'));
    detail.appendChild(makeDetailRow('課程2', m.r2 || '未選課'));
    detail.appendChild(makeDetailRow('身分', m.m ? '成員' : '非成員（朋友）'));
    detail.appendChild(makeDetailRow('支會', m.w || '—'));
    detail.appendChild(makeDetailRow('宿舍房號', m.dorm || '未分配'));
    if (m.age) detail.appendChild(makeDetailRow('年齡', m.age + ' 歲'));
    if (m.early) detail.appendChild(makeDetailRow('提醒', '需提早離營'));
    wrap.appendChild(detail);
    main.appendChild(wrap);

    card.appendChild(main);

    card.addEventListener('click', function () {
      var isOpen = card.classList.contains('open');
      if (isOpen) {
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        void wrap.offsetWidth;
        wrap.style.maxHeight = '0px';
        card.classList.remove('open');
      } else {
        card.classList.add('open');
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        wrap.addEventListener('transitionend', function te(e) {
          if (e.propertyName === 'max-height' && card.classList.contains('open')) {
            wrap.style.maxHeight = 'none';
          }
          wrap.removeEventListener('transitionend', te);
        });
      }
    });

    return card;
  }

  function makeTag(cls, text) {
    var t = document.createElement('span');
    t.className = 'member-tag ' + cls;
    t.textContent = text;
    return t;
  }

  function makeDetailRow(label, value) {
    var row = document.createElement('div');
    row.className = 'member-detail-row';
    var l = document.createElement('span');
    l.className = 'member-detail-label';
    l.textContent = label + '：';
    row.appendChild(l);
    row.appendChild(document.createTextNode(value));
    return row;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---- 隨機抽籤 ----
  var FIFTH = 5;
  function renderDrawFilters() {
    buildChipRow(drawTeamFiltersEl,
      distinctTeams().map(function (t) { return { val: t, label: teamLabel(t) }; }),
      null,
      function (t) {
        toggleInArray(state.drawTeams, t);
        state.drawSquads = state.drawSquads.filter(function (s) { return squadsForTeams(state.drawTeams).indexOf(s) !== -1; });
        renderDrawSquadChips();
        syncChipRow(drawTeamFiltersEl, state.drawTeams);
      },
      function () { state.drawTeams = []; state.drawSquads = []; renderDrawSquadChips(); syncChipRow(drawTeamFiltersEl, state.drawTeams); });
    renderDrawSquadChips();
    syncChipRow(drawTeamFiltersEl, state.drawTeams);
  }

  function renderDrawSquadChips() {
    var squads = squadsForTeams(state.drawTeams);
    buildChipRow(drawSquadFiltersEl,
      squads.map(function (s) { return { val: s, label: s + '小隊' }; }),
      null,
      function (s) { toggleInArray(state.drawSquads, s); syncChipRow(drawSquadFiltersEl, state.drawSquads); },
      function () { state.drawSquads = []; syncChipRow(drawSquadFiltersEl, state.drawSquads); });
    syncChipRow(drawSquadFiltersEl, state.drawSquads);
  }

  function syncDrawSteppers() {
    document.getElementById('draw-male-val').textContent = state.drawMale;
    document.getElementById('draw-female-val').textContent = state.drawFemale;
  }

  function drawPool(gender) {
    return state.members.filter(function (m) {
      if (state.drawTeams.length && state.drawTeams.indexOf(m.t) === -1) return false;
      if (state.drawSquads.length && state.drawSquads.indexOf(m.s) === -1) return false;
      if (state.drawNoRepeat && state.drawnKeys[memberKey(m)]) return false;
      return m.g === gender;
    });
  }

  function syncDrawExtra() {
    var n = Object.keys(state.drawnKeys).length;
    if (drawNoRepeatToggleEl) drawNoRepeatToggleEl.classList.toggle('active', state.drawNoRepeat);
    if (drawResetBtnEl) {
      drawResetBtnEl.hidden = n === 0;
      if (drawnCountEl) drawnCountEl.textContent = n;
    }
  }

  function sampleN(arr, n) {
    var a = arr.slice(), out = [];
    while (a.length && out.length < n) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
    return out;
  }

  function runDraw() {
    if (!state.membersLoaded) return;
    randomResultEl.innerHTML = '';
    if (state.drawMale === 0 && state.drawFemale === 0) {
      randomResultEl.appendChild(emptyNote('請先設定要抽幾位男生或女生'));
      return;
    }
    var poolM = drawPool('男'), poolF = drawPool('女');
    var picks = sampleN(poolM, state.drawMale).concat(sampleN(poolF, state.drawFemale));
    if (!picks.length) {
      randomResultEl.appendChild(emptyNote(state.drawNoRepeat && Object.keys(state.drawnKeys).length
        ? '此範圍可抽的人都抽過了，請按「清除已抽」重新開始'
        : '此範圍沒有可抽的人'));
      return;
    }

    var shortfall = (state.drawMale > poolM.length) || (state.drawFemale > poolF.length);
    if (shortfall) randomResultEl.appendChild(emptyNote('人數超過可抽人數，已抽出全部可抽者'));

    if (state.drawNoRepeat) {
      picks.forEach(function (m) { state.drawnKeys[memberKey(m)] = 1; });
      syncDrawExtra();
    }

    picks.forEach(function (m, i) {
      var card = document.createElement('div');
      card.className = 'random-pick-card ' + (m.g === '男' ? 'male' : 'female');
      card.style.setProperty('--mc', m.g === '男' ? '#3b78c2' : '#d36a93');
      card.style.animationDelay = (i * 0.06) + 's';
      var name = document.createElement('div');
      name.className = 'random-pick-name';
      name.textContent = m.n;
      var meta = document.createElement('div');
      meta.className = 'random-pick-meta';
      meta.textContent = teamLabel(m.t) + ' · ' + m.s + '小隊 · 隊輔' + m.a;
      card.appendChild(name);
      card.appendChild(meta);
      randomResultEl.appendChild(card);
    });
  }

  function emptyNote(text) {
    var e = document.createElement('div');
    e.className = 'roster-empty';
    e.textContent = text;
    return e;
  }

  // ---- 尋找工作人員（小隊輔＋助理協調員＋醫護組等，含房號／電話／負責活動）----
  function deriveAdvisors() {
    var seen = {}, list = [];
    state.members.forEach(function (m) {
      if (!m.a) return;
      var key = m.t + '|' + m.s + '|' + m.g + '|' + m.a;
      if (seen[key]) return;
      seen[key] = 1;
      list.push({ t: m.t, s: m.s, g: m.g, a: m.a });
    });
    return list;
  }

  // 名字正規化：去掉「(英)」等括號註記與空白，供房號／名冊／醫護名單交叉比對
  function normalizeStaffName(n) {
    return (n || '').replace(/[（(][^)）]*[)）]/g, '').replace(/\s+/g, '').trim();
  }
  function staffNameMatch(a, b) {
    var x = normalizeStaffName(a), y = normalizeStaffName(b);
    if (!x || !y) return false;
    if (x === y) return true;
    // 短名（如「俞采」）對全名（如「陳俞采」）
    if (x.length >= 2 && y.length >= 2) {
      if (x.length > y.length) return x.slice(-y.length) === y;
      if (y.length > x.length) return y.slice(-x.length) === x;
    }
    return false;
  }

  var STAFF_GROUPS = ['核心委員會', '助理協調員', '小隊輔', '醫護組', '攝影組', '其他'];

  // 把房號表＋名冊隊輔＋AC 組別＋醫護資料合成一份可搜尋的名單
  function buildStaffIndex() {
    var entries = [];
    STAFF_ROOMS.forEach(function (block) {
      block.names.forEach(function (rawName) {
        var normalized = normalizeStaffName(rawName) || rawName;
        var normalizedGroup = block.group === '保健組' ? '醫護組' : block.group;
        if (block.group === '助理協調員' && normalized === '陳瑋竣') return;
        if (block.group === '核心委員會' && normalized === '男協調員') return;
        var override = STAFF_ROOM_NAME_OVERRIDES[block.room];
        entries.push({
          name: override ? override.name : normalized,
          rawName: rawName,
          position: override ? override.position : '',
          group: normalizedGroup,
          room: block.room,
          floor: block.floor,
          gender: STAFF_ROOM_GENDER[block.room] || (/男/.test(normalizedGroup) ? '男' : /女/.test(normalizedGroup) ? '女' : ''),
        });
      });
    });
    STAFF_CORE_OVERRIDES.forEach(function (core) {
      var hit = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].group === '核心委員會' && staffNameMatch(entries[i].name, core.name)) { hit = entries[i]; break; }
      }
      if (hit) {
        hit.room = core.room;
        hit.floor = core.floor;
        hit.position = core.position;
        hit.gender = STAFF_ROOM_GENDER[core.room] || hit.gender;
      } else {
        entries.push({ name: core.name, rawName: core.name, position: core.position, group: '核心委員會', room: core.room, floor: core.floor, gender: STAFF_ROOM_GENDER[core.room] || '' });
      }
    });
    STAFF_EXTRA.forEach(function (x) {
      entries.push({ name: x.name, rawName: x.name, group: x.group, room: '', floor: '', gender: x.gender || '' });
    });

    // 名冊隊輔 → 補上中隊／小隊／性別；名冊上有但房號表沒有的隊輔也補進名單
    deriveAdvisors().forEach(function (adv) {
      var hit = null;
      for (var i = 0; i < entries.length; i++) {
        if (staffNameMatch(entries[i].name, adv.a)) { hit = entries[i]; break; }
      }
      if (!hit) {
        hit = { name: normalizeStaffName(adv.a), rawName: adv.a, group: adv.g + '隊輔', room: '', floor: '' };
        entries.push(hit);
      }
      hit.team = adv.t;
      hit.squad = adv.s;
      hit.gender = adv.g;
    });

    // 醫護組 → 標籤（組長／司機）與電話（電話來自解鎖後的加密資料）
    MEDICAL_TEAM.forEach(function (p) {
      var hit = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].group === '醫護組' && staffNameMatch(entries[i].name, p.name)) { hit = entries[i]; break; }
      }
      if (!hit) return;
      hit.tags = p.tags;
      var phone = (state.medicalPhones || {})[p.name];
      if (phone) hit.phone = phone;
    });
    // 「瑪恩」在醫護名單為短名，房號表為「彭瑀恩」——staffNameMatch 比不到時手動補
    entries.forEach(function (e) {
      if (e.name === '彭瑀恩' && !e.phone) {
        var phone = (state.medicalPhones || {})['瑪恩'];
        if (phone) { e.phone = phone; e.tags = e.tags || []; }
      }
    });

    entries.forEach(function (e) {
      if (AC_ROLES[e.name]) e.roles = AC_ROLES[e.name];
      e.filterGroup =
        /隊輔/.test(e.group) ? '小隊輔' :
        e.group === '助理協調員' ? '助理協調員' :
        e.group === '醫護組' ? '醫護組' :
        e.group === '核心委員會' ? '核心委員會' :
        e.group === '攝影組' ? '攝影組' : '其他';
      e.searchText = [
        e.name, e.rawName, e.position, e.group, e.filterGroup,
        e.room ? e.room : '', e.floor,
        e.team ? teamLabel(e.team) : '', e.squad ? e.squad + '小隊' : '',
        (e.tags || []).join(' '), (e.roles || []).join(' '),
      ].filter(Boolean).join(' ');
    });
    return entries;
  }

  function renderStaffFilters() {
    staffGroupFiltersEl.innerHTML = '';
    ['all'].concat(STAFF_GROUPS).forEach(function (g) {
      var chip = document.createElement('button');
      chip.className = 'roster-chip' + ((state.staffGroup === g) ? ' active' : '');
      chip.textContent = g === 'all' ? '全部' : g;
      chip.dataset.group = g;
      staffGroupFiltersEl.appendChild(chip);
    });
    staffGroupFiltersEl.onclick = function (e) {
      var chip = e.target.closest('.roster-chip');
      if (!chip) return;
      state.staffGroup = chip.dataset.group;
      renderStaffFilters();
      renderStaff();
    };
  }

  var STAFF_GROUP_ORDER = { '核心委員會': 1, '助理協調員': 2, '小隊輔': 3, '醫護組': 4, '攝影組': 5, '其他': 6 };

  function renderStaff() {
    var q = state.staffQuery.trim();
    var list = buildStaffIndex().filter(function (e) {
      return state.staffGroup === 'all' || e.filterGroup === state.staffGroup;
    });
    if (q) {
      list = list
        .map(function (e) { return { e: e, score: fuzzyScore(q, e.searchText) }; })
        .filter(function (x) { return x.score > -1; })
        .sort(function (a, b) { return b.score - a.score; })
        .map(function (x) { return x.e; });
    } else {
      list.sort(function (a, b) {
        var ga = STAFF_GROUP_ORDER[a.filterGroup] || 9, gb = STAFF_GROUP_ORDER[b.filterGroup] || 9;
        if (ga !== gb) return ga - gb;
        if (a.filterGroup === '小隊輔') {
          return (a.team || 99) - (b.team || 99) || (a.squad || 99) - (b.squad || 99);
        }
        return (a.room || 'zzz') < (b.room || 'zzz') ? -1 : 1;
      });
    }
    staffCountEl.textContent = (state.staffGroup === 'all' ? '全部' : state.staffGroup) + ' · ' + list.length + ' 位';

    staffListEl.innerHTML = '';
    if (!list.length) { staffListEl.appendChild(emptyNote('找不到符合的工作人員')); return; }
    list.forEach(function (e, i) {
      staffListEl.appendChild(buildStaffCard(e, i));
    });
  }

  function buildStaffCard(e, i) {
    var card = document.createElement('div');
    var genderCls = e.gender === '男' ? 'male' : e.gender === '女' ? 'female' : 'neutral';
    card.className = 'member-card staff-card ' + genderCls;
    card.style.animationDelay = Math.min(i, 12) * 0.02 + 's';

    var avatar = document.createElement('div');
    avatar.className = 'member-avatar';
    avatar.textContent = e.name ? e.name.charAt(0) : '?';
    card.appendChild(avatar);

    var main = document.createElement('div');
    main.className = 'member-main';

    var nameRow = document.createElement('div');
    nameRow.className = 'member-name-row';
    var name = document.createElement('span');
    name.className = 'member-name';
    name.textContent = e.name;
    nameRow.appendChild(name);
    (e.tags || []).forEach(function (t) {
      nameRow.appendChild(makeTag(t === '組長' ? 'tag-lead' : 'tag-driver', t));
    });
    if (e.roles && e.roles.length && e.roles[0].charAt(0) === '★') {
      nameRow.appendChild(makeTag('tag-lead', '組長'));
    }
    main.appendChild(nameRow);

    var meta = document.createElement('div');
    meta.className = 'member-meta';
    var bits = [e.group];
    if (e.team) bits.push(teamLabel(e.team) + ' ' + e.squad + '小隊');
    if (e.room) bits.push('🛏 ' + e.room);
    meta.innerHTML = bits.map(function (b) { return escapeHtml(b); }).join('<span class="dot">·</span>');
    main.appendChild(meta);

    // 展開詳情：房號／電話／負責活動
    var wrap = document.createElement('div');
    wrap.className = 'member-detail-wrap';
    var detail = document.createElement('div');
    detail.className = 'member-detail';

    detail.appendChild(makeDetailRow('組別', e.group + (e.team ? '（' + teamLabel(e.team) + ' ' + e.squad + '小隊）' : '')));
    if (e.position) detail.appendChild(makeDetailRow('職稱', e.position));
    detail.appendChild(makeDetailRow('住宿', e.room ? '築夢學苑 ' + e.room + '（' + e.floor + '）' : '未列於房號表'));
    if (e.phone) {
      detail.appendChild(makeDetailRow('電話', e.phone));
    } else if (e.filterGroup === '助理協調員' || e.filterGroup === '核心委員會') {
      detail.appendChild(makeDetailRow('聯絡', '營本部 24 小時電話 0906-901-216'));
    }
    if (e.roles && e.roles.length) {
      var rolesRow = document.createElement('div');
      rolesRow.className = 'member-detail-row detail-row-block';
      var lab = document.createElement('span');
      lab.className = 'member-detail-label';
      lab.textContent = '負責活動：';
      rolesRow.appendChild(lab);
      var box = document.createElement('div');
      box.className = 'staff-roles';
      e.roles.forEach(function (r) {
        var tag = document.createElement('span');
        var isLead = r.charAt(0) === '★';
        tag.className = 'staff-role-tag' + (isLead ? ' lead' : '');
        tag.textContent = isLead ? r.slice(1) : r;
        box.appendChild(tag);
      });
      rolesRow.appendChild(box);
      detail.appendChild(rolesRow);
    }
    wrap.appendChild(detail);
    main.appendChild(wrap);
    card.appendChild(main);

    if (e.phone) {
      var callBtn = document.createElement('a');
      callBtn.className = 'medical-call-btn';
      callBtn.href = 'tel:' + e.phone.replace(/[^0-9+]/g, '');
      callBtn.setAttribute('aria-label', '撥打給' + e.name);
      callBtn.textContent = '📞';
      callBtn.addEventListener('click', function (ev) { ev.stopPropagation(); });
      card.appendChild(callBtn);
    }

    card.addEventListener('click', function () {
      var isOpen = card.classList.contains('open');
      if (isOpen) {
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        void wrap.offsetWidth;
        wrap.style.maxHeight = '0px';
        card.classList.remove('open');
      } else {
        card.classList.add('open');
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        wrap.addEventListener('transitionend', function te(ev) {
          if (ev.propertyName === 'max-height' && card.classList.contains('open')) {
            wrap.style.maxHeight = 'none';
          }
          wrap.removeEventListener('transitionend', te);
        });
      }
    });

    return card;
  }

  // ---- 用餐指南（A/B 梯次與 1–31 小隊）----
  function cleanCell(v) {
    return (v === null || v === undefined ? '' : String(v)).trim();
  }

  function numberFromCell(v) {
    var m = cleanCell(v).match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function liveMealIcon(name) {
    if (/\u65e9\u9910|\u65e9\u5348\u9910/.test(name)) return '\ud83c\udf73';
    if (/\u5348\u9910|\u98df\u7269\u4e4b\u591c/.test(name)) return '\ud83c\udf71';
    if (/\u665a\u9910|\u5bb5\u591c/.test(name)) return '\ud83c\udf5b';
    return '\ud83c\udf7d\ufe0f';
  }

  function liveMealRouteCells(row) {
    return [[8, '1'], [10, '2'], [12, '3']].map(function (item) {
      var col = item[0], route = item[1];
      return { route: route, text: [cleanCell(row[col]), cleanCell(row[col + 1])].filter(Boolean).join(' / ') };
    }).filter(function (x) { return x.text; });
  }

  function splitLiveRouteSupport(text) {
    var support = [];
    var routeParts = String(text || '').split(/\n+|\s+\/\s+/).map(function (x) { return cleanCell(x); }).filter(Boolean);
    var kept = routeParts.filter(function (part) {
      var match = part.match(/^\u652f\u63f4[:\uff1a]\s*(.+)$/);
      if (match) {
        support.push(cleanCell(match[1]));
        return false;
      }
      return true;
    });
    return { routeText: kept.join(' / '), support: support.join(' / ') };
  }

  function inferLiveSquadRange(rawRange, date, meal, time, routeText) {
    if (/1\s*-\s*15/.test(rawRange)) return '1-15';
    if (/16\s*-\s*31/.test(rawRange)) return '16-31';
    var nums = Array.from(routeText.matchAll(/\d+/g)).map(function (m) { return Number(m[0]); });
    if (nums.some(function (n) { return n >= 16; })) return '16-31';
    if (nums.some(function (n) { return n > 0 && n <= 15; })) return '1-15';
    if (date === '7/14' && meal === '\u65e9\u9910' && /^7:45/.test(time)) return '16-31';
    if (date === '7/17' && meal === '\u65e9\u9910' && /^7:15/.test(time)) return '16-31';
    return '1-15';
  }

  function addLiveMealRoutes(entry, row) {
    var ready = cleanCell(row[7]);
    liveMealRouteCells(row).forEach(function (cell) {
      var split = splitLiveRouteSupport(cell.text);
      var text = split.routeText || cell.text;
      var half = text.indexOf('\u524d\u534a') !== -1 ? '\u524d\u534a' : text.indexOf('\u5f8c\u534a') !== -1 ? '\u5f8c\u534a' : '';
      var squads = Array.from(text.matchAll(/\d+/g)).map(function (m) { return Number(m[0]); });
      var routeEntry = { route: cell.route, ready: ready };
      if (half) routeEntry.half = half;
      if (split.support) routeEntry.support = split.support;
      if (squads.length) routeEntry.squads = squads;
      else routeEntry.staff = text;
      entry.routes.push(routeEntry);
    });
  }

  function parseLiveDining(rows) {
    var byDay = new Map();
    var day = '', mealName = '', current = null;
    (rows || []).slice(1).forEach(function (row) {
      if (cleanCell(row[0])) day = cleanCell(row[0]);
      if (cleanCell(row[1])) mealName = cleanCell(row[1]);
      var time = cleanCell(row[2]);
      var ready = cleanCell(row[7]);
      if (!day || !mealName || !ready) return;
      if (!byDay.has(day)) byDay.set(day, { day: day, dow: '', meals: [] });
      if (time) {
        var routeText = liveMealRouteCells(row).map(function (x) { return x.text; }).join(' ');
        var squadRange = inferLiveSquadRange(cleanCell(row[3]), day, mealName, time, routeText);
        current = { type: 'dining', name: mealName, icon: liveMealIcon(mealName), time: time, tier: squadRange === '16-31' ? 'B' : 'A', squadRange: squadRange, ready: ready, control: cleanCell(row[4]), guides: [cleanCell(row[5]), cleanCell(row[6])].filter(Boolean), routes: [] };
        byDay.get(day).meals.push(current);
      }
      if (current) addLiveMealRoutes(current, row);
    });
    return Array.from(byDay.values());
  }

  function parseLiveOffsite(rows) {
    var byDay = new Map();
    var day = '', mealName = '', current = null;
    (rows || []).slice(1).forEach(function (row) {
      var startsDay = !!cleanCell(row[0]);
      var startsMeal = !!cleanCell(row[1]);
      if (startsDay) day = cleanCell(row[0]);
      if (startsMeal) mealName = cleanCell(row[1]);
      var pickup = cleanCell(row[2]);
      var place = cleanCell(row[3]);
      if (!day || !mealName || !place) return;
      if (!startsDay && !startsMeal && pickup && current) {
        var extraPrep = cleanCell(row[5]).replace(/\n+/g, ' ');
        if (extraPrep) current.prep = [current.prep, pickup + '：' + extraPrep].filter(Boolean).join('；');
        return;
      }
      if (!pickup && day === '7/13' && mealName === '午餐') pickup = '11:00-13:00';
      if (!pickup) return;
      if (!byDay.has(day)) byDay.set(day, { day: day, dow: '', meals: [] });
      current = { type: 'offsite', name: mealName, icon: liveMealIcon(mealName), time: pickup, place: place, prepTime: cleanCell(row[4]), prep: cleanCell(row[5]).replace(/\n+/g, ' '), control: cleanCell(row[6]), delivery: [cleanCell(row[7]), cleanCell(row[8]), cleanCell(row[9]), cleanCell(row[10]), cleanCell(row[11]), cleanCell(row[12])].filter(Boolean).map(function (x) { return x.replace(/\n+/g, ' '); }), cleanup: [cleanCell(row[13]), cleanCell(row[14])].filter(Boolean).map(function (x) { return x.replace(/\n+/g, ' '); }) };
      byDay.get(day).meals.push(current);
    });
    return Array.from(byDay.values());
  }

  function liveMealSortValue(name) {
    if (/\u65e9\u9910|\u65e9\u5348\u9910/.test(name)) return 1;
    if (/\u5348\u9910/.test(name)) return 2;
    if (/\u98df\u7269\u4e4b\u591c/.test(name)) return 3;
    if (/\u665a\u9910/.test(name)) return 4;
    if (/\u5bb5\u591c/.test(name)) return 5;
    return 9;
  }

  function parseHMForSort(s) {
    var m = cleanCell(s).match(/(\d{1,2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : 9999;
  }

  function mergeLiveMealGuides(dining, offsite) {
    var byDay = new Map();
    function ensure(day) {
      if (!byDay.has(day.day)) byDay.set(day.day, { day: day.day, dow: day.dow || '', meals: [] });
      return byDay.get(day.day);
    }
    dining.forEach(function (day) { ensure(day).meals.push.apply(ensure(day).meals, day.meals); });
    offsite.forEach(function (day) { ensure(day).meals.push.apply(ensure(day).meals, day.meals); });
    return Array.from(byDay.values()).sort(function (a, b) {
      var ad = a.day.split('/').map(Number), bd = b.day.split('/').map(Number);
      return ad[0] - bd[0] || ad[1] - bd[1];
    }).map(function (day) {
      day.meals.sort(function (a, b) { return parseHMForSort(a.time) - parseHMForSort(b.time) || liveMealSortValue(a.name) - liveMealSortValue(b.name) || (a.tier || '').localeCompare(b.tier || ''); });
      return day;
    });
  }

  function parseLiveServing(rows) {
    var serving = {};
    var currentSquads = [];
    var lastDate = {};
    (rows || []).forEach(function (row) {
      var first = cleanCell(row[0]);
      if (/\u4e2d\u968a/.test(first)) {
        currentSquads = [];
        for (var c = 1; c < row.length; c += 7) currentSquads.push({ start: c, squad: numberFromCell(row[c]) || null });
        lastDate = {};
        return;
      }
      if (!currentSquads.length) return;
      currentSquads.forEach(function (block) {
        var c = block.start;
        var squad = numberFromCell(row[c]) || block.squad;
        if (!squad) return;
        block.squad = squad;
        var rawDate = cleanCell(row[c + 1]);
        if (rawDate) lastDate[squad] = rawDate;
        var date = rawDate || lastDate[squad];
        var meal = cleanCell(row[c + 2]);
        var half = cleanCell(row[c + 3]);
        var route = cleanCell(row[c + 4]);
        var advisor = cleanCell(row[c + 5]);
        if (!date || !meal || !route) return;
        if (!serving[squad]) serving[squad] = [];
        serving[squad].push({ date: date, meal: meal, half: half, route: route, advisor: advisor });
      });
    });
    return serving;
  }

  function applyMealData(mealsGuide, mealServing) {
    if (Array.isArray(mealsGuide) && mealsGuide.length) MEALS_GUIDE = mealsGuide;
    if (mealServing && Object.keys(mealServing).length) MEAL_SERVING = mealServing;
    if (state.currentTool === 'meals') renderMeals();
  }

  function loadMealCache() {
    try {
      var raw = localStorage.getItem(MEAL_CACHE_KEY);
      if (!raw) return false;
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.mealsGuide) || !obj.mealServing) return false;
      applyMealData(obj.mealsGuide, obj.mealServing);
      return true;
    } catch (e) { return false; }
  }

  function loadMealData() {
    return Promise.all([
      fetchCsvText(buildCsvUrl(MEAL_SHEET_ID, MEAL_DINING_SHEET)),
      fetchCsvText(buildCsvUrl(MEAL_SHEET_ID, MEAL_OFFSITE_SHEET)),
      fetchCsvText(buildCsvUrl(MEAL_SHEET_ID, MEAL_SERVING_SHEET)),
    ]).then(function (texts) {
      var diningRows = Papa.parse(texts[0], { skipEmptyLines: true }).data;
      var offsiteRows = Papa.parse(texts[1], { skipEmptyLines: true }).data;
      var servingRows = Papa.parse(texts[2], { skipEmptyLines: true }).data;
      var mealsGuide = mergeLiveMealGuides(parseLiveDining(diningRows), parseLiveOffsite(offsiteRows));
      var mealServing = parseLiveServing(servingRows);
      applyMealData(mealsGuide, mealServing);
      try { localStorage.setItem(MEAL_CACHE_KEY, JSON.stringify({ ts: Date.now(), mealsGuide: mealsGuide, mealServing: mealServing })); } catch (e) { /* storage unavailable */ }
    }).catch(function (err) { console.warn('Meal data refresh failed', err); });
  }

  function detectMealsDayIndex() {
    var now = getNow();
    var key = (now.getMonth() + 1) + '/' + now.getDate();
    for (var i = 0; i < MEALS_GUIDE.length; i++) {
      if (MEALS_GUIDE[i].day === key) return i;
    }
    return 0;
  }

  function cleanMealTime(time) {
    return (time || '').replace(/--/g, '-').replace(/\((\d+)mins\)/g, ' ($1\u5206)').trim();
  }

  function collectServingRows(date, mealName) {
    var rows = [];
    Object.keys(MEAL_SERVING).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (s) {
      var hit = (MEAL_SERVING[s] || []).find(function (x) { return x.date === date && x.meal === mealName; });
      if (hit) rows.push({ squad: s, route: hit.route, half: hit.half, advisor: hit.advisor });
    });
    return rows;
  }

  function buildServingBlock(date, mealName) {
    var rows = collectServingRows(date, mealName);
    if (!rows.length) return null;
    var block = document.createElement('div');
    block.className = 'meal-serving-block';
    var title = document.createElement('div');
    title.className = 'meal-serving-title';
    title.textContent = '\u6253\u83dc\u8ca0\u8cac\u4eba';
    block.appendChild(title);
    var chips = document.createElement('div');
    chips.className = 'meal-serving-grid';
    rows.forEach(function (hit) {
      var chip = document.createElement('span');
      chip.className = 'meal-serving-chip';
      chip.textContent = hit.squad + '\u5c0f\u968a\uff1a' + (hit.advisor || '\u672a\u586b\u59d3\u540d') + '\uff08\u8def\u7dda' + hit.route + (hit.half ? ' ' + hit.half : '') + '\uff09';
      chips.appendChild(chip);
    });
    block.appendChild(chips);
    return block;
  }

  function groupMealsByName(meals) {
    var groups = [];
    (meals || []).forEach(function (meal) {
      var group = groups.filter(function (g) { return g.name === meal.name; })[0];
      if (!group) {
        group = { name: meal.name, icon: meal.icon, meals: [] };
        groups.push(group);
      }
      group.meals.push(meal);
    });
    return groups;
  }

  function findServingAdvisor(date, mealName, squad, route, half) {
    var rows = MEAL_SERVING[String(squad)] || MEAL_SERVING[squad] || [];
    var hit = rows.find(function (x) {
      return x.date === date &&
        x.meal === mealName &&
        String(x.route) === String(route) &&
        (!half || !x.half || x.half === half);
    });
    return hit && hit.advisor ? hit.advisor : '';
  }

  function routePersonText(date, meal, route) {
    if (route.squads && route.squads.length) {
      return route.squads.map(function (s) {
        return findServingAdvisor(date, meal.name, s, route.route, route.half) || '\u7e3d\u8868\u672a\u5206\u6d3e';
      }).join(' / ');
    }
    return route.staff || '';
  }

  function buildDiningRoutes(meal, date) {
    var routes = document.createElement('div');
    routes.className = 'meal-route-grid';
    (meal.routes || []).forEach(function (route) {
      var card = document.createElement('div');
      card.className = 'meal-route-card route-' + route.route;
      var title = document.createElement('div');
      title.className = 'meal-route-title';
      title.textContent = '\u8def\u7dda ' + route.route;
      card.appendChild(title);
      var line = document.createElement('div');
      line.className = 'meal-route-line';
      var squadText = routePersonText(date, meal, route);
      line.textContent = (route.ready ? route.ready + ' \u00b7 ' : '') + (route.half ? route.half + '\uff1a' : '') + squadText;
      card.appendChild(line);
      if (route.support) {
        var support = document.createElement('div');
        support.className = 'meal-route-support';
        support.textContent = '\u8def\u7dda' + route.route + '\u6253\u83dc\u652f\u63f4\uff1a' + route.support;
        card.appendChild(support);
      }
      routes.appendChild(card);
    });
    return routes;
  }

  function buildMealSession(meal, date) {
    var card = document.createElement('div');
    card.className = 'meal-session ' + (meal.type === 'offsite' ? 'offsite' : 'dining');

    var head = document.createElement('div');
    head.className = 'meal-session-head';
    var tier = document.createElement('span');
    tier.className = 'meal-tier-pill ' + (meal.tier === 'B' ? 'tier-b' : 'tier-a');
    tier.textContent = meal.type === 'offsite' ? '\u4e0d\u5728\u9910\u5ef3' : (meal.tier + '\u68af\u6b21');
    head.appendChild(tier);
    var title = document.createElement('span');
    title.className = 'meal-session-title';
    title.textContent = meal.type === 'offsite'
      ? ((meal.place || '') + (meal.place ? ' \u00b7 ' : '') + cleanMealTime(meal.time))
      : ((meal.squadRange || '') + '\u5c0f\u968a \u00b7 ' + cleanMealTime(meal.time));
    head.appendChild(title);
    card.appendChild(head);

    var meta = document.createElement('div');
    meta.className = 'meal-session-meta';
    if (meal.type === 'offsite') {
      meta.textContent = (meal.prepTime ? '\u5099\u9910 ' + meal.prepTime + ' \u00b7 ' : '') + (meal.prep || '');
      card.appendChild(meta);
      var detail = document.createElement('div');
      detail.className = 'meal-offsite-detail';
      if (meal.control) detail.appendChild(buildMealInfoLine('\u5834\u63a7', meal.control));
      if (meal.delivery && meal.delivery.length) detail.appendChild(buildMealInfoLine('\u904b\u9001/\u767c\u653e', meal.delivery.join(' \u00b7 ')));
      if (meal.cleanup && meal.cleanup.length) detail.appendChild(buildMealInfoLine('\u6536\u5c3e', meal.cleanup.join(' \u00b7 ')));
      if (detail.childNodes.length) card.appendChild(detail);
    } else {
      meta.textContent = '\u958b\u59cb\u96c6\u5408 ' + (meal.ready || '-') + (meal.control ? ' \u00b7 \u5834\u63a7 ' + meal.control : '');
      card.appendChild(meta);
      card.appendChild(buildDiningRoutes(meal, date));
      if (meal.guides && meal.guides.length) {
        var staff = document.createElement('div');
        staff.className = 'meal-session-staff';
        staff.textContent = '\u5f15\u5c0e\u4eba\u54e1\uff1a' + meal.guides.join(' \u00b7 ');
        card.appendChild(staff);
      }
    }
    return card;
  }

  function buildMealInfoLine(label, value) {
    var row = document.createElement('div');
    row.className = 'meal-info-line';
    var lab = document.createElement('span');
    lab.textContent = label;
    row.appendChild(lab);
    var val = document.createElement('strong');
    val.textContent = value;
    row.appendChild(val);
    return row;
  }

  function appendMealOverview() {
    var overview = document.createElement('div');
    overview.className = 'meal-overview';

    var title = document.createElement('div');
    title.className = 'meal-overview-title';
    title.textContent = '\u9910\u5ef3\u8def\u7dda\u5716\u8207\u73fe\u5834\u63d0\u9192';
    overview.appendChild(title);

    var map = document.createElement('div');
    map.className = 'meal-map';
    var img = document.createElement('img');
    img.className = 'meal-map-img';
    img.src = MEAL_ROUTE_MAP_IMAGE;
    img.alt = '\u9910\u5ef3\u4f9b\u9910\u8def\u7dda\u5716';
    map.appendChild(img);
    var caption = document.createElement('div');
    caption.className = 'meal-map-caption';
    caption.textContent = '\u5148\u5c0d\u7167\u4e0a\u65b9\u68af\u6b21\u8207\u8def\u7dda\uff0c\u518d\u5230\u73fe\u5834\u4f9d\u5730\u5716\u5f15\u5c0e\u3002';
    map.appendChild(caption);
    overview.appendChild(map);

    var guide = document.createElement('div');
    guide.className = 'meal-duty-guide';
    var guideTitle = document.createElement('div');
    guideTitle.className = 'meal-duty-title';
    guideTitle.textContent = '\u91cd\u9ede\u8077\u8cac';
    guide.appendChild(guideTitle);
    MEAL_STAFF_NOTES.forEach(function (item) {
      var note = document.createElement('div');
      note.className = 'meal-duty-note';
      note.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.text) + '</span>';
      guide.appendChild(note);
    });
    overview.appendChild(guide);

    mealsBodyEl.appendChild(overview);
  }

  function renderMeals() {
    if (!MEALS_GUIDE.length) return;
    if (state.mealsDay >= MEALS_GUIDE.length) state.mealsDay = detectMealsDayIndex();
    mealsDayFiltersEl.innerHTML = '';
    MEALS_GUIDE.forEach(function (d, idx) {
      var btn = makeDayPill('D-' + (idx + 1), d.day, idx === state.mealsDay);
      btn.dataset.idx = idx;
      mealsDayFiltersEl.appendChild(btn);
    });

    var dayData = MEALS_GUIDE[state.mealsDay] || MEALS_GUIDE[0];
    mealsBodyEl.innerHTML = '';

    var summary = document.createElement('div');
    summary.className = 'meal-day-summary';
    var summaryTitle = document.createElement('div');
    summaryTitle.className = 'meal-day-title';
    summaryTitle.textContent = 'D-' + (state.mealsDay + 1) + ' \u00b7 ' + dayData.day;
    summary.appendChild(summaryTitle);
    var summarySub = document.createElement('div');
    summarySub.className = 'meal-day-subtitle';
    summarySub.textContent = '\u9910\u5ef3\u7528\u9910\u6703\u5206 A/B \u68af\u6b21\uff1b\u975e\u9910\u5ef3\u7528\u9910\u6703\u986f\u793a\u53d6\u9910\u6216\u767c\u653e\u5730\u9ede\u3002';
    summary.appendChild(summarySub);
    mealsBodyEl.appendChild(summary);

    var groups = groupMealsByName(dayData.meals);
    if (!groups.length) {
      mealsBodyEl.appendChild(emptyNote('\u76ee\u524d\u6c92\u6709\u9019\u4e00\u5929\u7684\u7528\u9910\u8cc7\u6599'));
    }
    groups.forEach(function (group, idx) {
      var block = document.createElement('section');
      block.className = 'meal-group';
      block.style.animationDelay = (idx * 0.04) + 's';
      var head = document.createElement('div');
      head.className = 'meal-group-head';
      var icon = document.createElement('span');
      icon.className = 'meal-group-icon';
      icon.textContent = group.icon || '\u2022';
      head.appendChild(icon);
      var name = document.createElement('span');
      name.className = 'meal-group-name';
      name.textContent = group.name;
      head.appendChild(name);
      block.appendChild(head);

      group.meals.forEach(function (meal) {
        block.appendChild(buildMealSession(meal, dayData.day));
      });
      mealsBodyEl.appendChild(block);
    });

    appendMealOverview();
  }

  function renderLyrics() {
    lyricsBodyEl.innerHTML = '';
    LYRICS.forEach(function (song, idx) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'lyrics-song-card';
      card.dataset.index = idx;
      var icon = document.createElement('span');
      icon.className = 'lyrics-song-card-icon';
      icon.textContent = '🎵';
      card.appendChild(icon);
      var label = document.createElement('span');
      label.className = 'lyrics-song-card-label';
      label.textContent = song.title;
      card.appendChild(label);
      var arrow = document.createElement('span');
      arrow.className = 'lyrics-song-card-arrow';
      arrow.textContent = '›';
      card.appendChild(arrow);
      lyricsBodyEl.appendChild(card);
    });
  }

  function renderLyricsSong(index) {
    var song = LYRICS[index];
    lyricsSongTitleEl.textContent = song.title;
    lyricsSongBodyEl.innerHTML = '';
    song.sections.forEach(function (section) {
      var wrap = document.createElement('div');
      wrap.className = 'lyrics-section' + (section === '請填入歌詞' ? ' lyrics-placeholder' : '');
      var lines = section.split('\n');
      var body = lines;
      if (lines.length > 1 && /^.+：$/.test(lines[0])) {
        var label = document.createElement('div');
        label.className = 'lyrics-section-label';
        label.textContent = lines[0];
        wrap.appendChild(label);
        body = lines.slice(1);
      }
      var text = document.createElement('div');
      text.className = 'lyrics-section-body';
      text.textContent = body.join('\n');
      wrap.appendChild(text);
      lyricsSongBodyEl.appendChild(wrap);
    });
  }

  function openLyricsSong(index, options) {
    options = options || {};
    state.lyricsSongIndex = index;
    document.getElementById('pane-lyrics').hidden = true;
    toolBackEl.hidden = true;
    renderLyricsSong(index);
    lyricsSongPaneEl.hidden = false;
    playFadeIn(lyricsSongPaneEl);
    window.scrollTo(0, 0);
    if (!options.skipHistory) rememberRoute(false);
  }

  function closeLyricsSong(options) {
    options = options || {};
    state.lyricsSongIndex = null;
    lyricsSongPaneEl.hidden = true;
    toolBackEl.hidden = false;
    var pane = document.getElementById('pane-lyrics');
    pane.hidden = false;
    playFadeIn(pane);
    window.scrollTo(0, 0);
    if (!options.skipHistory) rememberRoute(false);
  }

  // ---- 醫護組資訊 ----
  function renderMedical() {
    renderMedicalSchedule();
    renderMedicalTeam();
    renderMedicalReport();
    renderMedicalVehicles();
  }

  function renderMedicalSchedule() {
    medicalDayFiltersEl.innerHTML = '';
    MEDICAL_SCHEDULE_DAYS.forEach(function (day, idx) {
      var chip = document.createElement('button');
      chip.className = 'day-pill' + (idx === state.medicalDay ? ' active' : '');
      chip.textContent = day;
      chip.dataset.idx = idx;
      medicalDayFiltersEl.appendChild(chip);
    });

    medicalScheduleBodyEl.innerHTML = '';
    MEDICAL_SCHEDULE.forEach(function (shift) {
      var card = document.createElement('div');
      card.className = 'medical-shift-card';

      var head = document.createElement('div');
      head.className = 'medical-shift-head';
      var label = document.createElement('span');
      label.className = 'medical-shift-label';
      label.textContent = shift.label;
      head.appendChild(label);
      var time = document.createElement('span');
      time.className = 'medical-shift-time';
      time.textContent = shift.time;
      head.appendChild(time);
      card.appendChild(head);

      var names = shift.duty[state.medicalDay] || [];
      var namesWrap = document.createElement('div');
      namesWrap.className = 'medical-shift-names';
      if (names.length) {
        names.forEach(function (n) {
          var tag = document.createElement('span');
          tag.className = 'medical-name-tag';
          tag.textContent = n;
          namesWrap.appendChild(tag);
        });
      } else {
        var empty = document.createElement('span');
        empty.className = 'medical-shift-empty';
        empty.textContent = '未排班';
        namesWrap.appendChild(empty);
      }
      card.appendChild(namesWrap);
      medicalScheduleBodyEl.appendChild(card);
    });
  }

  function renderMedicalTeam() {
    medicalTeamBodyEl.innerHTML = '';
    MEDICAL_TEAM.forEach(function (person) {
      var card = document.createElement('div');
      card.className = 'medical-person-card';

      var avatar = document.createElement('div');
      avatar.className = 'member-avatar medical-avatar';
      avatar.textContent = person.name.charAt(0);
      card.appendChild(avatar);

      var main = document.createElement('div');
      main.className = 'member-main';
      var nameRow = document.createElement('div');
      nameRow.className = 'member-name-row';
      var name = document.createElement('span');
      name.className = 'member-name';
      name.textContent = person.name;
      nameRow.appendChild(name);
      person.tags.forEach(function (t) {
        nameRow.appendChild(makeTag(t === '組長' ? 'tag-lead' : 'tag-driver', t));
      });
      main.appendChild(nameRow);

      var phone = (state.medicalPhones || {})[person.name];
      var phoneEl = document.createElement('div');
      phoneEl.className = 'member-meta';
      var roomText = person.room ? '房號 ' + person.room : '房號未列於原表';
      if (phone) {
        phoneEl.textContent = roomText + ' · ' + phone;
      } else {
        phoneEl.classList.add('medical-phone-missing');
        phoneEl.textContent = roomText + ' · 電話尚未提供';
      }
      main.appendChild(phoneEl);
      card.appendChild(main);

      if (phone) {
        var callBtn = document.createElement('a');
        callBtn.className = 'medical-call-btn';
        callBtn.href = 'tel:' + phone.replace(/[^0-9+]/g, '');
        callBtn.setAttribute('aria-label', '撥打給' + person.name);
        callBtn.textContent = '📞';
        card.appendChild(callBtn);
      }
      medicalTeamBodyEl.appendChild(card);
    });
  }

  function renderMedicalReport() {
    medicalReportTextEl.textContent = MEDICAL_REPORT_TEMPLATE;
    medicalReportNoteEl.textContent = '📌 ' + MEDICAL_REPORT_NOTE;
  }

  function renderMedicalVehicles() {
    medicalVehicleBodyEl.innerHTML = '';
    (state.medicalVehicles || []).forEach(function (v) {
      var card = document.createElement('div');
      card.className = 'medical-vehicle-card';
      var icon = document.createElement('span');
      icon.className = 'medical-vehicle-icon';
      icon.textContent = '🚗';
      card.appendChild(icon);
      var main = document.createElement('div');
      main.className = 'medical-vehicle-main';
      var driver = document.createElement('div');
      driver.className = 'medical-vehicle-driver';
      driver.textContent = v.driver + ' 負責';
      main.appendChild(driver);
      var plate = document.createElement('div');
      plate.className = 'medical-vehicle-plate';
      plate.textContent = v.plate;
      main.appendChild(plate);
      card.appendChild(main);
      medicalVehicleBodyEl.appendChild(card);
    });
  }

  // ---- 常用連結 ----
  function renderLinks() {
    if (linksBodyEl.childElementCount) return; // 靜態內容只建一次
    LINKS_SECTIONS.forEach(function (sec) {
      var title = document.createElement('h3');
      title.className = 'links-section-title';
      title.textContent = sec.title;
      linksBodyEl.appendChild(title);

      var list = document.createElement('div');
      list.className = 'links-list';
      sec.links.forEach(function (link, i) {
        var a = document.createElement('a');
        a.className = 'link-card';
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.animationDelay = Math.min(i, 12) * 0.02 + 's';
        bindExternalOpen(a, link.url);

        var icon = document.createElement('span');
        icon.className = 'link-card-icon';
        icon.textContent = link.icon;
        a.appendChild(icon);
        var label = document.createElement('span');
        label.className = 'link-card-label';
        label.textContent = link.label;
        a.appendChild(label);
        var arrow = document.createElement('span');
        arrow.className = 'link-card-arrow';
        arrow.textContent = '↗';
        a.appendChild(arrow);
        list.appendChild(a);
      });
      linksBodyEl.appendChild(list);
    });
  }

  // ---- 營本部排班表 ----
  function detectHqDayIndex() {
    var now = getNow();
    var key = (now.getMonth() + 1) + '/' + now.getDate();
    for (var i = 0; i < HQ_SCHEDULE.length; i++) {
      if (HQ_SCHEDULE[i].day === key) return i;
    }
    return 0;
  }

  function renderHqSchedule() {
    hqDayFiltersEl.innerHTML = '';
    HQ_SCHEDULE.forEach(function (d, idx) {
      var btn = makeDayPill(d.tag, d.day + ' ' + d.dow, idx === state.hqDay);
      btn.dataset.idx = idx;
      hqDayFiltersEl.appendChild(btn);
    });

    var dayData = HQ_SCHEDULE[state.hqDay];
    var now = getNow();
    var isToday = ((now.getMonth() + 1) + '/' + now.getDate()) === dayData.day;
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var currentNames = null;

    hqScheduleBodyEl.innerHTML = '';
    dayData.slots.forEach(function (slot) {
      var range = parseTimeRange(slot.time);
      var isCurrent = isToday && range.start !== null && range.end !== null &&
        nowMin >= range.start && nowMin < range.end;
      if (isCurrent) currentNames = slot.names;

      var rowEl = document.createElement('div');
      rowEl.className = 'hq-slot' + (isCurrent ? ' current' : '');
      var time = document.createElement('span');
      time.className = 'hq-slot-time';
      time.textContent = slot.time;
      rowEl.appendChild(time);
      var names = document.createElement('span');
      names.className = 'hq-slot-names';
      slot.names.forEach(function (n) {
        var tag = document.createElement('span');
        tag.className = 'medical-name-tag';
        tag.textContent = n;
        names.appendChild(tag);
      });
      rowEl.appendChild(names);
      hqScheduleBodyEl.appendChild(rowEl);
    });

    // 「現在值班」提示：只有看「今天」且正好在值班時段內才顯示
    if (currentNames) {
      hqNowEl.textContent = '🟢 現在值班：' + currentNames.join('、');
      hqNowEl.hidden = false;
    } else {
      hqNowEl.hidden = true;
    }

    if (hqSheetLinkEl && hqSheetLinkEl.getAttribute('href') === '#') {
      hqSheetLinkEl.href = HQ_SHEET_URL;
      bindExternalOpen(hqSheetLinkEl, HQ_SHEET_URL);
    }
  }

  // ---- 營本部聯絡資訊（可展開的資訊卡）----
  function renderInfo() {
    if (infoBodyEl.childElementCount) return; // 靜態內容只建一次
    INFO_SECTIONS.forEach(function (sec, i) {
      var card = document.createElement('div');
      card.className = 'info-card';
      card.style.animationDelay = (i * 0.03) + 's';

      var head = document.createElement('button');
      head.type = 'button';
      head.className = 'info-card-head';
      head.innerHTML =
        '<span class="info-card-icon">' + sec.icon + '</span>' +
        '<span class="info-card-title">' + escapeHtml(sec.title) + '</span>' +
        '<span class="card-expand-caret">▾</span>';
      card.appendChild(head);

      var wrap = document.createElement('div');
      wrap.className = 'info-card-wrap';
      var body = document.createElement('div');
      body.className = 'info-card-body';
      sec.lines.forEach(function (line) {
        var p = document.createElement('div');
        p.className = 'info-line';
        p.textContent = line;
        body.appendChild(p);
      });
      wrap.appendChild(body);
      card.appendChild(wrap);

      head.addEventListener('click', function () {
        var open = card.classList.toggle('open');
        wrap.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
      });

      infoBodyEl.appendChild(card);
    });
  }

  // ---- 點名（1–31 小隊）----
  function rollcallScopeKey(t, s) { return t + '|' + s; }
  function currentRollcallScope() {
    var pair = state.members.find(function (m) { return m.s === state.rollcallSquad && m.s >= 18 && m.s <= 22; });
    return { team: pair ? pair.t : 5, squad: state.rollcallSquad, key: rollcallScopeKey(pair ? pair.t : 5, state.rollcallSquad) };
  }
  function allRollcallScopes() {
    var seen = {};
    return state.members.reduce(function (out, m) {
      if (m.s < 18 || m.s > 22) return out;
      var key = rollcallScopeKey(m.t, m.s);
      if (!seen[key]) {
        seen[key] = 1;
        out.push({ team: m.t, squad: m.s, key: key });
      }
      return out;
    }, []).sort(function (a, b) { return a.team - b.team || a.squad - b.squad; });
  }

  function renderRollcallFilters() {
    var scopes = allRollcallScopes();
    if (!scopes.some(function (x) { return x.squad === state.rollcallSquad; }) && scopes.length) {
      state.rollcallSquad = scopes[0].squad;
    }
    rollcallSquadFiltersEl.innerHTML = '';
    scopes.forEach(function (x) {
      var chip = document.createElement('button');
      chip.className = 'roster-chip';
      chip.textContent = x.squad + '小隊';
      chip.dataset.team = String(x.team);
      chip.dataset.val = String(x.squad);
      rollcallSquadFiltersEl.appendChild(chip);
    });
    rollcallSquadFiltersEl.onclick = function (e) {
      var chip = e.target.closest('.roster-chip');
      if (!chip) return;
      state.rollcallSquad = parseInt(chip.dataset.val, 10);
      renderRollcall();
    };
  }

  function memberKey(m) { return m.t + '-' + m.s + '-' + m.g + '-' + m.n; }

  function renderRollcall() {
    if (!state.membersLoaded) { rollcallCountEl.textContent = '載入中…'; return; }
    var scope = currentRollcallScope();
    var t = scope.team;
    var s = scope.squad;
    var scopeKey = scope.key;
    rollcallSquadFiltersEl.querySelectorAll('.roster-chip').forEach(function (chip) {
      chip.classList.toggle('active', parseInt(chip.dataset.val, 10) === s);
    });
    if (!state.rollcallPresent[scopeKey]) {
      state.rollcallPresent[scopeKey] = {};
      state.members.filter(function (m) { return m.t === t && m.s === s; })
        .forEach(function (m) { state.rollcallPresent[scopeKey][memberKey(m)] = true; });
    }
    var present = state.rollcallPresent[scopeKey];

    var boys = state.members.filter(function (m) { return m.t === t && m.s === s && m.g === '男'; });
    var girls = state.members.filter(function (m) { return m.t === t && m.s === s && m.g === '女'; });
    var total = boys.length + girls.length;
    var presentCount = Object.keys(present).filter(function (k) { return present[k]; }).length;

    var advisors = state.squadAdvisors[t + '|' + s] || {};
    rollcallCountEl.textContent = '到 ' + presentCount + ' / ' + total;

    if (rollcallTimesEl) {
      var todayIdx = detectTodayDayIndex();
      var d = todayIdx || 1;
      rollcallTimesEl.textContent = '每日清點人數時間：' + (ROLLCALL_TIMES[d] || '依現場指示');
    }

    rollcallBoardEl.innerHTML = '';
    var header = document.createElement('div');
    header.className = 'rollcall-header';
    header.textContent = teamLabel(t) + ' ' + s + '小隊點名';
    rollcallBoardEl.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'rollcall-grid';
    grid.appendChild(buildRollcallCol('男生　隊輔：' + (advisors['男'] || '未列'), boys, present, 'male'));
    grid.appendChild(buildRollcallCol('女生　隊輔：' + (advisors['女'] || '未列'), girls, present, 'female'));
    rollcallBoardEl.appendChild(grid);

    renderRollcallSummary(scopeKey, boys.concat(girls), present, total, presentCount);
  }

  function renderRollcallSummary(s, all, present, total, presentCount) {
    var absentCount = total - presentCount;
    rollcallExpectedEl.textContent = total;
    rollcallPresentCountEl.textContent = presentCount;
    rollcallAbsentCountEl.textContent = absentCount;

    var absentList = all.filter(function (m) { return !present[memberKey(m)]; });
    var absentKey = absentList.map(memberKey).join(',');
    if (state.rollcallAbsentKey[s] !== absentKey) {
      state.rollcallReasons[s] = absentList.map(function (m) { return m.n + '：'; }).join('\n');
      state.rollcallAbsentKey[s] = absentKey;
    }
    rollcallReasonEl.value = state.rollcallReasons[s] || '';
    rollcallReasonEl.placeholder = absentList.length ? '請輸入未到原因…' : '目前全員到齊 🎉';
  }

  function buildRollcallReport() {
    var scope = currentRollcallScope();
    var s = scope.squad;
    var t = scope.team;
    var total = parseInt(rollcallExpectedEl.textContent, 10) || 0;
    var presentCount = parseInt(rollcallPresentCountEl.textContent, 10) || 0;
    var absentCount = parseInt(rollcallAbsentCountEl.textContent, 10) || 0;

    var lines = [];
    lines.push(teamLabel(t) + ' ' + s + '小隊　點名回報');
    lines.push('應到 ' + total + '｜實到 ' + presentCount + '｜未到 ' + absentCount);
    if (absentCount > 0) {
      lines.push('');
      lines.push('未到名單：');
      lines.push(rollcallReasonEl.value.trim());
    } else {
      lines.push('');
      lines.push('全員到齊 🎉');
    }
    return lines.join('\n');
  }

  function copyRollcallReport() {
    var text = buildRollcallReport();
    var done = function () {
      var original = rollcallCopyEl.textContent;
      rollcallCopyEl.textContent = '已複製 ✓';
      rollcallCopyEl.classList.add('copied');
      setTimeout(function () {
        rollcallCopyEl.textContent = original;
        rollcallCopyEl.classList.remove('copied');
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  }

  function buildRollcallCol(title, list, present, cls) {
    var col = document.createElement('div');
    col.className = 'rollcall-col';
    var h = document.createElement('div');
    h.className = 'rollcall-col-title ' + cls;
    h.textContent = title;
    col.appendChild(h);
    list.forEach(function (m) {
      var key = memberKey(m);
      var row = document.createElement('div');
      row.className = 'rollcall-row' + (present[key] ? ' present' : '');
      var box = document.createElement('span');
      box.className = 'rollcall-box';
      box.textContent = present[key] ? '✓' : '';
      var name = document.createElement('span');
      name.className = 'rollcall-name';
      name.textContent = m.n + (m.m ? '' : '＊');
      row.appendChild(box);
      row.appendChild(name);
      row.addEventListener('click', function () {
        present[key] = !present[key];
        renderRollcall();
      });
      col.appendChild(row);
    });
    return col;
  }

  function setAllRollcall(val) {
    var scope = currentRollcallScope();
    var s = scope.squad;
    var t = scope.team;
    var scopeKey = scope.key;
    state.rollcallPresent[scopeKey] = {};
    if (val) {
      state.members.filter(function (m) { return m.t === t && m.s === s; })
        .forEach(function (m) { state.rollcallPresent[scopeKey][memberKey(m)] = true; });
    }
    renderRollcall();
  }

  // tool menu navigation
  toolsMenuEl.addEventListener('click', function (e) {
    var card = e.target.closest('.tool-menu-card');
    if (card) requestTool(card.dataset.tool);
  });
  toolBackEl.addEventListener('click', function () {
    goBackOr(function () { backToToolsMenu(); });
  });

  // 解鎖視窗事件
  unlockSubmitEl.addEventListener('click', submitUnlock);
  if (unlockCancelEl) {
    unlockCancelEl.addEventListener('click', function () {
      goBackOr(function () { cancelUnlock(); });
    });
  }
  unlockInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submitUnlock(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelUnlock(); }
  });
  lyricsBodyEl.addEventListener('click', function (e) {
    var card = e.target.closest('.lyrics-song-card');
    if (card) openLyricsSong(parseInt(card.dataset.index, 10));
  });
  lyricsSongBackEl.addEventListener('click', function () {
    goBackOr(function () { closeLyricsSong(); });
  });

  // medical events
  medicalDayFiltersEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.day-pill');
    if (!chip) return;
    state.medicalDay = parseInt(chip.dataset.idx, 10);
    renderMedicalSchedule();
  });

  // 營本部排班表：切換日期
  hqDayFiltersEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.day-pill');
    if (!chip) return;
    state.hqDay = parseInt(chip.dataset.idx, 10);
    renderHqSchedule();
  });

  // 「現在／接下來」橫幅：點一下捲到進行中的活動
  if (nowBannerEl) {
    nowBannerEl.addEventListener('click', function () {
      scrollToCurrent(document.getElementById('tab-overview'));
    });
  }

  // roster events
  rosterInputEl.addEventListener('input', function () {
    state.rosterQuery = rosterInputEl.value;
    rosterInputEl.closest('.roster-search').classList.toggle('has-text', !!rosterInputEl.value);
    renderRoster();
  });
  rosterClearEl.addEventListener('click', function () {
    rosterInputEl.value = '';
    state.rosterQuery = '';
    rosterInputEl.closest('.roster-search').classList.remove('has-text');
    renderRoster();
    rosterInputEl.focus();
  });
  document.querySelectorAll('#pane-roster .roster-toggle[data-gender]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.rosterGender = b.dataset.gender;
      syncRosterChips();
      renderRoster();
    });
  });
  rosterNonMemberToggleEl.addEventListener('click', function () {
    state.rosterNonMemberOnly = !state.rosterNonMemberOnly;
    syncRosterChips();
    renderRoster();
  });

  // staff events（尋找工作人員）
  staffInputEl.addEventListener('input', function () {
    state.staffQuery = staffInputEl.value;
    staffInputEl.closest('.roster-search').classList.toggle('has-text', !!staffInputEl.value);
    renderStaff();
  });
  staffClearEl.addEventListener('click', function () {
    staffInputEl.value = '';
    state.staffQuery = '';
    staffInputEl.closest('.roster-search').classList.remove('has-text');
    renderStaff();
    staffInputEl.focus();
  });

  // meals events（用餐指南）
  mealsDayFiltersEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.day-pill');
    if (!chip) return;
    state.mealsDay = parseInt(chip.dataset.idx, 10);
    renderMeals();
  });

  // draw events
  document.querySelectorAll('.stepper').forEach(function (st) {
    st.addEventListener('click', function (e) {
      var btn = e.target.closest('.stepper-btn');
      if (!btn) return;
      var delta = parseInt(btn.dataset.delta, 10);
      var key = st.dataset.draw === 'male' ? 'drawMale' : 'drawFemale';
      state[key] = Math.max(0, Math.min(50, state[key] + delta));
      syncDrawSteppers();
    });
  });
  randomPickBtnEl.addEventListener('click', function () {
    randomPickBtnEl.classList.remove('rolling');
    void randomPickBtnEl.offsetWidth;
    randomPickBtnEl.classList.add('rolling');
    buzz([12, 40, 12]);
    setTimeout(runDraw, 250);
  });
  if (drawNoRepeatToggleEl) {
    drawNoRepeatToggleEl.addEventListener('click', function () {
      state.drawNoRepeat = !state.drawNoRepeat;
      syncDrawExtra();
    });
  }
  if (drawResetBtnEl) {
    drawResetBtnEl.addEventListener('click', function () {
      state.drawnKeys = {};
      syncDrawExtra();
    });
  }

  // rollcall events
  rollcallAllEl.addEventListener('click', function () { setAllRollcall(true); });
  rollcallNoneEl.addEventListener('click', function () { setAllRollcall(false); });
  rollcallReasonEl.addEventListener('input', function () {
    state.rollcallReasons[currentRollcallScope().key] = rollcallReasonEl.value;
  });
  rollcallCopyEl.addEventListener('click', copyRollcallReport);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.dataset.tab);
    });
  });

  personSelectEl.addEventListener('change', function () {
    if (personSelectEl.value) {
      localStorage.setItem(STORAGE_KEY, personSelectEl.value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    renderMeTab();
    renderOverviewTab();
  });

  refreshBtnEl.addEventListener('click', function () { loadMealData(); loadData(true); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      state.hiddenAt = Date.now();
      if (state.unlocked) touchUnlock();
      return;
    }
    loadData(false);
    if (state.unlocked && state.hiddenAt && (Date.now() - state.hiddenAt) > IDLE_MS) {
      // 閒置過久 → 重新上鎖
      lock();
      if (state.currentTool && PROTECTED_TOOLS[state.currentTool]) {
        state.pendingTool = state.currentTool;
        backToToolsMenu({ skipHistory: true });
        showUnlock({ skipHistory: true });
      }
    } else if (!state.unlocked) {
      trySilentUnlock();
    }
  });

  searchFabEl.addEventListener('click', function () { openSearch(); });
  searchCloseEl.addEventListener('click', function () {
    goBackOr(function () { closeSearch(); });
  });
  searchBackdropEl.addEventListener('click', function () {
    goBackOr(function () { closeSearch(); });
  });
  searchInputEl.addEventListener('input', function () { runSearch(searchInputEl.value); });

  window.addEventListener('popstate', function (e) {
    if (appHistoryDepth > 0) appHistoryDepth -= 1;
    applyRoute(e.state);
  });
  rememberRoute(true);

  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncSearchViewport);
    window.visualViewport.addEventListener('scroll', syncSearchViewport);
  }

  // 離線快取：把整個 App（含地圖、歌詞頁面）留在裝置上，會場收訊差也能開
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 不支援就照常線上使用 */ });
    });
  }

  loadFromCache();
  loadData(false);
  trySilentUnlock();
})();
