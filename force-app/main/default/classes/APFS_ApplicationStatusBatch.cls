/**
 @description       : Batch Apex class for updating the status of applications from 'Submitted' to 'Under Review'.
 *                      This class implements the Database.Batchable interface to process and update a batch of
 *                      Application__c records in Salesforce. It includes methods for querying, executing the batch 
 *                      process, and handling any post-processing tasks.
 * @author            : gurumohan.kollu@cloudodyssey.co
 * @last modified on  : 13-09-2024
 * @last modified by  : gurumohan.kollu@cloudodyssey.co
**/
global class APFS_ApplicationStatusBatch implements Database.Batchable<SObject> {
     /**
     * @description Retrieves the query locator for the batch job, which includes all 'Submitted' applications.
     * @return Database.QueryLocator A query locator containing the records to be processed.
     */
    // Query to retrieve all 'Submitted' applications
    global Database.QueryLocator start(Database.BatchableContext bc) {
        //String query = 'SELECT Id,Name, Application_External_Status__c,Contact__r.FirstName, Contact__r.MobilePhone FROM Application__c WHERE Id = \'a01Bg00000F8qlbIAB\'';
        String query = 'SELECT Id, Name, Application_External_Status__c, Contact__r.FirstName, Contact__r.MobilePhone ' +
               'FROM Application__c ' +
               'WHERE Id IN (\'a01Bg00000F8qlbIAB\', \'a01Bg00000F89n3IAB\')';
        //String query = 'SELECT Id, Application_External_Status__c, Contact__r.MobilePhone FROM Application__c WHERE Application_External_Status__c = \'Submitted\'';
        return Database.getQueryLocator(query);
    }
     /**
     * @description Processes each batch of records. Updates the status of each application to 'Under Review'.
     * @param bc The batchable context, which provides information about the current batch job.
     * @param scope A list of Application__c records to be processed in this batch.
     */
    // Execute method to process each batch of records
    global void execute(Database.BatchableContext bc, List<Application__c> scope) {
        // List to hold records to be updated
        List<Application__c> applicationsToUpdate = new List<Application__c>();
        // Map to hold SMS details
        Map<String, List<Map<String, String>>> smsRequests = new Map<String, List<Map<String, String>>>();
       
        System.debug('Execute method: Processing batch of ' + scope.size() + ' records.');
        
        // Iterate through the scope of records
        for (Application__c app : scope) {
            System.debug('Processing record ID: ' + app.Id + ', current status: ' + app.Application_External_Status__c);
            app.Application_External_Status__c = 'Under Review'; // Update the status
            applicationsToUpdate.add(app);
             // Prepare data for SMS
            if (app.Contact__c != null && app.Contact__r != null) {
                String mobile = app.Contact__r.MobilePhone;
                String firstName = app.Contact__r.FirstName;
                
                if (String.isNotEmpty(mobile) && String.isNotEmpty(firstName)) {
                    Map<String, String> vars = new Map<String, String>{
                        'var' => 'Hello',
                        'var1' => firstName,
                        'var2' => app.Name
                    };
                    
                    // Group SMS requests by mobile number
                    if (!smsRequests.containsKey(mobile)) {
                        smsRequests.put(mobile, new List<Map<String, String>>());
                    }
                    smsRequests.get(mobile).add(vars);
                } else {
                    System.debug('No valid mobile number or first name found for application ID: ' + app.Id);
                }
            }
        }
        
        // Update the records in Salesforce
        if (!applicationsToUpdate.isEmpty()) {
            try {
                update applicationsToUpdate;
                System.debug('Successfully updated ' + applicationsToUpdate.size() + ' records.');
    
                // Enqueue a single Queueable job to process SMS sending only if the update is successful
                if (!smsRequests.isEmpty()) {
                    System.enqueueJob(new APFS_SendSmsQueueable(smsRequests));
                }
            } catch (Exception e) {
                System.debug('Error during update: ' + e.getMessage());
                throw new APFS_CustomException('Error during update: ' + e.getMessage());
            }
        } else {
        System.debug('No records to update.');
        throw new APFS_CustomException('No records to update.');
        }
    }
    
    global void finish(Database.BatchableContext bc) {
    }
}