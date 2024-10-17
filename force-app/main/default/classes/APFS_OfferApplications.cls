/**
 * @description       : This class includes methods for fetching application records based on specific criteria
 *                      and updating the status of multiple application records. The methods are designed 
 *                      to support dynamic queries and batch updates, ensuring efficient and flexible record management.
 * @author            : gurumohan.kollu@cloudodyssey.co
 * @last modified on  : 06-09-2024
 * @last modified by  : gurumohan.kollu@cloudodyssey.co
**/
public class APFS_OfferApplications {
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
            APFS_DebugLogUtility.logError('Class', 'APFS_OfferApplications', 'getActiveScholarshipDetails', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching scholarship details: ' + e.getMessage());
        }
        
        return scholarshipDetails;
    }
    
    @AuraEnabled(cacheable=true)
    public static Offer__c getApplicationsByOffer(Id offerId) {
        Offer__c offer; 
        try {
            offer = [
                SELECT Id, Name, Application__r.Id, Application__r.Name, Application__r.Contact__r.Name, 
                       Application__r.Application_Internal_Status__c, Application__r.Scholarship_Round__r.Name 
                FROM Offer__c 
                WHERE Id = :offerId LIMIT 1 ];
        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_OfferApplications', 'getApplicationsByOffer', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching application by offer: ' + e.getMessage());
        }
    
        return offer;
    }

    /**
     * @description Fetches a list of (Offer Letter Approved) Application__c records based on the provided state and district parameters.
     *              The method constructs a dynamic SOQL query to filter records based on the state and district 
     *              values. It only retrieves records where the Application_Internal_Status__c is 'Submitted'.
     * @param state The state value used for filtering the records (optional).
     * @param district The district value used for filtering the records (optional).
     * @return List<Application__c> A list of Application__c records that match the specified criteria.
     * @throws APFS_CustomException If an error occurs during query construction or execution.
     */
    @AuraEnabled
	public static List<Application__c> fetchApplicationWithLatestOffer(Id scholarshipId, String applicationInternalValue, String state, String district, String referralValue, Integer limitSize, Id lastApplicationId) {

    List<Application__c> applications = new List<Application__c>();
    
    try {
       
        String query = 'SELECT Id, Name, Contact__r.Name, Application_Internal_Status__c, ' +
                       'Scholarship_Round__c,LastModifiedBy.Name, ' +
                       'Contact__r.Referred_By_APF_Or_Partners__c, Contact__r.MobilePhone, ' +
                       'Contact__r.Referral_Partner_Name__c, Contact__r.Class_Twelve_Exam_Centre_District__c, ' +
                       '(SELECT Id, Name ,Offer_Start_Date__c,Offer_End_Date__c,Scholarship_Amount_Per_Annum__c,Net_Course_Duration__c, Total_Scholarship_Amount__c ' +
                       ' FROM Offers__r ' +
                       ' WHERE Current_Offer__c = true ' + 
                       ' ORDER BY CreatedDate DESC LIMIT 1) ' + 
                       ' FROM Application__c ' +
                       ' WHERE Id In (select Application__c from Offer__c) and Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                       ' AND Application_Internal_Status__c = :applicationInternalValue ';

        // Add filters for Contact fields if provided
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
        
        System.debug('Constructed SOQL Query: ' + query);
        applications = Database.query(query);
        
    } catch (Exception e) {
        APFS_DebugLogUtility.logError('Class', 'APFS_OfferApplications', 'fetchApplicationWithLatestOffer', e.getMessage(), UserInfo.getUserId());
        throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
    }
    
    return applications;
	}
     /**
     * @description Fetches a list of (Offer Acceptance Document Submitted) Application__c records based on the provided state and district parameters.
     *              The method constructs a dynamic SOQL query to filter records based on the state and district 
     *              values. It only retrieves records where the Application_Internal_Status__c is 'Submitted'.
     * @param state The state value used for filtering the records (optional).
     * @param district The district value used for filtering the records (optional).
     * @return List<Application__c> A list of Application__c records that match the specified criteria.
     * @throws APFS_CustomException If an error occurs during query construction or execution.
     */
    @AuraEnabled
	public static List<Application__c> fetchApplicationWithVerification(Id scholarshipId, String applicationInternalValue, String state, String district, String referralValue, Integer limitSize, Id lastApplicationId) {

      List<Application__c> applications = new List<Application__c>();
    
    try {
        String query = 'SELECT Id, Name, Contact__r.Name, Application_Internal_Status__c, ' +
                       'Scholarship_Round__c, LastModifiedBy.Name, ' +
                       'Contact__r.Referred_By_APF_Or_Partners__c, Contact__r.MobilePhone, ' +
                       'Contact__r.Referral_Partner_Name__c, Contact__r.Class_Twelve_Exam_Centre_District__c, ' +
                       '(SELECT Id, Name ' +
                       ' FROM Offers__r ' +
                       ' WHERE Current_Offer__c = true ' + 
                       ' ORDER BY CreatedDate DESC LIMIT 1) ' + 
                       ' FROM Application__c ' +
                       ' WHERE Id In (select Application__c from Offer__c) and Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                       ' AND Application_Internal_Status__c = :applicationInternalValue ';

        // Add filters for Contact fields if provided
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
        System.debug('Constructed SOQL Query: ' + query);
        applications = Database.query(query);
        
    } catch (Exception e) {
        APFS_DebugLogUtility.logError('Class', 'APFS_OfferApplications', 'fetchApplicationWithVerification', e.getMessage(), UserInfo.getUserId());
        throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
    }
    
    return applications;
	}   

 	@AuraEnabled(cacheable=true)
    public static Application__c getOfferApplicationAdmissionDetails(Id applicationId) {
        Application__c application;
        try{
        application =[SELECT Id,Contact__r.Name,Contact__r.Class_Twelve_Year_Of_Passing__c,Contact__r.Class_Twelve_Exam_Centre_State__c,Contact__r.Class_Twelve_Exam_Centre_District__c,
                     Contact__r.Class_Ten_Year_Of_Passing__c,Contact__r.Class_Ten_Exam_Centre_State__c,Contact__r.Class_Ten_Exam_Centre_District__c,
                     (SELECT Id,Name,Offer_Start_Date__c,Offer_End_Date__c,Scholarship_Amount_Per_Annum__c,Net_Course_Duration__c
                      ,Total_Scholarship_Amount__c FROM Offers__r WHERE Current_Offer__c = true ORDER BY CreatedDate DESC LIMIT 1),
                     (SELECT Id,Name_Of_The_Institute__c,Institute_State__c,Institute_District__c,Course_Name__c,Course_Start_Date__c, 
            			Course_Duration_In_Years__c,Course_Year_Of_Studying__c FROM Admissions__r WHERE Is_Active__c = true ORDER BY CreatedDate DESC LIMIT 1)
                    FROM Application__c 
                   	WHERE Id = :applicationId];
        } catch (Exception e){
            APFS_DebugLogUtility.logError('Class', 'APFS_OfferApplications', 'getOfferApplicationAdmissionDetails', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching application by offer: ' + e.getMessage());
        }
            return application;
        }
}