---
name: mobile
description: 移動開發。iOS、Android、SwiftUI、Jetpack Compose、React Native、Flutter、跨平臺。當使用者提到移動開發、iOS、Android、跨平臺時路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 移動開發域 · Mobile Development

## 域概覽

```
原生開發                    跨平臺開發
├── iOS (SwiftUI/UIKit)     ├── React Native (JS/TS)
├── Android (Compose/Kotlin) └── Flutter (Dart)
└── 共通：MVVM / 網路層 / 持久化 / 測試
```

---

## iOS 開發

### SwiftUI 核心模式

- View 元件：`struct MyView: View { var body: some View { ... } }`
- State 管理：
  - `@State` — 本地狀態
  - `@Binding` — 父子雙向繫結
  - `@StateObject` — 擁有 ObservableObject
  - `@ObservedObject` — 引用 ObservableObject
  - `@EnvironmentObject` / `@Environment` — 全域性注入
- ObservableObject：`@Published` 屬性自動觸發 UI 更新
- Custom ViewModifier：`struct CardModifier: ViewModifier` + `extension View { func cardStyle() }`
- 生命週期：`.task { await ... }` / `.onAppear` / `.onDisappear`

### UIKit 整合

- UIViewControllerRepresentable：包裝 UIViewController 到 SwiftUI
- UIViewRepresentable：包裝 UIView 到 SwiftUI
- Coordinator 模式：處理 delegate 回撥
- Auto Layout：`NSLayoutConstraint.activate([...])` + `translatesAutoresizingMaskIntoConstraints = false`

### Combine 響應式

- Publisher：`URLSession.shared.dataTaskPublisher` → `map` → `decode` → `eraseToAnyPublisher`
- 訂閱：`.sink(receiveCompletion:receiveValue:)` + `.store(in: &cancellables)`
- 常用 Operators：`debounce` / `removeDuplicates` / `combineLatest` / `flatMap`
- Subject：`PassthroughSubject`（無初始值）/ `CurrentValueSubject`（有初始值）

### iOS 架構

MVVM（推薦）：
- Model：`Codable` 資料結構
- Repository：`protocol` + `async throws` 方法
- ViewModel：`@MainActor class VM: ObservableObject` + `@Published` 屬性
- View：`@StateObject private var viewModel = VM()`

VIPER（複雜場景）：
- View ←→ Presenter ←→ Interactor → Entity
- Router 處理導航

### 網路層

- APIClient：泛型 `func get<T: Decodable>(_ path:) async throws -> T`
- Token 管理：`request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")`
- 錯誤處理：`enum APIError: Error { case invalidURL, invalidResponse, httpError(Int) }`

### 資料持久化

- UserDefaults：`@propertyWrapper struct UserDefault<T>` 簡化訪問
- Keychain：`SecItemAdd` / `SecItemCopyMatching` 儲存敏感資料
- Core Data：`NSPersistentContainer` + `NSManagedObjectContext`
- SwiftData（iOS 17+）：`@Model` 宏簡化持久化

### iOS Checklist

- [ ] SwiftUI 優先，UIKit 按需整合
- [ ] `@MainActor` 確保 UI 執行緒安全
- [ ] async/await 替代回撥
- [ ] 依賴注入提升可測試性
- [ ] LazyVStack/LazyHStack 最佳化大列表
- [ ] 圖片快取（NSCache）減少記憶體壓力
- [ ] Keychain 儲存敏感資料（非 UserDefaults）
- [ ] 單元測試覆蓋 ViewModel + Mock Repository

---

## Android 開發

### Jetpack Compose 核心模式

- Composable：`@Composable fun MyScreen() { ... }`
- State 管理：
  - `remember { mutableStateOf(value) }` — 本地狀態
  - `rememberSaveable` — 跨配置變更儲存
  - `derivedStateOf` — 派生狀態避免重組
- LazyColumn：`items(list, key = { it.id })` 提供穩定 key
- Side Effects：
  - `LaunchedEffect(key)` — 啟動協程
  - `DisposableEffect(key)` — 清理資源（onDispose）
  - `SideEffect` — 同步狀態到外部
  - `snapshotFlow { state }` — 監聽狀態變化轉 Flow
- Navigation：`NavHost` + `composable(route)` + `navController.navigate()`
- Custom Modifier：`fun Modifier.myModifier(): Modifier = composed { ... }`

### ViewModel + StateFlow

- StateFlow（推薦替代 LiveData）：
  - `MutableStateFlow(UiState())` + `.asStateFlow()`
  - `_uiState.update { it.copy(isLoading = true) }`
  - Compose 中：`val uiState by viewModel.uiState.collectAsState()`
- UiState data class：封裝 loading / error / data

### Kotlin Coroutines & Flow

- 協程：`viewModelScope.launch { withContext(Dispatchers.IO) { ... } }`
- 併發：`coroutineScope { val a = async { ... }; val b = async { ... } }`
- Flow：`flow { emit(value) }` + `.flowOn(Dispatchers.IO)`
- StateFlow：`.stateIn(scope, SharingStarted.WhileSubscribed(5000), initial)`
- 搜尋防抖：`searchQuery.debounce(300).filter { it.isNotEmpty() }.flatMapLatest { ... }`
- Channel：`Channel<Event>(BUFFERED)` + `.receiveAsFlow()` 一次性事件

