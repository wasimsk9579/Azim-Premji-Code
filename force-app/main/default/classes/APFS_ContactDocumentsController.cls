public without sharing class APFS_ContactDocumentsController {

    @AuraEnabled(Cacheable=true)
    public static String getFileData(Id contentVersionId) {
        ContentVersion cv = [
            SELECT VersionData, FileExtension
            FROM ContentVersion
            WHERE Id = :contentVersionId
            LIMIT 1
        ];
        
        // Convert the binary VersionData to a base64 string
        Blob fileBlob = cv.VersionData;
        String base64Data = EncodingUtil.base64Encode(fileBlob);
        
        // Return the base64 encoded data and file extension
        return JSON.serialize(new Map<String, Object>{
            'base64Data' => base64Data,
                'fileExtension' => cv.FileExtension
                });
    }
    
    @AuraEnabled(cacheable=false)
    public static List<Admission__c> getAdmissionRecords(Id contactId,Id applicationId) {
        List<Admission__c> admissionRecords = new List<Admission__c>();
        try {
            admissionRecords = [SELECT Id,Is_Active__c, Application__c,Course_Type__c,Course_Year_Of_Studying__c,Course_Start_Date__c,College_Student_Id__c,Accommodation_Type__c, Contact__c,Course_Duration_In_Years__c,Year_Of_Admission__c, Name_Of_The_Institute__c, Other_Name_Of_Institute__c,Institute_State__c, Institute_District__c,Course_Name__c, Course_System__c,Course_Category__c,Other_Course_Category__c
                                FROM Admission__c
                                WHERE Contact__c = :contactId
                                AND Application__c =:applicationId
                                AND Is_Active__c = true
                                ORDER by CreatedDate DESC LIMIT 1];
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getAdmissionRecords', e.getMessage(), UserInfo.getUserId());
			throw new APFS_CustomException(e.getMessage());
        }
        return admissionRecords;
    }
    
    @AuraEnabled(cacheable=false)
    public static List<Bank_Detail__c> getBankDetail(String contactId) {
        List<Bank_Detail__c> bankDetail = new List<Bank_Detail__c>();
        if (String.isEmpty(contactId)) {
            throw new APFS_CustomException('Contact ID cannot be null or empty.');
        }
        try {
            bankDetail = [
                SELECT Id, Name,Bank_Ifsc_Code__c, Bank_Account_Type__c,Other_Bank_Account_Type__c,Encrypted_Bank_Account_Number__c,Branch_Name__c
                FROM Bank_Detail__c
                WHERE Contact__c = :contactId limit 1];
            
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getBankDetail', e.getMessage(), UserInfo.getUserId());
            System.debug('Error retrieving bank details: ' + e.getMessage());
            throw new APFS_CustomException(e.getMessage());
        }
        return bankDetail;
    }
    @AuraEnabled(cacheable=true)
    public static String getCurrentUserProfileName() {
        try {
            User currentUser = [SELECT Profile.Name FROM User WHERE Id = :UserInfo.getUserId()];
            return currentUser.Profile.Name;
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getCurrentUserProfileName', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException(e.getMessage());
        }
    }
    @AuraEnabled
    public static void updateFileStatus(String contentVersionId, String status, String comment) {
        try {
            ContentVersion contentVersion = [SELECT Id, Applicant_Document_Status__c, Application_Document_Comment__c FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];
            
            contentVersion.Applicant_Document_Status__c = status;
            if (comment != null) {
                contentVersion.Application_Document_Comment__c = comment;
                contentVersion.Applicant_Document_Status__c = status;
            }
            
            update contentVersion;
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'updateFileStatus', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error updating the document status: ' + e.getMessage());
        }
    }
    public class ContentVersionWrapper {
        @AuraEnabled 
        public List<ContentVersion> documents { get; set; }
        public ContentVersionWrapper() {
            this.documents = new List<ContentVersion>();
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static ContentVersionWrapper getFilteredDocuments(Id applicationId) {
        ContentVersionWrapper resultWrapper = new ContentVersionWrapper();
        
        try {
            Id contactId = [SELECT Id, Name, 
                            (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
                            FROM Contact 
                            WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)][0].Id;
            List<ContentDocumentLink> contentDocumentLinks = [
                SELECT ContentDocumentId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :contactId
            ];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            
            // Fetch ContentVersion records based on Contact Only
            if (!contentDocumentIds.isEmpty()) {
                List<ContentVersion> contactDocuments = [
                    SELECT Id, Contact__c, Title, Applicant_Document_Type__c, Applicant_Document_Status__c, Application__c, 
                    FileType, FileExtension, ContentDocumentId, ContentUrl, VersionNumber, Application_Document_Comment__c
                    FROM ContentVersion
                    WHERE ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    AND Applicant_Document_Type__c!=Null
                    AND Applicant_Document_Type__c != 'College Admission Proof'
                    AND Applicant_Document_Type__c != 'College Fee Receipt'
                    AND Applicant_Document_Type__c != 'Offer Letter'
                    AND Applicant_Document_Type__c != 'Signed Scholarship Agreement'
                    Order by Applicant_Document_Type__c asc
                ];
                resultWrapper.documents.addAll(contactDocuments);
            }
            
            // Fetch ContentVersion records based on Application
            if (applicationId != null) {
                List<ContentVersion> applicationDocuments = [
                    SELECT Id, Contact__c, Title, Applicant_Document_Type__c, Applicant_Document_Status__c, Application__c, 
                    FileType, FileExtension, ContentDocumentId, ContentUrl, VersionNumber, Application_Document_Comment__c, Application__r.Id
                    FROM ContentVersion
                    WHERE Application__c = :applicationId
                    AND ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    AND Applicant_Document_Type__c!=Null
                    AND (Applicant_Document_Type__c = 'College Admission Proof' 
                         OR Applicant_Document_Type__c = 'College Fee Receipt' 
                         OR Applicant_Document_Type__c = 'Offer Letter'
                         OR Applicant_Document_Type__c = 'Signed Scholarship Agreement')
                    Order by Applicant_Document_Type__c asc
                ];
                resultWrapper.documents.addAll(applicationDocuments);
            }
            
            System.debug('Combined Documents: ' + resultWrapper.documents);
            
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getFilteredDocuments', e.getMessage(), UserInfo.getUserId());
            System.debug('Error occurred: ' + e.getMessage());
           	throw new APFS_CustomException(e.getMessage());
        }
        return resultWrapper;
    }
    @AuraEnabled(cacheable=true)
    public static ContentWrapper getReSubmissionDocuments(Id applicationId) {
        ContentWrapper resultWrapper = new ContentWrapper();
        
        try {
            Id contactId = [SELECT Id, Name, 
                            (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
                            FROM Contact 
                            WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)][0].Id;
            List<ContentDocumentLink> contentDocumentLinks = [
                SELECT ContentDocumentId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :contactId
            ];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            
            // Fetch ContentVersion records based on Contact Only
            if (!contentDocumentIds.isEmpty()) {
                List<ContentVersion> contactDocuments = [
                    SELECT Id, Contact__c, Title, Applicant_Document_Type__c, Applicant_Document_Status__c, Application__c, 
                    FileType, FileExtension, ContentDocumentId, ContentUrl, VersionNumber, Application_Document_Comment__c, VersionData, PathOnClient
                    FROM ContentVersion
                    WHERE ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    AND Applicant_Document_Type__c!=Null
                    AND Applicant_Document_Status__c ='Rejected'
                   	AND Applicant_Document_Type__c != 'College Admission Proof'
                    AND Applicant_Document_Type__c != 'College Fee Receipt'
                    AND Applicant_Document_Type__c != 'Offer Letter'
                    AND Applicant_Document_Type__c != 'Signed Scholarship Agreement'
                    Order by Applicant_Document_Type__c asc
                ];
                
                for(ContentVersion version : contactDocuments) {
                    system.debug('title'+version.Title);
                    ContentVersionDataWrapper dataWrapper = new ContentVersionDataWrapper();
                    dataWrapper.title = version.Title;
                    dataWrapper.pathOnClient = version.PathOnClient;
                    dataWrapper.docType = version.Applicant_Document_Type__c;
                    dataWrapper.encodedVersionData = EncodingUtil.base64Encode(version.VersionData);
                    dataWrapper.comments = version.Application_Document_Comment__c;
                    dataWrapper.contentDocumentId = version.ContentDocumentId;
                    system.debug('dataWrapper'+dataWrapper);
                    resultWrapper.documents.add(dataWrapper);
                }
            }
            
            // Fetch ContentVersion records based on Application
            if (applicationId != null) {
                List<ContentVersion> applicationDocuments = [
                    SELECT Id, Contact__c, Title, Applicant_Document_Type__c, Applicant_Document_Status__c, Application__c, 
                    FileType, FileExtension, ContentDocumentId, ContentUrl, VersionNumber, VersionData, Application_Document_Comment__c, PathOnClient
                    FROM ContentVersion
                    WHERE Application__c = :applicationId
                    AND ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    AND Applicant_Document_Type__c!=Null
                    AND Applicant_Document_Status__c ='Rejected'
                    AND (Applicant_Document_Type__c = 'College Admission Proof' 
                         OR Applicant_Document_Type__c = 'College Fee Receipt' 
                         OR Applicant_Document_Type__c = 'Offer Letter'
                         OR Applicant_Document_Type__c = 'Signed Scholarship Agreement')
                    Order by Applicant_Document_Type__c asc
                ];
                
                for(ContentVersion version : applicationDocuments) {
                    system.debug('title'+version.Title);
                    ContentVersionDataWrapper dataWrapper = new ContentVersionDataWrapper();
                    dataWrapper.title = version.Title;
                    dataWrapper.pathOnClient = version.PathOnClient;
                    dataWrapper.docType = version.Applicant_Document_Type__c;
                    dataWrapper.encodedVersionData = EncodingUtil.base64Encode(version.VersionData);
                    dataWrapper.comments = version.Application_Document_Comment__c;
                    dataWrapper.contentDocumentId = version.ContentDocumentId;
                    resultWrapper.documents.add(dataWrapper);
                }
            }
            
            System.debug('Combined Documents: ' + resultWrapper.documents);
            
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getReSubmissionDocuments', e.getMessage(), UserInfo.getUserId());

            System.debug('Error occurred: ' + e.getMessage());
            throw new APFS_CustomException(e.getMessage());
        }
        return resultWrapper;
    }
    
    public class ContentVersionDataWrapper {
        @AuraEnabled public String title;
        @AuraEnabled public String pathOnClient;
        @AuraEnabled public String docType;
        @AuraEnabled public String encodedVersionData;
        @AuraEnabled public String comments;
        @AuraEnabled public String contentDocumentId;
    }
    
    public class ContentWrapper {
        @AuraEnabled public List<ContentVersionDataWrapper> documents = new List<ContentVersionDataWrapper>();
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getMissingDocumentTypes(Id applicationId, String missingType) {
        try{
             Contact contact = [SELECT Id, Referral_Partner_State__c,Is_Aadhaar_Available__c 
                           FROM Contact 
                           WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id = :applicationId)
                           LIMIT 1];
        
            Id contactId = contact.Id;
            String contactState = contact.Referral_Partner_State__c;
            String aadharAvailable = contact.Is_Aadhaar_Available__c;
            
            List<ContentDocumentLink> contentDocumentLinks = [
                SELECT ContentDocumentId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :contactId
            ];
        
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
        
            List<ContentVersion> existingDocuments = [
                SELECT Id, Applicant_Document_Type__c
                FROM ContentVersion
                WHERE ContentDocumentId IN :contentDocumentIds
                AND IsLatest = true
                ORDER BY Applicant_Document_Type__c ASC
            ];
        
            Set<String> existingDocumentTypes = new Set<String>();
            for (ContentVersion doc : existingDocuments) {
                if (doc.Applicant_Document_Type__c != null) {
                    existingDocumentTypes.add(doc.Applicant_Document_Type__c);
                }
            }
        
            // all document types based on missingType
            List<String> allDocumentTypes;
            if (missingType == 'applicationDoc') { 
                allDocumentTypes = new List<String>{'Self Photo', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof'};
                if (contactState == 'Uttar Pradesh') {allDocumentTypes.add('Class Eight Marks Card');
                }
                if(aadharAvailable == 'Yes'){allDocumentTypes.add('Aadhaar Card');
                }
            }else if(missingType == 'All') { 
                allDocumentTypes = new List<String>{'Self Photo', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof','Bank Proof', 'Signed Scholarship Agreement'};
                if (contactState == 'Uttar Pradesh') {allDocumentTypes.add('Class Eight Marks Card');
                }
                if(aadharAvailable == 'Yes'){allDocumentTypes.add('Aadhaar Card');
                }
            } else {
                allDocumentTypes = new List<String>{'Bank Proof', 'Signed Scholarship Agreement'};
            }
        
            List<String> missingDocumentTypes = new List<String>();
            for (String docType : allDocumentTypes) {
                if (!existingDocumentTypes.contains(docType)) {
                    missingDocumentTypes.add(docType);
                }
            }
            System.debug('Missing Documents--' + missingDocumentTypes);
            return missingDocumentTypes;
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getMissingDocumentTypes', e.getMessage(), UserInfo.getUserId());
             throw new APFS_CustomException(e.getMessage());
        }        
    }

    @AuraEnabled
    public static void updateDocumentStatus(String contentDocumentId, String newStatus, String applicationId) {
        try {
            ContentVersion contentVersionRecord = [
                SELECT Id, Applicant_Document_Status__c, Applicant_Document_Type__c, Application__c 
                FROM ContentVersion 
                WHERE ContentDocumentId = :contentDocumentId 
                LIMIT 1
            ];            
            List<String> specialDocumentTypes = new List<String>{
                'College Admission Proof', 'College Fee Receipt', 'Offer Letter', 'Signed Scholarship Agreement'
            };
            
            if (!specialDocumentTypes.contains(contentVersionRecord.Applicant_Document_Type__c)) {
                contentVersionRecord.Applicant_Document_Status__c = newStatus;
            } else {
                contentVersionRecord.Application__c = applicationId;
                contentVersionRecord.Applicant_Document_Status__c = newStatus;
            }    
            update contentVersionRecord;
            
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'updateDocumentStatus', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error updating document status: ' + e.getMessage());
        }
    }
	@AuraEnabled
    public static String createApplicationStatusComment(Id applicationId, String internalStatus, String comment,String rejectedResason) {
        try {
            Application_Status_Comment__c appStatusComment = new Application_Status_Comment__c();
                appStatusComment.Application__c = applicationId;
                appStatusComment.Application_Internal_Status__c = internalStatus;
                appStatusComment.Comment__c = comment;
            	appStatusComment.Comment_Date__c = DateTime.now();
            	if('Not Selected Draft'.equals(internalStatus)){
            		appStatusComment.Not_Selected_Draft_Reason__c = rejectedResason;
                }else if('On Hold'.equals(internalStatus)){
                    appStatusComment.On_Hold_Reason__c = rejectedResason;
                }
            	insert appStatusComment;
            
            return 'Success';
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'createApplicationStatusComment', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void deleteAllProcessedFiles(List<String> contentVersionIds) {
        try {
            List<ContentVersion> versions = [
                SELECT ContentDocumentId 
                FROM ContentVersion 
                WHERE Id IN :contentVersionIds
            ];
            Set<Id> contentDocumentIds = new Set<Id>();
            for(ContentVersion version : versions) {
                contentDocumentIds.add(version.ContentDocumentId);
            }
            if (!contentDocumentIds.isEmpty()) {
                delete [SELECT Id FROM ContentDocument WHERE Id IN :contentDocumentIds];
            }
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'deleteAllProcessedFiles', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error deleting files: ' + e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> getDynamicPicklistValues(String sObjectTypeName, List<String> fieldApiNames) {
        Map<String, List<String>> picklistValuesMap = new Map<String, List<String>>();
        
        // Get the SObject describe using the provided type name
        Schema.DescribeSObjectResult sObjectDescribe = Schema.getGlobalDescribe().get(sObjectTypeName).getDescribe();

        for (String fieldApiName : fieldApiNames) {
            Schema.DescribeFieldResult fieldResult = sObjectDescribe.fields.getMap().get(fieldApiName).getDescribe();
            if (fieldResult != null && fieldResult.getType() == Schema.DisplayType.Picklist) {
                List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
                List<String> values = new List<String>();
                for (Schema.PicklistEntry entry : picklistEntries) {
                    values.add(entry.getLabel());
                }
                picklistValuesMap.put(fieldApiName, values);
            }
        }
        return picklistValuesMap;
    }
    @AuraEnabled
    @future
    public static void MissingOrRejectedDocumentCount(Id applicationId, String missingType) {
        try{
            Contact contact = [SELECT Id, Referral_Partner_State__c, Is_Aadhaar_Available__c 
                               FROM Contact 
                               WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id = :applicationId)
                               LIMIT 1];
        
            Id contactId = contact.Id;
            String contactState = contact.Referral_Partner_State__c;
            String aadharAvailable = contact.Is_Aadhaar_Available__c;
        
            // Fetch ContentDocumentLinks for the Contact
            List<ContentDocumentLink> documentLinks = [
                SELECT ContentDocumentId 
                FROM ContentDocumentLink 
                WHERE LinkedEntityId = :contactId
            ];
        
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : documentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
        
            // Define document types for rejection and missing logic based on 'missingType'
            List<String> allDocumentTypesRejection;
            List<String> allDocumentTypes;
        
            if (missingType == 'applicationDoc') {
                allDocumentTypesRejection = new List<String>{'Self Photo', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof', 'Class Eight Marks Card', 'Aadhaar Card'};
                allDocumentTypes = new List<String>{'Self Photo', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof'};
                
                if (contactState == 'Uttar Pradesh') {allDocumentTypes.add('Class Eight Marks Card');
                }
                if (aadharAvailable == 'Yes') {allDocumentTypes.add('Aadhaar Card');
                }
        
            } else if (missingType == 'All') {
                allDocumentTypesRejection = new List<String>{'Self Photo', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof', 'Bank Proof', 'Signed Scholarship Agreement', 'Class Eight Marks Card', 'Aadhaar Card'};
                allDocumentTypes = new List<String>{'Self Photo', 'Class Ten Marks Card', 'Class Twelve Marks Card', 'College Admission Proof', 'Bank Proof', 'Signed Scholarship Agreement'};
                
                if (contactState == 'Uttar Pradesh') {allDocumentTypes.add('Class Eight Marks Card');
                }
                if (aadharAvailable == 'Yes') {allDocumentTypes.add('Aadhaar Card');
                }
        
            } else {
                allDocumentTypesRejection = new List<String>{'Bank Proof', 'Signed Scholarship Agreement'};
                allDocumentTypes = new List<String>{'Bank Proof', 'Signed Scholarship Agreement'};
            }
        
            // Count rejected documents based on the 'missingType' defined document types
            Integer rejectedCount = 0;
            if (!contentDocumentIds.isEmpty()) {
                rejectedCount = [SELECT COUNT() 
                                 FROM ContentVersion 
                                 WHERE ContentDocumentId IN :contentDocumentIds 
                                 AND Applicant_Document_Status__c = 'Rejected'
                                 AND IsLatest = true
                                 AND Applicant_Document_Type__c IN :allDocumentTypesRejection];
            }
        
            // Fetch existing documents based on the ContentDocumentIds
            Set<String> existingDocumentTypes = new Set<String>();
            if (!contentDocumentIds.isEmpty()) {
                List<ContentVersion> existingDocuments = [
                    SELECT Id, Applicant_Document_Type__c
                    FROM ContentVersion
                    WHERE ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    ORDER BY Applicant_Document_Type__c ASC
                ];
        
                for (ContentVersion doc : existingDocuments) {
                    if (doc.Applicant_Document_Type__c != null) {
                        existingDocumentTypes.add(doc.Applicant_Document_Type__c);
                    }
                }
            }
        
            // Identify missing document types
            Integer missingDocumentCount = 0;
            for (String docType : allDocumentTypes) {
                if (!existingDocumentTypes.contains(docType)) {
                    missingDocumentCount++;
                }
            }
        
            // Aggregate the counts
            Integer totalCount = rejectedCount + missingDocumentCount;
        
            System.debug('Number of rejected documents based on missingType: ' + rejectedCount);
            System.debug('Missing Documents Count: ' + missingDocumentCount);
            System.debug('Total Document Count: ' + totalCount);
        
            // Update Application status if no documents are missing or rejected
            if (totalCount == 0) {
                Application__c application = [SELECT Id, Application_External_Status__c, Application_Internal_Status__c
                                              FROM Application__c
                                              WHERE Id = :applicationId
                                              LIMIT 1];
                application.Application_External_Status__c = 'Application Under Review';
                if (missingType == 'applicationDoc'){
                   application.Application_Internal_Status__c = 'Application Document Submitted';
                }else if(missingType == 'offerDoc'){
                    application.Application_Internal_Status__c = 'Offer Acceptance Document Submitted';
                }else{
                    //need to add in future
                }
        
                update application;
                System.debug('Application updated to Under Review and Application Document Submitted');
            } else {
                System.debug('Documents are still missing or rejected. No update to application status.');
            }
         }catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'MissingOrRejectedDocumentCount', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException(e.getMessage());
         }
    }

    @AuraEnabled
    public static List<School__c> getSchoolManagementType(String schoolName) {
        try {
            if (String.isBlank(schoolName)) {
                throw new APFS_CustomException('schoolName cannot be null or empty.');
            }
 
            String query = 'SELECT Id, School_Name__c,School_Management_Type__c FROM School__c WHERE School_Name__c = :schoolName';
            List<School__c> schoolRecords = Database.query(query);
            return schoolRecords;
        }catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getSchoolManagementType', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Failed to fetch schools: ' + e.getMessage());
        } 
    }
     @AuraEnabled
    public static List<Institute__c> getInstituteManagement(String instituteName) {
        try {
            if (String.isBlank(instituteName)) {
                throw new APFS_CustomException('instituteName cannot be null or empty.');
            }
 
            String query = 'select id,Institute_Category__c,Institute_Management__c,Institute_State__c, Institute_District__c from Institute__c where Institute_Name__c=:instituteName';
            List<Institute__c> instituteRecords = Database.query(query);
            return instituteRecords;
        }catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getInstituteManagement', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Failed to fetch Institute Management: ' + e.getMessage());
        } 
    }
        public class ContentVersionWrapperForOffer {
        @AuraEnabled 
        public List<ContentVersion> documents { get; set; }
        public ContentVersionWrapperForOffer() {
            this.documents = new List<ContentVersion>();
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static ContentVersionWrapperForOffer getFilteredDocumentsForOffer(Id applicationId) {
        ContentVersionWrapperForOffer resultWrapper = new ContentVersionWrapperForOffer();
        
        try {
            Id contactId = [SELECT Id, Name, 
                            (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
                            FROM Contact 
                            WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)][0].Id;
            List<ContentDocumentLink> contentDocumentLinks = [
                SELECT ContentDocumentId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :contactId
            ];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            
            // Fetch ContentVersion records based on Contact Only
            if (!contentDocumentIds.isEmpty()) {
                List<ContentVersion> contactDocuments = [
                    SELECT Id, Contact__c, Title, Applicant_Document_Type__c, Applicant_Document_Status__c, Application__c, 
                    FileType, FileExtension, ContentDocumentId, ContentUrl, VersionNumber, Application_Document_Comment__c
                    FROM ContentVersion
                    WHERE ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    AND Applicant_Document_Type__c!=Null
                    AND Applicant_Document_Type__c != 'Signed Scholarship Agreement'
                    Order by Applicant_Document_Type__c asc
                ];
                resultWrapper.documents.addAll(contactDocuments);
            }
            
            // Fetch ContentVersion records based on Application
            if (applicationId != null) {
                List<ContentVersion> applicationDocuments = [
                    SELECT Id, Contact__c, Title, Applicant_Document_Type__c, Applicant_Document_Status__c, Application__c, 
                    FileType, FileExtension, ContentDocumentId, ContentUrl, VersionNumber, Application_Document_Comment__c, Application__r.Id
                    FROM ContentVersion
                    WHERE Application__c = :applicationId
                    AND ContentDocumentId IN :contentDocumentIds
                    AND IsLatest = true
                    AND Applicant_Document_Type__c!=Null
                    AND Applicant_Document_Type__c = 'Signed Scholarship Agreement'
                    Order by Applicant_Document_Type__c asc
                ];
                resultWrapper.documents.addAll(applicationDocuments);
            }
            
            System.debug('Combined Documents for offer: ' + resultWrapper.documents.size());
            
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'getFilteredDocumentsForOffer', e.getMessage(), UserInfo.getUserId());
           	throw new APFS_CustomException(e.getMessage());
        }
        return resultWrapper;
    }
    
    @AuraEnabled
    public static void deleteFilesByContentDocumentIds(List<Id> contentDocumentIds) {
        try {
            List<ContentDocument> documentsToDelete = [SELECT Id FROM ContentDocument WHERE Id IN :contentDocumentIds];
            if(!documentsToDelete.isEmpty()) {
                delete documentsToDelete;
            }
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_ContactDocumentsController', 'deleteFilesByContentDocumentIds', e.getMessage(), UserInfo.getUserId());
           	throw new APFS_CustomException(e.getMessage());
        }
    }
    
    // method to show Profile Photo based on contact
      @AuraEnabled
    public static List<DocumentWrapper> fetchprofileDocumentsByType(String documentType, string applicationId) {
           // Query to get contactId based on applicationId
            Id contactId = [SELECT Id, Name, 
                            (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
                            FROM Contact 
                            WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)
                           ][0].Id;
        List<DocumentWrapper> documentWrappers = new List<DocumentWrapper>();

        try {
          
            // Query for all ContentVersion records that match the contact and document type
            List<ContentVersion> contentVersions = [
                SELECT ContentDocumentId, Title 
                FROM ContentVersion 
                WHERE Contact__c =:contactId
                AND Applicant_Document_Type__c = :documentType
                limit 1
            ];

            // Create DocumentWrapper objects for each ContentVersion record
            for (ContentVersion version : contentVersions) { if (version.ContentDocumentId != null && version.Title != null) {documentWrappers.add(new DocumentWrapper(version.ContentDocumentId, version.Title));
                }
            }

            // Return the list of DocumentWrapper objects
            return documentWrappers;
        } catch (Exception ex) {APFS_DebugLogUtility.logError('Class', 'APFS_BankAndAgreementFileController', 'fetchDocumentsByType', ex.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching documents: ' + ex.getMessage());
        }
    } 
    
     /**
     * @description Wrapper class to hold ContentDocumentId and fileName.
     */
    public class DocumentWrapper {
        @AuraEnabled
        public String contentDocumentId;
        @AuraEnabled
        public String fileName;

        public DocumentWrapper(String contentDocumentId, String fileName) {this.contentDocumentId = contentDocumentId;
            this.fileName = fileName;
        }
    } 

}