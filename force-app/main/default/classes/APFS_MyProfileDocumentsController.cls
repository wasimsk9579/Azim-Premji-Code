/**
 * @description       : Handles file upload and ensures that previous documents of the same type are deleted before adding new ones.
 *                      This is specifically used for uploading and associating profile documents to the Contact. Supports single and multiple file uploads.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 17-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
public with sharing class APFS_MyProfileDocumentsController {

    /**
     * @description Main method to handle file upload and association with the contact.
     *              Deletes any existing document of the same type (e.g., "Self Photo") before uploading the new one.
     *              Supports single and multiple file uploads.
     * @param base64DataList A list of Base64 encoded file data.
     * @param fileNameList A list of file names corresponding to the files being uploaded.
     * @param documentTypeList A list of document types corresponding to the files being uploaded (e.g., "Self Photo").
     * @throws APFS_CustomException If any error occurs during the file upload process.
     */
    @AuraEnabled
    public static List<String>  uploadFilesToServer(List<String> base64DataList, List<String> fileNameList, List<String> documentTypeList) {
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

                // Only perform check and delete for document type 'Self Photo'
                if (documentType == 'Self Photo') {
                    ContentVersion existingProfilePhoto = checkExistingProfilePhoto(currentUserContactId, documentType);
                    if (existingProfilePhoto != null) {
                        deleteFileByContentDocumentId(existingProfilePhoto.ContentDocumentId);
                    }
                }

                // Create the new ContentVersion (file upload)
                ContentVersion contentVersion = createContentVersion(base64Data, fileName, documentType, currentUserContactId);

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

    /**
     * @description Check if a document of a specific type already exists for the contact and document type.
     * @param contactId The Id of the contact.
     * @param documentType The type of document being checked (e.g., "Self Photo").
     * @return ContentVersion The existing ContentVersion if found, otherwise null.
     * @throws APFS_CustomException If the query fails.
     */
    private static ContentVersion checkExistingProfilePhoto(Id contactId, String documentType) {
        try {
            List<ContentVersion> contentVersions = [
                SELECT Id, ContentDocumentId 
                FROM ContentVersion 
                WHERE Applicant_Document_Type__c = :documentType AND Contact__c = :contactId
                LIMIT 1
            ];
            return contentVersions.isEmpty() ? null : contentVersions[0];
        } catch (Exception ex) {throw new APFS_CustomException('Error querying for existing document: ' + ex.getMessage());
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
            delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
        } catch (Exception ex) {throw new APFS_CustomException('Failed to delete existing document: ' + ex.getMessage());
        }
    }

    /**
     * @description Creates a new ContentVersion (file) in Salesforce.
     * @param base64Data The Base64 encoded file data.
     * @param fileName The name of the file being uploaded.
     * @param documentType The type of document being uploaded (e.g., "Self Photo").
     * @param contactId The Id of the contact to associate the file with.
     * @return ContentVersion The newly created ContentVersion object.
     * @throws APFS_CustomException If the file creation fails.
     */
    private static ContentVersion createContentVersion(String base64Data, String fileName, String documentType, Id contactId) {
        try {
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.Applicant_Document_Type__c = documentType;
            contentVersion.Contact__c = contactId;
            contentVersion.Applicant_Document_Status__c = 'Uploaded';
            
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
    
    
    /**
 * @description Fetches the ContentDocumentId associated with the provided ContentVersionId.
 *              This method queries Salesforce for the ContentDocumentId using the ContentVersionId, 
 *              which is available after a ContentVersion is successfully inserted. It ensures that
 *              the ContentDocumentId exists and handles any errors during the query process.
 * 
 * @param contentVersionId The Id of the ContentVersion whose associated ContentDocumentId is to be fetched.
 * 
 * @return Id The ContentDocumentId associated with the provided ContentVersionId.
 * 
 * @throws APFS_CustomException If no ContentDocumentId is found or if an error occurs during the query process.
 */
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
    
    
    
  /**
     * @description Fetches the ContentDocumentIds and Titles based on ContactId and DocumentType.
     * @param documentType The type of document being fetched (e.g., "Self Photo", "Aadhaar Card").
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
            for (ContentVersion version : contentVersions) {
                if (version.ContentDocumentId != null && version.Title != null) {
                    documentWrappers.add(new DocumentWrapper(version.ContentDocumentId, version.Title));
                }
            }

            // Return the list of DocumentWrapper objects
            return documentWrappers;
        } catch (Exception ex) {throw new APFS_CustomException('Error fetching documents: ' + ex.getMessage());
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

        public DocumentWrapper(String contentDocumentId, String fileName) {
            this.contentDocumentId = contentDocumentId;
            this.fileName = fileName;
        }
    }    
}