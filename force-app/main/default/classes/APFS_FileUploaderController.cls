public without sharing class APFS_FileUploaderController {

    @AuraEnabled
    public static void uploadFileToServer(String base64Data, String fileName, String documentType, String fileUniqueIdentifier) {
        try {
            // Get the Contact ID of the current user
            Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;

            // Check for existing document using unique identifier and delete if it exists
            ContentVersion existingContentVersion = getContentVersionByIdentifier(fileUniqueIdentifier);
            
            if (existingContentVersion != null) {
                deleteContentDocument(existingContentVersion.ContentDocumentId);
            }
            
            // Create a new document
            ContentVersion newContentVersion = createNewContentVersion(base64Data, fileName, documentType, fileUniqueIdentifier);
            linkContentDocumentToContact(newContentVersion, contactId);
          
            

        } catch (Exception e) {
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }

    private static ContentVersion getContentVersionByIdentifier(String fileUniqueIdentifier) {
        List<ContentVersion> contentVersions = [
            SELECT Id, ContentDocumentId 
            FROM ContentVersion 
           // WHERE Applicant_Unique_Document_Identifier__c = :fileUniqueIdentifier 
            LIMIT 1
        ];
        return contentVersions.isEmpty() ? null : contentVersions[0];
    }

    private static void deleteContentDocument(Id contentDocumentId) {
        // Delete the ContentDocument, which will cascade delete associated ContentVersion and ContentDocumentLink records
        delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
    }

    private static ContentVersion createNewContentVersion(String base64Data, String fileName, String documentType, String fileUniqueIdentifier) {
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
        contentVersion.Title = fileName;
        contentVersion.PathOnClient = fileName;
        contentVersion.Applicant_Document_Type__c = documentType;
       // contentVersion.Applicant_Unique_Document_Identifier__c = fileUniqueIdentifier;
        insert contentVersion;
        return contentVersion;
    }

    private static void linkContentDocumentToContact(ContentVersion contentVersion, Id contactId) {
        ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
        contentDocumentLink.ContentDocumentId = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :contentVersion.Id
        ].ContentDocumentId;
        contentDocumentLink.LinkedEntityId = contactId;
        contentDocumentLink.ShareType = 'V';
        contentDocumentLink.Visibility = 'AllUsers';
        insert contentDocumentLink;
    }
}