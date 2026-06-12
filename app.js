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
  var rosterCountEl = document.getElementById('roster-count');
  var rosterInputEl = document.getElementById('roster-input');
  var rosterClearEl = document.getElementById('roster-clear');
  var rosterTeamFiltersEl = document.getElementById('roster-team-filters');
  var rosterListEl = document.getElementById('roster-list');
  var rosterEarlyToggleEl = document.getElementById('roster-early-toggle');
  var randomPickBtnEl = document.getElementById('random-pick-btn');
  var randomResultEl = document.getElementById('random-result');

  var state = {
    days: [],
    people: [],
    selectedDay: null,
    lastUpdated: null,
    collapsedDays: {},
    offline: false,
    members: [],
    membersLoaded: false,
    rosterTeam: 5,        // 預設聚焦第五中隊
    rosterGender: 'all',
    rosterEarlyOnly: false,
    rosterQuery: '',
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

  // ---- Tab 3: 小工具 / 小隊員一覽 ----
  function loadMembers() {
    fetch('members.json?_t=' + Date.now())
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.members) return;
        state.members = data.members;
        state.membersMeta = data.meta || {};
        state.membersLoaded = true;
        if (document.getElementById('tab-tools').classList.contains('active')) {
          renderRosterFilters();
          renderRoster();
        }
      })
      .catch(function () {});
  }

  var TEAM_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function teamLabel(t) { return '第' + (TEAM_CN[t] || t) + '中隊'; }

  function renderRosterFilters() {
    if (rosterTeamFiltersEl.childElementCount) return; // build once
    var teams = [];
    state.members.forEach(function (m) { if (teams.indexOf(m.t) === -1) teams.push(m.t); });
    teams.sort(function (a, b) { return a - b; });

    var allChip = document.createElement('button');
    allChip.className = 'roster-chip';
    allChip.textContent = '全部';
    allChip.dataset.team = 'all';
    rosterTeamFiltersEl.appendChild(allChip);

    teams.forEach(function (t) {
      var chip = document.createElement('button');
      chip.className = 'roster-chip';
      chip.textContent = teamLabel(t);
      chip.dataset.team = String(t);
      rosterTeamFiltersEl.appendChild(chip);
    });

    rosterTeamFiltersEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.roster-chip');
      if (!chip) return;
      state.rosterTeam = chip.dataset.team === 'all' ? 'all' : parseInt(chip.dataset.team, 10);
      syncRosterChips();
      renderRoster();
    });
    syncRosterChips();
  }

  function syncRosterChips() {
    rosterTeamFiltersEl.querySelectorAll('.roster-chip').forEach(function (chip) {
      var val = chip.dataset.team === 'all' ? 'all' : parseInt(chip.dataset.team, 10);
      chip.classList.toggle('active', val === state.rosterTeam);
    });
    document.querySelectorAll('.roster-toggle[data-gender]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.gender === state.rosterGender);
    });
    rosterEarlyToggleEl.classList.toggle('active', state.rosterEarlyOnly);
  }

  function memberSearchText(m) {
    return [m.n, teamLabel(m.t), m.s + '小隊', m.a, m.w, m.m ? '成員' : '非成員', m.g,
      m.veg ? '素食' : '', m.early ? '早退' : '', m.r1, m.r2].filter(Boolean).join(' ');
  }

  function filteredMembers() {
    var q = state.rosterQuery.trim();
    var list = state.members.filter(function (m) {
      if (state.rosterTeam !== 'all' && m.t !== state.rosterTeam) return false;
      if (state.rosterGender !== 'all' && m.g !== state.rosterGender) return false;
      if (state.rosterEarlyOnly && !m.early) return false;
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

  function renderRoster() {
    if (!state.membersLoaded) { rosterCountEl.textContent = '載入中…'; return; }
    var list = filteredMembers();
    var scope = state.rosterTeam === 'all' ? '全FSY' : teamLabel(state.rosterTeam);
    rosterCountEl.textContent = scope + ' · ' + list.length + ' 人';

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
    if (m.veg) nameRow.appendChild(makeTag('tag-veg', '素'));
    if (m.early) nameRow.appendChild(makeTag('tag-early', '早退'));
    main.appendChild(nameRow);

    var meta = document.createElement('div');
    meta.className = 'member-meta';
    var bits = [teamLabel(m.t) + ' ' + m.s + '小隊', '隊輔 ' + m.a, m.w];
    if (m.age) bits.push(m.age + '歲');
    meta.innerHTML = bits.map(function (b) { return escapeHtml(b); }).join('<span class="dot">·</span>');
    main.appendChild(meta);

    // expandable detail
    var wrap = document.createElement('div');
    wrap.className = 'member-detail-wrap';
    var detail = document.createElement('div');
    detail.className = 'member-detail';

    var roomTxt = [];
    if (m.r1) roomTxt.push('課程1 ' + m.r1);
    if (m.r2) roomTxt.push('課程2 ' + m.r2);
    detail.appendChild(makeDetailRow('Day3 課程教室', roomTxt.length ? roomTxt.join('、') : '未公布'));
    detail.appendChild(makeDetailRow('身分', m.m ? '成員' : '非成員（朋友）'));
    detail.appendChild(makeDetailRow('支會', m.w || '—'));
    if (m.age) detail.appendChild(makeDetailRow('年齡', m.age + ' 歲'));
    if (m.veg) detail.appendChild(makeDetailRow('飲食', '素食'));
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

  function pickRandomMember() {
    if (!state.membersLoaded) return;
    var pool = filteredMembers();
    randomResultEl.innerHTML = '';
    if (!pool.length) {
      var e = document.createElement('div');
      e.className = 'roster-empty';
      e.textContent = '目前篩選範圍沒有人可抽';
      randomResultEl.appendChild(e);
      return;
    }
    var m = pool[Math.floor(Math.random() * pool.length)];
    var card = document.createElement('div');
    card.className = 'random-pick-card ' + (m.g === '男' ? 'male' : 'female');
    card.classList.add(m.g === '男' ? 'male' : 'female');
    card.style.setProperty('--mc', m.g === '男' ? '#3b78c2' : '#d36a93');
    var name = document.createElement('div');
    name.className = 'random-pick-name';
    name.textContent = m.n;
    var meta = document.createElement('div');
    meta.className = 'random-pick-meta';
    meta.textContent = teamLabel(m.t) + ' · ' + m.s + '小隊 · 隊輔' + m.a;
    card.appendChild(name);
    card.appendChild(meta);
    randomResultEl.appendChild(card);
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
  document.querySelectorAll('.roster-toggle[data-gender]').forEach(function (b) {
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
  randomPickBtnEl.addEventListener('click', function () {
    randomPickBtnEl.classList.remove('rolling');
    void randomPickBtnEl.offsetWidth;
    randomPickBtnEl.classList.add('rolling');
    setTimeout(pickRandomMember, 250);
  });

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
        if (state.membersLoaded) { renderRosterFilters(); renderRoster(); }
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
    if (!document.hidden) loadData(false);
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
  loadMembers();
})();
