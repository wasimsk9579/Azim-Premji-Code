/**
 * @description       : This class includes methods for fetching application records based on specific criteria
 *                      and updating the status of multiple application records. The methods are designed 
 *                      to support dynamic queries and batch updates, ensuring efficient and flexible record management.
 * @author            : gurumohan.kollu@cloudodyssey.co
 * @last modified on  : 06-09-2024
 * @last modified by  : gurumohan.kollu@cloudodyssey.co
**/
public class APFS_PrioritizeApplications {
    
    /**
     * @description Fetches active scholarship details including editions and rounds.
     * @return List<Map<String, Object>> A list of active scholarships with their details.
     * @throws APFS_CustomException If an error occurs during query execution.
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getActiveScholarshipDetails(String scholarshipName, String editionName, String roundName) {
        List<Map<String, Object>> scholarshipDetails = new List<Map<String, Object>>();
    
         try {
        // Query to fetch active scholarships with their active editions and rounds
        List<Scholarship__c> scholarships = [
            SELECT Id, Name, Scholarship_Name__c, Is_Active__c,
                (SELECT Id, Name, Is_Active_Edition__c,
                    (SELECT Id, Name, Is_Active_Round__c FROM Scholarship_Rounds__r WHERE Name = :roundName AND Is_Active_Round__c = true)
                FROM Scholarship_Editions__r WHERE Name = :editionName AND Is_Active_Edition__c = true)
            FROM Scholarship__c 
            WHERE Scholarship_Name__c = :scholarshipName AND Is_Active__c = true
        ];

        for (Scholarship__c scholarship : scholarships) {
            for (Scholarship_Edition__c edition : scholarship.Scholarship_Editions__r) {
                for (Scholarship_Round__c round : edition.Scholarship_Rounds__r) {
                    Map<String, Object> details = new Map<String, Object>();
                    details.put('scholarshipId', scholarship.Id);  // Add scholarship ID
                    details.put('scholarshipName', scholarship.Scholarship_Name__c);
                    details.put('scholarshipIsActive', scholarship.Is_Active__c);
                    details.put('editionId', edition.Id);  // Add edition ID
                    details.put('editionName', edition.Name);
                    details.put('editionIsActive', edition.Is_Active_Edition__c);
                    details.put('roundId', round.Id);  // Add round ID
                    details.put('roundName', round.Name);
                    details.put('roundIsActive', round.Is_Active_Round__c);
                    scholarshipDetails.add(details);
                }
            }
        }
        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_PrioritizeApplications', 'getActiveScholarshipDetails', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching scholarship details: ' + e.getMessage());
        }
        
        return scholarshipDetails;
    }
     /**
     * @description Fetches a list of Application__c records based on the provided state and district parameters.
     *              The method constructs a dynamic SOQL query to filter records based on the state and district 
     *              values. It only retrieves records where the Application_Internal_Status__c is 'Submitted'.
     * @param state The state value used for filtering the records (optional).
     * @param district The district value used for filtering the records (optional).
     * @return List<Application__c> A list of Application__c records that match the specified criteria.
     * @throws APFS_CustomException If an error occurs during query construction or execution.
     */
    
    @AuraEnabled
    public static List<Application__c> fetchPrioritizeRecords(Id scholarshipId,String applicationInternalValue,String state, String district,String referralValue, Integer limitSize, Id lastApplicationId) {

        List<Application__c> applications = new List<Application__c>();
 		try {
 		String query = 'SELECT Id, Name, ' +
                   'Application_Internal_Status__c, Contact__r.Name, Contact__r.Referred_By_APF_Or_Partners__c, ' +
                   'Contact__r.MobilePhone, Contact__r.Referral_Partner_Name__c, Assigned_To__c, ' +
                   'LastModifiedById, LastModifiedBy.Name ' + // Fetch Last Modified User
                   'FROM Application__c ' +
                   'WHERE Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                   'AND Application_Internal_Status__c = :applicationInternalValue';
        
        if (String.isNotEmpty(state) && !state.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_State__c = :state';
        }
        
        if (String.isNotEmpty(district) && !district.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_District__c = :district';
        }
        if (String.isNotEmpty(referralValue) && !referralValue.equalsIgnoreCase('All')) {
            query += ' AND Contact__r.Referred_By_APF_Or_Partners__c = :referralValue';
        }
        if (lastApplicationId != null) {
            query += ' AND Id > :lastApplicationId ';
        }
        // Add LIMIT clause
		  query += ' ORDER BY Id ASC LIMIT :limitSize';
          applications = Database.query(query);
        }catch (Exception e) {
             APFS_DebugLogUtility.logError('Class','APFS_PrioritizeApplications','fetchPrioritizeRecords',e.getMessage(),UserInfo.getUserId());
             throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
        }
        
        return applications;
    }
    
