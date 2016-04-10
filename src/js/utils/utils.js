export default class Utils {
  static  FormatSeconds(sec) {
    return [this.Pad(~~ (sec / 60)), this.Pad(~~ (sec % 60))].join(':');
  }

  static Pad(n) {
    return n < 10 ? '0'+ n : n;
  }

  static UrlParamDecoder(url) {
    var result = {},
        query = url.substring(1).split('&');

    for(var i = 0; query[i]; i++) {
        var p = query[i].split('=');
        result[p[0]] = p[1];
    }

    return result;
  }
}
