const ONE_SECOND = 1000;

class iGotTimeController {
  
  constructor($timeout, iGotTimeConfig) {
    this.$timeout       = $timeout;    
    this.iGotTimeConfig = iGotTimeConfig;
       
    this.init();
    //let's go infinite count :
    this.oneAnotherSec();
  }
  
  init() {
    this.timer          = this.newTime();    
    this.timeoutPromise = {};
    
    this.setFontSize('42px');    
    this.fontSize     = this.iGotTimeConfig.getFontSize();
  }
  
  newTime() {
    return new Date();
  }  

  oneAnotherSec(){
    this.timer = this.newTime();
    //cancel previous timeout before starting another (NOTE : $timeout return promise)
    if (this.timeoutPromise) this.$timeout.cancel(this.timeoutPromise);
    this.timeoutPromise = this.$timeout(() => this.oneAnotherSec(), ONE_SECOND);
  }
  
  setFontSize(fontSize) {
    console.info(`using provider from controller setting font to ${fontSize}`);
    this.iGotTimeConfig.setFontSize(fontSize);
  }

}

iGotTimeController.$inject = [
  '$timeout',
  'iGotTimeConfig'
];

export default iGotTimeController;


