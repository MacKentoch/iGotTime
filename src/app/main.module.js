import './vendor';
import iGotTimeModule from './components/iGotTime/iGotTime.module';

const MAIN_MODULE_NAME = 'demoApp';

let mainModule = angular.module(MAIN_MODULE_NAME, [iGotTimeModule.name]);

export default mainModule;