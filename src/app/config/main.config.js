
function appConfig(iGotTimeConfigProvider){
	let fontSizeFromConfig = '22px';
	
	iGotTimeConfigProvider.setFontSize(fontSizeFromConfig);
	console.info(`from app config, setting font size = ${fontSizeFromConfig}`);
}


appConfig.$inject = ['iGotTimeConfigProvider'];

export default appConfig;
