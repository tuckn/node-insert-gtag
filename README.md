# Node.js: insert-gtag

Node.js CLI to insert a Google Analytics (gtag.js) or Tag Manager code into your HTML files.

## Installation

```console
npm install -g @tuckn/insert-gtag
```

or download a [released binary file](https://github.com/tuckn/node-insert-gtag/releases).

## Usage

## Adding Google Analytics Code

on CLI

```console
$ insert-gtag analytics --help
Usage: insert-gtag analytics [options] <dirPath> <trackingId>

Insert Google Analytics code (gtag.js) in html files

Options:
  -V, --version                output the version number
  -M, --matched-reg-exp <exp>  RegExp pattern of extensions of file to be inserted. Default.
                               "\.html?$"
  -I, --ignored-reg-exp <exp>  RegExp pattern of file to be exclude. Ex. "[_\-.]cache\d+"
  -N, --indents <number>       Number of indenting white spaces. Default: 4
  -h, --help                   display help for command
```

The below is example.

```console
$ insert-gtag analytics "D:\HtmlDir1" "UA-XXXXXX-Y"
done

$ insert-gtag analytics "D:\HtmlDir2" --indents 2 "UA-XXXXXX-Y" "AW-XXXXXXXXXX"
done
```

on Node.js

```js
const { insertGtagCode } = require('@tuckn/insert-gtag');

await insertGtagCode('D:\\HtmlDir', 'UA-9999-9', {
  ignoredRegExp: 'Excluding Name',
});
```

## Adding Google Tag Manager

on CLI

```console
$ insert-gtag tag-manager --help
Usage: insert-gtag tag-manager [options] <dirPath> <gtmId>

Insert Google Tag Manager code in html files

Options:
  -V, --version                output the version number
  -M, --matched-reg-exp <exp>  RegExp pattern of extensions of file to be inserted. Default.
                               "\.html?$"
  -I, --ignored-reg-exp <exp>  RegExp pattern of file to be exclude. Ex. "[_\-.]cache\d+"
  -N, --indents <number>       Number of indenting white spaces. Default: 4
  -h, --help                   display help for command
```

The below is example.

```console
$ insert-gtag tag-manager "D:\HtmlDir" "GTM-XXXXXXX"
```

on Node.js

```js
const { insertGTagManagerCode } = require('@tuckn/insert-gtag');

await insertGTagManagerCode('D:\\HtmlDir', 'GTM-XXXXXXX', {
  ignoredRegExp: 'Excluding Name',
});
```

## Documentation

See all specifications [here](https://docs.tuckn.net/node-insert-gtag).

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