    @AuraEnabled
    public static List<Application__c> fetchOfferApprovedRecords(Id scholarshipId,String applicationInternalValue,String state, String district,String referralValue, Integer limitSize, Id lastApplicationId) {
        List<Application__c> applications = new List<Application__c>();
 		try {
        String query = 'SELECT Id, Name, ' +
                   'Application_Internal_Status__c, Contact__r.Name, Contact__r.Referred_By_APF_Or_Partners__c, ' +
                   'Contact__r.MobilePhone, Contact__r.Referral_Partner_Name__c, Assigned_To__c,Scholarship_Round__r.Scholarship_Edition__r.Total_Amount_Per_Installment__c,  ' +
                   'LastModifiedById, LastModifiedBy.Name ' + // Fetch Last Modified User
                   'FROM Application__c ' +
                   'WHERE Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                   'AND Application_Internal_Status__c = :applicationInternalValue';        
        
        if (String.isNotEmpty(state) && !state.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_State__c = :state';
        }
        
        if (String.isNotEmpty(district) && !district.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_District__c = :district';
        }
        if (String.isNotEmpty(referralValue) && !referralValue.equalsIgnoreCase('All')) {
            query += ' AND Contact__r.Referred_By_APF_Or_Partners__c = :referralValue';
        }
        if (lastApplicationId != null) {
            query += ' AND Id > :lastApplicationId ';
        }
		 query += ' ORDER BY Id ASC LIMIT :limitSize';
        applications = Database.query(query);
        }catch (Exception e) {
             APFS_DebugLogUtility.logError('Class','APFS_PrioritizeApplications','fetchOfferApprovedRecords',e.getMessage(),UserInfo.getUserId());
             throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
        }
        
        return applications;
    }
    
