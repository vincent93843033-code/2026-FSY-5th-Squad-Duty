(function () {
  'use strict';

  var ZHIZE_ID = '111PFK5yJzpJsqz42PEu9-6yTg0unJNulxaylXkrK_ig';
  var ZHIZE_SHEET = '職責';
  var XILIU_ID = '12CTMEcUgrVAelFydZUAtMC0_2B46c-nAXX7mhTkdO_Y';
  var XILIU_SHEET = '中文細流';
  var REFRESH_INTERVAL_MS = 5 * 60 * 1000;
  var STORAGE_KEY = 'fsy5_my_name';

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
  };

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
        current = idx ? { label: col0, rows: [] } : null;
        if (idx) days[idx] = current;
        continue;
      }
      if (!current) continue;
      if (isActivityRow(col0)) {
        current.rows.push({
          time: col0,
          activity: (row[1] || '').trim(),
          location: (row[5] || '').trim(),
        });
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
          people: zr ? zr.people : {},
        };
      });
      zMap.forEach(function (zr) {
        joined.push({ time: zr.time, activity: zr.activity, location: '', people: zr.people });
      });
      var label =
        (xiliu.days[d] && xiliu.days[d].label) ||
        (zhize.days[d] && zhize.days[d].label) ||
        ('D-' + d);
      result.push({ index: d, label: label, rows: joined });
    }
    return result;
  }

  function fetchCsvRows(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function (text) {
      return Papa.parse(text, { skipEmptyLines: true }).data;
    });
  }

  function detectTodayDayIndex() {
    var now = new Date();
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

  function loadData(isManual) {
    if (isManual) refreshBtnEl.classList.add('spinning');
    statusTextEl.textContent = '資料更新中…';
    return Promise.all([
      fetchCsvRows(buildCsvUrl(ZHIZE_ID, ZHIZE_SHEET)),
      fetchCsvRows(buildCsvUrl(XILIU_ID, XILIU_SHEET)),
    ]).then(function (results) {
      var zhize = parseZhize(results[0]);
      var xiliu = parseXiliu(results[1]);
      state.people = zhize.people;
      state.days = buildJoinedDays(zhize, xiliu);
      if (state.selectedDay === null) {
        state.selectedDay = detectTodayDayIndex() || 1;
      }
      state.lastUpdated = new Date();
      populatePersonSelect();
      renderDayPills();
      renderMeTab();
      renderOverviewTab();
      updateStatus(null);
    }).catch(function (err) {
      console.error(err);
      if (state.days.length === 0) {
        var banner = '<div class="error-banner">資料載入失敗，請檢查網路連線後按右上角「重新整理」。</div>';
        meContentEl.innerHTML = banner;
        overviewContentEl.innerHTML = banner;
      }
      updateStatus(err);
    }).finally(function () {
      refreshBtnEl.classList.remove('spinning');
    });
  }

  function updateStatus(err) {
    var timeStr = state.lastUpdated
      ? state.lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '尚未成功';
    if (err) {
      statusTextEl.textContent = '更新失敗，顯示上次資料（' + timeStr + '）';
    } else {
      statusTextEl.textContent = '資料更新時間：' + timeStr;
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

  function buildActivityCard(row, highlightPerson) {
    var card = document.createElement('div');
    var hasAssignments = Object.keys(row.people).length > 0;
    card.className = 'activity-card' + (hasAssignments ? '' : ' muted');

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
    } else if (hasAssignments) {
      var chipRow = document.createElement('div');
      chipRow.className = 'chip-row';
      Object.keys(row.people).forEach(function (name) {
        var chip = document.createElement('span');
        var isMe = name === personSelectEl.value;
        chip.className = 'chip' + (isMe ? ' chip-me' : '');
        var personNote = row.people[name];
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
      card.appendChild(chipRow);
    }

    return card;
  }

  function renderMeTab() {
    var person = personSelectEl.value;
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
      section.className = 'day-section';
      var title = document.createElement('div');
      title.className = 'day-section-title';
      title.textContent = day.label;
      section.appendChild(title);

      var items = day.rows.filter(function (r) { return r.people[person]; });
      if (items.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-note';
        empty.textContent = '本日沒有特別職責';
        section.appendChild(empty);
      } else {
        items.forEach(function (r) {
          section.appendChild(buildActivityCard(r, person));
        });
      }
      meContentEl.appendChild(section);
    });
  }

  function renderOverviewTab() {
    overviewContentEl.innerHTML = '';
    var day = state.days.filter(function (d) { return d.index === state.selectedDay; })[0];
    if (!day) return;

    var title = document.createElement('div');
    title.className = 'day-section-title';
    title.textContent = day.label;
    overviewContentEl.appendChild(title);

    day.rows.forEach(function (row) {
      overviewContentEl.appendChild(buildActivityCard(row, null));
    });
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
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

  setInterval(function () { loadData(false); }, REFRESH_INTERVAL_MS);

  loadData(false);
})();
