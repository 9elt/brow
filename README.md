# brow
A scripting language to automate chromium

### example

A script to automate youtube search and play

```
$ search = @ read {search youtube};

@ goto {https://youtube.com}
    | @ log  {cannot open youtube}
    : @ exit {1};

@ click {input}
    | @ log  {no search bar}
    : @ exit {1};

@ type {$ search};

@ press {Enter};

$ selector = {.ytd-item-section-renderer a#video-title};

@ wait {$ selector}
    | @ log {no videos found}
    : @ exit {1};

$ found
    = @ browser {document.querySelectorAll('$ selector').length};

@ log {we found $ found results};

@ click {$ selector};
```