    @AuraEnabled
    public static List<Application__c> fetchDisbursalApprovalRecords(Id scholarshipId,String applicationInternalValue,String state, String district,String referralValue, Integer limitSize, Id lastApplicationId) {
        List<Application__c> applications = new List<Application__c>();
 		try {
        String query = 'SELECT Id, Name, ' +
                   'Application_Internal_Status__c, Contact__r.Name, Contact__r.Referred_By_APF_Or_Partners__c, ' +
                   'Contact__r.MobilePhone, Contact__r.Referral_Partner_Name__c, Assigned_To__c,Scholarship_Round__r.Scholarship_Edition__r.Total_Amount_Per_Installment__c, ' +
                   'LastModifiedById, LastModifiedBy.Name ' + // Fetch Last Modified User
                   'FROM Application__c ' +
                   'WHERE Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                   'AND Application_Internal_Status__c = :applicationInternalValue';    
        
        if (String.isNotEmpty(state) && !state.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_State__c = :state';
        }
        
        if (String.isNotEmpty(district) && !district.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_District__c = :district';
        }
        if (String.isNotEmpty(referralValue) && !referralValue.equalsIgnoreCase('All')) {
            query += ' AND Contact__r.Referred_By_APF_Or_Partners__c = :referralValue';
        }
        if (lastApplicationId != null) {
            query += ' AND Id > :lastApplicationId ';
        }
        // Add LIMIT clause
		query += ' ORDER BY Id ASC LIMIT :limitSize';
        applications = Database.query(query);
        } catch (Exception e) {
             APFS_DebugLogUtility.logError('Class','APFS_PrioritizeApplications','fetchDisbursalApprovalRecords',e.getMessage(),UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
        }
        
        return applications;
    }
    
     @AuraEnabled
    public static List<Application__c> fetchVerificationRecords(Id scholarshipId,String applicationInternalValue,String state, String district,String referralValue, Integer limitSize, Id lastApplicationId) {

         List<Application__c> applications = new List<Application__c>();
 		try {
        String query = 'SELECT Id, Name, ' +
                   'Application_Internal_Status__c, Contact__r.Name, Contact__r.Referred_By_APF_Or_Partners__c, ' +
                   'Contact__r.MobilePhone, Contact__r.Referral_Partner_Name__c, Assigned_To__c,Scholarship_Round__r.Scholarship_Edition__r.Total_Amount_Per_Installment__c, ' +
                   'LastModifiedById, LastModifiedBy.Name ' + // Fetch Last Modified User
                   'FROM Application__c ' +
                   'WHERE Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                   'AND Application_Internal_Status__c = :applicationInternalValue';    
        
        if (String.isNotEmpty(state) && !state.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_State__c = :state';
        }
        
        if (String.isNotEmpty(district) && !district.equalsIgnoreCase('None')) {
            query += ' AND Contact__r.Class_Twelve_Exam_Centre_District__c = :district';
        }
        if (String.isNotEmpty(referralValue) && !referralValue.equalsIgnoreCase('All')) {
            query += ' AND Contact__r.Referred_By_APF_Or_Partners__c = :referralValue';
        }
        if (lastApplicationId != null) {
            query += ' AND Id > :lastApplicationId ';
        }
        // Add LIMIT clause
         query += ' ORDER BY Id ASC LIMIT :limitSize';
		 applications = Database.query(query);
        } catch (Exception e) {
             APFS_DebugLogUtility.logError('Class','APFS_PrioritizeApplications','fetchVerificationRecords',e.getMessage(),UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
        }
        
        return applications;
    }
     /**
     * @description Updates the status of multiple Application__c records with the provided internal status.
     * @param recordIds A list of Application__c record IDs to be updated.
     * @param internalStatus The new status value to be applied to the records.
     * @param rejectedReason The reason for rejection (if applicable) only for Not Selected.
     * @param comment The comment to be added for the update only for Not Selected and the rejected reason is others.
     * @throws APFS_CustomException If no records are provided, no status value is given, or if an error occurs during the update process.
     */
    @AuraEnabled
    public static void updateApplicationStatus(List<Id> recordIds, String internalStatus, String rejectedReason, String comment) {
        
        // Validate input parameters
        if (recordIds == null || recordIds.isEmpty()) {
            throw new APFS_CustomException('No records to update.');
        }
        if (String.isEmpty(internalStatus)) {
            throw new APFS_CustomException('No Status value provided.');
        }
		System.debug('recordIds: ' + recordIds);
        System.debug('internalStatus: ' + internalStatus);
        System.debug('rejectedReason: ' + rejectedReason);
        System.debug('comment: ' + comment);
        // Query the records that need to be updated
        List<Application__c> applicationsToUpdate = [SELECT Id,Application_Internal_Status__c,Application_External_Status__c  FROM Application__c WHERE Id IN :recordIds];
        if (applicationsToUpdate.isEmpty()) {
            throw new APFS_CustomException('No records found for the provided IDs.');
        }
        
        for (Application__c app : applicationsToUpdate) {
             app.Application_Internal_Status__c = internalStatus;
             if ('Not Selected'.equalsIgnoreCase(internalStatus)) {
                app.Application_External_Status__c = internalStatus; 
             }
        }
        Database.SaveResult[] results = Database.update(applicationsToUpdate, false);
        
        List<Application__c> successfullyUpdatedApplications = new List<Application__c>();
        for (Integer i = 0; i < results.size(); i++) {
            Database.SaveResult result = results[i];
            Application__c app = applicationsToUpdate[i];
            
            // Check if the update was successful
            if (result.isSuccess()) {
                // Check if the status is 'Not Selected'
                if ('Not Selected'.equalsIgnoreCase(internalStatus)) {
                    successfullyUpdatedApplications.add(app);
                }
            } else {
                // Handle any errors, but do not prevent comment creation for valid updates
                String errorMessage = 'Error updating record with ID ' + result.getId() + ': ' + result.getErrors()[0].getMessage();
                APFS_DebugLogUtility.logError('Class','APFS_PrioritizeApplications','updateApplicationStatus-successfullyUpdatedApplications','errorMessage',UserInfo.getUserId());
                throw new APFS_CustomException(errorMessage);
            }
    	}
        List<Application_Status_Comment__c> applicationStatusCommentToInsert = new List<Application_Status_Comment__c>();
         // Create comment records for successfully updated applications to 'Not Selected'
        for (Application__c app : successfullyUpdatedApplications) {
            Application_Status_Comment__c statusCommentRecord = new Application_Status_Comment__c(); 
            statusCommentRecord.Application__c = app.Id; 
            statusCommentRecord.Application_Internal_Status__c = internalStatus;
            statusCommentRecord.Comment__c = comment; // Comment provided from LWC
            statusCommentRecord.Comment_Date__c = DateTime.now();
            statusCommentRecord.Rejected_Reason__c = rejectedReason;
            applicationStatusCommentToInsert.add(statusCommentRecord);
        }
        if (!applicationStatusCommentToInsert.isEmpty()) {
        Database.SaveResult[] commentResults = Database.insert(applicationStatusCommentToInsert, false);
        for (Database.SaveResult commentResult : commentResults) {
            if (!commentResult.isSuccess()) {
                String errorMessage = 'Error inserting comment for record ID ' + commentResult.getId() + ': ' + commentResult.getErrors()[0].getMessage();
                APFS_DebugLogUtility.logError('Class','APFS_PrioritizeApplications','updateApplicationStatus-applicationStatusCommentToInsert','errorMessage',UserInfo.getUserId());
                throw new APFS_CustomException(errorMessage);
            }
        }
    }
    }
}