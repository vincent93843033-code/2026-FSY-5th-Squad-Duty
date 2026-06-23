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
    '音樂節目細流': 'https://docs.google.com/spreadsheets/d/1jVM_zlY1UdiE93lWAdk9Pe5bKsvXN4q1cTHEC_Q0hqQ/edit',
  };
  // 膳食組細流（用餐時段自動附上連結）
  var MEAL_LINK_URL = 'https://docs.google.com/spreadsheets/d/1FoOzytm7_enx8ul0ycB5vPdIsHTIjzjPVtU46XG3kjE/edit';
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
  // 醫護組資訊：團隊成員（標籤：組長／司機）
  var MEDICAL_TEAM = [
    { name: '俞采', tags: ['組長'] },
    { name: '瑪恩', tags: [] },
    { name: '綉娟', tags: ['司機'] },
    { name: '君佩', tags: ['司機'] },
    { name: '紫祺', tags: ['組長'] },
    { name: '書亞', tags: [] },
    { name: '岱娜', tags: [] },
    { name: '靖琇', tags: [] },
    { name: '連凱', tags: ['組長', '司機'] },
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
  var rosterEarlyToggleEl = document.getElementById('roster-early-toggle');
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
  var advisorInputEl = document.getElementById('advisor-input');
  var advisorClearEl = document.getElementById('advisor-clear');
  var advisorTeamFiltersEl = document.getElementById('advisor-team-filters');
  var advisorListEl = document.getElementById('advisor-list');
  var advisorCountEl = document.getElementById('advisor-count');
  var contactsBodyEl = document.getElementById('contacts-body');
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
    rosterEarlyOnly: false,
    rosterNonMemberOnly: false,
    rosterQuery: '',
    advisorTeams: [],
    advisorQuery: '',
    drawTeams: [],        // 抽籤範圍（中隊；空 = 全FSY）
    drawSquads: [],       // 抽籤範圍（小隊；空 = 所選中隊全部）
    drawMale: 1,
    drawFemale: 0,
    rollcallSquad: 18,    // 點名小隊（第五中隊 18-22）
    rollcallPresent: {},  // { squad: { memberKey: true } }
    rollcallReasons: {},  // { squad: textarea內容 }
    rollcallAbsentKey: {}, // { squad: 上次未到名單的key，用於判斷是否需重建文字框 }
    squadAdvisors: {},    // "t|s" -> { 男: name, 女: name }
    currentTool: null,
    medicalDay: 0,        // 醫護組值班表所選日期索引
    unlocked: false,      // 是否已用密碼解鎖個資
    medicalPhones: {},    // 解密後的醫護電話
    medicalVehicles: [],  // 解密後的醫護車牌
    pendingTool: null,    // 解鎖後要開啟的工具
    hiddenAt: 0,          // 上次切到背景的時間（判斷閒置重鎖）
  };

  var didInitialScroll = false;

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
    var parts = (timeStr || '').split('-');
    return {
      start: parseHM(parts[0]),
      end: parts.length > 1 ? parseHM(parts[1]) : null,
    };
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
          location: (row[5] || '').trim(),
          leader: (row[3] || '').trim(),
          detailLink: (row[7] || '').trim(),
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
      state.selectedDay = detectTodayDayIndex() || 1;
      state.days.forEach(function (day) {
        state.collapsedDays[day.index] = true;
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

  function renderDayPills() {
    dayPillsEl.innerHTML = '';
    state.days.forEach(function (day) {
      var btn = document.createElement('button');
      btn.className = 'day-pill' + (day.index === state.selectedDay ? ' active' : '');
      btn.textContent = 'D-' + day.index;
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
    return XILIU_LINKS[key] || null;
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

  function buildLinkValue(label, url) {
    var span = document.createElement('span');
    span.className = 'detail-value';
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'detail-link';
    a.textContent = '🔗 ' + label;
    a.addEventListener('click', function (e) {
      // iOS 主畫面（standalone）模式下 target=_blank 會失效，改用程式開啟並保底導向
      e.preventDefault();
      e.stopPropagation();
      var opened = window.open(url, '_blank');
      if (!opened) window.location.href = url;
    });
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
        fields.push(['細流連結', buildTextValue(row.detailLink)]);
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

  function buildActivityCard(row, highlightPerson, dayLabel, now) {
    var card = document.createElement('div');
    var hasAssignments = Object.keys(row.people).length > 0;
    var classes = ['activity-card'];
    if (now && isRowCurrent(dayLabel, row, now)) classes.push('current');
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

    playFadeIn(overviewContentEl);
    fitCardText(overviewContentEl);
  }

  function playFadeIn(el) {
    el.classList.remove('fade-in');
    void el.offsetWidth;
    el.classList.add('fade-in');
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

  function openSearch() {
    searchOverlayEl.classList.add('open');
    runSearch(searchInputEl.value);
    syncSearchViewport();
    setTimeout(function () { searchInputEl.focus(); }, 250);
  }

  function closeSearch() {
    searchOverlayEl.classList.remove('open');
    searchInputEl.blur();
  }

  // ---- Tab 3: 小工具（含個資的工具需密碼解鎖）----
  var PROTECTED_TOOLS = { roster: 1, advisors: 1, draw: 1, rollcall: 1, medical: 1 };
  var UNLOCK_KEY = 'fsy5_unlock';
  var IDLE_MS = 30 * 60 * 1000; // 離開／背景超過 30 分鐘才需重新輸入密碼
  var encBlobCache = null;

  var unlockOverlayEl = document.getElementById('unlock-overlay');
  var unlockInputEl = document.getElementById('unlock-input');
  var unlockSubmitEl = document.getElementById('unlock-submit');
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

  function showUnlock() {
    unlockErrorEl.textContent = '';
    unlockInputEl.value = '';
    unlockOverlayEl.classList.add('open');
    setTimeout(function () { unlockInputEl.focus(); }, 250);
  }
  function hideUnlock() {
    unlockOverlayEl.classList.remove('open');
    unlockInputEl.blur();
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
      hideUnlock();
      var pending = state.pendingTool;
      state.pendingTool = null;
      if (pending) openTool(pending);
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
  function openTool(name) {
    state.currentTool = name;
    toolsMenuEl.hidden = true;
    toolViewEl.hidden = false;
    toolBackEl.hidden = false;
    var panes = toolViewEl.querySelectorAll('.tool-pane');
    panes.forEach(function (p) { p.hidden = ('pane-' + name) !== p.id; });
    var pane = document.getElementById('pane-' + name);
    if (pane) playFadeIn(pane);
    if (name === 'roster') { renderRosterFilters(); renderRoster(); }
    if (name === 'advisors') { renderAdvisorFilters(); renderAdvisors(); }
    if (name === 'draw') { renderDrawFilters(); syncDrawSteppers(); }
    if (name === 'contacts') renderContacts();
    if (name === 'lyrics') renderLyrics();
    if (name === 'medical') renderMedical();
    if (name === 'rollcall') { renderRollcallFilters(); renderRollcall(); }
    window.scrollTo(0, 0);
  }

  function backToToolsMenu() {
    state.currentTool = null;
    toolViewEl.hidden = true;
    toolsMenuEl.hidden = false;
    playFadeIn(toolsMenuEl);
    window.scrollTo(0, 0);
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
    rosterEarlyToggleEl.classList.toggle('active', state.rosterEarlyOnly);
    rosterNonMemberToggleEl.classList.toggle('active', state.rosterNonMemberOnly);
  }

  function memberSearchText(m) {
    return [m.n, teamLabel(m.t), m.s + '小隊', m.a, m.w, m.m ? '成員' : '非成員', m.g,
      m.early ? '早退' : '', m.r1, m.r2].filter(Boolean).join(' ');
  }

  function filteredMembers() {
    var q = state.rosterQuery.trim();
    var list = state.members.filter(function (m) {
      if (state.rosterTeams.length && state.rosterTeams.indexOf(m.t) === -1) return false;
      if (state.rosterSquads.length && state.rosterSquads.indexOf(m.s) === -1) return false;
      if (state.rosterGender !== 'all' && m.g !== state.rosterGender) return false;
      if (state.rosterEarlyOnly && !m.early) return false;
      if (state.rosterNonMemberOnly && m.m) return false;
      return true;
    });
    if (q) {
      list = list
        .map(function (m) { return { m: m, score: fuzzyScore(q, memberSearchText(m)) }; })
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
    // Day3 課程教室（尚未公布，冒號後留白，待正式資料）
    detail.appendChild(makeDetailRow('課程1', m.r1 || ''));
    detail.appendChild(makeDetailRow('課程2', m.r2 || ''));
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
      return m.g === gender;
    });
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
    var picks = sampleN(drawPool('男'), state.drawMale).concat(sampleN(drawPool('女'), state.drawFemale));
    if (!picks.length) { randomResultEl.appendChild(emptyNote('此範圍沒有可抽的人')); return; }

    var shortfall = (state.drawMale > drawPool('男').length) || (state.drawFemale > drawPool('女').length);
    if (shortfall) randomResultEl.appendChild(emptyNote('人數超過範圍人數，已抽出全部可抽者'));

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

  // ---- 小隊輔一覽 ----
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

  function renderAdvisorFilters() {
    buildChipRow(advisorTeamFiltersEl,
      distinctTeams().map(function (t) { return { val: t, label: teamLabel(t) }; }),
      null,
      function (t) { toggleInArray(state.advisorTeams, t); syncChipRow(advisorTeamFiltersEl, state.advisorTeams); renderAdvisors(); },
      function () { state.advisorTeams = []; syncChipRow(advisorTeamFiltersEl, state.advisorTeams); renderAdvisors(); });
    syncChipRow(advisorTeamFiltersEl, state.advisorTeams);
  }

  function renderAdvisors() {
    if (!state.membersLoaded) { advisorCountEl.textContent = '載入中…'; return; }
    var q = state.advisorQuery.trim();
    var list = deriveAdvisors().filter(function (a) {
      if (state.advisorTeams.length && state.advisorTeams.indexOf(a.t) === -1) return false;
      return true;
    });
    if (q) {
      list = list
        .map(function (a) { return { a: a, score: fuzzyScore(q, a.a + ' ' + teamLabel(a.t) + ' ' + a.s + '小隊 ' + a.g) }; })
        .filter(function (x) { return x.score > -1; })
        .sort(function (a, b) { return b.score - a.score; })
        .map(function (x) { return x.a; });
    } else {
      list.sort(function (a, b) { return a.t - b.t || a.s - b.s || (a.g === '男' ? -1 : 1); });
    }
    advisorCountEl.textContent = (state.advisorTeams.length ? scopeLabel(state.advisorTeams, []) : '全FSY') + ' · ' + list.length + ' 位';

    advisorListEl.innerHTML = '';
    if (!list.length) { advisorListEl.appendChild(emptyNote('找不到符合的隊輔')); return; }
    list.forEach(function (a, i) {
      var card = document.createElement('div');
      card.className = 'member-card ' + (a.g === '男' ? 'male' : 'female');
      card.style.animationDelay = Math.min(i, 12) * 0.02 + 's';
      var avatar = document.createElement('div');
      avatar.className = 'member-avatar';
      avatar.textContent = a.a ? a.a.charAt(0) : '?';
      card.appendChild(avatar);
      var main = document.createElement('div');
      main.className = 'member-main';
      var nameRow = document.createElement('div');
      nameRow.className = 'member-name-row';
      var name = document.createElement('span');
      name.className = 'member-name';
      name.textContent = a.a;
      nameRow.appendChild(name);
      nameRow.appendChild(makeTag(a.g === '男' ? 'tag-male' : 'tag-female', a.g === '男' ? '男隊' : '女隊'));
      main.appendChild(nameRow);
      var meta = document.createElement('div');
      meta.className = 'member-meta';
      meta.textContent = teamLabel(a.t) + ' · ' + a.s + '小隊';
      main.appendChild(meta);
      card.appendChild(main);
      advisorListEl.appendChild(card);
    });
  }

  // ---- 領袖聯絡方式 ----
  function renderContacts() {
    if (state.contacts && state.contacts.length) {
      // 預留：若日後提供 leaders.json，可在此渲染
      return;
    }
    contactsBodyEl.innerHTML = '';
    var note = document.createElement('div');
    note.className = 'contacts-empty';
    note.innerHTML = '<div class="contacts-empty-icon">📞</div>' +
      '<div class="contacts-empty-title">尚未提供聯絡資料</div>' +
      '<div class="contacts-empty-text">已查過 LINE 對話紀錄，裡面只有遊覽車司機／後勤的電話，' +
      '沒有完整的 FSY 領袖聯絡清單。請把領袖聯絡名單（姓名／職務／電話或 LINE）提供給管理者即可建立。<br><br>' +
      '⚠ 提醒：本 App 為公開網址，建議聯絡資訊以加密或非公開方式管理，避免個資外流。</div>';
    contactsBodyEl.appendChild(note);
  }

  // ---- 歌詞 ----
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

  function openLyricsSong(index) {
    document.getElementById('pane-lyrics').hidden = true;
    toolBackEl.hidden = true;
    renderLyricsSong(index);
    lyricsSongPaneEl.hidden = false;
    playFadeIn(lyricsSongPaneEl);
    window.scrollTo(0, 0);
  }

  function closeLyricsSong() {
    lyricsSongPaneEl.hidden = true;
    toolBackEl.hidden = false;
    var pane = document.getElementById('pane-lyrics');
    pane.hidden = false;
    playFadeIn(pane);
    window.scrollTo(0, 0);
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
      if (phone) {
        phoneEl.textContent = phone;
      } else {
        phoneEl.classList.add('medical-phone-missing');
        phoneEl.textContent = '電話尚未提供';
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

  // ---- 點名（第五中隊 18-22 小隊）----
  function renderRollcallFilters() {
    var squads = squadsForTeams([FIFTH]);
    rollcallSquadFiltersEl.innerHTML = '';
    squads.forEach(function (s) {
      var chip = document.createElement('button');
      chip.className = 'roster-chip';
      chip.textContent = s + '小隊';
      chip.dataset.val = String(s);
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
    var s = state.rollcallSquad;
    rollcallSquadFiltersEl.querySelectorAll('.roster-chip').forEach(function (chip) {
      chip.classList.toggle('active', parseInt(chip.dataset.val, 10) === s);
    });
    if (!state.rollcallPresent[s]) {
      // 預設全部到齊，由小隊輔取消缺席者
      state.rollcallPresent[s] = {};
      state.members.filter(function (m) { return m.t === FIFTH && m.s === s; })
        .forEach(function (m) { state.rollcallPresent[s][memberKey(m)] = true; });
    }
    var present = state.rollcallPresent[s];

    var boys = state.members.filter(function (m) { return m.t === FIFTH && m.s === s && m.g === '男'; });
    var girls = state.members.filter(function (m) { return m.t === FIFTH && m.s === s && m.g === '女'; });
    var total = boys.length + girls.length;
    var presentCount = Object.keys(present).filter(function (k) { return present[k]; }).length;

    var advisors = state.squadAdvisors[FIFTH + '|' + s] || {};
    rollcallCountEl.textContent = '到 ' + presentCount + ' / ' + total;

    rollcallBoardEl.innerHTML = '';
    var header = document.createElement('div');
    header.className = 'rollcall-header';
    header.textContent = teamLabel(FIFTH) + ' ' + s + '小隊　點名表';
    rollcallBoardEl.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'rollcall-grid';
    grid.appendChild(buildRollcallCol('男　隊輔：' + (advisors['男'] || '—'), boys, present, 'male'));
    grid.appendChild(buildRollcallCol('女　隊輔：' + (advisors['女'] || '—'), girls, present, 'female'));
    rollcallBoardEl.appendChild(grid);

    renderRollcallSummary(s, boys.concat(girls), present, total, presentCount);
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
    var s = state.rollcallSquad;
    var total = parseInt(rollcallExpectedEl.textContent, 10) || 0;
    var presentCount = parseInt(rollcallPresentCountEl.textContent, 10) || 0;
    var absentCount = parseInt(rollcallAbsentCountEl.textContent, 10) || 0;

    var lines = [];
    lines.push(teamLabel(FIFTH) + ' ' + s + '小隊　點名回報');
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
    var s = state.rollcallSquad;
    state.rollcallPresent[s] = {};
    if (val) {
      state.members.filter(function (m) { return m.t === FIFTH && m.s === s; })
        .forEach(function (m) { state.rollcallPresent[s][memberKey(m)] = true; });
    }
    renderRollcall();
  }

  // tool menu navigation
  toolsMenuEl.addEventListener('click', function (e) {
    var card = e.target.closest('.tool-menu-card');
    if (card) requestTool(card.dataset.tool);
  });
  toolBackEl.addEventListener('click', backToToolsMenu);

  // 解鎖視窗事件
  unlockSubmitEl.addEventListener('click', submitUnlock);
  unlockInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submitUnlock(); }
  });
  lyricsBodyEl.addEventListener('click', function (e) {
    var card = e.target.closest('.lyrics-song-card');
    if (card) openLyricsSong(parseInt(card.dataset.index, 10));
  });
  lyricsSongBackEl.addEventListener('click', closeLyricsSong);

  // medical events
  medicalDayFiltersEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.day-pill');
    if (!chip) return;
    state.medicalDay = parseInt(chip.dataset.idx, 10);
    renderMedicalSchedule();
  });

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
  rosterEarlyToggleEl.addEventListener('click', function () {
    state.rosterEarlyOnly = !state.rosterEarlyOnly;
    syncRosterChips();
    renderRoster();
  });
  rosterNonMemberToggleEl.addEventListener('click', function () {
    state.rosterNonMemberOnly = !state.rosterNonMemberOnly;
    syncRosterChips();
    renderRoster();
  });

  // advisor events
  advisorInputEl.addEventListener('input', function () {
    state.advisorQuery = advisorInputEl.value;
    advisorInputEl.closest('.roster-search').classList.toggle('has-text', !!advisorInputEl.value);
    renderAdvisors();
  });
  advisorClearEl.addEventListener('click', function () {
    advisorInputEl.value = '';
    state.advisorQuery = '';
    advisorInputEl.closest('.roster-search').classList.remove('has-text');
    renderAdvisors();
    advisorInputEl.focus();
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
    setTimeout(runDraw, 250);
  });

  // rollcall events
  rollcallAllEl.addEventListener('click', function () { setAllRollcall(true); });
  rollcallNoneEl.addEventListener('click', function () { setAllRollcall(false); });
  rollcallReasonEl.addEventListener('input', function () {
    state.rollcallReasons[state.rollcallSquad] = rollcallReasonEl.value;
  });
  rollcallCopyEl.addEventListener('click', copyRollcallReport);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('tab-' + btn.dataset.tab);
      panel.classList.add('active');
      playFadeIn(panel);
      searchFabEl.hidden = btn.dataset.tab !== 'overview';
      closeSearch();
      if (btn.dataset.tab === 'tools') {
        backToToolsMenu();
      } else {
        scrollToCurrent(panel);
      }
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

  refreshBtnEl.addEventListener('click', function () { loadData(true); });

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
        backToToolsMenu();
        showUnlock();
      }
    } else if (!state.unlocked) {
      trySilentUnlock();
    }
  });

  searchFabEl.addEventListener('click', openSearch);
  searchCloseEl.addEventListener('click', closeSearch);
  searchBackdropEl.addEventListener('click', closeSearch);
  searchInputEl.addEventListener('input', function () { runSearch(searchInputEl.value); });

  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncSearchViewport);
    window.visualViewport.addEventListener('scroll', syncSearchViewport);
  }

  loadFromCache();
  loadData(false);
  trySilentUnlock();
})();
