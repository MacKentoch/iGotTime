const FONT_SIZE_SETTING 			= 52;
const FONT_SIZE_UNIT_SETTING 	= 'px';


function appConfig(iGotTimeConfigProvider){
	iGotTimeConfigProvider.setFontSize(FONT_SIZE_SETTING, FONT_SIZE_UNIT_SETTING);
}


appConfig.$inject = ['iGotTimeConfigProvider'];

export default appConfig;