### 依賴注入 (Hilt)

- `@HiltAndroidApp` Application + `@AndroidEntryPoint` Activity
- `@Module @InstallIn(SingletonComponent::class)` 提供依賴
- `@Provides @Singleton` 提供例項 / `@Binds` 繫結介面
- ViewModel：`@HiltViewModel class VM @Inject constructor(repo)` + `hiltViewModel()`

### Room 資料庫

- Entity：`@Entity(tableName)` + `@PrimaryKey` + `@ColumnInfo`
- DAO：`@Query` / `@Insert(onConflict = REPLACE)` / `@Delete` + 返回 `Flow<List<T>>`
- Database：`@Database(entities, version)` + `Room.databaseBuilder`

### 網路層 (Retrofit)

- ApiService：`@GET` / `@POST` / `@Path` / `@Query` / `@Body` / `@Multipart`
- Interceptor：AuthInterceptor 注入 Bearer Token
- OkHttpClient：`addInterceptor` + `connectTimeout`

### Android Checklist

- [ ] Compose 優先，View 系統按需使用
- [ ] StateFlow 替代 LiveData
- [ ] Hilt 依賴注入
- [ ] Room 本地持久化
- [ ] `key` 引數最佳化 LazyColumn
- [ ] `remember` / `derivedStateOf` 避免過度重組
- [ ] Coil 圖片載入 + 快取策略
- [ ] 單元測試覆蓋 ViewModel（runTest + advanceUntilIdle）

---

## 跨平臺開發

### React Native vs Flutter

| 維度 | React Native | Flutter |
|------|--------------|---------|
| 語言 | TypeScript | Dart |
| 渲染 | 原生元件(橋接) | 自繪引擎(Skia) |
| 效能 | 接近原生 | 接近原生 |
| 熱過載 | Fast Refresh | Hot Reload |
| 生態 | npm（成熟） | pub.dev（快速增長） |
| UI 一致性 | 跟隨系統 | 完全一致 |
| 包體積 | ~7MB | ~15MB |

### React Native 核心模式

- 元件：函式元件 + Hooks（useState / useEffect / useCallback / useMemo）
- 列表：`FlatList` + `keyExtractor` + `initialNumToRender` + `windowSize`
- Navigation：`@react-navigation/native` + `createNativeStackNavigator`
- 狀態管理：Redux Toolkit（`createSlice` + `createAsyncThunk`）/ Zustand
- 原生橋接：`NativeModules` 呼叫 iOS(Swift) / Android(Kotlin) 原生程式碼
- 效能：`React.memo` / Hermes 引擎 / 新架構 JSI（無橋接序列化）

### Flutter 核心模式

- Widget：StatelessWidget / StatefulWidget + `setState`
- 狀態管理：
  - Provider：`ChangeNotifier` + `Consumer` / `context.watch`
  - Riverpod（推薦）：`FutureProvider` / `StateNotifierProvider` + `ref.watch`
- Navigation：go_router（`GoRoute` + `context.go/push/pop`）
- 原生橋接：`MethodChannel` + Platform Channels（iOS Swift / Android Kotlin）
- 效能：`const` 建構函式 / `ListView.builder` / `RepaintBoundary` / `ValueKey`

### 選型建議

| 場景 | 推薦 | 理由 |
|------|------|------|
| 團隊有 Web 背景 | React Native | 學習成本低 |
| 追求極致效能/動畫 | Flutter | 自繪引擎 60fps |
| UI 高度定製 | Flutter | 完全控制渲染 |
| 大量原生互動 | React Native | 橋接生態成熟 |
| 需要原生極致體驗 | 原生開發 | 無橋接開銷 |

### 跨平臺 Checklist

- [ ] 選型匹配團隊技術棧和業務需求
- [ ] 列表最佳化：FlatList(RN) / ListView.builder(Flutter) + key
- [ ] 狀態管理：Redux Toolkit(RN) / Riverpod(Flutter)
- [ ] 原生模組橋接方案驗證
- [ ] 包體積最佳化：ProGuard(Android) / tree-shake-icons(Flutter)
- [ ] 效能基線：冷啟動 < 1.5s / 渲染 > 55fps

---

## 通用最佳實踐

| 實踐 | 說明 |
|------|------|
| MVVM 架構 | 分離 UI / 業務邏輯 / 資料層 |
| 依賴注入 | Hilt(Android) / Protocol(iOS) / Context(RN) |
| 響應式狀態 | StateFlow / Combine / Hooks / Riverpod |
| 網路層封裝 | 統一錯誤處理 + Token 管理 + 重試 |
| 本地持久化 | Room / Core Data / AsyncStorage / Hive |
| 列表最佳化 | 懶載入 + 穩定 key + 快取 |
| 測試覆蓋 | ViewModel 單元測試 + UI 測試關鍵流程 |

## 觸發詞

iOS、SwiftUI、UIKit、Combine、Android、Jetpack Compose、Kotlin、React Native、Flutter、跨平臺、移動開發、MVVM
