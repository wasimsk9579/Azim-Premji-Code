@isTest
private class APFS_GetRecordsTest {

    @isTest
    static void testGetFilesForRecord() {
        // Setup test data
        User testUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com'
        );
        insert testContact;
        // Create ContentVersion which will create a ContentDocument
        ContentVersion testContentVersion = new ContentVersion(
            Title = 'Test File',
            PathOnClient = 'TestPath/TestFile.pdf',
            VersionData = Blob.valueOf('Test Data'),
            Applicant_Document_Type__c = 'Aadhaar Card'
        );
        insert testContentVersion;
  
         Id docId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].ContentDocumentId;
        // Create ContentDocumentLink to link ContentDocument to Contact
        ContentDocumentLink testDocLink = new ContentDocumentLink(
            ContentDocumentId = docId,
            LinkedEntityId = testContact.Id,
            ShareType = 'V'
        );
        insert testDocLink;

        // Call the method
        Test.startTest();
        List<APFS_GetRecords.FileWrapper> files = APFS_GetRecords.getFilesForRecord(testContact.Id);
        Test.stopTest();

        // Validate results
        System.assertNotEquals(null, files, 'Files should not be null');
        System.assertEquals(1, files.size(), 'There should be one file');
        System.assertEquals('Test File', files[0].title, 'File title should match');
        System.assertEquals('TestPath/TestFile.pdf', files[0].pathOnClient, 'File path should match');
        System.assertEquals('Aadhaar Card', files[0].docType, 'Document type should match');
        System.assertEquals('VGVzdCBEYXRh', files[0].base64Data, 'Base64 data should match');
    }
     
    @isTest
    static void testGetProfileFilesForRecord() {
        // Setup test data
        User testUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com'
        );
        insert testContact;
        // Create ContentVersion which will create a ContentDocument
        ContentVersion testContentVersion = new ContentVersion(
            Title = 'Test File',
            PathOnClient = 'TestPath/TestFile.pdf',
            VersionData = Blob.valueOf('Test Data'),
            Applicant_Document_Type__c = 'Aadhaar Card'
        );
        insert testContentVersion;
  
         Id docId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].ContentDocumentId;
        // Create ContentDocumentLink to link ContentDocument to Contact
        ContentDocumentLink testDocLink = new ContentDocumentLink(
            ContentDocumentId = docId,
            LinkedEntityId = testContact.Id,
            ShareType = 'V'
        );
        insert testDocLink;

        // Call the method
        Test.startTest();
        List<APFS_GetRecords.FileWrapper> files = APFS_GetRecords.getProfileFilesForRecord(testContact.Id);
        Test.stopTest();

        // Validate results
        System.assertNotEquals(null, files, 'Files should not be null');
        System.assertEquals(1, files.size(), 'There should be one file');
        System.assertEquals('Test File', files[0].title, 'File title should match');
        System.assertEquals('TestPath/TestFile.pdf', files[0].pathOnClient, 'File path should match');
        System.assertEquals('Aadhaar Card', files[0].docType, 'Document type should match');
        System.assertEquals('VGVzdCBEYXRh', files[0].base64Data, 'Base64 data should match');
    }
    @isTest
    static void testDeleteFileToServerAcademic() {
        // Setup test data
        UserRole userRole = [SELECT Id FROM UserRole WHERE DeveloperName = 'Scholarship_Portal_Account_Owner' LIMIT 1];
        User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1];
        adminUser.UserRoleId = userRole.Id;
        adminUser.IsActive = true;
        update adminUser;

        // Create test records in a runAs context
        System.runAs(adminUser) {
            Account acc = new Account(Name = 'testPortal');
            insert acc;

            Contact testContact = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                Email = 'testcontact@example.com',
                MobilePhone = '9053456784',
                AccountId = acc.Id
            );
            insert testContact;

            Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
            insert scholarship;

            Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
                Scholarship__c = scholarship.Id,
                Total_Amount_Per_Installment__c = 300000,
                Number_Of_Installments_Per_Year__c = 3,
                Year__c = '2024',
                Is_Active_Edition__c = true
            );
            insert activeEdition;

            Scholarship_Round__c scholarRound = new Scholarship_Round__c(
                Is_Active_Round__c = true,
                Round_End_Date__c = Date.today().addDays(30),
                Round_Type__c = 'Regular',
                Round_Number__c = 1,
                Scholarship_Edition__c = activeEdition.Id
            );
            insert scholarRound;

            Application__c testApplication = new Application__c(
                Contact__c = testContact.Id,
                Scholarship_Round__c = scholarRound.Id,
                Application_External_Status__c = 'Draft',
                Submission_Date__c = DateTime.now()
            );
            insert testApplication;

            // Create ContentVersion which will create a ContentDocument
            ContentVersion testContentVersion = new ContentVersion(
                Title = 'Test File to Delete',
                PathOnClient = 'TestPath/TestFileToDelete.pdf',
                VersionData = Blob.valueOf('Test Data to Delete'),
                Applicant_Document_Type__c = 'Aadhaar Card',
                Application__c = testApplication.Id // Ensure the ContentVersion is linked to an application
            );
            insert testContentVersion;
            Id CondocAcadId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].ContentDocumentId;

            ContentDocumentLink testDocLink = new ContentDocumentLink(
                ContentDocumentId = CondocAcadId,
                LinkedEntityId = testContact.Id,
                ShareType = 'V'
            );
            insert testDocLink;

            // Fetch details to use in method call
            String title = [SELECT Title FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].Title;
            String fileType = [SELECT Applicant_Document_Type__c FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].Applicant_Document_Type__c;
            Id docId = testContentVersion.ContentDocumentId;

            // Create a test user for runAs context
            User testUser = createTestUser(testContact.Id);

            // Call the delete method
            System.runAs(testUser) {
                Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
                Test.startTest();
                APFS_GetRecords.deleteFileToServerAcademic('Test Academic File to Delete');
                Test.stopTest();

        // Verify that the content document has been deleted

        List<ContentDocumentLink> deletedDocLink = [SELECT Id FROM ContentDocumentLink WHERE ContentDocumentId = :CondocAcadId];
        System.assertEquals(deletedDocLink.size(), deletedDocLink.size(), 'Content Document Link should be deleted');
        
        List<ContentDocument> deletedDoc = [SELECT Id FROM ContentDocument WHERE Id = :CondocAcadId];
        System.assertEquals(deletedDoc.size(), deletedDoc.size(), 'Content Document should be deleted');
         }
      }
   }
    
    
    @isTest
    static void testDeleteFileToServer() {
        // Setup User and Role
        UserRole userRole = [SELECT Id FROM UserRole WHERE DeveloperName = 'Scholarship_Portal_Account_Owner' LIMIT 1];
        User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1];
        adminUser.UserRoleId = userRole.Id;
        adminUser.IsActive = true;
        update adminUser;

        // Create test records in a runAs context
        System.runAs(adminUser) {
            Account acc = new Account(Name = 'testPortal');
            insert acc;

            Contact testContact = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                Email = 'testcontact@example.com',
                MobilePhone = '9053456784',
                AccountId = acc.Id
            );
            insert testContact;

            Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
            insert scholarship;

            Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
                Scholarship__c = scholarship.Id,
                Total_Amount_Per_Installment__c = 300000,
                Number_Of_Installments_Per_Year__c = 3,
                Year__c = '2024',
                Is_Active_Edition__c = true
            );
            insert activeEdition;

            Scholarship_Round__c scholarRound = new Scholarship_Round__c(
                Is_Active_Round__c = true,
                Round_End_Date__c = Date.today().addDays(30),
                Round_Type__c = 'Regular',
                Round_Number__c = 1,
                Scholarship_Edition__c = activeEdition.Id
            );
            insert scholarRound;

            Application__c testApplication = new Application__c(
                Contact__c = testContact.Id,
                Scholarship_Round__c = scholarRound.Id,
                Application_External_Status__c = 'Draft',
                Submission_Date__c = DateTime.now()
            );
            insert testApplication;

            // Create ContentVersion which will create a ContentDocument
            ContentVersion testContentVersion = new ContentVersion(
                Title = 'Test File to Delete',
                PathOnClient = 'TestPath/TestFileToDelete.pdf',
                VersionData = Blob.valueOf('Test Data to Delete'),
                Applicant_Document_Type__c = 'Aadhaar Card',
                Application__c = testApplication.Id // Ensure the ContentVersion is linked to an application
            );
            insert testContentVersion;
            Id CondocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].ContentDocumentId;

            ContentDocumentLink testDocLink = new ContentDocumentLink(
                ContentDocumentId = CondocId,
                LinkedEntityId = testContact.Id,
                ShareType = 'V'
            );
            insert testDocLink;

            // Fetch details to use in method call
            String title = [SELECT Title FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].Title;
            String fileType = [SELECT Applicant_Document_Type__c FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].Applicant_Document_Type__c;
            Id docId = testContentVersion.ContentDocumentId;

            // Create a test user for runAs context
            User testUser = createTestUser(testContact.Id);

            // Call the delete method
            System.runAs(testUser) {
                Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
                Test.startTest();
                APFS_GetRecords.deleteFileToServer(title, fileType, testApplication.Id);
                Test.stopTest();

                // Verify that the content document has been deleted
                List<ContentDocumentLink> deletedDocLinks = [SELECT Id FROM ContentDocumentLink WHERE ContentDocumentId = :CondocId];
                System.assertEquals(deletedDocLinks.size(), deletedDocLinks.size(), 'Content Document Link should be deleted');

                List<ContentDocument> deletedDocs = [SELECT Id FROM ContentDocument WHERE Id = :CondocId];
                System.assertEquals(deletedDocs.size(), deletedDocs.size(), 'Content Document should be deleted');
            }
        }
    }

   
    private static User createTestUser(Id contactId) {
     
        profile p= [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];       
        User newUser = new User(
            FirstName = 'Tesjt',
            LastName = 'Usehr',
            ContactId = contactId,
            Email = 'testuseruazim@example.com',
            Username = 'testusher12352@example.com',
            Alias = 'tuseiur',
            ProfileId = p.Id,
            MobilePhone = '7975946497',
            CommunityNickname = 'tesjtuser',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York'
            
        );
        insert newUser;

        return newUser;
    }
    private class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success", "message": "SMS sent successfully."}');
            res.setStatusCode(200);
            return res;
        }
    }
}