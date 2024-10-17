@IsTest
public class APFS_ContactDocumentsControllerTest {
    
    @TestSetup
    static void setup() {
      
           // Create an Account 
    Account testAccount = new Account(
      Name = 'Test Account'
    );
    insert testAccount;

    // Create a Contact associated with the Account
    Contact testContact = new Contact(
      FirstName = 'Test',
      LastName = 'User',
      MobilePhone ='7899011797',
      AccountId = testAccount.Id
    );
    insert testContact;
    Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());  
    Contact conData = [SELECT Id,Name,owner.Name FROM Contact where Id=:testContact.Id];
            
    User testUser = createTestUser(testContact.Id);
	System.runAs(testUser) {
    
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
          Offer_Start_Month__c='January',
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
          Submission_Date__c = DateTime.now(),
          Application_Internal_Status__c='Offer Acceptance Document Submitted'
        );
        insert testApplication;
    
            ContentVersion testContentVersion = new ContentVersion(
                Title = 'Test Document',
                PathOnClient = 'TestDocument.pdf',
                VersionData = Blob.valueOf('Test data'),
                ContentLocation = 'S',
            	NetworkId = [SELECT Id FROM Network LIMIT 1].Id,
                OwnerId = UserInfo.getUserId()
            );
            insert testContentVersion;
            Id docId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1].ContentDocumentId;
            ContentDocumentLink testContentDocumentLink = new ContentDocumentLink(
                LinkedEntityId = testContact.Id,
                ContentDocumentId =docId,
                ShareType = 'V'
                
            );
            insert testContentDocumentLink;
            
                // Create an Admission record related to the Application and Contact
            Admission__c testAdmission = new Admission__c(
                Contact__c = testContact.Id,
                Application__c = testApplication.Id,
                Course_Type__c = 'Undergraduate Degree',
                Course_Year_Of_Studying__c = '2',
                Course_Start_Date__c = '2020-08-01',
                College_Student_Id__c = 'ST123456',
                Accommodation_Type__c = 'Hostel',
                Course_Duration_In_Years__c = '4',
                Year_Of_Admission__c = '2022',
                Is_Active__c = true,
                Name_Of_The_Institute__c = 'Test Institute',
                Institute_State__c = 'Test State',
                Institute_District__c = 'Test District',
                Course_Name__c = 'Engineering'
            );
            insert testAdmission;
            
        
        
       // Create a Bank Detail record related to the Contact
            Bank_Detail__c testBankDetail = new Bank_Detail__c(
                Contact__c = testContact.Id,
                Bank_Ifsc_Code__c = 'TEST1234567',
                Bank_Account_Type__c = 'Savings',
                Encrypted_Bank_Account_Number__c = 'ENCRYPTED1234',
                Branch_Name__c = 'Test Branch'
            );
            insert testBankDetail;
            
              // Create ContentVersion records related to the Contact
            ContentVersion cv1 = new ContentVersion(
                Title = 'Test Document 1',
                PathOnClient = 'TestDocument1.pdf',
                VersionData = Blob.valueOf('Test content 1'),
                Applicant_Document_Type__c = 'College Admission Proof',
                Applicant_Document_Status__c = 'Rejected',
                NetworkId = [SELECT Id FROM Network LIMIT 1].Id,
                Application__c = testApplication.Id
            );
            insert cv1;
    
            ContentVersion cv2 = new ContentVersion(
                Title = 'Test Document 2',
                PathOnClient = 'TestDocument2.pdf',
                VersionData = Blob.valueOf('Test content 2'),
                Applicant_Document_Type__c = 'College Fee Receipt',
                Applicant_Document_Status__c = 'Rejected',
                NetworkId = [SELECT Id FROM Network LIMIT 1].Id,
                Application__c = testApplication.Id
            );
            insert cv2;
    
            ContentVersion cv3 = new ContentVersion(
                Title = 'Test Document 3',
                PathOnClient = 'TestDocument3.pdf',
                VersionData = Blob.valueOf('Test content 3'),
                Applicant_Document_Type__c = 'Signed Scholarship Agreement',
                Applicant_Document_Status__c = 'Uploaded',
                NetworkId = [SELECT Id FROM Network LIMIT 1].Id,
                Application__c = testApplication.Id
            );
            insert cv3;
    }
        
        // Create sample School__c record
        School__c schoolRecord = new School__c(
            School_Name__c = 'Test School',
            School_Management_Type__c = 'Government'
        );
        insert schoolRecord;
        
        // Create sample Institute__c record
        Institute__c institute1 = new Institute__c(
            Institute_Name__c = 'Test Institute',
            Institute_Category__c = 'Category A',
            Institute_Management__c = 'Management A',
            Institute_State__c = 'State A',
            Institute_District__c = 'District A'
        );
        insert institute1;
    }

 

    @IsTest
    static void testGetFileData() {
        // Retrieve the test data
        User testUser = [SELECT Id FROM User where Username = 'Co131mand39609@example.com' LIMIT 1];
       System.runAs(testUser) {
       ContentVersion testContentVersion = [SELECT Id FROM ContentVersion LIMIT 1];
       Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());  

        Test.startTest();
        // Call the method
        String fileData = APFS_ContactDocumentsController.getFileData(testContentVersion.Id);
        Test.stopTest();
        
        // Assert
        System.assertNotEquals(null, fileData, 'File data should be returned');
       }
    }
    
      @IsTest
    static void testGetAdmissionRecords() {
        // Fetch the test data
        Contact testContact = [SELECT Id FROM Contact LIMIT 1];
        Application__c testApplication = [SELECT Id FROM Application__c LIMIT 1];
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());  

        // Call the method and validate the result
        Test.startTest();
        List<Admission__c> result = APFS_ContactDocumentsController.getAdmissionRecords(testContact.Id, testApplication.Id);
        Test.stopTest();

        // Validate that the result contains the correct Admission records
        System.assertEquals(1, result.size(), 'There should be one admission record');
        Admission__c admission = result[0];
        System.assertEquals(testContact.Id, admission.Contact__c, 'Contact ID should match');
        System.assertEquals(testApplication.Id, admission.Application__c, 'Application ID should match');
        System.assertEquals('Undergraduate Degree', admission.Course_Type__c, 'Course Type should match');
        System.assertEquals('2', admission.Course_Year_Of_Studying__c, 'Course Year should match');
        System.assertEquals('ST123456', admission.College_Student_Id__c, 'College Student ID should match');
    }
    
    
   @IsTest
    static void testGetBankDetail() {
        // Fetch the test contact
        Contact testContact = [SELECT Id FROM Contact LIMIT 1];

        // Test valid Contact ID
        Test.startTest();
        List<Bank_Detail__c> bankDetails = APFS_ContactDocumentsController.getBankDetail(testContact.Id);
        Test.stopTest();

        // Validate bank detail record
        System.assertEquals(1, bankDetails.size(), 'There should be one bank detail record');
        Bank_Detail__c bankDetail = bankDetails[0];
        System.assertEquals('Savings', bankDetail.Bank_Account_Type__c, 'Bank Account Type should be Savings');
        System.assertEquals('ENCRYPTED1234', bankDetail.Encrypted_Bank_Account_Number__c, 'Encrypted Bank Account Number should match');
        System.assertEquals('Test Branch', bankDetail.Branch_Name__c, 'Branch Name should match');
    }
     @IsTest
    static void testGetBankDetail_NullContactId() {
        try {
            // Call the method with null contact ID
            APFS_ContactDocumentsController.getBankDetail(null);
            System.assert(false, 'Expected an exception to be thrown for null contact ID.');
        } catch (APFS_CustomException e) {
            System.assertEquals('Contact ID cannot be null or empty.', e.getMessage(), 'Expected exception message for null contact ID.');
        }
    }
    @IsTest
    static void testGetBankDetail_EmptyContactId() {
        try {
            APFS_ContactDocumentsController.getBankDetail('');
            System.assert(false, 'Expected an exception to be thrown for empty contact ID.');
        } catch (APFS_CustomException e) {
            System.assertEquals('Contact ID cannot be null or empty.', e.getMessage(), 'Expected exception message for empty contact ID.');
        }
    }
    
