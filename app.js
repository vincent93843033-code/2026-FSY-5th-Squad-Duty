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

  var state = {
    days: [],
    people: [],
    selectedDay: null,
    lastUpdated: null,
    collapsedDays: {},
    offline: false,
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
        state.collapsedDays[day.index] = day.index !== state.selectedDay;
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

  function buildPersonChips(people, excludePerson, currentPerson) {
    var chipRow = document.createElement('div');
    chipRow.className = 'chip-row';
    Object.keys(people).forEach(function (name) {
      if (name === excludePerson) return;
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

    var time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = row.time;
    card.appendChild(time);

    var title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = row.activity;
    card.appendChild(title);

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
  }

  function renderOverviewTab() {
    overviewContentEl.innerHTML = '';
    var day = state.days.filter(function (d) { return d.index === state.selectedDay; })[0];
    if (!day) return;
    var now = getNow();

    var title = document.createElement('div');
    title.className = 'day-section-title';
    title.textContent = day.label;
    overviewContentEl.appendChild(title);

    day.rows.forEach(function (row) {
      overviewContentEl.appendChild(buildActivityCard(row, null, day.label, now));
    });

    playFadeIn(overviewContentEl);
  }

  function playFadeIn(el) {
    el.classList.remove('fade-in');
    void el.offsetWidth;
    el.classList.add('fade-in');
  }

  function scrollToCurrent(container) {
    if (!container) return;
    var el = container.querySelector('.activity-card.current');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('tab-' + btn.dataset.tab);
      panel.classList.add('active');
      playFadeIn(panel);
      scrollToCurrent(panel);
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

  loadFromCache();
  loadData(false);
})();
