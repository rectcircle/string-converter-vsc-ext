public class Main {
    public static void main(String[] args) {
        // 测试空字符串
        System.out.println("");
        
        
        // 测试简单字符串
        System.out.println("hello");
        
        // 测试转义字符
        System.out.println("\"hello\"");
        System.out.println("\"hello");
        System.out.println("string with \\ backslash");
        System.out.println("string with \" quote");
        System.out.println("string with \"world\"");
        System.out.println("string with \b backspace");
        System.out.println("string with \f form feed");
        System.out.println("string with \n newline");
        System.out.println("string with \r carriage return");
        System.out.println("string with \t tab");
        System.out.println("string with \s space");
        
        // 测试Unicode转义
        System.out.println("string with \u0061 unicode");
        
        // 测试八进制转义
        System.out.println("string with \141 octal");
        
        // 测试无效转义
        System.out.println("string with \q invalid escape");
        
        // 测试不完整的转义序列
        System.out.println("string with \ invalid escape");
        
        // 测试Text Blocks
        System.out.println("""
            多行文本块
            第二行内容
            """);
            
        System.out.println("""
            带转义换行的文本块
            line1\
            line2
            """);
            
        System.out.println("""
            带最小缩进的文本块
                line1
            line2
                """);
            
        System.out.println("""
            包含转义字符的文本块
            \" 双引号 \n      换行符 \t 制表符
            """);
        
        // jwt
        System.out.println("eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw");
        System.out.println("""
        eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw
        """);
    }
}