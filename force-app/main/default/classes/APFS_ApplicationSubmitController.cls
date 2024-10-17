/**
 * @description       : Method to update the application status and other necessary details
 * @author            : Owais Ahanger
 * @last modified on  : 17-07-2024
 * @last modified by  : Owais Ahanger
 * Test Class         : APFS_ApplicationSubmitControllerTest
**/

public without sharing class APFS_ApplicationSubmitController {

    @AuraEnabled
    public static void UpdateApplicationStatus(Id applicationId) {
        if (applicationId == null) {
            throw new APFS_CustomException('Invalid application ID provided.');
        }

        try {
            // Fetch the application record based on the passed applicationId
            Application__c application = [
                SELECT Id, Application_External_Status__c, Application_Internal_Status__c, Submission_Date__c,Is_Consent_Given__c
                FROM Application__c
                WHERE Id = :applicationId
                LIMIT 1
            ];

            // Check if the application record exists and update fields accordingly
            if (application != null) {
                application.Application_External_Status__c = 'Submitted';
                application.Application_Internal_Status__c = 'Submitted';
                application.Submission_Date__c = DateTime.now(); 
				application.Is_Consent_Given__c=true;

                // Perform the update operation
                update application;
            } else {
                throw new APFS_CustomException('Application record not found.');
            }
        } 
         catch (Exception e) {
            // Catch all other types of exceptions
            throw new APFS_CustomException('Error while submitting application: ' + e.getMessage());
        }
    }

}