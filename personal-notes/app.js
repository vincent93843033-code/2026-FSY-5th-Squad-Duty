/* FSY 個人筆記 —— 純前端、純本機（localStorage），不連任何 Google 試算表、不含任何個資。
   由「第五中隊職責查詢」app 複製外觀後改造：拔掉資料來源與協調工具，只留個人筆記。 */
(function () {
  'use strict';

  var STORAGE_KEY = 'fsy_personal_notes_v1';
  var DAY_KEY = 'fsy_personal_notes_day';

  // FSY 通常為 D-1 ~ D-6；要改天數只要改這個陣列。
  var DAYS = ['D-1', 'D-2', 'D-3', 'D-4', 'D-5', 'D-6'];

  var pillsEl = document.getElementById('day-pills');
  var listEl = document.getElementById('notes-list');
  var addBtn = document.getElementById('add-note');

  var state = {
    notes: load(),            // { 'D-1': [ {id, time, text}, ... ], ... }
    day: loadDay()
  };

  // ---- 儲存 ----
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes)); } catch (e) {}
  }
  function loadDay() {
    try {
      var d = localStorage.getItem(DAY_KEY);
      return DAYS.indexOf(d) !== -1 ? d : DAYS[0];
    } catch (e) { return DAYS[0]; }
  }
  function saveDay() {
    try { localStorage.setItem(DAY_KEY, state.day); } catch (e) {}
  }

  function dayNotes(day) {
    if (!state.notes[day]) state.notes[day] = [];
    return state.notes[day];
  }

  // 依時間字串粗略排序；沒填時間的排最後。
  function sortNotes(arr) {
    return arr.slice().sort(function (a, b) {
      var ta = (a.time || '').trim(), tb = (b.time || '').trim();
      if (!ta && !tb) return a.id - b.id;
      if (!ta) return 1;
      if (!tb) return -1;
      if (ta === tb) return a.id - b.id;
      return ta < tb ? -1 : 1;
    });
  }

  // ---- 畫面 ----
  function renderPills() {
    pillsEl.innerHTML = '';
    DAYS.forEach(function (day) {
      var btn = document.createElement('button');
      btn.className = 'day-pill' + (day === state.day ? ' active' : '');
      var count = (state.notes[day] || []).filter(function (n) {
        return (n.text || '').trim();
      }).length;
      btn.textContent = day;
      if (count > 0) {
        var dot = document.createElement('span');
        dot.className = 'pill-count';
        dot.textContent = count;
        btn.appendChild(dot);
      }
      btn.addEventListener('click', function () {
        if (state.day === day) return;
        state.day = day;
        saveDay();
        render();
      });
      pillsEl.appendChild(btn);
    });
  }

  function renderList() {
    listEl.innerHTML = '';
    var notes = sortNotes(dayNotes(state.day));

    if (notes.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = '這天還沒有筆記。點下方「新增筆記」，寫下這個時段你要做什麼、跟誰、去哪裡。';
      listEl.appendChild(empty);
      return;
    }

    notes.forEach(function (note) {
      listEl.appendChild(buildCard(note));
    });
  }

  function buildCard(note) {
    var card = document.createElement('div');
    card.className = 'note-card' + ((note.text || '').trim() ? ' has-note' : '');

    var head = document.createElement('div');
    head.className = 'note-head';

    var timeInput = document.createElement('input');
    timeInput.className = 'note-time';
    timeInput.type = 'text';
    timeInput.placeholder = '時間';
    timeInput.value = note.time || '';
    timeInput.setAttribute('inputmode', 'numeric');

    var del = document.createElement('button');
    del.className = 'note-del';
    del.type = 'button';
    del.setAttribute('aria-label', '刪除這則筆記');
    del.textContent = '✕';

    head.appendChild(timeInput);
    head.appendChild(del);

    var textArea = document.createElement('textarea');
    textArea.className = 'note-text';
    textArea.rows = 2;
    textArea.placeholder = '這個時間我要做什麼？跟誰一起、去哪裡、找誰、要帶什麼…';
    textArea.value = note.text || '';

    card.appendChild(head);
    card.appendChild(textArea);

    // 即時存檔（不重繪，避免游標跳掉）
    timeInput.addEventListener('input', function () {
      note.time = timeInput.value;
      save();
    });
    // 失焦才依時間重新排序
    timeInput.addEventListener('blur', function () { render(); });

    textArea.addEventListener('input', function () {
      note.text = textArea.value;
      var has = !!textArea.value.trim();
      card.classList.toggle('has-note', has);
      save();
      autoGrow(textArea);
      renderPills(); // 更新小隊 pill 上的筆記數
    });

    del.addEventListener('click', function () {
      if ((note.text || '').trim() && !confirm('刪除這則筆記？')) return;
      var arr = dayNotes(state.day);
      var i = arr.indexOf(note);
      if (i !== -1) arr.splice(i, 1);
      save();
      render();
    });

    requestAnimationFrame(function () { autoGrow(textArea); });
    return card;
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function render() {
    renderPills();
    renderList();
  }

  // ---- 新增 ----
  addBtn.addEventListener('click', function () {
    var arr = dayNotes(state.day);
    var note = { id: Date.now(), time: '', text: '' };
    arr.push(note);
    save();
    render();
    // 聚焦剛新增的那張卡（排序後沒填時間的排最後）
    var cards = listEl.querySelectorAll('.note-card');
    var last = cards[cards.length - 1];
    if (last) {
      var ta = last.querySelector('.note-text');
      if (ta) ta.focus();
      last.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });

  render();
})();
