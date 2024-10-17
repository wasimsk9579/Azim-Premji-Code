public class APFS_AppStatusSubmittedToReview implements Database.Batchable<SObject>
{
    // Query to Fetch records with Application_External_Status__c = 'Submitted'
    public Database.QueryLocator start(Database.BatchableContext bcontext) {
        return Database.getQueryLocator([SELECT Id, Name, Application_External_Status__c FROM Application__c WHERE Application_External_Status__c = 'Submitted' ORDER BY CreatedDate ASC]);
    }

    // Update the Application_External_Status__c field to 'Application Under Review'
    public void execute(Database.BatchableContext bcontext, List<Application__c> app) {
    try {
            for (Application__c application : app) {
                application.Application_External_Status__c = 'Application Under Review';
            }
            update app;
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_AppStatusSubmittedToReview', 'execute', e.getMessage(), UserInfo.getUserId());
			throw new APFS_CustomException(e.getMessage());
        }
    }

    public void finish(Database.BatchableContext bcontext) {
        
    }
}