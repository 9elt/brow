# brow

A scripting language to automate chromium

#### usage

```
$ git clone https://github.com/9elt/brow
$ cd brow
$ bun i
```

close all chromium windows, then run
```
$ chromium --remote-debugging-port=21222
```

then
```
$ bun ./index.js ./example
```

this [run](./run) script should work on linux
