#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// use std::net::TcpListener;
// use std::net::TcpStream;
// use std::thread;
// use std::time::Duration;

mod cmd;

fn main() {
  // let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

  // for stream in listener.incoming() {
  //   let stream = stream.unwrap();

  //   println!("Connection established!");
  // }
  tauri::AppBuilder::new()
    .invoke_handler(|_webview, arg| {
      use cmd::Cmd::*;
      match serde_json::from_str(arg) {
        Err(e) => Err(e.to_string()),
        Ok(command) => {
          match command {
            // definitions for your custom commands from Cmd here
            MyCustomCommand { argument } => {
              //  your command code
              println!("{}", argument);
            }
          }
          Ok(())
        }
      }
    })
    .build()
    .run();
}

// use vibe::ThreadPool;

// fn server() {
//   let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
//   let pool = ThreadPool::new(4);

//   for stream in listener.incoming() {
//     let stream = stream.unwrap();

//     pool.execute(|| {
//       handle_connection(stream);
//     });
//   }
// }

// fn handle_connection(mut stream: TcpStream) {
//   // --snip--

//   let get = b"GET / HTTP/1.1\r\n";
//   let sleep = b"GET /sleep HTTP/1.1\r\n";

//   let (status_line, filename) = if buffer.starts_with(get) {
//     ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
//   } else if buffer.starts_with(sleep) {
//     thread::sleep(Duration::from_secs(5));
//     ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
//   } else {
//     ("HTTP/1.1 404 NOT FOUND\r\n\r\n", "404.html")
//   };

//   // --snip--
// }
