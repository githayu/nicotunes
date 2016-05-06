export default class Utils {
  static  FormatSeconds(sec) {
    return [this.Pad(~~ (sec / 60)), this.Pad(~~ (sec % 60))].join(':');
  }

  static FormatDateString(str) {
    let d = new Date(str),
        year = this.Pad(d.getFullYear()),
        month = this.Pad(d.getMonth() + 1),
        date = this.Pad(d.getDate()),
        hours = this.Pad(d.getHours()),
        minutes = this.Pad(d.getMinutes()),
        seconds = this.Pad(d.getSeconds());

    return `${year}年${month}月${date}日 ${hours}:${minutes}:${seconds}`;
  }

  static Pad(n) {
    return n < 10 ? '0'+ n : n;
  }

  static UrlParamDecoder(url) {
    var result = {},
        query = (url.startsWith('?') ? url.substring(1) : url).split('&');

    for(var i = 0; query[i]; i++) {
        var p = query[i].split('=');
        result[p[0]] = p[1];
    }

    return result;
  }

  static CapitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
