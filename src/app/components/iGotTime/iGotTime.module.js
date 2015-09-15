import iGotTimeDirective from './iGotTime.directive';
import iGotTimeConfigProvider from './iGotTime.provider';


const I_GOT_TIME_MODULE_NAME 			= 'iGotTime';
const I_GOT_TIME_CONFIG_PROVIDER 	= 'iGotTimeConfig';


export default angular
                .module(I_GOT_TIME_MODULE_NAME, [])
                .directive(I_GOT_TIME_MODULE_NAME, iGotTimeDirective)
	              .provider(I_GOT_TIME_CONFIG_PROVIDER, iGotTimeConfigProvider);

