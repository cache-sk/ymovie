# ymovie wrapper

Wrapper pre ATV - vyuziva mierne upraveny tv client z ymovie zabaleny do android app, ktora ho zobrazuje pomocou webview. Parovanie funguje standardne.

Aplikacia aktualne nieje podpisana, vyuziva sa debug build, pri instalacii je potrebne odsuhlasit neznameho vydavatela.

V aplikacii bude zapracovany version check - releasy budu tu na githube a tu ich bude aj kontrolovat, ci nieje novsi.

---

Modified tv client for android app wrapper

Forked from here: https://gitlab.com/stream-cinema-community/ymovie/-/tree/master

## Compile

```
npm install
npm run build-pack
copy dist/client/tv.html to YmovieWrapper/app/src/main/assets
cd YmovieWrapper
gradle build

result: YmovieWrapper\app\build\outputs\apk\debug\app-debug.apk
```

