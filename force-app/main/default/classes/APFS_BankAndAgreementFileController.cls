public class APFS_BankAndAgreementFileController {
  
     @AuraEnabled
    public static List<String>  FilesuploadtoServer(List<String> base64DataList, List<String> fileNameList, List<String> documentTypeList,Id applicationId) {
          List<String> contentDocumentIds = new List<String>();
        // Perform basic input validation
        if (base64DataList == null || base64DataList.isEmpty()) {throw new APFS_CustomException('File data cannot be empty.');
        }
        if (fileNameList == null || fileNameList.isEmpty()) {throw new APFS_CustomException('File name cannot be empty.');
        }
        if (documentTypeList == null || documentTypeList.isEmpty()) {throw new APFS_CustomException('Document type cannot be empty.');
        }
        

        try {
            // Get the current contact associated with the user
            Id currentUserContactId = getCurrentUserContactId();

            // Iterate over the list of files and process each file
            for (Integer i = 0; i < base64DataList.size(); i++) {
                String base64Data = base64DataList[i];
                String fileName = fileNameList[i];
                String documentType = documentTypeList[i];
                Id appId=applicationId;

         

                // Create the new ContentVersion (file upload)
                ContentVersion contentVersion = createContentVersion(base64Data, fileName, documentType, currentUserContactId,appId);

                // Link the uploaded file to the contact
                linkFileToContact(contentVersion, currentUserContactId);
                
                   // Use the utility method to fetch the ContentDocumentId
            	Id contentDocumentId = getContentDocumentIdByVersionId(contentVersion.Id);

            // Ensure ContentDocumentId is present before adding to the list
            if (contentDocumentId != null) {
                contentDocumentIds.add(contentDocumentId);} else {throw new APFS_CustomException('ContentDocumentId not returned for file: ' + fileName);
            }
            }
			return contentDocumentIds;
        } catch (Exception ex) {APFS_DebugLogUtility.logError('Class', 'APFS_BankAndAgreementFileController', 'FilesuploadtoServer', ex.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('An unexpected error occurred during the file upload process: ' + ex.getMessage());

        }
    }
    
        /**
     * @description Creates a ContentDocumentLink to associate the file with the contact.
     * @param contentDocumentId The ContentDocumentId of the file.
     * @param contactId The Id of the contact to link the file to.
     * @throws APFS_CustomException If the link creation fails.
     */
    private static void linkFileToContact(ContentVersion contentVersion , Id contactId) {
        try {
            ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
            contentDocumentLink.ContentDocumentId = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :contentVersion.Id
        ].ContentDocumentId;
            contentDocumentLink.LinkedEntityId = contactId;
            contentDocumentLink.ShareType = 'V'; // Viewer permission
            contentDocumentLink.Visibility = 'AllUsers';
            insert contentDocumentLink;
        } catch (Exception ex) { APFS_DebugLogUtility.logError('Class', 'APFS_BankAndAgreementFileController', 'linkFileToContact', ex.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Failed to associate the uploaded file with the contact: ' + ex.getMessage());
        }
    }
    
    
    private static Id getContentDocumentIdByVersionId(Id contentVersionId) {
    try {
        // Query for the ContentDocumentId using the provided ContentVersion Id
        ContentVersion contentVersion = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id = :contentVersionId 
            LIMIT 1
        ];
        
        // Ensure the ContentDocumentId exists; throw an exception if not found
        if (contentVersion.ContentDocumentId == null) {throw new APFS_CustomException('ContentDocumentId not found for ContentVersionId: ' + contentVersionId);
        }
        
        // Return the ContentDocumentId
        return contentVersion.ContentDocumentId;
    } catch (Exception ex) {APFS_DebugLogUtility.logError('Class', 'APFS_BankAndAgreementFileController', 'getContentDocumentIdByVersionId', ex.getMessage(), UserInfo.getUserId());
        throw new APFS_CustomException('Error fetching ContentDocumentId for ContentVersionId: ' + ex.getMessage());
    }
}
    
     private static ContentVersion createContentVersion(String base64Data, String fileName, String documentType, Id contactId,Id appId) {
        try {
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.Applicant_Document_Type__c = documentType;
            contentVersion.Contact__c = contactId;
            contentVersion.Applicant_Document_Status__c = 'Uploaded';
              contentVersion.Application__c = appId;
            
            // Network association for test environments
            if (Test.isRunningTest()) {
                Id networkId = [SELECT Id FROM Network LIMIT 1].Id;
                contentVersion.NetworkId = networkId;
            }

            insert contentVersion;
            return contentVersion;
        } catch (Exception ex) {APFS_DebugLogUtility.logError('Class', 'APFS_BankAndAgreementFileController', 'createContentVersion', ex.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Failed to create the new file: ' + ex.getMessage());
        }
    }

        /**
     * @description Retrieve the current user's associated contact based on the logged-in user's contact information.
     * @return Id of the contact associated with the current user.
     * @throws APFS_CustomException If the contactId is not found or query fails.
     */
    private static Id getCurrentUserContactId() {
        try {
            return [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1].ContactId;
            
        } catch (Exception ex) {APFS_DebugLogUtility.logError('Class', 'APFS_BankAndAgreementFileController', 'getCurrentUserContactId', ex.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Unable to find the associated contact for the current user.');
        }
    }
    
        /**
     * @description Deletes the existing document's ContentDocument associated with the contact.
     * @param contentDocumentId The Id of the ContentDocument to be deleted.
     * @throws APFS_CustomException If the deletion operation fails.
     */
	@AuraEnabled
    public static void deleteFileByContentDocumentId(Id contentDocumentId) {
        try {
            delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId]; } catch (Exception ex) {throw new APFS_CustomException('Failed to delete existing document: ' + ex.getMessage());
        }
    }
    
     /**
     * @description Fetches the ContentDocumentIds and Titles based on ContactId and DocumentType.
     * @return A list of DocumentWrapper containing ContentDocumentIds and fileNames.
     * @throws APFS_CustomException If an error occurs during the query process.
     */
    @AuraEnabled
    public static List<DocumentWrapper> fetchDocumentsByType(String documentType) {
        List<DocumentWrapper> documentWrappers = new List<DocumentWrapper>();

        try {
            // Get the current contact associated with the user
            Id currentUserContactId = getCurrentUserContactId();

            // Query for all ContentVersion records that match the contact and document type
            List<ContentVersion> contentVersions = [
                SELECT ContentDocumentId, Title 
                FROM ContentVersion 
                WHERE Contact__c = :currentUserContactId 
                AND Applicant_Document_Type__c = :documentType
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