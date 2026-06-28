# 小隊員名冊更新流程（個資加密版）

抽籤、點名、小隊員一覽**三個小工具共用同一份名冊資料**（`state.members`），
因此彼此一定一致；人數、小隊清單、應到人數都是即時從資料推算，沒有寫死。

名冊屬於個資（含生日、支會、房號、性別），所以**不直接放在公開網頁上**，
而是：

```
分隊總表（Google 試算表，私人）
   ↓ 下載成 members.csv
_gen_members.js            → members.json   （明文，僅留本機，已在 .gitignore）
_encrypt.js（需密碼）       → data.enc.json  （加密，公開上傳）
   ↓ commit & push
App 載入 data.enc.json，使用者輸入密碼後於前端解密
```

> `_gen_members.js`、`_encrypt.js`、`members.csv`、`members.json` 都只存在本機
> （見 `.gitignore`），不會、也不應上傳。來源試算表 ID 與解密密碼同樣不放進 repo。

## 名冊有變動時（例如人數增減）怎麼更新

1. 在本機把最新的分隊總表下載成 `members.csv`。
2. 重新產生明文：`node _gen_members.js`（輸出 `members.json`）。
3. 重新加密：`node _encrypt.js`（輸入密碼，輸出 `data.enc.json`）。
4. `git add data.enc.json && git commit && git push`，並合併到 `main`。

## App 端如何即時反映

- App 每次「重新載入頁面」都會帶 `?_t=` 重抓最新的 `data.enc.json`。
- App 已開著時，按右上角「重新整理」鈕，**若已解鎖**，會一併重抓並重新解密
  最新名冊，然後即時重繪目前開啟的小工具——不必整頁重載。
  （仍以 session 內暫存的密碼解密，不會額外公開任何個資。）

因此只要 step 4 推上去，現場手機按一下「重新整理」就會看到新的人數與名單。
