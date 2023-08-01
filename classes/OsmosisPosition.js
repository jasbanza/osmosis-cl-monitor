'use strict';

class OsmosisPosition {
  constructor() {
    this._reset = "";
  }

  _out(colorCode = "", txt = "") {
    console.log(colorCode + txt + this._reset);
  }

  ln() {
    this._out();
  }

  debug(txt) {
    this._out(this._BGyellow + this._black, txt); //magenta
  }

  command(txt) {
    this._out(this._magenta, txt); //magenta
  }

  info(txt) {
    this._out(this._cyan, txt); //cyan
  }

  warn(txt) {
    this._out(this._yellow, txt); //yellow
  }

  error(txt) {
    this._out(this._BGred + this._white, txt); // white red
  }

  success(txt) {
    this._out(this._green, txt); // green
  }

  failure(txt) {
    this._out(this._bright + this._red, txt); // red
  }

}

module.exports = {
  ConsoleLogColors
};
