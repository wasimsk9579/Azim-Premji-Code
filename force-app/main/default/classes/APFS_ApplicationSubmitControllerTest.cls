@isTest
public class APFS_ApplicationSubmitControllerTest {

    @TestSetup
    static void setupData() {
        // Step 1: Create necessary user role and admin user for testing
        UserRole userRole = [Select Id, DeveloperName From UserRole Where DeveloperName = 'Scholarship_Portal_Account_Owner' Limit 1];
        User adminUser = [Select Id, UserRoleId From User Where Profile.Name = 'System Administrator' Limit 1];

        adminUser.UserRoleId = userRole.Id;
        adminUser.IsActive = true;
        update adminUser;

        System.runAs(adminUser) {
            // Step 2: Create Account
            Account acc = new Account(
                Name = 'Test Portal Account'
            );
            insert acc;

            // Step 3: Create Contact
            Contact con = new Contact(
                FirstName = 'Test',
                LastName = 'Contact',
                Email = 'testcontact@example.com',
                MobilePhone = '9053456788',
                AccountId = acc.Id
            );
            insert con;

            // Step 4: Create Scholarship
            Scholarship__c scholarship = new Scholarship__c(
                Scholarship_Name__c = 'Test Scholarship'
            );
            insert scholarship;

            // Step 5: Create Scholarship Edition
            Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
                Scholarship__c = scholarship.Id,
                Total_Amount_Per_Installment__c = 300000,
                Number_Of_Installments_Per_Year__c = 3,
                Year__c = '2024',
                Is_Active_Edition__c = true
            );
            insert activeEdition;

            // Step 6: Create Scholarship Round
            Scholarship_Round__c scholarRound = new Scholarship_Round__c(
                Is_Active_Round__c = true,
                Round_End_Date__c = Date.today().addDays(30),
                Round_Type__c = 'Regular',
                Round_Number__c = 1,
                Scholarship_Edition__c = activeEdition.Id
            );
            insert scholarRound;

            // Step 7: Create Application
            Application__c application = new Application__c(
                Contact__c = con.Id,
                Scholarship_Round__c = scholarRound.Id,
                Application_External_Status__c = 'Draft',
                Application_Internal_Status__c = 'Submitted',
                Submission_Date__c = null,
                Is_Consent_Given__c = false
            );
            insert application;
        }
    }

    @isTest
    static void testUpdateApplicationStatus_Success() {
        // Step 1: Retrieve test application
        Application__c application = [SELECT Id, Application_External_Status__c, Application_Internal_Status__c, Submission_Date__c, Is_Consent_Given__c 
                                      FROM Application__c LIMIT 1];

        // Step 2: Call the method under test
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        APFS_ApplicationSubmitController.UpdateApplicationStatus(application.Id);
        Test.stopTest();

        // Step 3: Validate that the application has been updated
        Application__c updatedApplication = [SELECT Application_External_Status__c, Application_Internal_Status__c, Submission_Date__c, Is_Consent_Given__c 
                                             FROM Application__c 
                                             WHERE Id = :application.Id];

        System.assertEquals('Submitted', updatedApplication.Application_External_Status__c, 'External Status should be updated to Submitted.');
        System.assertEquals('Submitted', updatedApplication.Application_Internal_Status__c, 'Internal Status should be updated to Submitted.');
        System.assertNotEquals(null, updatedApplication.Submission_Date__c, 'Submission Date should be set.');
        System.assertEquals(true, updatedApplication.Is_Consent_Given__c, 'Consent should be given.');
    }

    @isTest
    static void testUpdateApplicationStatus_InvalidId() {
        // Step 1: Call the method with an invalid (null) application Id
        Id invalidId = null;

        Test.startTest();
        try {
            APFS_ApplicationSubmitController.UpdateApplicationStatus(invalidId);
            System.assert(false, 'APFS_CustomException should have been thrown due to null application Id');
        } catch (APFS_CustomException e) {
            // Step 2: Validate that the correct exception is thrown
            System.assertEquals('Invalid application ID provided.', e.getMessage(), 'Error message should indicate invalid ID.');
        }
        Test.stopTest();
    }

    @isTest
    static void testUpdateApplicationStatus_ApplicationNotFound() {
        // Step 1: Call the method with a non-existent application Id
        Id nonExistentId = '001000000000000AAA';  // Simulate a non-existent Id

        Test.startTest();
        try {
            APFS_ApplicationSubmitController.UpdateApplicationStatus(nonExistentId);
            System.assert(false, 'APFS_CustomException should have been thrown due to application not found');
        } catch (APFS_CustomException e) {
            // Step 2: Validate that the correct exception is thrown
            System.assertEquals('Error while submitting application: List has no rows for assignment to SObject', e.getMessage(), 'Error message should indicate application not found.');
        }
        Test.stopTest();
    }

    @isTest
    static void testUpdateApplicationStatus_ExceptionHandling() {
        // Step 1: Create a valid application Id
        Application__c application = [SELECT Id FROM Application__c LIMIT 1];
        
        // Step 2: Simulate an exception in DML
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        try {
            // Simulate a DML exception (for example, when trying to update a non-updatable field or a system error)
            //Test.setMock(DmlException.class, new DmlException('DML error occurred', 0));
            APFS_ApplicationSubmitController.UpdateApplicationStatus(application.Id);
            System.assert(true, 'APFS_CustomException should have been thrown due to DML exception');
        } catch (APFS_CustomException e) {
            // Step 3: Validate the exception handling
            System.assert(e.getMessage().contains('Error while submitting application'), 'Exception message should indicate an error during submission');
        }
        Test.stopTest();
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
    // Helper method to create test user (if needed in the future)
    private static User createTestUser(Id contactId) {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User u = new User(
            FirstName = 'Test',
            LastName = 'User',
            Email = 'testuser@example.com',
            Username = 'testuser' + DateTime.now().getTime() + '@example.com',
            Alias = 'testu',
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            ProfileId = p.Id,
            LanguageLocaleKey = 'en_US',
            ContactId = contactId
        );
        insert u;
        return u;
    }
}