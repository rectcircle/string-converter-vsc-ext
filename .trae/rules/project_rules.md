## 重要提醒

* 修改代码后，小心注意是否遗漏了 import 导入。
* 当你要创建文件时，如果上下文发现该文件已经存在时，请不要使用创建文件工具。
* 如果要执行 npm install 请务必添加 `-D` 参数。

## 生成单测规则

* 该规则仅对 src 目录下的文件生效。
* 本项目使用了 mocha 单测框架、 assert 断言库 （`import assert from 'assert'`）。
* 使用 suite 代替 describe。
* 不要用已经废弃的 assert.equal 而要使用 assert.strictEqual 。
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
* 最后需要在 src/web/test/suite/path/to/index.test.ts 里面导入 src/web/test/suite/path/to/file.test.ts。
