/**
 * @description       : Shows/Creates available applications in the APFS experience site.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 21-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class         : APFS_ApplicationControllerTest
 */
public with sharing class APFS_ApplicationController {

    /**
     * @description       : Checks if the user has applied for a specific scholarship round.
     * @param userId      : The Id of the user.
     * @param scholarshipRoundId : The Id of the scholarship round.
     * @return Application__c : The existing application if found, otherwise null.
     * @throws APFS_CustomException : Exception thrown if there is an error in fetching the application.
     */
    @AuraEnabled(cacheable=true)
    public static Application__c hasAppliedForScholarship(Id userId, Id scholarshipRoundId) {
        System.debug('APFS_ApplicationController.hasAppliedForScholarship - Start');

        try {
            return getExistingApplication(userId, scholarshipRoundId);
        } catch (Exception e) { APFS_DebugLogUtility.logError('Class', 'APFS_ApplicationController', 'hasAppliedForScholarship', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching application: ' + e.getMessage());
        } finally {
            System.debug('APFS_ApplicationController.hasAppliedForScholarship - End');
        }
    }

    /**
     * @description       : Creates a new application for the user for a specific scholarship round if one does not already exist.
     * @param userId      : The Id of the user.
     * @param scholarshipRoundId : The Id of the scholarship round.
     * @return Application__c : The newly created application.
     * @throws APFS_CustomException : Exception thrown if the user has already applied for the scholarship round.
     */
    @AuraEnabled
    public static Application__c createApplication(Id userId, Id scholarshipRoundId) {
        System.debug('APFS_ApplicationController.createApplication - Start');
        
        try {
            // Use the common method to check if an application exists
            Application__c existingApplication = getExistingApplication(userId, scholarshipRoundId);

            // If an existing application is found, throw an exception
            if (existingApplication != null) {
                System.debug('APFS_ApplicationController.createApplication - Existing application found for user: ' + userId);
                throw new APFS_CustomException('User has already applied for this scholarship.');
            }

            // Get the contact ID from the user ID
            Id contactId = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1].ContactId;

            // Create a new application
            Application__c newApplication = new Application__c(
                Contact__c = contactId,
                Scholarship_Round__c = scholarshipRoundId,
                Application_External_Status__c = 'Draft',
                OwnerId = userId
            );
            insert newApplication;
            
            System.debug('APFS_ApplicationController.createApplication - Application created: ' + newApplication.Id);
            return newApplication;

        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_ApplicationController', 'createApplication', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error creating application: ' + e.getMessage());
        } finally { System.debug('APFS_ApplicationController.createApplication - End');
        }
    }

    /**
     * @description       : Fetches the existing application for the user and active scholarship round if it exists.
     * @param userId      : The Id of the user.
     * @param scholarshipRoundId : The Id of the scholarship round.
     * @return Application__c : The existing application if found, otherwise null.
     * @throws APFS_CustomException : Exception thrown if there is an error in fetching the application.
     */
    private static Application__c getExistingApplication(Id userId, Id scholarshipRoundId) {
        System.debug('APFS_ApplicationController.getExistingApplication - Start');
        
        try {
            // Get the contact ID from the user ID
            Id contactId = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1].ContactId;

            // Check if the application already exists
            List<Application__c> existingApplications = [
                SELECT Id, Name, Application_External_Status__c
                FROM Application__c
                WHERE Contact__c = :contactId AND Scholarship_Round__c = :scholarshipRoundId
                ORDER BY CreatedDate DESC
                LIMIT 1 
            ];

            System.debug('APFS_ApplicationController.getExistingApplication - Existing applications count: ' + existingApplications.size());
            return existingApplications.isEmpty() ? null : existingApplications[0];

        } catch (Exception e) { APFS_DebugLogUtility.logError('Class', 'APFS_ApplicationController', 'getExistingApplication', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching existing application: ' + e.getMessage());
        } finally {
            System.debug('APFS_ApplicationController.getExistingApplication - End');
        }
    }

    /**
     * @description       : Checks if there is an active offer for the given application.
     * @param applicationId : The Id of the application to check for active offers.
     * @return Boolean : Returns true if there is an active offer, otherwise false.
     * @throws APFS_CustomException : Exception thrown if there is an error in fetching the active offer.
     */
    @AuraEnabled(cacheable=true)
    public static Boolean hasActiveOffer(String applicationId) {
        System.debug('APFS_ApplicationController.hasActiveOffer - Start');

        try {
            // Query to count the number of active offers for the application
            Integer offerCount = [SELECT COUNT()   FROM Offer__c 
                                  WHERE Application__c = :applicationId  AND Current_Offer__c = TRUE]; 

            System.debug('APFS_ApplicationController.hasActiveOffer - Active offers count: ' + offerCount);
            return offerCount > 0;

        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_ApplicationController', 'hasActiveOffer', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error occurred while fetching active offer: ' + e.getMessage());
        } finally {
            System.debug('APFS_ApplicationController.hasActiveOffer - End');
        }
    }
}