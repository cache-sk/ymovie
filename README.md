# ymovie wrapper

Modified tv client for android app wrapper

Forked from here: https://gitlab.com/stream-cinema-community/ymovie/-/tree/master

## Compile

```
npm install
npm run build-pack
copy dist/client/tv.html to YmovieWrapper/app/src/main/assets
cd YmovieWrapper
gradle build

result: YmovieWrapper\app\build\outputs\apk\release\app-release-unsigned.apk
```

