import './vendor';
import iGotTimeModule from './components/iGotTime/iGotTime.module';
import appConfig from './config/main.config';

const MAIN_MODULE_NAME = 'demoApp';

let mainModule = angular
										.module(MAIN_MODULE_NAME, [iGotTimeModule.name])
										.config(appConfig);

export default mainModule;