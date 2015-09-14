import iGotTimeDirective from './iGotTime.directive';

const I_GOT_TIME_MODULE_NAME = 'iGotTime';

export default angular
                .module(I_GOT_TIME_MODULE_NAME, [])
                .directive(I_GOT_TIME_MODULE_NAME, iGotTimeDirective);