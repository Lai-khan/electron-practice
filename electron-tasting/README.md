# Build a Desktop App with Electron in 11 minutes

### 참고 영상

https://www.youtube.com/watch?v=3yqDxhR2XxE&t=136s



## 공부 내용 및 과정

1. npx 실행

   ```javascript
   npx create-electron-app electron-tasting
   ```

   - 중간에 `Installing NPM Dependencies` 과정에서 `An unhandled error has occurred inside Forge...` 에러가 났음. 다음 2가지 방법을 실행 후 문제 해결
     1. `npm uninstall -g create-electron-app` 실행.
     2. Node도 최신 LTS 버전으로 업데이트 함. `v14.16.1`
   - 둘 중 뭐가 문제 해결에 영향을 줬는지는 모르겠음.

2. `npm start` 시 프로그램 실행할 수 있음.

3. 파일 수정하고 `rs` 입력하면 restart함.

4. 모든 Electron 앱은 하나의 main process를 가지고 있음. (여기서는 index.js 파일)

5. electron에서 `app`과 `BrowserWindow` 두가지를 import 함.

   - app은 앱의 lifecycle을 컨트롤

   - ```javascript
     app.on('ready', createWindow);
     ```

     app이 ready 상태일 때, 실행됨. 

     어떤 API들은 이 이벤트가 실행된 뒤에만 사용할 수 있음. 

     여기에 initialization 로직을 넣으면 됨.

     electron Forge는 세팅을 이미 해놓음.

   - ```javascript
     app.on('window-all-closed', () => {
     	if (process.platform !== 'darwin') {
     		app.quit();
     	}
     });
     ```

     위 코드는 창이 모두 닫혔을 때 일어나는 이벤트다.

     Mac은 Window에 비해 더 다양한 운영체제 동작을 가지고 있기 때문에 process platform을 체크하는 코드가 있어야 한다.

     `process.platform`은 electron이 제공하는 특별한 값이다.

     Mac은 보통 Darwin이고 Window는 win32다.

   - 앱은 여러개의 랜더링 프로세스를 가질 수 있다.

     각 랜더링 프로세스는 Chromium 인스턴스이므로, 각 랜더링 프로세스는 브라우저의 탭 또는 창이 된다.

     브라우저를 생성할 수 있고, 이때 여러 옵션을 설정할 수 있다.

     여기서는 node integration을 true로 설정한다.

     그러면 FE 코드에서 node.js에 글로벌하게 접근할 수 있다.

     ```javascript
     const createWindow = () => {
     	// Create the browser window.
     	const mainWindow = new BrowserWindow({
     		width: 800,
     		height: 600,
     		webPreferences: {
     			nodeIntegration: true,
     		},
     	});
         
     	// and load the index.html of the app.
     	mainWindow.loadFile(path.join(__dirname, 'index.html'));
     
     	// Open the DevTools.
     	mainWindow.webContents.openDevTools();
     };
     ```

     이러면 이제 파일을 index.html에 로드할 수 있다.

6. render.js 생성 - index.html에 연결

   ```html
   <script defer src="render.js"></script>
   ```

   이때, `defer` 속성을 앞에 붙여서 JS가 HTML 다음에 로드되게 해라.

7. index.html에서

   - body에 video 볼수 있는 element 생성.

   - Button 3개 추가

8. [render.js~] html에서 만들었던 video, button element 가져옴

9. 가져올 수 있는 모든 스크린 불러오는 함수

   electron에서 desktop capture module 제공.

   브라우저에 Node.js 모듈을 가져옴.

   버튼에 대한 클릭 이벤트 만들고 함수 생성

   ```javascript
   videoSelectBtn.onclick = getVideoSources;
   ```

10. 유저의 컴퓨터에서 기록할 수 있는 window나 screen을 가져온다. (async-await로)

    https://www.electronjs.org/docs/api/desktop-capturer

11. 기록하고 싶은 스크린을 선택해서 가져올 수 있게 하는 함수 구현

    electron은 menu class를 가지고 있지만, main process에서만 동작하도록 설계되었다.

    remote란 모듈을 사용해 main process에서 thing(?)에 접근할 수 있다.

    즉, FE 코드에서 직접 메뉴를 만들 수 있다.

12. 기록할 스크린을 바꾸는 함수 생성

    브라우저에 내장된 내비게이터 API를 사용해 스트리밍 비디오 생성.

    비디오 출력 스트림을 제공.

13. [Trouble Shooting] desktopCapturer가 제대로 access 되지 않음

    `cannot access desktopCapturer before initialization`

    그외에 이런 문제도 발생. `Uncaught ReferenceError: require is not defined`

    [참고링크](https://stackoverflow.com/questions/55093700/electron-5-0-0-uncaught-referenceerror-require-is-not-defined) 보고 해결

     - script 파일 body 뒤로

     - window 만들때 webPreferences에 다음 옵션 추가 (밑에 2개)

       ```javascript
       webPreferences: {
           nodeIntegration: true,
           contextIsolation: false,
           enableRemoteModule: true,
       },
       ```

    - Electron 12.0.0부턴 `contextIsolation: false`를 적용해야 한다고 함.

14. MediaRecorder 생성

    인자로 stream과 비디오 옵션 넘김.

15. 이벤트 핸들러 등록

    녹화 시작이면 모든 기록을 저장하는 이벤트를 , 종료면 비디오 파일을 저장하는 이벤트를

16. 비디오를 저장할 경로와 비디오 이름을 지정하고 FS 모듈을 사용해 비디오 저장



## 후기

대충 Electron이 어떤 건지는 알았다.

다만 해당 영상이 현 시점으로부터 1년전의 영상임에도 불구하고 몇몇 코드들은 낡아서 제대로 작동하지 않는 것으로 보인다.

실제로 해당 앱을 만든후 화면 녹화는 전혀 작동하지 않았다.

```
electron/js2c/renderer_init.js:13 (electron) The remote module is deprecated. Use https://github.com/electron/remote instead.
```

remote 모듈이 deprecated 되었다고 다른 것을 쓰라고 한다.



적당히 빠르게 Electron이 뭔지 감을 잡기에는 괜찮아보인다.