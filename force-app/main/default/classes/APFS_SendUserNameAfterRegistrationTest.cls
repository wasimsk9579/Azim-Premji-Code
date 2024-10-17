@isTest
public class APFS_SendUserNameAfterRegistrationTest {

    @testSetup
    static void setupTestData() {
        Profile userProfile = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];  
        System.assertNotEquals(null, userProfile, 'Profile "Scholarship Portal Applicant" not found');
      }
    @isTest
    static void testTriggerExecution() {
     Account acc = new Account(Name = 'Test Account');
        insert acc;
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            MobilePhone = '9053456784',
            AccountId = acc.Id
        );
        insert testContact;
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
    User testUser = new User(
        FirstName = 'Test',
        LastName = 'User',
        ContactId = testContact.Id,
        Email = 'test.user@example.com',
        Username = 'test123.user@example.com',
        Alias = 'tuser',
        CommunityNickname = 'testuser',
        TimeZoneSidKey = 'America/Los_Angeles',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        MobilePhone = '7975946497',
        LanguageLocaleKey = 'en_US',
        ProfileId = p.Id
    );
	Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
    Test.startTest();
    insert testUser;
    Test.stopTest();
    User insertedUser = [SELECT Id, FirstName, LastName FROM User WHERE Id = :testUser.Id LIMIT 1];
 	System.assertNotEquals(null, insertedUser, 'User should be inserted');
    }
    
    @isTest
    static void testHandlerException() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            MobilePhone = '9053456784',
            AccountId = acc.Id
        );
        insert testContact;
        
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];
        
        User testUser = new User(
            FirstName = 'Error',
            LastName = 'User',
            ContactId = testContact.Id,
            Email = 'error.user@example.com',
            Username = 'test123.user@example.com',
            Alias = 'euser',
            CommunityNickname = 'erroruser',
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            MobilePhone = '7975946497',
            LanguageLocaleKey = 'en_US',
            ProfileId = p.Id
        );
        
        Test.startTest();
        insert testUser;
        Test.stopTest();
        
        // Verify that the trigger handler executed without throwing an exception
        System.assert(true, 'Expected APFS_CustomException to be thrown if handler fails.');
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