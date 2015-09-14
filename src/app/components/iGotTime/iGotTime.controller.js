const ONE_SECOND = 1000;

class UserListController {
  
  constructor($timeout) {
    this.$timeout       = $timeout;
    this.timer          = this.newTime();
    this.timeoutPromise = {};
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


}

UserListController.$inject = ['$timeout'];

export default UserListController;



