fn main() {
    // 普通字符串
    println!("hello world");
    
    // 原生字符串
    println!(r#"raw string with "quotes" inside"#);
    println!(r#"raw string with \n no escaped"#);
    println!(r##"raw string with # delimiters"##);
    
    // 字节字符串
    println!(b"byte string");
    
    // 包含转义字符的字符串
    println!("string with \n newline");
    println!("string with \" quotes");
    
    // Unicode字符串
    println!("unicode string: \u{0061}");
    
    // 十六进制转义
    println!("hex escape: \x61");
    
    // jwt
    println!("eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw");
    println!(r"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw");
    println!(r#"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw"#);
    println!(r##"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw"##);
}
