public without sharing class UserSettingsController {
     @AuraEnabled(cacheable=true)
    public static String getUserLanguage() {
        User currentUser = [SELECT Id,LanguageLocaleKey FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        return currentUser.LanguageLocaleKey;
    }
    @AuraEnabled
    public static void updateUserLanguage(String language) {
        try {
            User currentUser = [SELECT Id, LanguageLocaleKey FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            currentUser.LanguageLocaleKey  = language;
            update currentUser;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating language: ' + e.getMessage());
        }
    }
}