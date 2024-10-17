public without sharing class APFS_GetRecords {
 @AuraEnabled
    public static List<FileWrapper> getFilesForRecord(Id contactId) {
        List<FileWrapper> files = new List<FileWrapper>();

        try {
            List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink
                                                                     WHERE LinkedEntityId = :contactId];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            List<ContentVersion> contentVersions = [SELECT Id, Title, VersionData, PathOnClient,Applicant_Document_Type__c
               										 FROM ContentVersion WHERE ContentDocumentId IN :contentDocumentIds and IsLatest =True];
            for (ContentVersion version : contentVersions) {
                files.add(new FileWrapper(
                    version.Title,
                    version.PathOnClient,
                    version.Applicant_Document_Type__c,
                    EncodingUtil.base64Encode(version.VersionData)   
                ));
            }
        } catch (Exception e) {
            throw new APFS_CustomException('Error fetching files: ' + e.getMessage());
        }
        return files;
    }
     // Fetch file for My Profile//
     @AuraEnabled(cacheable=true)
    public static List<FileWrapper> getProfileFilesForRecord(Id contactId) {
        List<FileWrapper> files = new List<FileWrapper>();

        try {
            List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink
                                                                     WHERE LinkedEntityId = :contactId];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            List<ContentVersion> contentVersions = [SELECT Id, Title, VersionData, PathOnClient,Applicant_Document_Type__c
               										 FROM ContentVersion WHERE ContentDocumentId IN :contentDocumentIds and IsLatest =True];
            for (ContentVersion version : contentVersions) {
                files.add(new FileWrapper(
                    version.Title,
                    version.PathOnClient,
                    version.Applicant_Document_Type__c,
                    EncodingUtil.base64Encode(version.VersionData)   
                ));
            }
        } catch (Exception e) {
            throw new APFS_CustomException('Error fetching files: ' + e.getMessage());
        }
        return files;
    }
    public class FileWrapper {
        @AuraEnabled
        public String title { get; set; }
        @AuraEnabled
        public String pathOnClient { get; set; }
        @AuraEnabled
        public String base64Data { get; set; }
        
         @AuraEnabled
        public String docType { get; set; }

        public FileWrapper(String title, String pathOnClient,String docType, String base64Data) {
            this.title = title;
            this.pathOnClient = pathOnClient;
            this.docType=docType;
            this.base64Data = base64Data;
            
        }
    }



// code to delete file
    @AuraEnabled
    public static void deleteFileToServer(
        String deletefilename,
        string fileType,
        Id applicationId
    ) {
        try {
            // Retrieve the contact ID of the current user
            Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
            // Check for existing document using unique identifier and delete if it exists
            ContentVersion existingContentVersion = getContentVersionByIdentifier(deletefilename,  contactId, filetype,applicationId);
           // Application__c appstatus = [SELECT Id, Application_External_Status__c FROM Application__c WHERE Id = :applicationId LIMIT 1];
            
            // In case of admission docs, no need to delete if status is 'Pending'
            if (existingContentVersion != null) {
                deleteContentDocument(existingContentVersion.ContentDocumentId);
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting file: ' + e.getMessage());
        }
    }

    private static ContentVersion getContentVersionByIdentifier(String deletefilename, Id contactId,string fileType,Id applicationId) {
      List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink
                                                                     WHERE LinkedEntityId = :contactId];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            List<ContentVersion> contentVersions = [SELECT Id, Title,ContentDocumentId, VersionData, PathOnClient,Applicant_Document_Type__c,Application__c
               										 FROM ContentVersion WHERE ContentDocumentId IN :contentDocumentIds and Title=:deletefilename and Applicant_Document_Type__c=:fileType and Application__c=:applicationId];
        return contentVersions.isEmpty() ? null : contentVersions[0];
    }

    private static void deleteContentDocument(Id contentDocumentId) {
        // Delete the ContentDocument, which will cascade delete associated ContentVersion and ContentDocumentLink records
        delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];

    }
    
    //++++++++++++++++++ Delete file for Academic Detail++++++++++++++
     @AuraEnabled
    public static void deleteFileToServerAcademic(
        String deletefilename  
        // Id applicationId
    ) {
        try {
            // Retrieve the contact ID of the current user
            Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
            // Check for existing document using unique identifier and delete if it exists
            ContentVersion existingContentVersion = getContentVersionByIdentifierAcademic(deletefilename,  contactId);
           // Application__c appstatus = [SELECT Id, Application_External_Status__c FROM Application__c WHERE Id = :applicationId LIMIT 1];
            
            // In case of admission docs, no need to delete if status is 'Pending'
            if (existingContentVersion != null) {
                deleteContentDocumentAcademic(existingContentVersion.ContentDocumentId);
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting file: ' + e.getMessage());
        }
    }

    private static ContentVersion getContentVersionByIdentifierAcademic(String deletefilename, Id contactId) {

      List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink
                                                                     WHERE LinkedEntityId = :contactId];
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink link : contentDocumentLinks) {
                contentDocumentIds.add(link.ContentDocumentId);
            }
            List<ContentVersion> contentVersions = [SELECT Id, Title,ContentDocumentId, VersionData, PathOnClient,Applicant_Document_Type__c
               										 FROM ContentVersion WHERE ContentDocumentId IN :contentDocumentIds and Title=:deletefilename];
        
        return contentVersions.isEmpty() ? null : contentVersions[0];
    }

    private static void deleteContentDocumentAcademic(Id contentDocumentId) {
        // Delete the ContentDocument, which will cascade delete associated ContentVersion and ContentDocumentLink records
        delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];

    }
}