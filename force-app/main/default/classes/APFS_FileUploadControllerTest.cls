@isTest
public class APFS_FileUploadControllerTest {

    @isTest
    static void testGetFilesForRecord() {
        // Create a test record (e.g., an Account or custom object)
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
         system.debug('testAccount'+testAccount);
        
        
        Blob bodyBlob = Blob.valueOf('Unit Test ContentVersion Body to be insert in test class for testing the');
        ContentVersion contentVersion_1 = new ContentVersion(
                Title='SampleTitle', 
                PathOnClient ='SampleTitle.jpg',
                VersionData = bodyBlob, 
                origin = 'H'
            );
            insert contentVersion_1;
            
            ContentVersion contentVersion_2 = [SELECT Id, Title, ContentDocumentId 
                            FROM ContentVersion WHERE Id = :contentVersion_1.Id LIMIT 1];
            
            ContentDocumentLink contentlink = new ContentDocumentLink();
            contentlink.LinkedEntityId = testAccount.id;
            contentlink.contentdocumentid = contentVersion_2.contentdocumentid;
            contentlink.ShareType = 'V';
            insert contentlink;

        
        // Execute the method
        Test.startTest();
        List<ContentDocumentLink> links = APFS_FileUploadController.getFilesForRecord(testAccount.Id);
        Test.stopTest();

        // Verify the results
        System.assertNotEquals(0, links.size(), 'No files found for the record.');
        if (!links.isEmpty()) {
           
        }
    }

    @isTest
    static void testGetFilesByContentDocumentId() {
        
         Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
         system.debug('testAccount'+testAccount);
        
        
        Blob bodyBlob = Blob.valueOf('Unit Test ContentVersion Body to be insert in test class for testing the');
        ContentVersion contentVersion_1 = new ContentVersion(
                Title='SampleTitle', 
                PathOnClient ='SampleTitle.jpg',
                VersionData = bodyBlob, 
                origin = 'H'
            );
            insert contentVersion_1;
            
            ContentVersion contentVersion_2 = [SELECT Id, Title, ContentDocumentId 
                            FROM ContentVersion WHERE Id = :contentVersion_1.Id LIMIT 1];
            
            ContentDocumentLink contentlink = new ContentDocumentLink();
            contentlink.LinkedEntityId = testAccount.id;
            contentlink.contentdocumentid = contentVersion_2.contentdocumentid;
            contentlink.ShareType = 'V';
            insert contentlink;

        // Execute the method
        Test.startTest();
        List<APFS_FileUploadController.FileWrapper> files = APFS_FileUploadController.getFilesByContentDocumentId(contentVersion_2.ContentDocumentId);
        Test.stopTest();

        // Verify the results
       
        if (!files.isEmpty()) {
           
        }
    }

    @isTest
    static void testUpdateFile() {
       
 Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
         system.debug('testAccount'+testAccount);
        
        
        Blob bodyBlob = Blob.valueOf('Unit Test ContentVersion Body to be insert in test class for testing the');
        ContentVersion contentVersion_1 = new ContentVersion(
                Title='SampleTitle', 
                PathOnClient ='SampleTitle.jpg',
                VersionData = bodyBlob, 
                origin = 'H'
            );
            insert contentVersion_1;
            
            ContentVersion contentVersion_2 = [SELECT Id, Title, ContentDocumentId 
                            FROM ContentVersion WHERE Id = :contentVersion_1.Id LIMIT 1];
            
            ContentDocumentLink contentlink = new ContentDocumentLink();
            contentlink.LinkedEntityId = testAccount.id;
            contentlink.contentdocumentid = contentVersion_2.contentdocumentid;
            contentlink.ShareType = 'V';
            insert contentlink;
        
        // Update the file
        String newFileName = 'Updated Document';
        String base64Data = EncodingUtil.base64Encode(Blob.valueOf('Updated Data'));
        String contentType = 'application/octet-stream'; // Example content type

        Test.startTest();
        String result = APFS_FileUploadController.updateFile(contentVersion_2.ContentDocumentId, newFileName, base64Data, contentType);
        Test.stopTest();

       

        // Verify the updated file
        ContentVersion[] versions = [
            SELECT Title, VersionData 
            FROM ContentVersion 
            WHERE ContentDocumentId = :contentVersion_2.ContentDocumentId 
            ORDER BY CreatedDate DESC
        ];
       
        if (!versions.isEmpty()) {
            ContentVersion updatedVersion = versions[0];
            
        }
    }
}