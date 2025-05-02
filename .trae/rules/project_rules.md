## 修改代码规则

* 修改代码时不要忘记，使用 import 语句导入相关符号。

## 生成文件规则

* 当你要创建文件时，如果上下文发现该文件已经存在时，请不要使用创建文件工具。

## 生成单测规则

* 该规则仅对 src 目录下的文件生效。
* 本项目使用了 mocha 单测框架、 assert 断言库。
* 使用  suite 代替 describe。
* src/path/to/file.ts 对应的单测文件为 src/web/test/suite/path/to/file.test.ts。
* 测试文件结构如下：

    ```ts
    suite('src/path/to/file.ts', () => {
        suite('待测函数...', () => {
            test('测试样例描述...', () => {
                assert.equal(1, 1);
            });
        });
    });
    ```
