const ONE_SECOND = 1000;

class UserListController {
  
  constructor($timeout, iGotTimeConfig) {
    this.$timeout       = $timeout;
    this.timer          = this.newTime();
    this.timeoutPromise = {};
    this.iGotTimeConfig = iGotTimeConfig;
    
    
    //test provider is ok : set font size :
    this.setFontSize('42px');
    //let's go infinite count :
    this.oneAnotherSec();
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

UserListController.$inject = [
  '$timeout',
  'iGotTimeConfig'
];

export default UserListController;


