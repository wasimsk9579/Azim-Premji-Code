@isTest
private class APFS_FilesAndAttachmentUtilityTest {
    
    @isTest
    static void testUploadFileToServer() {
        User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' AND UserRoleId != NULL LIMIT 1];
        
        System.runAs(adminUser) {
            Account acc = new Account(Name = 'testPortal');
            insert acc;

            acc.IsPartner = true;
            update acc;

            Contact con = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                Email = 'testcontact@example.com',
                MobilePhone = '9053456784',
                AccountId = acc.Id
            );
            insert con;

            User testUser = createTestUser(con.Id);
            
            System.runAs(testUser) {
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
                
                // Prepare the files for upload
                List<String> base64Data = new List<String>{
                    EncodingUtil.base64Encode(Blob.valueOf('Test file content 1')),
                    EncodingUtil.base64Encode(Blob.valueOf('Test file content 2'))
                };
                List<String> fileNames = new List<String>{ 'TestFile.pdf', 'TestFile2.pdf' };
                List<String> documentTypes = new List<String>{ 'Aadhaar Card', 'Aadhaar Card' };
                
                Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());  

                // Call the method
                Test.startTest();
                APFS_FilesAndAttachmentUtilityController.uploadFileToServer(base64Data, fileNames, documentTypes, testApplication.Id);
                Test.stopTest();

                List<ContentVersion> contentVersions = [
                    SELECT Id, Title, PathOnClient, Applicant_Document_Type__c, Application__c, Contact__c
                    FROM ContentVersion
                    WHERE Title IN :fileNames
                ];
                System.assertEquals(2, contentVersions.size(), 'Two ContentVersion records should be created.');
            }
        }
    }

    @isTest
    static void TestFilesUploadToServer() {
        User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' AND UserRoleId != NULL LIMIT 1];

        System.runAs(adminUser) {
            Account acc = new Account(Name = 'testPortal');
            insert acc;

            acc.IsPartner = true;
            update acc;

            Contact con = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                Email = 'testcontact@example.com',
                MobilePhone = '9053456784',
                AccountId = acc.Id
            );
            insert con;

            User testUser = createTestUser(con.Id);

            System.runAs(testUser) {
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

                List<String> base64Data = new List<String> {
                    EncodingUtil.base64Encode(Blob.valueOf('Test file content 1'))
                };
                List<String> fileNames = new List<String> { 'TestFile.pdf' };
                List<String> documentTypes = new List<String> { 'Self Photo' };
                Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());  

                Test.startTest();
                APFS_FilesAndAttachmentUtilityController.FilesuploadtoServer(base64Data, fileNames, documentTypes, testApplication.Id);
                Test.stopTest();

                List<ContentVersion> contentVersions = [
                    SELECT Id, Title, PathOnClient, Applicant_Document_Type__c, Application__c, Contact__c
                    FROM ContentVersion
                    WHERE Title IN :fileNames
                ];
                System.assertEquals(1, contentVersions.size(), 'One ContentVersion record should be created.');

                List<ContentVersion> fetchedContentVersions = [
                    SELECT Id, Title, PathOnClient, Applicant_Document_Type__c, Application__c, Contact__c
                    FROM ContentVersion
                    WHERE Title IN :fileNames
                ];
                System.assertEquals(contentVersions.size(), fetchedContentVersions.size(), 'The number of fetched documents should match the inserted documents.');
            }
        }
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
            FirstName = 'Co13',
            LastName = 'Co13',
            ContactId = contactId,
            Email = 'Co13@example.com',
            Username = 'Co13@example.com',
            Alias = 'Co13',
            ProfileId = p.Id,
            IsActive = true,
            MobilePhone = '7975946497',
            CommunityNickname = 'testMalla',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York'
        );
        insert newUser;
        
        return newUser;
    }
}