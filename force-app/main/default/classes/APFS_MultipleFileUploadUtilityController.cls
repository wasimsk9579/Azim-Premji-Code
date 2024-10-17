public without sharing class APFS_MultipleFileUploadUtilityController {

    @AuraEnabled
    public static void uploadEducationFiles(
        List<String> base64Data, 
        List<String> fileName, 
        List<String> documentType, 
        Id applicationId
    ) {
        Id contactId;
        try {
            contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
            if (contactId == null) {
                throw new AuraHandledException('ContactId not found for the current user.');
            }

            for (Integer i = 0; i < base64Data.size(); i++) {
                String fileIdentifier = documentType[i];
                system.debug('Processing file: ' + fileName[i] + ' with Document Type: ' + fileIdentifier);

                // Retrieve existing document
                ContentVersion existingContentVersion = getFileContentVersionByIdentifier(fileIdentifier, contactId);

         
               

                // Create and insert new ContentVersion
                ContentVersion newContentVersion = createNewFileContentVersion(
                    base64Data[i], 
                    fileName[i], 
                    fileIdentifier, 
                    applicationId, 
                    contactId
                );

                // Link new ContentDocument to Contact
                linkFileContentDocumentToContact(newContentVersion, contactId);
            }

        } catch (Exception e) {
            system.debug('Detailed error: ' + e);
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }

    private static ContentVersion getFileContentVersionByIdentifier(String uniqueIdentifier, Id contactId) {
        try {
            List<ContentVersion> contentVersions = [
                SELECT Id, ContentDocumentId 
                FROM ContentVersion 
                WHERE Applicant_Document_Type__c = :uniqueIdentifier 
                AND Contact__c = :contactId
                LIMIT 1
            ];
            system.debug('contentVersions.size: ' + contentVersions.size());
            return contentVersions.isEmpty() ? null : contentVersions[0];
        } catch (Exception e) {
            system.debug('Error in getFileContentVersionByIdentifier: ' + e.getMessage());
            throw e;
        }
    }

    private static void deleteFileContentDocument(Id contentDocumentId) {
        try {
            delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
            system.debug('Successfully deleted ContentDocument with Id: ' + contentDocumentId);
        } catch (Exception e) {
            system.debug('Error in deleteFileContentDocument: ' + e.getMessage());
            throw e;
        }
    }

    private static ContentVersion createNewFileContentVersion(String base64Data, String fileName, String documentType, Id applicationId, Id contactId) {
        if (String.isEmpty(base64Data)) {
            throw new AuraHandledException('Base64 data is missing or invalid for file: ' + fileName);
        }
        try {
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.Applicant_Document_Type__c = documentType;
            contentVersion.Application__c = applicationId;
            contentVersion.Contact__c = contactId;
            contentVersion.Applicant_Document_Status__c = 'Uploaded';
            insert contentVersion;
            system.debug('Created ContentVersion with Id: ' + contentVersion.Id);
            return contentVersion;
        } catch (Exception e) {
            system.debug('Error in createNewFileContentVersion: ' + e.getMessage());
            throw e;
        }
    }

        private static void linkFileContentDocumentToContact(ContentVersion contentVersion, Id contactId) {
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