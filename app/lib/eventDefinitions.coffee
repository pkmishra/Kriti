module.exports = class EventDefinitions
    #Login Related Events
     @login = "login"
     #following event is a signal which is used by service provider
     @loginGlobal = "!login"
     @loginAttempt = "login_attempt"
     #Following event is to signal service provider in case user logs out
     @logoutGlobal = "!logout"
     @logout = "logout"
     @loginStatus = "login_status"
     @showLogin = "show_login"
     @loginServicePicked = "login_pickService"
     #Service Provider Related Events
     @serviceproviderSessionCreation = "serviceprovider_session_creation"
     @serviceProviderMissing = "missing_serviceProvider"
     @userDataRetrieved = "user_data_retrieved"
     @serviceProviderSDKLoaded = "sdkLoaded"
     @serviceProviderAuthComplete = "authComplete"
     @serviceProviderSignOut = "signOut"
     @serviceProviderSuccessfulLogin = "loginsSuccessful"
     @serviceProviderFailedLogin = "failedLogin"

     @startupController = "!startupController"

     #Navigation Events
     @navigationChange = "Navigation_change"
     @changeRoute = "!router:route"

     @tabChange = "tab_Change"
     @parentViewAfterRender = "parent_view_after_render"
     @sectionLoad = "section_load"
     @chapterLoad = "chapter_load"

