public without sharing class APFS_FilesAndAttachmentUtilityController {
    
    @AuraEnabled
    public static void uploadFileToServer(
        List<String> base64Data, 
        List<String> fileName, 
        List<String> documentType, 
        Id applicationId
    ) {
        try {
            Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
            
            for (Integer i = 0; i < base64Data.size(); i++) {
                System.debug('i::'+i);                
                ContentVersion newContentVersion = createNewContentVersion(
                    base64Data[i], 
                    fileName[i], 
                    documentType[i], 
                    applicationId
                );
                System.debug('linkContentDocumentToContact---'+newContentVersion);
                
                // Link the content document to the contact
                linkContentDocumentToContact(newContentVersion, contactId);
            }
            
        } catch (Exception e) {
            System.debug('exception esss'+e);
            throw new APFS_CustomException('Error fetching files: ' + e.getMessage());
        }
    }
    
    private static ContentVersion createNewContentVersion(String base64Data, String fileName, String documentType, Id applicationId) {
        Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
        contentVersion.Title = fileName;
        contentVersion.PathOnClient = fileName;
        contentVersion.Applicant_Document_Type__c = documentType;
        contentVersion.Application__c = applicationId;
        contentVersion.Contact__c = contactId;	
        contentVersion.Applicant_Document_Status__c = 'Uploaded';
        if (Test.isRunningTest()) {
            Id networkId = [SELECT Id FROM Network LIMIT 1].Id;
            contentVersion.NetworkId = networkId;
        }
        try{
            insert contentVersion;
            
        } catch (Exception e) {
            System.debug('exception esss'+e);
            throw new APFS_CustomException('Error fetching files: ' + e.getMessage());
        }
        return contentVersion;
    }
    
    //  method to create contentDocumentLink
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
    
   
    //========================================================= code for upload file in my profile==================================================================
    /*    @AuraEnabled
    public static void uploadMyProfileFiles(
        List<String> base64Data, 
        List<String> fileName, 
        List<String> documentType) {
            try {
                Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
               
                for (Integer i = 0; i < base64Data.size(); i++) {
                    
                    String uniqueIdentifier = documentType[i];              
                    
                    ContentVersion existingContentVersion = getFileContentVersionByIdentifier(uniqueIdentifier,contactId);
                    
                    
                    if (existingContentVersion != null) {
                        if(uniqueIdentifier =='Self Photo'){
                            deleteFileContentDocument(existingContentVersion.ContentDocumentId);
                        }
                        
                    }
                    
                    ContentVersion newContentVersion = createNewContentVersionForMyProfileFiles(
                        base64Data[i], 
                        fileName[i], 
                        documentType[i]
                    );
                    
                    linkContentDocumentToContact(newContentVersion, contactId);
                }
                
            } catch (Exception e) {
                throw new APFS_CustomException('Error uploading file: ' + e.getMessage());
            }
        }
    
    private static ContentVersion createNewContentVersionForMyProfileFiles(String base64Data, String fileName, String documentType) {
        Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
        
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
        contentVersion.Title = fileName;
        contentVersion.PathOnClient = fileName;
        contentVersion.Applicant_Document_Type__c = documentType;
        contentVersion.Contact__c = contactId;	
        contentVersion.Applicant_Document_Status__c = 'Uploaded';
        if (Test.isRunningTest()) {
            Id networkId = [SELECT Id FROM Network LIMIT 1].Id;
            contentVersion.NetworkId = networkId;
        }
        
        insert contentVersion;
        
        return contentVersion;
    }
    
      private static ContentVersion getFileContentVersionByIdentifier(String uniqueIdentifier,Id contactId) {
        List<ContentVersion> contentVersions = [
            SELECT Id, ContentDocumentId 
            FROM ContentVersion 
            WHERE Applicant_Document_Type__c = :uniqueIdentifier AND Contact__c=:contactId
            LIMIT 1
        ];
        system.debug('contentVersions.'+contentVersions.size());
        return contentVersions.isEmpty() ? null : contentVersions[0];
        
    }
       private static void deleteFileContentDocument(Id contentDocumentId) {
        delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
    }*/
    
    
	//====================================================================================================================================
    
     @AuraEnabled
    public static List<String>  FilesuploadtoServer(List<String> base64DataList, List<String> fileNameList, List<String> documentTypeList,Id applicationId) {
          List<String> contentDocumentIds = new List<String>();
        // Perform basic input validation
        if (base64DataList == null || base64DataList.isEmpty()) {
            throw new APFS_CustomException('File data cannot be empty.');
        }
        if (fileNameList == null || fileNameList.isEmpty()) {
            throw new APFS_CustomException('File name cannot be empty.');
        }
        if (documentTypeList == null || documentTypeList.isEmpty()) {
            throw new APFS_CustomException('Document type cannot be empty.');
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
                contentDocumentIds.add(contentDocumentId);
            } else {throw new APFS_CustomException('ContentDocumentId not returned for file: ' + fileName);
            }
            }
			return contentDocumentIds;
        } catch (Exception ex) {throw new APFS_CustomException('An unexpected error occurred during the file upload process: ' + ex.getMessage());
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
        } catch (Exception ex) {throw new APFS_CustomException('Failed to associate the uploaded file with the contact: ' + ex.getMessage());
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
    } catch (Exception ex) {throw new APFS_CustomException('Error fetching ContentDocumentId for ContentVersionId: ' + ex.getMessage());
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
        } catch (Exception ex) {throw new APFS_CustomException('Failed to create the new file: ' + ex.getMessage());
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
            
        } catch (Exception ex) {throw new APFS_CustomException('Unable to find the associated contact for the current user.');
        }
    }
    
}