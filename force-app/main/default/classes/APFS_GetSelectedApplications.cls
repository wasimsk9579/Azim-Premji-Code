public class APFS_GetSelectedApplications {
    public List<Application__c> applications{get;private set;}
    public APFS_GetSelectedApplications(ApexPages.StandardSetController stdSetController){
        // Returns all selected records
        applications = (List<Application__c>) stdSetController.getSelected();
    }
    public PageReference save(){
        // Some fancy stuff here.
        try{
         update applications;
        } catch(Exception e){
            System.debug('Exception: ' + e);
        }
        return null;
    }
     @AuraEnabled(cacheable=true)
    public static List<Application__c> getApplicationRecords() {
        return [SELECT Id, Name,Contact__c, Application_External_Status__c, Application_Internal_Status__c FROM Application__c];
    }
     @AuraEnabled(cacheable=true)
    public static List<School__c> getSchoolRecords() {
        return [SELECT Id, Name,School_Category__c FROM School__c];
    }
}