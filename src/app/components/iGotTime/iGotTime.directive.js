import iGotTimeController from './iGotTime.controller';
import iGotTimeTemplate from "./iGotTimeTemplate.html!text";


function iGotTimeDirective() {
  return {
    restrict: "E",
    scope: {},
    template: iGotTimeTemplate,
    bindToController: true,
    controllerAs: "iGotTimeCtrl",
    controller: iGotTimeController,
    link: function(scope, element, attrs, ctrl, transclude) {
       
      element.on('click', function(){
        alert('don\'t tap this timer, it is delicate!');
      });
      
    }
  };
}

iGotTimeDirective.$inject = [];

export default iGotTimeDirective;