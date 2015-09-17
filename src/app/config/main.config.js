const FONT_SIZE_SETTING = '22px';

function appConfig(iGotTimeConfigProvider){
	
	iGotTimeConfigProvider.setFontSize(FONT_SIZE_SETTING); //set font-size

}


appConfig.$inject = ['iGotTimeConfigProvider'];

export default appConfig;
