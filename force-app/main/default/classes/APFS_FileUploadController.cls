public with sharing class APFS_FileUploadController {
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getFilesForRecord(Id recordId) {
        return [
            SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.LatestPublishedVersionId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
              AND ShareType = 'V'
        ];
    }

   		@AuraEnabled(cacheable=true)
        public static List<FileWrapper> getFilesByContentDocumentId(Id contentDocumentId) {
            List<FileWrapper> files = new List<FileWrapper>();
            
            try {
                List<ContentVersion> contentVersions = [SELECT Id, Title, VersionData, PathOnClient, Applicant_Document_Type__c
                                                        FROM ContentVersion 
                                                        WHERE ContentDocumentId = :contentDocumentId and IsLatest =True];                                         
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
            system.debug('Files--'+files);
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


  	@AuraEnabled
    public static String updateFile(Id contentDocumentId, String newFileName, String base64Data, String contentType) {
        try {
            if (contentDocumentId == null) {
                throw new AuraHandledException('ContentDocumentId cannot be null.');
            }
            ContentVersion latestVersion = [SELECT Id, ContentDocumentId, VersionData 
                                            FROM ContentVersion 
                                            WHERE ContentDocumentId = :contentDocumentId 
                                            ORDER BY CreatedDate DESC LIMIT 1];
            if (latestVersion == null) {
                throw new AuraHandledException('No ContentVersion found for the provided ContentDocumentId.');
            }
            Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
    
            // Create a new ContentVersion with updated data
            ContentVersion newVersion = new ContentVersion();
            newVersion.ContentDocumentId = latestVersion.ContentDocumentId;
            newVersion.Title = newFileName;
            newVersion.PathOnClient = newFileName;
            newVersion.VersionData = EncodingUtil.base64Decode(base64Data);
            newVersion.IsMajorVersion = false;
            newVersion.Contact__c = contactId;
            newVersion.Applicant_Document_Status__c = 'Re Uploaded';
            
            Database.SaveResult sr = Database.insert(newVersion, false);
            if (sr.isSuccess()) {
                return 'Success';
            } else {
                throw new AuraHandledException('An error occurred while updating the file: ' + sr.getErrors()[0].getMessage());
            }
        } catch (Exception e) {
            //return 'An unexpected error occurred: ' + e.getMessage();
           throw new AuraHandledException('An error occurred while updating the file: ' + e.getMessage());
        }
    }
}