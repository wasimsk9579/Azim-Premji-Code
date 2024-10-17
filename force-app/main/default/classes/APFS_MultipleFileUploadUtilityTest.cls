@isTest
public class APFS_MultipleFileUploadUtilityTest {
    @testSetup
    static void setup() {
        // Create an Account (required for creating a portal user)
        Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;

        // Create a Contact associated with the Account
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            MobilePhone = '7686675678',
            AccountId = testAccount.Id
        );
        insert testContact;

        // Create a test Community or Portal User associated with the Contact
        Profile profile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1]; // Use the appropriate portal profile name
        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Alias = 'tuser',
            Email = 'testuser@example.com',
            Username = 'testuser@example.com' + System.currentTimeMillis() + '.portal',
            MobilePhone = '8976868686',
            ProfileId = profile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ContactId = testContact.Id,
            CommunityNickname = 'testuser' // Required for community users
        );
        insert testUser;

        // Create a Scholarship (assuming it's required for your application)
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship'
        );
        insert scholarship;

        // Create a Scholarship Edition (assuming it's required for your application)
        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true
        );
        insert activeEdition;

        // Create a Scholarship Round (assuming it's required for your application)
        Scholarship_Round__c scholarRound = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = activeEdition.Id
        );
        insert scholarRound;

        // Create an Application record related to the Contact
        Application__c testApplication = new Application__c(
            Contact__c = testContact.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Submitted',
            Submission_Date__c = DateTime.now()
        );
        insert testApplication;

        // Optionally, set the test user as the current user for the test context
        System.runAs(testUser) {
            // Code that runs in the context of the test user
        }
    }

    @isTest
    static void testUploadEducationFiles() {
        // Mock HTTP callout
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
 Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;
        
        
        // Create a Contact associated with the Account
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            MobilePhone = '7686675678',
            AccountId = testAccount.Id
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

        // Create an Application record related to the Contact
        Application__c testApplication = new Application__c(
            Contact__c = testContact.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now()
        );
        insert testApplication;

        // Prepare test data
        String base64Data1 = EncodingUtil.base64Encode(Blob.valueOf('Test Content 1'));
        String base64Data2 = EncodingUtil.base64Encode(Blob.valueOf('Test Content 2'));
        List<String> base64DataList = new List<String>{base64Data1, base64Data2};

        List<String> fileNameList = new List<String>{'TestFile1.pdf', 'TestFile2.pdf'};
        List<String> documentTypeList = new List<String>{'Type1', 'Type2'};

        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

        // Execute the method
        Test.startTest();
        APFS_MultipleFileUploadUtilityController.uploadEducationFiles(base64DataList, fileNameList, documentTypeList, applicationId);
        Test.stopTest();
        
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
        // Verify that ContentVersion records were created
        List<ContentVersion> contentVersions = [
            SELECT Id, Title, ContentDocumentId, Applicant_Document_Type__c, Application__c, Contact__c
            FROM ContentVersion 
            WHERE Application__c = :applicationId
        ];
        

        // Get the ContentDocumentIds from the created ContentVersions
        Set<Id> contentDocumentIds = new Set<Id>();
        for (ContentVersion cv : contentVersions) {
            contentDocumentIds.add(cv.ContentDocumentId);
            
        }
        system.debug('contentDocumentIds'+contentDocumentIds);

        // Verify that ContentDocumentLink records were created and linked to the contact
        Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;

        List<ContentDocumentLink> contentDocumentLinks = [
            SELECT Id, LinkedEntityId, ContentDocumentId
            FROM ContentDocumentLink 
            WHERE ContentDocumentId IN :contentDocumentIds
        ];

        // Verify that the number of links is as expected
        System.assertEquals(2, contentDocumentLinks.size(), 'Two ContentDocumentLink records should have been created.');

        // Check that each ContentDocumentLink corresponds to the expected ContentDocument
        for (ContentDocumentLink link : contentDocumentLinks) {
            System.assert(contentDocumentIds.contains(link.ContentDocumentId), 'ContentDocumentLink should be linked to a valid ContentDocument.');
        }
    }

    @isTest
    static void testErrorHandlingWhenContactIdIsNull() {
        // Mock HTTP callout
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Prepare test data with no ContactId for the current user
        User testUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        testUser.ContactId = null;
        update testUser;

        String base64Data = EncodingUtil.base64Encode(Blob.valueOf('Test Content'));
        List<String> base64DataList = new List<String>{base64Data};

        List<String> fileNameList = new List<String>{'TestFile.pdf'};
        List<String> documentTypeList = new List<String>{'Type1'};

        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

        // Execute the method and check for exception
        Test.startTest();
        try {
            APFS_MultipleFileUploadUtilityController.uploadEducationFiles(base64DataList, fileNameList, documentTypeList, applicationId);
            System.assert(false, 'Expected an exception to be thrown due to missing ContactId.');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('ContactId not found for the current user.'), 'Expected exception message for missing ContactId.');
        }
        Test.stopTest();
    }

    @isTest
    static void testErrorHandlingForMissingBase64Data() {
        // Mock HTTP callout
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Prepare test data with empty base64Data
        List<String> base64DataList = new List<String>{''};
        List<String> fileNameList = new List<String>{'TestFile.pdf'};
        List<String> documentTypeList = new List<String>{'Type1'};

        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

        // Execute the method and check for exception
        Test.startTest();
        try {
            APFS_MultipleFileUploadUtilityController.uploadEducationFiles(base64DataList, fileNameList, documentTypeList, applicationId);
            System.assert(false, 'Expected an exception to be thrown due to missing base64Data.');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Base64 data is missing or invalid for file'), 'Expected exception message for missing base64Data.');
        }
        Test.stopTest();
    }
}