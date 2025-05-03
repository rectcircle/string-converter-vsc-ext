package main

import "fmt"

func main() {
	// 测试解释型字符串
	fmt.Println("解释型字符串")
	fmt.Println("包含转义字符: \\ \" \n \t \x41 \u0041 \U00000041")
	fmt.Println("多行\n字符串")

	// 测试原始字符串
	fmt.Println(`原始字符串`)
	fmt.Println(`可以包含换行
和特殊字符如 \ " `)
	fmt.Println(`也可以包含多行
内容`)

	// 测试无效转义
	fmt.Println("无效转义序列: \q")
}