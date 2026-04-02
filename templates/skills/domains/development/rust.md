---
name: rust
description: Rust 開發。系統程式設計、記憶體安全、高效能、WebAssembly。當使用者提到 Rust、Cargo、tokio、記憶體安全時使用。
---

# 📜 符籙秘典 · Rust


## 基礎語法

### 所有權系統
```rust
fn main() {
    // 所有權轉移
    let s1 = String::from("hello");
    let s2 = s1;  // s1 不再有效
    // println!("{}", s1);  // 編譯錯誤

    // 借用
    let s3 = String::from("world");
    let len = calculate_length(&s3);  // 借用
    println!("{} has length {}", s3, len);  // s3 仍有效

    // 可變借用
    let mut s4 = String::from("hello");
    change(&mut s4);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}
```

### 結構體與列舉
```rust
// 結構體
struct User {
    name: String,
    email: String,
    active: bool,
}

impl User {
    fn new(name: String, email: String) -> Self {
        Self { name, email, active: true }
    }

    fn deactivate(&mut self) {
        self.active = false;
    }
}

// 列舉
enum Result<T, E> {
    Ok(T),
    Err(E),
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

// 模式匹配
fn handle_message(msg: Message) {
    match msg {
        Message::Quit => println!("Quit"),
        Message::Move { x, y } => println!("Move to ({}, {})", x, y),
        Message::Write(text) => println!("Write: {}", text),
    }
}
```

### 錯誤處理
```rust
use std::fs::File;
use std::io::{self, Read};

// Result 處理
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // ? 運算子
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// 自定義錯誤
#[derive(Debug)]
enum AppError {
    IoError(io::Error),
    ParseError(String),
}

impl From<io::Error> for AppError {
    fn from(err: io::Error) -> Self {
        AppError::IoError(err)
    }
}
```

## 非同步程式設計

### Tokio
```rust
use tokio;

#[tokio::main]
async fn main() {
    let result = fetch_data().await;
    println!("{:?}", result);
}

async fn fetch_data() -> Result<String, reqwest::Error> {
    let resp = reqwest::get("https://api.example.com/data")
        .await?
        .text()
        .await?;
    Ok(resp)
}

// 併發執行
async fn fetch_all(urls: Vec<&str>) -> Vec<String> {
    let futures: Vec<_> = urls.iter()
        .map(|url| fetch_url(url))
        .collect();

    futures::future::join_all(futures).await
}

// Channel
use tokio::sync::mpsc;

async fn channel_example() {
    let (tx, mut rx) = mpsc::channel(32);

    tokio::spawn(async move {
        tx.send("hello").await.unwrap();
    });

    while let Some(msg) = rx.recv().await {
        println!("Received: {}", msg);
    }
}
```

## Web 框架

### Axum
```rust
use axum::{
    routing::{get, post},
    Router, Json, extract::Path,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
}

async fn get_user(Path(id): Path<u64>) -> Json<User> {
    Json(User { id, name: "Alice".to_string() })
}

async fn create_user(Json(user): Json<User>) -> Json<User> {
    Json(user)
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/users/:id", get(get_user))
        .route("/users", post(create_user));

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

### Actix-web
```rust
use actix_web::{web, App, HttpServer, HttpResponse};

async fn get_user(path: web::Path<u64>) -> HttpResponse {
    HttpResponse::Ok().json(User { id: *path, name: "Alice".to_string() })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/users/{id}", web::get().to(get_user))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

## CLI 工具

### Clap
```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "myapp")]
#[command(about = "My CLI application")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Start the server
    Serve {
        #[arg(short, long, default_value = "8080")]
        port: u16,
    },
    /// Run a task
    Run {
        #[arg(short, long)]
        name: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Serve { port } => {
            println!("Starting server on port {}", port);
        }
        Commands::Run { name } => {
            println!("Running task: {}", name);
        }
    }
}
```

## 測試

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(1, 2), 3);
    }

    #[test]
    #[should_panic(expected = "divide by zero")]
    fn test_divide_by_zero() {
        divide(1, 0);
    }

    #[tokio::test]
    async fn test_async_fetch() {
        let result = fetch_data().await;
        assert!(result.is_ok());
    }
}
```

```bash
cargo test
cargo test --release
cargo test -- --nocapture  # 顯示輸出
```

## 專案結構

```
myproject/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── models/
│   │   └── mod.rs
│   └── utils/
│       └── mod.rs
├── tests/
│   └── integration_test.rs
└── benches/
    └── benchmark.rs
```

## 常用庫

| 庫 | 用途 |
|---|------|
| tokio | 非同步執行時 |
| axum/actix-web | Web 框架 |
| serde | 序列化 |
| reqwest | HTTP 客戶端 |
| sqlx | 資料庫 |
| clap | CLI |
| tracing | 日誌 |

---

