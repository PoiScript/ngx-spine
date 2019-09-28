# ngx-spine

[![Build Status](https://travis-ci.org/PoiScript/ngx-spine.svg?branch=master)](https://travis-ci.org/PoiScript/ngx-spine)

Display Spine skeletal animation in Angular.

## Spine Support

`ngx-spine` supports both `json` and `skel` formats.

`ngx-spine` is built upon `spine-ts` 3.8, but it also supports Spine 3.6.x and
3.7.x.

## Install

``` sh
# using npm
$ npm -i ngx-spine
# or yarn
$ yarn add ngx-spine
```

## Usage

``` typescript
import { NgxSpineModule } from "ngx-spine";

@NgModule({
  imports: [
    NgxSpineModule,
    /// ...
  ],
  /// ...
})
export class AppModule {}

```

``` html
<ngx-spine-webgl
  <!-- string, selected animation -->
  [(animation)]="animation" 
  <!-- string[], available animations -->
  [(animations)]="animations"
  <!-- string, selected skin -->
  [(skin)]="skin"
  <!-- string[], available skin -->
  [(skins)]="skins"
  <!-- object, urls of skeleton data -->
  <!-- scheme: { json: '', atlas: '' } or { skel: '', atlas: '' } -->
  [dataUrls]="dataUrls"
  <!-- number, animation replay speed -->
  [speed]="speed"
></ngx-spine-webgl>
```