@IsTest
static void testGetCurrentUserProfileName() {
    // Get the "Scholarship Portal Profile" profile for the test user
    Profile scholarshipPortalProfile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Profile' LIMIT 1];

    // Create a test user with the "Scholarship Portal Profile" profile
    User testUser = new User(
        FirstName = 'Test',
        LastName = 'User',
        Email = 'testuser@example.com',
        Username = 'testuser@example.com.' + System.currentTimeMillis(),
        Alias = 'tuser',
        ProfileId = scholarshipPortalProfile.Id,
        TimeZoneSidKey = 'America/Los_Angeles',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = 'en_US'
    );
    insert testUser;

    // Run the test as the newly created test user
    System.runAs(testUser) {
        Test.startTest();
        String profileName = APFS_ContactDocumentsController.getCurrentUserProfileName();
        Test.stopTest();

        // Validate that the profile name matches the expected profile
        System.assertEquals('Scholarship Portal Profile', profileName, 'The profile name should match the Scholarship Portal Profile.');
    }
}
    
     @IsTest
    static void testUpdateFileStatus() {
         User testUser = [SELECT Id FROM User where Username = 'Co131mand39609@example.com' LIMIT 1];
       	System.runAs(testUser) {
            // Fetch the test ContentVersion
            ContentVersion testContentVersion = [SELECT Id FROM ContentVersion LIMIT 1];
    
            Test.startTest();
            // Update the file status
            APFS_ContactDocumentsController.updateFileStatus(testContentVersion.Id, 'Uploaded', 'Document approved for review.');
            Test.stopTest();
    
            // Validate that the content version was updated
            ContentVersion updatedContentVersion = [SELECT Id, Applicant_Document_Status__c, Application_Document_Comment__c FROM ContentVersion WHERE Id = :testContentVersion.Id LIMIT 1];
            System.assertEquals('Uploaded', updatedContentVersion.Applicant_Document_Status__c, 'Document status should be updated to Approved');
            System.assertEquals('Document approved for review.', updatedContentVersion.Application_Document_Comment__c, 'Comment should be updated correctly');   
        }
        }

   @IsTest
    static void testGetFilteredDocuments() {
        // Fetch the test Application and Contact created in @TestSetup
        Application__c testApplication = [SELECT Id, Contact__c FROM Application__c LIMIT 1];
        Contact testContact = [SELECT Id FROM Contact WHERE Id = :testApplication.Contact__c LIMIT 1];

        Test.startTest();
        // Call the method and pass the Application Id
        APFS_ContactDocumentsController.ContentVersionWrapper resultWrapper = APFS_ContactDocumentsController.getFilteredDocuments(testApplication.Id);
        Test.stopTest();

        // Validate that the resultWrapper is not null
        System.assertNotEquals(null, resultWrapper, 'The result wrapper should not be null');

        // Loop through the documents and check their attributes
        for (ContentVersion doc : resultWrapper.documents) {
            System.assertNotEquals(null, doc.Title, 'Document title should not be null');
            System.assertNotEquals(null, doc.Applicant_Document_Type__c, 'Document type should not be null');

            // Check if the document is filtered as expected
            if (doc.Applicant_Document_Type__c == 'College Admission Proof') {
                System.assertEquals(testApplication.Id, doc.Application__c, 'Document should belong to the application');
            } else {
                System.assertEquals(testContact.Id, doc.Contact__c, 'Document should belong to the contact');
            }
        }
    }
    
  

 
	@isTest
    static void testGetReSubmissionDocuments() {
         User testUser = [SELECT Id FROM User where Username = 'Co131mand39609@example.com' LIMIT 1];
       	System.runAs(testUser) {
            Application__c testApplication = [SELECT Id, Contact__c FROM Application__c LIMIT 1];
            Contact testContact = [SELECT Id FROM Contact WHERE Id = :testApplication.Contact__c LIMIT 1];
    
             ContentVersion testContentVersion = [SELECT Id FROM ContentVersion LIMIT 1];
            // Step 2: Run the method under test
            Test.startTest();
            APFS_ContactDocumentsController.ContentWrapper resultWrapper = APFS_ContactDocumentsController.getReSubmissionDocuments(testApplication.Id);
            Test.stopTest();
        }
    }
    @isTest
    static void testGetMissingDocumentTypes() {
         User testUser = [SELECT Id FROM User where Username = 'Co131mand39609@example.com' LIMIT 1];
       	System.runAs(testUser) {
            // Fetch the existing contact and application
            Contact testContact = [SELECT Id FROM Contact LIMIT 1];
            Application__c testApplication = [SELECT Id FROM Application__c WHERE Contact__c = :testContact.Id LIMIT 1];
    
            // Call the method to test
            Test.startTest();
            List<String> missingDocs = APFS_ContactDocumentsController.getMissingDocumentTypes(testApplication.Id, 'applicationDoc');
            Test.stopTest();
    
            // Verify the results
            System.assertEquals(4, missingDocs.size()); // Should be 4 missing types
            System.assert(missingDocs.contains('Self Photo'));
            System.assert(missingDocs.contains('Class Ten Marks Card'));
            System.assert(missingDocs.contains('Class Twelve Marks Card'));
        }
    }
    @isTest
    static void testGetMissingDocumentTypesAll() {
         User testUser = [SELECT Id FROM User where Username = 'Co131mand39609@example.com' LIMIT 1];
       	System.runAs(testUser) {
            // Fetch the existing contact and application
            Contact testContact = [SELECT Id FROM Contact LIMIT 1];
            Application__c testApplication = [SELECT Id FROM Application__c WHERE Contact__c = :testContact.Id LIMIT 1];
    
            // Call the method to test
            Test.startTest();
            List<String> missingDocs = APFS_ContactDocumentsController.getMissingDocumentTypes(testApplication.Id, 'All');
            Test.stopTest();
    
            // Verify the results
            System.assertEquals(6, missingDocs.size()); // Should be 4 missing types
            System.assert(missingDocs.contains('Self Photo'));
            System.assert(missingDocs.contains('Class Ten Marks Card'));
            System.assert(missingDocs.contains('Class Twelve Marks Card'));
        }
    }


    
    
    @IsTest
    static void testUpdateDocumentStatus() {
         User testUser = [SELECT Id FROM User where Username = 'Co131mand39609@example.com' LIMIT 1];
            System.runAs(testUser) {
            // Setup test data
            ContentDocument doc = [SELECT Id FROM ContentDocument LIMIT 1];
            String newStatus = 'Uploaded';
            String applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;
    
            // Run the method
            Test.startTest();
            APFS_ContactDocumentsController.updateDocumentStatus(doc.Id, newStatus, applicationId);
            Test.stopTest();
    
            // Verify that the status is updated correctly
            ContentVersion updatedVersion = [SELECT Applicant_Document_Status__c FROM ContentVersion WHERE ContentDocumentId = :doc.Id LIMIT 1];
            System.assertEquals('Uploaded', updatedVersion.Applicant_Document_Status__c);
        }
    }

    @IsTest
    static void testCreateApplicationStatusComment() {
        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

        Test.startTest();
        String result = APFS_ContactDocumentsController.createApplicationStatusComment(applicationId, 'Not Selected', 'Test comment', 'Inadequate documents');
        Test.stopTest();

        // Verify if the status comment was created successfully
        Application_Status_Comment__c comment = [SELECT Application__c, Application_Internal_Status__c, Comment__c, Rejected_Reason__c FROM Application_Status_Comment__c WHERE Application__c = :applicationId LIMIT 1];
        System.assertEquals('Test comment', comment.Comment__c);
        System.assertEquals('Inadequate documents', comment.Rejected_Reason__c);
        System.assertEquals('Success', result);
    }

    @IsTest
    static void testDeleteAllProcessedFiles() {
        // Fetch ContentVersion Ids
        List<ContentVersion> versions = [SELECT Id FROM ContentVersion LIMIT 1];
        List<String> contentVersionIds = new List<String>();
        for (ContentVersion version : versions) {
            contentVersionIds.add(version.Id);
        }

        // Run the method
        Test.startTest();
        APFS_ContactDocumentsController.deleteAllProcessedFiles(contentVersionIds);
        Test.stopTest();

        // Verify that files are deleted
        List<ContentDocument> deletedDocuments = [SELECT Id FROM ContentDocument WHERE Id IN (SELECT ContentDocumentId FROM ContentVersion WHERE Id IN :contentVersionIds)];
        System.assertEquals(0, deletedDocuments.size());
    }

   /* @IsTest
    static void testGetPicklistValues() {
        List<String> fieldApiNames = new List<String>{'Salutation'};

        Test.startTest();
        Map<String, List<String>> result = APFS_ContactDocumentsController.getPicklistValues(fieldApiNames);
        Test.stopTest();

        // Verify that picklist values are returned correctly
        System.assert(result.containsKey('Salutation'));
        System.assert(result.get('Salutation').size() > 0);
    }*/

    @IsTest
    static void testMissingOrRejectedDocumentCountforApp() {
        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

       Test.startTest();
        APFS_ContactDocumentsController.MissingOrRejectedDocumentCount(applicationId, 'applicationDoc');
        Test.stopTest();

        // Verify logs or application status updates in case of missing/rejected documents
        Application__c updatedApplication = [SELECT Application_External_Status__c, Application_Internal_Status__c FROM Application__c WHERE Id = :applicationId];
        System.assertEquals('Submitted', updatedApplication.Application_External_Status__c);
        
     }
     @IsTest
    static void testMissingOrRejectedDocumentCountforOffer() {
        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

       Test.startTest();
        APFS_ContactDocumentsController.MissingOrRejectedDocumentCount(applicationId, 'offDoc');
        Test.stopTest();

        // Verify logs or application status updates in case of missing/rejected documents
        Application__c updatedApplication = [SELECT Application_External_Status__c, Application_Internal_Status__c FROM Application__c WHERE Id = :applicationId];
        System.assertEquals('Submitted', updatedApplication.Application_External_Status__c);
        System.assertEquals('Offer Acceptance Document Submitted', updatedApplication.Application_Internal_Status__c);
        
     }
     @IsTest
    static void testMissingOrRejectedDocumentCountforAll() {
        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

       Test.startTest();
        APFS_ContactDocumentsController.MissingOrRejectedDocumentCount(applicationId, 'All');
        Test.stopTest();

        // Verify logs or application status updates in case of missing/rejected documents
        Application__c updatedApplication = [SELECT Application_External_Status__c, Application_Internal_Status__c FROM Application__c WHERE Id = :applicationId];
        System.assertEquals('Submitted', updatedApplication.Application_External_Status__c);
        
     }
    
     @isTest
    static void testGetInstituteManagement_Success() {
        // Fetch the test institute by name
        Test.startTest();
        List<Institute__c> result = APFS_ContactDocumentsController.getInstituteManagement('Test Institute');
        Test.stopTest();

        // Assert that the record is fetched successfully
        System.assertEquals(1, result.size(), 'One institute should be returned');
        System.assertEquals('Category A', result[0].Institute_Category__c, 'Institute category should match');
        System.assertEquals('Management A', result[0].Institute_Management__c, 'Institute management should match');
    }

    @isTest
    static void testGetInstituteManagement_EmptyName() {
        // Test when instituteName is blank
        try {
            Test.startTest();
            APFS_ContactDocumentsController.getInstituteManagement('');
            Test.stopTest();
            System.assert(false, 'Exception should have been thrown for blank instituteName');
        } catch (APFS_CustomException e) {
            System.assertEquals('Failed to fetch Institute Management: instituteName cannot be null or empty.', e.getMessage(), 'Correct exception message should be thrown for empty instituteName');
        }
    }

    @isTest
    static void testGetInstituteManagement_RecordNotFound() {
        // Test when no record is found for the given institute name
        Test.startTest();
        List<Institute__c> result = APFS_ContactDocumentsController.getInstituteManagement('NonExistent Institute');
        Test.stopTest();

        // Assert that no records are returned
        System.assertEquals(0, result.size(), 'No institutes should be returned for a non-existent name');
    }

    @isTest
    static void testGetInstituteManagement_Exception() {
        // Test for other exceptions (simulating an error with a dynamic SOQL query)
        try {
            Test.startTest();
            APFS_ContactDocumentsController.getInstituteManagement(null);
            Test.stopTest();
            System.assert(false, 'An exception should have been thrown for a null institute name');
        } catch (APFS_CustomException e) {
            System.assert(e.getMessage().contains('Failed to fetch Institute Management'), 'Correct exception message should be thrown');
        }
    }
     @IsTest
    static void testGetDynamicPicklistValues_ValidFields() {
        String sObjectTypeName = 'Account';
        List<String> fieldApiNames = new List<String>{ 'Industry' }; 

        // Call the method
        Map<String, List<String>> result = APFS_ContactDocumentsController.getDynamicPicklistValues(sObjectTypeName, fieldApiNames);

        // Assert that the result is not empty
        System.assert(result.containsKey('Industry'), 'Expected Industry picklist field in the result map');
        System.assertNotEquals(0, result.get('Industry').size(), 'Expected picklist values for Industry field');
    }
        // Test for getSchoolManagementType with valid schoolName
    @IsTest
    static void testGetSchoolManagementType_Valid() {
        // Call the method with valid school name
        List<School__c> result = APFS_ContactDocumentsController.getSchoolManagementType('Test School');
        
        // Assert that the result is not empty
        System.assertNotEquals(0, result.size(), 'Expected records to be returned');
        System.assertEquals('Government', result[0].School_Management_Type__c, 'School Management Type should be Government');
    }

    // Test for getSchoolManagementType with null or empty schoolName
    @IsTest
    static void testGetSchoolManagementType_Invalid() {
        try {
            APFS_ContactDocumentsController.getSchoolManagementType('');
            System.assert(false, 'Expected APFS_CustomException for empty school name');
        } catch (APFS_CustomException e) {
            System.assertEquals('Failed to fetch schools: schoolName cannot be null or empty.', e.getMessage());
        }
    }
       @IsTest
    static void testGetFilteredDocumentsForOffer() {
        // Fetch the test Application and Contact created in @TestSetup
        Application__c testApplication = [SELECT Id, Contact__c FROM Application__c LIMIT 1];
        Contact testContact = [SELECT Id FROM Contact WHERE Id = :testApplication.Contact__c LIMIT 1];

        Test.startTest();
        // Call the method and pass the Application Id
        APFS_ContactDocumentsController.ContentVersionWrapperForOffer resultWrapper = APFS_ContactDocumentsController.getFilteredDocumentsForOffer(testApplication.Id);
        Test.stopTest();

        // Validate that the resultWrapper is not null
        System.assertNotEquals(null, resultWrapper, 'The result wrapper should not be null');

        // Loop through the documents and check their attributes
        for (ContentVersion doc : resultWrapper.documents) {
            System.assertNotEquals(null, doc.Title, 'Document title should not be null');
            System.assertNotEquals(null, doc.Applicant_Document_Type__c, 'Document type should not be null');

            // Check if the document is filtered as expected
            if (doc.Applicant_Document_Type__c == 'Signed Scholarship Agreement') {
                System.assertEquals(testApplication.Id, doc.Application__c, 'Document should belong to the offer');
            } else {
                System.assertEquals(testContact.Id, doc.Contact__c, 'Document should belong to the contact');
            }
        }
    }
    
        @IsTest
  static void testDeleteFilesByContentDocumentIds_Success() {
        ContentDocument contentDocument = [SELECT Id FROM ContentDocument LIMIT 1];

        Test.startTest();
        APFS_ContactDocumentsController.deleteFilesByContentDocumentIds(new List<Id>{contentDocument.Id});
        Test.stopTest();
        List<ContentDocument> docs = [SELECT Id FROM ContentDocument WHERE Id = :contentDocument.Id];
        System.assertEquals(0, docs.size(), 'The ContentDocument should have been deleted');
    }
    private class MockHttpResponseGenerator implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success", "message": "SMS sent successfully."}');
            res.setStatusCode(200);
            return res;
        }
    }
    
    private static User createTestUser(Id contactId) {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
        User newUser = new User(
            FirstName = 'deep13',
            LastName = 'man13',
            ContactId = contactId,
            Email = 'Co131mandeep396@example.com',
            Username = 'Co131mand39609@example.com',
            Alias = 'Co131',
            ProfileId = p.Id,
            IsActive = true,
            MobilePhone = '7975946417',
            CommunityNickname = 'testu1ser',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York'
        );
        insert newUser;
        
        System.debug('Inserted user ProfileId: ' + newUser.ProfileId);
        System.debug('Inserted user type: ' + newUser.UserType);
        System.debug('Inserted user IsPortalEnabled: ' + newUser.IsPortalEnabled);
        
        User u = [SELECT Id,ContactId, UserType, IsPortalEnabled, UserRoleId, IsActive, ProfileId FROM User WHERE Id = :newUser.Id];
        NetworkMember membership = [SELECT NetworkID, MemberID FROM NetworkMember WHERE MemberID = :newUser.Id];
        
        System.debug('User data: ' + u);
        System.debug('User membership data: ' + membership);
        
        return newUser;
    }
    
    @isTest
    static void testFetchProfileDocumentsByType() {
         User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' AND UserRoleId != NULL LIMIT 1];

        System.runAs(adminUser) {
            Account acc = new Account(Name = 'testPortal');
            insert acc;
            
            Contact con = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                Email = 'testcontact@example.com',
                MobilePhone = '9053456784',
                AccountId = acc.Id
            );
            insert con;

          //  User testUser = createTestUser(con.Id);

            System.runAs(adminUser) {
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
                    Contact__c = con.Id,
                    Scholarship_Round__c = scholarRound.Id,
                    Application_External_Status__c = 'Draft',
                    Submission_Date__c = DateTime.now()
                );
                insert testApplication;
                            // Create test ContentVersion records
            ContentVersion contentVersion = new ContentVersion(
                Title = 'TestDocument.pdf',
                PathOnClient = 'TestDocument.pdf',
                Contact__c = con.Id,
                Applicant_Document_Type__c = 'Self Photo',
                VersionData = Blob.valueOf('Test file content') // VersionData is required

            );
            insert contentVersion;

                List<APFS_ContactDocumentsController.DocumentWrapper> documentWrappers = APFS_ContactDocumentsController.fetchprofileDocumentsByType('Self Photo', testApplication.Id);
            }
        }
  
    }
        
        }